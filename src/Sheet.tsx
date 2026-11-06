import React from 'react';
import {AbsoluteFill} from 'remotion';

// заглушка раскадровки: размеры как в шаблоне, содержимое - тёмный фон с «UFC»
export type SheetProps = {comp: 'Long' | 'Short'; frames: number[]; cols: number; title?: string};
export const SHEET_W = 1920;
export const sheetSize = (p: SheetProps) => {
	const cw = SHEET_W / p.cols;
	const ch = p.comp === 'Long' ? (cw * 9) / 16 : (cw * 16) / 9;
	return {width: SHEET_W, height: Math.ceil(p.frames.length / p.cols) * ch + (p.title ? 60 : 0), cw, ch};
};
export const Sheet: React.FC<SheetProps> = () => (
	<AbsoluteFill style={{background: '#101216', color: '#fff', alignItems: 'center', justifyContent: 'center', fontSize: 120, fontFamily: 'sans-serif'}}>UFC</AbsoluteFill>
);
