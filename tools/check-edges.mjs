// Edge check: renders stills and finds plates / bubbles / cards closer than 60 px to the frame edge.
//   node tools/check-edges.mjs --frames 100,200,300   |   --from 0 --to 4900 --step 25   [--comp Short]
// Plates are found by their dark-navy fill (#11142c), bubbles and cards by their cream fill; a cluster
// inside the 60 px band is reported with the frame, the side and the clipped amount.
import path from 'node:path';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {ROOT} from './lib.mjs';
const require = createRequire(path.join(ROOT, 'package.json'));
const {bundle} = require('@remotion/bundler');
const {selectComposition, renderStill} = require('@remotion/renderer');
const a = process.argv.slice(2);
const val = (k, d) => (a.includes(k) ? a[a.indexOf(k) + 1] : d);
let frames = val('--frames', '') ? val('--frames', '').split(',').map(Number) : [];
if (!frames.length) for (let f = Number(val('--from', 0)); f <= Number(val('--to', 4900)); f += Number(val('--step', 25))) frames.push(f);
const dir = path.join(ROOT, 'out', 'edge');
fs.rmSync(dir, {recursive: true, force: true});
fs.mkdirSync(dir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts')});
const COMP = val('--comp', 'Long');
const inputProps = COMP === 'Long' ? {sound: false, edge: true} : {sound: false}; // edge: whip frames without blur, plates stay detectable
const comp = await selectComposition({serveUrl, id: COMP, inputProps, chromiumOptions: {gl: 'angle'}});
for (const f of frames) await renderStill({composition: comp, serveUrl, output: path.join(dir, `f${String(f).padStart(6, '0')}.png`), frame: f, inputProps, chromiumOptions: {gl: 'angle'}, scale: 0.5});
const r = spawnSync('python3', ['-I', path.join(ROOT, 'tools', 'edge-scan.py'), dir], {encoding: 'utf8'});
process.stdout.write(r.stdout + r.stderr);
