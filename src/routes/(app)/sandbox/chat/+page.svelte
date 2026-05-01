<script>
    import AppHeader from "$lib/components/app-header.svelte";
    import { buildMessages } from "$lib/services/chat.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";

    let inputText = $state("");
    let messages = $state([]);

    function sendMessage(event) {
        event.preventDefault();

        const nextMessages = buildMessages(messages, inputText);
        if (nextMessages.length === messages.length) {
            return;
        }

        messages = nextMessages;
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

<div class="flex flex-1 flex-col gap-4 px-4 py-10">
    <div class="mx-auto flex h-full w-full max-w-3xl flex-col rounded-xl border bg-sidebar p-4">
        <div class="mb-4">
            <h2 class="text-lg font-semibold">Echo Chat</h2>
            <p class="text-muted-foreground text-sm">Type a message and it will be echoed back.</p>
        </div>

        <div class="min-h-64 flex-1 space-y-3 overflow-y-auto rounded-md border p-3">
            {#if messages.length === 0}
                <p class="text-muted-foreground text-sm">No messages yet. Send one to get started.</p>
            {/if}

            {#each messages as message, index (`${message.role}-${index}`)}
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

        <form class="mt-4 flex gap-2" onsubmit={sendMessage}>
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