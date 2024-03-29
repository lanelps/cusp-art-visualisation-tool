<script>
	import { onMount } from 'svelte';
	import { loadYouTubeAPI } from '$lib/loadYouTubeAPI';

	let players = [];
	let currentPlayerIndex = 0;
	let isApiLoaded = false;
	const videoIDs = ['QjisC1Aj-rA', '2avT63Pjljg']; // Replace with actual YouTube video IDs
	let timer = 20;

	const switchVideo = () => {
		let nextPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;

		if (isApiLoaded && typeof YT !== 'undefined' && players[nextPlayerIndex]) {
			players[nextPlayerIndex].playVideo();
		}

		setTimeout(() => {
			timer = 20;
			if (isApiLoaded && typeof YT !== 'undefined') {
				currentPlayerIndex = nextPlayerIndex;
				let oldPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;

				setTimeout(() => {
					if (players[oldPlayerIndex]) {
						players[oldPlayerIndex].pauseVideo();
					}
				}, 5000); // Wait another 5 seconds before pausing the old video
			}

			setTimeout(switchVideo, 15000); // Switch video every 15 seconds
		}, 5000); // Wait 5 seconds before fading in the new video
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
							controls: 0,
							loop: 1,
							disablekb: 1,
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

		setInterval(() => {
			timer--;
		}, 1000); // Update timer every second

		setTimeout(switchVideo, 15000); // Switch video every 15 seconds
	});
</script>

<div class="absolute w-screen h-screen pointer-events-none">
	{#each videoIDs as _, index (index)}
		<div
			class="absolute w-full h-full -translate-x-1/2 -translate-y-1/2 opacity-0 top-1/2 left-1/2 transition-opacity duration-[5s]"
			class:opacity-100={currentPlayerIndex === index}
		>
			<div id={`player${index}`}></div>
		</div>
	{/each}
	<div class="absolute p-2 font-bold text-black bg-yellow-300 top-2 right-2">{timer}</div>
</div>
