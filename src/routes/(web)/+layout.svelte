

<script>

	let { children } = $props();
</script>

<svelte:head>

</svelte:head>

<div class="min-h-screen flex flex-col">
	{@render children()}
</div>
