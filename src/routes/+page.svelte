<script lang="ts">
	import YouTubePlayer from '$lib/components/YouTubePlayer.svelte';

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

<YouTubePlayer />
<section class="relative z-10 w-full h-screen">
	<div
		class="absolute flex flex-col items-center gap-2 text-center text-white -translate-x-1/2 top-4 left-1/2"
	>
		<h1 class="p-2 text-2xl font-bold bg-black w-max">Lyttelton Weather</h1>

		<p class="p-2 bg-black w-max">Cloud coverage {cloudCover.data[0]} {cloudCover.units}</p>
	</div>

	<div class="flex w-full h-full">
		<div class="relative flex items-center justify-center w-full h-full">
			<div class="relative">
				<div
					style="--scale-y: {waveHeightTransform}%; --opacity: {cloudOpacity};"
					class="relative w-16 h-16 bg-blue-500 rounded-full wave opacity-[var(--opacity)]"
				/>
				<p
					class="absolute p-2 text-white -translate-x-1/2 bg-black top-[calc(100%+0.5rem)] left-1/2 w-max"
				>
					Wave Height:
					{waveHeight.data[0]}
					{waveHeight.units}
				</p>
			</div>
		</div>

		<div class="relative flex items-center justify-center w-full h-full">
			<div class="relative">
				<div
					style="--scale-x: {windWidthTransform}%; --opacity: {cloudOpacity};"
					class="w-16 h-16 bg-red-500 rounded-full wind opacity-[var(--opacity)]"
				/>
				<p
					class="absolute p-2 text-white -translate-x-1/2 bg-black top-[calc(100%+0.5rem)] left-1/2 w-max"
				>
					Wind Speed:
					{windSpeed.data[0]}
					{windSpeed.units}
				</p>
			</div>
		</div>
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
