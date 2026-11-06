// Plans a partial or full render of Long for GitHub Actions (also usable locally).
//   node tools/plan-chunks.mjs --range lines:001-025 --chunk 150 [--github-output] [--write-timeline out/timeline_range.json]
//   --range lines:A-B   replicas A..B inclusive (numeric id prefixes of src/story/timeline.json)
//   --range frames:A-B  frames A..B inclusive
// Prints the plan; with --github-output also writes matrix/count/start/end/label to $GITHUB_OUTPUT.
// --write-timeline writes a timeline shifted to the range start (for tools/mix-audio.mjs).
import fs from 'node:fs';
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const range = arg('--range', 'lines:001-025');
const chunk = Number(arg('--chunk', '150'));
const TL = JSON.parse(fs.readFileSync(arg('--timeline', 'src/story/timeline.json'), 'utf8'));
const LEAD = 6; // a shot starts 6 frames before its first line
const die = (m) => {
	console.error('ERROR: ' + m);
	process.exit(1);
};
if (!Number.isInteger(chunk) || chunk < 30 || chunk > 600) die('chunk must be an integer 30..600 (got ' + arg('--chunk') + ')');
const m = /^(lines|frames):(\d+)-(\d+)$/.exec(range);
if (!m) die(`range must look like "lines:001-025" or "frames:0-3212" (got "${range}")`);
const [, kind, a, b] = m;
let start;
let end;
if (kind === 'frames') {
	start = Number(a);
	end = Number(b);
} else {
	const num = (l) => parseInt(l.id, 10);
	const sel = TL.lines.filter((l) => num(l) >= Number(a) && num(l) <= Number(b));
	if (!sel.length) die(`no replicas with numbers ${a}..${b} in the timeline`);
	start = sel[0] === TL.lines[0] ? 0 : Math.max(0, sel[0].from - LEAD);
	const last = sel[sel.length - 1];
	end = last === TL.lines[TL.lines.length - 1] ? TL.total - 1 : last.from + last.dur + 4;
}
if (!(start >= 0 && end >= start && end < TL.total)) die(`frames ${start}-${end} are outside the video (0-${TL.total - 1})`);
const include = [];
for (let s = start, i = 0; s <= end; s += chunk, i++) include.push({i, name: 'c' + String(i).padStart(3, '0'), from: s, to: Math.min(end, s + chunk - 1)});
if (include.length > 250) die(`${include.length} chunks: more than 250 matrix jobs; raise the chunk size`);
const label = `${arg('--prefix', 'Long')}-${kind}-${a}-${b}`;
console.log(`range ${range}: frames ${start}-${end} (${((end - start + 1) / 30).toFixed(1)} s), ${include.length} chunks of ${chunk}`);
if (process.argv.includes('--github-output') && process.env.GITHUB_OUTPUT) {
	fs.appendFileSync(process.env.GITHUB_OUTPUT, `matrix=${JSON.stringify({include})}\ncount=${include.length}\nstart=${start}\nend=${end}\nlabel=${label}\n`);
}
const wt = arg('--write-timeline');
if (wt) {
	const lines = TL.lines.filter((l) => l.from >= start && l.from <= end).map((l) => ({...l, from: l.from - start}));
	fs.writeFileSync(wt, JSON.stringify({...TL, total: end - start + 1, lines, start}));
	console.log(`timeline for the range: ${lines.length} lines -> ${wt}`);
}
