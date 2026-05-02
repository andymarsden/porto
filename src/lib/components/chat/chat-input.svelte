<script>
    import { Button } from "$lib/components/ui/button/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";

    let {
        inputText = $bindable(""),
        inputRef = $bindable(null),
        slashMenuOpen = false,
        filteredCommands = [],
        activeCommandIndex = 0,
        hasPendingTitleDecision = false,
        isCreateNoteBlocked = false,
        onSubmit = () => {},
        onKeydown = () => {},
        onFocus = () => {},
        onBlur = () => {},
        onSelectCommand = () => {}
    } = $props();
</script>

<form class="mt-4 flex shrink-0 gap-2 border-t pt-3" onsubmit={onSubmit}>
    <div class="relative flex-1">
        <Textarea
            bind:ref={inputRef}
            rows="1"
            placeholder="Type a message (Enter to send, Shift+Enter for newline, / for commands)"
            bind:value={inputText}
            class="max-h-48 min-h-9 resize-none"
            onfocus={onFocus}
            onblur={onBlur}
            onkeydown={onKeydown}
            aria-label="Chat message"
        />

        {#if hasPendingTitleDecision}
            <p class="text-muted-foreground mt-2 text-xs">
                Resolve the current note title suggestion before creating another note with /n.
            </p>
        {/if}

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
                                onSelectCommand(command);
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
    <Button type="submit" disabled={isCreateNoteBlocked}>Send</Button>
</form>
