<script lang="ts">
	import { onMount } from 'svelte';
	// import YouTubePlayer from '$lib/components/YouTubePlayer.svelte';
	// import MuxVideo from '$lib/components/MuxVideo.svelte';

	import lytDayBG from '$lib/assets/lyt-day.png';
	import lytDayCloud from '$lib/assets/lyt-day-clouds.png';
	import lytDayWaves from '$lib/assets/lyt-day-waves.png';

	import lytSunsetBG from '$lib/assets/lyt-sunset.png';
	import lytSunsetCloud from '$lib/assets/lyt-sunset-clouds.png';
	import lytSunsetWaves from '$lib/assets/lyt-sunset-waves.png';

	import lytNightBG from '$lib/assets/lyt-night.png';
	import lytNightCloud from '$lib/assets/lyt-night-clouds.png';
	import lytNightWaves from '$lib/assets/lyt-sunset-waves.png';

	import lytBirds from '$lib/assets/lyt-birds.gif';
	import lytBoat from '$lib/assets/lyt-boat.gif';
	import ltyLights from '$lib/assets/lyt-lights.gif';

	export let data;

	let cloud = data.cloud || 0;
	let wave = data.wave.height || 0;
	let wind = data.wind.speed || 0;
	let direction = data.wind.direction || 0;

	const phases = {
		day: { bg: lytDayBG, cloud: lytDayCloud, waves: lytDayWaves, boat: lytBoat },
		sunset: { bg: lytSunsetBG, cloud: lytSunsetCloud, waves: lytSunsetWaves, lights: ltyLights },
		night: { bg: lytNightBG, cloud: lytNightCloud, waves: lytNightWaves, lights: ltyLights }
	};

	let timeofDay = 'day';
	$: activePhase = phases[timeofDay];

	let infoActive = false;

	const MAX_CLOUD_COVERAGE = 100;
	const MAX_WAVE_HEIGHT = 15;
	const MAX_WIND_SPEED = 100;

	const mapCloudOpacity = (cloudCover: number) => {
		// cloud cover is a percentage from 0-100
		// 100 is fully covered, 0 is clear
		// 100 is 100 opacity, 0 is 1 opacity
		return cloudCover / MAX_CLOUD_COVERAGE;
	};

	const mapWaveHeight = (waveHeight: number) => {
		// Map wave height from 0-15m to 0-100
		let mappedHeight = (waveHeight / MAX_WAVE_HEIGHT) * 100;

		// Map 0-100 to 0% - 10%
		let percentageHeight = mappedHeight * 0.1;

		return percentageHeight / 2;
	};

	const mapWindSpeed = (windSpeed: number) => {
		// Map wind speed from 0-100m/s to 0-100
		let mappedSpeed = (windSpeed / MAX_WIND_SPEED) * 100;

		// Map 0-100 to 0-0.05
		let percentageSpeed = mappedSpeed * 0.001;

		return percentageSpeed;
	};

	$: cloudOpacity = mapCloudOpacity(cloud);
	$: waveHeightTransform = mapWaveHeight(wave);

	let windSpeedTransform: number = 0;
	let windDirectionTransform: number = 0;

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
<div class="absolute w-screen h-screen overflow-hidden pointer-events-none aspect-video">
	<img
		src={activePhase.bg}
		alt="Lyttelton Background"
		class="absolute top-0 left-0 object-cover w-full h-full"
	/>/
	<div style="--wave-height: {waveHeightTransform}%;" class="absolute top-0 left-0 w-full h-full">
		<img
			src={activePhase.waves}
			alt="Lyttelton Day Waves"
			class="absolute object-cover w-full h-full"
		/>
		<img
			src={activePhase.waves}
			alt="Lyttelton Day Waves"
			class="absolute object-cover w-full h-full wave"
		/>
	</div>
	<img
		src={activePhase.cloud}
		alt="Lyttelton Cloud"
		style="--opacity: {cloudOpacity};"
		class="absolute w-full h-full opacity-[var(--opacity)] top-0 left-0 object-cover"
	/>

	{#if activePhase?.lights}
		<img
			src={activePhase.lights}
			alt="Lyttelton Lights"
			class="absolute top-0 left-0 object-cover w-full h-full"
		/>
	{/if}

	{#if activePhase?.boat}
		<img
			src={activePhase.boat}
			alt="Lyttelton Boat"
			class="absolute top-0 left-0 object-cover w-full h-full"
		/>
	{/if}

	<img
		bind:this={birds}
		src={lytBirds}
		alt="Birds"
		class="absolute w-[25vw] h-auto pointer-events-none object-cover"
	/>
</div>

<section class="relative z-10 text-white bg-black w-max top-4 left-4">
	<button
		class="flex items-center justify-between w-full py-1 px-3"
		on:click={() => (infoActive = !infoActive)}
	>
		<span>Info</span>
		<span>
			{infoActive ? '-' : '+'}
		</span>
	</button>

	<div
		class="grid grid-rows-[0fr] transition-[grid-template-rows]"
		class:grid-rows-[1fr]={infoActive}
	>
		<div class="overflow-hidden">
			<div class="p-3">
				<div>
					<p>Cloud Coverage: {cloud}%</p>
					<input type="range" min="0" max={MAX_CLOUD_COVERAGE} step="1" bind:value={cloud} />
				</div>

				<div>
					<p>
						Wave Height: {wave} Metres
					</p>
					<input type="range" min="0" max="15" step="0.1" bind:value={wave} />
				</div>

				<div>
					<p>
						Wind Speed: {wind} km/h
					</p>
					<input type="range" min="0" max={MAX_WIND_SPEED} step="0.1" bind:value={wind} />
				</div>

				<div>
					<p>
						Wind Direction: {direction}°
					</p>
					<input type="range" min="0" max="360" step="1" bind:value={direction} />
				</div>

				<div>
					<p>Time Of Day</p>
					<select bind:value={timeofDay} class="px-2 py-1 bg-transparent border border-white">
						{#each Object.keys(phases) as phase}
							<option value={phase}>{phase}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
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
