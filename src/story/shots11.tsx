import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose, toLocal} from '../engine/Stickman';
import {Layer, Svg} from '../engine/camera';
import {SIT, env, idle, reach, walkTo} from '../kit/actions';
import {Actor, L, lineEnd, useShot, useSpeaking} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn, clamp, ease, mixCam, Stage} from '../kit/kit';
import {Bubble, FONT} from '../kit/ui';
import {guard, hit, hip} from './common';
import {CageSide, FL, HallFar, HS, HeroPlate, IS, SafeBox, Stamp, TvLogo} from './places';
import {CardList} from './places2';
import {Mic, sp} from './places3';
import {Brace, Chant, Crutch, HastyBoard, PhoneWall, Popcorn, SweatDrop} from './places4';
import {HookShot} from './hook';

/* Part 11 (lines 102–126, 6:48 to the end): the tournament and the final. Plate «ДО ТУРНИРА 0 ДНЕЙ» over Kostya.
   Pauses of gaps.json: 108 (1.5 s of silence, a drop of sweat), 111 (1.5 s), 115 (1.5 s), 121 (2 s: the hook frame returns), 126 (4 s of dark screen). */
type Cam = ReturnType<typeof camOn>;
const NAVY = '#11142c';
const pick = (sp0: string | null, m: Record<string, Cam>, d: Cam) => (sp0 && m[sp0] ? m[sp0] : d);
const push = (f: number, len: number, a: Cam, b: Cam) => mixCam(a, b, interpolate(f, [0, len], [0, 1], {...clamp, easing: ease}));
const slow = (f: number, len: number, c: Cam, amt = 1.08) => push(f, len, c, {...c, zoom: c.zoom * amt, x: c.x * amt + 10});
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* two fighters in the cage: punches at given local frames, falls [t0, hold, rise], slow = slow-motion rise */
const SC = 1.25;
const Duel: React.FC<{f: number; gf: number; sx?: number; tx?: number; sPunch?: number[]; tPunch?: number[]; sFall?: [number, number, number]; tFall?: [number, number, number]; slowRise?: [number, number]; sExpr?: 'normal' | 'angry' | 'wide' | 'worried'; hands?: boolean}> = ({f, gf, sx = 820, tx = 1160, sPunch = [], tPunch = [], sFall, tFall, slowRise, sExpr, hands}) => {
	const pk = (arr: number[]) => arr.reduce((m, t) => Math.max(m, env(f, t, t + 8, 2, 5)), 0);
	const fall = (fl: [number, number, number] | undefined, dir: 1 | -1) => (fl ? dir * 84 * Math.min(sp(f, fl[0], 7), 1 - sp(f, fl[0] + fl[1], fl[2])) : 0);
	const sA = slowRise ? -84 * (1 - sp(f, slowRise[0], slowRise[1])) * (f >= slowRise[0] - 40 ? 1 : 0) : fall(sFall, -1);
	const tA = fall(tFall, 1);
	const sp0 = hit(guard(idle(gf, 1), 1), 'F', sx, SC, 1, [tx - 60, hip(SC) - 150 * SC], pk(sPunch));
	const tp0 = hit(guard(idle(gf, 2), 1), 'F', tx, SC, -1, [sx + 60, hip(SC) - 150 * SC], pk(tPunch));
	return (
		<>
			<g transform={`rotate(${sA} ${sx} ${FL})`}>
				<Actor who="senya" x={sx} floor={FL} s={SC} facing={1} faceTurn={0.4} look={[0.8, 0]} expr={sExpr ?? (sA !== 0 ? 'wide' : 'angry')} pose={hands ? {...sp0, armF: [150, 20], armB: [-130, 20]} : sp0} bob={Math.abs(Math.sin(f / 6)) * 3} uid="sD" />
			</g>
			<g transform={`rotate(${tA} ${tx} ${FL})`}>
				<Actor who="tayo" x={tx} floor={FL} s={SC} facing={-1} faceTurn={0.4} look={[-0.8, 0]} expr={tA !== 0 ? 'wide' : 'angry'} pose={tp0} bob={Math.abs(Math.sin(f / 6 + 1)) * 3} uid="tD" />
			</g>
		</>
	);
};
const Arena: React.FC<{gf: number; shake?: number; up?: number}> = ({gf, shake = 0, up = 0.7}) => (
	<Layer depth={1.4}>
		<Svg>
			<CageSide f={gf} shake={shake} up={up} />
		</Svg>
	</Layer>
);

/* 102: the evening: Voron without an opponent, Rex as a guest in a brace; plate 0 */
const U102: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 215, camOn(1000, 560, 1.0), camOn(1060, 540, 1.16));
	const bub = f - (at('102') + 60);
	return (
		<Stage cam={cam} bg="#0a0c1f" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<HallFar f={gf} up={0.8} />
					<rect x={-500} y={820} width={2920} height={40} fill="#3a3f55" />
					<rect x={-500} y={860} width={2920} height={400} fill="#1b1e30" />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="voron" x={520} floor={FL} seat={800} s={1.0} facing={1} faceTurn={0.3} look={[0.8, 0.1]} mouth="smirk" expr="angry" pose={{...SIT, armF: [40, 70], armB: [30, 70]}} shadow={false} uid="v102" />
					{bub > 0 ? (
						<SafeBox x={560} y={300} left={240} right={240} top={110} bottom={110}>
							<Bubble x={560} y={300} w={420} h={150} t={bub} tail={[0, 150]}>
								<text x={0} y={26} textAnchor="middle" fontSize={78} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
									НУ-НУ
								</text>
							</Bubble>
						</SafeBox>
					) : null}
					<Actor who="rex" x={1060} floor={FL} seat={800} s={1.1} facing={-1} faceTurn={0.3} look={[-0.6, 0]} mouth="smirk" pose={{...SIT, armF: [60, 70], armB: [30, 70]}} handItem={<Popcorn />} shadow={false} uid="r102" />
					<Brace x={940} y={800} s={1.0} />
					<Crutch x={1230} y={560} />
					<Actor who="hero" x={1560} floor={FL} s={HS} facing={-1} faceTurn={0.4} look={[-0.7, 0]} mouth="smile" pose={idle(gf, 3)} uid="h102" />
					<HeroPlate x={1560} s={0.95} dx={-30} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 103: Senya and Tayo walk to the cage; the surnames on the board were typed in a hurry */
const U103: React.FC = () => {
	const {f, gf, at} = useShot();
	const w1 = walkTo(f, at('103') + 6, at('103') + 110, 240, 780, 5, 0.3);
	const w2 = walkTo(f, at('103') + 14, at('103') + 118, 100, 1080, 6, 0.3);
	const cam = push(f, 135, camOn(960, 540, 1.0), camOn(1000, 520, 1.12));
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={0.5} />
			<Layer depth={1}>
				<Svg>
					<HastyBoard x={960} y={140} f={f} />
					<Actor who="senya" x={w1.x} floor={FL} s={SC} facing={1} faceTurn={0.4} look={[0.9, 0]} pose={w1.pose} vx={w1.vx} bob={w1.bob} uid="s103" />
					<Actor who="tayo" x={w2.x} floor={FL} s={SC} facing={1} faceTurn={0.4} look={[0.9, 0]} pose={w2.pose} vx={w2.vx} bob={w2.bob} uid="t103" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 104: the host stumbles over the surnames; half the hall checks who this is on their phones */
const U104: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 165, camOn(960, 560, 1.0), camOn(960, 540, 1.16));
	const bub = f - (at('104') + 40);
	return (
		<Stage cam={cam} bg="#0a0c1f" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<HallFar f={gf} up={0.3} />
					<PhoneWall f={f} y0={430} y1={820} n={110} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="host" x={960} floor={FL} s={1.25} facing={1} faceTurn={0.2} look={[0, 0.3]} expr="worried" mouth="open" pose={{...idle(gf, 3), lean: 6 + Math.sin(f / 4) * 3, armF: [60, 80]}} handItem={<Mic />} uid="host104" />
					{bub > 0 ? (
						<SafeBox x={960} y={270} left={420} right={420} top={130} bottom={130}>
							<Bubble x={960} y={270} w={780} h={170} t={bub} tail={[0, 150]}>
								<text x={0} y={26} textAnchor="middle" fontSize={72} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
									ГАЛ… ГАЛКИН!
								</text>
							</Bubble>
						</SafeBox>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 105–107: Kostya whispers at the fence, Irma does not take her eyes off the cage; round 1: Tayo hits first, Senya falls and stands up */
const U105: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp0 = useSpeaking(gf);
	const t7 = at('107') - at('105');
	const gripK = env(f, 4, 190, 8, 8);
	const kp = reach({...idle(gf, 3), lean: 8}, 'F', toLocal(560, 560, 300, FL - 157 * 1.3, 1.3, 1), gripK);
	const cam0 = pick(sp0, {HERO: camOn(660, 520, 1.2), IRMA: camOn(700, 520, 1.25)}, camOn(1000, 540, 1.0));
	return (
		<Stage cam={slow(f, 195, cam0, 1.06)} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={sp0 === 'N' ? 0.9 : 0.6} />
			<Layer depth={1}>
				<Svg>
					<Duel f={f} gf={gf} sx={880} tx={1200} tPunch={[at('107') + 14]} sFall={[at('107') + 22, 28, 18]} sExpr="worried" />
					<Actor who="hero" x={300} floor={FL} s={1.3} facing={1} faceTurn={0.3} look={[0.9, 0]} mouth="open" pose={kp} uid="h105" />
					<HeroPlate x={300} hs={1.3} s={0.95} dx={-10} />
					<Actor who="irma" x={560} floor={FL} s={1.25} facing={1} faceTurn={0.3} look={[0.9, 0]} mouth="flat" pose={{...idle(gf, 1), lean: 4}} uid="i105" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 108: Tayo hits harder, Senya is on the floor again and stands again; then 1.5 s of silence and a drop of sweat */
const U108: React.FC = () => {
	const {f, gf, at} = useShot();
	const endF = lineEnd('108') - L('108').from + at('108');
	const quiet = f > endF;
	const cam = push(f, 210, camOn(1000, 540, 1.0), camOn(1040, 540, 1.2));
	const bub = f - (at('108') + 118);
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={quiet ? 0.1 : 0.7} />
			<Layer depth={1}>
				<Svg>
					<Duel f={Math.min(f, endF + 6)} gf={quiet ? 0 : gf} sx={900} tx={1200} tPunch={[at('108') + 20, at('108') + 54]} sFall={[at('108') + 62, 40, 24]} />
					{bub > 0 && bub < 70 ? (
						<Bubble x={1200} y={330} w={260} h={140} t={bub} tail={[0, 120]}>
							<text x={0} y={26} textAnchor="middle" fontSize={78} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
								?!
							</text>
						</Bubble>
					) : null}
					<SweatDrop x={1020} y={310} t={f - (endF + 8)} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 109: the hall rises like a wave after Senya */
const U109: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 180, camOn(960, 540, 1.0), camOn(960, 500, 1.2));
	const up = sp(f, at('109') + 20, 90);
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={0.2 + 0.8 * up} />
			<Layer depth={1}>
				<Svg>
					<Duel f={f} gf={gf} sx={880} tx={1220} slowRise={[at('109') + 10, 70]} hands />
				</Svg>
			</Layer>
			<Layer depth={0.62}>
				<Svg>
					<PhoneWall f={f} y0={960} y1={1040} n={0} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 110: he does not hit harder, he just cannot stay on the floor: Senya rises in slow motion */
const U110: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 120, camOn(900, 560, 1.15), camOn(880, 500, 1.55));
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={0.9} />
			<Layer depth={1}>
				<Svg>
					<Duel f={f} gf={gf} sx={880} tx={1240} slowRise={[at('110') + 6, 100]} sExpr="angry" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 111: the commentators' booth: three clouds «ГАЛКИН?!», then 1.5 s of silence */
const U111: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 118, camOn(960, 540, 1.0), camOn(960, 520, 1.14));
	return (
		<Stage cam={cam} bg="#1b2150" light={{x: 40, y: 8, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<rect x={-500} y={-300} width={2920} height={1300} fill="#1b2150" />
					<rect x={-500} y={900} width={2920} height={400} fill="#0e1130" />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					{[520, 960, 1400].map((x, i) => (
						<Actor key={x} who={i === 1 ? 'host' : i === 0 ? 'irma' : 'ref'} x={x} floor={FL - 80} s={1.15} facing={1} faceTurn={0.2} look={[0, 0.2]} expr="wide" mouth="open" pose={{...idle(gf, i + 1), armF: [60, 70]}} uid={'c111' + i} />
					))}
					<rect x={380} y={690} width={1160} height={44} rx={10} fill="#6b4a2c" />
					<rect x={420} y={734} width={26} height={170} fill="#4f361f" />
					<rect x={1470} y={734} width={26} height={170} fill="#4f361f" />
					{[520, 960, 1400].map((x, i) => {
						const t = f - (at('111') + 24 + i * 14);
						return t > 0 ? (
							<SafeBox key={x} x={x} y={300} left={220} right={220} top={90} bottom={90}>
								<Bubble x={x} y={300} w={390} h={140} t={t} tail={[0, 130]}>
									<text x={0} y={24} textAnchor="middle" fontSize={68} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
										ГАЛКИН?!
									</text>
								</Bubble>
							</SafeBox>
						) : null;
					})}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 112: round three, 0:20 to the gong: Tayo is stronger, Senya falls for the third time, the referee bends over him */
const U112: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 210, camOn(1000, 540, 1.0), camOn(1060, 560, 1.18));
	const lean = sp(f, at('112') + 150, 24);
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={0.6} />
			<Layer depth={1}>
				<Svg>
					<Duel f={f} gf={gf} sx={860} tx={1180} tPunch={[at('112') + 20, at('112') + 50, at('112') + 80, at('112') + 112]} sPunch={[at('112') + 36]} sFall={[at('112') + 142, 600, 10]} />
					<Actor who="ref" x={1030} floor={FL} s={1.2} facing={-1} faceTurn={0.3} look={[-0.2, 0.6]} mouth="flat" pose={{...idle(gf, 4), lean: 8 + 36 * lean, head: 10 * lean}} uid="ref112" />
					<SafeBox x={1500} y={150} left={200} right={200} top={90} bottom={60}>
						<rect x={1300} y={80} width={400} height={140} rx={30} fill={NAVY} stroke="#ffc94a" strokeWidth={6} />
						<text x={1500} y={136} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={800} fill="#ffe9a8">
							РАУНД 3
						</text>
						<text x={1500} y={196} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
							0:20
						</text>
					</SafeBox>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 113: the referee looks him in the eyes; Senya is up before the referee can wave */
const U113: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 160, camOn(960, 560, 1.12), camOn(930, 540, 1.4));
	const step = sp(f, at('113') + 92, 30);
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={0.8} />
			<Layer depth={1}>
				<Svg>
					<Duel f={f} gf={gf} sx={880} tx={1300} slowRise={[at('113') + 40, 40]} sExpr="angry" />
					<Actor who="ref" x={lerp(1060, 1160, step)} floor={FL} s={1.2} facing={-1} faceTurn={0.3} look={[-0.6, 0.3]} mouth="flat" pose={{...idle(gf, 4), lean: 22 * (1 - step), armF: [150 * step, 30]}} uid="ref113" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 114: the hall shouts his name: not the strongest one's, the one who stands up */
const U114: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 130, camOn(960, 560, 1.0), camOn(960, 500, 1.1));
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={1} />
			<Layer depth={1}>
				<Svg>
					<Duel f={f} gf={gf} sx={880} tx={1240} hands />
					<Chant x={470} y={450} t="СЕ-НЯ!" k={sp(f, at('114') + 40, 10)} size={110} />
					<Chant x={1520} y={470} t="СЕ-НЯ!" k={sp(f, at('114') + 70, 10)} size={110} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 115: the last ten seconds: blows in the centre, the gong drowns in the roar; then 1.5 s of silence */
const U115: React.FC = () => {
	const {f, gf, at} = useShot();
	const endF = lineEnd('115') - L('115').from + at('115');
	const ff = Math.min(f, endF);
	const quiet = f > endF;
	const cam = push(f, 148, camOn(1000, 540, 1.0), camOn(1020, 540, 1.3));
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={quiet ? 0 : gf} shake={!quiet && f % 12 < 3 ? 4 : 0} up={quiet ? 0.1 : 1} />
			<Layer depth={1}>
				<Svg>
					<Duel f={ff} gf={quiet ? 0 : gf} sx={920} tx={1180} sPunch={[8, 30, 52, 74, 96]} tPunch={[18, 42, 64, 86, 108]} sExpr="angry" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 116: the decision: the referee raises Tayo's hand, Senya hugs him */
const U116: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 124, camOn(1000, 540, 1.0), camOn(1060, 520, 1.25));
	const hug = sp(f, at('116') + 80, 20);
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={0.5} />
			<Layer depth={1}>
				<Svg>
					<Actor who="senya" x={lerp(840, 960, hug)} floor={FL} s={SC} facing={1} faceTurn={0.3} look={[0.8, 0]} expr="normal" pose={{...idle(gf, 1), armF: [60 + 40 * hug, 40], armB: [30, 60]}} uid="s116" />
					<Actor who="tayo" x={1130} floor={FL} s={SC} facing={-1} faceTurn={0.3} look={[-0.5, 0]} mouth="smile" pose={{...idle(gf, 2), armF: [150, 10]}} uid="t116" />
					<Actor who="ref" x={1260} floor={FL} s={1.2} facing={-1} faceTurn={0.3} look={[-0.7, 0]} mouth="flat" pose={{...idle(gf, 4), armF: [150, 10], lean: -4}} uid="ref116" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 117–118: «ТЫ ВСТАВАЛ» — «Ещё раз. Когда скажете.» — both laugh */
const U117: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = slow(f, 165, camOn(1000, 540, 1.1), 1.1);
	const bub = f - (at('117') + 40);
	const laugh = Math.sin(f / 3);
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={0.6} />
			<Layer depth={1}>
				<Svg>
					<Actor who="senya" x={880} floor={FL} s={SC} facing={1} faceTurn={0.3} look={[0.7, 0]} mouth="open" pose={{...idle(gf, 1), lean: -4 + laugh * 3, armF: [30, 40]}} uid="s117" />
					<Actor who="tayo" x={1180} floor={FL} s={SC} facing={-1} faceTurn={0.3} look={[-0.7, 0]} mouth="smile" pose={{...idle(gf, 2), lean: -4 - laugh * 3, head: 6 + laugh * 4}} uid="t117" />
					{bub > 0 ? (
						<SafeBox x={1180} y={270} left={340} right={340} top={110} bottom={110}>
							<Bubble x={1180} y={270} w={640} h={150} t={bub} tail={[-30, 130]}>
								<text x={0} y={24} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#14501f">
									ТЫ ВСТАВАЛ
								</text>
							</Bubble>
						</SafeBox>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 119–120: Rex applauds standing on one leg; the two are led into the tunnel; the hall does not leave */
const U119: React.FC = () => {
	const {f, gf, at} = useShot();
	const clap = Math.abs(Math.sin(f / 4));
	const go = sp(f, at('120') + 20, 90);
	return (
		<Stage cam={slow(f, 210, camOn(960, 540, 1.0), 1.1)} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={1} />
			<Layer depth={1}>
				<Svg>
					<rect x={1580} y={380} width={200} height={520} rx={20} fill="#05060f" stroke="#3a3f55" strokeWidth={6} />
					<Actor who="senya" x={lerp(1200, 1700, go)} floor={FL} s={1.0} facing={1} faceTurn={0.3} look={[0.8, 0]} pose={idle(gf, 1)} uid="s119" />
					<Actor who="tayo" x={lerp(1330, 1620, go)} floor={FL} s={1.0} facing={1} faceTurn={0.3} look={[0.8, 0]} pose={idle(gf, 2)} uid="t119" />
					<Actor who="rex" x={620} floor={FL} s={1.25} facing={1} faceTurn={0.3} look={[0.9, 0]} mouth="smile" pose={{...idle(gf, 4), legF: [-30, 70], armF: [70 + 20 * clap, 90], armB: [60 - 20 * clap, 90]}} uid="r119" />
					<Brace x={655} y={MATH(FL, 1.25)} s={1.0} />
					<Crutch x={520} y={560} />
				</Svg>
			</Layer>
		</Stage>
	);
};
const MATH = (fl: number, s: number) => fl - 157 * s + 70;

/* 121: «СЕ-НЯ! СЕ-НЯ!» over the stands; the camera rises and goes up and away */
const U121: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 102, camOn(960, 600, 1.0), camOn(960, 400, 1.05));
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={1} />
			<Layer depth={1}>
				<Svg>
					<Chant x={660} y={470} t="СЕ-НЯ!" k={sp(f, at('121') + 12, 8)} size={130} rot={-6} />
					<Chant x={1260} y={470} t="СЕ-НЯ!" k={sp(f, at('121') + 44, 8)} size={130} rot={5} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 123: «Это имя проигравшего…» — the same top view (the drift goes on) with a split-second flashback: the red line through «Галкин» */
const U123: React.FC = () => {
	const {f, at} = useShot();
	const fb = env(f, at('123') + 84, at('123') + 110, 3, 3);
	const k = sp(f, at('123') + 88, 12);
	return (
		<>
			<HookShot offset={L('123').from - 6 - lineEnd('121')} plateOpacity={1 - fb} />
			{fb > 0.02 ? (
				<AbsoluteFill style={{background: 'rgba(5,6,15,0.9)', opacity: fb}}>
					<svg width={1920} height={1080} viewBox="0 0 1920 1080">
						<CardList x={960} y={540} s={0.95} k={k} />
					</svg>
				</AbsoluteFill>
			) : null}
		</>
	);
};

/* 124: the phone in the pocket buzzes; the broadcaster's cloud: record air, we extend, who is Galkin? */
const U124: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 112, camOn(900, 540, 1.0), camOn(960, 520, 1.15));
	const bub = f - (at('124') + 14);
	const buzz = Math.sin(f * 2.8) * 6 * (f > at('124') + 6 ? 1 : 0);
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={0.1} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={460} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.6, 0.6]} expr="worried" mouth="frown" pose={reach({...idle(gf, 3), lean: 4}, 'F', [10, -30], 1)} uid="h124" />
					<HeroPlate x={460} s={0.95} dx={-20} />
					<g transform={`translate(${510 + buzz},${700})`}>
						<rect x={-18} y={-34} width={36} height={68} rx={8} fill="#0d0d1c" stroke="#ffe08a" strokeWidth={4} />
						<rect x={-12} y={-26} width={24} height={44} rx={3} fill="#bfe3ff" />
					</g>
					{bub > 0 ? (
						<SafeBox x={1420} y={330} left={620} right={620} top={280} bottom={280}>
							<Bubble x={1420} y={330} w={800} h={360} t={bub} tail={[-260, 270]}>
								<g transform="translate(-340,-96)">
									<TvLogo x={0} y={0} s={0.5} />
								</g>
								<text x={40} y={-86} textAnchor="middle" fontSize={60} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
									РЕКОРДНЫЙ ЭФИР.
								</text>
								<text x={40} y={-12} textAnchor="middle" fontSize={60} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
									ПРОДЛЕВАЕМ.
								</text>
								<text x={0} y={70} textAnchor="middle" fontSize={60} fontFamily={FONT} fontWeight={900} fill="#d9372b">
									КТО ТАКОЙ ГАЛКИН?
								</text>
							</Bubble>
						</SafeBox>
					) : null}
					<Stamp x={1400} y={770} text="ВЫМЫСЕЛ" k={sp(f, at('124') + 100, 8)} rot={-8} c="#2f6fd8" size={60} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 125–126: Kostya laughs and wipes his eyes, his palm on the fence of the empty cage; the final question; the plate goes out; dark screen (4 s) */
const U125: React.FC = () => {
	const {f, gf, at} = useShot();
	const endQ = lineEnd('126') - L('125').from + at('125');
	const out = sp(f, endQ + 2, 8);
	const dark = sp(f, endQ + 6, 18);
	const cam = f < endQ ? slow(f, 260, camOn(780, 540, 1.1), 1.08) : push(f - endQ, 80, camOn(880, 560, 1.18), camOn(880, 560, 1.22));
	const wipe = env(f, at('125') + 14, at('125') + 60, 8, 8);
	const kp = reach({...idle(gf, 3), lean: 4, armB: [30, 60]}, 'F', toLocal(960, 560, 720, FL - 157 * HS, HS, 1), 1 - wipe * 0.0);
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Arena gf={gf} up={0} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={720} floor={FL} s={HS} facing={1} faceTurn={0.2} look={[0.2, 0.2]} mouth="open" pose={kp} uid="h125" />
					<g opacity={1 - out}>
						<HeroPlate x={720} s={0.95} dx={-10} />
					</g>
				</Svg>
			</Layer>
			<AbsoluteFill style={{background: '#000', opacity: dark, pointerEvents: 'none'}} />
		</Stage>
	);
};

export const SHOTS11: ShotDef[] = [
	{at: '102', whip: true, C: U102},
	{at: '103', C: U103},
	{at: '104', C: U104},
	{at: '105', C: U105},
	{at: '108', C: U108},
	{at: '109', C: U109},
	{at: '110', C: U110},
	{at: '111', C: U111},
	{at: '112', C: U112},
	{at: '113', C: U113},
	{at: '114', C: U114},
	{at: '115', C: U115},
	{at: '116', C: U116},
	{at: '117', C: U117},
	{at: '119', C: U119},
	{at: '121', C: U121},
	// the hook frame returns during the 2 s pause after 121 and stays through 122: the very same component as the opening
	{at: '121', off: L('121').dur + 6, C: HookShot},
	{at: '123', C: U123},
	{at: '124', C: U124},
	{at: '125', C: U125},
];
