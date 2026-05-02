<script>
    import { TITLE_SUGGESTION_STATUS } from "$lib/services/chat/constants.js";
    import { Button } from "$lib/components/ui/button/index.js";

    let {
        messages = [],
        activeTitleSuggestion = null,
        viewport = $bindable(null),
        onAcceptTitle = () => {},
        onDeclineTitle = () => {}
    } = $props();
</script>

<div
    bind:this={viewport}
    class="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-md border p-3"
>
    {#if messages.length === 0}
        <p class="text-muted-foreground text-sm">No messages yet. Send one to get started.</p>
    {/if}

    {#each messages as message (message.id)}
        <div class={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div class="max-w-[85%] space-y-2">
                <div
                    class={`rounded-lg px-3 py-2 text-sm ${
                        message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                    }`}
                >
                    {message.content}
                </div>

                {#if message.role === "assistant" && activeTitleSuggestion?.messageId === message.id}
                    <div class="rounded-lg border bg-background px-3 py-3 text-sm shadow-sm">
                        {#if activeTitleSuggestion.status === TITLE_SUGGESTION_STATUS.LOADING}
                            <p class="font-medium">Suggesting a title...</p>
                        {:else if activeTitleSuggestion.status === TITLE_SUGGESTION_STATUS.READY}
                            <p class="font-medium">
                                Suggested title: {activeTitleSuggestion.suggestedTitle}
                            </p>
                            <p class="text-muted-foreground mt-1 text-xs">
                                The note will not be created until you accept this title or keep the default title.
                            </p>
                            <div class="mt-3 flex gap-2">
                                <Button type="button" onclick={onAcceptTitle}>Accept</Button>
                                <Button type="button" variant="outline" onclick={onDeclineTitle}
                                    >Keep Default Title</Button
                                >
                            </div>
                        {:else if activeTitleSuggestion.status === TITLE_SUGGESTION_STATUS.ACCEPTED}
                            <p class="font-medium">
                                Note created with title: {activeTitleSuggestion.suggestedTitle}
                            </p>
                        {:else if activeTitleSuggestion.status === TITLE_SUGGESTION_STATUS.DECLINED}
                            <p class="font-medium">Note created with its default title.</p>
                        {:else if activeTitleSuggestion.status === TITLE_SUGGESTION_STATUS.FAILED}
                            <p class="font-medium">{activeTitleSuggestion.errorMessage}</p>
                            <div class="mt-3 flex gap-2">
                                <Button type="button" variant="outline" onclick={onDeclineTitle}
                                    >Keep Default Title</Button
                                >
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    {/each}
</div>
