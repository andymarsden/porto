<script>
    import { tick } from "svelte";
    import AppHeader from "$lib/components/app-header.svelte";
    import ChatInput from "$lib/components/chat/chat-input.svelte";
    import ChatMessages from "$lib/components/chat/chat-messages.svelte";
    import {
        appendConversationEvent,
        buildConversationUpdate,
        createConversation
    } from "$lib/services/chat/chat.js";
    import {
        CHAT_INTENTS,
        CHAT_WORKFLOW_STATUS,
        NOTE_CREATION_ERROR,
        TITLE_SUGGESTION_STATUS
    } from "$lib/services/chat/constants.js";
    import { getAvailableCommands } from "$lib/services/chat/intent.js";
    import { addTitleToNote, createNote, getNotes } from "$lib/services/chat/note.js";
    import { containsSlashN } from "$lib/services/chat/string-check.js";
    import {
        fetchSuggestedTitle,
        isTitleSuggestionPending
    } from "$lib/services/chat/title-suggestion.js";
    import { toast } from "svelte-sonner";

    const slashCommands = getAvailableCommands();

    let inputText = $state("");
    let conversation = $state(createConversation());
    let notes = $state([]);
    let messagesViewport = $state(null);
    let inputRef = $state(null);
    let slashMenuOpen = $state(false);
    let activeCommandIndex = $state(0);
    let inputHasFocus = $state(false);
    let activeTitleSuggestion = $state(null);

    function recordWorkflowEvent(workflowStatus, intentId = CHAT_INTENTS.CREATE_NOTE, meta = null) {
        conversation = appendConversationEvent(conversation, {
            intentId,
            workflowStatus,
            meta
        });
    }

    async function requestTitleSuggestion(noteContent, messageId) {
        const requestId = crypto.randomUUID();

        activeTitleSuggestion = {
            requestId,
            noteContent,
            messageId,
            status: TITLE_SUGGESTION_STATUS.LOADING,
            suggestedTitle: "",
            errorMessage: ""
        };

        recordWorkflowEvent(CHAT_WORKFLOW_STATUS.TITLE_SUGGESTION_LOADING, CHAT_INTENTS.CREATE_NOTE, {
            noteContent
        });

        const response = await fetchSuggestedTitle(noteContent);

        if (activeTitleSuggestion?.requestId !== requestId) {
            return;
        }

        if (response.ok) {
            activeTitleSuggestion = {
                ...activeTitleSuggestion,
                status: TITLE_SUGGESTION_STATUS.READY,
                suggestedTitle: response.suggestedTitle,
                errorMessage: ""
            };
            recordWorkflowEvent(CHAT_WORKFLOW_STATUS.TITLE_SUGGESTION_READY, CHAT_INTENTS.CREATE_NOTE, {
                noteContent,
                suggestedTitle: response.suggestedTitle
            });
            return;
        }

        activeTitleSuggestion = {
            ...activeTitleSuggestion,
            status: TITLE_SUGGESTION_STATUS.FAILED,
            suggestedTitle: "",
            errorMessage: response.errorMessage
        };
        recordWorkflowEvent(CHAT_WORKFLOW_STATUS.TITLE_SUGGESTION_FAILED, CHAT_INTENTS.CREATE_NOTE, {
            noteContent,
            errorMessage: response.errorMessage
        });
    }

    function commitPendingNote(title = null) {
        if (!activeTitleSuggestion?.noteContent) {
            return null;
        }

        const note = createNote(activeTitleSuggestion.noteContent);

        if (!note) {
            return null;
        }

        if (title) {
            const updatedNote = addTitleToNote(note.id, title);

            if (!updatedNote) {
                return null;
            }
        }

        notes = getNotes();
        return note;
    }

    function setSuggestionResolvedStatus(status) {
        activeTitleSuggestion = {
            ...activeTitleSuggestion,
            status,
            errorMessage: ""
        };
    }

    function setSuggestionFailure(errorMessage) {
        activeTitleSuggestion = {
            ...activeTitleSuggestion,
            status: TITLE_SUGGESTION_STATUS.FAILED,
            errorMessage
        };
    }

    function acceptSuggestedTitle() {
        if (activeTitleSuggestion?.status !== TITLE_SUGGESTION_STATUS.READY) {
            return;
        }

        const createdNote = commitPendingNote(activeTitleSuggestion.suggestedTitle);

        if (!createdNote) {
            setSuggestionFailure(NOTE_CREATION_ERROR);
            return;
        }

        setSuggestionResolvedStatus(TITLE_SUGGESTION_STATUS.ACCEPTED);
        recordWorkflowEvent(CHAT_WORKFLOW_STATUS.NOTE_SAVED_ACCEPTED_TITLE, CHAT_INTENTS.CREATE_NOTE, {
            noteId: createdNote.id,
            title: activeTitleSuggestion.suggestedTitle
        });
        toast.success("Note created successfully");
    }

    function declineSuggestedTitle() {
        if (!activeTitleSuggestion || !isTitleSuggestionPending(activeTitleSuggestion.status)) {
            return;
        }

        const createdNote = commitPendingNote();

        if (!createdNote) {
            setSuggestionFailure(NOTE_CREATION_ERROR);
            return;
        }

        setSuggestionResolvedStatus(TITLE_SUGGESTION_STATUS.DECLINED);
        recordWorkflowEvent(CHAT_WORKFLOW_STATUS.NOTE_SAVED_DEFAULT_TITLE, CHAT_INTENTS.CREATE_NOTE, {
            noteId: createdNote.id
        });
        toast.success("Note created successfully");
    }

    const slashContext = $derived.by(() => {
        const trimmed = inputText.trimStart();

        if (!trimmed.startsWith("/")) {
            return null;
        }

        const afterSlash = trimmed.slice(1);
        const hasArguments = /\s/.test(afterSlash);
        const query = afterSlash.split(/\s+/, 1)[0].toLowerCase();

        return {
            query,
            hasArguments
        };
    });

    const filteredCommands = $derived.by(() => {
        if (slashContext === null || slashContext.hasArguments) {
            return [];
        }

        return slashCommands.filter((command) =>
            command.command.slice(1).startsWith(slashContext.query)
        );
    });

    const hasPendingTitleDecision = $derived.by(() =>
        isTitleSuggestionPending(activeTitleSuggestion?.status)
    );

    const isCreateNoteBlocked = $derived.by(() =>
        hasPendingTitleDecision && containsSlashN(inputText)
    );

    const latestConversationEvent = $derived.by(() => conversation.events?.at(-1) ?? null);

    $effect(() => {
        conversation.messages.length;

        notes = getNotes();

        if (!messagesViewport) {
            return;
        }

        messagesViewport.scrollTop = messagesViewport.scrollHeight;
    });

    $effect(() => {
        filteredCommands.length;

        if (activeCommandIndex >= filteredCommands.length) {
            activeCommandIndex = Math.max(filteredCommands.length - 1, 0);
        }
    });

    $effect(() => {
        if (!inputHasFocus || slashContext === null || slashContext.hasArguments) {
            slashMenuOpen = false;
            return;
        }

        slashMenuOpen = true;
    });

    function moveCommandSelection(direction) {
        if (filteredCommands.length === 0) {
            return;
        }

        const total = filteredCommands.length;
        activeCommandIndex = (activeCommandIndex + direction + total) % total;
    }

    async function selectCommand(command) {
        inputText = command.usage;
        slashMenuOpen = false;
        activeCommandIndex = 0;

        await tick();
        inputRef?.focus();
        inputRef?.setSelectionRange(inputText.length, inputText.length);
    }

    function handleInputKeydown(event) {
        if (slashMenuOpen) {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                moveCommandSelection(1);
                return;
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                moveCommandSelection(-1);
                return;
            }

            if (event.key === "Enter") {
                if (filteredCommands.length === 0) {
                    return;
                }

                event.preventDefault();
                selectCommand(filteredCommands[activeCommandIndex]);
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                slashMenuOpen = false;
                return;
            }
        }

        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            submitCurrentMessage();
        }
    }

    function submitCurrentMessage() {
        if (isCreateNoteBlocked) {
            toast.error("Finish the current note title choice before creating another note.");
            return;
        }

        const nextConversation = buildConversationUpdate(conversation, inputText);

        if (nextConversation.messages.length === conversation.messages.length) {
            return;
        }

        const assistantMessage = nextConversation.messages.at(-1);
        const noteText = assistantMessage?.meta?.noteText ?? "";
        const shouldSuggestTitle =
            assistantMessage?.intent === CHAT_INTENTS.CREATE_NOTE &&
            assistantMessage?.meta?.requiresTitleReview === true &&
            Boolean(noteText);

        conversation = nextConversation;

        if (shouldSuggestTitle) {
            requestTitleSuggestion(noteText, assistantMessage.id);
        }

        inputText = "";
        slashMenuOpen = false;
        activeCommandIndex = 0;
    }

    function sendMessage(event) {
        event.preventDefault();
        submitCurrentMessage();
    }

    function resizeInput() {
        if (!inputRef) {
            return;
        }

        const maxHeight = 192;
        inputRef.style.height = "auto";
        inputRef.style.height = `${Math.min(inputRef.scrollHeight, maxHeight)}px`;
        inputRef.style.overflowY = inputRef.scrollHeight > maxHeight ? "auto" : "hidden";
    }

    $effect(() => {
        inputText;
        resizeInput();
    });
</script>

<AppHeader
    crumbs={[
        { label: "Admin", href: "/app" },
        { label: "Sandbox", href: "/app/sandbox" }
    ]}
    currentPage="Chat"
/>

<div class="flex min-h-0 flex-1 flex-col gap-4 px-4 py-6">
    <div class="mx-auto flex h-[calc(100vh-9rem)] min-h-0 w-full max-w-3xl flex-col rounded-xl border bg-sidebar p-4">
        <div class="mb-4">
            <h2 class="text-lg font-semibold">Echo Chat</h2>
            <p class="text-muted-foreground text-sm">Type a message and it will be echoed back.</p>
            <div class="text-muted-foreground mt-2 space-y-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
                <div class="grid gap-1 sm:grid-cols-[auto,1fr] sm:gap-x-2">
                    <span class="font-medium">Conversation ID</span>
                    <span
                        class="font-mono"
                        title={conversation.id}
                        aria-label={`Conversation ID ${conversation.id}`}
                    >
                        {conversation.id.slice(0, 8)}
                    </span>
                    <span class="font-medium">Updated At</span>
                    <span class="font-mono">{conversation.updatedAt}</span>
                    <span class="font-medium">Workflow</span>
                    <span class="font-mono">
                        {latestConversationEvent
                            ? `${latestConversationEvent.intentId}:${latestConversationEvent.workflowStatus}`
                            : "idle"}
                    </span>
                </div>
                <div class="border-t pt-2">
                    <span class="font-medium">Notes ({notes.length})</span>
                    {#if notes.length === 0}
                        <p class="text-muted-foreground mt-1 italic">No notes yet.</p>
                    {:else}
                        <ul class="mt-1 space-y-1">
                            {#each notes as note (note.id)}
                                <li class="grid sm:grid-cols-[auto,1fr] sm:gap-x-2">
                                    <span class="font-mono" title={note.id}>{note.id.slice(0, 8)}</span>
                                    <span class="truncate">
                                        {#if note.title}
                                            <span class="font-medium">{note.title}</span> - {note.content}
                                        {:else}
                                            {note.content}
                                        {/if}
                                    </span>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
            </div>
        </div>

        <ChatMessages
            bind:viewport={messagesViewport}
            messages={conversation.messages}
            {activeTitleSuggestion}
            onAcceptTitle={acceptSuggestedTitle}
            onDeclineTitle={declineSuggestedTitle}
        />

        <ChatInput
            bind:inputText
            bind:inputRef
            {slashMenuOpen}
            {filteredCommands}
            {activeCommandIndex}
            {hasPendingTitleDecision}
            {isCreateNoteBlocked}
            onSubmit={sendMessage}
            onKeydown={handleInputKeydown}
            onFocus={() => {
                inputHasFocus = true;
            }}
            onBlur={() => {
                inputHasFocus = false;
            }}
            onSelectCommand={selectCommand}
        />
    </div>
</div>
