// import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { fetchWeatherData } from '$lib/weather/metservice';
// import { fetchOpenWeatherData } from '$lib/weather/openweather';
// import { fetchTomorrowWeatherData } from '$lib/weather/tomorrow';

export const load: PageServerLoad = async () => {
	const data = await fetchWeatherData();
	// const data = await fetchOpenWeatherData();
	// const { data } = await fetchTomorrowWeatherData();

	const weather = {
		cloud: data.variables['cloud.cover'].data[0],
		wind: {
			speed: data.variables['wind.speed.at-100m'].data[0] * 3.6,
			direction: data.variables['wind.direction.at-100m'].data[0]
		},
		wave: {
			height: data.variables['wave.height'].data[0]
		}
	};

	// const weather = {
	// 	cloud: data?.clouds?.all,
	// 	wind: {
	// 		speed: data?.wind?.speed * 3.6,
	// 		direction: data?.wind?.deg
	// 	},
	// 	wave: {
	// 		height: null
	// 	}
	// };

	// const weather = {
	// 	cloud: data?.values?.cloudCover,
	// 	wind: {
	// 		speed: data?.values?.windSpeed * 3.6,
	// 		direction: data?.values?.windDirection
	// 	},
	// 	wave: {
	// 		height: null
	// 	}
	// };

	return weather;
};
