export const visibleState = (visible) => (visible ? 'visible' : 'invisible');
export const classList = (...args) => args.join(' ');
export const rowCl = classList.bind(null, 'row');
export const fullscreen = () => {
	const element = document.documentElement;
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if (element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}