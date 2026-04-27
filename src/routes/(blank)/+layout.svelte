<svelte:options runes={true} />

<script>
	let { children } = $props();
</script>

{@render children()}
