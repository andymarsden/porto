# Porto Flow Process (Current)

This document explains how the current flow system works in the Porto sandbox chat page.

## Scope

The flow runtime currently lives in:

- `src/routes/(app)/sandbox/porto/+page.svelte`
- `src/lib/intent/resolve_intent.js`
- `src/lib/flows/engine.js`
- `src/lib/flows/persistence.js`
- `src/lib/flows/basicDetails.js`
- `src/lib/flows/food.js`
- `src/lib/commands/execute.js`
- `src/lib/commands/index.js`
- `src/lib/commands/basic-details.js`
- `src/lib/commands/food.js`

## High-level lifecycle

1. User submits text in the Porto chat page.
2. If a flow is already active, the text is treated as the answer to the current step.
3. If no flow is active, input is sent to the intent resolver.
4. Intent resolver may start a flow (`/onboard`, `/food`) or run non-flow commands (`/echo`, `/flow-list`).
5. While a flow is active, the engine advances steps and collects answers.
6. When all steps are complete, answers are persisted via the flow persistence layer.

## Runtime path in detail

### 1) Submit and route the message

`processMessage` in `src/routes/(app)/sandbox/porto/+page.svelte` drives the process:

- Trims the input text.
- Waits briefly (`wait(700)`) to simulate latency.
- Branches by whether `activeFlow` exists.

### 2) Active flow path (answer mode)

When `activeFlow` is set:

- Calls `saveFlowAnswer(activeFlow, text)` from `src/lib/flows/engine.js`.
- Replaces `activeFlow` with the returned `result.activeFlow`.
- If `result.isComplete` is true:
  - Calls `persistCompletedFlow(activeFlow.id, result.answers)`.
  - Clears `activeFlow`.
  - Returns a final assistant message including saved answers.
- If not complete:
  - Returns `result.nextStep.question`.

### 3) No active flow path (intent mode)

When no flow is active:

- Calls `resolveIntent(text)` from `src/lib/intent/resolve_intent.js`.
- If `resolveIntent` returns an `activeFlow`, page state stores it.
- Returns `intentResponse.text` as assistant output.

## Intent resolution behavior

`resolveIntent` currently supports:

- `/onboard`
  - Starts flow id `basic-details` via `startFlow("basic-details")`.
  - Returns the first question.
- `/food`
  - Starts flow id `favorite-food` via `startFlow("favorite-food")`.
  - Returns the first question.
- `/echo ...`
  - Runs `commands.debug.echo(...)`.
- `/flow-list`
  - Returns latest saved basic-details payload via `commands.basicDetails.getLastSavedFlow()`.
- `/n` (placeholder)
  - Returns a not-wired message.
- Unknown command
  - Returns fallback help text.

Return shape from `resolveIntent`:

```js
{
  text: string,
  activeFlow: object | null
}
```

## Flow engine behavior

`src/lib/flows/engine.js` provides three core functions.

### `startFlow(id)`

- Looks up flow metadata from `flowRegistry`.
- Reads first step.
- If first step has `setup_command`, executes it with:

```js
executeCommand(firstStep.setup_command, { id })
```

- Returns runtime flow state:

```js
{
  id,
  currentStep: 0,
  answers: {},
  flow
}
```

### `getCurrentFlowStep(activeFlow)`

- Returns `activeFlow.flow.steps[activeFlow.currentStep]`.
- Returns `null` if flow or steps are missing.

### `saveFlowAnswer(activeFlow, answer)`

- Gets current step.
- If no current step, returns complete immediately.
- If current step has `command`, executes:

```js
executeCommand(currentStep.command, {
  answer,
  stepId: currentStep.id,
  answers: activeFlow.answers
})
```

- Saves answer into `answers[currentStep.id]` as trimmed string.
- Increments `currentStep`.
- Returns:

```js
{
  activeFlow: nextFlow,
  nextStep,
  isComplete,
  answers
}
```

## Command execution path

`src/lib/commands/execute.js` resolves command strings of form `group.action`:

1. Split path by `.`.
2. Resolve handler from `commands[group][action]` (`src/lib/commands/index.js`).
3. Throw error if missing.
4. Invoke handler with payload.

## Persistence behavior

`src/lib/flows/persistence.js` maps flow ids to save handlers:

- `basic-details` -> `commands.basicDetails.saveFlow`
- `favorite-food` -> `commands.food.saveFlow`

`persistCompletedFlow(flowId, answers)`:

- Finds the handler by flow id.
- Logs warning and returns `null` if missing.
- Calls `saveFlow({ answers })` when found.

Current save handlers (`basic-details.js`, `food.js`) persist in-memory arrays and return:

```js
{
  ok: true,
  savedAt,
  answers
}
```

## Built-in flow definitions

### `basic-details` flow

From `src/lib/flows/basicDetails.js`:

- Step `name`: asks for name.
- Step `age`: asks for age.
- No step commands.

### `favorite-food` flow

From `src/lib/flows/food.js`:

- Step `chineese-food`: asks favorite Chinese food, runs setup command `food.setup` before first question.
- Step `italian-food`: asks favorite Italian food, runs step command `food.check` when answered.

## Current implementation notes

- Flow start is command-driven (`/onboard`, `/food`) and not auto-detected from free text.
- Step answers are always stored as trimmed strings.
- Step command payload currently uses the pre-update `answers` object (does not include the current answer yet).
- There is a naming mismatch in food metadata:
  - Registry key and persistence id use `favorite-food`.
  - `foodFlow.id` is `food`.
  - Runtime works because the registry key (`favorite-food`) is used as the active flow id.

## Practical sequence example (`/food`)

1. User sends `/food`.
2. `resolveIntent` calls `startFlow("favorite-food")`.
3. `startFlow` runs `food.setup` (from first step `setup_command`).
4. Assistant asks first question.
5. User answers first question.
6. `saveFlowAnswer` stores answer and moves to second step.
7. Assistant asks second question.
8. User answers second question.
9. `saveFlowAnswer` runs `food.check`, stores second answer, marks flow complete.
10. Page calls `persistCompletedFlow("favorite-food", answers)`.
11. `commands.food.saveFlow` stores submission and page returns confirmation text.
