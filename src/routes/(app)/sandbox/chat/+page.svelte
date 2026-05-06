<script>
	import { onMount, tick } from "svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import {
		MAX_TEXTAREA_HEIGHT,
		addUserAndThinkingMessages,
		formatTimestamp,
		replaceMessageContent,
		requestAssistantResponse,
	} from "$lib/services/chat.js";
	import { getCommandSuggestions } from "$lib/services/commands.js";
	import AppHeader from "$lib/components/app-header.svelte";
    
	let messages = $state([]); // Stores the full chat history shown in the message list.
	let draft = $state(""); // Holds the current textarea text before sending.
	let isLoading = $state(false); // Tracks whether the assistant mock response is in progress.
	let commandSuggestions = $state([]);

	let messageListRef = $state(null); // Reference to the scrollable message container element.
	let messageEndRef = $state(null); // Reference to an anchor element at the end of the message list.
	let textareaRef = $state(null); // Reference to the composer textarea for focus management.

	// Grows the textarea with content until a max height, then allows internal scrolling.
	function autoResizeTextarea() {
		if (!textareaRef) return;

		textareaRef.style.height = "auto";
		const nextHeight = Math.min(textareaRef.scrollHeight, MAX_TEXTAREA_HEIGHT);
		textareaRef.style.height = `${nextHeight}px`;
		textareaRef.style.overflowY = textareaRef.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
	}

	// Scrolls the conversation container to the most recent message.
	async function scrollToBottom() {
		await tick();
		if (messageListRef) {
			messageListRef.scrollTop = messageListRef.scrollHeight;
		}

		if (messageEndRef) {
			messageEndRef.scrollIntoView({ block: "end" });
		}

		await new Promise((resolve) => requestAnimationFrame(resolve));

		if (messageListRef) {
			messageListRef.scrollTop = messageListRef.scrollHeight;
		}
	}

	// Handles the full send lifecycle: user message, thinking state, and assistant response.
	async function sendMessage() {
		if (isLoading) return;

		const content = draft.trim(); // Snapshot of the message text for this send action.
		if (!content) return;

		const { nextMessages, thinkingMessage } = addUserAndThinkingMessages(messages, content);
		messages = nextMessages;
		draft = "";
		isLoading = true;

		await scrollToBottom();

		try {
			// Future API integration point:
			// 1) Send `content` to your API/OpenAI endpoint.
			// 2) Read the assistant text from the API response.
			// 3) Replace `assistantContent` with that real response text.
			const assistantContent = await requestAssistantResponse(content);
			messages = replaceMessageContent(messages, thinkingMessage.id, assistantContent);
		} catch {
			messages = replaceMessageContent(
				messages,
				thinkingMessage.id,
				"Sorry, something went wrong while generating the response.",
			);
		} finally {
			isLoading = false;
			await scrollToBottom();
			textareaRef?.focus();
		}
	}

	// Sends on Enter while allowing Shift+Enter to create a new line.
	function handleComposerKeydown(event) {
		if (event.key === "Escape") {
			commandSuggestions = [];
			return;
		}

		if (event.key !== "Enter") return;
		if (event.shiftKey) return;

		event.preventDefault();
		void sendMessage();
	}

	// Intercepts form submit and forwards to the shared send flow.
	function handleSubmit(event) {
		event.preventDefault();
		void sendMessage();
	}

	function applyCommandSuggestion(command) {
		draft = `${command.slash} `;
		commandSuggestions = [];
		textareaRef?.focus();
	}

	$effect(() => {
		draft;
		autoResizeTextarea();
		commandSuggestions = getCommandSuggestions(draft);
	});

	$effect(() => {
		messages;
		void scrollToBottom();
	});

	// Ensures the initial render starts at the latest message position.
	onMount(async () => {
		autoResizeTextarea();
		await scrollToBottom();
	});
</script>
<AppHeader
    crumbs={[
        { label: "Admin", href: "/app" },
        { label: "Sandbox", href: "/app/sandbox" }
    ]}
    currentPage="Chat"
/>
<main class="bg-background flex h-dvh min-h-0 flex-1 flex-col" aria-label="Chat page">
	<section class="relative flex min-h-0 flex-1 flex-col" aria-label="Conversation">
		<div bind:this={messageListRef} class="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
			<div class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 pb-28 md:px-6 md:pb-36">
				{#if messages.length === 0}
					<p class="text-muted-foreground text-sm">
						Start the conversation by typing a message below.
					</p>
				{/if}

				{#each messages as message (message.id)}
					{#if message.role === "user"}
						<article class="flex justify-end">
							<div class="bg-muted/70 text-foreground max-w-[85%] rounded-3xl border px-4 py-3 text-sm shadow-xs">
								<p class="whitespace-pre-wrap wrap-break-word">{message.content}</p>
								<p class="text-muted-foreground mt-2 text-[11px]">You • {formatTimestamp(message.createdAt)}</p>
							</div>
						</article>
					{:else}
						<article class="text-foreground text-[15px] leading-7">
							<p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Assistant</p>
							<p class="whitespace-pre-wrap wrap-break-word">{message.content}</p>
						</article>
					{/if}
				{/each}
				<div bind:this={messageEndRef} aria-hidden="true"></div>
			</div>
		</div>

		<div class="from-background via-background/95 to-background sticky bottom-0 border-t bg-linear-to-t px-3 pb-3 pt-4 md:px-6 md:pb-6">
			<form class="relative mx-auto w-full max-w-3xl" onsubmit={handleSubmit}>
				<label class="sr-only" for="chat-input">Message</label>
				{#if commandSuggestions.length > 0}
					<div class="bg-popover absolute inset-x-0 bottom-full z-10 mb-2 overflow-hidden rounded-xl border shadow-sm">
						<ul aria-label="Command suggestions" class="max-h-52 overflow-y-auto p-1">
							{#each commandSuggestions as command (command.name)}
								<li>
									<button
										type="button"
										class="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
										onclick={() => applyCommandSuggestion(command)}
									>
										<span class="font-medium">{command.slash}</span>
										<span class="text-muted-foreground text-xs">{command.description}</span>
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
				<div class="bg-card ring-ring/30 focus-within:ring-ring rounded-3xl border p-2 shadow-sm transition-shadow focus-within:ring-2">
					<div class="flex items-end gap-2">
						<Textarea
							id="chat-input"
							bind:ref={textareaRef}
							bind:value={draft}
							onkeydown={handleComposerKeydown}
							rows="1"
							class="h-9 max-h-56 min-h-0 flex-1 resize-none border-0 bg-transparent px-3 py-1.5 shadow-none focus-visible:ring-0"
							placeholder="Message assistant..."
							disabled={isLoading}
							aria-describedby="composer-hint"
						/>
						<Button
							type="submit"
							size="icon-sm"
							class="rounded-full"
							disabled={isLoading || !draft.trim()}
							aria-busy={isLoading}
						>
							{isLoading ? "..." : "↑"}
						</Button>
					</div>
				</div>
				<p id="composer-hint" class="text-muted-foreground mt-2 px-2 text-xs">
					Enter sends. Shift + Enter adds a new line.
				</p>
			</form>
		</div>
	</section>
</main>
