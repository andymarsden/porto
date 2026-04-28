<script>
  import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
  import { tick } from "svelte";
  import { sendMessageToApi } from "$lib/services/chat-service.js";
  import potholeQuestions from "$lib/data/pothole-questions.json";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
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
      text: "Hello. I am your CYC AI assistant. Ask me anything and I will do my best to help you.",
      sources: [],
      classification: "",
      createdAt: Date.now(),
    },
  ]);

  let potholeFlow = $state({
    active: false,
    currentQuestionIndex: -1,
    answers: {},
  });

  function createMessage(
    role,
    text,
    {
      sources = [],
      classification = "",
      question = null,
    } = {},
  ) {
    return {
      id: crypto.randomUUID(),
      role,
      text,
      sources,
      classification,
      question,
      createdAt: Date.now(),
    };
  }

  function getCurrentPotholeQuestion() {
    return potholeQuestions[potholeFlow.currentQuestionIndex] ?? null;
  }

  function normalizeSingleChoiceAnswer(question, answer) {
    const normalized = answer.trim().toLowerCase();
    return question.options.find((option) => {
      return (
        option.key.toLowerCase() === normalized ||
        option.label.toLowerCase() === normalized
      );
    }) ?? null;
  }

  function pushPotholeQuestion(index) {
    const question = potholeQuestions[index];
    if (!question) return;

    const prompt = question.type === "single_choice"
      ? `${question.prompt}\n${question.options
        .map((option) => `[${option.key}] ${option.label}`)
        .join("\n")}`
      : question.prompt;

    messages = [
      ...messages,
      createMessage("assistant", prompt, { question }),
    ];
  }

  function startPotholeFlow() {
    if (!Array.isArray(potholeQuestions) || potholeQuestions.length === 0) {
      messages = [
        ...messages,
        createMessage("assistant", "Pothole report questions are unavailable right now. Please try again later."),
      ];
      return;
    }

    potholeFlow = {
      active: true,
      currentQuestionIndex: 0,
      answers: {},
    };

    messages = [
      ...messages,
      createMessage("assistant", "Let's get your pothole report details. Please answer the questions below."),
    ];
    pushPotholeQuestion(0);
  }

  function formatPotholeSummary() {
    return potholeQuestions
      .map((question) => {
        const answer = potholeFlow.answers[question.id] ?? "Not provided";
        return `${question.prompt}\nAnswer: ${answer}`;
      })
      .join("\n\n");
  }

  async function completePotholeFlow() {
    const summary = formatPotholeSummary();

    messages = [
      ...messages,
      createMessage("assistant", "Thanks. I have captured your pothole report details and I am submitting them now."),
    ];

    potholeFlow = {
      active: false,
      currentQuestionIndex: -1,
      answers: potholeFlow.answers,
    };

    isSending = true;
    try {
      const response = await sendMessageToApi(`POTHOLE_REPORT\n\n${summary}`);
      messages = [
        ...messages,
        createMessage("assistant", response.reply, {
          sources: response.sources,
          classification: response.classification,
        }),
      ];
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Could not submit pothole report.";
    } finally {
      isSending = false;
    }
  }

  async function handlePotholeAnswer(answerText) {
    const question = getCurrentPotholeQuestion();
    if (!question) {
      potholeFlow = {
        active: false,
        currentQuestionIndex: -1,
        answers: {},
      };
      return;
    }

    if (question.type === "single_choice") {
      const matched = normalizeSingleChoiceAnswer(question, answerText);
      if (!matched) {
        messages = [
          ...messages,
          createMessage(
            "assistant",
            `Please choose one of: ${question.options.map((option) => `[${option.key}] ${option.label}`).join(", ")}.`,
          ),
        ];
        return;
      }

      potholeFlow = {
        ...potholeFlow,
        answers: {
          ...potholeFlow.answers,
          [question.id]: matched.label,
        },
      };
    } else {
      potholeFlow = {
        ...potholeFlow,
        answers: {
          ...potholeFlow.answers,
          [question.id]: answerText,
        },
      };
    }

    const nextQuestionIndex = potholeFlow.currentQuestionIndex + 1;
    if (nextQuestionIndex >= potholeQuestions.length) {
      await completePotholeFlow();
      return;
    }

    potholeFlow = {
      ...potholeFlow,
      currentQuestionIndex: nextQuestionIndex,
    };
    pushPotholeQuestion(nextQuestionIndex);
  }

  async function handleChoiceSelection(option) {
    if (isSending || !potholeFlow.active) return;

    const submittedValue = option.key.toLowerCase();
    messages = [...messages, createMessage("user", option.label)];
    await handlePotholeAnswer(submittedValue);
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
    let displayText = text;
    if (potholeFlow.active) {
      const currentQuestion = getCurrentPotholeQuestion();
      if (currentQuestion?.type === "single_choice") {
        const matched = normalizeSingleChoiceAnswer(currentQuestion, text);
        if (matched) {
          displayText = matched.label;
        }
      }
    }

    messages = [...messages, createMessage("user", displayText)];
    draft = "";

    if (potholeFlow.active) {
      await handlePotholeAnswer(text);
      return;
    }

    isSending = true;

    try {
      const response = await sendMessageToApi(text);
      messages = [
        ...messages,
        createMessage("assistant", response.reply, {
          sources: response.sources,
          classification: response.classification,
        }),
      ];
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
          <Breadcrumb.Link href="##">AI Search</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator class="hidden md:block" />
        <Breadcrumb.Item>
          <Breadcrumb.Page>Barnsley</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  </div>
</header>
<div class="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
  <div class="mx-auto flex h-[calc(100dvh-8.5rem)] w-full max-w-4xl flex-col rounded-2xl border bg-card shadow-sm">
    <div class="border-b px-4 py-3">
      <h1 class="text-sm font-semibold tracking-tight">AI Search</h1>
      <p class="text-muted-foreground text-xs">Responses are fetched from the AI Search webhook endpoint.</p>
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
            {#if message.role === "assistant" && message.sources?.length}
              <div class="mt-2 space-y-1">
                {#each message.sources as source}
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-muted-foreground hover:text-foreground block break-all text-xs underline underline-offset-2 transition-colors"
                  >
                    {source}
                  </a>
                {/each}
              </div>
            {/if}
            {#if message.role === "assistant" && message.classification === "POTHOLES" && !potholeFlow.active}
              <div class="mt-3">
                <Button type="button" size="sm" onclick={startPotholeFlow}>REPORT POTHOLE</Button>
              </div>
            {/if}
            {#if message.role === "assistant" && potholeFlow.active && message.question?.id === getCurrentPotholeQuestion()?.id && message.question.type === "single_choice"}
                <div class="mt-3 flex flex-col items-start gap-2">
                {#each message.question.options as option}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onclick={() => handleChoiceSelection(option)}
                    disabled={isSending}
                  >
                    [{option.key}] {option.label}
                  </Button>
                {/each}
              </div>
            {/if}
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
          <div
            class="bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm shadow-xs"
            role="status"
            aria-live="polite"
          >
            <LoaderCircleIcon class="size-4 animate-spin" aria-hidden="true" />
            <span>Waiting for response...</span>
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
          placeholder="AI Search..."
          disabled={isSending}
          aria-label="Chat message"
        />
        <Button type="submit" disabled={isSending || !draft.trim()}>
          {#if isSending}
            <LoaderCircleIcon class="size-4 animate-spin" aria-hidden="true" />
            Sending...
          {:else}
            Send
          {/if}
        </Button>
      </div>
      {#if errorMessage}
        <p class="text-destructive mt-2 text-xs">{errorMessage}</p>
      {/if}
    </form>
  </div>
</div>
