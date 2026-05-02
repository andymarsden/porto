<svelte:options runes={true} />

<script>
	import { onMount, tick } from "svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";

	let messages = $state([]); // Stores the full chat history shown in the message list.
	let draft = $state(""); // Holds the current textarea text before sending.
	let isLoading = $state(false); // Tracks whether the assistant mock response is in progress.

	let messageListRef; // Reference to the scrollable message container element.
	let textareaRef; // Reference to the composer textarea for focus management.

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

	// Scrolls the conversation container to the most recent message.
	async function scrollToBottom() {
		await tick();

		if (!messageListRef) return;

		messageListRef.scrollTop = messageListRef.scrollHeight;
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

	// Ensures the initial render starts at the latest message position.
	onMount(async () => {
		await scrollToBottom();
	});
</script>

<main class="flex h-full min-h-0 flex-1 flex-col p-4" aria-label="Chat page">
	<div class="mx-auto flex h-full w-full max-w-4xl min-h-0 flex-1 flex-col">
		<header class="mb-4">
			<h1 class="text-2xl font-semibold tracking-tight">Sandbox Chat</h1>
			<p class="text-muted-foreground text-sm">MVP chat interface with local state and mock assistant replies.</p>
		</header>

		<section
			class="bg-background flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border"
			aria-label="Conversation"
		>
			<div
				bind:this={messageListRef}
				class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
				aria-live="polite"
			>
				{#if messages.length === 0}
					<p class="text-muted-foreground text-sm">
						Start the conversation by typing a message below.
					</p>
				{/if}

				{#each messages as message (message.id)}
					<article class={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
						<div
							class={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
						>
							<p class="whitespace-pre-wrap wrap-break-word">{message.content}</p>
							<p class="mt-2 text-xs opacity-70">
								{message.role === "user" ? "You" : "Assistant"} • {formatTimestamp(message.createdAt)}
							</p>
						</div>
					</article>
				{/each}
			</div>

			<form class="bg-background shrink-0 border-t p-3" onsubmit={handleSubmit}>
				<label class="sr-only" for="chat-input">Message</label>
				<Textarea
					id="chat-input"
					bind:this={textareaRef}
					bind:value={draft}
					onkeydown={handleComposerKeydown}
					rows="3"
					class="bg-background resize-y"
					placeholder="Type your message..."
					disabled={isLoading}
					aria-describedby="composer-hint"
				/>

				<div class="mt-2 flex items-center justify-between gap-2">
					<p id="composer-hint" class="text-muted-foreground text-xs">Enter sends. Shift + Enter adds a new line.</p>
					<Button type="submit" disabled={isLoading || !draft.trim()} aria-busy={isLoading}>
						{isLoading ? "Waiting..." : "Send"}
					</Button>
				</div>
			</form>
		</section>
	</div>
</main>
