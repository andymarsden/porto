<script>
    import { onMount, tick } from "svelte";
    import AppHeader from "$lib/components/app-header.svelte";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import { MessageAssistant,  MessageUser, } from "$lib/components/chat/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    // import { MAX_TEXTAREA_HEIGHT, createMessage, formatTimestamp } from "$lib/services/chat.js";
    import { MAX_TEXTAREA_HEIGHT,  formatTimestamp,} from "$lib/services/chat.js";

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
    //#region Word chunking logic
    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function chunkWords(fullText, minWords = 2, maxWords = 5) {
        const words = fullText.split(" ").filter(Boolean);
        const chunks = [];
        let index = 0;

        while (index < words.length) {
            const size =
                minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
            chunks.push(words.slice(index, index + size).join(" "));
            index += size;
        }

        return chunks;
    }

    async function revealAssistantContent(messageId, fullText) {
        if (!fullText.trim()) {
            messages = _replaceMessageContent(messageId, fullText);
            return;
        }

        const chunks = chunkWords(fullText);
        let displayed = "";

        for (const chunk of chunks) {
            displayed = displayed ? `${displayed} ${chunk}` : chunk;
            messages = _replaceMessageContent(messageId, displayed);
            // Slightly randomized delay keeps the typing cadence from feeling too mechanical.
            await wait(30 + Math.random() * 40);
        }
    }
    //#endregion
    

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
    
    //#region Mock response
    // Returns a mock assistant payload for a given user message.
    // Future: replace this with a real API call. The shape { text, options } is the
    // contract — real responses can include or exclude `options` as needed.
    function _mockResponse(userText) {
        return {
            text: `Mock response to: "${userText}"`,
            // Remove or conditionally set `options` to control when buttons appear.
            options: [
                { id: "opt-1", label: "Tell me more", value: "Tell me more" },
                { id: "opt-2", label: "Show examples", value: "Show examples" },
                { id: "opt-3", label: "Clarify", value: "Clarify" },
            ],
        };
    }
    //#endregion

    //#region Send message logic
    // Shared pipeline used by both typed sends and option-button clicks.
    async function _sendUserMessage(content) {
        if (isLoading) return;
        isLoading = true;

        const thinkingMessage = _createMessage("assistant", "Thinking...");
        messages = [...messages, _createMessage("user", content), thinkingMessage];

        await scrollToBottom();
        await new Promise((resolve) => setTimeout(resolve, 900));

        // Future API integration point:
        // 1) Send `content` to your backend or model API.
        // 2) Await the assistant payload ({ text, options }).
        // 3) Replace the thinking message and attach options if present.
        const response = _mockResponse(content);
        await revealAssistantContent(thinkingMessage.id, response.text);

        // Attach options to the revealed assistant message, if the response includes any.
        if (response.options?.length) {
            messages = messages.map((m) =>
                m.id === thinkingMessage.id ? { ...m, options: response.options } : m
            );
        }

        isLoading = false;
        await scrollToBottom();
        textareaRef?.focus();
    }

    async function sendMessage() {
        const content = draft.trim();
        if (!content) return;
        draft = "";
        await _sendUserMessage(content);
    }

    // Called when the user clicks an in-chat option button.
    function handleOptionSelect(value) {
        void _sendUserMessage(value);
    }
    //#endregion

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
        <Badge

        // messages-square
            variant="outline"
            class="pointer-events-none absolute right-4 top-4 z-20 bg-blue-500 text-white dark:bg-blue-600 normal-case text-[12px] tracking-normal"
        >
            chat mode
        </Badge>



        <div bind:this={messageListRef} class="min-h-0 flex-1 overflow-y-auto" aria-live="polite" >
            <div class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 pb-28 md:px-6 md:pb-36" >
                {#each messages as message (message.id)}
                    {#if message.role === "user"}
                        <MessageUser {message} {formatTimestamp} />
                    {:else}
                        <MessageAssistant {message} onOptionSelect={handleOptionSelect} />
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
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                {#snippet child({ props })}
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        class="rounded-full"
                                        {...props}
                                    >
                                        <ChevronsUpDownIcon class="size-4" />
                                        <span class="sr-only">Open composer menu</span>
                                    </Button>
                                {/snippet}
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content
                                side="top"
                                align="end"
                                sideOffset={8}
                                class="w-40 rounded-lg"
                            >
                                <!-- Future: convert these placeholders into mode names and set a chatMode state in onSelect. -->
                                <!-- Future: bind the top-right badge label to chatMode so selecting an item updates it. -->
                                <DropdownMenu.Item>Option 1</DropdownMenu.Item>
                                <DropdownMenu.Item>Option 2</DropdownMenu.Item>
                                <DropdownMenu.Item>Option 3</DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
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
