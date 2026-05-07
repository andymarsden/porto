<script>
    import { onMount, tick } from "svelte";
    import AppHeader from "$lib/components/app-header.svelte";
    import {
        MessageAssistant,
        MessageUser,
    } from "$lib/components/chat/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    // import { MAX_TEXTAREA_HEIGHT, createMessage, formatTimestamp } from "$lib/services/chat.js";
    import {
        MAX_TEXTAREA_HEIGHT,
        formatTimestamp,
    } from "$lib/services/chat.js";

    let messages = $state([]);
    let draft = $state("");
    let isLoading = $state(false);
    let messageListRef = $state(null);
    let messageEndRef = $state(null);
    let textareaRef = $state(null);

    function generateId() {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function _createMessage(role, content) {
        return {
            id: generateId(),
            role,
            content,
            createdAt: new Date().toISOString(),
        };
    }

// Replaces a message, typically used to swap out a "thinking" placeholder with actual assistant content once it's received.
    function _replaceMessageContent(messageId, content) {
        return messages.map((message) => {
            if (message.id !== messageId) return message;

            return {
                ...message,
                content,
                createdAt: new Date().toISOString(),
            };
        });
    }

    function autoResizeTextarea() {
        if (!textareaRef) return;

        textareaRef.style.height = "auto";
        const nextHeight = Math.min(
            textareaRef.scrollHeight,
            MAX_TEXTAREA_HEIGHT,
        );
        textareaRef.style.height = `${nextHeight}px`;
        textareaRef.style.overflowY =
            textareaRef.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
    }

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

    async function sendMessage() {
        if (isLoading) return;

        const content = draft.trim();
        if (!content) return;

        isLoading = true;
        const thinkingMessage = _createMessage("assistant", "Thinking...");
        messages = [...messages, _createMessage("user", content), thinkingMessage];
        draft = "";

        await scrollToBottom();

        await new Promise((resolve) => setTimeout(resolve, 900));

        // Future API integration point:
        // 1) Send `content` to your backend or model API.
        // 2) Wait for the assistant payload.
        // 3) Replace the thinking message with the returned assistant text.
        messages = _replaceMessageContent(thinkingMessage.id, content);

        isLoading = false;
        await scrollToBottom();
        textareaRef?.focus();
    }

    function handleComposerKeydown(event) {
        if (event.key !== "Enter") return;
        if (event.shiftKey) return;

        event.preventDefault();
        void sendMessage();
    }

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

    onMount(async () => {
        autoResizeTextarea();
        await scrollToBottom();
    });
</script>

<AppHeader
    crumbs={[
        { label: "Admin", href: "/app" },
        { label: "Sandbox", href: "/app/sandbox" },
    ]}
    currentPage="Chat 2"
/>

<main class="bg-background flex h-dvh min-h-0 flex-1 flex-col" aria-label="Chat page">
    <section class="relative flex min-h-0 flex-1 flex-col" aria-label="Conversation">
        <div bind:this={messageListRef} class="min-h-0 flex-1 overflow-y-auto" aria-live="polite" >
            <div class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 pb-28 md:px-6 md:pb-36" >
                {#each messages as message (message.id)}
                    {#if message.role === "user"}
                        <MessageUser {message} {formatTimestamp} />
                    {:else}
                        <MessageAssistant {message} />
                    {/if}
                {/each}
                <div bind:this={messageEndRef} aria-hidden="true"></div>
            </div>
        </div>

        <div class="from-background via-background/95 to-background sticky bottom-0 border-t bg-linear-to-t px-3 pb-3 pt-4 md:px-6 md:pb-6">
            <form
                class="relative mx-auto w-full max-w-3xl" onsubmit={handleSubmit} >
                <label class="sr-only" for="chat2-input">Message</label>
                <div class="bg-card ring-ring/30 focus-within:ring-ring rounded-3xl border p-2 shadow-sm transition-shadow focus-within:ring-2">
                    <div class="flex items-end gap-2">
                        <Textarea
                            id="chat2-input"
                            bind:ref={textareaRef}
                            bind:value={draft}
                            onkeydown={handleComposerKeydown}
                            rows="1"
                            class="h-9 max-h-56 min-h-0 flex-1 resize-none border-0 bg-transparent px-3 py-1.5 shadow-none focus-visible:ring-0"
                            placeholder="Type a message..."
                            aria-describedby="composer-hint"
                        />
                        <Button type="submit" size="icon-sm" class="rounded-full" disabled={isLoading || !draft.trim()} >
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
