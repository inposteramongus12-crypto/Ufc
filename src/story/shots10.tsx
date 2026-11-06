import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose, toLocal} from '../engine/Stickman';
import {Layer, Svg} from '../engine/camera';
import {SIT, env, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot, useSpeaking} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn, clamp, ease, flash, mixCam, Stage} from '../kit/kit';
import {Bubble, FONT} from '../kit/ui';
import {FL, HS, HeroPlate, IS, SafeBox, Stamp, Studio, TvLogo} from './places';
import {BigScale, CardList, RatingBoard, WeighRoom} from './places2';
import {Chain, NightOffice, sp} from './places3';
import {Brace, CheckList, ChatKto, Hospital, NameCard, Oranges, SendPanel, StarCard} from './places4';

/* Parts 10–11 (lines 079–126, 5:32 to the end). Plate «ДО ТУРНИРА N ДНЕЙ»: 5 (079) → 1 (100) → 0 (102).
   The closing hook (122) is the very same component as the opening hook (hook.tsx). Pauses come from gaps.json. */
type Cam = ReturnType<typeof camOn>;
const NAVY = '#11142c';
const pick = (sp0: string | null, m: Record<string, Cam>, d: Cam) => (sp0 && m[sp0] ? m[sp0] : d);
const push = (f: number, len: number, a: Cam, b: Cam) => mixCam(a, b, interpolate(f, [0, len], [0, 1], {...clamp, easing: ease}));
const slow = (f: number, len: number, c: Cam, amt = 1.08) => push(f, len, c, {...c, zoom: c.zoom * amt, x: c.x * amt + 10});
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const dim = (k: number) => <AbsoluteFill style={{background: '#000', opacity: k, pointerEvents: 'none'}} />;

/* ---------------------------------------------------------------- PART 10: the night office */

/* 079–080: «Есть звезда в промежуточном весе. Дорогая.» — Irma crosses her out */
const T79: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp0 = useSpeaking(gf);
	const cross = sp(f, at('080') + 40, 26);
	const cam0 = pick(sp0, {IRMA: camOn(1100, 520, 1.1)}, camOn(960, 540, 1.0));
	const ip = reach({...idle(gf, 1), lean: 3}, 'F', toLocal(1180, 600 - 30 * cross, 1000, FL - 157 * IS, IS, 1), 1);
	return (
		<Stage cam={slow(f, 200, cam0, 1.06)} bg="#2a2f4a" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<NightOffice f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={480} floor={FL} seat={845} s={HS} facing={1} faceTurn={0.3} look={[0.6, 0.3]} expr="sad" mouth="frown" pose={{...SIT, ...idle(gf, 3), legB: SIT.legB, legF: SIT.legF}} shadow={false} uid="h79" />
					<HeroPlate x={480} y={845 - 214 * HS - 84} s={0.95} dx={-20} />
					<Actor who="irma" x={1000} floor={FL} s={IS} facing={1} faceTurn={0.3} look={[-0.4, 0.2]} mouth="flat" pose={ip} handF="point" uid="i79" />
					<StarCard x={1500} y={500} s={0.78} cross={cross} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 081–082: «Ты молчишь.» — Irma pushes the two cards into the corner without looking */
const T81: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 115, camOn(900, 540, 1.0), camOn(960, 520, 1.1));
	const mv = sp(f, at('082') + 10, 40);
	return (
		<Stage cam={cam} bg="#2a2f4a" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<NightOffice f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={300} floor={FL} seat={845} s={HS} facing={1} faceTurn={0.3} look={[0.9, 0.1]} expr="sad" mouth="flat" pose={{...SIT, legB: SIT.legB, legF: SIT.legF}} shadow={false} uid="h81" />
					<HeroPlate x={300} y={845 - 214 * HS - 84} s={0.95} dx={-20} />
					<Actor who="irma" x={1000} floor={FL} s={IS} facing={-1} faceTurn={0.3} look={[-0.9, 0.5]} mouth="flat" pose={{...idle(gf, 1), armF: [-52, 70]}} uid="i81" />
					<g transform={`translate(${lerp(0, 190, mv)},${lerp(0, 120, mv)})`}>
						<NameCard x={1240} y={400} s={0.42} name="ГАЛКИН" c="#2f6fd8" rot={-4} />
						<NameCard x={1440} y={420} s={0.42} name="АДЕБИ" c="#3fae4f" rot={3} />
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 083: «Их фамилии не знает даже твой собственный чат» */
const T83: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 110, camOn(960, 540, 1.0), camOn(1000, 530, 1.1));
	return (
		<Stage cam={cam} bg="#2a2f4a" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<NightOffice f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<ChatKto x={1180} y={520} s={1} f={f} t0={at('083') + 24} />
					<Actor who="hero" x={460} floor={FL} seat={845} s={HS} facing={1} faceTurn={0.3} look={[0.9, 0.1]} expr="sad" mouth="frown" pose={{...SIT, legB: SIT.legB, legF: SIT.legF}} shadow={false} uid="h83" />
					<HeroPlate x={460} y={845 - 214 * HS - 84} s={0.95} dx={-20} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 084: the broadcaster's cloud: no name, no air, no extension */
const T84: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 205, camOn(1000, 540, 1.0), camOn(1060, 520, 1.1));
	const bub = f - (at('084') + 30);
	return (
		<Stage cam={cam} bg="#2a2f4a" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<NightOffice f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={420} floor={FL} seat={845} s={HS} facing={1} faceTurn={0.3} look={[0.9, 0.1]} expr="worried" mouth="frown" pose={{...SIT, legB: SIT.legB, legF: SIT.legF}} shadow={false} uid="h84" />
					<HeroPlate x={420} y={845 - 214 * HS - 84} s={0.95} dx={-20} />
					<TvLogo x={1000} y={560} s={1.1} />
					{bub > 0 ? (
						<SafeBox x={1280} y={330} left={520} right={520} top={230} bottom={230}>
							<Bubble x={1280} y={330} w={980} h={380} t={bub} tail={[-200, 280]}>
								<text x={0} y={-80} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#d9372b">
									НЕТ ИМЕНИ —
								</text>
								<text x={0} y={-4} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
									НЕТ ЭФИРА.
								</text>
								<text x={0} y={76} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#2a2f4a">
									НЕТ ПРОДЛЕНИЯ
								</text>
							</Bubble>
						</SafeBox>
					) : null}
					<Stamp x={1560} y={760} text="ВЫМЫСЕЛ" k={sp(f, at('084') + 120, 8)} rot={-8} c="#2f6fd8" size={60} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 085: he closes his eyes: the screen darkens, then a flash (the 1 s pause of gaps.json) */
const T85: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 105, camOn(900, 540, 1.1), camOn(840, 520, 1.5));
	const night = sp(f, at('085') + 16, 40);
	const fl = flash(f, at('085') + 82, 12);
	return (
		<Stage cam={cam} bg="#2a2f4a" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<NightOffice f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={760} floor={FL} seat={845} s={HS} facing={1} faceTurn={0.3} look={[0.9, 0.1]} lidL={0.95} lidR={0.95} expr="sad" mouth="flat" pose={{...SIT, legB: SIT.legB, legF: SIT.legF}} shadow={false} uid="h85" />
					<HeroPlate x={760} y={845 - 214 * HS - 84} s={0.95} dx={-20} />
				</Svg>
			</Layer>
			{dim(night * 0.92)}
			{fl > 0.02 ? <AbsoluteFill style={{background: '#fff', opacity: fl * 0.85}} /> : null}
		</Stage>
	);
};

/* 086: from the dark the two names float up */
const T86: React.FC = () => {
	const {f, at} = useShot();
	const cam = push(f, 95, camOn(960, 540, 1.0), camOn(960, 520, 1.12));
	const a = sp(f, at('086') + 6, 40);
	return (
		<Stage cam={cam} bg="#05060f" light={{night: true, o: 0.15}} dust="#aebcff">
			<Layer depth={1}>
				<Svg>
					<g opacity={a}>
						<NameCard x={620} y={560 + (1 - a) * 80} s={0.72} name="ГАЛКИН" c="#2f6fd8" rot={-5} />
						<NameCard x={1300} y={560 + (1 - a) * 80} s={0.72} name="АДЕБИ" c="#3fae4f" rot={5} />
					</g>
				</Svg>
			</Layer>
			{dim((1 - a) * 0.7)}
		</Stage>
	);
};

/* 087: flashback: the hand-written line returns to the voting screen */
const T87: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 160, camOn(960, 520, 1.0), camOn(960, 540, 1.1));
	const glow = 0.5 + 0.5 * Math.sin(f / 6);
	return (
		<Stage cam={cam} bg="#1b2150" light={{x: 30, y: 8, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} lampOn={0.5} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<RatingBoard x={960} y={520} s={0.95} hand={sp(f, at('087') + 2, 20)} f={f} />
					<rect x={960 - 585 * 0.95} y={520 + 110 * 0.95} width={1170 * 0.95} height={170 * 0.95} rx={20} fill="none" stroke="#ffe08a" strokeWidth={8} opacity={0.4 + 0.5 * glow} />
				</Svg>
			</Layer>
			{dim(0.18)}
		</Stage>
	);
};

/* 088–089: flashbacks: Senya ties his shoe on the scale; «ДОПУЩЕН» and a swinging bag behind him */
const T88: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 82, camOn(1000, 560, 1.0), camOn(960, 540, 1.18));
	const tie = env(f, at('088') + 10, at('088') + 40, 8, 8);
	const stamp = sp(f, at('089') + 14, 8);
	const bent = tie > 0 ? ({...idle(gf, 5), lean: 40 * tie, head: 22 * tie, armF: [16, 74], armB: [4, 78]} as Pose) : idle(gf, 5);
	return (
		<Stage cam={cam} bg="#dfe7ee" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<WeighRoom />
					<g transform={`translate(1560,0) rotate(${Math.sin(f / 5) * 8} 0 330)`}>
						<line x1={0} y1={330} x2={0} y2={470} stroke="#999" strokeWidth={6} />
						<rect x={-44} y={470} width={88} height={250} rx={34} fill="#c43d4b" stroke="#0d0d1c" strokeWidth={5} />
					</g>
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<BigScale x={800} s={1.1} text="ЛИМИТ ✓" c="#6ff0a0" id="bs88" />
					<Actor who="senya" x={720} floor={FL - 52 * 1.1} s={1.2} facing={1} faceTurn={0.5} look={[0.6, 0.6]} pose={bent} shadow={false} uid="s88" />
					<Stamp x={1480} y={290} text="ДОПУЩЕН" k={stamp} rot={-6} c="#1f9d55" size={64} />
				</Svg>
			</Layer>
			{dim(0.14)}
		</Stage>
	);
};

/* 090: three ticks and an empty row «ИМЯ» */
const T90: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 186, camOn(960, 520, 1.0), camOn(960, 530, 1.1));
	const t0 = at('090');
	return (
		<Stage cam={cam} bg="#1b2150" light={{x: 30, y: 8, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} lampOn={0.5} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<CheckList x={960} y={520} s={0.95} k={[sp(f, t0 + 60, 14), sp(f, t0 + 100, 14), sp(f, t0 + 140, 14)]} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 091: «Можно потерять эфир, продление, весь год» — the plate trembles, «ПРОДЛЕНИЕ?» blinks above it */
const T91: React.FC = () => {
	const {f, gf} = useShot();
	const cam = push(f, 190, camOn(900, 540, 1.0), camOn(760, 520, 1.3));
	const tr = Math.sin(f * 2.4) * 1.6;
	const bl = Math.floor(f / 8) % 2 === 0;
	return (
		<Stage cam={cam} bg="#2a2f4a" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<NightOffice f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={620} floor={FL} seat={845} s={HS} facing={1} faceTurn={0.3} look={[0.6, 0.7]} expr="worried" mouth="frown" pose={{...SIT, legB: SIT.legB, legF: SIT.legF, head: 18}} shadow={false} uid="h91" />
					<g transform={`rotate(${tr} 620 400)`}>
						<HeroPlate x={620} y={845 - 214 * HS - 84} s={0.95} dx={-20} />
					</g>
					{bl ? (
						<SafeBox x={1090} y={330} left={300} right={300} top={80} bottom={80}>
							<g transform="translate(1090,330)">
								<rect x={-280} y={-64} width={560} height={110} rx={30} fill="#d9372b" stroke="#fff" strokeWidth={5} />
								<text x={0} y={22} textAnchor="middle" fontSize={68} fontFamily={FONT} fontWeight={900} fill="#fff">
									ПРОДЛЕНИЕ?
								</text>
							</g>
						</SafeBox>
					) : null}
				</Svg>
			</Layer>
			{dim(0.12)}
		</Stage>
	);
};

/* 092–095: he stands up, drags the two cards to the centre of the card and presses «ОТПРАВИТЬ»; Irma smiles for the first time */
const T92: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp0 = useSpeaking(gf);
	const up = f > at('092') + 4;
	const drag = sp(f, at('092') + 20, 40);
	const press = env(f, at('094') + 36, at('094') + 50, 3, 8);
	const hp = up ? reach({...idle(gf, 3), lean: 6}, 'F', toLocal(1040, 520, 700, FL - 157 * HS, HS, 1), Math.min(1, drag * 1.2)) : idle(gf, 3);
	const smile = f > at('095') + 8;
	const cam0 = pick(sp0, {IRMA: camOn(1150, 520, 1.12), HERO: camOn(950, 500, 1.1)}, camOn(1050, 540, 1.0));
	return (
		<Stage cam={slow(f, 225, cam0, 1.03)} bg="#2a2f4a" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<NightOffice f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SendPanel x={1380} y={500} s={0.8} press={press} cards={drag} />
					<Actor who="hero" x={up ? 700 : 420} floor={FL} seat={up ? undefined : 845} s={HS} facing={1} faceTurn={0.4} look={[0.9, -0.1]} mouth={up ? 'smirk' : 'frown'} pose={up ? hp : {...SIT, legB: SIT.legB, legF: SIT.legF}} shadow={!!up} uid="h92" />
					<HeroPlate x={up ? 700 : 420} y={up ? undefined : 845 - 214 * HS - 84} s={0.95} dx={140} />
					<Actor who="irma" x={940} floor={FL} s={IS} facing={-1} faceTurn={0.3} look={[-0.4, 0.2]} mouth={smile ? 'smile' : 'flat'} expr={f > at('093') && f < at('094') ? 'wide' : 'normal'} pose={{...idle(gf, 1), armF: [-52, 70]}} uid="i92" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 096: the same night, the hospital: Kostya comes in with a bag of oranges */
const T96: React.FC = () => {
	const {f, gf} = useShot();
	const w = walkTo(f, 6, 70, -250, 520, 8, 0.3);
	const cam = push(f, 100, camOn(900, 540, 1.0), camOn(1000, 520, 1.14));
	return (
		<Stage cam={cam} bg="#dcefe8" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<Hospital />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="rex" x={1260} floor={FL} seat={610} s={1.1} facing={-1} faceTurn={0.3} look={[-0.6, 0]} mouth="flat" pose={{...SIT, legB: [88, 85], legF: [92, 90], armF: [30, 60], armB: [20, 60], lean: -6}} shadow={false} uid="r96" />
					<Brace x={1130} y={620} s={1.0} />
					<Actor who="hero" x={w.x} floor={FL} s={HS} facing={1} faceTurn={w.moving ? 0.5 : 0.3} look={[0.8, 0]} mouth="smile" pose={w.pose} vx={w.vx} bob={w.bob} handItem={<Oranges />} uid="h96" />
					<HeroPlate x={w.x} s={0.95} dx={w.x < 400 ? 40 : 0} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 097–099: Rex asks to be let go; Kostya tears the line; «Бульдозер придёт посмотреть» */
const T97: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp0 = useSpeaking(gf);
	const tear = sp(f, at('098') + 40, 16);
	const chain = 1 - sp(f, at('098') + 40, 10);
	const cam0 = pick(sp0, {REX: camOn(1200, 500, 1.1), HERO: camOn(760, 500, 1.1)}, camOn(960, 540, 1.0));
	const smirk = f > at('099') + 4;
	return (
		<Stage cam={slow(f, 235, cam0, 1.06)} bg="#dcefe8" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<Hospital />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="rex" x={1260} floor={FL} seat={610} s={1.1} facing={-1} faceTurn={0.3} look={[-0.6, 0.1]} mouth={smirk ? 'smirk' : 'flat'} pose={{...SIT, legB: [88, 85], legF: [92, 90], armF: [60, 40], armB: [20, 60], lean: -6}} shadow={false} uid="r97" />
					<Brace x={1130} y={620} s={1.0} />
					<Actor who="hero" x={700} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0]} mouth="line" pose={reach({...idle(gf, 3), lean: 4}, 'F', toLocal(960, 560, 700, FL - 157 * HS, HS, 1), 1)} uid="h97" />
					<HeroPlate x={700} s={0.95} dx={80} />
					{tear < 0.99 ? (
						<g transform={`translate(${940},${560})`}>
							<g transform={`translate(${-tear * 40},${tear * 30}) rotate(${-tear * 20})`}>
								<rect x={-80} y={-60} width={80} height={120} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={4} />
							</g>
							<g transform={`translate(${tear * 40},${tear * 40}) rotate(${tear * 22})`}>
								<rect x={0} y={-60} width={80} height={120} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={4} />
							</g>
						</g>
					) : null}
					{chain > 0.02 ? <Chain a={[780, 580]} b={[1180, 560]} k={chain} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 100: the morning before the tournament: both on the scales, exactly on the limit; plate 1 */
const T100: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 170, camOn(1000, 540, 1.0), camOn(1060, 540, 1.18));
	const ok = sp(f, at('100') + 70, 6);
	const bub = f - (at('100') + 96);
	return (
		<Stage cam={cam} bg="#dfe7ee" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<WeighRoom />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<BigScale x={700} s={1.0} text={ok > 0.5 ? 'ЛИМИТ ✓' : '0.0'} c="#6ff0a0" id="bs100a" />
					<BigScale x={1240} s={1.0} text={ok > 0.5 ? 'ЛИМИТ ✓' : '0.0'} c="#6ff0a0" id="bs100b" />
					<Actor who="senya" x={700} floor={FL - 52 * 1.0} s={1.2} facing={1} faceTurn={0.5} look={[0.6, 0.3]} pose={idle(gf, 5)} shadow={false} uid="s100" />
					<Actor who="tayo" x={1240} floor={FL - 52 * 1.0} s={1.2} facing={-1} faceTurn={0.5} look={[-0.6, 0.3]} pose={idle(gf, 6)} shadow={false} uid="t100" />
					<Actor who="hero" x={450} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0]} mouth="smile" pose={idle(gf, 3)} uid="h100" />
					<HeroPlate x={450} s={0.95} dx={-50} />
					{bub > 0 ? (
						<Bubble x={1240} y={240} w={420} h={130} t={bub} tail={[0, 100]}>
							<text x={0} y={24} textAnchor="middle" fontSize={72} fontFamily={FONT} fontWeight={900} fill="#14501f">
								ВЕС ✓
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 101: Irma ticks the main bout on the card */
const T101: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = push(f, 105, camOn(1000, 520, 1.0), camOn(1040, 520, 1.1));
	const tick = sp(f, at('101') + 36, 14);
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 70, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<rect x={-500} y={-300} width={2920} height={1300} fill="#e4dccb" />
					<rect x={-500} y={900} width={2920} height={400} fill="#8a7a62" />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<CardList x={1120} y={520} s={0.9} k={0} />
					<g transform="translate(1500,709)" opacity={tick}>
						<circle r={80} fill={NAVY} stroke="#6ff0a0" strokeWidth={8} transform={`scale(${tick})`} />
						<path d="M-36,2 L-10,30 L40,-28" stroke="#6ff0a0" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</g>
					<Actor who="irma" x={420} floor={FL} s={IS} facing={1} faceTurn={0.3} look={[0.8, -0.1]} mouth="smile" pose={reach({...idle(gf, 1), lean: 4}, 'F', toLocal(560, 520, 420, FL - 157 * IS, IS, 1), 1)} uid="i101" />
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS10: ShotDef[] = [
	{at: '079', C: T79},
	{at: '081', C: T81},
	{at: '083', C: T83},
	{at: '084', C: T84},
	{at: '085', C: T85},
	{at: '086', C: T86},
	{at: '087', C: T87},
	{at: '088', C: T88},
	{at: '090', C: T90},
	{at: '091', C: T91},
	{at: '092', C: T92},
	{at: '096', whip: true, C: T96},
	{at: '097', C: T97},
	{at: '100', whip: true, C: T100},
	{at: '101', C: T101},
];
