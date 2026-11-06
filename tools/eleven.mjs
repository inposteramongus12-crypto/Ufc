// ElevenLabs helper (project tool). Key only from ELEVENLABS_API_KEY, never stored.
//   node tools/eleven.mjs check              test request: account + credits
//   node tools/eleven.mjs voices [--ru]      voices available to this key
// Node's fetch ignores HTTPS_PROXY by default; NODE_USE_ENV_PROXY=1 makes it use the session proxy.
if (!process.env.NODE_USE_ENV_PROXY && process.env.HTTPS_PROXY) {
	const {spawnSync} = await import('node:child_process');
	const r = spawnSync(process.execPath, process.argv.slice(1), {stdio: 'inherit', env: {...process.env, NODE_USE_ENV_PROXY: '1'}});
	process.exit(r.status ?? 1);
}
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
	console.error('ELEVENLABS_API_KEY is not set');
	process.exit(2);
}
export const api = async (path, init = {}) => {
	const r = await fetch('https://api.elevenlabs.io' + path, {...init, headers: {'xi-api-key': KEY, ...(init.headers ?? {})}});
	return r;
};
const cmd = process.argv[2];
if (cmd === 'check') {
	const r = await api('/v1/user/subscription');
	console.log('status', r.status);
	const t = await r.text();
	try {
		const j = JSON.parse(t);
		console.log(JSON.stringify({tier: j.tier, used: j.character_count, limit: j.character_limit, status: j.status}));
		if (!j.tier) console.log(t.slice(0, 300));
	} catch {
		console.log(t.slice(0, 300));
	}
}
if (cmd === 'voices') {
	const r = await api('/v2/voices?page_size=100&include_total_count=true');
	console.log('status', r.status);
	const j = await r.json();
	if (!j.voices) console.log(JSON.stringify(j).slice(0, 400));
	for (const v of j.voices ?? []) {
		const lang = [...new Set([v.labels?.language, ...(v.verified_languages ?? []).map((x) => x.language)].filter(Boolean))].join(',');
		console.log([v.voice_id, v.name, v.category, v.labels?.gender ?? '', v.labels?.age ?? '', v.labels?.use_case ?? '', 'lang=' + lang].join(' | '));
	}
}
if (cmd === 'models') {
	const r = await api('/v1/models');
	console.log('status', r.status);
	const j = await r.json();
	if (!Array.isArray(j)) console.log(JSON.stringify(j).slice(0, 400));
	for (const m of Array.isArray(j) ? j : []) {
		const ru = (m.languages ?? []).some((l) => l.language_id === 'ru');
		console.log([m.model_id, m.name, 'ru=' + ru, 'cost_x=' + m.model_rates?.character_cost_multiplier, 'maxchars=' + m.maximum_text_length_per_request, m.can_do_text_to_speech ? 'tts' : ''].join(' | '));
	}
}
// node tools/eleven.mjs tts --voice <id> --text "..." --out file.mp3 [--model eleven_multilingual_v2]
if (cmd === 'tts') {
	const a = process.argv.slice(3);
	const get = (k, d) => (a.includes(k) ? a[a.indexOf(k) + 1] : d);
	const voice = get('--voice');
	const text = get('--text');
	const out = get('--out', 'out/eleven-test.mp3');
	const model = get('--model', 'eleven_multilingual_v2');
	const used = async () => (await (await api('/v1/user/subscription')).json()).character_count;
	const before = await used();
	const r = await api(`/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
		method: 'POST',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({text, model_id: model}),
	});
	console.log('status', r.status);
	if (!r.ok) {
		console.log((await r.text()).slice(0, 500));
		process.exit(1);
	}
	const fs = await import('node:fs');
	fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
	const after = await used();
	console.log(`saved ${out}; characters in text: ${[...text].length}; credits used: ${after - before} (account total used: ${after})`);
}
