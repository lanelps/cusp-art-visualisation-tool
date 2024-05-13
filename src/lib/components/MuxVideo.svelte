<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import '@mux/mux-player';
	import type MuxPlayerElement from '@mux/mux-player';

	interface MetaData {
		videoTitle?: string;
		viewerUserId?: string;
	}

	export let playbackId: string;
	export let metaData: MetaData | undefined;
	export let controls = false;
	export let muted = true;
	export let autoplay = true;
	export let loop = false;

	let player: MuxPlayerElement | undefined;
	const dispatch = createEventDispatcher();

	export const play = () => {
		player.media.nativeEl.play();
	};

	export const pause = () => {
		player?.media?.nativeEl.pause();
	};

	export const reset = () => {
		player.media.nativeEl.currentTime = 0;
	};

	export const toggleMute = () => {
		player.media.nativeEl.muted = !player?.media?.nativeEl.muted;
	};

	const handleVideoEnded = () => {
		dispatch('ended');
	};

	onMount(() => {
		player?.media?.nativeEl.addEventListener('ended', handleVideoEnded);
	});
</script>

<mux-player
	bind:this={player}
	class="object-contain w-full h-full"
	playback-id={playbackId}
	metadata-video-title={metaData?.videoTitle}
	metadata-viewer-user-id={metaData?.viewerUserId}
	{controls}
	{muted}
	{autoplay}
	{loop}
/>

<style>
	mux-player {
		/* --media-object-fit: cover; */
		--controls: none;
	}
</style>
