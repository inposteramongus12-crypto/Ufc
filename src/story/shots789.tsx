import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose, frontHand, toLocal} from '../engine/Stickman';
import {Layer, Svg} from '../engine/camera';
import {Chair} from '../engine/props';
import {SIT, blend, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot, useSpeaking} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn, clamp, ease, flash, mixCam, Extra, Stage} from '../kit/kit';
import {Bubble, FONT} from '../kit/ui';
import {Calendar, DayPlate, FL, HS, HeroPlate, IS, Office, SafeBox, Stamp, Studio, TvLogo, headTop} from './places';
import {Cheque, FlashBurst, PressRoom, TrainRoom, Yard, Bulldozer} from './places2';
import {
	Billboard, BigText, CardboardVoron, Chain, Coin, Door, EmptySlotPoster, MedRoom, Mats, Mic, NightOffice, OtherContract, Parachute, Phone, PopCloud, Poof, Bus, Street, SplitContracts, Tubes, UnderCard, Wallet, WallFrame, sp,
} from './places3';
import {counterAt} from '../kit/core';

/* Parts 7–9 (lines 053–078, 3:47–5:32). Plate «ДО ТУРНИРА N ДНЕЙ» follows the day table:
   90 (053) → 60 (062) → 50 (063) → 45 (064) → 22 (067) → 20 (допуск) → 6 (069).
   No «Чирк» in the script: the number rolls once per key. Voron is `voron` everywhere. Nothing is marked as «decoration» to get past check-edges. */

type Cam = ReturnType<typeof camOn>;
const NAVY = '#11142c';
const pick = (sp0: string | null, m: Record<string, Cam>, d: Cam) => (sp0 && m[sp0] ? m[sp0] : d);
const push = (f: number, len: number, a: Cam, b: Cam) => mixCam(a, b, interpolate(f, [0, len], [0, 1], {...clamp, easing: ease}));
const slow = (f: number, len: number, c: Cam, amt = 1.1) => push(f, len, c, {...c, zoom: c.zoom * amt, x: c.x * amt + 12});
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const Banner: React.FC<{x: number; y: number; lines: string[]; size?: number; fill?: string; border?: string; k?: number}> = ({x, y, lines, size = 76, fill = NAVY, border = '#ffc94a', k = 1}) => {
	const w = Math.max(...lines.map((l) => l.length)) * size * 0.64 + 90;
	const h = lines.length * size * 1.15 + 40;
	return k <= 0 ? null : (
		<SafeBox x={x} y={y} left={w / 2 + 8} right={w / 2 + 8} top={h / 2 + 8} bottom={h / 2 + 8}>
			<g transform={`translate(${x},${y}) scale(${0.7 + 0.3 * k})`} opacity={Math.min(1, k * 2)}>
				<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill={fill} stroke={border} strokeWidth={6} />
				{lines.map((l, i) => (
					<text key={i} x={0} y={-h / 2 + 20 + size * 0.9 + i * size * 1.15} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill="#fff">
						{l}
					</text>
				))}
			</g>
		</SafeBox>
	);
};

/* ---------------------------------------------------------------- PART 7 */

/* 053: Rex walks in without knocking and puts another league's contract on the desk */
const S53: React.FC = () => {
	const {f, gf, at} = useShot();
	const t0 = at('053');
	const cam = push(f, 215, camOn(960, 540, 1.0), camOn(1020, 520, 1.2));
	const door = env(f, t0 + 4, t0 + 120, 6, 10);
	const w = walkTo(f, t0 + 12, t0 + 80, 1470, 1200, 6, 0.3);
	const slap = sp(f, t0 + 100, 6);
	const rp = slap > 0 ? reach(w.pose, 'F', toLocal(960, 640, 1200, FL - 157 * 1.15, 1.15, -1), env(f, t0 + 96, t0 + 130, 6, 14)) : w.pose;
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
					<Door x={1450} open={door} f={f} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Chair x={620} y={800} facing={1} />
					<Actor who="hero" x={620} floor={FL} seat={790} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0.1]} mouth="smile" pose={{...SIT, ...idle(gf, 3), legB: SIT.legB, legF: SIT.legF}} uid="h53" shadow={false} />
					<HeroPlate x={620} y={headTop(HS) + 100 - 84} s={0.95} dx={30} />
					<Actor who="rex" x={w.x} floor={FL} s={1.15} facing={w.facing} faceTurn={0.4} look={[-0.8, 0]} mouth="flat" pose={rp} vx={w.vx} bob={w.bob} uid="r53" />
					{slap > 0 ? <OtherContract x={900} y={540} s={0.62} rot={-6} /> : null}
					<Stamp x={1260} y={300} text="ЛИГА ВЫМЫШЛЕННАЯ" k={sp(f, t0 + 150, 8)} rot={-5} c="#2f6fd8" size={56} bg="#fbf8ef" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 054–056: Rex taps the contract; Kostya jumps up and knocks the chair over; Rex turns to the door */
const S54: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp0 = useSpeaking(gf);
	const up = f > at('055') + 2;
	const tap = Math.max(env(f, at('054') + 40, at('054') + 52, 3, 3), env(f, at('054') + 60, at('054') + 72, 3, 3));
	const fall = sp(f, at('055') + 4, 12);
	const turn = f > at('056') + 6;
	const rx = turn ? lerp(1200, 1330, sp(f, at('056') + 16, 60)) : 1200;
	const rp = reach({...idle(gf, 4), lean: 4}, 'F', toLocal(960, 640 - 18 * tap, 1200, FL - 157 * 1.15, 1.15, -1), turn ? 0 : 1);
	const jump = env(f, at('055') + 2, at('055') + 26, 4, 8);
	const hp = up ? gesture('fist', {...idle(gf, 3), armF: [150, 20], armB: [-140, 20]}, jump, f) : idle(gf, 3);
	const cam0 = pick(sp0, {REX: camOn(1200, 500, 1.2), HERO: camOn(700, 500, 1.2)}, camOn(1000, 540, 1.05));
	return (
		<Stage cam={slow(f, 215, cam0, 1.05)} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
					<Door x={1450} open={0} f={f} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<OtherContract x={900} y={540} s={0.62} rot={-6} />
					<g transform={`translate(620,${800}) rotate(${-fall * 80} 0 130) translate(-620,-800)`}>
						<Chair x={620} y={800} facing={1} />
					</g>
					<Actor who="hero" x={up ? 640 : 620} floor={FL} seat={up ? undefined : 790} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0.1]} expr={up ? 'angry' : 'worried'} mouth={up ? 'open' : undefined} pose={hp} bob={jump * 40} uid="h54" shadow={!!up} />
					<HeroPlate x={up ? 640 : 620} y={up ? undefined : headTop(HS) + 100 - 84} s={0.95} dx={30} />
					<Actor who="rex" x={rx} floor={FL} s={1.15} facing={turn ? 1 : -1} faceTurn={0.4} look={turn ? [0.8, 0] : [-0.8, 0]} mouth="flat" pose={turn ? idle(gf, 4) : rp} uid="r54" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 057: both contracts side by side, the same line underlined at the same time */
const S57: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 160, camOn(960, 520, 1.0), camOn(960, 520, 1.04));
	const under = sp(f, at('057') + 80, 40);
	return (
		<Stage cam={cam} bg="#2b2046" light={{x: 24, y: 8, o: 0.35}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} lampOn={0.5} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SplitContracts x={960} y={520} s={0.9} under={under} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 058–059: «Чемпион. Значит, продление.» — the line lights up red */
const S58: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 190, camOn(960, 540, 1.0), camOn(980, 520, 1.12));
	const tap = Math.max(env(f, at('058') + 18, at('058') + 28, 3, 3), env(f, at('058') + 34, at('058') + 44, 3, 3));
	const ip = reach({...idle(gf, 1), lean: 4}, 'F', toLocal(880, 560 - 16 * tap, 700, FL - 157 * IS, IS, 1), 1);
	const red = sp(f, at('059') + 12, 14);
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="irma" x={700} floor={FL} s={IS} facing={1} faceTurn={0.3} look={[0.6, -0.2]} mouth="flat" pose={ip} handF="point" uid="i58" />
					<Actor who="rex" x={1330} floor={FL} s={1.15} facing={-1} faceTurn={0.3} look={[-0.6, 0]} mouth="smirk" pose={idle(gf, 4)} uid="r58" />
					<Banner x={1000} y={330} lines={['+3 БОЯ ИЛИ +1 ГОД']} size={80} fill={red > 0.3 ? '#d9372b' : NAVY} border={red > 0.3 ? '#ffd0c8' : '#ffc94a'} k={sp(f, at('058') + 4, 12)} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 060–061: a drawn chain from Kostya's hand to Rex's collar; Rex puts his glasses on and slams the door */
const S60: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp0 = useSpeaking(gf);
	const t1 = at('061');
	const chain = sp(f, at('060') + 40, 60);
	const glasses = f > t1 + 12;
	const go = sp(f, t1 + 34, 70);
	const rx = lerp(1080, 1440, go);
	const slam = env(f, t1 + 106, t1 + 130, 2, 18);
	const kp = reach({...idle(gf, 3), lean: 6}, 'F', toLocal(1040, 600, 640, FL - 157 * HS, HS, 1), Math.min(1, chain * 1.4));
	const hand = frontHand(kp, 640, FL - 157 * HS, HS, 1);
	const rp = go > 0 && go < 1 ? walkTo(f, t1 + 34, t1 + 104, 1080, 1440, 4, 0.3).pose : idle(gf, 4);
	const cam0 = pick(sp0, {REX: camOn(1000, 520, 1.1)}, camOn(1000, 540, 1.0));
	return (
		<Stage cam={slow(f, 285, cam0, 1.08)} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
					<WallFrame x={1130} y={300} f={f} shake={slam} />
					<Door x={1450} open={env(f, t1 + 60, t1 + 108, 8, 3)} f={f} slam={slam} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={640} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0.1]} mouth="line" pose={kp} uid="h60" />
					<HeroPlate x={640} s={0.95} dx={30} />
					{go < 1 ? <Actor who="rex" x={rx} floor={FL} s={1.15} facing={go > 0 ? 1 : -1} faceTurn={0.4} look={[-0.7, 0]} mouth="flat" acc={glasses ? ['sunglasses', 'belt'] : ['belt']} pose={rp} uid="r60" /> : null}
					<Chain a={[hand[0], hand[1]]} b={[rx - 30, 590]} k={chain * (1 - go)} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------------------------------------------------------------- PART 8 */

/* 062: the tour starts: Kostya hands Rex a microphone */
const S62: React.FC = () => {
	const {f, gf, at} = useShot();
	const t0 = at('062');
	const cam = push(f, 165, camOn(960, 540, 1.0), camOn(960, 520, 1.2));
	const give = sp(f, t0 + 30, 40);
	const taken = f > t0 + 80;
	const kp = reach({...idle(gf, 3), lean: 4}, 'F', toLocal(lerp(860, 1000, give), 640, 700, FL - 157 * HS, HS, 1), 1);
	const rp = taken ? reach({...idle(gf, 4), lean: 2}, 'F', toLocal(1010, 640, 1180, FL - 157 * 1.15, 1.15, -1), 1) : idle(gf, 4);
	return (
		<Stage cam={cam} bg="#1b2150" light={{x: 40, y: 8, o: 0.35}}>
			<Layer depth={1.5}>
				<Svg>
					<PressRoom f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={700} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0]} mouth="smile" pose={kp} handItem={taken ? undefined : <Mic />} uid="h62" />
					<HeroPlate x={700} s={0.95} dx={30} />
					<Actor who="rex" x={1180} floor={FL} s={1.15} facing={-1} faceTurn={0.4} look={[-0.7, 0.1]} mouth="flat" pose={rp} handItem={taken ? <Mic /> : undefined} uid="r62" />
					<FlashBurst x={300} y={760} t={(f + 6) % 26} r={110} />
					<FlashBurst x={1650} y={700} t={(f + 15) % 30} r={110} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 063: montage of two stunts and billboards in every city (own cuts: parachute / bulldozer / billboards) */
const HUD: React.FC = () => {
	const {gf, f, dur} = useShot();
	const o = interpolate(f, [dur - 10, dur - 4], [1, 0], clamp); // gone before the whip into the next shot
	return (
		<SafeBox x={360} y={380} left={175} right={175} top={225} bottom={20}>
			<g opacity={o}>
				<DayPlate x={360} y={380} value={counterAt(gf)} s={1} />
			</g>
		</SafeBox>
	);
};
const S63: React.FC = () => {
	const {f, gf, dur} = useShot();
	if (f < 75) {
		const k = sp(f, 4, 56);
		const floor = lerp(620, FL, k);
		const cam = push(f, 75, camOn(960, 500, 1.0), camOn(960, 560, 1.15));
		return (
			<Stage cam={cam} bg="#1b2150" light={{x: 40, y: 8, o: 0.35}}>
				<Layer depth={1.5}>
					<Svg>
						<PressRoom f={gf} />
					</Svg>
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Parachute x={960} y={floor - 427 - 180} s={0.75 - 0.2 * sp(f, 56, 12)} />
						<Actor who="rex" x={960} floor={floor} s={1.15} facing={1} faceTurn={0.2} look={[0, 0]} expr="wide" mouth="open" pose={{...idle(gf, 4), armF: [150, 20], armB: [-150, 20]}} uid="r63a" shadow={k > 0.95} />
						<HUD />
						<FlashBurst x={1500} y={700} t={(f + 3) % 20} r={110} />
					</Svg>
				</Layer>
			</Stage>
		);
	}
	if (f < 150) {
		const l = f - 75;
		const bx = lerp(260, 760, sp(l, 4, 56));
		const fallK = sp(l, 58, 12);
		const cam = push(l, 75, camOn(760, 560, 1.0), camOn(900, 560, 1.22));
		return (
			<Stage cam={cam} bg="#9fd0ff" light={{x: 70, y: 6, o: 0.3}}>
				<Layer depth={1.5}>
					<Svg>
						<Yard />
					</Svg>
				</Layer>
				<Layer depth={1}>
					<Svg>
						<CardboardVoron x={1120} fall={fallK} />
						<Bulldozer x={bx} s={1.0} blade={0} />
						<Actor who="rex" x={bx} floor={FL} seat={560} s={1.0} facing={1} faceTurn={0.2} look={[0.7, 0]} mouth="open" pose={{...idle(gf, 4), armF: [150, 20], legB: [88, 85], legF: [92, 90], lean: -4}} shadow={false} uid="r63b" />
						<HUD />
					</Svg>
				</Layer>
			</Stage>
		);
	}
	const l = f - 150;
	const cam = push(l, 72, camOn(960, 560, 1.0), camOn(900, 540, 1.12));
	return (
		<Stage cam={cam} bg="#9fd0ff" light={{x: 70, y: 6, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Street f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					{[0, 1, 2].map((i) => (
						<g key={i} opacity={Math.min(sp(l, i * 14, 10), interpolate(f, [dur - 10, dur - 4], [1, 0], clamp))}>
							<Billboard x={960 + (i - 1) * 500} y={520} s={0.55 + 0.1 * sp(l, i * 14, 10)} />
						</g>
					))}
					<HUD />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 064–065: «Денег нет» — a wallet with a single coin, an empty card; Kostya looks at tricks on his phone */
const S64: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp0 = useSpeaking(gf);
	const t0 = at('064');
	const flip = sp(f, t0 + 8, 26);
	const coin = sp(f, t0 + 40, 36);
	const wave = Math.sin(f / 4);
	const kp = reach({...idle(gf, 3), lean: 4, armB: [-30 + wave * 40, 50]}, 'F', [30, -60], 1);
	const cam0 = pick(sp0, {IRMA: camOn(1100, 520, 1.1), HERO: camOn(900, 520, 1.08)}, camOn(1000, 540, 1.0));
	return (
		<Stage cam={slow(f, 160, cam0, 1.03)} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={640} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.3, 0.3]} mouth="smirk" pose={kp} handItem={<Phone x={0} y={-30} />} uid="h64" />
					<HeroPlate x={640} s={0.95} dx={40} />
					<Actor who="irma" x={1120} floor={FL} s={IS} facing={-1} faceTurn={0.3} look={[-0.2, 0.6]} mouth="flat" pose={{...idle(gf, 1), armF: [-60, 80]}} uid="i64" />
					<Wallet x={1200} y={640 - 10 * flip} flip={flip} />
					{coin > 0 ? <Coin x={1200 - 40 * coin} y={660 + 230 * coin * coin} spin={coin} /> : null}
					<UnderCard x={1440} y={400} s={0.42} k={0} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 066: two names appear on the card; behind the glass the rookies train, like 75 days ago */
const S66: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 168, camOn(960, 540, 1.0), camOn(1000, 530, 1.14));
	const k = sp(f, at('066') + 70, 30);
	const punch = (t: number) => env(f, t, t + 8, 2, 5);
	const sPunch = Math.max(punch(10), punch(34), punch(58), punch(82), punch(106), punch(130));
	const tPunch = Math.max(punch(22), punch(46), punch(70), punch(94), punch(118), punch(142));
	return (
		<Stage cam={cam} bg="#2b3350" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<rect x={-500} y={-300} width={2920} height={1300} fill="#cdd6e8" />
					<rect x={-500} y={900} width={2920} height={400} fill="#8d97ad" />
					<TrainRoom x={140} w={900} f={f} />
				</Svg>
			</Layer>
			<Layer depth={1.15}>
				<Svg>
					<g transform="translate(0,-90)">
						<Actor who="senya" x={380} floor={FL} s={0.9} facing={1} faceTurn={0.4} look={[0.8, 0]} pose={{...idle(gf, 1), armF: [60 + 40 * sPunch, 100 - 40 * sPunch], armB: [40, 105], lean: 6}} shadow={false} uid="s66" />
						<Actor who="tayo" x={800} floor={FL} s={0.9} facing={1} faceTurn={0.4} look={[0.8, 0]} pose={{...idle(gf, 2), armF: [60 + 40 * tPunch, 100 - 40 * tPunch], armB: [40, 105], lean: 6}} shadow={false} uid="t66" />
					</g>
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<UnderCard x={1400} y={520} s={0.62} k={k} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 067–068: tests and the commission's approval; Senya pockets the paper and leaves for the bag */
const Paper: React.FC = () => (
	<g transform="translate(20,-30) rotate(-12)">
		<rect x={-30} y={-40} width={60} height={80} rx={4} fill="#fff" stroke="#0d0d1c" strokeWidth={4} />
		<rect x={-18} y={-26} width={36} height={6} fill="#cde4e2" />
		<rect x={-18} y={-12} width={30} height={6} fill="#cde4e2" />
		<circle cx={8} cy={20} r={10} fill="#d9372b" />
	</g>
);
const S67: React.FC = () => {
	const {f, gf, at} = useShot();
	const t0 = at('067');
	const t8 = at('068');
	const cam = push(f, 205, camOn(960, 540, 1.0), camOn(1080, 520, 1.16));
	const fill = sp(f, t0 + 20, 40);
	const stamp = sp(f, t0 + 105, 8);
	const pocket = f > t8 + 16;
	const go = sp(f, t8 + 26, 66);
	const sx = lerp(1420, 2100, go);
	const wp = go > 0 && go < 1 ? walkTo(f, t8 + 26, t8 + 92, 1420, 2100, 5, 0.3).pose : idle(gf, 5);
	return (
		<Stage cam={cam} bg="#d8efee" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<MedRoom />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Tubes x={960} y={700} k={fill} />
					<Actor who="hero" x={400} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0.2]} mouth="line" pose={idle(gf, 3)} uid="h67" />
					<HeroPlate x={400} s={0.95} />
					<Actor who="senya" x={sx} floor={FL} s={1.2} facing={go > 0 ? 1 : -1} faceTurn={0.4} look={[-0.7, 0.2]} pose={wp} handItem={pocket ? undefined : <Paper />} uid="s67" />
					<Actor who="tayo" x={1700} floor={FL} s={1.2} facing={-1} faceTurn={0.4} look={[-0.7, 0.2]} pose={idle(gf, 6)} uid="t67" />
					<Stamp x={1480} y={300} text="ДОПУЩЕН" k={stamp} rot={-6} c="#1f9d55" size={72} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------------------------------------------------------------- PART 9 */

/* 069: the last stop: Rex on the roof of the bus, Kostya below shows a thumb up */
const S69: React.FC = () => {
	const {f, gf} = useShot();
	const cam = push(f, 200, camOn(960, 520, 1.0), camOn(1000, 520, 1.15));
	const wv = Math.sin(f / 5);
	const kp = gesture('fist', {...idle(gf, 3), armF: [140, 30]}, env(f, 40, 200, 10, 10), f);
	const th = sp(f, 50, 10);
	return (
		<Stage cam={cam} bg="#9fd0ff" light={{x: 70, y: 6, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Street f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bus x={1000} />
					<Mats x={1380} w={300} />
					<Actor who="rex" x={1000} floor={FL - 330} s={1.0} facing={1} faceTurn={0.3} look={[0.6, 0.4]} mouth="smirk" pose={{...idle(gf, 4), armF: [150 + wv * 20, 20]}} uid="r69" />
					<Actor who="hero" x={560} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, -0.3]} mouth="smile" pose={kp} uid="h69" />
					<HeroPlate x={560} s={0.95} />
					<g transform={`translate(${760},${480}) scale(${th})`} opacity={th}>
						<circle r={70} fill={NAVY} stroke="#ffc94a" strokeWidth={6} />
						<path d="M-20,32 L-20,-4 L10,-42 C26,-42 26,-22 20,-8 L40,-8 C52,-8 52,14 44,30 C40,40 -6,40 -20,32 Z" fill="#ffc94a" />
						<rect x={-44} y={-6} width={20} height={42} rx={5} fill="#ffc94a" />
					</g>
					{Array.from({length: 5}).map((_, i) => (
						<Extra key={i} i={i} x={150 + i * 70 + (i % 2) * 16} floor={FL + (i % 3) * 8} s={0.9} facing={1} seed="bus" pose={{...idle(gf, i), armF: [150 + wv * 14, 20]}} />
					))}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 070–071: «Бульдозер летит!» — the mats lie half a metre to the left; the knee gives way; a second and a half of silence */
const S70: React.FC = () => {
	const {f, gf, at} = useShot();
	const t0 = at('070');
	const land = at('071') + 22;
	const jumpK = sp(f, t0 + 6, land - t0 - 6);
	const rx = lerp(1000, 1560, jumpK);
	const ry = FL - 330 + (330 * jumpK * jumpK) - Math.sin(jumpK * Math.PI) * 150;
	const down = sp(f, land + 2, 10);
	const crack = sp(f, land + 4, 12);
	const shake = f > land && f < land + 14 ? 7 : 0;
	const cam = f < land ? push(f, land, camOn(1000, 520, 1.0), camOn(1150, 620, 1.15)) : push(f - land, 170, camOn(1200, 590, 1.08), camOn(1220, 590, 1.12));
	const spin = f < land ? jumpK * 340 : 0;
	const rp: Pose = f < land ? {...idle(gf, 4), armF: [150, 20], armB: [-150, 20], legB: [20, 60], legF: [30, 70], lean: 8} : {...idle(0, 4), legF: [-30, -50], legB: [10, 40], lean: 6 * down, armF: [40, 60], armB: [20, 60]};
	return (
		<Stage cam={cam} bg="#9fd0ff" light={{x: 70, y: 6, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<g transform={`translate(${Math.sin(f * 2.2) * shake},${Math.cos(f * 2.9) * shake})`}>
						<Street f={gf} />
					</g>
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g transform={`translate(${Math.sin(f * 2.2) * shake},${Math.cos(f * 2.9) * shake})`}>
						<Bus x={1000} />
						<Mats x={1380} w={300} />
						<g transform={`rotate(${spin - down * 80} ${rx} ${ry + 100})`}>
							<Actor who="rex" x={rx} floor={ry} s={1.0} facing={1} faceTurn={0.3} look={[0.6, 0.4]} expr={f > land ? 'worried' : 'angry'} mouth={f > land ? 'frown' : 'open'} pose={rp} shadow={f > land} uid="r70" />
						</g>
						<Actor who="hero" x={700} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0.2]} expr={f > land ? 'wide' : 'normal'} pose={f > land ? gesture('handsOnHead', idle(gf, 3), 1, f) : idle(gf, 3)} uid="h70" />
						<HeroPlate x={700} s={0.95} dx={60} />
						{Array.from({length: 5}).map((_, i) => (
							<Extra key={i} i={i} x={110 + i * 60 + (i % 2) * 14} floor={FL + (i % 3) * 8} s={0.9} facing={1} seed="bus" expr={f > land ? 'wide' : undefined} pose={idle(f > land ? 0 : gf, i)} />
						))}
					</g>
					<BigText x={1560} y={560} t="ХРУСТ!" k={crack} size={150} rot={-8} />
				</Svg>
			</Layer>
			{flash(f, land + 3, 6) > 0.02 ? <AbsoluteFill style={{background: '#fff', opacity: flash(f, land + 3, 6) * 0.6}} /> : null}
		</Stage>
	);
};

/* 072: «Колено. Месяц.» — the doctor's cloud */
const S72: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 90, camOn(1100, 560, 1.0), camOn(1160, 540, 1.16));
	const bub = f - (at('072') + 14);
	const kp = idle(gf, 3);
	return (
		<Stage cam={cam} bg="#9fd0ff" light={{x: 70, y: 6, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Street f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bus x={1000} />
					<Mats x={1380} w={300} />
					<Actor who="rex" x={1470} floor={FL} seat={850} s={1.0} facing={-1} faceTurn={0.3} look={[-0.2, 0.7]} expr="sad" mouth="frown" pose={{...SIT, armF: [60, 90], armB: [40, 80], lean: 6}} shadow={false} uid="r72" />
					<Actor who="hero" x={520} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0.2]} expr="worried" pose={kp} uid="h72" />
					<HeroPlate x={520} s={0.95} />
					{bub > 0 ? (
						<SafeBox x={1220} y={270} left={500} right={500} top={170} bottom={170}>
							<Bubble x={1220} y={270} w={780} h={250} t={bub} tail={[300, 230]} thought>
								<text x={0} y={-52} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={800} fill="#6b7088">
									ВРАЧ
								</text>
								<text x={0} y={6} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
									КОЛЕНО.
								</text>
								<text x={0} y={76} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#d9372b">
									МЕСЯЦ МИНИМУМ
								</text>
							</Bubble>
						</SafeBox>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 073: the poster has an empty place where Rex was */
const S73: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 170, camOn(1000, 540, 1.0), camOn(1040, 520, 1.1));
	const q = 0.5 + 0.5 * Math.sin(f / 6);
	return (
		<Stage cam={cam} bg="#2b2046" light={{x: 24, y: 8, o: 0.35}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} lampOn={0.5} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<EmptySlotPoster x={1260} y={500} s={0.85} k={sp(f, at('073') + 100, 20) * q + 0.2} />
					<Actor who="hero" x={420} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0]} expr="sad" mouth="frown" pose={gesture('facepalm', idle(gf, 3), env(f, at('073') + 90, at('073') + 160, 12, 10), f)} uid="h73" />
					<HeroPlate x={420} s={0.95} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 074–075: night office, two phones at once, three replacements that pop one by one */
const S74: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp0 = useSpeaking(gf);
	const t5 = at('075');
	const cam0 = pick(sp0, {IRMA: camOn(1000, 520, 1.1)}, camOn(960, 540, 1.0));
	const items: [string, number][] = [['+12 КГ', 700], ['СПРАВКИ?', 1010], ['ЛАГЕРЬ?', 1320]];
	return (
		<Stage cam={slow(f, 260, cam0, 1.06)} bg="#2a2f4a" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<NightOffice f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={300} floor={FL} seat={845} s={HS} facing={1} faceTurn={0.3} look={[0.6, 0.3]} expr="sad" mouth="frown" pose={{...SIT, ...idle(gf, 3), legB: SIT.legB, legF: SIT.legF}} shadow={false} uid="h74" />
					<HeroPlate x={300} y={845 - 214 * HS - 84} s={0.95} dx={-20} />
					<Actor who="irma" x={1000} floor={FL} s={IS} facing={-1} faceTurn={0.2} look={[0, 0.2]} mouth="flat" pose={{...idle(gf, 1), armF: [150, 30], armB: [-150, 30]}} uid="i74" />
					<Phone x={905} y={470} rot={-12} />
					<Phone x={1095} y={470} rot={12} />
					{items.map(([t, x], i) => {
						const a = t5 + i * 70;
						return <PopCloud key={t} x={x} y={230} t={t} k={sp(f, a, 10)} p={sp(f, a + 52, 6)} size={85} />;
					})}
					{items.map(([t, x], i) => (
						<Poof key={t} x={x} y={230} t={f - (t5 + i * 70 + 58)} />
					))}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 076–077: «Сдвинем турнир!» — he grabs the wall calendar; the broadcaster: «ДАТА СТОИТ» */
const S76: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 170, camOn(1000, 540, 1.0), camOn(1040, 520, 1.1));
	const grab = env(f, at('076') + 20, at('076') + 140, 10, 10);
	const kp = reach({...idle(gf, 3), lean: 6}, 'F', toLocal(800, 540, 700, FL - 157 * HS, HS, 1), grab);
	const bub = f - (at('077') + 8);
	return (
		<Stage cam={cam} bg="#2a2f4a" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<NightOffice f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Calendar x={1100} y={540} s={0.82} shift={0} glow={grab} />
					<Actor who="hero" x={700} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, -0.1]} expr="worried" mouth="open" pose={kp} uid="h76" />
					<HeroPlate x={700} s={0.95} dx={150} />
					{bub > 0 ? (
						<SafeBox x={1400} y={190} left={500} right={500} top={130} bottom={130}>
							<Bubble x={1400} y={190} w={740} h={170} t={bub} tail={[-50, 120]}>
								<g transform="translate(-270,0)">
									<TvLogo x={0} y={-8} s={0.5} />
								</g>
								<text x={70} y={22} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
									ДАТА СТОИТ
								</text>
							</Bubble>
						</SafeBox>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 078: all doors are closed; the plate says six, Kostya slides down the wall */
const S78: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 100, camOn(1000, 540, 1.0), camOn(1000, 560, 1.1));
	const k = sp(f, at('078') + 40, 50);
	const seat = lerp(FL - 157 * HS, 845, k);
	const pose = blend(idle(gf, 3), {...SIT, armB: [10, 60], armF: [20, 60]}, k);
	const pk = sp(f, 4, 12);
	return (
		<Stage cam={cam} bg="#2a2f4a" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<NightOffice f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={520} floor={FL} seat={seat} s={HS} facing={1} faceTurn={0.3} look={[0.5, 0.4]} expr="sad" mouth="frown" pose={pose} shadow={k > 0.9} uid="h78" />
					<g opacity={pk} transform={`translate(1280,0) scale(${0.6 + 0.4 * pk}) translate(-1280,0)`}>
						<SafeBox x={1280} y={800} left={400} right={400} top={540} bottom={20}>
							<DayPlate x={1280} y={800} value={counterAt(gf)} s={2.3} />
						</SafeBox>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS789: ShotDef[] = [
	{at: '053', whip: true, C: S53},
	{at: '054', C: S54},
	{at: '057', C: S57},
	{at: '058', C: S58},
	{at: '060', C: S60},
	{at: '062', whip: true, C: S62},
	{at: '063', C: S63, own: true, ownCuts: [75, 150]},
	{at: '064', whip: true, C: S64},
	{at: '066', whip: true, C: S66},
	{at: '067', whip: true, C: S67},
	{at: '069', whip: true, C: S69},
	{at: '070', C: S70},
	{at: '072', C: S72},
	{at: '073', whip: true, C: S73},
	{at: '074', whip: true, C: S74},
	{at: '076', C: S76},
	{at: '078', C: S78},
];
