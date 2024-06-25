<script lang="ts">
	import type { Data, Phases, Phase, TimeOfDay } from '$lib/types';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import moment from 'moment-timezone';
	import { createNoise2D } from 'simplex-noise';

	import { isMobile } from '$lib/stores/device';

	import type MuxPlayerElement from '@mux/mux-player';
	import MuxVideo from '$lib/components/MuxVideo.svelte';

	import { getTimeOfDay, toggleFullScreen } from '$lib/utils/helpers';

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
	import lytLights from '$lib/assets/lyt-lights.gif';

	import cuspLogo from '$lib/assets/cusp-logo-white.png';
	import scenesLogo from '$lib/assets/scenes-by-t-g-shand.png';

	import VolumeOn from '$lib/assets/svg/VolumeOn.svelte';
	import VolumeOff from '$lib/assets/svg/VolumeOff.svelte';

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
		sunrise: {
			bg: lytSunsetBG,
			cloud: lytSunsetCloud,
			waves: lytSunsetWaves
		},
		day: { bg: lytDayBG, cloud: lytDayCloud, waves: lytDayWaves },
		sunset: {
			bg: lytSunsetBG,
			cloud: lytSunsetCloud,
			waves: lytSunsetWaves
		},
		night: { bg: lytNightBG, cloud: lytNightCloud, waves: lytNightWaves }
	};

	let timeOfDay: TimeOfDay = data.timeOfDay || 'day';

	let previousTimeOfDay: TimeOfDay;
	let transitionAssets = false;
	let activePhase = phases[timeOfDay];

	let timeOfDayValues = ['sunrise', 'day', 'sunset', 'night'];
	let nextPhase: Phase;

	$: {
		if (timeOfDay !== undefined) {
			let currentIndex = timeOfDayValues.indexOf(timeOfDay);
			let nextTimeOfDay = timeOfDayValues[currentIndex];
			nextPhase = phases[nextTimeOfDay];
		}
	}

	$: {
		if (timeOfDay && timeOfDay !== previousTimeOfDay) {
			transitionAssets = true;

			setTimeout(() => {
				transitionAssets = false;
				activePhase = phases[timeOfDay];
				previousTimeOfDay = timeOfDay;
			}, 5000);
		}
	}

	let manualOverride = false;
	let timeString = moment().tz('Pacific/Auckland').format('HH:mm:ss');

	let muxVideo: MuxPlayerElement | undefined;
	let showVideo = false;
	let videoMuted = true;

	// Reactive statement to update showVideo when timeOfDay changes
	$: {
		if (!$isMobile) {
			showVideo = timeOfDay === 'sunset';
		}
	}

	$: {
		if (muxVideo && !$isMobile) {
			if (showVideo) {
				muxVideo?.reset();
				muxVideo?.play();
			} else {
				muxVideo?.pause();
			}
		}
	}

	let infoActive = false;

	const mapValue = (value: number, max: number, factor: number) => (value / max) * factor;

	// Function to update timeOfDay based on current time
	const updateTimeOfDay = () => {
		timeString = moment().tz('Pacific/Auckland').format('HH:mm:ss');

		if (manualOverride) return;

		const newTimeOfDay = getTimeOfDay();
		if (newTimeOfDay === timeOfDay) return;

		timeOfDay = newTimeOfDay;
		// nextPhase = phases[timeOfDay];
	};

	const handleSelectChange = () => {
		manualOverride = true;
	};

	$: cloudOpacity = mapValue(cloud, MAX_VALUES.CLOUD_COVERAGE, 1);
	$: waveHeightTransform = mapValue(wave, MAX_VALUES.WAVE_HEIGHT, 100) * 0.1;

	$: windSpeedTransform = 0;
	$: windDirectionTransform = 0;

	let birdContainer: HTMLElement | null = null;
	let birdWrapper: HTMLElement | null = null;
	let birds: HTMLElement | null = null;
	let time = 0;

	// Reactive statements to update windSpeedTransform and windDirectionTransform when state changes
	$: {
		windSpeedTransform = mapValue(wind, MAX_VALUES.WIND_SPEED, 100) * 0.001;
		windDirectionTransform = direction;
	}

	const noise2D = createNoise2D();

	const map = (
		value: number,
		sourceRangeLow: number,
		sourceRangeHigh: number,
		targetRangeLow: number,
		targetRangeHigh: number
	): number => {
		return (
			targetRangeLow +
			((targetRangeHigh - targetRangeLow) * (value - sourceRangeLow)) /
				(sourceRangeHigh - sourceRangeLow)
		);
	};

	const animateBirdWrapper = () => {
		if (!birdWrapper || timeOfDay === 'night') return;

		// Map the wind speed to a new range
		const scaledWindSpeed = map(windSpeedTransform, 0, 0.1, 1, 12.5);

		// Adjust the scale based on the wind speed using a linear function
		const scale = 50 * scaledWindSpeed;

		// Calculate the new x and y positions based on the lemniscate of Bernoulli
		let x = (scale * Math.cos(time)) / (1 + Math.pow(Math.sin(time), 2));
		let y = (scale * Math.sin(time) * Math.cos(time)) / (1 + Math.pow(Math.sin(time), 2));

		birdWrapper.style.transform = `translate(${x}px, ${y}px)`;
	};

	const animateBirds = () => {
		if (!birds || timeOfDay === 'night') return;

		// Increase the scale of the Perlin noise more rapidly at lower wind speeds
		const noiseScale = map(Math.sqrt(windSpeedTransform), 0, Math.sqrt(0.1), 0, 1);

		// Calculate random movement within a range
		const range = 50;
		let randomX = map(noise2D(time * noiseScale, 1), -1, 1, -range, range); // Random value between -range and range
		let randomY = map(noise2D(time * noiseScale, 0), -1, 1, -range, range); // Random value between -range and range

		// Ensure that the birds never go further than 100 pixels on the x or y axis
		const maxDistance = 100;
		randomX = Math.min(Math.max(randomX, -maxDistance), maxDistance);
		randomY = Math.min(Math.max(randomY, -maxDistance), maxDistance);

		birds.style.transform = `translate(${randomX}px, ${randomY}px)`;
	};

	const animate = () => {
		time += 0.01;
		animateBirds();
		animateBirdWrapper();
		requestAnimationFrame(animate);
	};

	onMount(() => {
		animate();

		updateTimeOfDay();

		const intervalId = setInterval(updateTimeOfDay, 1000);

		return () => clearInterval(intervalId);
	});

	$: if (birdContainer && timeOfDay !== 'night') {
		// Calculate the angle based on the wind direction
		let angle = (windDirectionTransform * Math.PI) / 180;

		// Calculate the origin of the birdContainer element as a percentage of the remaining space in the viewport
		let originXPercentage =
			50 + Math.sin(angle) * (50 - (birdContainer.offsetWidth / window.innerWidth) * 50);
		let originYPercentage =
			50 - Math.cos(angle) * (50 - (birdContainer.offsetHeight / window.innerHeight) * 50);

		// Convert percentage to pixels and adjust for the size of the birdContainer element
		let originX = `calc(${originXPercentage}% - ${birdContainer.offsetWidth / 2}px)`;
		let originY = `calc(${originYPercentage}% - ${birdContainer.offsetHeight / 2}px)`;

		// Update the position of the birdContainer element
		birdContainer.style.left = originX;
		birdContainer.style.top = originY;
	}
</script>

<svelte:document on:keydown={toggleFullScreen} />

<div class="absolute w-screen h-screen overflow-hidden aspect-video">
	<div class="absolute top-0 left-0 w-full h-full">
		<img src={activePhase?.bg} alt="Lyttelton Background" class="object-cover w-full h-full" />
		{#if transitionAssets}
			<img
				src={nextPhase?.bg}
				alt="Lyttelton Background"
				class="absolute top-0 left-0 object-cover w-full h-full"
				in:fade={{ duration: 5000 }}
			/>
		{/if}
	</div>

	<div style="--wave-height: {waveHeightTransform}%;" class="absolute top-0 left-0 w-full h-full">
		<img
			src={activePhase?.waves}
			alt="Lyttelton Waves"
			class="absolute object-cover w-full h-full transition-opacity opacity-0"
			class:duration-[5000ms]={transitionAssets}
			class:duration-[0ms]={!transitionAssets}
			class:opacity-100={!transitionAssets}
		/>
		<img
			src={activePhase?.waves}
			alt="Lyttelton Waves"
			class="absolute object-cover w-full h-full transition-opacity opacity-0 wave"
			class:duration-[5000ms]={transitionAssets}
			class:duration-[0ms]={!transitionAssets}
			class:opacity-100={!transitionAssets}
		/>

		{#if transitionAssets}
			<img
				src={nextPhase?.waves}
				alt="Lyttelton Waves"
				class="absolute object-cover w-full h-full"
				in:fade={{ duration: 5000 }}
			/>
			<img
				src={nextPhase?.waves}
				alt="Lyttelton Waves"
				class="absolute object-cover w-full h-full wave"
				in:fade={{ duration: 5000 }}
			/>
		{/if}
	</div>

	<div
		style="--opacity: {cloudOpacity};"
		class="absolute w-full h-full opacity-[var(--opacity)] top-0 left-0"
	>
		<img
			id="activeCloud"
			src={activePhase.cloud}
			alt="Lyttelton Cloud"
			class="object-cover w-full h-full transition-opacity opacity-0"
			class:duration-[5000ms]={transitionAssets}
			class:duration-[0ms]={!transitionAssets}
			class:opacity-100={!transitionAssets}
		/>

		{#if transitionAssets}
			<img
				id="nextCloud"
				src={nextPhase.cloud}
				alt="Lyttelton Cloud"
				class="absolute top-0 left-0 object-cover w-full h-full"
				in:fade={{ duration: 5000 }}
			/>
		{/if}
	</div>

	{#if lytLights && timeOfDay !== 'day'}
		<img
			src={lytLights}
			alt="Lyttelton Lights"
			class="absolute top-0 left-0 object-cover w-full h-full"
			transition:fade={{ duration: 5000 }}
		/>
	{/if}

	{#if lytBoat && timeOfDay === 'day'}
		<img
			src={lytBoat}
			alt="Lyttelton Boat"
			class="absolute top-0 left-0 object-cover w-full h-full"
			transition:fade={{ duration: 5000 }}
		/>
	{/if}

	{#if lytBirds && timeOfDay !== 'night'}
		<div
			bind:this={birdContainer}
			class="absolute w-[25vw] h-auto pointer-events-none origin-center"
			transition:fade={{ duration: 5000 }}
		>
			<div bind:this={birdWrapper}>
				<img
					bind:this={birds}
					src={lytBirds}
					alt="Birds"
					class="object-contain w-full h-full"
					class:brightness-75={timeOfDay === 'sunrise' || timeOfDay === 'sunset'}
				/>
			</div>
		</div>
	{/if}
</div>

{#if !$isMobile}
	<div
		class="absolute w-screen h-screen overflow-hidden transition-opacity duration-1000 opacity-0 pointer-events-none aspect-video"
		class:opacity-100={showVideo}
	>
		<MuxVideo
			bind:this={muxVideo}
			playbackId="pZw8Xu5zHfBWZZ1hPKtNM3Nm7LTDHPETrDT7MKO0001zE"
			metaData={{ videoTitle: 'T.G Shand Scenes Offical Music Video' }}
			on:ended={() => (showVideo = false)}
		/>
		<button
			on:click={() => {
				muxVideo?.toggleMute();
				videoMuted = !videoMuted;
			}}
			class="absolute text-white transition-opacity opacity-0 pointer-events-none top-4 right-4"
			class:!opacity-100={showVideo}
			class:!pointer-events-auto={showVideo}
		>
			{#if videoMuted}
				<VolumeOff />
			{:else}
				<VolumeOn />
			{/if}
		</button>
	</div>
{/if}

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

<a
	href="https://www.cusp-studio.co/scenes-by-t-g-shand"
	target="_blank"
	class="absolute bottom-4 left-4"
>
	<img src={scenesLogo} alt="Scenes by T.G Shand" class="object-contain w-40 h-auto" />
</a>

<a href="https://www.cusp-studio.co/art-studio" target="_blank" class="absolute bottom-4 right-4">
	<img src={cuspLogo} alt="CUSP Logo" class="object-contain w-32 h-auto" />
</a>

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
