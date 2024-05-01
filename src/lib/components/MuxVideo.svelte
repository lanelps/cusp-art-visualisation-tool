<script lang="ts">
	import '@mux/mux-player';

	interface MetaData {
		videoTitle?: string;
		viewerUserId?: string;
	}

	export let playbackId: string;
	export let metaData: MetaData | undefined;
	export let controls = false;
</script>

<div class="absolute w-screen h-screen overflow-hidden pointer-events-none aspect-video z-[100]">
	<mux-player
		class="object-contain w-full h-full"
		playback-id={playbackId}
		metadata-video-title={metaData?.videoTitle}
		metadata-viewer-user-id={metaData?.viewerUserId}
		{controls}
		muted
		autoplay
		loop
	/>
</div>
