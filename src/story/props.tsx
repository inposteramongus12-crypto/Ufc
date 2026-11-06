import React from 'react';

/* Hand-held props for the cast (drawn in the front hand's coordinates). */
// планшет Ирмы: тёмный корпус, светлый экран с карточками бойцов (не логотип)
export const Tablet: React.FC = () => (
	<g transform="translate(14,-22) rotate(-8)">
		<rect x={-4} y={-26} width={62} height={46} rx={7} fill="#0b0b0d" stroke="#e8f3f1" strokeWidth={3} />
		<rect x={2} y={-20} width={50} height={34} rx={3} fill="#cfeee9" />
		<rect x={7} y={-15} width={18} height={10} rx={2} fill="#1fb5a8" />
		<rect x={28} y={-15} width={18} height={10} rx={2} fill="#d9372b" />
		<rect x={7} y={-1} width={39} height={5} rx={2} fill="#6b7f8e" />
		<rect x={7} y={7} width={26} height={4} rx={2} fill="#6b7f8e" />
	</g>
);
