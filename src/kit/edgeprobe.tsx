import {useEffect, useState} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';

/* Only for tools/check-edges.mjs (Long with edge: true). After the frame is painted it measures the real DOM:
   - every piece of text (SVG or HTML) and every panel (navy / cream rect) must be fully inside the frame and
     60 px from every edge («cut» = clipped by the frame, «near» = closer than 60 px);
   - text must not be covered by an actor or by another painted shape («covered»);
   - actors that are partly (3–60 %) outside the frame are listed as «actor-cut».
   The result goes to the browser log as `EDGEPROBE {...}` (tools/check-edges.mjs reads it). No colours, no guessing. */
const PANEL_FILLS = new Set(['rgb(17, 20, 44)', 'rgb(251, 248, 239)', 'rgb(19, 23, 53)', 'rgb(255, 227, 239)', 'rgb(241, 234, 216)', 'rgb(27, 30, 42)']);
const SAFE = 60;
// shapes that can hide text (text over text is not counted: SVG hit-testing uses the whole em box, so it would always fire)
const PAINT = new Set(['rect', 'path', 'circle', 'ellipse', 'polygon', 'polyline', 'line', 'image']);

const effOpacity = (el: Element | null) => {
	let o = 1;
	for (let e = el; e && e !== document.body; e = e.parentElement) {
		const cs = getComputedStyle(e);
		o *= parseFloat(cs.opacity || '1');
		if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
	}
	return o;
};

export const probe = (frame: number) => {
	const W = window.innerWidth;
	const H = window.innerHeight;
	const issues: {kind: string; what: string; box: number[]; by?: string; side?: string}[] = [];
	const classify = (r: DOMRect, pad: number) => {
		const cut = r.left < -2 || r.top < -2 || r.right > W + 2 || r.bottom > H + 2;
		const outside = r.right < 0 || r.bottom < 0 || r.left > W || r.top > H;
		if (outside) return null;
		const side = [r.left - pad < SAFE ? 'left' : '', r.right + pad > W - SAFE ? 'right' : '', r.top - pad < SAFE ? 'top' : '', r.bottom + pad > H - SAFE ? 'bottom' : ''].filter(Boolean).join('+');
		if (cut) return {kind: 'cut', side: side || 'edge'};
		if (side) return {kind: 'near', side};
		return null;
	};
	const box = (r: DOMRect) => [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)];
	// text
	const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let n = tw.nextNode(); n; n = tw.nextNode()) {
		const t = (n.textContent ?? '').trim();
		if (!t) continue;
		const el = n.parentElement;
		if (!el || el.closest('script,style')) continue;
		const range = document.createRange();
		range.selectNodeContents(n);
		const r = range.getBoundingClientRect();
		if (r.width < 4 || r.height < 4) continue;
		const op = effOpacity(el);
		if (op < 0.25) continue;
		const c = classify(r, 16);
		if (c) issues.push({kind: c.kind, what: 'text «' + t.slice(0, 40) + '»', box: box(r), side: c.side});
		// covered?
		if (op < 0.5) continue;
		let hits = 0;
		let covered = 0;
		let by = '';
		let byBox = '';
		let under = 0;
		let underBy = '';
		let underBox = '';
		for (let i = 0; i < 12; i++) {
			for (let j = 0; j < 24; j++) {
				const x = r.left + (r.width * (i + 0.5)) / 12;
				const y = r.top + (r.height * (j + 0.5)) / 24;
				if (x < 0 || y < 0 || x > W || y > H) continue;
				const stack = document.elementsFromPoint(x, y);
				const idx = stack.findIndex((e) => e === el || el.contains(e));
				if (idx < 0) continue;
				hits++;
				// what lies right UNDER the text (shelf item, cage rail, prop): letters must not melt into it
				for (let k = idx + 1; k < stack.length; k++) {
					const e = stack[k];
					const tag = e.tagName.toLowerCase();
					if (!PAINT.has(tag) || e.contains(el) || el.contains(e) ) continue;
					if (effOpacity(e) < 0.6) continue;
					const cs = getComputedStyle(e);
					const thick = parseFloat(cs.strokeWidth || '0') >= 6;
					if (cs.fill === 'none' && !(thick && cs.stroke !== 'none')) continue;
					if (tag === 'line' && !thick) continue;
					const q = e.getBoundingClientRect();
					if (q.width * q.height < 3000) continue; // a glint / phone light / dot is not an object
					if (q.width * q.height > W * H * 0.4) continue; // wall, floor, sky: a backdrop is fine
					if (q.left <= r.left + 2 && q.right >= r.right - 2 && q.top <= r.top + 2 && q.bottom >= r.bottom - 2) break; // the text lies wholly on this plate / sheet / bubble
					under++;
					underBy = e.closest('[data-actor]')?.getAttribute('data-actor') ?? tag;
					underBox = '[' + box(q).join(',') + ']';
					break; // only the topmost painted thing under this point counts
				}
				for (let k = 0; k < idx; k++) {
					const e = stack[k];
					if (!PAINT.has(e.tagName.toLowerCase()) || e.contains(el) || el.contains(e)) continue;
					if (effOpacity(e) < 0.6) continue;
					const cs = getComputedStyle(e);
					const tag = e.tagName.toLowerCase();
					if ((tag === 'line' || tag === 'polyline') || (cs.fill === 'none' && (tag === 'path' || parseFloat(cs.strokeWidth || '0') < 3))) continue; // strike-throughs, underlines, chains are meant to cross text
					covered++;
					by = e.closest('[data-actor]')?.getAttribute('data-actor') ?? e.tagName.toLowerCase();
					byBox = '[' + box(e.getBoundingClientRect()).join(',') + ']';
					break;
				}
			}
		}
		if (hits >= 3 && covered >= 1) issues.push({kind: 'covered', what: 'text «' + t.slice(0, 40) + '»', box: box(r), by: by + (byBox ? ' ' + byBox : '')});
		// (reported below, after we know whether the text sits on its own plate)
		// overflow: the text sticks out of the plate / stamp / paper it is written on
		let best: DOMRect | null = null;
		let bestEl: Element | null = null;
		let node: Element | null = el;
		for (let up = 0; up < 3 && node; up++, node = node.parentElement) {
			node.parentElement?.querySelectorAll(':scope > rect').forEach((rc) => {
				const q = rc.getBoundingClientRect();
				if (q.width < r.width * 0.6 || q.height < r.height * 0.8) return;
				const cx = r.left + r.width / 2;
				const cy = r.top + r.height / 2;
				if (cx < q.left || cx > q.right || cy < q.top || cy > q.bottom) return;
				if (!best || q.width * q.height < best.width * best.height) {
					best = q;
					bestEl = rc;
				}
			});
			if (best) break;
		}
		const b = best as DOMRect | null;
		const solid = !!bestEl && getComputedStyle(bestEl as Element).fill !== 'none' && effOpacity(bestEl) >= 0.6; // an outline-only stamp is not a plate
		if (!solid && hits >= 3 && under >= 2) issues.push({kind: 'under', what: 'text «' + t.slice(0, 40) + '»', box: box(r), by: underBy + ' ' + underBox});
		const m = (el as unknown as SVGGraphicsElement).getScreenCTM?.();
		const rotated = !!m && (Math.abs(m.b) > 0.2 || Math.abs(m.c) > 0.2); // the box of a rotated text is bigger than the text itself
		if (b && !rotated && (r.left < b.left - 4 || r.right > b.right + 4)) issues.push({kind: 'overflow', what: 'text «' + t.slice(0, 40) + '»', box: box(r), side: 'plate ' + box(b).join(',')});
	}
	// panels
	document.querySelectorAll('rect').forEach((e) => {
		const cs = getComputedStyle(e);
		if (!PANEL_FILLS.has(cs.fill)) return;
		const r = e.getBoundingClientRect();
		if (r.width < 140 || r.height < 56 || effOpacity(e) < 0.4) return;
		const c = classify(r, 0);
		if (c) issues.push({kind: c.kind, what: 'panel', box: box(r), side: c.side});
	});
	// actors
	document.querySelectorAll('[data-actor]').forEach((e) => {
		const r = e.getBoundingClientRect();
		if (r.width < 20 || effOpacity(e) < 0.4) return;
		const vis = Math.max(0, Math.min(r.right, W) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0));
		const frac = 1 - vis / (r.width * r.height);
		// a close-up may crop legs / chairs at the bottom; the head side (left, right, top) must not be cut
		const sideCut = r.left < -2 || r.right > W + 2 || r.top < -2;
		if (sideCut && frac > 0.03 && frac < 0.6) issues.push({kind: 'actor-cut', what: e.getAttribute('data-actor') ?? 'actor', box: box(r)});
		// a plate / board / panel lying over the actor's upper body (face, hair, lamp)
		let hid = 0;
		let hidBy = '';
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				const x = r.left + (r.width * (i + 0.5)) / 8;
				const y = r.top + (r.height * 0.4 * (j + 0.5)) / 8;
				if (x < 0 || y < 0 || x > W || y > H) continue;
				const stack = document.elementsFromPoint(x, y);
				const idx = stack.findIndex((n) => e.contains(n));
				if (idx <= 0) continue;
				for (let k = 0; k < idx; k++) {
					const n = stack[k];
					if (n.tagName.toLowerCase() === 'rect' && PANEL_FILLS.has(getComputedStyle(n).fill) && effOpacity(n) >= 0.6) {
						hid++;
						const q = n.getBoundingClientRect();
						hidBy = '[' + box(q).join(',') + ']';
						break;
					}
				}
			}
		}
		if (hid >= 3) issues.push({kind: 'panel-over-actor', what: e.getAttribute('data-actor') ?? 'actor', box: box(r), by: 'panel ' + hidBy});
	});
	return {frame, issues};
};

export const EdgeProbe: React.FC = () => {
	const frame = useCurrentFrame();
	const [h] = useState(() => delayRender('edge-probe'));
	useEffect(() => {
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				try {
					console.log('EDGEPROBE ' + JSON.stringify(probe(frame)));
				} catch (e) {
					console.log('EDGEPROBE ' + JSON.stringify({frame, error: String(e)}));
				}
				continueRender(h);
			}),
		);
	}, []);
	return null;
};
