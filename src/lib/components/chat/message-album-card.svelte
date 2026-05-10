<script>
	// message.card = { type: "album", name: string, artist: string, imageUrl: string|null }
	let { message } = $props();
	const { name, artist, imageUrl } = message.card ?? {};
</script>

<article class="text-foreground text-[15px] leading-7">
	<p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Now Playing</p>
	<div class="border-border bg-muted/40 flex items-center gap-4 rounded-xl border p-4">
		<!-- Album art -->
		{#if imageUrl}
			<img src={imageUrl} alt="{name} album art" class="h-14 w-14 shrink-0 rounded-lg object-cover" />
		{:else}
			<div class="bg-muted text-muted-foreground flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-2xl">♫</div>
		{/if}
		<div class="min-w-0">
			<p class="text-foreground truncate font-semibold">{name ?? "Unknown album"}</p>
			<p class="text-muted-foreground truncate text-sm">{artist ?? "Unknown artist"}</p>
		</div>
	</div>
</article>
