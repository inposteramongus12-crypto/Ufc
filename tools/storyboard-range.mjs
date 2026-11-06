// Раскадровка куска ролика файлами: кадр каждые N секунд, по `per` кадров на лист.
//   node tools/storyboard-range.mjs --from 0 --to 122 --every 2.5 --per 8 [--out out/sb] [--comp Long]
// Листы: out/sb/sb_01.jpg, sb_02.jpg ... (подпись у кадра: номер кадра и секунды).
import path from 'node:path';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {ROOT, say} from './lib.mjs';

const require = createRequire(path.join(ROOT, 'package.json'));
const {bundle} = require('@remotion/bundler');
const {selectComposition, renderStill} = require('@remotion/renderer');
const a = process.argv.slice(2);
const val = (k, d) => (a.includes(k) ? a[a.indexOf(k) + 1] : d);
const from = Number(val('--from', 0));
const to = Number(val('--to', 60));
const every = Number(val('--every', 2.5));
const per = Number(val('--per', 8));
const comp = val('--comp', 'Long');
const outDir = path.join(ROOT, val('--out', 'out/sb'));
fs.rmSync(outDir, {recursive: true, force: true});
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts')});
const target = await selectComposition({serveUrl, id: comp, chromiumOptions: {gl: 'angle'}});
const frames = [];
for (let t = from + every / 2; t < to; t += every) frames.push(Math.round(t * 30));
const ok = frames.filter((f) => f < target.durationInFrames);
const cols = per <= 8 ? 4 : 5;
for (let i = 0, n = 1; i < ok.length; i += per, n++) {
	const part = ok.slice(i, i + per);
	const props = {comp, frames: part, cols, title: `${comp} · ${(part[0] / 30).toFixed(1)}–${(part.at(-1) / 30).toFixed(1)} с · каждые ${every} с`};
	const sheet = await selectComposition({serveUrl, id: 'Sheet', inputProps: props, chromiumOptions: {gl: 'angle'}});
	const output = path.join(outDir, `sb_${String(n).padStart(2, '0')}.jpg`);
	await renderStill({composition: sheet, serveUrl, output, inputProps: props, imageFormat: 'jpeg', jpegQuality: 82, chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 240000});
	say(`${path.relative(ROOT, output)}: ${part.length} кадров`);
}
