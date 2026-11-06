import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose, toLocal} from '../engine/Stickman';
import {Layer, Svg} from '../engine/camera';
import {blend, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot, useSpeaking} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn, clamp, ease, flash, mixCam, Extra, Stage, usePush} from '../kit/kit';
import {Bubble, FONT, HAND} from '../kit/ui';
import {bent, guard, hit, hip} from './common';
import {CageSide, FL, HallFar, HeroPlate, HS, IS, Office, SafeBox, Studio, headTop} from './places';
import {
	Beach, BeltProp, BigScale, Bolt, Bulldozer, CardList, CardsOnTable, Cheque, Cursor, FlashBurst, KardGrid, Pen, PressRoom, Portrait, RatingBoard, Scribble, Sparks, Steam, StreamScreen, TrainRoom, Umbrella, VoteChart, WeighRoom, WeighSign, Yard,
} from './places2';

/* Parts 4–6 (lines 028–052, 2:01–3:47). Plate «ДО ТУРНИРА N ДНЕЙ» follows the day table:
   295 (028) → 280 (037) → 260/240/220/200 on the four beats of «Подпись. Чек. Подпись. Чек.» (038) → 180 (041) → 120 (046).
   There is no «Чирк» in the script, so the number does not step by one. Voron is `voron` everywhere. */

const sp01 = (f: number, t0: number, len = 12) => interpolate(f, [t0, t0 + len], [0, 1], {...clamp, easing: ease});
const NAVY = '#11142c';
const pickCam = (sp: string | null, m: Record<string, ReturnType<typeof camOn>>, d: ReturnType<typeof camOn>) => (sp && m[sp] ? m[sp] : d);
const slowPush = (f: number, len: number, cam: ReturnType<typeof camOn>, amt = 1.1) => mixCam(cam, {...cam, zoom: cam.zoom * amt, x: cam.x * amt + 14}, interpolate(f, [0, len], [0, 1], clamp));
/* a caption on a dark plate (world space) */
const Cap: React.FC<{x: number; y: number; t: string; k: number; size?: number; c?: string}> = ({x, y, t, k, size = 56, c = '#ffc94a'}) => {
	const w = t.length * size * 0.66 + 70;
	return k <= 0 ? null : (
		<SafeBox x={x} y={y} left={w / 2 + 6} right={w / 2 + 6} top={size * 0.95 + 6} bottom={size * 0.8 + 6}>
			<g transform={`translate(${x},${y}) scale(${0.6 + 0.4 * k})`} opacity={Math.min(1, k * 2)}>
				<rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.75} rx={size * 0.5} fill={NAVY} stroke={c} strokeWidth={5} />
				<text x={0} y={size * 0.28} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill="#fff">
					{t}
				</text>
			</g>
		</SafeBox>
	);
};

/* ---------------------------------------------------------------- PART 4 */

/* 028: the stream, the big yellow button «ГОЛОСОВАТЬ» */
const S24: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(1000, 520, 1.05), camOn(1080, 500, 1.28));
	const t0 = at('028');
	const cx = interpolate(f, [t0 + 80, t0 + 125], [1750, 1290], {...clamp, easing: ease});
	const cy = interpolate(f, [t0 + 80, t0 + 125], [560, 548], {...clamp, easing: ease});
	const press = env(f, t0 + 128, t0 + 150, 3, 8);
	const pt = env(f, t0 + 50, t0 + 160, 10, 12);
	const hp = gesture('point', {...idle(gf, 3), armF: [100, 40]}, pt, f);
	return (
		<Stage cam={cam} bg="#2b2046" light={{x: 24, y: 8, o: 0.4}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<StreamScreen x={1260} y={470} s={0.95} press={press} f={f} />
					<Cursor x={cx} y={cy} press={press} />
					<Actor who="hero" x={620} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, -0.1]} mouth="smile" pose={hp} handF={pt > 0.4 ? 'point' : undefined} uid="h24" />
					<HeroPlate x={620} s={0.95} dx={70} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 029–030: the vote chart, the kangaroo; Irma covers her eyes */
const S25: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp = useSpeaking(gf);
	const t0 = at('029');
	const k1 = sp01(f, t0 + 20, 80);
	const k2 = sp01(f, t0 + 90, 60);
	const total = interpolate(f, [t0 + 10, t0 + 150], [0, 2000000], {...clamp, easing: ease});
	const fp = env(f, at('030'), at('030') + 44, 8, 10);
	const ip = gesture('facepalm', {...idle(gf, 1), lean: 3}, fp, f);
	const cam0 = pickCam(sp, {IRMA: camOn(1020, 520, 1.0)}, camOn(960, 520, 1.0));
	return (
		<Stage cam={slowPush(f, 210, cam0, 1.08)} bg="#1b2150" light={{x: 30, y: 8, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} lampOn={0.6} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<VoteChart x={860} y={520} s={1} k1={k1} k2={k2} total={total} />
					<Actor who="irma" x={1610} floor={FL} s={IS} facing={-1} faceTurn={0.3} look={[-0.8, 0.2]} mouth={fp > 0.3 ? 'flat' : 'flat'} pose={ip} armOver={fp > 0.5} uid="i25" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 031: first place: two cards with a lightning bolt between them */
const S27: React.FC = () => {
	const {f, at} = useShot();
	const cam = usePush(camOn(960, 540, 1.0), camOn(960, 520, 1.2));
	const t0 = at('031');
	const a = sp01(f, t0 + 4, 14);
	const bolt = env(f, t0 + 56, t0 + 100, 4, 20);
	return (
		<Stage cam={cam} bg="#0a0c1f" light={{night: true, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<HallFar f={f} cage={false} up={1} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g opacity={a}>
						<Portrait who="rex" id="r" x={660 - 220 * (1 - a)} y={540} name="БУЛЬДОЗЕР" tilt={-4} />
						<Portrait who="voron" id="v" x={1260 + 220 * (1 - a)} y={540} name="ВОРОН" tilt={4} flip />
					</g>
					<Bolt x={960} y={540} s={2.4 + 0.2 * Math.sin(f / 3)} o={bolt} />
					<Sparks x={960} y={540} t={f - (t0 + 56)} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 032: two champions, two belts, one cage */
const S28: React.FC = () => {
	const {f, gf, at} = useShot();
	const t0 = at('032');
	const cam = usePush(camOn(960, 560, 1.0), camOn(960, 520, 1.25));
	const hit1 = sp01(f, t0 + 190, 10);
	const bx = (side: -1 | 1) => 960 + side * (560 - 420 * hit1);
	const swing = Math.sin(f / 9) * 5;
	return (
		<Stage cam={cam} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Layer depth={1.4}>
				<Svg>
					<CageSide f={gf} shake={f > t0 + 190 && f < t0 + 210 ? 5 : 0} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="rex" x={520} floor={FL} s={1.15} facing={1} faceTurn={0.4} look={[0.8, 0]} expr="angry" pose={guard(idle(gf, 1), 0.7)} uid="r28" />
					<Actor who="voron" x={1400} floor={FL} s={1.05} facing={-1} faceTurn={0.4} look={[-0.8, 0]} expr="angry" pose={guard(idle(gf, 2), 0.7)} uid="v28" />
					<Cap x={520} y={245} t="СРЕДНИЙ ВЕС" k={Math.min(sp01(f, t0 + 20, 12), 1 - sp01(f, t0 + 196, 8))} />
					<Cap x={1400} y={245} t="ТЯЖЕЛОВЕС" k={Math.min(sp01(f, t0 + 90, 12), 1 - sp01(f, t0 + 196, 8))} />
					<BeltProp x={bx(-1)} y={385 + swing} s={0.8} rot={-6 + hit1 * 6} />
					<BeltProp x={bx(1)} y={385 - swing} s={0.8} rot={6 - hit1 * 6} />
					<Sparks x={960} y={385} t={f - (t0 + 192)} n={26} r={340} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 033: Rex takes his glasses off and winks at the cameras */
const GlassesProp: React.FC = () => (
	<g transform="translate(18,-40) rotate(-20)">
		<rect x={-44} y={-16} width={40} height={30} rx={8} fill="#0b0b0d" stroke="#ff6a3c" strokeWidth={4} />
		<rect x={4} y={-16} width={40} height={30} rx={8} fill="#0b0b0d" stroke="#ff6a3c" strokeWidth={4} />
		<line x1={-4} y1={-6} x2={4} y2={-6} stroke="#ff6a3c" strokeWidth={4} />
	</g>
);
const S29: React.FC = () => {
	const {f, gf, at} = useShot();
	const t0 = at('033');
	const cam = usePush(camOn(960, 520, 1.15), camOn(960, 480, 1.5));
	const off = f > t0 + 44;
	const wink = env(f, t0 + 58, t0 + 80, 4, 6);
	const arm = env(f, t0 + 30, t0 + 96, 10, 8);
	const hp = gesture('presentF', {...idle(gf, 4), armF: [140, 40]}, arm, f);
	return (
		<Stage cam={cam} bg="#1b2150" light={{x: 40, y: 8, o: 0.35}}>
			<Layer depth={1.5}>
				<Svg>
					<PressRoom f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="rex" x={960} floor={FL} s={1.5} facing={1} faceTurn={0.1} look={[0, 0]} mouth="smirk" acc={off ? ['belt'] : ['sunglasses', 'belt']} lidL={wink} handItem={off ? <GlassesProp /> : undefined} pose={hp} uid="r29" />
					<FlashBurst x={380} y={640} t={(f + 4) % 22} />
					<FlashBurst x={1560} y={720} t={(f + 11) % 26} />
					<FlashBurst x={700} y={860} t={(f + 17) % 30} r={120} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 034: third place — a line written by hand */
const S30: React.FC = () => {
	const {f, gf, at} = useShot();
	const t0 = at('034');
	const cam = usePush(camOn(960, 520, 1.0), camOn(960, 540, 1.16));
	const hand = sp01(f, t0 + 120, 100);
	return (
		<Stage cam={cam} bg="#1b2150" light={{x: 30, y: 8, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} lampOn={0.5} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<RatingBoard x={960} y={520} s={1} hand={hand} f={f} />
					{hand > 0 && hand < 1 ? <Pen x={960 - 490 + 1100 * hand} y={520 + 196} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 035–036: «Это вообще кто?» — he swipes the line away and ends the stream */
const S31: React.FC = () => {
	const {f, gf, at} = useShot();
	const t5 = at('035');
	const t6 = at('036');
	const cam = usePush(camOn(1160, 520, 1.0), camOn(1130, 520, 1.15));
	const away = sp01(f, t5 + 24, 16);
	const sw = env(f, t5 + 14, t5 + 50, 8, 10);
	const rowX = 1380 - 336 + 440 * sw * 0;
	const tx = interpolate(sw, [0, 1], [944, 1290]);
	const hp = reach({...idle(gf, 3), lean: 4}, 'F', toLocal(tx, 669, 810, FL - 157 * HS, HS, 1), Math.max(sw, env(f, t5 - 6, t5 + 14, 6, 4)));
	const off = sp01(f, t6 + 8, 10);
	void rowX;
	return (
		<Stage cam={cam} bg="#1b2150" light={{x: 30, y: 8, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} lampOn={0.5} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<RatingBoard x={1400} y={520} s={0.76} hand={1} f={f} away={away} off={off} />
					<Actor who="hero" x={810} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0.2]} expr="worried" pose={hp} handF="point" uid="h31" />
					<HeroPlate x={810} s={0.95} dx={140} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------------------------------------------------------------- PART 5 */

/* 037: cards laid out like patience, more cards than table */
const S32: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(1000, 540, 1.0), camOn(1060, 520, 1.2));
	const n = Math.floor(interpolate(f, [12, 200], [0, 27], clamp));
	const toss = Math.sin(f / 3.2);
	const hp: Pose = {...idle(gf, 3), lean: 6, armF: [70 + 30 * toss, 40 - 20 * toss], armB: [-12, 20]};
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 60, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={720} y={740} width={1020} height={36} rx={10} fill="#6b4a2c" />
					<rect x={760} y={776} width={26} height={124} fill="#4f361f" />
					<rect x={1670} y={776} width={26} height={124} fill="#4f361f" />
					<CardsOnTable x0={820} x1={1640} y={650} n={n} f={f} />
					<Actor who="hero" x={500} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0.3]} mouth="open" pose={hp} uid="h32" />
					<HeroPlate x={500} s={0.95} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 038: «Подпись. Чек. Подпись. Чек.» — four beats, the plate clicks 260 → 240 → 220 → 200 */
const S33: React.FC = () => {
	const {f, gf, at} = useShot();
	const t0 = at('038');
	const beat = Math.floor((f - t0) / 14);
	const local = (f - t0) % 14;
	const beats = f >= t0 && beat <= 3;
	const pulse = beats ? Math.exp(-local / 3) : 0;
	const cam = mixCam(camOn(1000, 520, 1.1 + 0.06 * pulse), camOn(1040, 520, 1.3), interpolate(f, [0, 100], [0, 1], clamp));
	const hp: Pose = {...idle(gf, 3), lean: 8 + 6 * pulse, armF: [60 + 40 * pulse, 50], head: 4 * pulse};
	const isSign = beats && beat % 2 === 0;
	const isCheque = beats && beat % 2 === 1;
	return (
		<Stage cam={cam} bg="#e4dccb" light={{x: 60, y: 10, o: 0.35}}>
			<Layer depth={1.4}>
				<Svg>
					<Office />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={760} y={740} width={1000} height={36} rx={10} fill="#6b4a2c" />
					{isSign ? (
						<g transform={`translate(1220,520) scale(${1 + 0.08 * pulse})`}>
							<rect x={-250} y={-200} width={500} height={400} rx={16} fill="#fbf8ef" stroke="#0d0d1c" strokeWidth={6} />
							<rect x={-200} y={-140} width={400} height={20} rx={10} fill="#cdd1de" />
							<rect x={-200} y={-90} width={300} height={20} rx={10} fill="#cdd1de" />
							<Scribble x={-200} y={60} k={sp01(f, t0 + beat * 14, 8)} />
							<Pen x={-200 + 420 * sp01(f, t0 + beat * 14, 8)} y={50} />
						</g>
					) : null}
					{isCheque ? <Cheque x={1220} y={520} s={1.5 + 0.1 * pulse} rot={-4} text="ЧЕК" /> : null}
					{!beats ? <Cheque x={1220} y={560} s={1.5} rot={-4} text="ЧЕК" /> : null}
					<Actor who="hero" x={640} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0.2]} mouth="smile" pose={hp} bob={pulse * 10} uid="h33" />
					<HeroPlate x={640} s={0.95} dx={30} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 039–040: Rex in a real bulldozer; Irma shows the card that has no room for everyone */
const S34: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp = useSpeaking(gf);
	const k = sp01(f, at('040') + 6, 44);
	const wave = Math.sin(f / 5);
	const rp: Pose = {...idle(gf, 4), armF: [150 + wave * 22, 20], legB: [88, 85], legF: [92, 90], lean: -4};
	const cam0 = pickCam(sp, {IRMA: camOn(1000, 520, 1.0)}, camOn(960, 520, 1.0));
	return (
		<Stage cam={slowPush(f, 190, cam0, 1.18)} bg="#9fd0ff" light={{x: 70, y: 6, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Yard />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Bulldozer x={540} s={1.0} blade={Math.max(0, wave)} />
					<Actor who="rex" x={540} floor={FL} seat={560} s={1.0} facing={1} faceTurn={0.2} look={[0.7, 0]} mouth="smile" pose={rp} shadow={false} uid="r34" />
					{k > 0.01 ? <KardGrid x={1440} y={470} s={0.74} k={k} /> : null}
					<Actor who="irma" x={1060} floor={FL} s={IS} facing={1} faceTurn={0.3} look={[0.4, 0.4]} mouth="flat" pose={{...idle(gf, 1), armF: [58, 62]}} uid="i34" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 041: a star on holiday gets a fight in ten days; the plate drops to 180 */
const S36: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(960, 540, 1.0), camOn(980, 520, 1.22));
	const bub = f - (at('041') + 40);
	const wv = Math.sin(f / 5);
	const kp = reach({...idle(gf, 7), lean: 4, armB: [50 + wv * 30, 40 + wv * 10]}, 'F', [38, -168], 1);
	return (
		<Stage cam={cam} bg="#7fd0ff" light={{x: 80, y: 4, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Beach f={gf} />
					<Umbrella x={1340} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={560} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.8, 0]} mouth="open" pose={kp} handF="fist" uid="h36" />
					<HeroPlate x={560} s={0.95} />
					<rect x={1180} y={800} width={360} height={30} rx={12} fill="#2f6fd8" stroke="#0d0d1c" strokeWidth={5} />
					<rect x={1210} y={830} width={14} height={70} fill="#0d0d1c" />
					<rect x={1500} y={830} width={14} height={70} fill="#0d0d1c" />
					<Actor who="star" x={1360} floor={FL} seat={760} s={1.1} facing={-1} faceTurn={0.3} look={[-0.7, 0]} mouth="smile" pose={{...idle(gf, 2), legB: [90, 60], legF: [94, 64], lean: -8, armF: [70, 70], armB: [60, 70]}} shadow={false} uid="st36" />
					{bub > 0 ? (
						<Bubble x={1360} y={320} w={460} h={150} t={bub} tail={[0, 150]} fill="#ffe3ef">
							<text x={0} y={26} textAnchor="middle" fontSize={78} fontFamily={FONT} fontWeight={900} fill="#5a1740">
								ДАВАЙ!
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 042: three kilos over the limit; a fifth of the fee goes to the opponent */
const S37: React.FC = () => {
	const {f, gf, at} = useShot();
	const t0 = at('042');
	const cam = usePush(camOn(1100, 560, 1.0), camOn(1180, 540, 1.22));
	const red = sp01(f, t0 + 18, 8);
	const ch = sp01(f, t0 + 120, 40);
	return (
		<Stage cam={cam} bg="#dfe7ee" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<WeighRoom />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<WeighSign x={700} y={250} />
					<BigScale x={900} s={1.1} text={red > 0.3 ? '+3 КГ' : '0.0'} c={red > 0.3 ? '#ff5a5a' : '#6ff0a0'} id="bs37" />
					<Actor who="star" x={900} floor={FL - 52 * 1.1} s={1.0} facing={1} faceTurn={0.3} look={[0.6, 0.3]} expr="worried" pose={idle(gf, 2)} uid="st37" shadow={false} />
					<Extra i={3} x={1640} floor={FL} s={1.15} facing={-1} seed="opp" expr="wide" />
					{ch > 0.02 ? <Cheque x={1060 + 480 * ch} y={760 - 20 * ch} s={1.0} rot={-8 + 20 * ch} text="20% ШТРАФ" /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 043–045: the star is out of breath, Irma: «Бойцу нужен лагерь», Kostya writes it on his palm */
const S38: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp = useSpeaking(gf);
	const cam0 = pickCam(sp, {IRMA: camOn(1100, 520, 1.15), HERO: camOn(1330, 500, 1.15)}, camOn(1020, 540, 1.0));
	const tap = Math.max(env(f, at('044') + 12, at('044') + 24, 3, 3), env(f, at('044') + 34, at('044') + 44, 3, 3));
	const wr = sp01(f, at('045') + 14, 30);
	const ip = reach({...idle(gf, 1), lean: 3}, 'F', toLocal(900, 650 - 20 * tap, 980, FL - 157 * IS, IS, -1), 1);
	const kp = reach({...idle(gf, 3), lean: 6}, 'B', [40, -10], env(f, at('045') + 4, at('045') + 60, 6, 6));
	return (
		<Stage cam={slowPush(f, 210, cam0, 1.05)} bg="#090b1d" light={{night: true, o: 0.25}}>
			<Layer depth={1.4}>
				<Svg>
					<CageSide f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="star" x={400} floor={FL} s={1.05} facing={1} faceTurn={0.3} look={[0.3, 0.6]} expr="sleepy" mouth="open" pose={{...idle(gf, 2), lean: 18, head: 14, armF: [20, 70], armB: [14, 70]}} uid="st38" />
					<Steam x={400} y={560} f={f} />
					<Actor who="irma" x={980} floor={FL} s={IS} facing={-1} faceTurn={0.3} look={[-0.5, 0.4]} mouth="flat" pose={ip} handF="point" uid="i38" />
					<Cap x={820} y={290} t="ЛАГЕРЬ ≠ 10 ДНЕЙ" k={Math.min(sp01(f, at('044') + 6, 12), 1 - sp01(f, at('045') - 6, 8))} size={54} />
					<Actor who="hero" x={1520} floor={FL} s={HS} facing={-1} faceTurn={0.4} look={[-0.6, 0.5]} mouth="line" pose={kp} uid="h38" />
					<HeroPlate x={1520} s={0.95} />
					{wr > 0 ? <Cap x={1235} y={640} t="ЛАГЕРЬ" k={wr} size={72} c="#6ff0a0" /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ---------------------------------------------------------------- PART 6 */

/* 046: two names are struck out of the card */
const S39: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(1000, 520, 1.0), camOn(1060, 520, 1.2));
	const k = sp01(f, at('046') + 130, 40);
	return (
		<Stage cam={cam} bg="#2b2046" light={{x: 24, y: 8, o: 0.4}}>
			<Layer depth={1.5}>
				<Svg>
					<Studio f={gf} lampOn={0.6} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<CardList x={1220} y={520} s={0.9} k={k} />
					<Actor who="hero" x={420} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.9, 0]} expr={k > 0.5 ? 'worried' : 'normal'} pose={gesture('rubChin', idle(gf, 3), env(f, 20, 200, 12, 10), f)} uid="h39" />
					<HeroPlate x={420} s={0.95} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 047: weigh-in day, Senya comes in alone */
const S40: React.FC = () => {
	const {f, gf} = useShot();
	const w = walkTo(f, 10, 120, -300, 760, 5, 0.3);
	const cam = usePush(camOn(900, 560, 1.0), camOn(1000, 540, 1.2));
	return (
		<Stage cam={cam} bg="#dfe7ee" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<WeighRoom />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<WeighSign x={640} y={250} />
					<BigScale x={860} s={1.0} text="0.0" c="#6ff0a0" id="bs40a" />
					<BigScale x={1260} s={1.0} text="0.0" c="#6ff0a0" id="bs40b" />
					<Actor who="senya" x={w.x} floor={FL} s={1.2} facing={1} faceTurn={0.5} look={[0.8, 0]} outfit="hoodie" pose={w.pose} vx={w.vx} bob={w.bob} uid="s40" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 048–049: «Тебя же сняли.» — «Знаю. Я делаю вес.» */
const S41: React.FC = () => {
	const {f, gf, at} = useShot();
	const sp = useSpeaking(gf);
	const t9 = at('049');
	const jacket = f < t9 + 14;
	const up = sp01(f, t9 + 34, 10);
	const cam0 = pickCam(sp, {IRMA: camOn(1700, 520, 1.4), SENYA: camOn(1050, 540, 1.4)}, camOn(1250, 540, 1.1));
	const ip = {...idle(gf, 1), armF: [-52, 70] as [number, number]};
	return (
		<Stage cam={slowPush(f, 100, cam0)} bg="#dfe7ee" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<WeighRoom />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<WeighSign x={640} y={250} />
					<BigScale x={1000} s={1.0} text={up > 0.5 ? 'ЛИМИТ' : '0.0'} c="#6ff0a0" id="bs41" />
					<Actor who="senya" x={840 + 160 * up} floor={FL - 52 * 1.0 * up} s={1.2} facing={1} faceTurn={0.5} look={[0.6, 0.4]} outfit={jacket ? 'hoodie' : 'tee'} pose={idle(gf, 5)} uid="s41" shadow={false} />
					<Actor who="irma" x={1720} floor={FL} s={IS} facing={-1} faceTurn={0.2} look={sp === 'IRMA' ? [-0.8, 0.1] : [-0.2, 0.6]} mouth="flat" pose={ip} uid="i41" />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 050–051: both rookies make the weight exactly; Senya ties his shoe */
const S42: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(1020, 540, 1.0), camOn(1060, 540, 1.25));
	const ok = sp01(f, at('050') + 100, 6);
	const bub = f - (at('050') + 120);
	const tie = env(f, at('051') + 30, at('051') + 100, 10, 10);
	const sp = tie > 0 ? bent({...idle(gf, 5), lean: 0, head: 0} as Pose, tie) : idle(gf, 5);
	return (
		<Stage cam={cam} bg="#dfe7ee" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<WeighRoom />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<WeighSign x={500} y={250} />
					<BigScale x={700} s={1.0} text={ok > 0.5 ? 'ЛИМИТ ✓' : '0.0'} c="#6ff0a0" id="bs42a" />
					<BigScale x={1290} s={1.0} text={ok > 0.5 ? 'ЛИМИТ ✓' : '0.0'} c="#6ff0a0" id="bs42b" />
					<Actor who="senya" x={700} floor={FL - 52 * 1.0} s={1.2} facing={1} faceTurn={0.5} look={[0.6, 0.5]} pose={sp} uid="s42" shadow={false} />
					<Actor who="tayo" x={1290} floor={FL - 52 * 1.0} s={1.2} facing={-1} faceTurn={0.5} look={[-0.6, 0.3]} pose={idle(gf, 6)} uid="t42" shadow={false} />
					{bub > 0 && f < at('050') + 225 ? (
						<Bubble x={1460} y={262} w={420} h={140} t={bub} tail={[-170, 110]}>
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

/* 052: Kostya hugs the stars for the cameras; behind the glass the two rookies hit their bags */
const S44: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(1000, 540, 1.0), camOn(1120, 520, 1.12));
	const punch = (t: number) => env(f, t, t + 8, 2, 5);
	const sp1 = hit(guard(idle(gf, 1), 1), 'F', 330, 0.8, 1, [470, hip(0.8) - 150 * 0.8], Math.max(punch(8 + 24 * 0), punch(32), punch(56), punch(80), punch(104)));
	const tp1 = hit(guard(idle(gf, 2), 1), 'F', 680, 0.8, 1, [790, hip(0.8) - 150 * 0.8], Math.max(punch(20), punch(44), punch(68), punch(92), punch(116)));
	return (
		<Stage cam={cam} bg="#2b3350" light={{x: 60, y: 8, o: 0.3}}>
			<Layer depth={1.4}>
				<Svg>
					<rect x={-500} y={-300} width={2920} height={1300} fill="#cdd6e8" />
					<rect x={-500} y={900} width={2920} height={400} fill="#8d97ad" />
					<TrainRoom x={120} w={780} f={f} />
				</Svg>
			</Layer>
			<Layer depth={1.15}>
				<Svg>
					<g transform="translate(0,-90)">
						<Actor who="senya" x={330} floor={FL} s={0.8} facing={1} faceTurn={0.4} look={[0.8, 0]} pose={sp1} uid="s44" shadow={false} />
						<Actor who="tayo" x={680} floor={FL} s={0.8} facing={1} faceTurn={0.4} look={[0.8, 0]} pose={tp1} uid="t44" shadow={false} />
					</g>
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="star" x={1090} floor={FL} s={1.15} facing={-1} faceTurn={0.2} look={[-0.4, 0]} mouth="smile" pose={{...idle(gf, 2), armF: [70, 30]}} uid="st44" />
					<Actor who="rex" x={1560} floor={FL} s={1.2} facing={-1} faceTurn={0.2} look={[-0.4, 0]} mouth="smirk" pose={{...idle(gf, 4), armF: [70, 30]}} uid="r44" />
					<Actor who="hero" x={1330} floor={FL} s={HS} facing={-1} faceTurn={0.2} look={[-0.5, 0]} mouth="smile" pose={{...idle(gf, 3), armF: [-60, 20], armB: [60, 20]}} uid="h44" />
					<HeroPlate x={1330} s={0.95} dx={0} />
					<FlashBurst x={1010} y={200} t={(f + 3) % 18} r={110} />
					<FlashBurst x={1980} y={260} t={(f + 9) % 22} r={90} />
					<FlashBurst x={1000} y={120} t={(f + 14) % 30} r={80} />
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS456: ShotDef[] = [
	{at: '028', whip: true, C: S24},
	{at: '029', C: S25},
	{at: '031', whip: true, C: S27},
	{at: '032', whip: true, C: S28},
	{at: '033', whip: true, C: S29},
	{at: '034', whip: true, C: S30},
	{at: '035', C: S31},
	{at: '037', whip: true, C: S32},
	{at: '038', C: S33},
	{at: '039', whip: true, C: S34},
	{at: '041', whip: true, C: S36},
	{at: '042', whip: true, C: S37},
	{at: '043', whip: true, C: S38},
	{at: '046', whip: true, C: S39},
	{at: '047', whip: true, C: S40},
	{at: '048', C: S41},
	{at: '050', C: S42},
	{at: '052', whip: true, C: S44},
];
