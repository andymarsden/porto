<script>
	import { Button } from "$lib/components/ui/button/index.js";
	import { renderAssistantMarkdown } from "$lib/utils/markdown.js";

	// onOptionSelect is called with option.value when a choice button is clicked.
	let { message, onOptionSelect } = $props();
	const renderedContent = $derived(renderAssistantMarkdown(message.content));
</script>

<article class="text-foreground text-[15px] leading-7">
	<p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Assistant</p>
	<div class="assistant-markdown wrap-break-word" data-testid="assistant-markdown">{@html renderedContent}</div>
	{#if message.options?.length}
		<!-- Option buttons are only rendered when the message includes an options array. -->
		<!-- Future: real API responses can include/exclude options as needed. -->
		<div class="mt-3 flex flex-wrap gap-2">
			{#each message.options as option (option.id)}
				<Button
					variant="outline"
					size="sm"
					class="rounded-md cursor-pointer"
					onclick={() => onOptionSelect?.(option.value)}
				>
					{option.label}
				</Button>
			{/each}
		</div>
	{/if}
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

	:global(.assistant-markdown table) {
		width: 100%;
		border-collapse: collapse;
		margin: 0.75rem 0;
		font-size: 0.875rem;
	}

	:global(.assistant-markdown th),
	:global(.assistant-markdown td) {
		padding: 0.45rem 0.75rem;
		border: 1px solid color-mix(in oklab, currentColor 18%, transparent);
		text-align: left;
	}

	:global(.assistant-markdown th) {
		font-weight: 600;
		background: color-mix(in oklab, currentColor 6%, transparent);
	}

	:global(.assistant-markdown tbody tr:nth-child(even)) {
		background: color-mix(in oklab, currentColor 3%, transparent);
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
