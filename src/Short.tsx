import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import STL from './story/short-timeline.json';
import {Line} from './kit/core';
import {EdgeCtx} from './kit/kit';
import {EdgeProbe} from './kit/edgeprobe';
import {SHORT_TOTAL, SHORT_WHIPS, ShortV} from './story/shortV';

/* 9:16 short, recut from the long's voice (no new voice-over): vertical scenes are drawn in src/story/shortV.tsx.
   Voice lines come from short-timeline.json (tools/make-short-timeline.mjs reads short-pick.json), the sound bed
   public/sfx/bed_short.wav is built from short-sound.json (the join job of render.yml does it). edge — only for tools/check-edges.mjs. */
export const SHORT_FRAMES = SHORT_TOTAL;
const WL = 5;
const whipV = (f: number) => {
	for (const b of SHORT_WHIPS) {
		const d = f - b;
		if (d >= -WL && d < WL) return {k: Math.pow(d < 0 ? (d + WL + 1) / (WL + 1) : 1 - d / WL, 2), dir: (d < 0 ? -1 : 1) as 1 | -1};
	}
	return null;
};

export const Short: React.FC<{sound?: boolean; edge?: boolean}> = ({sound = true, edge = false}) => {
	const f = useCurrentFrame();
	const w = whipV(f);
	return (
		<EdgeCtx.Provider value={edge}>
			{edge ? <EdgeProbe /> : null}
			<AbsoluteFill style={{background: '#000'}}>
				<svg width={0} height={0} style={{position: 'absolute'}}>
					<filter id="whipBlurV" x="-20%" y="0%" width="140%" height="100%">
						<feGaussianBlur stdDeviation={`${w ? 30 * w.k : 0} 0`} />
					</filter>
				</svg>
				{/* the whip: shift 62 px < zoom 0.12 × 540 px, so no dark strip shows at the edge */}
				<AbsoluteFill style={w ? {transform: `translateX(${w.dir * 62 * w.k}px) scale(${1 + 0.12 * w.k})`, filter: edge ? undefined : 'url(#whipBlurV)'} : undefined}>
					<ShortV />
				</AbsoluteFill>
				{sound ? (
					<>
						{(STL.lines as Line[]).map((l) => (
							<Sequence key={l.id} from={l.from} durationInFrames={l.dur + 4}>
								<Audio src={staticFile(l.file)} startFrom={l.trimStart} />
							</Sequence>
						))}
						<Audio src={staticFile('sfx/bed_short.wav')} />
					</>
				) : null}
				<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 6], [1, 0], {extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />
			</AbsoluteFill>
		</EdgeCtx.Provider>
	);
};
