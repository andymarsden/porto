<script>
    import AppHeader from "$lib/components/app-header.svelte";
    import * as Item from "$lib/components/ui/item/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { containsSlashN } from "$lib/services/chat/string-check.js";

    let inputText = $state("");
    let showNote = $state(false);

    function checkText() {
        showNote = containsSlashN(inputText);
    }
</script>

<AppHeader crumbs={[{ label: "Admin", href: "##" }]} currentPage="Sandbox" />

<div class="flex flex-1 flex-col gap-4 px-4 py-10">
    <div class="bg-muted/50 mx-auto h-24 w-full max-w-3xl rounded-xl">
        <div class="flex h-full items-center justify-between px-4">
            <p class="text-sm font-medium">Try the new sandbox chat interface.</p>
            <Button variant="outline" href="/app/sandbox/chat">Open Chat</Button>
        </div>
    </div>
    <!-- <div class="flex w-full max-w-md flex-col gap-6"></div> -->
    <div class="mx-auto h-full w-full max-w-md rounded-xl">
        <Item.Root variant="outline" class="bg-sidebar">
            <Item.Content>
                <Item.Title>Basic Item</Item.Title>
                <Item.Description
                    >A simple item with title and description.</Item.Description
                >
            </Item.Content>
            <Item.Actions>
                <Button variant="outline" size="sm">Action</Button>
            </Item.Actions>
        </Item.Root>

        <Item.Root variant="outline" class="bg-sidebar mt-4">
            <Item.Content>
                <Item.Title>String Check</Item.Title>
                <Item.Description
                    >Enter text and check whether it contains the literal string
                    /n.</Item.Description
                >

                <div class="mt-3 flex gap-2">
                    <Input
                        placeholder="Type text here"
                        bind:value={inputText}
                    />
                    <Button type="button" onclick={checkText}>Check</Button>
                </div>

                {#if showNote}
                    <p class="mt-2 text-sm font-medium">note</p>
                {/if}
            </Item.Content>
        </Item.Root>
    </div>
</div>
