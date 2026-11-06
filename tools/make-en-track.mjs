// English audio track for the long video (to add as an alternative audio track on YouTube):
// trims silence of each clip in public/vo_en, fits it into the slot of the Russian line (speeds up at most x1.25),
// places it at the same time as the Russian line, mixes with the sound bed (effects) and normalises to -16 LUFS.
//   node tools/make-en-track.mjs        -> out/en/audio_en_full.mp3 (voice + effects), out/en/audio_en_voice_only.mp3
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT, ffbin, readJson} from './lib.mjs';

const FF = ffbin();
const FP = ffbin('ffprobe');
const run = (bin, args) => spawnSync(bin, args, {encoding: 'utf8', maxBuffer: 1 << 28});
const dur = (f) => Number(JSON.parse(run(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', f]).stdout).format.duration);
const TL = readJson('src/story/timeline.json');
const EN = readJson('src/story/lines.en.json');
const FPS = TL.fps;
const fitDir = path.join(ROOT, 'public', 'vo_en', 'fit');
fs.rmSync(fitDir, {recursive: true, force: true});
fs.mkdirSync(fitDir, {recursive: true});
const out = path.join(ROOT, 'out', 'en');
fs.mkdirSync(out, {recursive: true});
// the bundled ffmpeg has no silenceremove: find speech from the decoded samples; silence at the edges is cut,
// and a pause longer than 0.7 s inside a clip (a glitch of the voice model) is shortened to 0.4 s
const pieces = (f) => {
	const r = spawnSync(FF, ['-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'wav', '-'], {maxBuffer: 1 << 28});
	const full = r.stdout;
	const b = full.subarray(full.indexOf('data') + 8);
	const n = Math.floor(b.length / 2);
	const win = 800; // 50 ms
	const loud = [];
	for (let i = 0; i < n; i += win) {
		let m = 0;
		for (let k = i; k < Math.min(n, i + win); k++) m = Math.max(m, Math.abs(b.readInt16LE(k * 2)));
		loud.push(m > 700);
	}
	const segs = [];
	let cur = null;
	loud.forEach((v, i) => {
		if (v && cur === null) cur = i;
		if (!v && cur !== null) { segs.push([cur, i]); cur = null; }
	});
	if (cur !== null) segs.push([cur, loud.length]);
	const sec = (i) => (i * win) / 16000;
	const merged = [];
	for (const s of segs) {
		const last = merged[merged.length - 1];
		if (last && sec(s[0]) - sec(last[1]) < 0.7) last[1] = s[1];
		else merged.push([...s]);
	}
	return merged.map(([a, z]) => [Math.max(0, sec(a) - 0.2), sec(z) + 0.2]);
};
const cutClip = (src, dst, tmp) => {
	const ps = pieces(src);
	const list = [];
	ps.forEach(([t0, t1], i) => {
		const p = path.join(tmp, `p${i}.wav`);
		run(FF, ['-y', '-v', 'error', '-ss', t0.toFixed(3), '-t', (t1 - t0).toFixed(3), '-i', src, '-ar', '48000', '-ac', '1', p]);
		list.push(`file '${p}'`);
	});
	const lst = path.join(tmp, 'list.txt');
	fs.writeFileSync(lst, list.join('\n'));
	run(FF, ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', dst]);
	for (const f of fs.readdirSync(tmp)) fs.rmSync(path.join(tmp, f));
};
const tmpDir = path.join(fitDir, '.tmp');
fs.mkdirSync(tmpDir, {recursive: true});
const lines = [];
const report = [];
TL.lines.forEach((l, i) => {
	const src = path.join(ROOT, 'public', 'vo_en', l.id + '.mp3');
	const raw = path.join(fitDir, l.id + '.raw.wav');
	cutClip(src, raw, tmpDir);
	const d0 = dur(raw);
	const next = TL.lines[i + 1] ? TL.lines[i + 1].from : TL.total;
	const slot = (next - l.from - 3) / FPS; // seconds until the next line starts
	let tempo = 1;
	if (d0 > slot) tempo = Math.min(1.25, d0 / slot);
	const fit = path.join(fitDir, l.id + '.wav');
	if (tempo > 1.005) run(FF, ['-y', '-v', 'error', '-i', raw, '-af', `atempo=${tempo.toFixed(3)}`, '-ar', '48000', '-ac', '1', fit]);
	else fs.copyFileSync(raw, fit);
	fs.rmSync(raw);
	const d = dur(fit);
	const en = EN.find((x) => x.id === l.id);
	lines.push({id: l.id, sp: l.sp, text: en.t, file: `vo_en/fit/${l.id}.wav`, trimStart: 0, from: l.from, dur: Math.ceil(d * FPS)});
	report.push({id: l.id.slice(0, 3), ru: +(l.dur / FPS).toFixed(1), en: +d0.toFixed(1), tempo: +tempo.toFixed(2), over: +(d - slot).toFixed(2)});
});
fs.writeFileSync(path.join(out, 'timeline_en.json'), JSON.stringify({fps: FPS, total: TL.total, lines}));
const sped = report.filter((r) => r.tempo > 1.005);
const over = report.filter((r) => r.over > 0.05);
console.log(`clips ${report.length}; sped up ${sped.length} (max x${Math.max(...report.map((r) => r.tempo))}); still overlapping the next line: ${over.length}`);
if (over.length) console.log('overlap:', over.map((r) => `${r.id}(+${r.over}s)`).join(' '));
if (sped.length) console.log('sped up:', sped.map((r) => `${r.id}×${r.tempo}`).join(' '));

const mix = (bedVol, file) => run(process.execPath, ['tools/mix-audio.mjs', path.join('out', 'en', 'timeline_en.json'), 'public/sfx/bed.wav', String(bedVol), file]);
const norm = (wav, mp3) => {
	const a = run(FF, ['-hide_banner', '-i', wav, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']).stderr;
	const j = JSON.parse(a.slice(a.lastIndexOf('{'), a.lastIndexOf('}') + 1));
	const af = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
	const r = run(FF, ['-y', '-v', 'error', '-i', wav, '-af', af, '-ar', '48000', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '192k', mp3]);
	console.log(path.basename(mp3), 'input', j.input_i, 'LUFS ->', r.status === 0 ? 'ok' : r.stderr);
};
for (const [vol, name] of [[1, 'audio_en_full'], [0, 'audio_en_voice_only']]) {
	const wav = path.join(out, name + '.wav');
	mix(vol, wav);
	norm(wav, path.join(out, name + '.mp3'));
	fs.rmSync(wav);
}
for (const f of ['audio_en_full.mp3', 'audio_en_voice_only.mp3']) {
	const p = path.join(out, f);
	console.log(f, `${(dur(p) / 60).toFixed(2)} min`, `${(fs.statSync(p).size / 1e6).toFixed(1)} MB`);
}
