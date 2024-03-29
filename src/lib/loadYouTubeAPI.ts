declare global {
	interface Window {
		onYouTubeIframeAPIReady: () => void;
	}
}

export const loadYouTubeAPI = (): Promise<void> => {
	return new Promise<void>((resolve) => {
		const tag = document.createElement('script');
		tag.src = 'https://www.youtube.com/iframe_api';
		const firstScriptTag = document.getElementsByTagName('script')[0];

		if (firstScriptTag.parentNode) {
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			window.onYouTubeIframeAPIReady = () => resolve();
		}
	});
};
