import moment from 'moment-timezone';
import SunCalc from 'suncalc';

export const getTimeOfDay = () => {
	const lyttleton = { lat: -43.6030053219916, lon: 172.71710540236882 };
	const timezone = 'Pacific/Auckland';

	// Get the current date and time in the specified timezone
	const currentDate = moment().tz(timezone);
	const currentDateTime = currentDate.toDate();

	// Calculate sunrise and sunset times for the current day
	const sunTimes = SunCalc.getTimes(currentDateTime, lyttleton.lat, lyttleton.lon);
	const dawn = moment(sunTimes.dawn).tz(timezone);
	const sunrise = moment(sunTimes.sunrise).tz(timezone);
	const sunset = moment(sunTimes.sunset).tz(timezone);
	const nauticalDusk = moment(sunTimes.nauticalDusk).tz(timezone);

	// Compare current time with sunrise and sunset times
	if (currentDate.isBefore(dawn)) {
		return 'night';
	} else if (currentDate.isSameOrAfter(dawn) && currentDate.isBefore(sunrise)) {
		return 'sunrise';
	} else if (currentDate.isSameOrAfter(sunrise) && currentDate.isBefore(sunset)) {
		return 'day';
	} else if (currentDate.isSameOrAfter(sunset) && currentDate.isBefore(nauticalDusk)) {
		return 'sunset';
	} else {
		return 'night';
	}
};

export const toggleFullScreen = (e: KeyboardEvent) => {
	if (e.key !== 'f') return;

	if (!document?.fullscreenElement) {
		// Request full-screen
		document.documentElement.requestFullscreen().catch((err) => {
			console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
		});
	} else {
		// Exit full-screen
		document.exitFullscreen().catch((err) => {
			console.error(`Error attempting to disable full-screen mode: ${err.message} (${err.name})`);
		});
	}
};
