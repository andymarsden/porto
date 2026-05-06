<script>
	import { onMount, tick } from "svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";

	let messages = $state([]); // Stores the full chat history shown in the message list.
	let draft = $state(""); // Holds the current textarea text before sending.
	let isLoading = $state(false); // Tracks whether the assistant mock response is in progress.
	const MAX_TEXTAREA_HEIGHT = 220; // Caps textarea growth before enabling internal scrolling.

	let messageListRef = $state(null); // Reference to the scrollable message container element.
	let messageEndRef = $state(null); // Reference to an anchor element at the end of the message list.
	let textareaRef = $state(null); // Reference to the composer textarea for focus management.

	// Creates a unique id for each chat message.
	function generateId() {
		if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
			return crypto.randomUUID();
		}

		return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
	}

	// Builds a standardized message object used by the chat UI.
	function createMessage(role, content) {
		return {
			id: generateId(),
			role,
			content,
			createdAt: new Date().toISOString(),
		};
	}

	// Formats ISO timestamps into short readable times for message metadata.
	function formatTimestamp(createdAt) {
		return new Date(createdAt).toLocaleTimeString([], {
			hour: "numeric",
			minute: "2-digit",
		});
	}

	// Returns a temporary assistant reply used before API integration.
	function buildMockResponse(userText) {
		return `Mock assistant response: I received your message, "${userText}". Replace this with a real API call when backend integration is ready.`;
	}

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

		const userMessage = createMessage("user", content); // Outgoing user message object.
		const thinkingMessage = createMessage("assistant", "Thinking..."); // Placeholder assistant message while waiting.

		messages = [...messages, userMessage, thinkingMessage];
		draft = "";
		isLoading = true;

		await scrollToBottom();

		try {
			// Future API integration point:
			// 1) Send `content` to your API/OpenAI endpoint.
			// 2) Read the assistant text from the API response.
			// 3) Replace `assistantContent` with that real response text.
			await new Promise((resolve) => setTimeout(resolve, 900));
			const assistantContent = buildMockResponse(content); // Mocked assistant text returned after the delay.

			messages = messages.map((message) => {
				if (message.id !== thinkingMessage.id) return message;

				return {
					...message,
					content: assistantContent,
					createdAt: new Date().toISOString(),
				};
			});
		} catch {
			messages = messages.map((message) => {
				if (message.id !== thinkingMessage.id) return message;

				return {
					...message,
					content: "Sorry, something went wrong while generating the response.",
					createdAt: new Date().toISOString(),
				};
			});
		} finally {
			isLoading = false;
			await scrollToBottom();
			textareaRef?.focus();
		}
	}

	// Sends on Enter while allowing Shift+Enter to create a new line.
	function handleComposerKeydown(event) {
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

	$effect(() => {
		draft;
		autoResizeTextarea();
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
			<form class="mx-auto w-full max-w-3xl" onsubmit={handleSubmit}>
				<label class="sr-only" for="chat-input">Message</label>
				<div class="bg-card ring-ring/30 focus-within:ring-ring rounded-3xl border p-2 shadow-sm transition-shadow focus-within:ring-2">
					<div class="flex items-end gap-2">
						<Textarea
							id="chat-input"
							bind:ref={textareaRef}
							bind:value={draft}
							onkeydown={handleComposerKeydown}
							rows="1"
							class="max-h-56 min-h-11 flex-1 resize-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0"
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
