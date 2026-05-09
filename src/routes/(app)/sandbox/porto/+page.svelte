<script>
    // Svelte
    import { onMount, tick } from "svelte";

    // External UI assets
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";

    // App components
    import AppHeader from "$lib/components/app-header.svelte";
    import { MessageAssistant, MessageUser, MessageThinking } from "$lib/components/chat/index.js";

    // UI components
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";

    // Utils
    import {
        getCurrentFlowStep,
        saveFlowAnswer,
        startFlow,
    } from "$lib/flows/engine.js";
    import { commands } from "$lib/commands";
    import { resolveIntent } from "$lib/intent/resolve_intent.js";
    import { formatTimestamp, wait } from "$lib/utils.js";

    //#region Layout limits
    const MAX_TEXTAREA_HEIGHT = 224;
    //#endregion

    //#region Conversation state
    let messages = $state([]);
    let draft = $state("");
    let isThinking = $state(false);
    let activeFlow = $state(null);
    //#endregion

    //#region DOM refs
    let messageListRef = $state(null);
    let messageEndRef = $state(null);
    let textareaRef = $state(null);
    //#endregion

    //#region Chat specific
    function createMessage(role, content) {
        return {
            id: crypto.randomUUID(),
            role,
            content,
            createdAt: new Date().toISOString(),
        };
    }

    async function processMessage(content) {
        const text = String(content ?? "").trim();

        await wait(700);

        if (text === "/onboard") {
            activeFlow = startFlow("basic-details");

            const step = getCurrentFlowStep(activeFlow);
            return step?.question ?? "That flow is unavailable right now.";
        }

         if (text === "/food") {
            activeFlow = startFlow("favorite-food");

            const step = getCurrentFlowStep(activeFlow);
            return step?.question ?? "That flow is unavailable right now.";
        }

        if (activeFlow) {
            const result = saveFlowAnswer(activeFlow, text);
            activeFlow = result.activeFlow;

            if (result.isComplete) {
                if (activeFlow.id === "basic-details") {
                    await commands.basicDetails.saveFlow({ answers: result.answers });
                } else if (activeFlow.id === "favorite-food") {
                    await commands.food.saveFlow({ answers: result.answers });
                }
                const answers = JSON.stringify(result.answers, null, 2);
                activeFlow = null;

                return `Great, I have saved your answers:\n${answers}`;
            }

            return result.nextStep?.question ?? "Flow step is missing.";
        }

        const intentResponse = await resolveIntent(text);
        return String(intentResponse ?? "Unknown command. Try /echo <message>.(from page)");
    }

    // async function handleUserMessage(content) {
    //     if (activeFlow) {
    //         return handleFlowAnswer(content);
    //     }

    //     return resolveIntent(content);
    // }

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

        if (isThinking) return;

        const content = draft.trim();
        if (!content) return;

        isThinking = true;

        let thinkingMessage = createMessage("thinking", "thinking...");

        draft = "";
        
        //Add messaged back to messages, with a user message and a "thinking..." message that we can replace later with the actual response
        messages = [
            ...messages,
            createMessage("user", content),
            thinkingMessage,
        ];


        //#region get response and update messages
        //This entire bit will need re thinking once we have actual streaming responses, but for now this is fine as there is a new ID generated for each message, so we can easily find and replace the "thinking..." message with the actual response once it's ready
        try {
            const assistantResponse = await processMessage(content);

            //remove the "thinking..." message
            messages = messages.filter((msg) => msg.id !== thinkingMessage.id);

            //add the actual response
            messages = [
                ...messages,
                createMessage("assistant", assistantResponse),
            ];
        } finally {
            isThinking = false;
        }
        //#endregion


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
            class="pointer-events-none absolute right-4 top-4 hidden bg-blue-500 text-white dark:bg-blue-600 normal-case text-[12px] tracking-normal sm:inline-flex"
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
                    {:else if message.role === "assistant"}
                        <MessageAssistant
                            {message}
                            onOptionSelect={handleOptionSelect}
                        />
                    {:else if message.role === "thinking"}
                        <MessageThinking {message} />
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
                aria-busy={isThinking}
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
                            disabled={isThinking}
                        />
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                {#snippet child({ props })}
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        class="rounded-full"
                                        disabled={isThinking}
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
                            disabled={!draft.trim() || isThinking}
                            aria-label={isThinking ? "Assistant is thinking" : "Send message"}
                        >
                            {#if isThinking}
                                <span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true"></span>
                                <span class="sr-only">Thinking...</span>
                            {:else}
                                ↑
                            {/if}
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
