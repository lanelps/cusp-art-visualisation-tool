import { METSERVICE_API_KEY } from '$env/static/private';

const url = 'https://forecast-v2.metoceanapi.com/point/time';
const lyttleton = { lat: -43.6030053219916, lon: 172.71710540236882 };
const variables = ['cloud.cover', 'wind.speed.at-100m', 'wind.direction.at-100m', 'wave.height'];
const time = {
	from: new Date().toISOString(),
	interval: '1h',
	repeat: 0
};

const weather = {
	points: [lyttleton],
	variables,
	time
};

export const fetchWeatherData = async () => {
	const response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(weather),
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': METSERVICE_API_KEY
		}
	});
	const data = await response.json();
	return data;
};
