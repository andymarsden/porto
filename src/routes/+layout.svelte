<svelte:options runes={true} />

<script>
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>STAT</title>
</svelte:head>

{@render children?.()}


