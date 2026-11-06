import React from 'react';
import {interpolate, random} from 'remotion';
import {Stickman} from '../engine/Stickman';
import {FONT, HAND} from '../kit/ui';
import {clamp} from '../kit/kit';
import {CAST} from './cast';
import {Crowd, SafeBox} from './places';

/* Places and props for parts 4–6 (voting, buying the stars, the two rookies get dropped).
   Same rules as places.tsx: world 1920×1080, floor y = 900, nothing under 40 px. */

const NAVY = '#11142c';

/* ------------------------------ part 4: the stream and the vote ------------------------------ */
export const Cursor: React.FC<{x: number; y: number; press?: number}> = ({x, y, press = 0}) => (
	<g transform={`translate(${x},${y}) scale(${1 - 0.12 * press})`}>
		<path d="M0,0 L0,92 L26,70 L44,110 L64,100 L46,62 L80,60 Z" fill="#fff" stroke="#0d0d1c" strokeWidth={6} strokeLinejoin="round" />
	</g>
);

/* the stream window: subscribers, a question, a big yellow button */
export const StreamScreen: React.FC<{x: number; y: number; s?: number; press: number; f: number; off?: number}> = ({x, y, s = 1, press, f, off = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-480} y={-290} width={960} height={580} rx={34} fill={NAVY} stroke="#8fa3e8" strokeWidth={6} />
		<rect x={-452} y={-236} width={904} height={500} rx={20} fill={off > 0.5 ? '#07080f' : '#1d2b6b'} />
		{off > 0.5 ? null : (
			<g>
				<circle cx={-440} cy={-262} r={11} fill="#ff4b4b" opacity={0.55 + 0.45 * Math.sin(f / 5)} />
				<text x={-414} y={-246} fontSize={44} fontFamily={FONT} fontWeight={800} fill="#fff">
					ПРЯМОЙ ЭФИР
				</text>
				<text x={0} y={238} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={800} fill="#ffe08a">
					3 000 000 ПОДПИСЧИКОВ
				</text>
				<text x={0} y={-96} textAnchor="middle" fontSize={72} fontFamily={FONT} fontWeight={900} fill="#fff">
					КАКОЙ БОЙ ХОТИТЕ?
				</text>
				<g transform={`translate(0,${70 + press * 6}) scale(${1 + 0.04 * Math.sin(f / 6) - 0.05 * press})`}>
					<rect x={-300} y={-72} width={600} height={144} rx={40} fill="#ffc94a" stroke="#0d0d1c" strokeWidth={6} />
					<text x={0} y={22} textAnchor="middle" fontSize={78} fontFamily={FONT} fontWeight={900} fill="#11142c">
						ГОЛОСОВАТЬ
					</text>
				</g>
			</g>
		)}
	</g>
);

export const Kangaroo: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-70,40 C-130,40 -150,-10 -120,-30 L-96,-10 C-80,0 -70,10 -60,20 Z" fill="#d9a066" stroke="#0d0d1c" strokeWidth={5} />
		<ellipse cx={-10} cy={0} rx={62} ry={78} fill="#d9a066" stroke="#0d0d1c" strokeWidth={5} />
		<ellipse cx={0} cy={24} rx={30} ry={30} fill="#b9814a" />
		<ellipse cx={20} cy={-90} rx={34} ry={38} fill="#d9a066" stroke="#0d0d1c" strokeWidth={5} />
		<ellipse cx={4} cy={-142} rx={11} ry={32} fill="#d9a066" stroke="#0d0d1c" strokeWidth={5} />
		<ellipse cx={34} cy={-142} rx={11} ry={32} fill="#d9a066" stroke="#0d0d1c" strokeWidth={5} />
		<circle cx={32} cy={-96} r={5} fill="#0d0d1c" />
		<path d="M-8,70 L-30,118 L20,118 L26,100 Z" fill="#d9a066" stroke="#0d0d1c" strokeWidth={5} strokeLinejoin="round" />
		<path d="M50,-20 L96,-6 L90,14 L48,10 Z" fill="#d9a066" stroke="#0d0d1c" strokeWidth={5} />
	</g>
);

/* vote chart: two bars (everything else, the kangaroo), grows with k1/k2 (0..1) */
export const VoteChart: React.FC<{x: number; y: number; s?: number; k1: number; k2: number; total: number}> = ({x, y, s = 1, k1, k2, total}) => {
	const nf = (n: number) => {
		const t = String(Math.round(n));
		let o = '';
		for (let i = 0; i < t.length; i++) o += (i > 0 && (t.length - i) % 3 === 0 ? '\u00A0' : '') + t[i];
		return o;
	};
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<rect x={-560} y={-330} width={1120} height={660} rx={34} fill={NAVY} stroke="#8fa3e8" strokeWidth={6} />
			<text x={-520} y={-246} fontSize={60} fontFamily={FONT} fontWeight={900} fill="#fff">
				ГОЛОСОВ:
			</text>
			<text x={520} y={-246} textAnchor="end" fontSize={72} fontFamily={FONT} fontWeight={900} fill="#ffe08a">
				{nf(total)}
			</text>
			<text x={-520} y={-120} fontSize={46} fontFamily={FONT} fontWeight={800} fill="#c9d3ff">
				ВСЕ ОСТАЛЬНЫЕ БОИ
			</text>
			<rect x={-520} y={-96} width={1040} height={84} rx={20} fill="#242a5a" />
			<rect x={-520} y={-96} width={1040 * 0.6 * k1} height={84} rx={20} fill="#3fae4f" />
			<text x={-520 + 1040 * 0.6 * k1 + 20} y={-36} fontSize={52} fontFamily={FONT} fontWeight={900} fill="#fff" opacity={k1 > 0.3 ? 1 : 0}>
				{nf(1600000 * k1)}
			</text>
			<text x={-520} y={80} fontSize={46} fontFamily={FONT} fontWeight={800} fill="#ffd0c8">
				КЕНГУРУ
			</text>
			<rect x={-520} y={104} width={1040} height={84} rx={20} fill="#242a5a" />
			<rect x={-520} y={104} width={1040 * 0.15 * k2} height={84} rx={20} fill="#ff6a5a" />
			<text x={-520 + 1040 * 0.15 * k2 + 20} y={164} fontSize={52} fontFamily={FONT} fontWeight={900} fill="#fff" opacity={k2 > 0.3 ? 1 : 0}>
				{nf(400000 * k2)}
			</text>
			<g opacity={interpolate(k2, [0.5, 0.9], [0, 1], clamp)}>
				<Kangaroo x={380} y={170} s={0.8} />
			</g>
		</g>
	);
};

/* a fighter card: coloured frame, a head-and-shoulders portrait (clipped), a name band */
export const Portrait: React.FC<{who: 'rex' | 'voron'; x: number; y: number; s?: number; name: string; tilt?: number; flip?: boolean; id: string}> = ({who, x, y, s = 1, name, tilt = 0, flip, id}) => {
	const c = CAST[who];
	return (
		<g transform={`translate(${x},${y}) rotate(${tilt}) scale(${s})`}>
			<rect x={-230} y={-300} width={460} height={600} rx={28} fill={NAVY} stroke="#ffc94a" strokeWidth={8} />
			<clipPath id={'pc' + id}>
				<rect x={-214} y={-284} width={428} height={440} rx={18} />
			</clipPath>
			<g clipPath={`url(#pc${id})`}>
				<rect x={-214} y={-284} width={428} height={440} fill={who === 'rex' ? '#7a2630' : '#26308a'} />
				<g transform={`translate(0,160) scale(${flip ? -1 : 1},1)`}>
					<Stickman id={'pt' + id} x={0} y={0} facing={1} pose={{lean: 0, head: 0, armB: [-6, 10], armF: [6, 10], legB: [0, 0], legF: [0, 0]}} {...c} scale={2.1} hideLegs mouth="smirk" faceTurn={0} look={[0, 0]} />
				</g>
			</g>
			<text x={0} y={250} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#fff">
				{name}
			</text>
		</g>
	);
};

/* a gold champion belt as a prop */
export const BeltProp: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-260} y={-34} width={520} height={68} rx={20} fill="#2a1d0a" stroke="#0d0d1c" strokeWidth={5} />
		<rect x={-250} y={-24} width={500} height={48} rx={14} fill="#caa23a" />
		<rect x={-84} y={-80} width={168} height={160} rx={44} fill="#ffd34a" stroke="#0d0d1c" strokeWidth={6} />
		<circle cx={0} cy={0} r={40} fill="#e7a91c" stroke="#0d0d1c" strokeWidth={5} />
		<circle cx={0} cy={0} r={16} fill="#fff3c0" />
	</g>
);

export const Sparks: React.FC<{x: number; y: number; t: number; n?: number; r?: number}> = ({x, y, t, n = 18, r = 260}) =>
	t < 0 || t > 30 ? null : (
		<g>
			{Array.from({length: n}).map((_, i) => {
				const a = (i / n) * Math.PI * 2 + random('sp' + i) * 0.5;
				const d = (0.2 + t / 30) * r * (0.5 + random('sd' + i));
				return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d} r={Math.max(1, 9 * (1 - t / 30))} fill={i % 2 ? '#ffe08a' : '#ffffff'} opacity={1 - t / 30} />;
			})}
		</g>
	);

export const Bolt: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<polygon points="30,-150 -60,20 -4,20 -34,150 70,-40 8,-40" fill="#ffe08a" stroke="#0d0d1c" strokeWidth={6} strokeLinejoin="round" />
	</g>
);

/* press conference: backdrop, a table with microphones, camera flashes */
export const PressRoom: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1400} fill="#1b2150" />
		<rect x={-500} y={900} width={2920} height={400} fill="#0e1130" />
		{Array.from({length: 7}).map((_, r) =>
			Array.from({length: 4}).map((__, c) => (
				<g key={r + '_' + c} transform={`translate(${60 + r * 290},${120 + c * 170})`} opacity={0.5}>
					<rect width={150} height={64} rx={14} fill="#2f3b86" />
					<rect x={160} y={0} width={110} height={64} rx={14} fill="#2f3b86" />
				</g>
			))
		)}
		<rect x={440} y={640} width={1040} height={40} rx={10} fill="#6b4a2c" />
		<rect x={470} y={680} width={26} height={220} fill="#4f361f" />
		<rect x={1424} y={680} width={26} height={220} fill="#4f361f" />
		{[760, 960, 1160].map((x) => (
			<g key={x}>
				<rect x={x - 5} y={560} width={10} height={80} fill="#222" />
				<ellipse cx={x} cy={552} rx={22} ry={28} fill="#333" stroke="#8fa3e8" strokeWidth={4} />
			</g>
		))}
		<Crowd seed="press" x0={-100} x1={2020} y0={960} y1={1100} n={12} f={f} color="#05060f" up={0.6} />
	</g>
);

/* a white camera-flash burst (screen space of the world layer) */
export const FlashBurst: React.FC<{x: number; y: number; t: number; r?: number}> = ({x, y, t, r = 160}) =>
	t < 0 || t > 8 ? null : (
		<g opacity={1 - t / 8}>
			<circle cx={x} cy={y} r={r * (0.4 + t / 8)} fill="#fff" opacity={0.85} />
			{Array.from({length: 8}).map((_, i) => (
				<line key={i} x1={x} y1={y} x2={x + Math.cos((i * Math.PI) / 4) * r * 1.6} y2={y + Math.sin((i * Math.PI) / 4) * r * 1.6} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
			))}
		</g>
	);

/* ratings table: three rows; the third is handwritten (Caveat). */
export const RatingBoard: React.FC<{x: number; y: number; s?: number; hand: number; f: number; away?: number; off?: number}> = ({x, y, s = 1, hand, f, away = 0, off = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-600} y={-340} width={1200} height={680} rx={34} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={6} />
		<rect x={-600} y={-340} width={1200} height={100} rx={34} fill="#2a2f4a" />
		<text x={0} y={-270} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#fff">
			ЧЕГО ХОТЯТ ЗРИТЕЛИ
		</text>
		<text x={-560} y={-130} fontSize={60} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
			1
		</text>
		<text x={-480} y={-130} fontSize={58} fontFamily={FONT} fontWeight={800} fill="#2a2f4a">
			Рекс — Ворон
		</text>
		<rect x={-560} y={-100} width={1120} height={20} rx={10} fill="#3fae4f" />
		<text x={-560} y={30} fontSize={60} fontFamily={FONT} fontWeight={900} fill="#9aa0b8">
			2
		</text>
		<rect x={-480} y={-6} width={560} height={30} rx={15} fill="#cdd1de" />
		<rect x={-560} y={50} width={760} height={20} rx={10} fill="#cdd1de" />
		<g transform={`translate(${away * 1100},${-away * 260}) rotate(${away * 24} -560 196)`} opacity={1 - away * 0.4}>
			<text x={-560} y={190} fontSize={60} fontFamily={FONT} fontWeight={900} fill="#d9372b">
				3
			</text>
			<clipPath id="hw">
				<rect x={-490 - 20} y={120} width={1100 * hand} height={120} />
			</clipPath>
			<g clipPath="url(#hw)">
				<text x={-480} y={196} fontSize={84} fontFamily={HAND} fontWeight={700} fill="#1d2b6b" transform="rotate(-2 -480 196)">
					Реванш. Галкин — Адеби
				</text>
			</g>
			<rect x={-560} y={236} width={1120 * Math.min(1, hand * 1.2) * 0.2} height={20} rx={10} fill="#ff6a5a" />
			<text x={560} y={196} textAnchor="end" fontSize={52} fontFamily={FONT} fontWeight={900} fill="#d9372b" opacity={hand > 0.9 ? 1 : 0}>
				40 000
			</text>
		</g>
		{off > 0 ? (
			<g opacity={off}>
				<rect x={-600} y={-340} width={1200} height={680} rx={34} fill="#07080f" />
				<circle cx={-60} cy={-20} r={14} fill="#ff4b4b" />
				<text x={-30} y={-6} fontSize={56} fontFamily={FONT} fontWeight={800} fill="#c9d3ff">
					ЭФИР ВЫКЛЮЧЕН
				</text>
			</g>
		) : null}
	</g>
);

/* ------------------------------ part 5: buying stars ------------------------------ */
export const Card: React.FC<{x: number; y: number; rot: number; c: string; s?: number}> = ({x, y, rot, c, s = 1}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-52} y={-72} width={104} height={144} rx={12} fill={c} stroke="#0d0d1c" strokeWidth={5} />
		<circle cx={0} cy={-18} r={26} fill="#0d0d1c" />
		<circle cx={-9} cy={-22} r={6} fill="#fff" />
		<circle cx={9} cy={-22} r={6} fill="#fff" />
		<rect x={-38} y={26} width={76} height={26} rx={8} fill="#fff" opacity={0.85} />
	</g>
);
const CARD_COLORS = ['#c43d4b', '#2f6fd8', '#3fae4f', '#8b4fd6', '#f2b21c', '#1fb5a8', '#ee7fb0', '#e8eef2'];
/* cards dealt like patience: n cards on the table, the last ones fall over the edge */
export const CardsOnTable: React.FC<{x0: number; x1: number; y: number; n: number; f: number}> = ({x0, x1, y, n, f}) => (
	<g>
		{Array.from({length: n}).map((_, i) => {
			const r1 = random('cd' + i);
			const r2 = random('ce' + i);
			const col = i % 9;
			const row = Math.floor(i / 9);
			const px = x0 + (x1 - x0) * (col / 8) + (r1 - 0.5) * 40;
			const py = y + row * 70 + (r2 - 0.5) * 24;
			const over = px > x1 - 30 || row >= 2;
			const fall = over ? Math.max(0, (f - i * 3 - 20) * 2.2) : 0;
			return <Card key={i} x={px + fall * 0.4} y={py + fall * fall * 0.03} rot={(r1 - 0.5) * 36 + fall * 0.8} c={CARD_COLORS[i % 8]} s={0.9} />;
		})}
	</g>
);

export const Cheque: React.FC<{x: number; y: number; s?: number; rot?: number; text?: string}> = ({x, y, s = 1, rot = 0, text = 'ЧЕК'}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-200} y={-90} width={400} height={180} rx={14} fill="#f1ead8" stroke="#0d0d1c" strokeWidth={6} />
		<rect x={-200} y={-90} width={400} height={46} fill="#3fae4f" />
		<text x={0} y={-52} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#fff">
			{text}
		</text>
		<rect x={-170} y={-10} width={240} height={16} rx={8} fill="#cdd1de" />
		<rect x={-170} y={26} width={140} height={16} rx={8} fill="#cdd1de" />
		<text x={150} y={50} textAnchor="end" fontSize={60} fontFamily={HAND} fontWeight={700} fill="#1d2b6b">
			$$$
		</text>
	</g>
);

export const Pen: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = -35}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-12} y={-150} width={24} height={150} rx={8} fill="#1d2b6b" stroke="#0d0d1c" strokeWidth={4} />
		<polygon points="-12,0 12,0 0,36" fill="#e8eef2" stroke="#0d0d1c" strokeWidth={4} />
	</g>
);

/* the stamp of a done deal */
export const Scribble: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
	<g transform={`translate(${x},${y})`}>
		<clipPath id={'sc' + Math.round(x)}>
			<rect x={-10} y={-80} width={440 * k} height={160} />
		</clipPath>
		<g clipPath={`url(#sc${Math.round(x)})`}>
			<path d="M0,20 C30,-60 60,60 90,-20 C110,-60 140,40 170,-10 C200,-50 230,30 260,0 C300,-40 340,40 420,-20" stroke="#1d2b6b" strokeWidth={14} fill="none" strokeLinecap="round" />
		</g>
	</g>
);

/* an open lot with a yellow bulldozer; Rex sits in the cab (draw him above `cab` seat). */
export const Yard: React.FC = () => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1300} fill="#9fd0ff" />
		<rect x={-500} y={560} width={2920} height={500} fill="#c8b27a" />
		<rect x={-500} y={886} width={2920} height={400} fill="#8a7a52" />
		<ellipse cx={300} cy={180} rx={160} ry={50} fill="#fff" opacity={0.9} />
		<ellipse cx={1500} cy={120} rx={200} ry={56} fill="#fff" opacity={0.9} />
		<polygon points="-100,560 300,420 700,560" fill="#b5a068" />
		<polygon points="1400,560 1800,400 2200,560" fill="#b5a068" />
	</g>
);
export const Bulldozer: React.FC<{x: number; s?: number; blade?: number}> = ({x, s = 1, blade = 0}) => (
	<g transform={`translate(${x},900) scale(${s})`}>
		<rect x={-260} y={-90} width={520} height={90} rx={44} fill="#2b2b30" stroke="#0d0d1c" strokeWidth={6} />
		{[-190, -95, 0, 95, 190].map((cx) => (
			<circle key={cx} cx={cx} cy={-45} r={26} fill="#46464f" stroke="#0d0d1c" strokeWidth={4} />
		))}
		<rect x={-220} y={-250} width={420} height={170} rx={16} fill="#f2b21c" stroke="#0d0d1c" strokeWidth={6} />
		<rect x={-80} y={-420} width={230} height={180} rx={14} fill="#f2b21c" stroke="#0d0d1c" strokeWidth={6} />
		<rect x={-52} y={-396} width={176} height={130} rx={10} fill="#9fd0ff" stroke="#0d0d1c" strokeWidth={5} />
		<rect x={-250} y={-300} width={40} height={60} fill="#444" />
		<g transform={`translate(0,${blade * -30})`}>
			<rect x={230} y={-210} width={36} height={170} rx={10} fill="#2b2b30" />
			<polygon points="266,-220 340,-200 340,-20 266,-30" fill="#d9372b" stroke="#0d0d1c" strokeWidth={6} strokeLinejoin="round" />
		</g>
	</g>
);

/* the tablet's card grid, enlarged: 8 slots, more cards than slots */
export const KardGrid: React.FC<{x: number; y: number; s?: number; k: number}> = ({x, y, s = 1, k}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-380} y={-290} width={760} height={580} rx={30} fill={NAVY} stroke="#1fb5a8" strokeWidth={8} />
		<text x={-340} y={-226} fontSize={50} fontFamily={FONT} fontWeight={900} fill="#c9fff6">
			КАРД ТУРНИРА
		</text>
		{Array.from({length: 8}).map((_, i) => (
			<rect key={i} x={-340 + (i % 4) * 172} y={-170 + Math.floor(i / 4) * 150} width={150} height={128} rx={14} fill="#1e2c55" stroke="#3a4a8a" strokeWidth={4} />
		))}
		{Array.from({length: 14}).map((_, i) => {
			const slot = i < 8;
			const px = slot ? -265 + (i % 4) * 172 : -300 + ((i - 8) % 3) * 220 + 90;
			const py = slot ? -106 + Math.floor(i / 4) * 150 : 215 + Math.floor((i - 8) / 3) * 36;
			const t = Math.max(0, Math.min(1, k * 14 - i));
			return <Card key={i} x={px + (1 - t) * (i % 2 ? 320 : -320)} y={py - (1 - t) * 20} rot={slot ? 0 : (i % 3) * 7 - 7} c={CARD_COLORS[i % 8]} s={slot ? 0.8 : 0.72} />;
		})}
	</g>
);

/* ------------------------------ star on holiday ------------------------------ */
export const Beach: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1300} fill="#7fd0ff" />
		<circle cx={1650} cy={170} r={110} fill="#ffe27a" />
		<rect x={-500} y={560} width={2920} height={140} fill="#3aa0d8" />
		<path d={`M-500,700 Q300,${660 + 20 * Math.sin(f / 18)} 960,700 T2420,700 L2420,720 L-500,720 Z`} fill="#6ccaf0" opacity={0.8} />
		<rect x={-500} y={700} width={2920} height={600} fill="#f0d79a" />
		<rect x={-500} y={886} width={2920} height={400} fill="#e2c883" />
	</g>
);
export const Umbrella: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},0)`}>
		<rect x={-6} y={520} width={12} height={380} fill="#6b4a2c" />
		<path d="M-250,540 Q0,330 250,540 Z" fill="#ee4d5c" stroke="#0d0d1c" strokeWidth={6} />
		<path d="M-250,540 Q-170,470 -100,540 Q-40,470 40,540 Q110,470 170,540 Q210,500 250,540" fill="#fff" opacity={0.9} />
	</g>
);
export const Steam: React.FC<{x: number; y: number; f: number; n?: number}> = ({x, y, f, n = 7}) => (
	<g>
		{Array.from({length: n}).map((_, i) => {
			const t = ((f * 1.6 + i * 23) % 80) / 80;
			return <circle key={i} cx={x + (random('st' + i) - 0.5) * 120 + Math.sin(f / 7 + i) * 14} cy={y - t * 220} r={20 + t * 26} fill="#fff" opacity={0.75 * Math.sin(t * Math.PI)} />;
		})}
	</g>
);

/* the big floor scale with a screen */
export const BigScale: React.FC<{x: number; s?: number; text: string; c: string; id: string}> = ({x, s = 1, text, c, id}) => (
	<g transform={`translate(${x},900) scale(${s})`}>
		<rect x={-130} y={-34} width={260} height={34} rx={12} fill="#2c2f3a" />
		<rect x={-110} y={-48} width={220} height={20} rx={8} fill="#cfd7e6" />
		<rect x={196} y={-330} width={28} height={296} fill="#2c2f3a" />
		<rect x={70} y={-480} width={300} height={150} rx={18} fill="#0b0d1c" stroke="#8fa3e8" strokeWidth={5} id={id} />
		<text x={220} y={-374} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill={c}>
			{text}
		</text>
	</g>
);
export const WeighRoom: React.FC = () => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1300} fill="#dfe7ee" />
		<rect x={-500} y={900} width={2920} height={400} fill="#9aa6b2" />
		{Array.from({length: 24}).map((_, i) => (
			<line key={i} x1={-500 + i * 130} y1={900} x2={-700 + i * 190} y2={1100} stroke="#7f8b97" strokeWidth={3} opacity={0.6} />
		))}
		{[160, 1760].map((x) => (
			<g key={x}>
				<rect x={x - 40} y={300} width={80} height={600} fill="#c3ccd6" />
			</g>
		))}
	</g>
);

/* glass wall onto the training room: two bags, each fighter in his own corner */
export const TrainRoom: React.FC<{x: number; w: number; f: number}> = ({x, w, f}) => (
	<g>
		<rect x={x} y={300} width={w} height={600} fill="#2b3350" />
		<rect x={x} y={860} width={w} height={40} fill="#56627f" />
		{[0.22, 0.78].map((k, i) => (
			<g key={i} transform={`translate(${x + w * k},0) rotate(${Math.sin(f / 4 + i * 2) * 6} 0 330)`}>
				<line x1={0} y1={330} x2={0} y2={460} stroke="#bbb" strokeWidth={6} />
				<rect x={-44} y={460} width={88} height={250} rx={34} fill="#c43d4b" stroke="#0d0d1c" strokeWidth={5} />
			</g>
		))}
		<rect x={x} y={300} width={w} height={600} fill="#bfe6ff" opacity={0.16} />
		<rect x={x - 12} y={288} width={w + 24} height={624} fill="none" stroke="#cdd6ff" strokeWidth={14} rx={10} />
		<line x1={x + w / 2} y1={300} x2={x + w / 2} y2={900} stroke="#cdd6ff" strokeWidth={10} opacity={0.7} />
	</g>
);

/* the fight card on a big screen: stars, then the struck-out rookies */
export const CardList: React.FC<{x: number; y: number; s?: number; k: number}> = ({x, y, s = 1, k}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-520} y={-320} width={1040} height={640} rx={32} fill={NAVY} stroke="#8fa3e8" strokeWidth={6} />
		<text x={-480} y={-250} fontSize={56} fontFamily={FONT} fontWeight={900} fill="#c9d3ff">
			КАРД ТУРНИРА
		</text>
		{['РЕКС — ВОРОН', 'ЗВЕЗДА — ЗВЕЗДА', 'ЗВЕЗДА — ЗВЕЗДА', 'ЗВЕЗДА — ЗВЕЗДА'].map((t, i) => (
			<text key={i} x={-480} y={-150 + i * 90} fontSize={56} fontFamily={FONT} fontWeight={800} fill="#fff">
				{t}
			</text>
		))}
		<text x={-480} y={210} fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
			ГАЛКИН — АДЕБИ
		</text>
		<line x1={-500} y1={192} x2={-500 + 760 * k} y2={192} stroke="#ff4b4b" strokeWidth={14} strokeLinecap="round" />
		<line x1={-500} y1={170} x2={-500 + 760 * Math.max(0, k * 1.4 - 0.4)} y2={216} stroke="#ff4b4b" strokeWidth={10} strokeLinecap="round" />
	</g>
);

/* the «ВЗВЕШИВАНИЕ» sign: a real plate (#11142c), kept inside the safe zone of the screen. Put it in a depth-1 layer. */
export const WeighSign: React.FC<{x: number; y: number}> = ({x, y}) => (
	<SafeBox x={x} y={y} left={390} right={390} top={75} bottom={75}>
		<rect x={x - 380} y={y - 65} width={760} height={130} rx={26} fill={NAVY} stroke="#ffc94a" strokeWidth={6} />
		<text x={x} y={y + 30} textAnchor="middle" fontSize={88} fontFamily={FONT} fontWeight={900} fill="#fff">
			ВЗВЕШИВАНИЕ
		</text>
	</SafeBox>
);
