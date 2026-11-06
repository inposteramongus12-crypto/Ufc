// Проверка кусков перед склейкой и готового видео после неё. Падает (exit 1), если видео вышло бы неполным.
//   MATRIX='{"include":[{"name":"c001","from":0,"to":149},...]}' node tools/verify-chunks.mjs chunks [готовое.mp4]
// Куски: ровно по плану (имена, число, ни одного лишнего файла), в каждом столько кадров, сколько в диапазоне from..to, 30 fps, одного размера.
// Видео: сумма кадров = сумма по плану, длительность в пределах одного кадра.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ffbin} from './lib.mjs';

const dir = process.argv[2] ?? 'chunks';
const video = process.argv[3];
const plan = JSON.parse(process.env.MATRIX ?? '{"include":[]}').include;
const probe = (file) => {
	const r = spawnSync(ffbin('ffprobe'), ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames,r_frame_rate,width,height:format=duration', '-of', 'json', file], {encoding: 'utf8', maxBuffer: 1 << 24});
	if (r.status !== 0) return null;
	const j = JSON.parse(r.stdout);
	return {frames: Number(j.streams?.[0]?.nb_read_frames), fps: j.streams?.[0]?.r_frame_rate, size: `${j.streams?.[0]?.width}x${j.streams?.[0]?.height}`, dur: Number(j.format?.duration)};
};
const problems = [];
let expected = 0;
if (!plan.length) problems.push('MATRIX is empty: no plan to compare with');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.mp4')) : [];
const names = new Set(plan.map((p) => `${p.name}.mp4`));
for (const f of files) if (!names.has(f)) problems.push(`extra file ${f} is not in the plan`);
let prevTo = null;
let size = null;
for (const p of [...plan].sort((a, b) => a.from - b.from)) {
	const want = p.to - p.from + 1;
	expected += want;
	if (prevTo !== null && p.from !== prevTo + 1) problems.push(`gap or overlap in the plan before ${p.name}: ${prevTo} -> ${p.from}`);
	prevTo = p.to;
	const file = path.join(dir, `${p.name}.mp4`);
	if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
		problems.push(`${p.name} (${p.from}-${p.to}): file is missing or empty`);
		continue;
	}
	const m = probe(file);
	if (!m) problems.push(`${p.name}: ffprobe cannot read the file`);
	else {
		if (m.frames !== want) problems.push(`${p.name} (${p.from}-${p.to}): ${m.frames} frames, expected ${want}`);
		if (m.fps !== '30/1') problems.push(`${p.name}: fps ${m.fps}`);
		size ??= m.size;
		if (m.size !== size) problems.push(`${p.name}: size ${m.size}, others ${size}`);
	}
}
console.log(`chunks in the plan: ${plan.length}, files found: ${files.length}, frames expected: ${expected}`);
if (video) {
	const m = probe(video);
	if (!m) problems.push('the final video cannot be read');
	else {
		console.log(`final video: ${m.frames} frames, ${m.dur.toFixed(2)} s (expected ${expected} frames, ${(expected / 30).toFixed(2)} s)`);
		if (m.frames !== expected) problems.push(`final video has ${m.frames} frames, expected ${expected}`);
		if (Math.abs(m.dur - expected / 30) > 1 / 30 + 0.02) problems.push(`final video lasts ${m.dur.toFixed(2)} s, expected ${(expected / 30).toFixed(2)} s`);
	}
}
if (problems.length) {
	for (const p of problems) console.log('::error::' + p);
	process.exit(1);
}
console.log('OK: every planned chunk is present, has the right number of frames, the plan is contiguous');
