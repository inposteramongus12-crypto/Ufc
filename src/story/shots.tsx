import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose, toLocal} from '../engine/Stickman';
import {Layer, Svg} from '../engine/camera';
import {Chair} from '../engine/props';
import {blend, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, counterAt, useShot, useSpeaking} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn, clamp, ease, flash, mixCam, Stage, usePush} from '../kit/kit';
import {Bubble, FONT} from '../kit/ui';
import {guard, hit, hip} from './common';
import {
	Calendar, CageSide, ChatFlames, Contract, Crowd, DayPlate, Envelope, FL, HallFar, HeroPlate, HS, IS, Hand, Office, OctagonTop, Scoreboard, Stamp, Studio, TvLogo, VipBox, headTop,
} from './places';

/* Parts 1–3 (lines 001–027, 0:00–2:01). The plate «ДО ТУРНИРА N ДНЕЙ» follows the day table in
   PROGRESS.md: 0 (hook) → 365 → 351 → 330 → 300. There is no «Чирк» in this script, so the number
   rolls once per line key (config.ts), never one by one. Text is sized a third bigger than the kit default. */

const wide = camOn(960, 540, 1.0);
const K = 0.35; // speech camera push

/* a plate that grows in (instead of just appearing) */
const Reveal: React.FC<{k: number; x: number; y: number; children: React.ReactNode}> = ({k, x, y, children}) => (
	<g opacity={Math.min(1, k * 2)} transform={`translate(${x},${y}) scale(${0.3 + 0.7 * k}) translate(${-x},${-y})`}>
		{children}
	</g>
);
const spring01 = (f: number, t0: number, len = 12) => interpolate(f, [t0, t0 + len], [0, 1], {...clamp, easing: ease});
const dark = {filter: 'brightness(0.1)'} as React.CSSProperties;

/* ---------------------------------------------------------------- PART 1: HOOK */

/* 001 N: «Двадцать тысяч человек кричат одно и то же имя…» — the camera drifts over the empty octagon */
const S01: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(930, 540, 1.0), camOn(1000, 580, 1.14));
	return (
		<Stage cam={cam} bg="#070914" light={{night: true, o: 0.3}} dust="#aebcff">
			<Layer depth={1.5}>
				<Svg>
					<OctagonTop f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1.15}>
				<Svg>
					<Crowd seed="top1" x0={-200} x1={2120} y0={20} y1={170} n={34} f={f} color="#05070f" up={0.9} />
					<Crowd seed="top2" x0={-200} x1={2120} y0={930} y1={1100} n={30} f={f} color="#05070f" up={0.9} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<DayPlate x={960} y={560} value={counterAt(gf)} s={1.5} />
				</Svg>
			</Layer>
			<Layer depth={0.62}>
				<Svg>
					<Crowd seed="near" x0={-100} x1={2020} y0={1000} y1={1180} n={9} f={f} color="#02030a" up={1} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* title on black (the 2 s pause after 001) */
const S02: React.FC = () => {
	const {f, dur} = useShot();
	const o = interpolate(f, [0, 10, dur - 8, dur], [0, 1, 1, 0], clamp);
	const z = 1 + 0.05 * (f / dur);
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{opacity: o, transform: `scale(${z})`, textAlign: 'center', fontFamily: FONT, fontWeight: 800, color: '#fff', lineHeight: 1.2, padding: '0 120px'}}>
				<div style={{fontSize: 98}}>В этой истории UFC руководит</div>
				<div style={{fontSize: 112, color: '#ffc94a', marginTop: 6}}>вымышленный герой</div>
			</div>
		</AbsoluteFill>
	);
};

/* 002–003: the title over the arena, then Kostya's silhouette at the fence */
const S03: React.FC = () => {
	const {f, gf, at} = useShot();
	const cut = at('003') - 6;
	const ph = f < cut ? 0 : 1;
	const camA = usePush(camOn(960, 560, 1.0), camOn(960, 590, 1.12));
	const camB = usePush(camOn(900, 540, 1.1), camOn(840, 560, 1.4));
	const tk = spring01(f, 4, 14);
	const blinkOn = f < cut ? (Math.floor(f / 5) % 3 === 0 ? 0.35 : 1) : 1;
	const fl = flash(f, cut, 8);
	return (
		<>
			{ph === 0 ? (
				<Stage cam={camA} bg="#070914" light={{night: true, o: 0.3}} dust="#aebcff">
					<Layer depth={1.5}>
						<Svg>
							<OctagonTop f={gf} />
						</Svg>
					</Layer>
					<Layer depth={1}>
						<Svg>
							<DayPlate x={960} y={470} value={counterAt(gf)} s={1.2} blink={blinkOn} />
							<g transform={`translate(960,760) scale(${0.7 + 0.3 * tk})`} opacity={tk}>
								<text textAnchor="middle" y={0} fontSize={170} fontFamily={FONT} fontWeight={900} fill="#ffc94a" stroke="#0b0d1e" strokeWidth={10} paintOrder="stroke">
									ЧТО ЕСЛИ…
								</text>
								<text textAnchor="middle" y={110} fontSize={96} fontFamily={FONT} fontWeight={900} fill="#fff" stroke="#0b0d1e" strokeWidth={8} paintOrder="stroke">
									UFC НА ОДИН ГОД?
								</text>
							</g>
						</Svg>
					</Layer>
				</Stage>
			) : (
				<Stage cam={camB} bg="#090b1d" light={{night: true, o: 0.25}}>
					<Layer depth={1.4}>
						<Svg>
							<CageSide f={gf} />
						</Svg>
					</Layer>
					<Layer depth={1.2}>
						<Svg>
							<ellipse cx={960} cy={560} rx={620} ry={420} fill="#e8f0ff" opacity={0.16} style={{filter: 'blur(40px)'}} />
						</Svg>
					</Layer>
					<Layer depth={1}>
						<Svg>
							<g style={dark}>
								<Actor who="hero" x={900} floor={FL} s={HS} facing={1} faceTurn={0} look={[0, 0]} pose={{...idle(gf, 3), armF: [18, 100], armB: [10, 100], lean: 2}} uid="h3" shadow={false} />
							</g>
						</Svg>
					</Layer>
				</Stage>
			)}
			{fl > 0.02 ? <AbsoluteFill style={{background: '#fff', opacity: fl * 0.7}} /> : null}
		</>
	);
};

/* 004: «Давай отмотаем назад. На 365 дней.» — the plate rolls 0 → 365 */
const S04: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(960, 540, 1.0), camOn(960, 520, 1.18));
	const v = counterAt(gf);
	const streak = (i: number) => ((f * (26 + i * 7) + i * 311) % 2600) - 340;
	return (
		<Stage cam={cam} bg="#0a0c20" light={{night: true, o: 0.3}} dust="#aebcff">
			<Layer depth={1.4}>
				<Svg>
					{Array.from({length: 12}).map((_, i) => (
						<rect key={i} x={streak(i)} y={80 + i * 80} width={280 + (i % 3) * 120} height={8} rx={4} fill="#8fa3e8" opacity={0.18 + (i % 4) * 0.06} />
					))}
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<DayPlate x={960} y={760} value={v} s={2.5} />
					{[-1, 1].map((d) => (
						<g key={d} transform={`translate(${960 + d * 640},520)`} opacity={0.5 + 0.5 * Math.sin(f / 3 + d)}>
							<polygon points={`${d * 60},-70 ${-d * 40},0 ${d * 60},70`} fill="#ffc94a" />
							<polygon points={`${d * 150},-70 ${d * 50},0 ${d * 150},70`} fill="#ffc94a" opacity={0.6} />
						</g>
					))}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------------------------------------------------------------- PART 2 */

/* 005: the studio, Kostya shouts at the camera, the chat throws flames */
const S05: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(1000, 560, 1.1), camOn(900, 520, 1.42));
	const pump = Math.sin(f / 4.5);
	const p: Pose = {...idle(gf, 2), lean: 6 + pump * 3, armF: [150 + pump * 14, 24], armB: [-130 - pump * 10, 24], head: pump * 4};
	return (
		<Stage cam={cam} bg="#2b2046" light={{x: 24, y: 8, o: 0.4}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1.1}>
				<Svg>
					<ChatFlames f={f} x={1280} y={560} n={14} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={820} floor={FL} s={HS} facing={1} faceTurn={0.1} look={[0.9, 0]} expr="wide" pose={p} bob={Math.abs(pump) * 5} uid="h5" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 006: the envelope with the key card */
const S06: React.FC = () => {
	const {f, gf, at} = useShot();
	const t0 = at('006');
	const cam = usePush(camOn(940, 560, 1.05), camOn(1000, 560, 1.32));
	const open = spring01(f, t0 + 40, 14);
	const card = spring01(f, t0 + 150, 26);
	const st = spring01(f, t0 + 175, 8);
	const wow = env(f, t0 + 40, t0 + 200, 10, 12);
	const p = gesture('touchFace', idle(gf, 4), wow * 0.8, f);
	return (
		<Stage cam={cam} bg="#2b2046" light={{x: 24, y: 8, o: 0.4}}>
			<Layer depth={1.6}>
				<Svg>
					<Studio f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Envelope x={1160} y={600} s={1.15} open={open} card={card} t={f} />
					<Stamp x={1420} y={850} text="ВЫМЫСЕЛ" k={st} rot={-10} />
					<Actor who="hero" x={560} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.9, -0.1]} expr={wow > 0.5 ? 'wide' : 'normal'} pose={p} armOver={wow > 0.6} uid="h6" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 007–008: the plate lights up over Kostya, he jumps up and knocks the mug over */
const S07: React.FC = () => {
	const {f, gf, at} = useShot();
	const t7 = at('007');
	const t8 = at('008');
	const cam = usePush(camOn(960, 520, 1.12), camOn(900, 480, 1.34));
	const k = spring01(f, t7 + 40, 14);
	const jump = env(f, t8 + 2, t8 + 30, 5, 8);
	const hx = 860;
	const up = gesture('fist', {...idle(gf, 6), armF: [160, 20], armB: [-150, 20], lean: -3}, jump, f);
	const mug = spring01(f, t8 + 14, 12);
	const fl = flash(f, t7 + 40, 10);
	return (
		<Stage cam={cam} bg="#2b2046" light={{x: 24, y: 8, o: 0.4}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g transform={`translate(1160,${694}) rotate(${mug * 70}) translate(-1160,-694)`}>
						<rect x={1136} y={654} width={50} height={46} rx={7} fill="#e8e4d8" stroke="#0d0d1c" strokeWidth={4} />
					</g>
					{mug > 0.2 ? <ellipse cx={1250} cy={720} rx={60 * mug} ry={9} fill="#6b4a2c" opacity={0.8} /> : null}
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.6, -0.4]} expr={jump > 0.3 ? 'wide' : 'normal'} pose={f < t7 + 40 ? idle(gf, 6) : up} bob={jump * 46} uid="h7" />
					<Reveal k={k} x={hx} y={headTop(HS) - 26}>
						<HeroPlate x={hx} s={0.95} />
					</Reveal>
				</Svg>
			</Layer>
			{fl > 0.02 ? <AbsoluteFill style={{background: '#fff3c8', opacity: fl * 0.5}} /> : null}
		</Stage>
	);
};

/* 009: the office, Irma does not look up; Kostya walks in from the left */
const S09: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(960, 560, 1.0), camOn(1080, 540, 1.3));
	const w = walkTo(f, 6, 80, -260, 600, 1, 0.32);
	const ip: Pose = reach({...idle(gf, 1), lean: 3, head: 12}, 'F', toLocal(1160, 640, 1280, FL - 157 * IS, IS, -1), 1);
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="irma" x={1280} floor={FL} s={IS} facing={-1} faceTurn={0.2} look={[0, 0.7]} mouth="flat" pose={{...ip, armF: [-52, 70]}} uid="i9" />
					<Actor who="hero" x={w.x} floor={FL} s={HS} facing={1} faceTurn={w.moving ? 0.6 : 0.3} look={[0.8, 0]} pose={w.pose} vx={w.vx} bob={w.bob} uid="h9" />
					<HeroPlate x={w.x} s={0.95} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 010–012: «Бой века. Записала.» — «Вы мне не верите?» — «Я верю весам.» */
const S10: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp = useSpeaking(gf);
	const cam0 = sp === 'IRMA' ? camOn(1180, 520, 1.5) : sp === 'HERO' ? camOn(760, 470, 1.5) : camOn(960, 560, 1.12);
	const push = interpolate(f, [0, 130], [0, 1], clamp);
	const cam = mixCam(cam0, {...cam0, zoom: cam0.zoom * 1.08, x: cam0.x * 1.08}, push);
	const check = spring01(f, at('010') + 26, 10);
	const lean = env(f, at('011'), at('011') + 40, 8, 10);
	const nod = env(f, at('012'), at('012') + 30, 8, 10);
	const hp: Pose = {...idle(gf, 5), lean: 5 + 14 * lean, head: -6 * lean};
	const ip: Pose = reach({...idle(gf, 1), lean: 2, head: 4 + 12 * nod}, 'F', toLocal(1180, 650, 1220, FL - 157 * IS, IS, -1), 1);
	const scaleGlow = env(f, at('012') + 8, at('012') + 36, 6, 8);
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
					<rect x={1596} y={574} width={140} height={62} rx={12} fill="#6ff0a0" opacity={0.55 * scaleGlow} style={{filter: 'blur(8px)'}} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="irma" x={1220} floor={FL} s={IS} facing={-1} faceTurn={0.25} look={nod > 0.3 ? [0.9, 0.2] : [-0.2, 0.7]} mouth={nod > 0.3 ? 'smirk' : 'flat'} pose={{...ip, armF: [-52, 70]}} uid="i10" />
					<Actor who="hero" x={780} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.8, 0]} expr={lean > 0.3 ? 'worried' : 'normal'} pose={hp} uid="h10" />
					<HeroPlate x={780} s={0.95} />
					{check > 0 ? (
						<g transform={`translate(1100,500) scale(${check * 1.1})`}>
							<circle r={64} fill="#11142c" stroke="#6ff0a0" strokeWidth={6} />
							<path d="M-30,2 L-8,26 L32,-22" stroke="#6ff0a0" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</g>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 013: the owners' box, Kostya on the phone with his back to the cage */
const S11: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(900, 560, 1.05), camOn(840, 540, 1.38));
	const wv = Math.sin(f / 5);
	const base: Pose = {...idle(gf, 7), lean: 4, armB: [60 + wv * 50, 40 + wv * 16]};
	const p = reach(base, 'F', [38, -168], 1);
	return (
		<Stage cam={cam} bg="#0a0c1f" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<VipBox f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={900} floor={FL} s={HS} facing={-1} faceTurn={0.3} look={[-0.8, 0]} mouth="open" pose={p} handF="fist" uid="h11" />
					<HeroPlate x={900} s={0.95} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* fall: rotates the whole actor around the floor point */
const fall = (f: number, t0: number, dir: 1 | -1) => dir * 84 * Math.min(spring01(f, t0, 7), 1 - spring01(f, t0 + 34, 14));

/* 014: Senya and Tayo trade blows, both fall and stand up, the hall jumps */
const S12: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(940, 640, 1.05), camOn(960, 620, 1.3));
	const SX = 840;
	const TX = 1090;
	const sc = 1.3;
	const beat = (t0: number, per: number) => env(f, t0, t0 + per, 3, per * 0.4);
	const sPunch = Math.max(beat(4, 12), beat(28, 12), beat(52, 12));
	const tPunch = Math.max(beat(16, 12), beat(40, 12), beat(64, 12));
	const sp = hit(guard(idle(gf, 1), 1), 'F', SX, sc, 1, [TX - 60, hip(sc) - 150 * sc], sPunch);
	const tp = hit(guard(idle(gf, 2), 1), 'F', TX, sc, -1, [SX + 60, hip(sc) - 150 * sc], tPunch);
	const sa = f > 76 ? fall(f, 78, -1) : 0;
	const ta = f > 76 ? fall(f, 84, 1) : 0;
	const shake = f > 76 && f < 96 ? 6 : 0;
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Layer depth={1.4}>
				<Svg>
					<CageSide f={gf} shake={shake} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g transform={`rotate(${sa} ${SX} ${FL})`}>
						<Actor who="senya" x={SX} floor={FL} s={sc} facing={1} faceTurn={0.4} look={[0.8, 0]} expr={sa !== 0 ? 'wide' : 'angry'} pose={sp} bob={Math.abs(Math.sin(f / 6)) * 3} uid="s12" />
					</g>
					<g transform={`rotate(${ta} ${TX} ${FL})`}>
						<Actor who="tayo" x={TX} floor={FL} s={sc} facing={-1} faceTurn={0.4} look={[-0.8, 0]} expr={ta !== 0 ? 'wide' : 'angry'} pose={tp} bob={Math.abs(Math.sin(f / 6 + 1)) * 3} uid="t12" />
					</g>
				</Svg>
			</Layer>
			<Layer depth={0.62}>
				<Svg>
					<Crowd seed="fgc" x0={-100} x1={2020} y0={1010} y1={1190} n={8} f={f} color="#02030a" up={f > 140 ? 1 : 0.5} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 015: the scoreboard shakes, the two surnames are small on the poster */
const S13: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(960, 420, 1.0), camOn(960, 360, 1.3));
	const sway = 2 + 5 * interpolate(f, [0, 70], [0, 1], clamp);
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Layer depth={1.4}>
				<Svg>
					<HallFar f={gf} cage={false} up={1} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Scoreboard x={960} y={210} f={gf} sway={sway} />
				</Svg>
			</Layer>
			<Layer depth={0.62}>
				<Svg>
					<Crowd seed="fg13" x0={-100} x1={2020} y0={1010} y1={1190} n={8} f={f} color="#02030a" up={1} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 016–017: «Что там? Кто-то упал?» — Kostya glances back, then returns to the call */
const S14: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(900, 560, 1.1), camOn(860, 540, 1.36));
	const glance = env(f, at('016') - 2, at('016') + 50, 8, 8);
	const turn = env(f, at('017') + 40, at('017') + 200, 10, 10);
	const base: Pose = {...idle(gf, 9), lean: 4, armB: [30, 40]};
	const p = reach(base, 'F', [38, -168], 1 - glance * 0.7);
	return (
		<Stage cam={cam} bg="#0a0c1f" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<VipBox f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1.2}>
				<Svg>
					<Crowd seed="v14" x0={-100} x1={2020} y0={560} y1={700} n={26} f={f} color="#080a1a" up={1} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={900} floor={FL} s={HS} facing={glance > 0.4 ? 1 : -1} faceTurn={0.3} look={glance > 0.4 ? [0.8, -0.2] : [-0.8, 0]} expr={glance > 0.4 ? 'worried' : 'normal'} mouth={glance > 0.4 ? 'open' : undefined} pose={p} uid="h14" />
					<HeroPlate x={900} s={0.95} />
				</Svg>
			</Layer>
			{turn > 0 ? null : null}
		</Stage>
	);
};

/* ---------------------------------------------------------------- PART 3 */

/* 018–019: the heavyweight champion throws his pass on the desk and wants to leave */
const S15: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp = useSpeaking(gf);
	const t0 = at('018');
	const cam0 = sp === 'HERO' ? camOn(1470, 480, 1.45) : camOn(980, 540, 1.0);
	const push = interpolate(f, [0, 220], [0, 1], clamp);
	const cam = mixCam(cam0, {...cam0, zoom: cam0.zoom * 1.12, x: cam0.x * 1.12 + 20}, push);
	const w = walkTo(f, 4, 70, -300, 640, 3, 0.3);
	const fly = spring01(f, t0 + 100, 22);
	const bub = f - (t0 + 30);
	const shrug = env(f, at('019'), at('019') + 50, 8, 10);
	const hp = gesture('shrug', idle(gf, 3), shrug, f);
	const throwK = env(f, t0 + 90, t0 + 130, 8, 10);
	const hv: Pose = {...w.pose, armF: f > 80 ? [100 * throwK, 50] : w.pose.armF};
	const cx = 760 + (1040 - 760) * fly;
	const cy = 640 + (700 - 640) * fly - Math.sin(fly * Math.PI) * 130;
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="irma" x={1180} floor={FL} s={IS} facing={-1} faceTurn={0.3} look={[0, 0.6]} mouth="flat" pose={{...idle(gf, 1), armF: [-52, 70]}} uid="i15" />
					<Actor who="heavy" x={w.x} floor={FL} s={1.05} facing={1} faceTurn={0.5} look={[0.8, 0]} expr={f > 80 ? 'angry' : 'normal'} pose={hv} vx={w.vx} bob={w.bob} uid="v15" />
					<Actor who="hero" x={1480} floor={FL} s={HS} facing={-1} faceTurn={0.5} look={[-0.7, 0]} mouth={shrug > 0.4 ? 'smile' : undefined} pose={hp} uid="h15" />
					<HeroPlate x={1480} s={0.95} />
					{fly > 0 && fly < 1 ? (
						<g transform={`translate(${cx},${cy}) rotate(${fly * 520})`}>
							<rect x={-70} y={-44} width={140} height={88} rx={10} fill="#ffe08a" stroke="#0d0d1c" strokeWidth={5} />
							<rect x={-70} y={-44} width={140} height={22} fill="#d9372b" />
						</g>
					) : null}
					{fly >= 1 ? (
						<g transform="translate(1040,672) rotate(-6)">
							<rect x={-70} y={-16} width={140} height={32} rx={8} fill="#ffe08a" stroke="#0d0d1c" strokeWidth={4} />
						</g>
					) : null}
					{bub > 0 ? (
						<Bubble x={650} y={290} w={640} h={150} t={bub} tail={[0, 150]}>
							<text x={0} y={22} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
								Я ВОРОН. УХОЖУ
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 020–021: the contract, the stylus underlines one line */
const S17: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(900, 520, 1.0), camOn(920, 530, 1.2));
	const under = spring01(f, at('020') + 36, 60);
	const poke = env(f, at('021') + 6, at('021') + 24, 4, 8);
	const pen: [number, number] = [700 - 290 * 1.35 + 580 * 1.35 * under, 520 + 80 * 1.35];
	const ip = reach({...idle(gf, 1), lean: 8, head: 8}, 'F', toLocal(Math.min(pen[0], 1120), pen[1] + 4, 1300, FL - 157 * IS, IS, -1), 1);
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 60, y: 10, o: 0.35}}>
			<Layer depth={1.5}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Contract x={700} y={520} s={1.35} under={under} glow={poke} />
					<Actor who="irma" x={1300} floor={FL} s={IS} facing={-1} faceTurn={0.3} look={[-0.7, 0.4]} mouth="flat" pose={ip} handF="point" uid="i17" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 022: the clause says it plainly; the heavyweight sits back down, his cloud deflates */
const S19: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(960, 540, 1.0), camOn(1000, 560, 1.15));
	const ban = spring01(f, at('022') + 10, 16);
	const sag = spring01(f, at('022') + 150, 40);
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="irma" x={620} floor={FL} s={IS} facing={1} faceTurn={0.3} look={[0.4, 0.5]} mouth="flat" pose={{...idle(gf, 1), armF: [52, 70]}} uid="i19" />
					<Chair x={1400} y={800} facing={-1} />
					<Actor who="heavy" x={1400} floor={FL} s={1.05} seat={790} facing={-1} faceTurn={0.4} look={[-0.6, 0.3]} expr={sag > 0.3 ? 'sad' : 'angry'} pose={{...idle(gf, 4), armF: [40, 80], armB: [30, 80], legB: [88, 85], legF: [92, 90], lean: -4}} uid="v19" shadow={false} />
					<g transform={`translate(980,${590 + 60 * sag}) rotate(${-12 * sag}) scale(${1 - 0.5 * sag})`} opacity={1 - 0.55 * sag}>
						<rect x={-250} y={-60} width={500} height={120} rx={30} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={6} />
						<text x={0} y={20} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
							{sag > 0.6 ? '…' : 'УХОЖУ'}
						</text>
					</g>
					<g transform={`translate(960,${340 + (1 - ban) * -60}) scale(${0.7 + 0.3 * ban})`} opacity={ban}>
						<rect x={-520} y={-110} width={1040} height={230} rx={34} fill="#11142c" stroke="#ffc94a" strokeWidth={6} />
						<text x={0} y={-12} textAnchor="middle" fontSize={78} fontFamily={FONT} fontWeight={900} fill="#ffe9a8">
							ПОКА ЧЕМПИОН:
						</text>
						<text x={0} y={80} textAnchor="middle" fontSize={78} fontFamily={FONT} fontWeight={900} fill="#fff">
							+3 БОЯ ИЛИ +1 ГОД
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 023: Kostya shows a thumb up, Irma does not look */
const S20: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(960, 560, 1.1), camOn(1000, 540, 1.4));
	const th = env(f, 18, 90, 8, 8);
	const hp = gesture('fist', {...idle(gf, 3), armF: [140, 30]}, th, f);
	const pop = spring01(f, 24, 10);
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={840} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, -0.1]} mouth="smile" pose={hp} uid="h20" />
					<HeroPlate x={840} s={0.95} />
					<Actor who="irma" x={1340} floor={FL} s={IS} facing={-1} faceTurn={0.2} look={[0.8, 0.6]} mouth="flat" pose={{...idle(gf, 1), armF: [-52, 70]}} uid="i20" />
					<g transform={`translate(${1010},${470}) scale(${pop})`} opacity={pop}>
						<circle r={74} fill="#11142c" stroke="#ffc94a" strokeWidth={6} />
						<path d="M-20,34 L-20,-4 L10,-44 C26,-44 26,-24 20,-8 L40,-8 C52,-8 52,14 44,30 C40,40 -6,40 -20,34 Z" fill="#ffc94a" />
						<rect x={-44} y={-6} width={20} height={44} rx={5} fill="#ffc94a" />
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 024: Kostya drags the date a week later on the wall calendar */
const S21: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(1000, 520, 1.1), camOn(980, 530, 1.4));
	const drag = spring01(f, at('024') + 70, 30);
	const shift = 7 * drag;
	// the ring is drawn by Calendar at (CX + col, CY + row): column 0, rows 2 → 3 (+7 days)
	const CX = 1100;
	const CY = 470;
	const ringX = CX - 3 * 78;
	const ringY = CY - 70 + 78 * (2 + drag);
	const hp = reach({...idle(gf, 3), lean: 6}, 'F', toLocal(ringX, ringY, 730, FL - 157 * HS, HS, 1), 1);
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 60, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Calendar x={CX} y={CY} s={1} shift={shift} glow={drag} />
					<Actor who="hero" x={730} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.8, -0.2]} mouth="smirk" pose={hp} handF="point" uid="h21" />
					<HeroPlate x={730} s={0.95} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 025–026: the video call; the broadcaster answers in one line */
const S22: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp = useSpeaking(gf);
	const cam0 = sp === 'N' && f > at('026') - 4 ? camOn(1230, 520, 1.15) : camOn(900, 520, 1.1);
	const push = interpolate(f, [0, 140], [0, 1], clamp);
	const cam = mixCam(cam0, {...cam0, zoom: cam0.zoom * 1.08, x: cam0.x * 1.08}, push);
	const pt = env(f, at('025'), at('025') + 70, 8, 10);
	const hp = gesture('point', {...idle(gf, 3), armF: [140, 40]}, pt, f);
	const bub = f - (at('026') + 8);
	return (
		<Stage cam={cam} bg="#2b2046" light={{x: 24, y: 8, o: 0.4}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={1000} y={150} width={760} height={430} rx={30} fill="#11142c" stroke="#8fa3e8" strokeWidth={6} />
					<rect x={1024} y={200} width={712} height={356} rx={16} fill="#2a3150" />
					<circle cx={1044} cy={176} r={9} fill="#ff6a5a" />
					<circle cx={1074} cy={176} r={9} fill="#ffd34a" />
					<circle cx={1104} cy={176} r={9} fill="#6ff0a0" />
					<TvLogo x={1380} y={390} s={1.5} />
					<Actor who="hero" x={760} floor={FL} s={HS} facing={1} faceTurn={0.2} look={[0.3, 0]} mouth="smile" pose={hp} handF={pt > 0.4 ? 'point' : undefined} uid="h22" />
					<HeroPlate x={760} s={0.95} />
					{bub > 0 ? (
						<Bubble x={1380} y={700} w={740} h={190} t={bub} tail={[0, -150]}>
							<text x={0} y={-8} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
								ЭФИР СТОИТ.
							</text>
							<text x={0} y={56} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
								ДАТА СТОИТ.
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 027: the date snaps back like a magnet; the plate does not even blink */
const S23: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(1000, 520, 1.1), camOn(980, 530, 1.38));
	const back = spring01(f, at('027') + 6, 10);
	const shift = 7 * (1 - back);
	const hp = gesture('shrug', idle(gf, 3), env(f, at('027') + 40, at('027') + 110, 10, 10), f);
	const snap = flash(f, at('027') + 12, 8);
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 60, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Calendar x={1100} y={470} s={1} shift={shift} glow={back} />
					<g transform="translate(1560,330)">
						<path d="M-40,60 L-40,-20 A40,40 0 0 1 40,-20 L40,60" stroke="#d9372b" strokeWidth={26} fill="none" />
						<rect x={-53} y={44} width={26} height={22} fill="#e4e6ec" />
						<rect x={27} y={44} width={26} height={22} fill="#e4e6ec" />
					</g>
					<Actor who="hero" x={730} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.8, -0.2]} mouth="smile" pose={hp} uid="h23" />
					<HeroPlate x={730} s={0.95} />
				</Svg>
			</Layer>
			{snap > 0.02 ? <AbsoluteFill style={{background: '#fff', opacity: snap * 0.5}} /> : null}
		</Stage>
	);
};

/* parts 4–11: scenes are not written yet */
const S28: React.FC = () => (
	<AbsoluteFill style={{background: '#0b0d1e', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, color: '#fff', fontSize: 72, textAlign: 'center'}}>
		<div>
			ЧАСТИ 4–11
			<div style={{fontSize: 54, color: '#ffc94a', marginTop: 12}}>сцены ещё не написаны</div>
		</div>
	</AbsoluteFill>
);

export const SHOTS: ShotDef[] = [
	{at: '001', C: S01},
	{at: '001', off: 204, C: S02, own: true, ownCuts: []},
	{at: '002', C: S03, own: true, ownCuts: [95]},
	{at: '004', C: S04},
	{at: '005', C: S05, whip: true},
	{at: '006', C: S06},
	{at: '007', C: S07},
	{at: '009', C: S09, whip: true},
	{at: '010', C: S10},
	{at: '013', C: S11, whip: true},
	{at: '014', C: S12},
	{at: '015', C: S13},
	{at: '016', C: S14},
	{at: '018', C: S15, whip: true},
	{at: '020', C: S17},
	{at: '022', C: S19},
	{at: '023', C: S20},
	{at: '024', C: S21},
	{at: '025', C: S22},
	{at: '027', C: S23},
	{at: '028', C: S28},
];
