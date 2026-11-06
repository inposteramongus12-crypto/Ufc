import React from 'react';
import {interpolate, random} from 'remotion';
import {FONT, HAND} from '../kit/ui';
import {clamp, ease} from '../kit/kit';
import {Crowd} from './places';

/* Places and props for parts 7–9 (Rex wants to leave, the tour, the injury). Same rules: world 1920×1080, floor y = 900, nothing under 40 px. */
const NAVY = '#11142c';

/* a door in the right wall; open 0..1 swings it, slam makes it shake */
export const Door: React.FC<{x: number; open: number; f: number; slam?: number}> = ({x, open, f, slam = 0}) => (
	<g transform={`translate(${x + Math.sin(f * 3) * 4 * slam},0)`}>
		<rect x={-100} y={420} width={200} height={480} fill="#2b2118" />
		<g transform={`translate(-90,0) scale(${1 - 0.85 * open},1)`}>
			<rect x={0} y={430} width={180} height={470} fill="#8a5a33" stroke="#0d0d1c" strokeWidth={5} />
			<rect x={22} y={462} width={136} height={170} fill="#a8714a" />
			<rect x={22} y={660} width={136} height={200} fill="#a8714a" />
			<circle cx={150} cy={680} r={10} fill="#e0c060" />
		</g>
	</g>
);

/* a chain of links drawn from a to b; k = how much of it is drawn */
export const Chain: React.FC<{a: [number, number]; b: [number, number]; k: number}> = ({a, b, k}) => {
	const n = 16;
	return (
		<g>
			{Array.from({length: n}).map((_, i) => {
				const t = i / (n - 1);
				if (t > k) return null;
				const x = a[0] + (b[0] - a[0]) * t;
				const y = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 50;
				return <ellipse key={i} cx={x} cy={y} rx={i % 2 ? 11 : 18} ry={i % 2 ? 18 : 11} fill="none" stroke="#ffc94a" strokeWidth={7} transform={`rotate(${i % 2 ? 35 : -35} ${x} ${y})`} />;
			})}
		</g>
	);
};

/* another league's contract: a double fee */
export const OtherContract: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-250} y={-190} width={500} height={380} rx={16} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={6} />
		<text x={0} y={-110} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
			ДРУГАЯ ЛИГА
		</text>
		<rect x={-200} y={-70} width={400} height={16} rx={8} fill="#cdd1de" />
		<text x={0} y={70} textAnchor="middle" fontSize={72} fontFamily={FONT} fontWeight={900} fill="#d9372b">
			ГОНОРАР ×2
		</text>
		<rect x={-200} y={110} width={300} height={16} rx={8} fill="#cdd1de" />
	</g>
);

/* two contracts side by side: the same clause, underlined at the same time */
export const SplitContracts: React.FC<{x: number; y: number; s?: number; under: number}> = ({x, y, s = 1, under}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		{[-1, 1].map((d) => (
			<g key={d} transform={`translate(${d * 470},0)`}>
				<rect x={-430} y={-300} width={860} height={600} rx={24} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={6} />
				<rect x={-430} y={-300} width={860} height={100} rx={24} fill="#2a2f4a" />
				<text x={0} y={-228} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
					{d < 0 ? 'ВОРОН' : 'РЕКС'}
				</text>
				<rect x={-380} y={-150} width={700} height={18} rx={9} fill="#cdd1de" />
				<rect x={-380} y={-100} width={560} height={18} rx={9} fill="#cdd1de" />
				<rect x={-390} y={-30} width={780} height={170} rx={14} fill="#ffe08a" opacity={0.5} />
				<text x={-370} y={30} fontSize={60} fontFamily={FONT} fontWeight={800} fill="#2a2f4a">
					Пока чемпион:
				</text>
				<text x={-370} y={100} fontSize={60} fontFamily={FONT} fontWeight={800} fill="#2a2f4a">
					+3 боя или +1 год
				</text>
				<line x1={-370} y1={118} x2={-370 + 740 * under} y2={118} stroke="#d9372b" strokeWidth={9} strokeLinecap="round" />
				<rect x={-380} y={190} width={640} height={18} rx={9} fill="#cdd1de" />
			</g>
		))}
	</g>
);

/* a framed poster on the wall that shakes */
export const WallFrame: React.FC<{x: number; y: number; f: number; shake: number}> = ({x, y, f, shake}) => (
	<g transform={`translate(${x},${y}) rotate(${Math.sin(f * 2.6) * 5 * shake})`}>
		<rect x={-170} y={-120} width={340} height={240} rx={14} fill="#c43d4b" stroke="#0d0d1c" strokeWidth={6} />
		<rect x={-140} y={-92} width={280} height={184} rx={8} fill="#ffd34a" />
		<text x={0} y={-6} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#11142c">
			БОЙ
		</text>
		<text x={0} y={60} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#11142c">
			ВЕКА
		</text>
	</g>
);

export const Mic: React.FC = () => (
	<g transform="translate(16,-30) rotate(-20)">
		<rect x={-8} y={-10} width={16} height={60} rx={8} fill="#333" />
		<circle cx={0} cy={-26} r={20} fill="#c9d3ff" stroke="#0d0d1c" strokeWidth={4} />
	</g>
);

/* ------------------------------ the tour montage ------------------------------ */
export const Parachute: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-210,0 C-210,-190 210,-190 210,0 Z" fill="#ee4d5c" stroke="#0d0d1c" strokeWidth={6} />
		<path d="M-70,0 C-70,-170 70,-170 70,0" fill="none" stroke="#fff" strokeWidth={6} />
		{[-190, -70, 70, 190].map((cx) => (
			<line key={cx} x1={cx} y1={0} x2={0} y2={250} stroke="#0d0d1c" strokeWidth={4} />
		))}
	</g>
);
/* a cardboard cutout of Voron (flat, with a stand) */
export const CardboardVoron: React.FC<{x: number; fall: number}> = ({x, fall}) => (
	<g transform={`translate(${x},900) rotate(${fall * 88} 0 0)`}>
		<rect x={-80} y={-420} width={160} height={420} rx={14} fill="#c9a574" stroke="#0d0d1c" strokeWidth={6} />
		<circle cx={0} cy={-330} r={52} fill="#0d0d1c" />
		<rect x={-70} y={-270} width={140} height={190} rx={22} fill="#2e3bb0" />
		<text x={0} y={-160} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#fff">
			ВОРОН
		</text>
	</g>
);
export const Billboard: React.FC<{x: number; y: number; s?: number; text?: string; c?: string}> = ({x, y, s = 1, text = 'БОЙ ВЕКА', c = '#ffc94a'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-14} y={0} width={28} height={420} fill="#3a3f55" />
		<rect x={-340} y={-200} width={680} height={240} rx={18} fill={NAVY} stroke={c} strokeWidth={8} />
		<text x={0} y={-56} textAnchor="middle" fontSize={96} fontFamily={FONT} fontWeight={900} fill="#fff">
			{text}
		</text>
		<text x={0} y={20} textAnchor="middle" fontSize={52} fontFamily={FONT} fontWeight={800} fill={c}>
			ТУР
		</text>
	</g>
);

/* ------------------------------ money, tubes, stamps ------------------------------ */
export const Wallet: React.FC<{x: number; y: number; flip: number}> = ({x, y, flip}) => (
	<g transform={`translate(${x},${y}) rotate(${flip * 180})`}>
		<rect x={-80} y={-56} width={160} height={112} rx={16} fill="#7a4a2a" stroke="#0d0d1c" strokeWidth={6} />
		<rect x={-80} y={-56} width={160} height={30} rx={14} fill="#5d3720" />
		<circle cx={52} cy={0} r={12} fill="#e0c060" />
	</g>
);
export const Coin: React.FC<{x: number; y: number; spin: number}> = ({x, y, spin}) => (
	<g transform={`translate(${x},${y}) scale(${Math.cos(spin * 9) * 0.9 + 0.1},1)`}>
		<circle r={26} fill="#ffd34a" stroke="#0d0d1c" strokeWidth={5} />
		<circle r={15} fill="none" stroke="#e7a91c" strokeWidth={4} />
	</g>
);
/* empty fight card with n names appearing in the last row */
export const UnderCard: React.FC<{x: number; y: number; s?: number; k: number}> = ({x, y, s = 1, k}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-480} y={-300} width={960} height={600} rx={30} fill={NAVY} stroke="#1fb5a8" strokeWidth={8} />
		<text x={-440} y={-226} fontSize={60} fontFamily={FONT} fontWeight={900} fill="#c9fff6">
			АНДЕРКАРД
		</text>
		{[0, 1, 2, 3].map((i) => (
			<g key={i}>
				<rect x={-440} y={-170 + i * 96} width={880} height={64} rx={14} fill="#1e2c55" stroke="#3a4a8a" strokeWidth={4} />
			</g>
		))}
		<rect x={-440} y={214} width={880} height={64} rx={14} fill={k > 0.1 ? '#233d7a' : '#1e2c55'} stroke={k > 0.1 ? '#ffc94a' : '#3a4a8a'} strokeWidth={4} />
		<text x={-410} y={262} fontSize={56} fontFamily={FONT} fontWeight={900} fill="#fff" opacity={k}>
			ГАЛКИН — АДЕБИ
		</text>
	</g>
);
export const MedRoom: React.FC = () => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1300} fill="#d8efee" />
		<rect x={-500} y={900} width={2920} height={400} fill="#9db8b6" />
		<rect x={-500} y={886} width={2920} height={16} fill="#7aa09e" />
		<rect x={160} y={240} width={300} height={400} rx={14} fill="#fff" stroke="#7aa09e" strokeWidth={6} />
		<rect x={200} y={290} width={220} height={20} rx={10} fill="#cde4e2" />
		<rect x={200} y={340} width={160} height={20} rx={10} fill="#cde4e2" />
		<rect x={200} y={390} width={200} height={20} rx={10} fill="#cde4e2" />
		<rect x={700} y={230} width={90} height={90} rx={14} fill="#3fae8f" />
		<rect x={738} y={250} width={14} height={50} fill="#fff" />
		<rect x={722} y={268} width={46} height={14} fill="#fff" />
	</g>
);
/* a table with two rack-mounted test tubes; labels are the names */
export const Tubes: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-300} y={0} width={600} height={34} rx={8} fill="#6b8c8a" />
		<rect x={-270} y={34} width={22} height={166} fill="#557270" />
		<rect x={248} y={34} width={22} height={166} fill="#557270" />
		<rect x={-250} y={-30} width={500} height={34} rx={10} fill="#b8d4d2" stroke="#7aa09e" strokeWidth={4} />
		{[-110, 110].map((cx, i) => (
			<g key={cx} transform={`translate(${cx},${-30 - 200 * 0})`}>
				<rect x={-26} y={-190} width={52} height={190} rx={22} fill="#e9fbfa" stroke="#7aa09e" strokeWidth={5} />
				<rect x={-22} y={-100 + (1 - k) * 90} width={44} height={96 + 0} rx={18} fill={i ? '#ff6a5a' : '#ff8a5a'} opacity={0.85} />
				<rect x={-104} y={-150} width={208} height={64} rx={10} fill="#fff" stroke="#0d0d1c" strokeWidth={4} />
				<text x={0} y={-104} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#11142c">
					{i ? 'АДЕБИ' : 'ГАЛКИН'}
				</text>
			</g>
		))}
	</g>
);

/* ------------------------------ the last stop of the tour ------------------------------ */
export const Street: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1300} fill="#9fd0ff" />
		<rect x={-500} y={430} width={2920} height={140} fill="#c9c2b4" />
		{[100, 420, 800, 1160, 1560, 1900].map((x, i) => (
			<rect key={x} x={x} y={180 + (i % 3) * 40} width={260} height={400 - (i % 3) * 40} fill={['#d9a06b', '#a9b6cc', '#cf8f8f'][i % 3]} stroke="#0d0d1c" strokeWidth={4} />
		))}
		<rect x={-500} y={560} width={2920} height={400} fill="#6f7480" />
		<rect x={-500} y={886} width={2920} height={400} fill="#4d515c" />
		<ellipse cx={400} cy={120} rx={160} ry={46} fill="#fff" opacity={0.9} />
		<ellipse cx={1500} cy={90} rx={190} ry={50} fill="#fff" opacity={0.9} />
		<Crowd seed={'st' + 1} x0={-100} x1={2020} y0={920} y1={1010} n={0} f={f} />
	</g>
);
export const Bus: React.FC<{x: number}> = ({x}) => (
	<g transform={`translate(${x},900)`}>
		<rect x={-330} y={-330} width={660} height={300} rx={22} fill="#f2b21c" stroke="#0d0d1c" strokeWidth={6} />
		{[-250, -110, 30, 170].map((cx) => (
			<rect key={cx} x={cx} y={-290} width={110} height={110} rx={10} fill="#9fd0ff" stroke="#0d0d1c" strokeWidth={4} />
		))}
		<rect x={-330} y={-130} width={660} height={26} fill="#d9372b" />
		<text x={0} y={-62} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#11142c">
			БОЙ ВЕКА. ТУР
		</text>
		{[-220, 200].map((cx) => (
			<circle key={cx} cx={cx} cy={-2} r={44} fill="#222" stroke="#0d0d1c" strokeWidth={5} />
		))}
	</g>
);
export const Mats: React.FC<{x: number; w?: number}> = ({x, w = 340}) => (
	<g transform={`translate(${x},900)`}>
		{[0, 1, 2].map((i) => (
			<rect key={i} x={-w / 2 + i * 14} y={-30 - i * 34} width={w - i * 28} height={32} rx={8} fill={['#3a8bd9', '#2f6fd8', '#2859b0'][i]} stroke="#0d0d1c" strokeWidth={4} />
		))}
	</g>
);
export const BigText: React.FC<{x: number; y: number; t: string; k: number; size?: number; c?: string; rot?: number}> = ({x, y, t, k, size = 150, c = '#ffe08a', rot = -6}) =>
	k <= 0 ? null : (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${0.5 + 0.5 * Math.min(1, k * 2.5)})`} opacity={Math.min(1, k * 3)}>
			<text textAnchor="middle" fontSize={size} fontFamily={HAND} fontWeight={700} fill={c} stroke="#0d0d1c" strokeWidth={10} paintOrder="stroke">
				{t}
			</text>
		</g>
	);

/* a thought cloud that pops: k 0..1 grows, p 0..1 bursts */
export const PopCloud: React.FC<{x: number; y: number; t: string; k: number; p: number; size?: number}> = ({x, y, t, k, p, size = 56}) => {
	if (k <= 0 || p >= 1) return null;
	const w = t.length * size * 0.66 + 80;
	const sc = (0.4 + 0.6 * k) * (1 + 0.5 * p);
	return (
		<g transform={`translate(${x},${y}) scale(${sc})`} opacity={1 - p}>
			<rect x={-w / 2} y={-size * 1.0} width={w} height={size * 2} rx={size} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={6} />
			<circle cx={-w / 2 + 40} cy={size * 1.3} r={14} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={5} />
			<circle cx={-w / 2 + 16} cy={size * 1.8} r={8} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={4} />
			<text x={0} y={size * 0.3} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
				{t}
			</text>
		</g>
	);
};
export const Poof: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) =>
	t < 0 || t > 14 ? null : (
		<g>
			{Array.from({length: 10}).map((_, i) => {
				const a = (i / 10) * Math.PI * 2;
				const d = 30 + t * 12 * (0.6 + random('pf' + i));
				return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d} r={Math.max(1, 12 - t * 0.8)} fill="#fff" stroke="#0d0d1c" strokeWidth={3} opacity={1 - t / 14} />;
			})}
		</g>
	);

/* the night office: dark windows, a desk lamp, the wall for Kostya to slide down */
export const NightOffice: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1300} fill="#2a2f4a" />
		<rect x={-500} y={900} width={2920} height={400} fill="#171a2c" />
		<rect x={-500} y={886} width={2920} height={16} fill="#3b4268" />
		<rect x={1180} y={140} width={560} height={420} rx={10} fill="#10142c" stroke="#3b4268" strokeWidth={8} />
		{Array.from({length: 18}).map((_, i) => (
			<rect key={i} x={1210 + (i % 6) * 86} y={190 + Math.floor(i / 6) * 120} width={44} height={70} fill={random('nw' + i) > 0.45 ? '#ffd98a' : '#1d2342'} opacity={0.9} />
		))}
		<rect x={100} y={700} width={420} height={30} rx={8} fill="#5a4a36" />
		<rect x={130} y={730} width={20} height={170} fill="#4a3c2b" />
		<rect x={470} y={730} width={20} height={170} fill="#4a3c2b" />
		<ellipse cx={310} cy={640} rx={240} ry={190} fill="#ffe3a0" opacity={0.1 + 0.02 * Math.sin(f / 9)} style={{filter: 'blur(26px)'}} />
	</g>
);
export const Phone: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-18} y={-34} width={36} height={68} rx={8} fill="#0d0d1c" stroke="#8fa3e8" strokeWidth={4} />
		<rect x={-12} y={-26} width={24} height={44} rx={3} fill="#bfe3ff" />
	</g>
);

export const EmptySlotPoster: React.FC<{x: number; y: number; s?: number; k: number}> = ({x, y, s = 1, k}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-560} y={-340} width={1120} height={680} rx={34} fill={NAVY} stroke="#ffc94a" strokeWidth={8} />
		<text x={0} y={-262} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill="#ffe08a">
			БОЙ ВЕКА
		</text>
		<g transform="translate(-290,40)">
			<rect x={-210} y={-250} width={420} height={500} rx={22} fill="#26308a" stroke="#fff" strokeWidth={5} />
			<text x={0} y={206} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#fff">
				ВОРОН
			</text>
			<circle cx={0} cy={-90} r={80} fill="#0d0d1c" />
			<rect x={-90} y={0} width={180} height={150} rx={30} fill="#2e3bb0" />
		</g>
		<g transform="translate(290,40)" opacity={0.4 + 0.6 * k}>
			<rect x={-210} y={-250} width={420} height={500} rx={22} fill="none" stroke="#ff6a5a" strokeWidth={8} strokeDasharray="30 20" />
			<text x={0} y={60} textAnchor="middle" fontSize={200} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
				?
			</text>
		</g>
	</g>
);

export const sp = (f: number, t0: number, len = 12) => interpolate(f, [t0, t0 + len], [0, 1], {...clamp, easing: ease});
