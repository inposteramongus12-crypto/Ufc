// заглушка: настройки ролика заполняются вместе со сценарием
export type CounterKeyDef = {line: string; off?: number; v: number; roll?: number};

export const STORY: {
	title: string;
	hero: string; // cast id of the main character
	counter?: {label: string; color?: string; keys: CounterKeyDef[]}; // badge over the hero
	heroAge?: (counter: number) => number;
	heroGrow?: number;
	bed: string; // sound bed in public/ (ambience + sfx, no music)
	musicVolume?: number;
	endCaption?: string[]; // last words on screen (call to action)
} = {
	title: 'Что если стать президентом UFC?',
	hero: 'hero',
	counter: {
		label: 'ДО ТУРНИРА',
		keys: [
			{line: '001', v: 0},
			{line: '004', off: 8, v: 365, roll: 56}, // отмотка: 0 → 365
			{line: '013', off: 4, v: 351, roll: 36}, // первый турнир, день 15
			{line: '018', off: 4, v: 330, roll: 36}, // Ворон хочет уйти, день 36
			{line: '024', off: 12, v: 300, roll: 40}, // «ещё через месяц», день 66
			{line: '028', off: 6, v: 295, roll: 24}, // голосование, день 71
			{line: '037', off: 6, v: 280, roll: 20}, // скупка звёзд, день 86
			{line: '038', off: 0, v: 260, roll: 5}, // «Подпись. Чек. Подпись. Чек.»: четыре удара
			{line: '038', off: 14, v: 240, roll: 5},
			{line: '038', off: 28, v: 220, roll: 5},
			{line: '038', off: 42, v: 200, roll: 5},
			{line: '041', off: 6, v: 180, roll: 30}, // звезда из отпуска, день 186
			{line: '046', off: 6, v: 120, roll: 36}, // Галкина и Адеби снимают с карда, день 246
			{line: '053', off: 6, v: 90, roll: 30}, // Рекс заходит без стука, день 276
			{line: '062', off: 6, v: 60, roll: 30}, // промотур, день 306
			{line: '063', off: 120, v: 50, roll: 20}, // табличка 60 → 50, день 316
			{line: '064', off: 6, v: 45, roll: 24}, // бюджет кончился, день 321
			{line: '067', off: 4, v: 22, roll: 24}, // анализы, день 344
			{line: '067', off: 110, v: 20, roll: 12}, // допуск комиссии, день 346
			{line: '069', off: 6, v: 6, roll: 40}, // последняя остановка, день 360
		],
	},
	bed: 'sfx/bed.wav',
};
