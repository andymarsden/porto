<script>
    import AppHeader from "$lib/components/app-header.svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import { getNotes } from "$lib/services/chat/note.js";
    import { formatDateTime } from "$lib/utils.js";

    let notes = $state([]);

    function refreshNotes() {
        notes = getNotes();
    }

    $effect(() => {
        refreshNotes();

        const intervalId = setInterval(refreshNotes, 3000);

        return () => {
            clearInterval(intervalId);
        };
    });
</script>

<AppHeader
    crumbs={[
        { label: "Admin", href: "/app" },
        { label: "Sandbox", href: "/app/sandbox" }
    ]}
    currentPage="Notes"
/>

<div class="flex min-h-0 flex-1 flex-col gap-4 px-4 py-6">
    <div class="mx-auto flex h-[calc(100vh-9rem)] min-h-0 w-full max-w-3xl flex-col rounded-xl border bg-sidebar p-4">
        <div class="mb-4 flex items-start justify-between gap-3 border-b pb-3">
            <div>
                <h2 class="text-lg font-semibold">Saved Notes</h2>
                <p class="text-muted-foreground text-sm">Notes created from chat commands appear here.</p>
            </div>
            <Button type="button" variant="outline" onclick={refreshNotes}>Refresh</Button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto rounded-md border p-3">
            {#if notes.length === 0}
                <p class="text-muted-foreground text-sm italic">
                    No notes yet. Create one in Chat with /n followed by your note text.
                </p>
            {:else}
                <ul class="space-y-3">
                    {#each notes as note (note.id)}
                        <li class="rounded-lg border bg-muted/30 p-3">
                            <!--
                            <div class="mb-1 flex items-center justify-between gap-2">
                                <span class="font-mono text-xs" title={note.id}>{note.id.slice(0, 8)}</span>
                                <span class="text-muted-foreground text-xs">{note.createdAt}</span>
                            </div>
                            -->
                            <div class="mb-1 flex items-start justify-between gap-2">
                                <h3 class="text-xs font-semibold">{note.title || "Untitled note"}</h3>
                                <span
                                    class="text-muted-foreground text-xs"
                                    title={formatDateTime(note.createdAt)}
                                >
                                    {formatDateTime(note.createdAt, { mode: "relative" })}
                                </span>
                            </div>

                            <p class="text-sm">{note.content}</p>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
</div>
