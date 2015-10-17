export const logErrors = (successFn) => (err, ...args) => {
	if(err) {
		console.error(err);
	} else {
		successFn.apply(undefined, args);
	}
}