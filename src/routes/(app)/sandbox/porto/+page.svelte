<script>
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
    import { Input } from "$lib/components/ui/input/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";

    // Utils
    import {
        getCurrentFlowStep,
        saveFlowAnswer,
        startFlow,
    } from "$lib/flows/engine.js";
    import { persistCompletedFlow } from "$lib/flows/persistence.js";
    import { resolveIntent } from "$lib/intent/resolve_intent.js";
    import { streamTextByWords } from "$lib/utils/streaming.js";
    import { formatTimestamp, wait, generateId } from "$lib/utils.js";

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
    let currentUserLevel = $state(null);
    let isQuestionComposerOpen = $state(false);
    let questionComposerIndex = $state(null);
    let questionDraft = $state({
        name: "",
        type: "text",
        options: "",
    });
    //DEMO ONLY
    let userParam = $state(null);
    //#endregion

    //#region DOM refs
    let messageListRef = $state(null);
    let messageEndRef = $state(null);
    let textareaRef = $state(null);
    //#endregion

    //#region Setup

    function bootstrap() {
        console.log("bootstrap - user param:", userParam);
    }

    function setUpMessage() {
        const initialOptions = [
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
        ];

        if (isAdminUser(currentUserLevel)) {
            initialOptions.push({
                id: "add-question",
                label: "Add question",
                value: "add-question",
                button_type: "secondary",
            });
        }

        //post example message as assistant
        messages = [
            ...messages,
            {
                id: generateId(),
                role: "assistant",
                content: `Hi ${userParam || ""}!\n I'm your QRIOS AI assistant. \nHow can I help you today? Ask me to do something, or here are some options to choose from:`,
                createdAt: new Date().toISOString(),
                options: initialOptions,
            },
        ];
    }
    //#endregion

    //#region Chat specific
    function createMessage(role, content) {
        return {
            id: generateId(),
            role,
            content,
            createdAt: new Date().toISOString(),
        };
    }

    function buildValidationRetryMessage(errorMessage, retryQuestion) {
        if (errorMessage && retryQuestion) {
            return `${errorMessage}\n\n${retryQuestion}`;
        }

        return errorMessage ?? retryQuestion ?? "Flow step is missing.";
    }

    async function processMessage(content) {
        const text = String(content ?? "").trim();

        await wait(700);

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

        // if (messageListRef) {
        //     messageListRef.scrollTop = messageListRef.scrollHeight;
        // }

        // if (messageEndRef) {
        //     messageEndRef.scrollIntoView({ block: "end" });
        // }

        //No need to overcomplicate this, just scroll to the bottom of the page everytime messages update. This way we don't have to worry about which element is the scroll container, and it works even if the structure of the page changes.
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    }
    //#endregion

    //#region Composer handlers
    function isAdminUser(level) {
        return level === 0 || level === 7;
    }

    function openQuestionComposer(index) {
        questionComposerIndex = index;
        isQuestionComposerOpen = true;
        questionDraft = { name: "", type: "text", options: "" };
    }

    function cancelQuestionComposer() {
        isQuestionComposerOpen = false;
        questionComposerIndex = null;
        questionDraft = { name: "", type: "text", options: "" };
    }

    function submitQuestionRequest() {
        const questionName = questionDraft.name.trim();
        if (!questionName) return;

        const options = questionDraft.options
            .split("\n")
            .map((option) => option.trim())
            .filter(Boolean);

        const requestMessage = createMessage(
            "assistant",
            `Staff request received for question: **${questionName}**\n\nType: ${questionDraft.type}${options.length ? `\nOptions:\n- ${options.join("\n- ")}` : ""}`,
        );

        requestMessage.questionRequest = {
            name: questionName,
            type: questionDraft.type,
            options,
        };

        const insertionIndex =
            typeof questionComposerIndex === "number"
                ? questionComposerIndex + 1
                : messages.length;

        const nextMessages = [...messages];
        nextMessages.splice(insertionIndex, 0, requestMessage);
        messages = nextMessages;

        cancelQuestionComposer();
        void scrollToBottom();
    }

    async function handleOptionSelect(value) {
        if (value === "add-question") {
            openQuestionComposer(0);
            return;
        }

        draft = value;
        // Auto-submit the option as the user's response
        await tick();
        await handleSubmit(new Event("submit", { bubbles: true }));
        // const form = document.querySelector('form');
        // form?.dispatchEvent(new Event('submit', { bubbles: true }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isThinking) return;

        const content = draft.trim();
        if (!content) return;

        isThinking = true;

        let thinkingMessage = createMessage("thinking", "thinking...");
        const isFlowSubmission = Boolean(activeFlow);
        const userMessage = {
            ...createMessage("user", content),
            isValidated: isFlowSubmission ? null : undefined,
        };

        draft = "";

        //Add messaged back to messages, with a user message and a "thinking..." message that we can replace later with the actual response
        messages = [...messages, userMessage, thinkingMessage];

        // Scroll down immediately after showing the submission
        await scrollToBottom();

        //#region get response and update messages
        //This entire bit will need re thinking once we have actual streaming responses, but for now this is fine as there is a new ID generated for each message, so we can easily find and replace the "thinking..." message with the actual response once it's ready
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

            //remove the "thinking..." message
            messages = messages.filter((msg) => msg.id !== thinkingMessage.id);

            //add the assistant message shell, then stream text into it
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
                    // Scroll to keep the streaming response visible
                    void scrollToBottom();
                },
            });

            // add options only after streaming completes so they don't appear prematurely
            //OPTIONS ARE SHOWN HERE!!!!
            if (assistantResponse.options) {
                messages = messages.map((msg) =>
                    msg.id === assistantMessage.id
                        ? {
                              ...msg,
                              options: assistantResponse.options.map(
                                  (opt, i) => ({
                                      id: `opt-${i}`,
                                      label: opt,
                                      value: opt,
                                  }),
                              ),
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

    // Find the index of the last assistant message with options
    const lastAssistantMessageWithOptionsIndex = $derived.by(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "assistant" && messages[i].options?.length > 0) {
                return i;
            }
        }
        return -1; // No message with options found
    });
    //#endregion

    //#region Initial setup
    onMount(async () => {
        userParam = $page.url.searchParams.get("user");

        const levelParam =
            $page.url.searchParams.get("userLevel") ??
            $page.url.searchParams.get("level");
        const parsedLevel = levelParam === null ? null : Number(levelParam);
        currentUserLevel =
            parsedLevel === null || Number.isNaN(parsedLevel)
                ? null
                : parsedLevel;

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
                        <div class="flex flex-col items-start gap-2">
                            <MessageAssistant
                                {message}
                                onOptionSelect={handleOptionSelect}
                                isLastMessageWithOptions={index === lastAssistantMessageWithOptionsIndex}
                            />

                            {#if isQuestionComposerOpen && questionComposerIndex === index}
                                <div class="bg-card border-border w-full max-w-xl rounded-xl border p-4 shadow-sm">
                                    <p class="text-foreground text-sm font-semibold">
                                        Request a new question
                                    </p>
                                    <p class="text-muted-foreground mt-1 text-xs">
                                        This request is sent to staff for review and can be expanded later.
                                    </p>

                                    <div class="mt-3 space-y-3">
                                        <div>
                                            <label
                                                class="text-muted-foreground mb-1 block text-xs font-medium uppercase tracking-wide"
                                                for={`question-name-${message.id}`}
                                            >
                                                Question name
                                            </label>
                                            <Input
                                                id={`question-name-${message.id}`}
                                                bind:value={questionDraft.name}
                                                placeholder="e.g. Preferred contact method"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                class="text-muted-foreground mb-1 block text-xs font-medium uppercase tracking-wide"
                                                for={`question-type-${message.id}`}
                                            >
                                                Question type
                                            </label>
                                            <select
                                                id={`question-type-${message.id}`}
                                                bind:value={questionDraft.type}
                                                class="border-input bg-background text-foreground h-9 w-full rounded-md border px-2.5 text-sm"
                                            >
                                                <option value="text">Text</option>
                                                <option value="number">Number</option>
                                                <option value="date">Date</option>
                                                <option value="select">Select</option>
                                            </select>
                                        </div>

                                        {#if questionDraft.type === "select"}
                                            <div>
                                                <label
                                                    class="text-muted-foreground mb-1 block text-xs font-medium uppercase tracking-wide"
                                                    for={`question-options-${message.id}`}
                                                >
                                                    Options (one per line)
                                                </label>
                                                <Textarea
                                                    id={`question-options-${message.id}`}
                                                    bind:value={questionDraft.options}
                                                    rows="4"
                                                    placeholder="Option 1&#10;Option 2"
                                                />
                                            </div>
                                        {/if}
                                    </div>

                                    <div class="mt-4 flex items-center gap-2">
                                        <Button
                                            type="button"
                                            class= "bg-button-blue hover:bg-blue-700 text-white"
                                            size="sm"
                                            onclick={submitQuestionRequest}
                                        >
                                            Send request
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onclick={cancelQuestionComposer}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            {/if}
                        </div>
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
