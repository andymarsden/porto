<script>
    import { onMount, tick } from "svelte";
    import AppHeader from "$lib/components/app-header.svelte";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import {
        MessageAssistant,
        MessageUser,
    } from "$lib/components/chat/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    // import { MAX_TEXTAREA_HEIGHT, createMessage, formatTimestamp } from "$lib/services/chat.js";
    import {
        MAX_TEXTAREA_HEIGHT,
        formatTimestamp,
    } from "$lib/services/chat.js";
    import {
        createMessage,
        replaceMessageContent,
        sendUserMessage,
    } from "$lib/services/v2/chat_engine.js";
    let messages = $state([]);
    let draft = $state("");
    let isLoading = $state(false);
    let messageListRef = $state(null);
    let messageEndRef = $state(null);
    let textareaRef = $state(null);

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

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function chunkWords(fullText, minWords = 2, maxWords = 5) {
        const words = fullText.split(" ").filter(Boolean);
        const chunks = [];
        let index = 0;

        while (index < words.length) {
            const size =
                minWords +
                Math.floor(Math.random() * (maxWords - minWords + 1));
            chunks.push(words.slice(index, index + size).join(" "));
            index += size;
        }

        return chunks;
    }

    async function revealAssistantContent(messageId, fullText) {
        const normalizedText = String(fullText ?? "");

        if (!normalizedText.trim()) {
            messages = replaceMessageContent(
                messages,
                messageId,
                normalizedText,
            );
            return;
        }

        const chunks = chunkWords(normalizedText);
        let displayed = "";

        for (const chunk of chunks) {
            displayed = displayed ? `${displayed} ${chunk}` : chunk;
            messages = replaceMessageContent(messages, messageId, displayed);
            // Slightly randomized delay keeps the typing cadence from feeling too mechanical.
            await wait(30 + Math.random() * 40);
        }
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

    //#region Send message logic
    // Wrapper keeps Svelte rune assignments local while delegating pipeline logic to chat_engine.
    async function sendViaEngine(content) {
        await sendUserMessage({
            content: content,
            isLoading: () => isLoading,
            getMessages: () => messages,
            setMessages: (nextMessages) => {
                messages = nextMessages;
            },
            setIsLoading: (nextLoading) => {
                isLoading = nextLoading;
            },
            createMessage,
            scrollToBottom,
            revealAssistantContent,
            focusComposer: () => textareaRef?.focus(),
        });
    }

    async function sendMessage() {
        const content = draft.trim();
        if (!content) return;
        draft = "";
        await sendViaEngine(content);

        //         window.scrollTo({
        // 	top: document.body.scrollHeight,
        // 	behavior: "smooth"
        // });
    }

    // Called when the user clicks an in-chat option button.
    function handleOptionSelect(value) {
        void sendViaEngine(value);
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

<main
    class="bg-background flex h-dvh min-h-0 flex-1 flex-col"
    aria-label="Chat page"
>
    <section
        class="relative flex min-h-0 flex-1 flex-col"
        aria-label="Conversation"
    >
        <Badge
            variant="outline"
            class="pointer-events-none absolute right-4 top-4 bg-blue-500 text-white dark:bg-blue-600 normal-case text-[12px] tracking-normal"
            >chat mode</Badge
        >

        <div
            bind:this={messageListRef}
            class="min-h-0 flex-1 overflow-y-auto"
            aria-live="polite"
        >
            <div
                class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 pb-28 md:px-6 md:pb-36"
            >
                {#each messages as message (message.id)}
                    {#if message.role === "user"}
                        <MessageUser {message} {formatTimestamp} />
                    {:else}
                        <MessageAssistant
                            {message}
                            onOptionSelect={handleOptionSelect}
                        />
                    {/if}
                {/each}
                <div bind:this={messageEndRef} aria-hidden="true"></div>
            </div>
        </div>

        <div
            class="from-background via-background/95 to-background sticky bottom-0 border-t bg-linear-to-t px-3 pb-3 pt-4 md:px-6 md:pb-6"
        >
            <form
                class="relative mx-auto w-full max-w-3xl"
                onsubmit={handleSubmit}
            >
                <label class="sr-only" for="chat2-input">Message</label>
                <div
                    class="bg-card ring-ring/30 focus-within:ring-ring rounded-3xl border p-2 shadow-sm transition-shadow focus-within:ring-2"
                >
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
                                        <span class="sr-only"
                                            >Open composer menu</span
                                        >
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
                        <Button
                            type="submit"
                            size="icon-sm"
                            class="rounded-full"
                            disabled={isLoading || !draft.trim()}
                        >
                            {isLoading ? "..." : "↑"}
                        </Button>
                    </div>
                </div>
                <p
                    id="composer-hint"
                    class="text-muted-foreground mt-2 px-2 text-xs"
                >
                    Enter sends. Shift + Enter adds a new line.
                </p>
            </form>
        </div>
    </section>
</main>
