// Считает слова и знаки озвучки в script.md: только реплики с пометкой говорящего
// (**N:**, **HERO:**, **IRMA:**, **REX:**, **SENYA:**). Пометки [в скобках] и облачка не считаются.
// node tools/count-script.mjs [script.md]
import fs from 'node:fs';

const file = process.argv[2] ?? 'script.md';
const SPEAKERS = ['N', 'HERO', 'IRMA', 'REX', 'SENYA'];
const re = new RegExp(`^\\*\\*(${SPEAKERS.join('|')}):\\*\\*\\s*(.*)$`);

let part = '—';
const parts = new Map();
const total = {lines: 0, words: 0, chars: 0};
const long = [];
for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
	const h = raw.match(/^##\s+(.*)/);
	if (h) {
		part = h[1].trim();
		continue;
	}
	const m = raw.match(re);
	if (!m) continue;
	const text = m[2].replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
	const words = (text.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) ?? []).length;
	const limit = m[1] === 'N' ? 25 : 10;
	if (words > limit) long.push(`${part} | ${m[1]} ${words} сл. > ${limit}: ${text}`);
	const p = parts.get(part) ?? {lines: 0, words: 0, chars: 0};
	for (const o of [p, total]) {
		o.lines++;
		o.words += words;
		o.chars += text.length;
	}
	parts.set(part, p);
}
for (const [name, p] of parts) console.log(`${name.padEnd(40)} реплик ${String(p.lines).padStart(3)}  слов ${String(p.words).padStart(4)}  знаков ${String(p.chars).padStart(5)}`);
console.log(`ИТОГО реплик ${total.lines}, слов ${total.words}, знаков ${total.chars} (с пробелами)`);
console.log(long.length ? `Длинные реплики:\n${long.join('\n')}` : 'Длинных реплик нет (N ≤ 25, герои ≤ 10).');
