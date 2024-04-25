import { TOMORROW_IO_API_KEY } from '$env/static/private';

const lyttleton = { lat: -43.6030053219916, lon: 172.71710540236882 };

const url = `https://api.tomorrow.io/v4/weather/realtime?location=${lyttleton.lat},${lyttleton.lon}&apikey=${TOMORROW_IO_API_KEY}`;

export const fetchTomorrowWeatherData = async () => {
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
		console.error('Error fetching Tomorrow.io data:', error);
		throw error; // re-throw the error so it can be handled by the caller
	}
};
