import {WHIPS} from './coverage';

/* whip-pan into a new location: the old frame flies aside, the new one arrives, smeared.
   The picture is scaled up more than it is shifted (ZOOM * 960 px > SHIFT), so no dark strip shows at the edges. */
export const WHIP_LEN = 5;
export const WHIP_SHIFT = 110;
export const WHIP_ZOOM = 0.22;
export const WHIP_BLUR = 36;
export const whipAt = (f: number) => {
	for (const b of WHIPS) {
		const d = f - b;
		if (d >= -WHIP_LEN && d < WHIP_LEN) {
			const k = d < 0 ? (d + WHIP_LEN + 1) / (WHIP_LEN + 1) : 1 - d / WHIP_LEN;
			return {k: k * k, dir: (d < 0 ? -1 : 1) as 1 | -1};
		}
	}
	return null;
};
