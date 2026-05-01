<script>
    import AppHeader from "$lib/components/app-header.svelte";
    import { buildConversationUpdate, createConversation } from "$lib/services/chat/chat.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";

    let inputText = $state("");
    let conversation = $state(createConversation());
    let messagesViewport;

    $effect(() => {
        conversation.messages.length;

        if (!messagesViewport) {
            return;
        }

        messagesViewport.scrollTop = messagesViewport.scrollHeight;
    });

    function sendMessage(event) {
        event.preventDefault();

        const nextConversation = buildConversationUpdate(conversation, inputText);
        if (nextConversation.messages.length === conversation.messages.length) {
            return;
        }

        conversation = nextConversation;
        inputText = "";
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
            <div class="text-muted-foreground mt-2 grid gap-1 rounded-md border bg-muted/30 px-3 py-2 text-xs sm:grid-cols-[auto,1fr] sm:gap-x-2">
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
            <Input
                type="text"
                placeholder="Type your message"
                bind:value={inputText}
                aria-label="Chat message"
            />
            <Button type="submit">Send</Button>
        </form>
    </div>
</div>