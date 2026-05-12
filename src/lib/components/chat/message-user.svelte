<script>
	let { message, formatTimestamp } = $props();
</script>

<article class="flex justify-end">
	<div class="bg-muted/70 text-foreground max-w-[85%] rounded-3xl border px-4 py-3 text-sm shadow-xs">
		<p class="whitespace-pre-wrap wrap-break-word">{message.content}</p>
		<div class="mt-2 flex items-center justify-end gap-1.5">
			{#if message.isValidated === true}
				<span
					class="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white"
					aria-label="Validated"
					title="Validated"
				>
					<svg
						viewBox="0 0 16 16"
						fill="none"
						class="h-2.5 w-2.5"
						aria-hidden="true"
					>
						<path
							d="M3.5 8.5L6.5 11.5L12.5 5.5"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</span>
			{:else if message.isValidated === false}
				<span
					class="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-white"
					aria-label="Not validated"
					title="Not validated"
				>
					<svg
						viewBox="0 0 16 16"
						fill="none"
						class="h-2.5 w-2.5"
						aria-hidden="true"
					>
						<path
							d="M5 5L11 11M11 5L5 11"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</span>
			{/if}
			<!-- <p class="text-muted-foreground text-[11px]">Andy • {formatTimestamp(message.createdAt)}  •  <a href="#"><u>edit</u></a></p> -->
			<p class="text-muted-foreground text-[11px]">Andy • {formatTimestamp(message.createdAt)}</p>
		</div>
	</div>
</article>
