<script lang="ts">
	import type { Data, Phases, TimeOfDay } from '$lib/types';
	import { onMount } from 'svelte';
	import moment from 'moment-timezone';
	// import YouTubePlayer from '$lib/components/YouTubePlayer.svelte';
	import MuxVideo from '$lib/components/MuxVideo.svelte';

	import { getTimeOfDay } from '$lib/utils/helpers';

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

	export let data: Data;

	let { cloud: cloudStr, wave: waveObj, wind: windObj } = data.weather;
	let cloud = Number(cloudStr) || 0;
	let wave = Number(waveObj.height) || 0;
	let wind = Number(windObj.speed) || 0;
	let direction = Number(windObj.direction) || 0;

	const MAX_VALUES = {
		CLOUD_COVERAGE: 100,
		WAVE_HEIGHT: 15,
		WIND_SPEED: 100
	};

	const phases: Phases = {
		day: { bg: lytDayBG, cloud: lytDayCloud, waves: lytDayWaves, boat: lytBoat },
		sunset: { bg: lytSunsetBG, cloud: lytSunsetCloud, waves: lytSunsetWaves, lights: ltyLights },
		night: { bg: lytNightBG, cloud: lytNightCloud, waves: lytNightWaves, lights: ltyLights }
	};

	let timeOfDay: TimeOfDay = data.timeOfDay;
	$: activePhase = timeOfDay ? phases[timeOfDay] : undefined;
	let manualOverride = false;
	let timeString = moment().tz('Pacific/Auckland').format('HH:mm:ss');

	let infoActive = false;

	const mapValue = (value: number, max: number, factor: number) => (value / max) * factor;

	// Function to update timeOfDay based on current time
	const updateTimeOfDay = () => {
		timeString = moment().tz('Pacific/Auckland').format('HH:mm:ss');

		if (manualOverride) {
			return;
		}

		timeOfDay = getTimeOfDay();
		activePhase = phases[timeOfDay];
	};

	const handleSelectChange = () => {
		manualOverride = true;
	};
	$: cloudOpacity = mapValue(cloud, MAX_VALUES.CLOUD_COVERAGE, 1);
	$: waveHeightTransform = mapValue(wave, MAX_VALUES.WAVE_HEIGHT, 100) * 0.1;

	$: windSpeedTransform = 0;
	$: windDirectionTransform = 0;

	let birds: HTMLElement | null = null;
	let time = 0;
	let prevX = 0;
	let prevY = 0;

	const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

	// Reactive statements to update windSpeedTransform and windDirectionTransform when state changes
	$: {
		windSpeedTransform = mapValue(wind, MAX_VALUES.WIND_SPEED, 100) * 0.001;
		windDirectionTransform = direction;
	}

	onMount(() => {
		const animate = () => {
			if (!birds) return;

			let scale = 100 * windSpeedTransform * 50;
			let speed = windSpeedTransform;
			let lerpFactor = windSpeedTransform;

			time += speed;
			let x = (scale * Math.cos(time)) / (1 + Math.pow(Math.sin(time), 2));
			let y = (scale * Math.cos(time) * Math.sin(time)) / (1 + Math.pow(Math.sin(time), 2));

			let lerpX = lerp(prevX, x, lerpFactor);
			let lerpY = lerp(prevY, y, lerpFactor);

			birds.style.transform = `translate(calc(-50% + ${lerpX}px), calc(-50% + ${lerpY}px))`;

			prevX = lerpX;
			prevY = lerpY;

			requestAnimationFrame(animate);
		};
		animate();

		updateTimeOfDay();

		const intervalId = setInterval(updateTimeOfDay, 1000);

		return () => clearInterval(intervalId);
	});

	// Reactive statement to update position when state changes
	$: if (birds) {
		let angle = (windDirectionTransform * Math.PI) / 180;
		let originX = `${50 + 50 * Math.sin(angle)}%`;
		let originY = `${50 - 50 * Math.cos(angle)}%`;

		birds.style.left = originX;
		birds.style.top = originY;
	}
</script>

<!-- <YouTubePlayer /> -->
<MuxVideo
	playbackId="TLBmOhOFtebAXIgu00Z3vjzeMp77oQ0102kNks52QgEu78"
	metaData={{ videoTitle: 'Lyttelton Weather' }}
/>

<div class="absolute w-screen h-screen overflow-hidden pointer-events-none aspect-video">
	<img
		src={activePhase?.bg}
		alt="Lyttelton Background"
		class="absolute top-0 left-0 object-cover w-full h-full"
	/>/
	<div style="--wave-height: {waveHeightTransform}%;" class="absolute top-0 left-0 w-full h-full">
		<img
			src={activePhase?.waves}
			alt="Lyttelton Waves"
			class="absolute object-cover w-full h-full"
		/>
		<img
			src={activePhase?.waves}
			alt="Lyttelton Waves"
			class="absolute object-cover w-full h-full wave"
		/>
	</div>
	<img
		src={activePhase?.cloud}
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

<section
	class="relative z-10 w-[343px] text-white bg-black top-4 left-4 hover:opacity-100 transition-opacity"
	class:opacity-50={!infoActive}
>
	<button
		class="flex items-center justify-between w-full px-3 py-1"
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
			<div class="flex flex-col gap-2 p-3">
				<div>
					<h3 class="mb-2">Cloud Coverage: {cloud}%</h3>
					<input
						class="w-full"
						type="range"
						min="0"
						max={MAX_VALUES.CLOUD_COVERAGE}
						step="1"
						bind:value={cloud}
					/>
				</div>

				<div>
					<h3 class="mb-2">
						Wave Height: {wave} Metres
					</h3>
					<input class="w-full" type="range" min="0" max="15" step="0.1" bind:value={wave} />
				</div>

				<div>
					<h3 class="mb-2">
						Wind Speed: {wind} km/h
					</h3>
					<input
						class="w-full"
						type="range"
						min="0"
						max={MAX_VALUES.WIND_SPEED}
						step="0.1"
						bind:value={wind}
					/>
				</div>

				<div>
					<h3 class="mb-2">
						Wind Direction: {direction}°
					</h3>
					<input class="w-full" type="range" min="0" max="360" step="1" bind:value={direction} />
				</div>

				<div>
					<h3 class="mb-2">Time Of Day</h3>
					<p class="mb-2">{timeString} Pacific/Auckland</p>
					<select
						bind:value={timeOfDay}
						on:change={handleSelectChange}
						class="w-full px-2 py-1 capitalize bg-transparent border border-white"
					>
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
