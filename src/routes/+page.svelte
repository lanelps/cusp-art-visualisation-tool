<script lang="ts">
	export let data;

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

<h1 class="w-full text-2xl font-bold text-center">Lyttleton Weather</h1>
<section class="flex w-full h-screen">
	<div class="relative flex items-center justify-center w-full h-full">
		<div
			style="--scale-y: {waveHeightTransform}%; --opacity: {cloudOpacity};"
			class="wave relative w-16 h-16 bg-blue-500 rounded-full opacity-[var(--opacity)]"
		/>
		<p class="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
			Wave Height:
			{waveHeight.data[0]}
			{waveHeight.units}
		</p>
	</div>

	<div class="relative flex items-center justify-center w-full h-full">
		<div
			style="--scale-x: {windWidthTransform}%; --opacity: {cloudOpacity};"
			class="wind w-16 h-16 bg-red-500 rounded-full opacity-[var(--opacity)]"
		/>
		<p class="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
			Wind Speed:
			{windSpeed.data[0]}
			{windSpeed.units}
		</p>
	</div>
</section>

<style>
	@keyframes waveHeightAnimation {
		0% {
			transform: scaleY(100%);
		}
		100% {
			transform: scaleY(var(--scale-y));
		}
	}

	@keyframes windWidthAnimation {
		0% {
			transform: scaleX(100%);
		}
		100% {
			transform: scaleX(var(--scale-x));
		}
	}

	.wave {
		animation: waveHeightAnimation 2s infinite alternate;
	}

	.wind {
		animation: windWidthAnimation 2s infinite alternate;
	}
</style>
