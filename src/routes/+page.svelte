<script lang="ts">
	export let data;

	console.log(data.weather.variables);

	const cloudCover = data.weather.variables['cloud.cover'];
	const waveHeight = data.weather.variables['wave.height'];
	const windSpeed = data.weather.variables['wind.speed.at-100m'];

	const mapWaveHeight = (waveHeight: number) => {
		// Map wave height from 0-15m to 0-100
		let mappedHeight = (waveHeight / 15) * 100;

		// Map 0-100 to 100%-1000%
		let percentageHeight = 100 + mappedHeight * 9; // 100% at 0 and 1000% at 100

		return percentageHeight;
	};

	const mapWindWidth = (windSpeed: number) => {
		// Map wind speed from 0-30m/s to 0-100
		let mappedSpeed = (windSpeed / 30) * 100;

		// Map 0-100 to 100%-1000%
		let percentageSpeed = 100 + mappedSpeed * 9; // 100% at 0 and 1000% at 100

		return percentageSpeed;
	};

	const mapCloudOpacity = (cloudCover: number) => {
		// cloud cover is a percentage from 0-100
		// 100 is fully covered, 0 is clear
		// 100 is 0 opacity, 0 is 1 opacity
		return 1 - cloudCover / 100;
	};

	let waveHeightTransform = mapWaveHeight(waveHeight.data[0]);
	let windWidthTransform = mapWindWidth(windSpeed.data[0]);
	let cloudOpacity = mapCloudOpacity(cloudCover.data[0]);
</script>

<section class="w-full h-screen flex items-center justify-center">
	<div
		style="--scale-y: {waveHeightTransform}%; --opacity: {cloudOpacity};"
		class="w-16 h-16 bg-blue-500 rounded-full scale-y-[var(--scale-y)] opacity-[var(--opacity)]"
	/>
	<div
		style="--scale-x: {windWidthTransform}%; --opacity: {cloudOpacity};"
		class="w-16 h-16 bg-red-500 rounded-full scale-x-[var(--scale-x)] opacity-[var(--opacity)]"
	/>
</section>
