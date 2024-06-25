/** @type {import('tailwindcss').Config} */
import { breakpoints, createTailWindGrid, spacing } from './src/lib/utils/tailwind';

const { gridSpan, gridColumns } = createTailWindGrid();

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		screens: breakpoints,
		gridColumn: gridSpan,
		gridColumnStart: gridColumns,
		gridColumnEnd: gridColumns,
		spacing: spacing(),
		extend: {}
	},
	plugins: []
};
