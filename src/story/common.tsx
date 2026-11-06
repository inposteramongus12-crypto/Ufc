import React from 'react';
import {interpolate} from 'remotion';
import {Pose, RIG, rigPoints, toLocal} from '../engine/Stickman';
import {reach} from '../kit/actions';
import {counterAt, useShot} from '../kit/core';
import {clamp, ease} from '../kit/kit';
import {Tag} from './places';

/* Shared helpers for the story scenes (parts 1–3). */
export const FL = 900;
export const HS = 1.05;
export const hip = (s: number) => FL - 157 * s;
export const tagY = (s: number) => FL - 157 * s - 164 * s - 115;
export const dirA = (a: number): [number, number] => [Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180)];

export const guard = (p: Pose, k: number) => reach(reach(p, 'F', [44, -128], k), 'B', [30, -106], k);
export const hit = (p: Pose, side: 'F' | 'B', x: number, s: number, facing: 1 | -1, t: [number, number], k: number) => reach(p, side, toLocal(t[0], t[1], x, hip(s), s, facing), k);
// согнулся, руки на коленях
export const bent = (base: Pose, k: number): Pose => {
	const p: Pose = {...base, lean: base.lean + 40 * k, head: base.head + 22 * k};
	return reach(reach(p, 'F', [16, 74], k), 'B', [4, 78], k);
};
// кончик верёвки/скакалки между двумя кистями
export const hands = (p: Pose, x: number, s: number, facing: 1 | -1): {f: [number, number]; b: [number, number]} => {
	const pts = rigPoints(p);
	const end = (sh: [number, number], arm: [number, number]): [number, number] => {
		const e: [number, number] = [sh[0] + dirA(arm[0])[0] * RIG.UA, sh[1] + dirA(arm[0])[1] * RIG.UA];
		const a = arm[0] + arm[1];
		return [e[0] + dirA(a)[0] * RIG.FA, e[1] + dirA(a)[1] * RIG.FA];
	};
	const hf = end(pts.shF, p.armF);
	const hb = end(pts.shB, p.armB);
	return {f: [x + hf[0] * s * facing, hip(s) + hf[1] * s], b: [x + hb[0] * s * facing, hip(s) + hb[1] * s]};
};
// скакалка: сверху/снизу крутится по фазе a (рад.)
export const Rope: React.FC<{p: Pose; x: number; s: number; facing: 1 | -1; a: number; c?: string; k?: number}> = ({p, x, s, facing, a, c = '#ffd34a', k = 1}) => {
	const h = hands(p, x, s, facing);
	const cx = (h.f[0] + h.b[0]) / 2 - 6 * facing;
	const dy = Math.cos(a) * 360 * s;
	const top = Math.max(120, Math.min(FL + 6, h.f[1] - dy));
	const d = `M${h.f[0]},${h.f[1]} C${cx - 130 * s},${top} ${cx + 130 * s},${top} ${h.b[0]},${h.b[1]}`;
	return (
		<g opacity={k}>
			<path d={d} stroke="#1a1208" strokeWidth={12} fill="none" strokeLinecap="round" />
			<path d={d} stroke={c} strokeWidth={7} fill="none" strokeLinecap="round" />
			{[h.f, h.b].map((q, i) => (
				<rect key={i} x={q[0] - 8} y={q[1] - 20} width={16} height={40} rx={7} fill="#e2483a" stroke="#10132a" strokeWidth={3} />
			))}
		</g>
	);
};
// табличка героя: число берётся из счётчика ролика
export const HT: React.FC<{x: number; s?: number; warn?: boolean; ok?: boolean; grey?: boolean; bpm?: number; yy?: number; pop?: number; heart?: boolean; auto?: boolean; showBpm?: boolean; heartK?: number}> = ({x, s = 0.8, warn, ok, grey, bpm = 70, yy, pop = 1, heart = true, auto, showBpm, heartK}) => {
	const {gf} = useShot();
	return <Tag x={x} y={yy ?? tagY(HS)} value={counterAt(gf)} f={gf} s={s} warn={warn} ok={ok} grey={grey} bpm={bpm} pop={pop} heart={heart} auto={auto} showBpm={showBpm} heartK={heartK} />;
};
export const grow = (f: number, t: number, len = 10) => interpolate(f, [t, t + len], [0, 1], {...clamp, easing: ease});
export const WRAP = '#f2efe6';
