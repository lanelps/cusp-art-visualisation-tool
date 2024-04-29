import moment from 'moment-timezone';

export const getTimeOfDay = () => {
	const currentDate = moment().tz('Pacific/Auckland');
	const currentHour = currentDate.hour();
	const currentMinute = currentDate.minute();

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
