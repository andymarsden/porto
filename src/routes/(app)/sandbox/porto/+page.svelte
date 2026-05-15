<script>

    //#region Imports
    // Svelte
    import { onMount, tick } from "svelte";
    import { page } from "$app/stores";

    // External UI assets
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";

    // App components
    import AppHeader from "$lib/components/app-header.svelte";
    import {
        MessageAssistant,
        MessageUser,
        MessageThinking,
        MessageAlbumCard,
        MessageChart,
    } from "$lib/components/chat/index.js";

    // UI components
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";

    // App logic and utilities
    import { executeCommand } from "$lib/commands/execute";
    import { getCurrentFlowStep, saveFlowAnswer, startFlow } from "$lib/flows/engine.js";
    import { persistCompletedFlow } from "$lib/flows/persistence.js";
    import { resolveIntent } from "$lib/intent/resolve_intent.js";
    import { streamTextByWords } from "$lib/utils/streaming.js";
    import { formatTimestamp, wait, generateId } from "$lib/utils.js";
    //#endregion

    //#region Layout limits
    const MAX_TEXTAREA_HEIGHT = 224;
    const ASSISTANT_STREAM_WORDS_PER_CHUNK = 2;
    const ASSISTANT_STREAM_DELAY_MS = 40;
    //#endregion

    //#region Conversation state
    let messages = $state([]);
    let draft = $state("");
    let isThinking = $state(false);
    let activeFlow = $state(null);
    // DEMO ONLY
    let userParam = $state(null);
    //#endregion

    //#region DOM refs
    let messageListRef = $state(null);
    let messageEndRef = $state(null);
    let textareaRef = $state(null);
    //#endregion

    //#region Initial setup helpers
    function bootstrap() {
        console.log("bootstrap - user param:", userParam);
    }

    function setUpMessage() {
        // Post example message as assistant.
        messages = [
            ...messages,
            {
                id: generateId(),
                role: "assistant",
                content: `Hi ${userParam || ""}!\n I'm your QRIOS AI assistant. \nHow can I help you today? Ask me to do something, or here are some options to choose from:`,
                createdAt: new Date().toISOString(),
                options: [
                    {
                        id: "food",
                        label: "Data Summary",
                        value: "/chart",
                        button_type: "fancy",
                    },
                    {
                        id: "onboard",
                        label: "Start QRIOS",
                        value: "qrios",
                        button_type: "secondary",
                    },
                    {
                        id: "music",
                        label: "Play some music",
                        value: "music",
                        button_type: "primary",
                    },
                ],
            },
        ];
    }
    //#endregion

    //#region Message utilities
    function createMessage(role, content) {
        return {
            id: generateId(),
            role,
            content,
            createdAt: new Date().toISOString(),
        };
    }

    function buildValidationRetryMessage(errorMessage, retryQuestion) {
        // Keep both error and retry prompt together when both are available.
        if (errorMessage && retryQuestion) {
            return `${errorMessage}\n\n${retryQuestion}`;
        }

        return errorMessage ?? retryQuestion ?? "Flow step is missing.";
    }
    //#endregion

    //#region Core message orchestration
    async function processMessage(content) {
        const text = String(content ?? "").trim();

        await wait(700);

        // If a flow is active, continue that flow; otherwise resolve a new intent.
        if (activeFlow) {
            const result = await saveFlowAnswer(activeFlow, text);
            activeFlow = result.activeFlow;

            if (result.isComplete) {
                await persistCompletedFlow(activeFlow.id, result.answers);
                const answers = JSON.stringify(result.answers, null, 2);
                activeFlow = null;

                return {
                    text: `Great, I have saved your answers:\n${answers}`,
                    card: null,
                    validationStatus: true,
                };
            }

            if (result.errorMessage) {
                return {
                    text: buildValidationRetryMessage(
                        result.errorMessage,
                        result.nextStep?.question,
                    ),
                    card: null,
                    options: result.nextStep?.options,
                    validationStatus: false,
                };
            }

            return {
                text: result.nextStep?.question ?? "Flow step is missing.",
                card: null,
                options: result.nextStep?.options,
                validationStatus: true,
            };
        }

        const intentResponse = await resolveIntent(text);

        const normalizedIntentResponse =
            intentResponse && typeof intentResponse === "object"
                ? intentResponse
                : { text: intentResponse, activeFlow: null };

        if (normalizedIntentResponse.activeFlow) {
            activeFlow = normalizedIntentResponse.activeFlow;
        }

        return {
            text:
                normalizedIntentResponse.text ??
                "Unknown command. Try /echo <message>.(from page)",
            card: normalizedIntentResponse.card ?? null,
            options: normalizedIntentResponse.options,
        };
    }
    //#endregion

    //#region UI helpers
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

        // No need to overcomplicate this: scroll to the bottom of the page
        // when messages update so this still works if layout containers change.
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    }
    //#endregion

    //#region Composer handlers
    async function handleOptionSelect(value) {
        draft = value;

        // Auto-submit the selected option as the user's response.
        await tick();
        await handleSubmit(new Event("submit", { bubbles: true }));
    }

    // TODO: This should come from engine I think
    async function transformUserAnswer() {
        console.log("!!!!!!!!!Transforming user answer for flow submission...");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isThinking) return;

        let content = draft.trim();
        if (!content) return;

        isThinking = true;

        let thinkingMessage = createMessage("thinking", "thinking...");
        const isFlowSubmission = Boolean(activeFlow);

        // Flow answers can run through an optional step-level transform command.
        if (isFlowSubmission) {
            const currentStep = getCurrentFlowStep(activeFlow);

            if (currentStep?.transform) {
                const transformedAnswer = await executeCommand(currentStep?.transform, {
                    answer: content,
                    stepId: currentStep.id,
                });

                if (
                    transformedAnswer !== undefined
                    && transformedAnswer !== null
                    && !transformedAnswer.error
                ) {
                    content = transformedAnswer;
                } else {
                    console.warn("Transform function did not return a value, using original answer");
                }
            }

            thinkingMessage.content = "Let me check that for you...";
        }

        const userMessage = {
            ...createMessage("user", content),
            isValidated: isFlowSubmission ? null : undefined,
        };

        draft = "";

        // Add user message and a temporary thinking message to replace later.
        messages = [...messages, userMessage, thinkingMessage];

        // Scroll down immediately after showing the submission.
        await scrollToBottom();

        //#region Get response and update messages
        // Keep temporary-message replacement centralized until full streaming API is wired in.
        try {
            const assistantResponse = await processMessage(content);

            if (assistantResponse.validationStatus !== undefined) {
                messages = messages.map((msg) =>
                    msg.id === userMessage.id
                        ? {
                              ...msg,
                              isValidated: assistantResponse.validationStatus,
                          }
                        : msg,
                );
            }

            // Remove the "thinking..." message.
            messages = messages.filter((msg) => msg.id !== thinkingMessage.id);

            // Add the assistant message shell, then stream text into it.
            const assistantMessage = createMessage("assistant", "");

            if (assistantResponse.card) {
                assistantMessage.card = assistantResponse.card;
            }

            messages = [...messages, assistantMessage];

            await streamTextByWords(assistantResponse.text, {
                wordsPerChunk: ASSISTANT_STREAM_WORDS_PER_CHUNK,
                delayMs: ASSISTANT_STREAM_DELAY_MS,
                onChunk: (nextContent) => {
                    messages = messages.map((msg) =>
                        msg.id === assistantMessage.id
                            ? { ...msg, content: nextContent }
                            : msg,
                    );

                    // Scroll to keep the streaming response visible.
                    void scrollToBottom();
                },
            });

            // Add options after streaming completes so they do not appear prematurely.
            if (assistantResponse.options) {
                messages = messages.map((msg) =>
                    msg.id === assistantMessage.id
                        ? {
                              ...msg,
                              options: assistantResponse.options.map((opt, i) => ({
                                  id: `opt-${i}`,
                                  label: opt,
                                  value: opt,
                              })),
                          }
                        : msg,
                );
            }
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

    // Track the latest assistant message with options so only it gets option emphasis in the UI.
    const lastAssistantMessageWithOptionsIndex = $derived.by(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "assistant" && messages[i].options?.length > 0) {
                return i;
            }
        }

        return -1;
    });
    //#endregion

    //#region Lifecycle
    onMount(async () => {
        userParam = $page.url.searchParams.get("user");
        bootstrap();
        setUpMessage();
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
            >{activeFlow ? "flow mode" : "echo mode"}</Badge
        >

        <div
            bind:this={messageListRef}
            class="min-h-0 flex-1 overflow-y-auto"
            aria-live="polite"
        >
            <div
                class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 pb-28 md:px-6 md:pb-36"
            >
                {#if messages.length === 0}
                    <p class="text-muted-foreground text-sm">Loading...</p>
                {/if}
                {#each messages as message, index (message.id)}
                    {#if message.role === "user"}
                        <div class="pb-12">
                            <MessageUser
                                {message}
                                {formatTimestamp}
                                user={userParam}
                            />
                        </div>
                    {:else if message.role === "assistant" && message.card?.type === "album"}
                        <MessageAlbumCard {message} />
                    {:else if message.role === "assistant" && message.card?.type === "chart"}
                        <MessageChart {message} />
                    {:else if message.role === "assistant"}
                        <MessageAssistant
                            {message}
                            onOptionSelect={handleOptionSelect}
                            isLastMessageWithOptions={index === lastAssistantMessageWithOptionsIndex}
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
                            class="h-9 max-h-56 min-h-0 flex-1 resize-none border-0 bg-transparent px-3 py-1.5 text-base shadow-none focus-visible:ring-0 md:text-sm"
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
                                <DropdownMenu.Item>Live 1.5.2</DropdownMenu.Item
                                >
                                <DropdownMenu.Item
                                    >Preview 2.3</DropdownMenu.Item
                                >
                                <DropdownMenu.Item>Test 2.6.1</DropdownMenu.Item
                                >
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                        <Button
                            type="submit"
                            size="icon-sm"
                            class="rounded-full"
                            disabled={!draft.trim() || isThinking}
                            aria-label={isThinking
                                ? "Assistant is thinking"
                                : "Send message"}
                        >
                            {#if isThinking}
                                <span
                                    class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
                                    aria-hidden="true"
                                ></span>
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
