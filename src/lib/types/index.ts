export type MetServiceData = {
	variables: {
		'cloud.cover': { data: string[] };
		'wind.speed.at-100m': { data: string[] };
		'wind.direction.at-100m': { data: string[] };
		'wave.height': { data: string[] };
	};
};

export type Weather = {
	cloud: string;
	wave: { height: string };
	wind: { speed: number; direction: string };
};

export type TimeOfDay = 'day' | 'sunset' | 'night' | undefined;

export type Data = {
	weather: Weather;
	timeOfDay?: TimeOfDay;
};

export type Phase = {
	bg: string;
	cloud: string;
	waves: string;
	boat?: string;
	lights?: string;
};

export type Phases = {
	day: Phase;
	sunset: Phase;
	night: Phase;
};
