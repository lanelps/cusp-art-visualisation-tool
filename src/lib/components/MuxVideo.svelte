<script lang="ts">
	import '@mux/mux-video';

	interface MetaData {
		videoTitle?: string;
		viewerUserId?: string;
	}

	export let playbackId: string;
	export let metaData: MetaData | undefined;
	export let controls = false;
</script>

<div class="absolute w-screen h-screen pointer-events-none">
	<mux-video
		class="w-full h-full"
		playback-id={playbackId}
		metadata-video-title={metaData?.videoTitle}
		metadata-viewer-user-id={metaData?.viewerUserId}
		{controls}
		muted
		autoplay
        loop
	></mux-video>
</div>
