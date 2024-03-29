<script>
	import { onMount } from 'svelte';
	import { loadYouTubeAPI } from '$lib/loadYouTubeAPI';

	let players = [];
	let currentPlayerIndex = 0;
	let isApiLoaded = false;
	const videoIDs = ['QjisC1Aj-rA', '2avT63Pjljg']; // Replace with actual YouTube video IDs

	const switchVideo = () => {
		if (isApiLoaded && typeof YT !== 'undefined' && players[currentPlayerIndex]) {
			players[currentPlayerIndex].pauseVideo();
		}

		currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;

		if (isApiLoaded && typeof YT !== 'undefined' && players[currentPlayerIndex]) {
			players[currentPlayerIndex].playVideo();
		}
	};

	onMount(async () => {
		await loadYouTubeAPI();
		isApiLoaded = true;

		const playerPromises = videoIDs.map(
			(id, index) =>
				new Promise((resolve) => {
					const player = new YT.Player(`player${index}`, {
						width: window.innerWidth,
						height: window.innerHeight,
						videoId: id,
						playerVars: {
							autoplay: 1,
							mute: 1,
							controls: 0
						},
						events: {
							onReady: (event) => {
								if (index === currentPlayerIndex) {
									event.target.playVideo();
								}
								resolve(player);
							}
						}
					});
				})
		);

		players = await Promise.all(playerPromises);

		// Play the first video after all players are ready
		if (players[0]) {
			players[0].playVideo();
		}

		setInterval(switchVideo, 10000); // Switch video every 10 seconds
	});
</script>

<div class="absolute w-screen h-screen pointer-events-none">
	{#each videoIDs as _, index (index)}
		<div
			class="absolute w-full h-full transition-opacity -translate-x-1/2 -translate-y-1/2 opacity-0 top-1/2 left-1/2"
			class:opacity-100={currentPlayerIndex === index}
		>
			<div id={`player${index}`}></div>
		</div>
	{/each}
</div>
