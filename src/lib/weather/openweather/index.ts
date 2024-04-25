import { OPEN_WEATHER_API_KEY } from '$env/static/private';

const lyttleton = { lat: -43.6030053219916, lon: 172.71710540236882 };
const exclude = [
	'current',
	'minutely',
	'hourly',
	'daily',
	'alerts'
];
const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lyttleton.lat}&lon=${lyttleton.lon}&exclude=${exclude.join(',')}&appid=${OPEN_WEATHER_API_KEY}&units=metric`;

export const fetchOpenWeatherData = async () => {
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching OpenWeather data:', error);
		throw error; // re-throw the error so it can be handled by the caller
	}
};
