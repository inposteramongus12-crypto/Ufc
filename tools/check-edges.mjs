// Edge check by measuring the real DOM (not colours): text and panels must be fully inside the frame and 60 px from every
// edge, text must not be covered by an actor or another shape, partly cut actors are listed.
//   node tools/check-edges.mjs --frames 100,200,300   |   --from 0 --to 4900 --step 25   [--out report.json]
// Long is rendered with edge: true (no light, vignette, grain or whip blur) and src/kit/edgeprobe.tsx writes `EDGEPROBE {...}`
// to the browser log. Output: one line per finding (frame, kind, what, box, side/by) and a summary by kind.
import path from 'node:path';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {ROOT} from './lib.mjs';
const require = createRequire(path.join(ROOT, 'package.json'));
const {bundle} = require('@remotion/bundler');
const {selectComposition, renderStill} = require('@remotion/renderer');
const a = process.argv.slice(2);
const val = (k, d) => (a.includes(k) ? a[a.indexOf(k) + 1] : d);
let frames = val('--frames', '') ? val('--frames', '').split(',').map(Number) : [];
if (!frames.length) for (let f = Number(val('--from', 0)); f <= Number(val('--to', 4900)); f += Number(val('--step', 25))) frames.push(f);
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts')});
const inputProps = {sound: false, edge: true};
const comp = await selectComposition({serveUrl, id: 'Long', inputProps, chromiumOptions: {gl: 'angle'}});
const tmp = path.join(ROOT, 'out', '.edge-probe.png');
fs.mkdirSync(path.dirname(tmp), {recursive: true});
const whips = (() => {
	try {
		return JSON.parse(fs.readFileSync(path.join(ROOT, 'src/story/auto-cues.json'), 'utf8')).whips ?? [];
	} catch {
		return [];
	}
})();
const inWhip = (f) => whips.some((b) => f >= b - 6 && f < b + 6); // the 12 frames of a whip-pan: everything moves by design
const found = [];
let probed = 0;
for (const f of frames) {
	let got = null;
	await renderStill({composition: comp, serveUrl, output: tmp, frame: f, inputProps, chromiumOptions: {gl: 'angle'}, scale: 0.1, onBrowserLog: (l) => {
		if (l.text.startsWith('EDGEPROBE ')) got = JSON.parse(l.text.slice(10));
	}});
	if (!got) {
		console.log(`f${f}: NO PROBE RESULT`);
		continue;
	}
	probed++;
	if (got.error) console.log(`f${f}: probe error ${got.error}`);
	for (const i of got.issues ?? []) found.push({frame: f, ...i, kind: inWhip(f) && i.kind !== 'actor-cut' ? 'whip-' + i.kind : i.kind});
}
for (const i of found) console.log(`f${String(i.frame).padStart(6, '0')} (${(i.frame / 30).toFixed(2)} s) ${i.kind.padEnd(9)} ${i.what} [${i.box.join(',')}]${i.side ? ' ' + i.side : ''}${i.by ? ' by ' + i.by : ''}`);
const by = {};
for (const i of found) by[i.kind] = (by[i.kind] ?? 0) + 1;
console.log(`edge issues: ${found.filter((i) => i.kind !== 'actor-cut' && !i.kind.startsWith('whip-')).length} (frames probed ${probed}; ${Object.entries(by).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'})`);
const out = val('--out', '');
if (out) fs.writeFileSync(out, JSON.stringify(found));
