<script>
  import { tick } from "svelte";
  import { sendMessageToApiMock } from "$lib/services/chat-service.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  let draft = $state("");
  let isSending = $state(false);
  let errorMessage = $state("");
  let threadRef;
  let messages = $state([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Hello. I am your York assistant. Ask me anything and I will echo it back for now.",
      createdAt: Date.now(),
    },
  ]);

  function createMessage(role, text) {
    return {
      id: crypto.randomUUID(),
      role,
      text,
      createdAt: Date.now(),
    };
  }

  function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleSubmit() {
    if (isSending) return;

    const text = draft.trim();
    if (!text) return;

    errorMessage = "";
    messages = [...messages, createMessage("user", text)];
    draft = "";
    isSending = true;

    try {
      const response = await sendMessageToApiMock(text);
      messages = [...messages, createMessage("assistant", response.reply)];
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Could not send message.";
    } finally {
      isSending = false;
    }
  }

  $effect(() => {
    messages.length;

    tick().then(() => {
      if (threadRef) {
        threadRef.scrollTop = threadRef.scrollHeight;
      }
    });
  });
</script>

<header
  class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
  <div class="flex items-center gap-2 px-4">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item class="hidden md:block">
          <Breadcrumb.Link href="##">City of York Council</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator class="hidden md:block" />
        <Breadcrumb.Item>
          <Breadcrumb.Page>AI Agent</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  </div>
</header>
<div class="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
  <div class="mx-auto flex h-[calc(100dvh-8.5rem)] w-full max-w-4xl flex-col rounded-2xl border bg-card shadow-sm">
    <div class="border-b px-4 py-3">
      <h1 class="text-sm font-semibold tracking-tight">York AI Chat</h1>
      <p class="text-muted-foreground text-xs">Type `/fail` to test the mock API error path.</p>
    </div>

    <div bind:this={threadRef} class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {#each messages as message (message.id)}
        <div class={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            class={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs md:max-w-[75%] ${message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"}`}
          >
            <p class="whitespace-pre-wrap leading-relaxed">{message.text}</p>
            <p
              class={`mt-1 text-[11px] ${message.role === "user"
                ? "text-primary-foreground/80"
                : "text-muted-foreground"}`}
            >
              {formatTimestamp(message.createdAt)}
            </p>
          </div>
        </div>
      {/each}

      {#if isSending}
        <div class="flex justify-start">
          <div class="bg-muted/70 w-52 rounded-2xl p-3">
            <Skeleton class="mb-2 h-3 w-20" />
            <Skeleton class="mb-2 h-3 w-full" />
            <Skeleton class="h-3 w-4/5" />
          </div>
        </div>
      {/if}
    </div>

    <form
      class="border-t px-4 py-3"
      onsubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div class="flex items-center gap-2">
        <Input
          bind:value={draft}
          placeholder="Message York assistant..."
          disabled={isSending}
          aria-label="Chat message"
        />
        <Button type="submit" disabled={isSending || !draft.trim()}>
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
      {#if errorMessage}
        <p class="text-destructive mt-2 text-xs">{errorMessage}</p>
      {/if}
    </form>
  </div>
</div>
