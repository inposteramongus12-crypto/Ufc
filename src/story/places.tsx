import React from 'react';
import {AgeBadge} from '../kit/ui';

// заглушка: места (залы, улицы, комнаты) заполняются вместе со сценарием; оставлен только счётчик-табличка
export const Tag: React.FC<{x: number; y: number; value: number; f: number; s?: number; warn?: boolean; ok?: boolean; grey?: boolean; bpm?: number; label?: string; pop?: number; heart?: boolean; auto?: boolean; showBpm?: boolean; heartK?: number}> = ({x, y, value, s = 0.8, pop = 1, label = 'ДЕНЬ'}) => (
	<g>
		<AgeBadge x={x} y={y} value={value} s={s} pop={pop} label={label} c="#ffc94a" />
	</g>
);
