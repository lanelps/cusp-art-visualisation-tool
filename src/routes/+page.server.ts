// import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { fetchWeatherData } from '$lib/metservice';

export const load: PageServerLoad = async () => {
	const data = await fetchWeatherData();

	return { weather: data };

	// error(404, 'Not found');
};
