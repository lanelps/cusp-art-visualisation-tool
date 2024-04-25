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
		cloud: parseFloat(data.variables['cloud.cover'].data[0]).toFixed(2),
		wind: {
			speed: parseFloat(data.variables['wind.speed.at-100m'].data[0]).toFixed(2) * 3.6,
			direction: parseFloat(data.variables['wind.direction.at-100m'].data[0]).toFixed(2)
		},
		wave: {
			height: parseFloat(data.variables['wave.height'].data[0]).toFixed(2)
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

	const getTimeOfDay = () => {
		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();

		if (currentHour >= 6 && currentHour < 17) {
			// if between 6am and 5pm, it's day
			return 'day';
		} else if (currentHour === 17 && currentMinute >= 0 && currentMinute <= 30) {
			// if between 5pm and 5:30pm, it's sunset
			return 'sunset';
		} else {
			// otherwise, it's night
			return 'night';
		}
	};

	return { weather, timeOfDay: getTimeOfDay() };
};
