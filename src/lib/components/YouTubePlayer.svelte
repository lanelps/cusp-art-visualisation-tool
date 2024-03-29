<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { loadYouTubeAPI } from '$lib/loadYouTubeAPI';

	let players = [];
	let currentPlayerIndex = 0;
	let isApiLoaded = false;
	const videoIDs = ['QjisC1Aj-rA', 'daSt97OCPeg']; // Replace with actual YouTube video IDs

	const switchVideo = () => {
		// const currentHour = new Date().getHours();
		// currentPlayerIndex = currentHour < 12 ? 0 : 1;

		currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
	};

	onMount(async () => {
		await loadYouTubeAPI();
		isApiLoaded = true;

		players = videoIDs.map(
			(id, index) =>
				new YT.Player(`player${index}`, {
					width: '1440',
					height: '900',
					videoId: id,
					events: {
						onReady: (event) => event.target.playVideo()
					}
				})
		);

		setInterval(switchVideo, 5000); // Switch video every hour
	});
</script>

<div class="absolute w-full h-full">
	{#each videoIDs as _, index (index)}
		<div
			class="absolute w-full h-full transition-opacity -translate-x-1/2 -translate-y-1/2 opacity-0 top-1/2 left-1/2"
			class:opacity-100={currentPlayerIndex === index}
		>
			<div id={`player${index}`}></div>
		</div>
	{/each}
</div>
