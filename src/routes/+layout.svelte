<script>
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { onMount } from "svelte";
	import { initTheme } from "$lib/services/theme.js";
	let { children } = $props();

	onMount(() => {
		initTheme();
	});
</script>

<svelte:head></svelte:head>

{@render children()}
