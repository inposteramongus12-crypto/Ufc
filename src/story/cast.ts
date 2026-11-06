import React from 'react';
import type {Base} from '../kit/actions';
import {Tablet} from './props';

/* Characters of this video. Key = id used in <Actor who="..."/>; `sp` = speaker code in
   lines.json (default: the id in upper case). Keep the hero yellow: the audience learns
   the colour in the first seconds and finds the hero in any crowd.
   Looks: color (hoodie), outfit hoodie|suit|gown|coat|apron|tee, hair none|spiky|bun|cap|
   ponytail|grey|bob|short, hairColor, acc [headphones|mustache|glasses|sunglasses|ringlight|belt],
   glove (boxing gloves colour), beltColor, shoe.
   Rule: one body colour per character, no two the same; the rest of the colour is in a prop.
   No real brands, logos or faces. */
export type CastMember = Base & {sp?: string};

export const CAST: Record<string, CastMember> = {
	// Костя Шпак, блогер: жёлтый, кольцевая лампа за головой (его студия)
	hero: {color: '#f2b21c', hair: 'short', acc: ['ringlight'], rim: '#fff0cc', rimW: 2.4, shoe: '#f2f2f2'},
	// Ирма Ларсен, матчмейкер: бирюзовый костюм, пучок, очки, планшет в руке
	irma: {sp: 'IRMA', color: '#1fb5a8', outfit: 'suit', hair: 'bun', acc: ['glasses'], handItem: React.createElement(Tablet), rim: '#e6fffb', rimW: 2.4, shoe: '#16302e'},
	// Рекс «Бульдозер» Бураков: красный, лысый, оранжевые очки, золотой пояс
	rex: {sp: 'REX', color: '#d9372b', outfit: 'tee', hair: 'none', acc: ['sunglasses', 'belt'], beltColor: '#ffd34a', rim: '#ffe0c8', rimW: 2.4, shoe: '#111'},
	// Сеня Галкин: синий, торчащие волосы, белые перчатки
	senya: {sp: 'SENYA', color: '#2f6fd8', outfit: 'tee', hair: 'spiky', hairColor: '#5a3a22', glove: '#f4f4f4', rim: '#e6f0ff', rimW: 2.4, shoe: '#f2f2f2'},
	// Тайо Адеби: зелёный, кепка, розовые перчатки (без голоса, облачко)
	tayo: {color: '#3fae4f', outfit: 'tee', hair: 'cap', hairColor: '#f5f5f0', glove: '#ff4fa0', rim: '#e8fff0', rimW: 2.4, shoe: '#f2f2f2'},
	// Звезда в отпуске (облачко «ДАВАЙ!», без голоса): розовая, очки, шлёпанцы-жёлтые
	star: {color: '#ee7fb0', outfit: 'tee', hair: 'none', acc: ['sunglasses'], rim: '#ffe3ef', rimW: 2.4, shoe: '#ffd34a'},
	// Ворон, чемпион-тяжеловес (огромный, но в кадре без пояса): тёмно-синий худи, широкий торс, тёмная чёлка, седые усы (без голоса, облачко)
	voron: {color: '#2e3bb0', outfit: 'hoodie', hair: 'bob', hairColor: '#2b1d3a', acc: ['mustache'], scale: 1.18, bulk: 1.35, rim: '#e6e9ff', rimW: 2.4, shoe: '#1d2150'},
	// тяжеловес: малиновый, самый высокий и самый широкий (bulk 1.5), седой, пояс виден (без голоса, облачко)
	heavy: {color: '#c2409a', outfit: 'tee', hair: 'grey', age: 0.6, scale: 1.2, bulk: 1.5, acc: ['belt'], beltColor: '#e8eef2', rim: '#ffe0f2', rimW: 2.4, shoe: '#111'},
};

/* Облачка без голоса: реплика показывается текстом в пузыре этого цвета.
   Телеканала нет в кадре как человека: это только облачко и безымянный логотип. */
export type Cloud = {fill: string; ink: string; stroke: string; shape: 'speech' | 'screen'; label: string};
export const CLOUDS: Record<string, Cloud> = {
	tayo: {fill: '#e3f7e6', ink: '#14501f', stroke: '#3fae4f', shape: 'speech', label: 'Тайо Адеби'},
	voron: {fill: '#e3e6ff', ink: '#141a5c', stroke: '#2e3bb0', shape: 'speech', label: 'Ворон'},
	heavy: {fill: '#fbe3f1', ink: '#5a1445', stroke: '#c2409a', shape: 'speech', label: 'Тяжеловес'},
	star: {fill: '#ffe3ef', ink: '#5a1740', stroke: '#ee7fb0', shape: 'speech', label: 'Звезда'},
	tv: {fill: '#e4e6ec', ink: '#1a1f2b', stroke: '#9aa3b5', shape: 'screen', label: 'Телеканал'},
};
