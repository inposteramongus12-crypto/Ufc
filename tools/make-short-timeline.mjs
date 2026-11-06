// Builds src/story/short-timeline.json for the 9:16 recut from EXISTING long voice clips (no new voice-over).
//   node tools/make-short-timeline.mjs [pick=src/story/short-pick.json] [timeline=src/story/timeline.json] [out=src/story/short-timeline.json]
// Short line ids are numbered 001_N, 002_N, ... in the order of the pick list (own numbering, independent of the long).
import fs from 'node:fs';
const [pickFile = 'src/story/short-pick.json', tlFile = 'src/story/timeline.json', outFile = 'src/story/short-timeline.json'] = process.argv.slice(2);
const P = JSON.parse(fs.readFileSync(pickFile, 'utf8'));
const T = JSON.parse(fs.readFileSync(tlFile, 'utf8'));
let cur = P.lead ?? 10;
const lines = P.pick.map((p, i) => {
	const l = T.lines.find((x) => x.id.startsWith(p.long));
	if (!l) throw new Error('no long line ' + p.long);
	const out = {...l, id: `${String(i + 1).padStart(3, '0')}_${l.sp}`, longId: l.id, from: cur};
	cur += l.dur + (p.gap ?? 10);
	return out;
});
const total = lines[lines.length - 1].from + lines[lines.length - 1].dur + (P.tail ?? 24);
fs.writeFileSync(outFile, JSON.stringify({fps: T.fps, total, lines}));
console.log(`short timeline: ${lines.length} lines, ${total} frames = ${(total / T.fps).toFixed(1)} s`);
for (const l of lines) console.log(l.id, '<-', l.longId, `${(l.from / T.fps).toFixed(1)}s +${(l.dur / T.fps).toFixed(1)}s`, l.text.slice(0, 60));
