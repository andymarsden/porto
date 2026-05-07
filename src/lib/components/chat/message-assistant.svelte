<script>
	let { message } = $props();
</script>

<article class="text-foreground text-[15px] leading-7">
	<p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Assistant</p>
	<p class="whitespace-pre-wrap wrap-break-word">{message.content}</p>
</article>
