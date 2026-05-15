<script>
	import { Button } from "$lib/components/ui/button/index.js";
	import { renderAssistantMarkdown } from "$lib/utils/markdown.js";

	// onOptionSelect is called with option.value when a choice button is clicked.
	let { message, onOptionSelect, isLastMessageWithOptions = true } = $props();
	const renderedContent = $derived(renderAssistantMarkdown(message.content));
</script>

<article class="text-foreground text-[15px] leading-7">
	<p
		class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide"
	>
		Assistant
	</p>
	<div
		class="assistant-markdown wrap-break-word"
		data-testid="assistant-markdown"
	>
		{@html renderedContent}
	</div>
	{#if message.options?.length}
		<!-- Option buttons are only rendered when the message includes an options array. -->
		<!-- Future: real API responses can include/exclude options as needed. -->
		<div class="mt-3 flex flex-wrap gap-2">
			{#each message.options as option (option.id)}
				{#if option.button_type === "fancy"}
					<button 
						class="glass-border-button" 
						onclick={() => onOptionSelect?.(option.value)}
						disabled={!isLastMessageWithOptions}
						style={!isLastMessageWithOptions ? 'opacity: 0.5; cursor: not-allowed;' : ''}
					> 
						{option.label} 
					</button>
					
				{:else}
					<Button
						variant="outline"
						size="sm"
						class="rounded-md cursor-pointer"
						onclick={() => onOptionSelect?.(option.value)}
						disabled={!isLastMessageWithOptions}
					>
						{option.label}
					</Button>
				{/if}
			{/each}
		</div>
	{/if}
</article>

<style>
	
    :global(:root) {
        --glass-bg: rgba(255, 255, 255, 0.7);
        --glass-hover: rgba(255, 255, 255, 0.9);
		--glass-surface: #ffffff;
		--glass-surface-hover: #f7f7fb;
        --glass-text: #111;
    }

    :global(.dark) {
        --glass-bg: rgba(255, 255, 255, 0.08);
        --glass-hover: rgba(255, 255, 255, 0.12);
		--glass-surface: #13151b;
		--glass-surface-hover: #1b1f29;
        --glass-text: white;
    }

    .glass-border-button {
        height: 1.9rem;
        position: relative;
        padding-left: 0.625rem;
        padding-right: 0.625rem;
		border: 2px solid transparent;
        border-radius: 8px;

        color: var(--glass-text);
		background:
			linear-gradient(var(--glass-surface), var(--glass-surface)) padding-box,
			linear-gradient(
				122deg,
				#ff00aa,
				#ff5e5e,
				#ffdd00,
				#ff66cc,
				#ffee55,
				#ff00aa
			) border-box;
		background-size:
			100% 100%,
			400% 400%;
		background-position:
			0 0,
			0% 50%;

        font-weight: 600;
        font-size: 14px;

        cursor: pointer;
        overflow: hidden;

        backdrop-filter: blur(14px);
		animation: borderMove 16s ease-in-out infinite;

        transition:
            transform 0.2s ease,
            background 0.2s ease;
    }

    .glass-border-button:hover {
        /* transform: translateY(-1px); */
		background:
			linear-gradient(var(--glass-surface-hover), var(--glass-surface-hover)) padding-box,
			linear-gradient(
				122deg,
				#ff00aa,
				#ff5e5e,
				#ffdd00,
				#ff66cc,
				#ffee55,
				#ff00aa
			) border-box;
		background-size:
			100% 100%,
			400% 400%;
    }

    @keyframes borderMove {
        0% {
			background-position:
				0 0,
				0% 50%;
        }

        20% {
			background-position:
				0 0,
				100% 20%;
        }

        40% {
			background-position:
				0 0,
				80% 100%;
        }

        60% {
			background-position:
				0 0,
				20% 80%;
        }

        80% {
			background-position:
				0 0,
				120% 40%;
        }

        100% {
			background-position:
				0 0,
				0% 50%;
        }
    }
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
