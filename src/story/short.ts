import type React from 'react';

// шортс: см. short-pick.json (выбор реплик), shortV.tsx (сцены), short-sound.json (звук)
export type Seg = {
	line: string;
	at?: number;
	ep?: string;
	off?: number;
	cont?: boolean;
	hold?: boolean;
	a?: {cx?: number; cy?: number; z?: number};
	b?: {cx?: number; cy?: number; z?: number};
	C?: React.FC<{f: number; dur: number}>;
	top?: 'hook' | 'p9';
	label?: string;
};

export const SHORT: {mode: 'crop'; hook?: string[]; bed?: string} | {mode: 'recut'; segs: Seg[]; hook?: string[]; bed?: string} = {
	// recut: озвучка лонга, вертикальные сцены нарисованы в shortV.tsx (Short.tsx их не режет из 16:9)
	mode: 'recut',
	segs: [],
	bed: 'sfx/bed_short.wav',
};
