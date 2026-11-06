// ufc: speakers N|HERO|IRMA|REX|SENYA; inline [notes] go to action, not to t.
// script.md -> src/story/lines.json: {id, part, sp, t, action}. Silent bubbles (*Облачко — ИМЯ:*) are not voiced and are not included.
//   node tools/build-lines.mjs [script.md]
import fs from 'node:fs';
const src = fs.readFileSync(process.argv[2] ?? 'script.md', 'utf8').split('\n');
const gaps = fs.existsSync('src/story/gaps.json') ? JSON.parse(fs.readFileSync('src/story/gaps.json', 'utf8')) : {}; // {"147_HERO": 1.5} seconds of air after a line
const out = [];
let part = 0, n = 0;
for (let i = 0; i < src.length; i++) {
	const pm = src[i].match(/^## (\d+)\./);
	if (pm) part = +pm[1];
	const m = src[i].match(/^\*\*(N|HERO|IRMA|REX|SENYA):\*\* (.+)$/);
	if (!m) continue;
	const act = [...m[2].matchAll(/\[([^\]]*)\]/g)].map((x) => x[1]); // inline [notes] after the text
	const text = m[2].replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
	for (let j = i + 1; j < src.length && src[j].startsWith('['); j++) act.push(src[j].replace(/^\[|\]$/g, ''));
	n++;
	const id = `${String(n).padStart(3, '0')}_${m[1]}`;
	out.push({id, part, sp: m[1], t: text, action: act.join(' '), ...(gaps[id] ? {gap: gaps[id]} : {})});
}
fs.writeFileSync('src/story/lines.json', '[\n' + out.map((o) => ' ' + JSON.stringify(o)).join(',\n') + '\n]\n');
console.log(`lines ${out.length}, chars ${out.reduce((a, l) => a + [...l.t].length, 0)}`);
