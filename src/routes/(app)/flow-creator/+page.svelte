<script>
    import {
        createFlow,
        getCreatedFlow,
        listCreatedFlows,
        removeFlow,
        updateFlow
    } from "$lib/flows/store";

    let flowId = $state("");
    let stepDrafts = $state([{ question: "", optionsText: "" }]);
    let selectedFlowId = $state(null);
    let flows = $state([]);
    let errorMessage = $state("");
    let successMessage = $state("");

    function refreshFlows() {
        flows = listCreatedFlows();
    }

    function normalizeFlowId(value) {
        return String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function resetEditor() {
        selectedFlowId = null;
        flowId = "";
        stepDrafts = [{ question: "", optionsText: "" }];
        errorMessage = "";
        successMessage = "";
    }

    function loadFlowForEditing(id) {
        const flow = getCreatedFlow(id);
        if (!flow) return;

        selectedFlowId = flow.id;
        flowId = flow.id;
        stepDrafts = flow.steps.map((step) => ({
            question: step.question,
            optionsText: Array.isArray(step.options) ? step.options.join("\n") : ""
        }));
        errorMessage = "";
        successMessage = "";
    }

    function addStep() {
        stepDrafts = [...stepDrafts, { question: "", optionsText: "" }];
    }

    function removeStep(index) {
        if (stepDrafts.length <= 1) return;
        stepDrafts = stepDrafts.filter((_, currentIndex) => currentIndex !== index);
    }

    function updateStepQuestion(index, value) {
        stepDrafts = stepDrafts.map((step, currentIndex) =>
            currentIndex === index ? { ...step, question: value } : step
        );
    }

    function updateStepOptions(index, value) {
        stepDrafts = stepDrafts.map((step, currentIndex) =>
            currentIndex === index ? { ...step, optionsText: value } : step
        );
    }

    function parseOptions(text) {
        return String(text ?? "")
            .split(/[\n,]/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function buildFlowPayload() {
        const normalizedId = normalizeFlowId(flowId);

        const steps = stepDrafts.map((step) => {
            const options = parseOptions(step.optionsText);
            const nextStep = {
                question: String(step.question ?? "").trim()
            };

            if (options.length > 0) {
                nextStep.options = options;
            }

            return nextStep;
        });

        return {
            id: normalizedId,
            steps
        };
    }

    function saveFlowDraft(event) {
        event.preventDefault();
        errorMessage = "";
        successMessage = "";

        try {
            const payload = buildFlowPayload();

            if (selectedFlowId) {
                updateFlow({ ...payload, id: selectedFlowId });
                successMessage = `Updated flow \"${selectedFlowId}\".`;
            } else {
                createFlow(payload);
                successMessage = `Created flow \"${payload.id}\".`;
                selectedFlowId = payload.id;
                flowId = payload.id;
            }

            refreshFlows();
        } catch (error) {
            errorMessage = error?.message ?? "Could not save the flow.";
        }
    }

    function deleteSelectedFlow() {
        if (!selectedFlowId) return;

        removeFlow(selectedFlowId);
        refreshFlows();
        resetEditor();
    }

    refreshFlows();
</script>

<section class="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
    <header class="space-y-2">
        <h1 class="text-3xl font-semibold tracking-tight">Flow Creator</h1>
        <p class="text-sm text-muted-foreground">
            Create flow definitions for this browser session. Start them in chat with
            <code>/run-flow flow-id</code>.
        </p>
    </header>

    <div class="grid gap-6 md:grid-cols-[320px_1fr]">
        <aside class="rounded-lg border bg-card p-4">
            <div class="mb-4 flex items-center justify-between">
                <h2 class="text-lg font-medium">Session Flows</h2>
                <button
                    type="button"
                    class="rounded-md border px-2 py-1 text-sm"
                    onclick={resetEditor}
                >
                    New
                </button>
            </div>

            {#if flows.length === 0}
                <p class="text-sm text-muted-foreground">No flows created yet.</p>
            {:else}
                <ul class="space-y-2">
                    {#each flows as flow}
                        <li>
                            <button
                                type="button"
                                class={`w-full rounded-md border px-3 py-2 text-left text-sm ${selectedFlowId === flow.id ? "border-primary" : ""}`}
                                onclick={() => loadFlowForEditing(flow.id)}
                            >
                                <div class="font-medium">{flow.id}</div>
                                <div class="text-xs text-muted-foreground">
                                    {flow.steps.length} step{flow.steps.length === 1 ? "" : "s"}
                                </div>
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}
        </aside>

        <section class="rounded-lg border bg-card p-4 md:p-6">
            <form class="space-y-6" onsubmit={saveFlowDraft}>
                <div class="space-y-2">
                    <label class="block text-sm font-medium" for="flow-id">Flow id</label>
                    <input
                        id="flow-id"
                        class="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        placeholder="example-intake"
                        bind:value={flowId}
                        disabled={Boolean(selectedFlowId)}
                    />
                    <p class="text-xs text-muted-foreground">
                        Lowercase kebab-case is recommended. Flow id is locked while editing.
                    </p>
                </div>

                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-medium">Steps</h2>
                        <button
                            type="button"
                            class="rounded-md border px-2 py-1 text-sm"
                            onclick={addStep}
                        >
                            Add step
                        </button>
                    </div>

                    {#each stepDrafts as step, index}
                        <article class="space-y-3 rounded-md border p-3">
                            <div class="text-sm font-medium">Step {index + 1}</div>

                            <div class="space-y-2">
                                <label class="block text-sm" for={`question-${index}`}>Question</label>
                                <textarea
                                    id={`question-${index}`}
                                    class="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    placeholder="Ask your question here"
                                    value={step.question}
                                    oninput={(event) => updateStepQuestion(index, event.currentTarget.value)}
                                ></textarea>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm" for={`options-${index}`}>
                                    Options (optional)
                                </label>
                                <textarea
                                    id={`options-${index}`}
                                    class="min-h-16 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    placeholder="One option per line, or comma-separated"
                                    value={step.optionsText}
                                    oninput={(event) => updateStepOptions(index, event.currentTarget.value)}
                                ></textarea>
                            </div>

                            <div class="flex justify-end">
                                <button
                                    type="button"
                                    class="rounded-md border px-2 py-1 text-sm"
                                    onclick={() => removeStep(index)}
                                    disabled={stepDrafts.length <= 1}
                                >
                                    Remove step
                                </button>
                            </div>
                        </article>
                    {/each}
                </div>

                {#if errorMessage}
                    <p class="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                        {errorMessage}
                    </p>
                {/if}

                {#if successMessage}
                    <p class="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                        {successMessage}
                    </p>
                {/if}

                <div class="flex flex-wrap gap-2">
                    <button type="submit" class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
                        {selectedFlowId ? "Update flow" : "Create flow"}
                    </button>

                    {#if selectedFlowId}
                        <button
                            type="button"
                            class="rounded-md border px-4 py-2 text-sm"
                            onclick={deleteSelectedFlow}
                        >
                            Delete flow
                        </button>
                    {/if}
                </div>

                {#if selectedFlowId}
                    <p class="text-sm text-muted-foreground">
                        Run this flow in chat with <code>/run-flow {selectedFlowId}</code>.
                    </p>
                {/if}
            </form>
        </section>
    </div>
</section>
