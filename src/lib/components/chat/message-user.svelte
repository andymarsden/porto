<script>
	let { message, formatTimestamp } = $props();
</script>

<article class="flex justify-end">
	<div class="bg-muted/70 text-foreground max-w-[85%] rounded-3xl border px-4 py-3 text-sm shadow-xs">
		<p class="whitespace-pre-wrap wrap-break-word">{message.content}</p>
		<p class="text-muted-foreground mt-2 text-[11px]">Andy • {formatTimestamp(message.createdAt)}</p>
	</div>
</article>
