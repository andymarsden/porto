<script>
    import { tick } from "svelte";
    import AppHeader from "$lib/components/app-header.svelte";
    import { buildConversationUpdate, createConversation } from "$lib/services/chat/chat.js";
    import { getAvailableCommands } from "$lib/services/chat/intent.js";
    import { getNotes } from "$lib/services/chat/note.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";

    const slashCommands = getAvailableCommands();

    let inputText = $state("");
    let conversation = $state(createConversation());
    let notes = $state([]);
    let messagesViewport;
    let inputRef = $state(null);
    let slashMenuOpen = $state(false);
    let activeCommandIndex = $state(0);
    let inputHasFocus = $state(false);

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
        if (conversation.pendingAction || !inputHasFocus || slashContext === null || slashContext.hasArguments) {
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
        if (conversation.pendingAction || !slashMenuOpen) {
            return;
        }

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
        }
    }

    function sendMessage(event) {
        event.preventDefault();

        const nextConversation = buildConversationUpdate(conversation, inputText);
        if (nextConversation.messages.length === conversation.messages.length) {
            return;
        }

        conversation = nextConversation;
        inputText = "";
        slashMenuOpen = false;
        activeCommandIndex = 0;
    }
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
                                            <span class="font-medium">{note.title}</span> — {note.content}
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

        <div
            bind:this={messagesViewport}
            class="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-md border p-3"
        >
            {#if conversation.messages.length === 0}
                <p class="text-muted-foreground text-sm">No messages yet. Send one to get started.</p>
            {/if}

            {#each conversation.messages as message (message.id)}
                <div class={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                        class={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                            message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                        }`}
                    >
                        {message.content}
                    </div>
                </div>
            {/each}
        </div>

        <form class="mt-4 flex shrink-0 gap-2 border-t pt-3" onsubmit={sendMessage}>
            <div class="relative flex-1">
                <Input
                    bind:ref={inputRef}
                    type="text"
                    placeholder="Type your message (try / for commands)"
                    bind:value={inputText}
                    onfocus={() => {
                        inputHasFocus = true;
                    }}
                    onblur={() => {
                        inputHasFocus = false;
                    }}
                    onkeydown={handleInputKeydown}
                    aria-label="Chat message"
                />

                {#if slashMenuOpen}
                    <div
                        class="bg-popover text-popover-foreground absolute bottom-full left-0 z-20 mb-2 w-full rounded-md border p-1 shadow-md"
                        role="listbox"
                        aria-label="Slash commands"
                    >
                        {#if filteredCommands.length === 0}
                            <div class="text-muted-foreground px-2 py-1.5 text-sm">No commands found.</div>
                        {:else}
                            {#each filteredCommands as command, index (command.id)}
                                <button
                                    type="button"
                                    class={`flex w-full items-start justify-between rounded-sm px-2 py-1.5 text-left text-sm ${
                                        index === activeCommandIndex ? "bg-accent text-accent-foreground" : ""
                                    }`}
                                    onmousedown={(event) => {
                                        event.preventDefault();
                                        selectCommand(command);
                                    }}
                                    role="option"
                                    aria-selected={index === activeCommandIndex}
                                >
                                    <span>
                                        <span class="font-medium">{command.command}</span>
                                        <span class="text-muted-foreground ml-2">{command.label}</span>
                                    </span>
                                    <span class="text-muted-foreground text-xs">{command.description}</span>
                                </button>
                            {/each}
                        {/if}
                    </div>
                {/if}
            </div>
            <Button type="submit">Send</Button>
        </form>
    </div>
</div>