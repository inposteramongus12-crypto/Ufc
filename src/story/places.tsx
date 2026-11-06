import React from 'react';
import {interpolate, random} from 'remotion';
import {AgeBadge, FONT, HAND} from '../kit/ui';
import {counterAt, counterChangedAgo, useShot} from '../kit/core';
import {clamp, useCam} from '../kit/kit';
import {WHIP_SHIFT, WHIP_ZOOM, whipAt} from '../kit/whip';

/* Places and props of the UFC story (parts 1–3). World is 1920×1080, floor line y = 900.
   Small text is sized a third bigger than the template default (nothing under 40 px at zoom 1). */

export const FL = 900;
export const HS = 1.2; // hero scale
export const IS = 1.15; // Irma and other staff
export const headTop = (s: number) => FL - 371 * s;

// старая табличка-счётчик из шаблона: оставлена, чтобы собирались общие файлы
export const Tag: React.FC<{x: number; y: number; value: number; f: number; s?: number; warn?: boolean; ok?: boolean; grey?: boolean; bpm?: number; label?: string; pop?: number; heart?: boolean; auto?: boolean; showBpm?: boolean; heartK?: number}> = ({x, y, value, s = 0.8, pop = 1, label = 'ДЕНЬ'}) => (
	<g>
		<AgeBadge x={x} y={y} value={value} s={s} pop={pop} label={label} c="#ffc94a" />
	</g>
);

/* ------------------------------ plate «ДО ТУРНИРА N ДНЕЙ» ------------------------------ */
export const daysWord = (n: number) => {
	const a = n % 10;
	const b = n % 100;
	if (a === 1 && b !== 11) return 'ДЕНЬ';
	if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'ДНЯ';
	return 'ДНЕЙ';
};
/* (x, y) = tip of the pointer; the plate stands above it. dx > 0 slides the plate to the left of the pointer
   (so it does not cover what is on the right). Fill #11142c on purpose: check-edges finds plates by it. */
export const PLATE_W = 330;
export const PLATE_H = 190;
export const DayPlate: React.FC<{x: number; y: number; value: number; s?: number; pop?: number; blink?: number; c?: string; dx?: number}> = ({x, y, value, s = 1, pop = 1, blink = 1, c = '#ffc94a', dx = 0}) => {
	const v = Math.max(0, Math.round(value));
	const W = PLATE_W;
	const H = PLATE_H;
	const word = daysWord(v);
	const cx = -dx; // plate centre relative to the pointer
	return (
		<g transform={`translate(${x},${y}) scale(${s * pop})`} opacity={blink}>
			<rect x={cx - W / 2 - 10} y={-H - 34} width={W + 20} height={H + 20} rx={44} fill={c} opacity={0.25} style={{filter: 'blur(14px)'}} />
			<rect x={cx - W / 2} y={-H - 24} width={W} height={H} rx={36} fill="#11142c" stroke={c} strokeWidth={5} />
			<path d="M-16,-24 L0,0 L16,-24 Z" fill={c} />
			<text x={cx} y={-H + 22} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={800} fill="#ffe9a8" letterSpacing={2}>
				ДО ТУРНИРА
			</text>
			{/* the number just counts (no sliding digits): while it rolls, whole numbers flip every frame, so nothing is cut or sticks out */}
			<text x={cx} y={-H + 106} textAnchor="middle" fontSize={104} fontFamily={FONT} fontWeight={900} fill="#fff">
				{Math.round(value)}
			</text>
			<text x={cx} y={-44} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={800} fill="#ffe9a8" letterSpacing={2}>
				{word}
			</text>
		</g>
	);
};

/* Keeps a box inside the safe zone of the SCREEN (60 px from every edge) whatever the camera and the whip-pan do.
   (x, y) is the box anchor in the depth-1 layer, left/right/top/bottom its extent in world units around the anchor.
   Returns the correction in world units. Used by the day plate, wall signs and captions. */
export const SAFE = 60;
export const useSafeShift = (x: number, y: number, b: {left: number; right: number; top: number; bottom?: number}) => {
	const {gf} = useShot();
	const cam = useCam();
	const w = whipAt(gf);
	const S = w ? 1 + WHIP_ZOOM * w.k : 1;
	const shift = w ? w.dir * WHIP_SHIFT * w.k : 0;
	const m = cam.zoom * S; // screen pixels per world pixel
	const ax = 960 + S * (cam.zoom * (x - 960) - cam.x) + shift;
	const ay = 540 + S * (cam.zoom * (y - 540) - cam.y);
	let cx = 0;
	let cy = 0;
	if (ax - b.left * m < SAFE) cx = (SAFE - (ax - b.left * m)) / m;
	if (ax + b.right * m > 1920 - SAFE) cx = -(ax + b.right * m - (1920 - SAFE)) / m;
	if (ay - b.top * m < SAFE) cy = (SAFE - (ay - b.top * m)) / m;
	if (b.bottom !== undefined && ay + b.bottom * m > 1080 - SAFE) cy = -(ay + b.bottom * m - (1080 - SAFE)) / m;
	return {cx, cy};
};
export const SafeBox: React.FC<{x: number; y: number; left: number; right: number; top: number; bottom?: number; children: React.ReactNode}> = ({x, y, left, right, top, bottom, children}) => {
	const {cx, cy} = useSafeShift(x, y, {left, right, top, bottom});
	return <g transform={`translate(${cx},${cy})`}>{children}</g>;
};

/* the plate over a hero: pops and rings whenever the counter changes; 84 px above the head so the lamp ring never reaches it */
export const HeroPlate: React.FC<{x: number; s?: number; hs?: number; y?: number; blink?: number; dx?: number}> = ({x, s = 0.95, hs = HS, y, blink = 1, dx = 0}) => {
	const {gf} = useShot();
	const v = counterAt(gf);
	const ago = counterChangedAgo(gf);
	const pop = 1 + 0.2 * Math.exp(-Math.max(0, ago) / 4) * (ago >= 0 && ago < 40 ? 1 : 0);
	const ring = interpolate(ago, [0, 14], [0, 1], clamp);
	const py = y ?? headTop(hs) - 84;
	const sc = s * pop;
	const {cx, cy} = useSafeShift(x, py, {left: (PLATE_W / 2 + 10 + dx) * sc, right: (PLATE_W / 2 + 10 - dx) * sc, top: (PLATE_H + 34) * sc});
	return (
		<g transform={`translate(${cx},${cy})`}>
			{ago >= 0 && ago < 14 ? <ellipse cx={x} cy={py - 120 * s} rx={120 + ring * 220} ry={70 + ring * 120} fill="none" stroke="#ffe08a" strokeWidth={8 * (1 - ring)} opacity={1 - ring} /> : null}
			<DayPlate x={x} y={py} value={v} s={s} pop={pop} blink={blink} dx={dx} />
		</g>
	);
};

/* ------------------------------ arena ------------------------------ */
const OCT = (cx: number, cy: number, rx: number, ry: number) =>
	Array.from({length: 8}).map((_, i) => {
		const a = (Math.PI / 4) * i + Math.PI / 8;
		return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as [number, number];
	});
const pts = (p: [number, number][]) => p.map((q) => q.join(',')).join(' ');

/* phone lights and waving silhouettes of a stand */
export const Crowd: React.FC<{seed: string; x0: number; x1: number; y0: number; y1: number; n: number; f: number; color?: string; up?: number}> = ({seed, x0, x1, y0, y1, n, f, color = '#0a0c1c', up = 0}) => (
	<g>
		{Array.from({length: n}).map((_, i) => {
			const r1 = random(seed + 'a' + i);
			const r2 = random(seed + 'b' + i);
			const x = x0 + (x1 - x0) * r1;
			const y = y0 + (y1 - y0) * r2;
			const k = 0.55 + r2 * 0.7;
			const wave = Math.sin(f / 5 + i) * 8 * (0.4 + up);
			const arm = 18 * k + up * 26 * k;
			return (
				<g key={i} transform={`translate(${x},${y})`}>
					<circle cx={0} cy={0} r={13 * k} fill={color} />
					<rect x={-15 * k} y={13 * k} width={30 * k} height={46 * k} rx={9 * k} fill={color} />
					<line x1={10 * k} y1={20 * k} x2={(16 + wave * 0.4) * k} y2={20 * k - arm} stroke={color} strokeWidth={7 * k} strokeLinecap="round" />
					{r1 > 0.72 ? <rect x={(12 + wave * 0.4) * k} y={20 * k - arm - 14 * k} width={9 * k} height={14 * k} rx={2} fill={r2 > 0.5 ? '#bfe3ff' : '#fff3c8'} opacity={0.65 + 0.35 * Math.sin(f / 7 + i * 3)} /> : null}
				</g>
			);
		})}
	</g>
);

/* the octagon seen from above, light falling into its centre. Nobody inside. */
export const OctagonTop: React.FC<{f: number}> = ({f}) => {
	const cx = 960;
	const cy = 640;
	const outer = OCT(cx, cy, 640, 270);
	const inner = OCT(cx, cy, 520, 215);
	const flick = 0.9 + 0.1 * Math.sin(f / 3);
	return (
		<g>
			<rect x={-400} y={-300} width={2720} height={1700} fill="#070914" />
			<ellipse cx={cx} cy={cy + 10} rx={1040} ry={470} fill="#0f1431" />
			<ellipse cx={cx} cy={cy + 10} rx={800} ry={360} fill="#141b44" />
			<polygon points={pts(outer)} fill="#1b1f33" />
			<polygon points={pts(inner)} fill="#d6d9e6" />
			<polygon points={pts(OCT(cx, cy, 430, 178))} fill="#2a3b78" opacity={0.85} />
			<ellipse cx={cx} cy={cy} rx={260} ry={110} fill="#ffffff" opacity={0.2 * flick} />
			<ellipse cx={cx} cy={cy} rx={150} ry={64} fill="none" stroke="#8fa3e8" strokeWidth={8} />
			{inner.map((p, i) => (
				<g key={i}>
					<line x1={p[0]} y1={p[1]} x2={p[0]} y2={p[1] - 150} stroke="#8c94ad" strokeWidth={9} />
					<line x1={p[0]} y1={p[1] - 150} x2={inner[(i + 1) % 8][0]} y2={inner[(i + 1) % 8][1] - 150} stroke="#8c94ad" strokeWidth={6} opacity={0.8} />
					<line x1={p[0]} y1={p[1]} x2={inner[(i + 1) % 8][0]} y2={inner[(i + 1) % 8][1]} stroke="#e7e9f2" strokeWidth={10} />
				</g>
			))}
		</g>
	);
};

/* a long dark hall behind a box / cage: stands, lights, a far cage. */
export const HallFar: React.FC<{f: number; cage?: boolean; up?: number}> = ({f, cage = true, up = 0.4}) => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1700} fill="#0a0c1f" />
		<rect x={-500} y={380} width={2920} height={800} fill="#141831" />
		{[0, 1, 2].map((r) => (
			<Crowd key={r} seed={'hf' + r} x0={-300} x1={2220} y0={380 + r * 90} y1={440 + r * 90} n={46} f={f + r * 5} color={['#10142e', '#0d1028', '#0a0d20'][r]} up={up} />
		))}
		{cage ? (
			<g>
				<ellipse cx={960} cy={800} rx={470} ry={80} fill="#1c2250" />
				<ellipse cx={960} cy={790} rx={400} ry={62} fill="#d6d9e6" />
				{Array.from({length: 9}).map((_, i) => (
					<line key={i} x1={560 + i * 100} y1={790} x2={560 + i * 100} y2={640} stroke="#8c94ad" strokeWidth={5} />
				))}
				<line x1={560} y1={640} x2={1360} y2={640} stroke="#8c94ad" strokeWidth={5} />
			</g>
		) : null}
		{[200, 600, 1000, 1400, 1800].map((x, i) => (
			<g key={i} opacity={0.6 + 0.4 * Math.sin(f / 9 + i)}>
				<circle cx={x} cy={90} r={46} fill="#e8f0ff" opacity={0.7} />
				<circle cx={x} cy={90} r={22} fill="#fff" />
			</g>
		))}
	</g>
);

/* the owners' box: glass railing, a window onto the hall */
export const VipBox: React.FC<{f: number}> = ({f}) => (
	<g>
		<HallFar f={f} />
		<rect x={-500} y={780} width={2920} height={500} fill="#2a1d3d" />
		<rect x={-500} y={770} width={2920} height={16} fill="#5b3f7a" />
		<rect x={-500} y={900} width={2920} height={20} fill="#1b1230" />
		<rect x={-500} y={560} width={2920} height={18} fill="#cdd6ff" opacity={0.55} />
		<rect x={-500} y={578} width={2920} height={200} fill="#9fb4ff" opacity={0.12} />
		{[100, 460, 820, 1180, 1540, 1900].map((x) => (
			<rect key={x} x={x} y={560} width={14} height={220} fill="#cdd6ff" opacity={0.5} />
		))}
	</g>
);

/* low view at the fence of the cage (fight). */
export const CageSide: React.FC<{f: number; shake?: number}> = ({f, shake = 0}) => (
	<g transform={`translate(${Math.sin(f * 2.1) * shake},${Math.cos(f * 2.7) * shake})`}>
		<rect x={-500} y={-300} width={2920} height={1700} fill="#090b1d" />
		{[100, 380, 660, 940, 1220, 1500, 1780].map((x, i) => (
			<g key={i} opacity={0.55}>
				<circle cx={x} cy={120 + (i % 2) * 40} r={70} fill="#dce8ff" opacity={0.35} />
				<circle cx={x} cy={120 + (i % 2) * 40} r={28} fill="#fff" />
			</g>
		))}
		<Crowd seed="cs" x0={-200} x1={2120} y0={420} y1={600} n={70} f={f} color="#0d1128" up={0.7} />
		<rect x={-500} y={900} width={2920} height={400} fill="#d6d9e6" />
		<rect x={-500} y={900} width={2920} height={18} fill="#8fa3e8" />
		{Array.from({length: 26}).map((_, i) => (
			<line key={i} x1={-300 + i * 100} y1={300} x2={-300 + i * 100 + 540} y2={900} stroke="#8c94ad" strokeWidth={3} opacity={0.55} />
		))}
		{Array.from({length: 26}).map((_, i) => (
			<line key={'b' + i} x1={-300 + i * 100 + 540} y1={300} x2={-300 + i * 100} y2={900} stroke="#8c94ad" strokeWidth={3} opacity={0.55} />
		))}
		<rect x={-500} y={286} width={2920} height={16} fill="#e7e9f2" />
	</g>
);

/* scoreboard on cables; the two surnames are small on the poster, but big enough to read */
export const Scoreboard: React.FC<{x: number; y: number; f: number; sway?: number}> = ({x, y, f, sway = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${Math.sin(f / 3) * sway})`}>
		<line x1={-340} y1={-300} x2={-300} y2={0} stroke="#7a819a" strokeWidth={5} />
		<line x1={340} y1={-300} x2={300} y2={0} stroke="#7a819a" strokeWidth={5} />
		<rect x={-400} y={0} width={800} height={320} rx={26} fill="#131735" stroke="#8fa3e8" strokeWidth={6} />
		<rect x={-370} y={22} width={740} height={116} rx={14} fill="#1d2b6b" />
		<text x={0} y={104} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill="#ffe08a">
			БОЙ ВЕКА
		</text>
		<rect x={-370} y={156} width={740} height={140} rx={14} fill="#0e1330" />
		<text x={0} y={246} textAnchor="middle" fontSize={70} fontFamily={FONT} fontWeight={800} fill="#ffffff">
			ГАЛКИН — АДЕБИ
		</text>
	</g>
);

/* ------------------------------ studio ------------------------------ */
const Flame: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<path d="M0,-34 C14,-16 22,-4 16,14 C12,26 -12,26 -16,14 C-22,-2 -6,-12 0,-34 Z" fill="#ff7a2a" />
		<path d="M0,-10 C8,0 10,8 6,16 C2,22 -6,20 -7,12 C-8,4 -2,-2 0,-10 Z" fill="#ffd34a" />
	</g>
);
export const ChatFlames: React.FC<{f: number; x: number; y: number; n?: number; on?: number}> = ({f, x, y, n = 14, on = 1}) => (
	<g>
		{Array.from({length: n}).map((_, i) => {
			const t = ((f * (1.4 + random('cf' + i)) + i * 37) % 120) / 120;
			return <Flame key={i} x={x + (random('cx' + i) - 0.5) * 260 + Math.sin(f / 8 + i) * 18} y={y - t * 420} s={1.1 + random('cs' + i) * 0.9} o={Math.sin(t * Math.PI) * on} />;
		})}
	</g>
);

const Poster: React.FC<{x: number; y: number; w: number; h: number; c1: string; c2: string; tilt?: number}> = ({x, y, w, h, c1, c2, tilt = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${tilt})`}>
		<rect x={0} y={0} width={w} height={h} rx={10} fill={c1} stroke="#0d0d1c" strokeWidth={5} />
		<rect x={w * 0.08} y={h * 0.58} width={w * 0.84} height={h * 0.3} rx={8} fill={c2} />
		<circle cx={w * 0.3} cy={h * 0.3} r={w * 0.14} fill="#0d0d1c" />
		<circle cx={w * 0.7} cy={h * 0.3} r={w * 0.14} fill="#0d0d1c" />
		<rect x={w * 0.2} y={h * 0.42} width={w * 0.2} height={h * 0.12} rx={6} fill="#0d0d1c" />
		<rect x={w * 0.6} y={h * 0.42} width={w * 0.2} height={h * 0.12} rx={6} fill="#0d0d1c" />
	</g>
);
export const Studio: React.FC<{f: number; lampOn?: number}> = ({f, lampOn = 1}) => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1300} fill="#2b2046" />
		<rect x={-500} y={900} width={2920} height={400} fill="#171127" />
		<rect x={-500} y={890} width={2920} height={14} fill="#4a3a73" />
		<Poster x={230} y={150} w={260} h={360} c1="#c43d4b" c2="#ffd34a" tilt={-3} />
		<Poster x={540} y={190} w={240} h={330} c1="#2f6fd8" c2="#f4f4f4" tilt={2} />
		<Poster x={1380} y={140} w={270} h={370} c1="#3fae4f" c2="#ff4fa0" tilt={3} />
		<Poster x={1690} y={200} w={220} h={310} c1="#8b4fd6" c2="#ffd34a" tilt={-2} />
		<rect x={820} y={110} width={420} height={14} rx={7} fill="#ff4fa0" opacity={0.75 + 0.25 * Math.sin(f / 6)} style={{filter: 'blur(2px)'}} />
		{/* desk with monitor */}
		<rect x={1020} y={700} width={560} height={30} rx={8} fill="#5b4a86" />
		<rect x={1050} y={730} width={20} height={170} fill="#3a2f5a" />
		<rect x={1530} y={730} width={20} height={170} fill="#3a2f5a" />
		<rect x={1130} y={520} width={300} height={180} rx={14} fill="#0b0d1c" stroke="#8fa3e8" strokeWidth={5} />
		<rect x={1146} y={536} width={268} height={148} rx={8} fill="#1d2b6b" />
		{/* camera on a tripod, red light */}
		<g>
			<line x1={1700} y1={640} x2={1650} y2={900} stroke="#24203a" strokeWidth={10} />
			<line x1={1700} y1={640} x2={1750} y2={900} stroke="#24203a" strokeWidth={10} />
			<line x1={1700} y1={640} x2={1700} y2={900} stroke="#24203a" strokeWidth={10} />
			<rect x={1620} y={540} width={170} height={110} rx={16} fill="#0d0e1b" stroke="#8fa3e8" strokeWidth={4} />
			<circle cx={1620} cy={595} r={46} fill="#161a33" stroke="#8fa3e8" strokeWidth={5} />
			<circle cx={1620} cy={595} r={22} fill="#33407a" />
			<circle cx={1760} cy={562} r={9} fill="#ff3b3b" opacity={0.5 + 0.5 * Math.sin(f / 7)} />
		</g>
		<ellipse cx={960} cy={560} rx={620} ry={380} fill="#ffd9a0" opacity={0.1 * lampOn} style={{mixBlendMode: 'screen', filter: 'blur(30px)'}} />
	</g>
);

/* ------------------------------ office ------------------------------ */
export const Office: React.FC = () => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1300} fill="#e4dccb" />
		<rect x={-500} y={900} width={2920} height={400} fill="#8a7a62" />
		<rect x={-500} y={886} width={2920} height={16} fill="#b6a483" />
		<rect x={160} y={140} width={420} height={470} rx={10} fill="#2c3550" />
		<rect x={176} y={156} width={388} height={438} fill="#9fd0ff" />
		<rect x={176} y={430} width={388} height={164} fill="#5a6f9a" />
		{[200, 270, 340, 420, 480].map((x, i) => (
			<rect key={x} x={x} y={380 - (i % 3) * 36} width={50} height={214 + (i % 3) * 36} fill="#3c4a73" />
		))}
		<rect x={368} y={156} width={8} height={438} fill="#2c3550" />
		<rect x={176} y={372} width={388} height={8} fill="#2c3550" />
		<rect x={1500} y={300} width={360} height={14} fill="#6b5a3a" />
		{[1530, 1590, 1660, 1730, 1790].map((x, i) => (
			<rect key={x} x={x} y={300 - 70 - (i % 2) * 20} width={42} height={70 + (i % 2) * 20} rx={4} fill={['#c43d4b', '#2f6fd8', '#ffd34a', '#3fae4f', '#8b4fd6'][i]} />
		))}
		<rect x={700} y={690} width={620} height={34} rx={8} fill="#6b4a2c" />
		<rect x={730} y={724} width={22} height={176} fill="#4f361f" />
		<rect x={1270} y={724} width={22} height={176} fill="#4f361f" />
		<rect x={760} y={640} width={110} height={50} rx={6} fill="#cfd7e6" />
		<rect x={1120} y={600} width={90} height={90} rx={8} fill="#c43d4b" />
		<rect x={1138} y={560} width={54} height={44} rx={8} fill="#3fae4f" />
		{/* floor scale in the corner */}
		<g>
			<rect x={1560} y={862} width={250} height={40} rx={12} fill="#2c2f3a" />
			<rect x={1580} y={850} width={210} height={20} rx={8} fill="#cfd7e6" />
			<rect x={1650} y={600} width={26} height={260} fill="#2c2f3a" />
			<rect x={1610} y={540} width={106} height={70} rx={10} fill="#0b0d1c" stroke="#8fa3e8" strokeWidth={4} />
			<text x={1663} y={590} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={800} fill="#6ff0a0">
				0.0
			</text>
		</g>
		<ellipse cx={960} cy={440} rx={700} ry={360} fill="#fff3d0" opacity={0.1} style={{mixBlendMode: 'screen', filter: 'blur(30px)'}} />
	</g>
);

/* ------------------------------ props ------------------------------ */
/* envelope with a key card; open = 0..1 lifts the flap, card = 0..1 slides the key card out of the pocket */
export const Envelope: React.FC<{x: number; y: number; s?: number; open: number; card: number; t: number}> = ({x, y, s = 1, open, card, t}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(t / 8) * 1.2})`}>
		<rect x={-250} y={-150} width={500} height={320} rx={18} fill="#cfc4a6" stroke="#0d0d1c" strokeWidth={6} />
		{open > 0.05 ? <path d={`M-250,-150 L0,${-150 - 150 * open} L250,-150 Z`} fill="#e3d9bd" stroke="#0d0d1c" strokeWidth={6} /> : null}
		<g transform={`translate(0,${-card * 250})`} opacity={card > 0 ? 1 : 0}>
			<rect x={-190} y={-60} width={380} height={230} rx={18} fill="#11142c" stroke="#ffc94a" strokeWidth={6} />
			<rect x={-190} y={-20} width={380} height={44} fill="#ffc94a" />
			<text x={0} y={72} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
				UFC
			</text>
			<text x={0} y={134} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={800} fill="#ffe9a8">
				КЛЮЧ НА ГОД
			</text>
		</g>
		<path d="M-250,170 L-250,-150 L0,40 L250,-150 L250,170 Z" fill="#f1ead8" stroke="#0d0d1c" strokeWidth={6} strokeLinejoin="round" />
		{open <= 0.05 ? <path d="M-250,-150 L0,40 L250,-150 Z" fill="#e8dfc6" stroke="#0d0d1c" strokeWidth={6} strokeLinejoin="round" /> : null}
	</g>
);

export const Stamp: React.FC<{x: number; y: number; text: string; k: number; rot?: number; c?: string; size?: number}> = ({x, y, text, k, rot = -8, c = '#d9372b', size = 50}) =>
	k <= 0 ? null : (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${1 + (1 - Math.min(1, k * 4)) * 1.4})`} opacity={Math.min(1, k * 3)}>
			<rect x={-text.length * size * 0.34 - 20} y={-size * 0.76} width={text.length * size * 0.68 + 40} height={size * 1.52} rx={10} fill="none" stroke={c} strokeWidth={7} />
			<text x={0} y={size * 0.32} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill={c} letterSpacing={3}>
				{text}
			</text>
		</g>
	);

/* contract sheet: one clause, underlined in red */
export const Contract: React.FC<{x: number; y: number; s?: number; under: number; glow?: number}> = ({x, y, s = 1, under, glow = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-330} y={-260} width={660} height={520} rx={16} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={6} />
		<text x={-290} y={-190} fontSize={52} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
			КОНТРАКТ
		</text>
		{[-130, -80, 110, 160, 210].map((yy, i) => (
			<rect key={i} x={-290} y={yy} width={i % 2 ? 480 : 560} height={18} rx={9} fill="#cdd1de" />
		))}
		<rect x={-300} y={-52} width={600} height={170} rx={14} fill="#ffe08a" opacity={0.55 * glow} />
		<text x={-290} y={0} fontSize={54} fontFamily={FONT} fontWeight={800} fill="#2a2f4a">
			Пока чемпион:
		</text>
		<text x={-290} y={62} fontSize={54} fontFamily={FONT} fontWeight={800} fill="#2a2f4a">
			+3 боя или +1 год
		</text>
		<line x1={-290} y1={80} x2={-290 + 580 * under} y2={80} stroke="#d9372b" strokeWidth={8} strokeLinecap="round" />
	</g>
);

/* wall calendar: the ringed day is the tournament date; `shift` days to the right = moved */
export const Calendar: React.FC<{x: number; y: number; s?: number; shift: number; glow?: number}> = ({x, y, s = 1, shift, glow = 0}) => {
	const cell = 78;
	const cols = 7;
	const pos = 14 + shift;
	const cxOf = (i: number) => -3 * cell + (i % cols) * cell;
	const cyOf = (i: number) => -70 + Math.floor(i / cols) * cell;
	// the ring slides along the rows (shift is fractional while dragging)
	const lo = Math.floor(pos);
	const k = pos - lo;
	const px = cxOf(lo) + (cxOf(lo + 1) - cxOf(lo)) * (lo % cols === cols - 1 ? 0 : k);
	const py = cyOf(lo);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<rect x={-330} y={-190} width={660} height={500} rx={16} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={6} />
			<rect x={-330} y={-190} width={660} height={90} rx={16} fill="#d9372b" />
			<text x={0} y={-124} textAnchor="middle" fontSize={52} fontFamily={FONT} fontWeight={900} fill="#fff">
				ТУРНИР ГОДА
			</text>
			{Array.from({length: 28}).map((_, i) => (
				<g key={i}>
					<rect x={cxOf(i) - 30} y={cyOf(i) - 30} width={60} height={60} rx={10} fill="#eef0f6" />
					<text x={cxOf(i)} y={cyOf(i) + 12} textAnchor="middle" fontSize={42} fontFamily={FONT} fontWeight={700} fill="#4a5070">
						{i + 1}
					</text>
				</g>
			))}
			<circle cx={px} cy={py} r={44 + glow * 8} fill="#d9372b" opacity={0.92} />
			<text x={px} y={py + 14} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#fff">
				{Math.round(pos) + 1}
			</text>
		</g>
	);
};

/* a «television» icon: no real logo */
export const TvLogo: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-90} y={-70} width={180} height={140} rx={22} fill="#e4e6ec" stroke="#9aa3b5" strokeWidth={6} />
		<rect x={-70} y={-50} width={140} height={90} rx={10} fill="#1a1f2b" />
		<circle cx={-34} cy={-4} r={14} fill="#e4e6ec" />
		<line x1={-24} y1={-70} x2={-50} y2={-108} stroke="#9aa3b5" strokeWidth={7} strokeLinecap="round" />
		<line x1={24} y1={-70} x2={50} y2={-108} stroke="#9aa3b5" strokeWidth={7} strokeLinecap="round" />
	</g>
);

export const Hand: React.FC<{x: number; y: number; text: string; size?: number; c?: string; rot?: number; o?: number}> = ({x, y, text, size = 64, c = '#fff', rot = 0, o = 1}) => (
	<text x={x} y={y} textAnchor="middle" fontSize={size} fontFamily={HAND} fontWeight={700} fill={c} transform={`rotate(${rot} ${x} ${y})`} opacity={o}>
		{text}
	</text>
);
