// ENGLISH track: voices src/story/lines.en.json with ElevenLabs (flash v2.5, 0.5 credit/char) -> public/vo_en/<id>.mp3.
//   node tools/eleven-voice-en.mjs --plan          count credits still to spend, show credits on the keys, no voicing
//   node tools/eleven-voice-en.mjs [--only 077,078] voice (skips lines already voiced with the same text)
//   node tools/eleven-voice-en.mjs ... --keys 4     use only these key numbers (1 = ELEVENLABS_API_KEY, 2 = _2, 3 = _3, 4 = _4)
//   node tools/eleven-voice-en.mjs ... --skip 1,2   never use these key numbers
//   node tools/eleven-voice-en.mjs ... --key1-only  only the first key
//   node tools/eleven-voice-en.mjs ... --force      re-voice even if already done
// Voices come from src/story/voices.json: {"N": {"name": "George", "eleven": "<voice_id>"}, ...}.
// Keys only from the environment (ELEVENLABS_API_KEY, _2, _3, _4); they are never printed or stored.
// Before every line the remaining credits of key 1 are checked; if they do not cover the line, key 2 is used.
// The subscription counter on ElevenLabs lags behind, so the remaining credits are also tracked locally
// (credits at start minus characters sent) and the smaller of the two numbers is trusted.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
if (!process.env.NODE_USE_ENV_PROXY && process.env.HTTPS_PROXY) {
	const r = spawnSync(process.execPath, process.argv.slice(1), {stdio: 'inherit', env: {...process.env, NODE_USE_ENV_PROXY: '1'}});
	process.exit(r.status ?? 1);
}
const MODEL = 'eleven_flash_v2_5'; // English track: half a credit per character (the budget does not cover 11.6k chars at 1:1)
const FACTOR = 0.5;
const args = process.argv.slice(2);
const plan = args.includes('--plan');
const force = args.includes('--force');
const key1Only = args.includes('--key1-only');
const pickKeys = args.includes('--keys') ? args[args.indexOf('--keys') + 1].split(',').map(Number) : null;
const skipKeys = args.includes('--skip') ? args[args.indexOf('--skip') + 1].split(',').map(Number) : [];
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : [];
const root = process.cwd();
const lines = JSON.parse(fs.readFileSync(path.join(root, 'src/story/lines.en.json'), 'utf8'));
const voices = JSON.parse(fs.readFileSync(path.join(root, 'src/story/voices.json'), 'utf8'));
const outDir = path.join(root, 'public/vo_en');
fs.mkdirSync(outDir, {recursive: true});
const madeFile = path.join(outDir, '.made-eleven.json');
const made = fs.existsSync(madeFile) ? JSON.parse(fs.readFileSync(madeFile, 'utf8')) : {};

const KEYS = [process.env.ELEVENLABS_API_KEY, process.env.ELEVENLABS_API_KEY_2, process.env.ELEVENLABS_API_KEY_3, process.env.ELEVENLABS_API_KEY_4]
	.map((k, i) => (k ? {n: i + 1, k, sent: 0, start: null} : null))
	.filter((k) => k && (!key1Only || k.n === 1) && (!pickKeys || pickKeys.includes(k.n)) && !skipKeys.includes(k.n));
if (!KEYS.length) throw new Error('ELEVENLABS_API_KEY is not set');
// local ledger survives between runs (key number only, never the key): the API counter lags by minutes
const ledgerFile = path.join(outDir, '.eleven-ledger.json');
const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : {};
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const left = async (key) => {
	let r;
	for (let t = 0; t < 6; t++) {
		r = await fetch('https://api.elevenlabs.io/v1/user/subscription', {headers: {'xi-api-key': key.k}});
		if (r.status !== 429) break;
		await sleep(2000 * 2 ** t);
	}
	if (r.status === 429 && key.start !== null) return {used: key.used0 + key.sent, limit: key.limit, tier: key.tier, left: key.start - key.sent, local: true}; // rate-limited: trust the local count
	if (!r.ok) return {error: `key ${key.n}: subscription ${r.status} ${(await r.text()).slice(0, 160)}`};
	const j = await r.json();
	if (key.start === null) {
		const L = ledger[key.n];
		const est = L && L.base + L.sent > j.character_count ? L.base + L.sent : j.character_count;
		if (!L || j.character_count >= L.base + L.sent) ledger[key.n] = {base: j.character_count, sent: 0};
		key.start = j.character_limit - est;
		key.limit = j.character_limit;
		key.tier = j.tier;
		key.used0 = est;
	}
	const api = j.character_limit - j.character_count;
	return {api, used: Math.max(j.character_count, key.used0 + key.sent), limit: j.character_limit, tier: j.tier, left: Math.min(api, key.start - key.sent)};
};
const book = (key, chars) => {
	key.sent += chars;
	ledger[key.n].sent += chars;
	fs.writeFileSync(ledgerFile, JSON.stringify(ledger));
};

const todo = lines.filter((l) => !(only.length && !only.some((o) => l.id.startsWith(o))) && (force || made[l.id] !== l.t));
const need = Math.ceil(todo.reduce((a, l) => a + [...l.t].length, 0) * FACTOR);
const all = lines.reduce((a, l) => a + [...l.t].length, 0);
console.log(`lines: ${lines.length}, characters in all lines: ${all}`);
console.log(`to voice now: ${todo.length} lines, ${need} characters (not selected or already voiced: ${lines.length - todo.length} lines)`);
let have = 0;
for (const key of KEYS) {
	const s = await left(key);
	if (s.error) console.log(s.error);
	else {
		have += s.left;
		console.log(`key ${key.n}: ${s.tier}, used ${s.used} of ${s.limit}, left ${s.left}`);
	}
}
console.log(`credits available: ${have}, needed: ${need}, reserve: ${have - need}`);
if (plan) process.exit(0);
if (have < need) {
	console.log('NOT ENOUGH CREDITS for everything: nothing voiced. Shorten the text or voice part of it with --only.');
	process.exit(1);
}

const failed = [];
for (const l of todo) {
	const v = voices[l.sp]?.eleven;
	if (!v) {
		failed.push(`${l.id} (no voice for ${l.sp})`);
		continue;
	}
	const chars = Math.ceil([...l.t].length * FACTOR);
	let done = false;
	for (const key of KEYS) {
		const s = await left(key);
		if (s.error || s.left < chars) {
			console.log(`${l.id}: key ${key.n} skipped (${s.error ?? 'left ' + s.left + ' < ' + chars})`);
			continue; // not enough on this key: try the next one
		}
		let r;
		for (let t = 0; t < 5; t++) {
			r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v}?output_format=mp3_44100_128`, {
				method: 'POST',
				headers: {'xi-api-key': key.k, 'content-type': 'application/json'},
				body: JSON.stringify({text: l.t, model_id: MODEL}),
			});
			if (r.status !== 429) break;
			await sleep(3000 * 2 ** t);
		}
		if (!r.ok) {
			const msg = (await r.text()).slice(0, 200);
			console.log(`key ${key.n} refused ${l.id}: ${r.status} ${msg}`);
			if (/quota|credits|limit/i.test(msg)) continue; // out of credits after all: next key
			break;
		}
		const buf = Buffer.from(await r.arrayBuffer());
		if (buf.length < 2000) {
			console.log(`${l.id}: empty audio`);
			break;
		}
		fs.writeFileSync(path.join(outDir, l.id + '.mp3'), buf);
		book(key, chars);
		made[l.id] = l.t;
		fs.writeFileSync(madeFile, JSON.stringify(made, null, 1));
		console.log(`voiced ${l.id} ${l.sp} (${voices[l.sp].name}) ${chars} chars, key ${key.n}`);
		done = true;
		await sleep(1200); // stay under the request rate limit
		break;
	}
	if (!done) failed.push(l.id);
}
for (const key of KEYS) console.log(`key ${key.n}: characters sent this run ${key.sent}`);
if (failed.length) console.log('FAILED: ' + failed.join(', ') + ' — run the same command again: finished lines are kept.');
