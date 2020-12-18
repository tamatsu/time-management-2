import App from './App.svelte';

declare var uuidv4
declare var luxon

const app = new App({
	target: document.body,
	props: {
		uuidv4,
		luxon
	}
});

export default app;