<script>
	import { Button } from "$lib/components/ui/button/index.js";

	// onOptionSelect is called with option.value when a choice button is clicked.
	let { message, onOptionSelect } = $props();
</script>

<article class="text-foreground text-[15px] leading-7">
	<p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Assistant</p>
	<p class="whitespace-pre-wrap wrap-break-word">{message.content}</p>
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
