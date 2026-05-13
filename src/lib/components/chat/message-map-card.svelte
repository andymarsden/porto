<script>
	import { renderAssistantMarkdown } from "$lib/utils/markdown.js";

	let { message } = $props();

	const card = $derived(message.card ?? {});
	const postcode = $derived(card.postcode ?? "unknown");
	const ward = $derived(card.ward ?? "unknown");
	const latitude = $derived(Number(card.latitude));
	const longitude = $derived(Number(card.longitude));
	const hasCoordinates = $derived(Number.isFinite(latitude) && Number.isFinite(longitude));

	const mapUrl = $derived(
		hasCoordinates
			? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
					`${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}`,
				)}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`
			: null,
	);
	const renderedContent = $derived(renderAssistantMarkdown(message.content));
</script>

<article class="text-foreground text-[15px] leading-7">
	<p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Assistant</p>
	<div class="assistant-markdown wrap-break-word mb-4" data-testid="assistant-markdown">
		{@html renderedContent}
	</div>

	<p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Ward Map</p>
	<div class="border-border bg-muted/40 rounded-xl border p-4">
		<p class="mb-3 text-sm">
			Postcode <strong>{postcode}</strong> is in ward <strong>{ward}</strong>.
		</p>

		{#if mapUrl}
			<iframe
				title="Map of {ward} ward"
				src={mapUrl}
				class="h-[300px] w-full rounded-lg border-0"
				loading="lazy"
				allowfullscreen=""
			></iframe>
			<p class="mt-2 text-xs text-muted-foreground">
				Coordinates: {latitude}, {longitude}
			</p>
		{:else}
			<div class="rounded-lg border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
				Coordinates unavailable for this location.
			</div>
		{/if}
		</div>
	</article>

<style>
	:global(.assistant-markdown h1),
	:global(.assistant-markdown h2),
	:global(.assistant-markdown h3),
	:global(.assistant-markdown h4),
	:global(.assistant-markdown h5),
	:global(.assistant-markdown h6) {
		margin: 0.75rem 0 0.5rem;
		font-weight: 650;
		line-height: 1.25;
	}

	:global(.assistant-markdown h1) {
		font-size: 1.5rem;
	}

	:global(.assistant-markdown h2) {
		font-size: 1.3rem;
	}

	:global(.assistant-markdown h3) {
		font-size: 1.15rem;
	}

	:global(.assistant-markdown p) {
		margin: 0.5rem 0;
	}

	:global(.assistant-markdown ul),
	:global(.assistant-markdown ol) {
		margin: 0.5rem 0;
		padding-left: 1.25rem;
	}

	:global(.assistant-markdown ul) {
		list-style: disc;
	}

	:global(.assistant-markdown ol) {
		list-style: decimal;
	}

	:global(.assistant-markdown code) {
		background: color-mix(in oklab, currentColor 10%, transparent);
		border-radius: 0.25rem;
		padding: 0.1rem 0.3rem;
	}

	:global(.assistant-markdown pre) {
		overflow-x: auto;
		padding: 0.75rem;
		border-radius: 0.5rem;
		background: color-mix(in oklab, currentColor 8%, transparent);
	}

	:global(.assistant-markdown a) {
		text-decoration: underline;
	}

	:global(.assistant-markdown hr) {
		margin: 0.9rem 0;
		border: 0;
		border-top: 1px solid color-mix(in oklab, currentColor 28%, transparent);
	}

	:global(.assistant-markdown em),
	:global(.assistant-markdown i) {
		font-style: italic;
	}
</style>
