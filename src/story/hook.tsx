import React from 'react';
import {Layer, Svg} from '../engine/camera';
import {random} from 'remotion';
import {counterAt, useShot} from '../kit/core';
import {camOn, mixCam, Stage} from '../kit/kit';
import {interpolate} from 'remotion';
import {clamp, ease} from '../kit/kit';
import {Crowd, DayPlate, OctagonTop} from './places';

/* The hook frame: the octagon from above, light into its centre, an empty cage, the plate «ДО ТУРНИРА 0 ДНЕЙ».
   The SAME component opens the video (001) and closes it (122), so the repeat is one to one: everything runs on the shot's own
   frame counter (f), and the camera drifts over a fixed 210 frames (the length of the opening shot), not over the shot length.
   `offset` lets a later shot continue the drift where the repeat stopped. */
export const HOOK_LEN = 210;
export const HookShot: React.FC<{offset?: number; plateOpacity?: number}> = ({offset = 0, plateOpacity = 1}) => {
	const {f: f0} = useShot();
	const f = f0 + offset;
	const base = mixCam(camOn(930, 540, 1.0), camOn(1000, 580, 1.14), interpolate(f, [0, HOOK_LEN], [0, 1], {...clamp, easing: ease}));
	// a little hand-held sway on the shot's own counter (the automatic angle of Stage is switched off: it depends on the shot length and on the global frame)
	const cam = {...base, x: base.x + Math.sin(f / 47) * 5, y: base.y + Math.sin(f / 61) * 3.5};
	const {gf} = useShot();
	return (
		<Stage cam={cam} bg="#070914" light={{night: true, o: 0.3}} still>
			<Layer depth={1.5}>
				<Svg>
					<OctagonTop f={f} />
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
					<DayPlate x={960} y={560} value={counterAt(gf)} s={1.5} blink={plateOpacity} />
				</Svg>
			</Layer>
			<Layer depth={0.8}>
				<Svg>
					{Array.from({length: 30}).map((_, i) => (
						<circle key={i} cx={random('hd' + i) * 1920 + Math.sin(f / 40 + i) * 20} cy={(random('he' + i) * 1080 + f * (0.3 + random('hf' + i) * 0.5)) % 1080} r={1.2 + random('hg' + i) * 2.3} fill="#aebcff" opacity={0.45} />
					))}
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
