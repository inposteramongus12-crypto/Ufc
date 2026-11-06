import React from 'react';
import {interpolate, random} from 'remotion';
import {Stickman} from '../engine/Stickman';
import {FONT, HAND} from '../kit/ui';
import {clamp, ease} from '../kit/kit';
import {CAST} from './cast';

/* Places and props for parts 10–11 (the decision, the fight, the final). World 1920×1080, floor y = 900, nothing under 40 px. */
const NAVY = '#11142c';
export const sp4 = (f: number, t0: number, len = 12) => interpolate(f, [t0, t0 + len], [0, 1], {...clamp, easing: ease});

/* an expensive star's portrait on Irma's tablet, crossed out with the stylus */
export const StarCard: React.FC<{x: number; y: number; s?: number; cross: number}> = ({x, y, s = 1, cross}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-260} y={-320} width={520} height={640} rx={30} fill={NAVY} stroke="#1fb5a8" strokeWidth={8} />
		<clipPath id="sc-star">
			<rect x={-240} y={-300} width={480} height={460} rx={20} />
		</clipPath>
		<g clipPath="url(#sc-star)">
			<rect x={-240} y={-300} width={480} height={460} fill="#7a2f63" />
			<g transform="translate(0,170)">
				<Stickman id="stc" x={0} y={0} facing={1} pose={{lean: 0, head: 0, armB: [-6, 10], armF: [6, 10], legB: [0, 0], legF: [0, 0]}} {...CAST.star} scale={2.2} hideLegs mouth="smirk" faceTurn={0} look={[0, 0]} />
			</g>
		</g>
		<text x={0} y={230} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#ffe08a">
			ДОРОГАЯ
		</text>
		<text x={0} y={296} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={800} fill="#fff">
			промежуточный вес
		</text>
		{cross > 0 ? (
			<g>
				<line x1={-250} y1={-300} x2={-250 + 500 * cross} y2={-300 + 600 * cross} stroke="#ff4b4b" strokeWidth={20} strokeLinecap="round" />
				<line x1={250} y1={-300} x2={250 - 500 * Math.max(0, cross * 1.4 - 0.4)} y2={-300 + 600 * Math.max(0, cross * 1.4 - 0.4)} stroke="#ff4b4b" strokeWidth={20} strokeLinecap="round" />
			</g>
		) : null}
	</g>
);

/* the stream chat: «КТО?» ×3 */
export const ChatKto: React.FC<{x: number; y: number; s?: number; f: number; t0: number}> = ({x, y, s = 1, f, t0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-380} y={-290} width={760} height={580} rx={34} fill={NAVY} stroke="#8fa3e8" strokeWidth={6} />
		<text x={-340} y={-224} fontSize={50} fontFamily={FONT} fontWeight={800} fill="#c9d3ff">
			ЧАТ СТРИМА
		</text>
		{[0, 1, 2].map((i) => {
			const k = sp4(f, t0 + i * 16, 10);
			return k <= 0 ? null : (
				<g key={i} transform={`translate(${-60 + i * 30},${-100 + i * 150}) scale(${0.6 + 0.4 * k})`} opacity={k}>
					<rect x={-240} y={-56} width={480} height={112} rx={30} fill="#fbf8ef" />
					<text x={0} y={26} textAnchor="middle" fontSize={78} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
						КТО?
					</text>
				</g>
			);
		})}
	</g>
);

/* three ticks and an empty «ИМЯ» row */
export const CheckList: React.FC<{x: number; y: number; s?: number; k: number[]}> = ({x, y, s = 1, k}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-500} y={-300} width={1000} height={600} rx={34} fill={NAVY} stroke="#ffc94a" strokeWidth={8} />
		<text x={0} y={-220} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
			ГАЛКИН — АДЕБИ
		</text>
		{['ВЕС', 'СПРАВКИ', 'ЛАГЕРЬ'].map((t, i) => (
			<g key={t} transform={`translate(0,${-110 + i * 96})`} opacity={Math.min(1, k[i] * 2)}>
				<text x={-420} y={26} fontSize={62} fontFamily={FONT} fontWeight={800} fill="#fff">
					{t}
				</text>
				<path d={`M300,10 L340,50 L420,-30`} stroke="#6ff0a0" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={200} strokeDashoffset={200 * (1 - k[i])} />
			</g>
		))}
		<g transform="translate(0,200)">
			<text x={-420} y={26} fontSize={62} fontFamily={FONT} fontWeight={800} fill="#ff6a5a">
				ИМЯ
			</text>
			<rect x={-60} y={-14} width={440} height={56} rx={14} fill="none" stroke="#ff6a5a" strokeWidth={6} strokeDasharray="22 14" />
		</g>
	</g>
);

/* the «ОТПРАВИТЬ» button panel with two fight cards */
export const SendPanel: React.FC<{x: number; y: number; s?: number; press: number; cards: number}> = ({x, y, s = 1, press, cards}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-420} y={-300} width={840} height={600} rx={34} fill={NAVY} stroke="#8fa3e8" strokeWidth={6} />
		<text x={-380} y={-230} fontSize={52} fontFamily={FONT} fontWeight={900} fill="#c9d3ff">
			КАРД ТУРНИРА
		</text>
		<rect x={-380} y={-190} width={760} height={96} rx={18} fill="#1e2c55" stroke="#3a4a8a" strokeWidth={4} />
		<text x={-350} y={-122} fontSize={56} fontFamily={FONT} fontWeight={800} fill="#fff">
			РЕКС — ВОРОН
		</text>
		<rect x={-380} y={-70} width={760} height={110} rx={18} fill={cards > 0.1 ? '#233d7a' : '#1e2c55'} stroke={cards > 0.1 ? '#ffc94a' : '#3a4a8a'} strokeWidth={5} />
		<text x={-350} y={6} fontSize={62} fontFamily={FONT} fontWeight={900} fill="#fff" opacity={cards}>
			ГАЛКИН — АДЕБИ
		</text>
		<g transform={`translate(0,${180 + press * 6}) scale(${1 - 0.05 * press})`}>
			<rect x={-300} y={-62} width={600} height={124} rx={36} fill={press > 0.5 ? '#2fae6a' : '#3fcf86'} stroke="#0d0d1c" strokeWidth={6} />
			<text x={0} y={22} textAnchor="middle" fontSize={72} fontFamily={FONT} fontWeight={900} fill="#06260f">
				ОТПРАВИТЬ
			</text>
		</g>
	</g>
);

/* ------------------------------ hospital ------------------------------ */
export const Hospital: React.FC = () => (
	<g>
		<rect x={-500} y={-300} width={2920} height={1300} fill="#dcefe8" />
		<rect x={-500} y={900} width={2920} height={400} fill="#a9c4bb" />
		<rect x={-500} y={886} width={2920} height={16} fill="#86a89d" />
		<rect x={200} y={170} width={360} height={380} rx={10} fill="#2c3550" />
		<rect x={216} y={186} width={328} height={348} fill="#bfe6ff" />
		<rect x={376} y={186} width={8} height={348} fill="#2c3550" />
		<rect x={900} y={640} width={780} height={40} rx={10} fill="#f4f7f6" stroke="#86a89d" strokeWidth={4} />
		<rect x={900} y={680} width={780} height={110} fill="#c9dcd5" />
		<rect x={910} y={790} width={24} height={110} fill="#7a8f88" />
		<rect x={1650} y={790} width={24} height={110} fill="#7a8f88" />
		<rect x={900} y={560} width={60} height={130} rx={10} fill="#f4f7f6" stroke="#86a89d" strokeWidth={4} />
		<rect x={1380} y={150} width={90} height={90} rx={14} fill="#3fae8f" />
		<rect x={1418} y={168} width={14} height={54} fill="#fff" />
		<rect x={1400} y={188} width={50} height={14} fill="#fff" />
	</g>
);
export const Oranges: React.FC = () => (
	<g transform="translate(14,-10)">
		<rect x={-30} y={-6} width={60} height={50} rx={8} fill="#e9dcc0" stroke="#0d0d1c" strokeWidth={4} />
		{[-14, 6, -4].map((cx, i) => (
			<circle key={i} cx={cx} cy={-12 - (i % 2) * 8} r={14} fill="#ff9a2a" stroke="#0d0d1c" strokeWidth={3} />
		))}
	</g>
);
export const Crutch: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<line x1={0} y1={0} x2={-30} y2={300} stroke="#8a5a33" strokeWidth={12} strokeLinecap="round" />
		<rect x={-30} y={-6} width={70} height={14} rx={7} fill="#8a5a33" />
	</g>
);
export const Popcorn: React.FC = () => (
	<g transform="translate(20,-22)">
		<path d="M-26,0 L26,0 L20,56 L-20,56 Z" fill="#d9372b" stroke="#0d0d1c" strokeWidth={4} />
		{[-16, 0, 14, -6, 8].map((cx, i) => (
			<circle key={i} cx={cx} cy={-8 - (i % 3) * 6} r={9} fill="#fff7d6" stroke="#0d0d1c" strokeWidth={2} />
		))}
	</g>
);
/* the brace on Rex's leg (drawn over the leg) */
export const Brace: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-22} y={0} width={44} height={110} rx={12} fill="#3a4a6a" stroke="#0d0d1c" strokeWidth={4} />
		<rect x={-24} y={30} width={48} height={12} fill="#9fb0d0" />
		<rect x={-24} y={70} width={48} height={12} fill="#9fb0d0" />
	</g>
);

/* ------------------------------ arena finale ------------------------------ */
/* the scoreboard with the surnames typed in a hurry: every letter sits a little differently */
export const HastyBoard: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => {
	const row = (t: string, y0: number, size: number, c: string) =>
		t.split('').map((ch, i) => (
			<text key={i + t} x={-340 + i * size * 0.7} y={y0 + Math.sin(i * 2.3 + f / 9) * 7 + (random('hb' + i + t) - 0.5) * 14} fontSize={size * (0.9 + random('hs' + i + t) * 0.2)} fontFamily={FONT} fontWeight={900} fill={c} transform={`rotate(${(random('hr' + i + t) - 0.5) * 16} ${-340 + i * size * 0.7} ${y0})`}>
				{ch}
			</text>
		));
	return (
		<g transform={`translate(${x},${y}) rotate(${Math.sin(f / 5) * 1.2})`}>
			<line x1={-340} y1={-300} x2={-300} y2={0} stroke="#7a819a" strokeWidth={5} />
			<line x1={340} y1={-300} x2={300} y2={0} stroke="#7a819a" strokeWidth={5} />
			<rect x={-400} y={0} width={800} height={300} rx={26} fill="#131735" stroke="#8fa3e8" strokeWidth={6} />
			<g>{row('ГАЛКИН', 110, 84, '#ffe08a')}</g>
			<g>{row('АДЕБИ', 230, 84, '#ffffff')}</g>
		</g>
	);
};
/* many bright phone screens in the stands */
export const PhoneWall: React.FC<{f: number; y0: number; y1: number; n?: number}> = ({f, y0, y1, n = 90}) => (
	<g>
		{Array.from({length: n}).map((_, i) => {
			const x = -100 + random('pw' + i) * 2120;
			const y = y0 + random('py' + i) * (y1 - y0);
			const on = 0.5 + 0.5 * Math.sin(f / 4 + i * 1.7);
			return <rect key={i} x={x} y={y} width={26} height={44} rx={5} fill={i % 3 ? '#bfe3ff' : '#fff3c8'} opacity={0.4 + 0.6 * on} />;
		})}
	</g>
);
export const Chant: React.FC<{x: number; y: number; t: string; k: number; size?: number; rot?: number}> = ({x, y, t, k, size = 200, rot = -4}) =>
	k <= 0 ? null : (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${0.6 + 0.4 * Math.min(1, k * 2)})`} opacity={Math.min(1, k * 2.5)}>
			<text textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill="#fff" stroke="#11142c" strokeWidth={14} paintOrder="stroke">
				{t}
			</text>
		</g>
	);
export const SweatDrop: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) =>
	t < 0 ? null : (
		<g transform={`translate(${x},${y + Math.min(1, t / 40) * Math.min(1, t / 40) * 320})`} opacity={1 - Math.max(0, t - 36) / 6}>
			<path d="M0,-26 C14,-6 18,6 10,16 C4,24 -4,24 -10,16 C-18,6 -14,-6 0,-26 Z" fill="#bfe6ff" stroke="#0d0d1c" strokeWidth={4} />
		</g>
	);
/* a card with a name, used for the two names floating out of the dark */
export const NameCard: React.FC<{x: number; y: number; s?: number; name: string; c: string; rot?: number}> = ({x, y, s = 1, name, c, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-250} y={-330} width={500} height={660} rx={30} fill={NAVY} stroke={c} strokeWidth={8} />
		<rect x={-226} y={-306} width={452} height={440} rx={20} fill={c} opacity={0.35} />
		<circle cx={0} cy={-120} r={110} fill="#0d0d1c" />
		<rect x={-130} y={-10} width={260} height={150} rx={40} fill={c} />
		<text x={0} y={250} textAnchor="middle" fontSize={78} fontFamily={FONT} fontWeight={900} fill="#fff">
			{name}
		</text>
	</g>
);
export const HandText: React.FC<{x: number; y: number; t: string; size?: number; c?: string; rot?: number}> = ({x, y, t, size = 90, c = '#fff', rot = 0}) => (
	<text x={x} y={y} textAnchor="middle" fontSize={size} fontFamily={HAND} fontWeight={700} fill={c} transform={`rotate(${rot} ${x} ${y})`}>
		{t}
	</text>
);
