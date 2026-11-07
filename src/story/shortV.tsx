import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, random} from 'remotion';
import STL from './short-timeline.json';
import PICK from './short-pick.json';
import {Actor, Line, ShotCtx, TalkOverride, useShot} from '../kit/core';
import {FONT} from '../kit/ui';
import {Crowd, DayPlate, TvLogo, PLATE_H} from './places';
import {blend, gesture, idle, SIT} from '../kit/actions';
import {clamp, ease} from '../kit/kit';

/* Vertical 1080×1920 scenes of the short (recut: the voice is the long's, the pictures are drawn for 9:16 — nothing is cropped
   from the 16:9 frame, so no 16:9 scale shows through). Rules that every scene keeps:
   - plates and text in the upper half (y < 960), the floor fills the lower third (y > 1250), feet at y = 1450;
   - Shorts UI safe zone: nothing important in the top 150 px, the bottom 380 px (y > 1540) and right of x = 960 in the lower half
     (content starts at y = 190, the slow push is ≤ 3.5 %); the channel pill ends above y = 1450;
   - nothing wider than 880 px and nothing closer than 85 px to the side edges, so 60 px stays free;
   - small text is 46 px and up (a third more than the long's 40). */
export const W = 1080;
export const H = 1920;
const FEET = 1450;
const HSC = 1.5; // heroes: 557 px tall (+25 % over the first version)
const HEAD = FEET - 371 * HSC; // 893
const PS = 1.2; // plate scale (+20 %)
const PLATE_TIP = HEAD - 38; // 855: the plate rect is 598…810
const TOP = 190; // first y of the content (Shorts UI covers the top 150 px)
const NAVY = '#11142c';

/* ------------------------------ timeline of the short ------------------------------ */
const LINES = STL.lines as Line[];
const SL = (n: string) => {
	const l = LINES.find((x) => x.id.startsWith(n));
	if (!l) throw new Error('no short line ' + n);
	return l;
};
export const T = (n: string, off = 0) => SL(n).from + off;
export const CARD0 = T(PICK.card as string) - (PICK.cardLead as number); // the final card takes over BEFORE the question line starts and holds to the end
export const SHORT_TOTAL = STL.total as number;
export const CUT_LEAD = 5;
export const SHOT_STARTS: number[] = [0, ...(PICK.cuts as string[]).map((c) => T(c) - CUT_LEAD), CARD0];
export const SHORT_WHIPS: number[] = SHOT_STARTS.slice(1);

/* the plate counter of the short: own keys (the long's counter does not exist here) */
const KEYS = [
	{at: 0, v: 0, roll: 0},
	{at: T('003', 12), v: 300, roll: 40}, // 024: the date is dragged a week forward, the counter rolls 0 → 300 (whoosh in short-sound.json)
	{at: T('007', 4), v: 6, roll: 36}, // 078: «показывает шесть»
	{at: T('008', 4), v: 5, roll: 8}, // 084
	{at: T('012', 4), v: 0, roll: 30}, // 121: the evening of the tournament
];
const counterOf = (gf: number) => {
	let v = KEYS[0].v;
	for (let i = 1; i < KEYS.length; i++) {
		const k = KEYS[i];
		if (gf < k.at) break;
		v = interpolate(gf, [k.at, k.at + k.roll], [KEYS[i - 1].v, k.v], {...clamp, easing: ease});
	}
	return v;
};
const agoOf = (gf: number) => {
	let last = -999;
	for (const k of KEYS.slice(1)) if (gf >= k.at + k.roll) last = k.at + k.roll;
	return gf - last;
};
const talkAt = (sp: string, f: number) => {
	for (const l of LINES) {
		if (l.sp !== sp || f < l.from || f >= l.from + l.dur) continue;
		const i = f - l.from;
		return ((l.env[i] ?? 0) + (l.env[i + 1] ?? 0)) / 2;
	}
	return 0;
};
const speakerAt = (gf: number) => {
	let cur: Line | null = null;
	for (const l of LINES) {
		if (l.from - 6 > gf) break;
		cur = l;
	}
	return cur && gf < cur.from + cur.dur + 12 ? cur.sp : null;
};
const sp01 = (f: number, t: number, len = 12) => interpolate(f, [t, t + len], [0, 1], {...clamp, easing: ease});

/* ------------------------------ pieces ------------------------------ */
/* the day plate over a hero: pops when the number changes; (x, TIP) is the tip of its pointer */
const VPlate: React.FC<{x: number; tip?: number; s?: number; fade?: number}> = ({x, tip = PLATE_TIP, s = PS, fade = 1}) => {
	const {gf} = useShot();
	const ago = agoOf(gf);
	const pop = 1 + 0.2 * Math.exp(-Math.max(0, ago) / 4) * (ago >= 0 && ago < 40 ? 1 : 0);
	const ring = interpolate(ago, [0, 14], [0, 1], clamp);
	return (
		<g opacity={fade}>
			{ago >= 0 && ago < 14 ? <ellipse cx={x} cy={tip - 130 * s} rx={120 + ring * 160} ry={70 + ring * 90} fill="none" stroke="#ffe08a" strokeWidth={8 * (1 - ring)} opacity={1 - ring} /> : null}
			<DayPlate x={x} y={tip} value={counterOf(gf)} s={s} pop={pop} />
		</g>
	);
};

const Floor: React.FC<{kind: 'wood' | 'nightwood' | 'mat'; y?: number}> = ({kind, y = 1250}) => {
	const c = {wood: ['#c9a574', '#8c6a40', '#6e4f2c', '#a98558'], nightwood: ['#3b3a52', '#22223a', '#161628', '#2e2d46'], mat: ['#d9dcea', '#aeb4cc', '#8c94b4', '#c6cadb']}[kind];
	const id = 'fl' + kind;
	return (
		<g>
			<defs>
				<linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={c[0]} />
					<stop offset="1" stopColor={c[1]} />
				</linearGradient>
			</defs>
			<rect x={-60} y={y} width={W + 120} height={H - y + 60} fill={`url(#${id})`} />
			{kind === 'mat' ? <rect x={-60} y={y} width={W + 120} height={18} fill="#8fa3e8" /> : <rect x={-60} y={y - 40} width={W + 120} height={40} fill={kind === 'wood' ? '#7a5a3a' : '#1a1a2e'} />}
			{/* planks / mat seams converge toward the horizon */}
			{Array.from({length: 15}).map((_, i) => (
				<line key={i} x1={540 + (i - 7) * 70} y1={y} x2={540 + (i - 7) * 230} y2={H + 40} stroke={c[2]} strokeWidth={4} opacity={0.5} />
			))}
			{[0.1, 0.24, 0.42, 0.66, 0.96].map((t, i) => (
				<line key={'h' + i} x1={-60} y1={y + (H - y) * t} x2={W + 60} y2={y + (H - y) * t} stroke={c[2]} strokeWidth={3 + t * 5} opacity={0.4} />
			))}
			<ellipse cx={540} cy={y + 330} rx={460} ry={90} fill="#fff" opacity={kind === 'nightwood' ? 0.04 : 0.1} />
		</g>
	);
};

const OfficeWall: React.FC<{night?: boolean}> = ({night}) => (
	<g>
		<defs>
			<linearGradient id={night ? 'wn' : 'wd'} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={night ? '#2a2f4a' : '#efe6d4'} />
				<stop offset="1" stopColor={night ? '#1c2038' : '#d4c8af'} />
			</linearGradient>
		</defs>
		<rect x={-60} y={-60} width={W + 120} height={1320} fill={`url(#${night ? 'wn' : 'wd'})`} />
		{Array.from({length: 9}).map((_, i) => (
			<rect key={i} x={i * 130 - 20} y={-60} width={60} height={1320} fill={night ? '#ffffff' : '#8a7a5a'} opacity={0.05} />
		))}
		{/* a window low on the wall, lit */}
		<rect x={690} y={820} width={300} height={260} rx={14} fill={night ? '#151a36' : '#9cc4ee'} stroke={night ? '#3a4a8a' : '#6b5a3a'} strokeWidth={10} />
		{night
			? [0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={r + '' + c} x={720 + c * 90} y={850 + r * 70} width={56} height={44} fill={(r + c) % 2 ? '#e0c070' : '#2a3466'} />))
			: <line x1={840} y1={820} x2={840} y2={1080} stroke="#6b5a3a" strokeWidth={8} />}
		<rect x={80} y={900} width={200} height={14} rx={6} fill={night ? '#3a3f5f' : '#8a6a42'} />
	</g>
);

const ArenaWall: React.FC<{up?: number}> = ({up = 0.7}) => {
	const {gf} = useShot();
	return (
		<g>
			<rect x={-60} y={-60} width={W + 120} height={1320} fill="#090b1d" />
			{[110, 360, 610, 860, 1110].map((x, i) => (
				<g key={i} opacity={0.55}>
					<circle cx={x} cy={150 + (i % 2) * 50} r={78} fill="#dce8ff" opacity={0.35} />
					<circle cx={x} cy={150 + (i % 2) * 50} r={30} fill="#fff" />
				</g>
			))}
			<Crowd seed="vcs" x0={-60} x1={1140} y0={720} y1={1000} n={46} f={gf} color="#0d1128" up={up} />
			{Array.from({length: 14}).map((_, i) => (
				<line key={i} x1={-120 + i * 100} y1={650} x2={-120 + i * 100 + 380} y2={1250} stroke="#8c94ad" strokeWidth={4} opacity={0.5} />
			))}
			{Array.from({length: 14}).map((_, i) => (
				<line key={'b' + i} x1={-120 + i * 100 + 380} y1={650} x2={-120 + i * 100} y2={1250} stroke="#8c94ad" strokeWidth={4} opacity={0.5} />
			))}
			<rect x={-60} y={634} width={W + 120} height={18} fill="#e7e9f2" />
		</g>
	);
};

/* a month, two weeks: the red chip is the date of the tournament; pos 0 = the 15th, 7 = the 22nd. bare: no title bar (less height) */
const MiniCal: React.FC<{y: number; s?: number; pos: number; snap?: number; bare?: boolean}> = ({y, s = 1, pos, snap = 0, bare}) => {
	const cw = 112;
	const top = bare ? -100 : 0; // the rows start at 150 under the title bar; without it everything moves up by 100
	const cell = (i: number): [number, number] => [-3 * cw + (i % 7) * cw, 150 + top + Math.floor(i / 7) * 128];
	const lo = Math.floor(pos);
	const k = pos - lo;
	const [ax, ay] = cell(Math.min(13, lo));
	const [bx, by] = cell(Math.min(13, lo + 1));
	const px = ax + (bx - ax) * k;
	const py = ay + (by - ay) * k;
	return (
		<g transform={`translate(540,${y}) scale(${s})`}>
			<rect x={-420} y={0} width={840} height={bare ? 300 : 400} rx={22} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={6} />
			{bare ? null : (
				<>
					<rect x={-420} y={0} width={840} height={100} rx={22} fill="#d9372b" />
					<text x={0} y={72} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
						ТУРНИР ГОДА
					</text>
				</>
			)}
			{Array.from({length: 14}).map((_, i) => {
				const [cx, cy] = cell(i);
				return (
					<g key={i}>
						<rect x={cx - 50} y={cy - 50} width={100} height={100} rx={14} fill="#eef0f6" />
						{Math.abs(i - pos) < 0.7 ? null : (
							<text x={cx} y={cy + 20} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={800} fill="#4a5070">
								{15 + i}
							</text>
						)}
					</g>
				);
			})}
			<circle cx={px} cy={py} r={54 + snap * 10} fill="#d9372b" />
			<text x={px} y={py + 20} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#fff">
				{15 + Math.round(pos)}
			</text>
		</g>
	);
};

/* the channel's cloud: a pop-in without overshoot (an overshooting spring pushed the panel closer than 60 px to the edge) */
const Cloud: React.FC<{x: number; y: number; w: number; h: number; t: number; children?: React.ReactNode}> = ({x, y, w, h, t, children}) => {
	if (t < 0) return null;
	const k = interpolate(t, [0, 9], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const bob = Math.sin(t / 22) * 4;
	return (
		<g transform={`translate(${x},${y + bob}) scale(${0.85 + 0.15 * k})`} opacity={k}>
			<rect x={-w / 2 + 6} y={-h / 2 + 12} width={w} height={h} rx={26} fill="#000" opacity={0.18} style={{filter: 'blur(8px)'}} />
			<rect x={-w / 2 - 4} y={-h / 2 - 4} width={w + 8} height={h + 8} rx={30} fill="#1b1e2a" opacity={0.85} />
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill="#e4e6ec" />
			{children}
		</g>
	);
};

/* ------------------------------ shot wrapper (slow push, never static) ------------------------------ */
const ShotBox: React.FC<{start: number; len: number; dx?: number; z1?: number; children: React.ReactNode}> = ({start, len, dx = 24, z1 = 1.035, children}) => {
	const f = useCurrentFrame();
	const k = interpolate(f, [0, len], [0, 1], clamp);
	const z = 1 + (z1 - 1) * k;
	const ctx = {f, gf: start + f, dur: len, start, at: () => 0, end: () => 0};
	return (
		<ShotCtx.Provider value={ctx}>
			<AbsoluteFill>
				<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
					<g transform={`translate(${540 + dx * (0.5 - k)},960) scale(${z}) translate(-540,-960)`}>{children}</g>
				</svg>
			</AbsoluteFill>
		</ShotCtx.Provider>
	);
};

/* ------------------------------ A: hook (001) + title (002) ------------------------------ */
const octPts = (cx: number, cy: number, rx: number, ry: number) =>
	Array.from({length: 8}).map((_, i) => {
		const a = (Math.PI / 4) * i + Math.PI / 8;
		return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as [number, number];
	});
const ptsOf = (p: [number, number][]) => p.map((q) => q.join(',')).join(' ');
const ShotA: React.FC = () => {
	const {f} = useShot();
	const cx = 540;
	const cy = 1200;
	const outer = octPts(cx, cy, 500, 420);
	const inner = octPts(cx, cy, 410, 345);
	// the hall flickers: the light bursts and the sweeping beams; the camera drives in on the cage (background only, the panels stay put)
	const burst = Math.max(0, Math.sin(f / 3.1) * Math.sin(f / 7.3));
	const flick = 0.85 + 0.15 * Math.sin(f / 3) + 0.2 * burst;
	const push = 1 + 0.16 * interpolate(f, [0, 300], [0, 1], {...clamp, easing: ease});
	const sweep1 = 9 * Math.sin(f / 38);
	const sweep2 = -9 * Math.sin(f / 31 + 1);
	const titr = sp01(f, 8, 10) * (1 - sp01(f, 96, 10)); // the credit shows for the first 3 seconds only
	const title = sp01(f, T('002') - 4, 12);
	return (
		<g>
			<g transform={`translate(540,1000) scale(${push}) translate(-540,-1000)`}>
				<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#070914" />
				<Crowd seed="vtop" x0={-60} x1={1140} y0={30} y1={330} n={40} f={f * 1.4} color="#05070f" up={1} />
				<g transform="rotate(0 540 -60)">
					<polygon points="450,-60 630,-60 860,1180 220,1180" fill="#ffffff" opacity={0.12 * flick} />
				</g>
				<g transform={`rotate(${sweep1} 240 -60)`}>
					<polygon points="170,-60 310,-60 560,1250 20,1250" fill="#9fb4ff" opacity={0.1 + 0.08 * burst} />
				</g>
				<g transform={`rotate(${sweep2} 840 -60)`}>
					<polygon points="770,-60 910,-60 1060,1250 520,1250" fill="#ffd6a0" opacity={0.08 + 0.08 * (1 - burst)} />
				</g>
				<ellipse cx={cx} cy={cy + 10} rx={640} ry={560} fill="#0f1431" />
				<polygon points={ptsOf(outer)} fill="#1b1f33" />
				<polygon points={ptsOf(inner)} fill="#d6d9e6" />
				<polygon points={ptsOf(octPts(cx, cy, 330, 276))} fill="#2a3b78" opacity={0.85} />
				<ellipse cx={cx} cy={cy} rx={300} ry={230} fill="#ffffff" opacity={0.2 * flick} />
				<ellipse cx={cx} cy={cy} rx={170} ry={130} fill="none" stroke="#8fa3e8" strokeWidth={10} />
				{inner.map((p, i) => (
					<g key={i}>
						<line x1={p[0]} y1={p[1]} x2={p[0]} y2={p[1] - 130} stroke="#8c94ad" strokeWidth={9} />
						<line x1={p[0]} y1={p[1] - 130} x2={inner[(i + 1) % 8][0]} y2={inner[(i + 1) % 8][1] - 130} stroke="#8c94ad" strokeWidth={6} opacity={0.8} />
						<line x1={p[0]} y1={p[1]} x2={inner[(i + 1) % 8][0]} y2={inner[(i + 1) % 8][1]} stroke="#e7e9f2" strokeWidth={10} />
					</g>
				))}
				<Crowd seed="vbot" x0={-60} x1={1140} y0={1700} y1={1900} n={30} f={f * 1.4} color="#02030a" up={1} />
				{Array.from({length: 34}).map((_, i) => (
					<circle key={i} cx={random('vd' + i) * W + Math.sin(f / 40 + i) * 20} cy={(random('ve' + i) * H + f * (0.4 + random('vf' + i) * 0.6)) % H} r={1.5 + random('vg' + i) * 2.6} fill="#aebcff" opacity={0.45} />
				))}
				{/* hall light flashes */}
				<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#dfe8ff" opacity={0.07 * burst} />
			</g>
			{/* the credit over line 001: small, a third bigger than usual, first 3 seconds */}
			<g opacity={titr}>
				<rect x={100} y={TOP} width={880} height={176} rx={26} fill={NAVY} stroke="#ffc94a" strokeWidth={4} />
				<text x={540} y={TOP + 68} textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight={800} fill="#ffe9a8">
					В этой истории UFC
				</text>
				<text x={540} y={TOP + 136} textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight={800} fill="#ffe9a8">
					руководит вымышленный герой
				</text>
			</g>
			<g opacity={title} transform={`translate(0,${(1 - title) * 30})`}>
				<rect x={100} y={TOP} width={880} height={300} rx={30} fill={NAVY} stroke="#ffc94a" strokeWidth={5} />
				<text x={540} y={TOP + 86} textAnchor="middle" fontSize={76} fontFamily={FONT} fontWeight={900} fill="#fff">
					ЧТО ЕСЛИ БЫ ТЕБЕ
				</text>
				<text x={540} y={TOP + 176} textAnchor="middle" fontSize={76} fontFamily={FONT} fontWeight={900} fill="#fff">
					ОТДАЛИ UFC
				</text>
				<text x={540} y={TOP + 266} textAnchor="middle" fontSize={76} fontFamily={FONT} fontWeight={900} fill="#ffe08a">
					НА ОДИН ГОД?
				</text>
			</g>
			<VPlate x={540} tip={865} s={1.56} fade={sp01(f, 6, 10)} />
		</g>
	);
};

/* ------------------------------ B: the date is dragged a week (024, 025) ------------------------------ */
const ShotB: React.FC = () => {
	const {f, gf} = useShot();
	const drag = sp01(f, T('003', 50) - SHOT_STARTS[1], 34);
	const kp = gesture('point', idle(gf, 3), sp01(f, T('003', 30) - SHOT_STARTS[1], 12), gf);
	const smile = gf > T('004');
	return (
		<g>
			<OfficeWall />
			<Floor kind="wood" />
			<MiniCal y={TOP} s={0.95} pos={7 * drag} snap={drag > 0.98 ? 1 : 0} />
			<Actor who="hero" x={540} floor={FEET} s={HSC} facing={1} faceTurn={0.2} look={[0.2, -0.6]} mouth={smile ? 'smile' : 'smirk'} pose={kp} uid="vh1" />
			<VPlate x={540} />
		</g>
	);
};

/* ------------------------------ C: the channel answers, the date snaps back (026, 027) ------------------------------ */
const ShotC: React.FC = () => {
	const {f, gf} = useShot();
	const t0 = SHOT_STARTS[2];
	const snapK = sp01(f, T('006', 14) - t0, 14);
	const pos = 7 * (1 - snapK) + Math.sin(snapK * Math.PI) * -0.5;
	const snap = Math.max(0, 1 - Math.abs(f - (T('006', 28) - t0)) / 6);
	return (
		<g>
			<OfficeWall />
			<Floor kind="wood" />
			<MiniCal y={TOP} s={0.78} pos={Math.max(0, pos)} snap={snap} bare />
			<Cloud x={540} y={512} w={860} h={148} t={f - (T('005', 6) - t0)}>
				<g transform="translate(-318,6)">
					<TvLogo x={0} y={0} s={0.55} />
				</g>
				<text x={90} y={-6} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
					ЭФИР СТОИТ.
				</text>
				<text x={90} y={52} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#d9372b">
					ДАТА СТОИТ
				</text>
			</Cloud>
			<Actor who="hero" x={540} floor={FEET} s={HSC} facing={1} faceTurn={0.2} look={[0.2, -0.3]} mouth="flat" pose={idle(gf, 3)} uid="vh2" />
			<VPlate x={540} />
		</g>
	);
};

/* ------------------------------ D: «все двери закрыты» (078) ------------------------------ */
const Door: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y}) scale(0.8)`}>
		<rect x={-130} y={0} width={260} height={470} rx={10} fill="#5a3a22" stroke="#0d0d1c" strokeWidth={6} />
		<rect x={-100} y={34} width={200} height={170} rx={8} fill="#7a4f2e" />
		<rect x={-100} y={236} width={200} height={190} rx={8} fill="#7a4f2e" />
		<rect x={70} y={220} width={28} height={64} rx={8} fill="#e0c060" />
		<path d="M-34,205 L-34,176 A34,34 0 0 1 34,176 L34,205" fill="none" stroke="#c9c9d6" strokeWidth={14} />
		<rect x={-52} y={200} width={104} height={80} rx={14} fill="#d9372b" stroke="#0d0d1c" strokeWidth={5} />
		<circle cx={0} cy={236} r={12} fill="#0d0d1c" />
	</g>
);
const ShotD: React.FC = () => {
	const {f, gf} = useShot();
	const t0 = SHOT_STARTS[3];
	const slide = sp01(f, T('007', 14) - t0, 40);
	const pose = blend(idle(gf, 3), {...SIT, lean: -10}, slide);
	const seat = FEET - 157 * HSC + slide * (157 * HSC - 52 * HSC);
	return (
		<g>
			<OfficeWall night />
			<Floor kind="nightwood" />
			{[210, 540, 870].map((x) => (
				<Door key={x} x={x} y={TOP} />
			))}
			<Actor who="hero" x={540} floor={FEET} seat={seat} s={HSC} facing={1} faceTurn={0.2} look={[0.2, 0.5]} expr="worried" mouth="frown" pose={pose} shadow={false} uid="vh3" />
			<VPlate x={540} />
		</g>
	);
};

/* ------------------------------ E: the channel's price (084) ------------------------------ */
const ShotE: React.FC = () => {
	const {f, gf} = useShot();
	const t0 = SHOT_STARTS[4];
	const tc = f - (T('008', 10) - t0);
	return (
		<g>
			<OfficeWall night />
			<Floor kind="nightwood" />
			<Cloud x={540} y={TOP + 190} w={860} h={380} t={tc}>
				<g transform="translate(-300,-110)">
					<TvLogo x={0} y={0} s={0.7} />
				</g>
				<text x={70} y={-60} textAnchor="middle" fontSize={68} fontFamily={FONT} fontWeight={900} fill="#d9372b">
					НЕТ ИМЕНИ —
				</text>
				<text x={0} y={30} textAnchor="middle" fontSize={68} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
					НЕТ ЭФИРА.
				</text>
				<text x={0} y={120} textAnchor="middle" fontSize={68} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
					НЕТ ПРОДЛЕНИЯ
				</text>
			</Cloud>
			<Actor who="hero" x={540} floor={FEET} s={HSC} facing={1} faceTurn={0.2} look={[0.3, 0.5]} expr="worried" mouth="frown" pose={{...idle(gf, 3), head: 6}} uid="vh4" />
			<VPlate x={540} />
		</g>
	);
};

/* ------------------------------ F: the decision (092, 093, 094): the dark office of 084 stays ------------------------------ */
const ShotF: React.FC = () => {
	const {f, gf} = useShot();
	const t0 = SHOT_STARTS[5];
	const pop = spring({frame: f - (T('009', 2) - t0), fps: 30, config: {damping: 14, stiffness: 150}});
	const plaque = sp01(f, T('009', 14) - t0, 10);
	const btn = sp01(f, T('011', 6) - t0, 10);
	const press = gf > T('011', 30) ? 0.94 : 1;
	return (
		<g>
			<OfficeWall night />
			<Floor kind="nightwood" />
			<g transform={`translate(540,${TOP + 190}) scale(${0.7 + 0.3 * Math.min(1, pop)}) translate(-540,${-(TOP + 190)})`} opacity={Math.min(1, pop * 2)}>
				<rect x={110} y={TOP} width={860} height={380} rx={30} fill={NAVY} stroke="#ffc94a" strokeWidth={6} />
				<text x={540} y={TOP + 66} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#ffe08a">
					ГЛАВНЫЙ БОЙ
				</text>
				<Actor who="senya" x={320} floor={TOP + 222} s={0.36} facing={1} faceTurn={0.4} look={[0.8, 0]} pose={idle(gf, 5)} shadow={false} uid="vsn" />
				<Actor who="tayo" x={760} floor={TOP + 222} s={0.36} facing={-1} faceTurn={0.4} look={[-0.8, 0]} pose={idle(gf, 6)} shadow={false} uid="vty" />
				<text x={320} y={TOP + 276} textAnchor="middle" fontSize={52} fontFamily={FONT} fontWeight={900} fill="#fff">
					СЕНЯ
				</text>
				<text x={760} y={TOP + 276} textAnchor="middle" fontSize={52} fontFamily={FONT} fontWeight={900} fill="#fff">
					ТАЙО
				</text>
				<g opacity={plaque} transform={`translate(0,${(1 - plaque) * 24})`}>
					<rect x={140} y={TOP + 298} width={800} height={64} rx={14} fill="#d9372b" />
					<text x={540} y={TOP + 346} textAnchor="middle" fontSize={52} fontFamily={FONT} fontWeight={900} fill="#fff">
						НИКОМУ НЕ ИЗВЕСТНЫ
					</text>
				</g>
			</g>
			<g opacity={btn} transform={`translate(740,${TOP + 440}) scale(${press}) translate(-740,${-(TOP + 440)})`}>
				<rect x={520} y={TOP + 404} width={440} height={72} rx={36} fill="#1f9d55" stroke="#0d0d1c" strokeWidth={5} />
				<text x={740} y={TOP + 456} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#fff">
					ОТПРАВИТЬ
				</text>
			</g>
			<Actor who="hero" x={300} floor={FEET} s={HSC} facing={1} faceTurn={0.25} look={[0.5, -0.4]} mouth={gf > T('011') ? 'smirk' : 'open'} pose={gesture('presentF', idle(gf, 3), sp01(f, T('009', 6) - t0, 10) * (gf < T('011') ? 1 : 0), gf)} uid="vh5" />
			<VPlate x={300} />
			<Actor who="irma" x={780} floor={FEET} s={1.4} facing={-1} faceTurn={0.25} look={[-0.4, 0.2]} expr={gf >= T('010') ? 'wide' : 'normal'} mouth="flat" pose={idle(gf, 1)} uid="vi5" />
		</g>
	);
};

/* ------------------------------ G: the hall chants (121), then the phone and the channel's cloud (125) ------------------------------ */
const Chant: React.FC<{x: number; y: number; t: string; k: number; size: number; rot: number}> = ({x, y, t, k, size, rot}) =>
	k <= 0 ? null : (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${0.6 + 0.4 * Math.min(1, k * 2)})`} opacity={Math.min(1, k * 2.5)}>
			<text textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill="#fff" stroke="#11142c" strokeWidth={14} paintOrder="stroke">
				{t}
			</text>
		</g>
	);
const ShotG: React.FC = () => {
	const {f, gf} = useShot();
	const t0 = SHOT_STARTS[6];
	const tNext = T('013') - 4 - t0; // the chants make room for the channel's cloud
	const chants = 1 - sp01(f, tNext - 8, 8);
	const tc = f - (T('013', 8) - t0);
	const wipe = sp01(f, T('013', 6) - t0, 10);
	return (
		<g>
			<ArenaWall up={1} />
			<Floor kind="mat" />
			<g opacity={chants}>
				<Chant x={540} y={TOP + 170} t="СЕ-НЯ!" k={sp01(f, T('012', 10) - t0, 8)} size={170} rot={-4} />
				<Chant x={540} y={TOP + 350} t="СЕ-НЯ!" k={sp01(f, T('012', 44) - t0, 8)} size={120} rot={3} />
			</g>
			<Cloud x={540} y={TOP + 140} w={880} h={280} t={tc}>
				<g transform="translate(-350,8)">
					<TvLogo x={0} y={0} s={0.7} />
				</g>
				<text x={100} y={-6} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
					РЕКОРДНЫЙ ЭФИР.
				</text>
				<text x={100} y={66} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#d9372b">
					ПРОДЛЕВАЕМ.
				</text>
			</Cloud>
			<Actor who="hero" x={330} floor={FEET} s={HSC} facing={1} faceTurn={0.3} look={[0.6, -0.2]} mouth={gf < T('013') ? 'open' : 'smile'} pose={gf < T('013') ? gesture('fist', idle(gf, 3), 0.8, gf) : gesture('touchFace', idle(gf, 3), wipe, gf)} uid="vh6" />
			<VPlate x={330} />
			<Actor who="senya" x={730} floor={FEET} s={HSC} facing={-1} faceTurn={0.3} look={[-0.3, -0.5]} mouth="smile" pose={gesture('wave', idle(gf, 5), 1, gf)} uid="vs6" />
		</g>
	);
};

/* ------------------------------ final card: takes over BEFORE line 126 starts and holds to the end ------------------------------ */
const ShotCard: React.FC = () => {
	const {f, gf} = useShot();
	const cx = 540;
	const cy = 1085;
	const outer = octPts(cx, cy, 430, 235);
	const inner = octPts(cx, cy, 345, 190);
	const burst = Math.max(0, Math.sin(f / 3.1) * Math.sin(f / 7.3));
	const flick = 0.85 + 0.15 * Math.sin(f / 3) + 0.2 * burst;
	const beam = 7 * Math.sin(f / 40);
	const breathe = 1 + 0.012 * Math.sin(f / 14);
	const pill = sp01(f, 50, 14); // the channel line arrives while the question is being asked
	const push = 1 + 0.06 * interpolate(f, [0, SHORT_TOTAL - CARD0], [0, 1], clamp);
	return (
		<g>
			<defs>
				<radialGradient id="cardbg" cx="0.5" cy="0.4" r="0.8">
					<stop offset="0" stopColor="#1a2150" />
					<stop offset="1" stopColor="#05060f" />
				</radialGradient>
			</defs>
			<g transform={`translate(540,1100) scale(${push}) translate(-540,-1100)`}>
				<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#cardbg)" />
				<g transform={`rotate(${beam} 540 700)`}>
					<polygon points="470,700 610,700 880,1200 200,1200" fill="#fff" opacity={0.12 * flick} />
				</g>
				<Crowd seed="vcard" x0={-60} x1={1140} y0={1560} y1={1880} n={34} f={gf * 1.3} color="#02030a" up={1} />
				<polygon points={ptsOf(outer)} fill="#1b1f33" />
				<polygon points={ptsOf(inner)} fill="#cfd3e4" />
				<ellipse cx={cx} cy={cy} rx={230} ry={120} fill="#fff" opacity={0.28 * flick} />
				{inner.map((p, i) => (
					<g key={i}>
						<line x1={p[0]} y1={p[1]} x2={p[0]} y2={p[1] - 100} stroke="#8c94ad" strokeWidth={8} />
						<line x1={p[0]} y1={p[1] - 100} x2={inner[(i + 1) % 8][0]} y2={inner[(i + 1) % 8][1] - 100} stroke="#8c94ad" strokeWidth={6} opacity={0.8} />
						<line x1={p[0]} y1={p[1]} x2={inner[(i + 1) % 8][0]} y2={inner[(i + 1) % 8][1]} stroke="#e7e9f2" strokeWidth={9} />
					</g>
				))}
				<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#dfe8ff" opacity={0.05 * burst} />
			</g>
			{/* the whole question is on screen from the first frame of line 126 */}
			<g transform={`translate(540,420) scale(${breathe}) translate(-540,-420)`}>
				<text x={540} y={290} textAnchor="middle" fontSize={100} fontFamily={FONT} fontWeight={900} fill="#fff" stroke="#05060f" strokeWidth={12} paintOrder="stroke">
					КОГО ТЫ
				</text>
				<text x={540} y={400} textAnchor="middle" fontSize={100} fontFamily={FONT} fontWeight={900} fill="#fff" stroke="#05060f" strokeWidth={12} paintOrder="stroke">
					ПОСТАВИШЬ
				</text>
				<text x={540} y={516} textAnchor="middle" fontSize={92} fontFamily={FONT} fontWeight={900} fill="#ffe08a" stroke="#05060f" strokeWidth={12} paintOrder="stroke">
					В ГЛАВНЫЙ БОЙ?
				</text>
				<text x={540} y={620} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={800} fill="#cfd6ff">
					ТОГО, КОГО ЗНАЮТ,
				</text>
				<text x={540} y={688} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={800} fill="#cfd6ff">
					ИЛИ ТОГО, КТО
				</text>
				<text x={540} y={756} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={800} fill="#cfd6ff">
					ГОТОВ ВСЕГДА?
				</text>
			</g>
			<g opacity={pill}>
				<rect x={90} y={1330} width={780} height={100} rx={32} fill={NAVY} stroke="#ffc94a" strokeWidth={5} />
				<text x={480} y={1396} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={800} fill="#ffe9a8">
					Полная история на канале
				</text>
			</g>
		</g>
	);
};

/* ------------------------------ assembly ------------------------------ */
const SHOTS: React.FC[] = [ShotA, ShotB, ShotC, ShotD, ShotE, ShotF, ShotG, ShotCard];
export const ShortV: React.FC = () => {
	return (
		<TalkOverride.Provider value={(sp, gf) => talkAt(sp, gf)}>
			{SHOTS.map((C, i) => {
				const start = SHOT_STARTS[i];
				const end = i + 1 < SHOT_STARTS.length ? SHOT_STARTS[i + 1] : SHORT_TOTAL;
				return (
					<Sequence key={i} from={start} durationInFrames={end - start} name={`plan ${i + 1}`}>
						<ShotBox start={start} len={end - start} dx={i === SHOTS.length - 1 ? 0 : 24} z1={i === SHOTS.length - 1 ? 1.02 : 1.035}>
							<C />
						</ShotBox>
					</Sequence>
				);
			})}
		</TalkOverride.Provider>
	);
};
export {speakerAt, PLATE_H};
