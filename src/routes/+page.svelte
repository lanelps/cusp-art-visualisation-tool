<script lang="ts">
	import { onMount } from 'svelte';
	// import YouTubePlayer from '$lib/components/YouTubePlayer.svelte';
	// import MuxVideo from '$lib/components/MuxVideo.svelte';
	import lytDayVid from '$lib/assets/lyt-day.mp4';
	import lytDayBG from '$lib/assets/lyt-day.png';
	import lytDayCloud from '$lib/assets/lyt-day-cloud.png';
	import lytDayWaves from '$lib/assets/lyt-day-waves.png';

	import lytEveningVid from '$lib/assets/lyt-evening.mp4';
	import lytEveningCloud from '$lib/assets/lyt-evening-cloud.png';
	import lytEveningWaves from '$lib/assets/lyt-evening-waves.png';

	import lytNightVid from '$lib/assets/lyt-night.mp4';

	import lytBirds from '$lib/assets/lyt-birds.gif';

	export let data;

	const cloudCover = data.weather.variables['cloud.cover'];
	const waveHeight = data.weather.variables['wave.height'];
	const windSpeed = data.weather.variables['wind.speed.at-100m'];
	const windDirection = data.weather.variables['wind.direction.at-100m'];

	let cloud = cloudCover.data[0];
	let wave = waveHeight.data[0];
	let wind = windSpeed.data[0];
	let direction = windDirection.data[0];

	const mapWaveHeight = (waveHeight: number) => {
		// Map wave height from 0-15m to 0-100
		let mappedHeight = (waveHeight / 8) * 100;

		// Map 0-100 to 0% - 10%
		let percentageHeight = mappedHeight * 0.1;

		return percentageHeight / 2;
	};

	const mapWindSpeed = (windSpeed: number) => {
		// Map wind speed from 0-30m/s to 0-100
		let mappedSpeed = (windSpeed / 30) * 100;

		// Map 0-100 to 0-0.05
		let percentageSpeed = mappedSpeed * 0.0005;

		return percentageSpeed;
	};

	const mapCloudOpacity = (cloudCover: number) => {
		// cloud cover is a percentage from 0-100
		// 100 is fully covered, 0 is clear
		// 100 is 100 opacity, 0 is 1 opacity
		return cloudCover / 100;
	};

	$: cloudOpacity = mapCloudOpacity(cloud);
	$: waveHeightTransform = mapWaveHeight(wave);

	let windSpeedTransform;
	let windDirectionTransform;

	let birds: HTMLDivElement | null = null;
	let t = 0;
	let scale = 100 * windSpeedTransform * 50; // adjust as needed
	let speed = windSpeedTransform; // adjust as needed
	let prevX = 0;
	let prevY = 0;
	let lerpFactor = windSpeedTransform; // adjust as needed

	const lerp = (start: number, end: number, factor: number): number =>
		start + (end - start) * factor;

	// Reactive statements to update windSpeedTransform and windDirectionTransform when state changes
	$: {
		windSpeedTransform = mapWindSpeed(wind);
		windDirectionTransform = direction;
	}

	onMount(() => {
		const animate = () => {
			if (!birds) return;

			let scale = 100 * windSpeedTransform * 50; // adjust as needed
			let speed = windSpeedTransform; // adjust as needed
			let lerpFactor = windSpeedTransform; // adjust as needed

			t += speed;
			let x = (scale * Math.cos(t)) / (1 + Math.pow(Math.sin(t), 2));
			let y = (scale * Math.cos(t) * Math.sin(t)) / (1 + Math.pow(Math.sin(t), 2));

			// Apply linear interpolation
			let lerpX = lerp(prevX, x, lerpFactor);
			let lerpY = lerp(prevY, y, lerpFactor);

			birds.style.transform = `translate(calc(-50% + ${lerpX}px), calc(-50% + ${lerpY}px))`;

			// Update previous positions
			prevX = lerpX;
			prevY = lerpY;

			requestAnimationFrame(animate);
		};
		animate();
	});

	// Reactive statement to update position when state changes
	$: if (birds) {
		let angle = (windDirectionTransform * Math.PI) / 180; // Convert to radians
		let originX = `${50 + 50 * Math.sin(angle)}%`; // Use sin for X
		let originY = `${50 - 50 * Math.cos(angle)}%`; // Use cos for Y and subtract from 50

		birds.style.left = originX;
		birds.style.top = originY;
	}
</script>

<!-- <YouTubePlayer /> -->
<!-- <MuxVideo
	playbackId="01wESwLxbelt01vYMQ01xxKoiKQQVacEvU02WE8se8dYG3g"
	metaData={{ videoTitle: 'Lyttelton Weather' }}
/> -->
<div class="absolute w-screen h-screen overflow-hidden pointer-events-none">
	<!-- <img src={lytDayBG} alt="Lyttelton Day" class="absolute w-full h-full" /> -->
	<video
		src={lytDayVid}
		title="Lyttelton Day"
		class="absolute object-cover w-full h-full"
		autoplay
		loop
		muted
	/>
	<img
		src={lytDayCloud}
		alt="Lyttelton Day Cloud"
		style="--opacity: {cloudOpacity};"
		class="absolute w-full h-full opacity-[var(--opacity)]"
	/>
	<div style="--wave-height: {waveHeightTransform}%;" class="absolute w-full h-full">
		<img src={lytDayWaves} alt="Lyttelton Day Waves" class="absolute w-full h-full" />
		<img src={lytDayWaves} alt="Lyttelton Day Waves" class="absolute w-full h-full wave" />
	</div>
	<img
		bind:this={birds}
		src={lytBirds}
		alt="Birds"
		class="absolute w-[25vw] h-auto pointer-events-none"
	/>
</div>

<section class="relative z-10 p-3 text-white bg-black w-max top-4 left-4">
	<div>
		<p>Cloud Coverage: {cloud} {cloudCover.units}</p>
		<input type="range" min="0" max="100" step="1" bind:value={cloud} />
	</div>

	<div>
		<p>
			Wave Height:
			{wave}
			{waveHeight.units}
		</p>
		<input type="range" min="0" max="15" step="0.1" bind:value={wave} />
	</div>

	<div>
		<p>
			Wind Speed:
			{wind}
			{windSpeed.units}
		</p>
		<input type="range" min="0" max="30" step="0.1" bind:value={wind} />
	</div>

	<div>
		<p>
			Wind Direction:
			{direction}
			{windDirection.units}
		</p>
		<input type="range" min="0" max="360" step="1" bind:value={direction} />
	</div>
</section>

<style>
	@keyframes waveHeightAnimation {
		0% {
			transform: translateY(calc(var(--wave-height) * -1));
		}
		100% {
			transform: translateY(var(--wave-height));
		}
	}

	.wave {
		animation: waveHeightAnimation 2s infinite alternate ease-in-out;
	}
</style>
