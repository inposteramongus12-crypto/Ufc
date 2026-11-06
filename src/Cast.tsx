import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stickman, Pose} from './engine/Stickman';
import {CAST, CLOUDS} from './story/cast';
import {FONT} from './kit/ui';

/* Лист героев: один кадр, все герои крупно, подписи ниже ног (не поверх лиц). */
const STAND: Pose = {lean: 0, head: 0, armB: [-8, 10], armF: [8, 10], legB: [-4, 0], legF: [4, 0]};
const GUARD: Pose = {lean: 4, head: 0, armB: [38, 105], armF: [58, 100], legB: [-10, 8], legF: [12, 6]};
const SHOW: Pose = {lean: 0, head: 0, armB: [-8, 10], armF: [58, 62], legB: [-4, 0], legF: [4, 0]};
const HIPS: Pose = {lean: 0, head: 0, armB: [-24, 80], armF: [24, 80], legB: [-8, 0], legF: [8, 0]};
const WIDE: Pose = {lean: 0, head: 0, armB: [-38, 12], armF: [38, 12], legB: [-10, 0], legF: [10, 0]}; // руки в стороны: пояс виден
const WAVE: Pose = {lean: 0, head: 0, armB: [-8, 10], armF: [150, 20], legB: [-4, 0], legF: [4, 0]};

type Item = {who: string; name: string; role: string; pose: Pose; mouth?: 'smile' | 'smirk' | 'line' | 'open'};
const ITEMS: Item[] = [
	{who: 'hero', name: 'Костя Шпак', role: 'блогер, твой герой', pose: WAVE, mouth: 'open'},
	{who: 'irma', name: 'Ирма Ларсен', role: 'матчмейкер', pose: SHOW, mouth: 'smirk'},
	{who: 'rex', name: 'Рекс «Бульдозер» Бураков', role: 'звезда', pose: HIPS, mouth: 'smirk'},
	{who: 'senya', name: 'Сеня Галкин', role: 'боец, готов всегда', pose: GUARD, mouth: 'smile'},
	{who: 'tayo', name: 'Тайо Адеби', role: 'боец, облачко', pose: GUARD, mouth: 'line'},
	{who: 'voron', name: 'Ворон', role: 'чемпион, облачко', pose: STAND, mouth: 'smirk'},
	{who: 'heavy', name: 'Тяжеловес', role: 'облачко', pose: WIDE, mouth: 'line'},
];

const COLW = 480;
const ROWH = 540;
const BASE = 452; // линия пола внутри ряда
const S = 0.95;

export const CastSheet: React.FC = () => (
	<AbsoluteFill style={{background: '#262b3d', fontFamily: FONT}}>
		<svg width={1920} height={1080} viewBox="0 0 1920 1080">
			{[0, 1].map((r) => (
				<rect key={r} x={0} y={r * ROWH + BASE + 4} width={1920} height={4} fill="#3a4160" />
			))}
			{ITEMS.map((it, i) => {
				const cx = (i % 4) * COLW + COLW / 2;
				const top = Math.floor(i / 4) * ROWH;
				const c = CAST[it.who];
				const s = S * (c.scale ?? 1);
				const y = top + BASE - (148 + 6) * s; // бедро: пол минус длина ноги
				return (
					<g key={it.who}>
						<Stickman id={'cs-' + it.who} x={cx - 10} y={y} {...c} scale={s} pose={it.pose} mouth={it.mouth ?? 'line'} faceTurn={0} look={[0, 0]} />
						<text x={cx} y={top + BASE + 44} textAnchor="middle" fontSize={30} fontWeight={800} fill="#fff" fontFamily={FONT}>{it.name}</text>
						<text x={cx} y={top + BASE + 72} textAnchor="middle" fontSize={22} fontWeight={500} fill="#aeb6cf" fontFamily={FONT}>{it.role}</text>
					</g>
				);
			})}
			{/* телеканал: облачко-экран без человека и без логотипа */}
			{(() => {
				const cl = CLOUDS.tv;
				const cx = 3 * COLW + COLW / 2;
				const top = ROWH;
				return (
					<g>
						<path d={`M${cx - 150},${top + 300} C${cx - 200},${top + 300} ${cx - 210},${top + 220} ${cx - 150},${top + 210} C${cx - 150},${top + 140} ${cx - 60},${top + 120} ${cx - 30},${top + 170} C${cx + 10},${top + 110} ${cx + 100},${top + 130} ${cx + 100},${top + 195} C${cx + 170},${top + 190} ${cx + 190},${top + 290} ${cx + 120},${top + 300} Z`} fill={cl.fill} stroke={cl.stroke} strokeWidth={6} strokeLinejoin="round" />
						<rect x={cx - 70} y={top + 190} width={130} height={88} rx={12} fill="#1a1f2b" stroke={cl.stroke} strokeWidth={5} />
						<rect x={cx - 58} y={top + 202} width={106} height={64} rx={6} fill="#5b6275" />
						<circle cx={cx - 30} cy={top + 234} r={10} fill="#e4e6ec" />
						<line x1={cx - 20} y1={top + 190} x2={cx - 40} y2={top + 160} stroke={cl.stroke} strokeWidth={5} strokeLinecap="round" />
						<line x1={cx + 10} y1={top + 190} x2={cx + 30} y2={top + 160} stroke={cl.stroke} strokeWidth={5} strokeLinecap="round" />
						<circle cx={cx - 108} cy={top + 330} r={13} fill={cl.fill} stroke={cl.stroke} strokeWidth={5} />
						<circle cx={cx - 128} cy={top + 366} r={7} fill={cl.fill} stroke={cl.stroke} strokeWidth={4} />
						<text x={cx} y={top + BASE + 44} textAnchor="middle" fontSize={30} fontWeight={800} fill="#fff" fontFamily={FONT}>Телеканал</text>
						<text x={cx} y={top + BASE + 72} textAnchor="middle" fontSize={22} fontWeight={500} fill="#aeb6cf" fontFamily={FONT}>только облачко, без логотипа</text>
					</g>
				);
			})()}
		</svg>
	</AbsoluteFill>
);
