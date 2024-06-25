import { onMount } from 'svelte';
import { readable } from 'svelte/store';

import { breakpoints } from '$lib/utils/tailwind';

export const isDesktop = readable(false, (set) => {
	onMount(() => {
		const mediaQueryList = window.matchMedia(`(min-width: ${breakpoints[`sm-t`]})`);
		set(mediaQueryList.matches);

		mediaQueryList.addEventListener('change', (event) => {
			if (event.matches) {
				set(true);
			} else {
				set(false);
			}
		});
	});
});

export const isMobile = readable(false, (set) => {
	onMount(() => {
		const mediaQueryList = window.matchMedia(
			`(max-width: ${+breakpoints[`sm-t`].replace('px', '') - 1}px)`
		);
		set(mediaQueryList.matches);

		mediaQueryList.addEventListener('change', (event) => {
			if (event.matches) {
				set(true);
			} else {
				set(false);
			}
		});
	});
});
