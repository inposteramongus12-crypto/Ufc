// script_en.md -> src/story/lines.en.json: [{id, sp, t}] — same ids and speakers as lines.json (checked), English text.
//   node tools/build-lines-en.mjs [script_en.md]
// Every voiced line in script_en.md is preceded by an HTML comment with its id: <!-- 001_N -->.
import fs from 'node:fs';
const src = fs.readFileSync(process.argv[2] ?? 'script_en.md', 'utf8').split('\n');
const ru = JSON.parse(fs.readFileSync('src/story/lines.json', 'utf8'));
const out = [];
let id = null;
for (const ln of src) {
	const c = ln.match(/^<!-- (\d{3}_[A-Z]+) -->$/);
	if (c) { id = c[1]; continue; }
	const m = ln.match(/^\*\*(N|HERO|TEMA|GRANDPA):\*\* (.+)$/);
	if (m) {
		if (!id) throw new Error('line without id: ' + ln);
		out.push({id, sp: m[1], t: m[2].trim()});
		id = null;
	}
}
if (out.length !== ru.length) throw new Error(`count ${out.length} != ${ru.length}`);
let longer = 0;
out.forEach((o, i) => {
	if (o.id !== ru[i].id || o.sp !== ru[i].sp) throw new Error(`id/speaker mismatch at ${o.id} vs ${ru[i].id}`);
	if ([...o.t].length > [...ru[i].t].length) { longer++; console.log('LONGER', o.id, [...o.t].length, '>', [...ru[i].t].length); }
});
fs.writeFileSync('src/story/lines.en.json', '[\n' + out.map((o) => ' ' + JSON.stringify(o)).join(',\n') + '\n]\n');
console.log(`lines.en.json: ${out.length} lines, ${out.reduce((a, o) => a + [...o.t].length, 0)} chars (Russian ${ru.reduce((a, o) => a + [...o.t].length, 0)}), longer than Russian: ${longer}`);
