<script>
    // Svelte
    import { onMount, tick } from "svelte";

    // External UI assets
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";

    // App components
    import AppHeader from "$lib/components/app-header.svelte";
    import { MessageAssistant, MessageUser } from "$lib/components/chat/index.js";

    // UI components
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";

    // Utils
    import { formatTimestamp } from "$lib/utils.js";

    //#region Layout limits
    const MAX_TEXTAREA_HEIGHT = 224;
    //#endregion

    //#region Conversation state
    let messages = $state([]);
    let draft = $state("");
    //#endregion

    //#region DOM refs
    let messageListRef = $state(null);
    let messageEndRef = $state(null);
    let textareaRef = $state(null);
    //#endregion

    //#region Message factory
    function createMessage(role, content) {
        return {
            id: crypto.randomUUID(),
            role,
            content,
            createdAt: new Date().toISOString(),
        };
    }
    //#endregion

    //#region UI helpers
    function autoResizeTextarea() {
        if (!textareaRef) return;

        textareaRef.style.height = "auto";
        const nextHeight = Math.min(textareaRef.scrollHeight, MAX_TEXTAREA_HEIGHT);
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
    }
    //#endregion

    //#region Composer handlers
    function handleOptionSelect(value) {
        draft = value;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const content = draft.trim();
        if (!content) return;

        draft = "";
        messages = [
            ...messages,
            createMessage("user", content),
            createMessage("assistant", content),
        ];

        await scrollToBottom();
        textareaRef?.focus();
    }

    function handleComposerKeydown(event) {
        if (event.key !== "Enter") return;
        if (event.shiftKey) return;

        event.preventDefault();
        void handleSubmit(event);
    }
    //#endregion

    //#region Reactive updates
    $effect(() => {
        draft;
        autoResizeTextarea();
    });

    $effect(() => {
        messages;
        void scrollToBottom();
    });
    //#endregion

    //#region Initial setup
    onMount(async () => {
        autoResizeTextarea();
        await scrollToBottom();
    });
    //#endregion
</script>

<AppHeader
    crumbs={[
        { label: "Admin", href: "/app" },
        { label: "Sandbox", href: "/app/sandbox" },
    ]}
    currentPage="Porto"
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
            >echo mode</Badge
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
                <label class="sr-only" for="porto-input">Message</label>
                <div
                    class="bg-card ring-ring/30 focus-within:ring-ring rounded-3xl border p-2 shadow-sm transition-shadow focus-within:ring-2"
                >
                    <div class="flex items-end gap-2">
                        <Textarea
                            id="porto-input"
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
                                <DropdownMenu.Item>Option 1</DropdownMenu.Item>
                                <DropdownMenu.Item>Option 2</DropdownMenu.Item>
                                <DropdownMenu.Item>Option 3</DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                        <Button
                            type="submit"
                            size="icon-sm"
                            class="rounded-full"
                            disabled={!draft.trim()}
                        >
                            ↑
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
