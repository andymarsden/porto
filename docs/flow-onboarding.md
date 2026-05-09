# Flow Onboarding Guide

This guide walks through all the steps needed to bring a new flow into Porto.

## Overview

A flow is a multi-step interactive sequence that collects user answers, runs optional command hooks at each step, and persists the collected data. The main components are:

1. **Flow Definition** — steps, questions, and command wiring
2. **Command Handlers** — business logic for setup, validation, and persistence
3. **Intent Mapping** — user command routing (e.g., `/flow-name`)
4. **Persistence Mapping** — how to save completed flow answers

## Step-by-Step Onboarding

### 1. Create Flow Definition

Create a new file in `src/lib/flows/` named after your flow (e.g., `src/lib/flows/myFlow.js`):

```javascript
export const myFlow = {
    id: "my-flow",  // kebab-case, matches registry key and intent routing

    steps: [
        {
            id: "step-one",
            question: "What is your first answer?",
            setupCommand: "myFlow.setup"  // optional, runs at flow start
        },
        {
            id: "step-two",
            question: "What is your second answer?",
            command: "myFlow.check"  // optional, runs after user input
        }
    ]
};
```

**Naming conventions:**
- Flow definition export: `camelCase` (e.g., `myFlow`)
- Flow id field: `kebab-case` (e.g., `"my-flow"`)
- Step ids: `kebab-case` (e.g., `"step-one"`)
- Command paths: `group.action` format (e.g., `"myFlow.setup"`)

### 2. Register Flow in Engine

Update `src/lib/flows/engine.js`:

```javascript
import { myFlow } from "./myFlow";

const flowRegistry = {
    "basic-details": basicDetailsFlow,
    "favorite-food": foodFlow,
    "my-flow": myFlow  // add your flow here
};
```

**Requirement:** The flow id key must match the flow definition's `id` field and will be used for intent routing.

### 3. Create Command Handlers

Create a new command module in `src/lib/commands/` (e.g., `src/lib/commands/my-flow.js`):

```javascript
import { generateId } from "$lib/utils.js";

const FLOW_SUBMISSIONS = [];

export const myFlowCommands = {
    // Required: Runs at flow start (if step has setupCommand)
    async setup(payload) {
        console.info("[myFlow.setup] Payload:", payload);
        // payload: { id: "my-flow", stepId: "step-one", answers: {} }
        
        // Optional: fetch data, validate prerequisites, etc.
        return {
            ok: true,
            message: "Setup complete."
        };
    },

    // Optional: Runs after each step answer (if step has command)
    async check(payload) {
        console.info("[myFlow.check] Payload:", payload);
        // payload: { answer: "user input", stepId: "step-two", answers: { "step-one": "...", "step-two": "..." } }
        
        // Optional: validate answer, fetch derived data, etc.
        return {
            ok: true,
            message: "Answer validated."
        };
    },

    // Required: Runs when flow completes
    async saveFlow({ answers }) {
        const submission = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            answers: { ...(answers ?? {}) }
        };

        FLOW_SUBMISSIONS.push(submission);

        console.log("[myFlow.saveFlow]", submission);

        return {
            ok: true,
            savedAt: submission.createdAt,
            answers: submission.answers
        };
    },

    // Optional: Retrieve last saved flow (for demo/testing)
    async getLastSavedFlow() {
        return FLOW_SUBMISSIONS[FLOW_SUBMISSIONS.length - 1] ?? null;
    }
};
```

**Key points:**
- `setup(payload)` is called at flow start if the first step has `setupCommand`.
- `check(payload)` is called after each step if that step has `command`.
- `saveFlow({ answers })` is called when the flow completes (required).
- All commands should return an object or reject with an error; errors are caught and logged without breaking the flow.
- Command payload includes `answers`, which is a merged object of all answers collected so far (including current input).

### 4. Register Commands

Update `src/lib/commands/index.js`:

```javascript
import { debugCommands } from "./debug";
import { basicDetailsCommands } from "./basic-details";
import { foodCommands } from "./food";
import { myFlowCommands } from "./my-flow";

export const commands = {
    debug: debugCommands,
    basicDetails: basicDetailsCommands,
    food: foodCommands,
    myFlow: myFlowCommands  // add your commands here
};
```

**Requirement:** The key (e.g., `myFlow`) must match the first part of your command paths (e.g., `"myFlow.setup"`).

### 5. Add Intent Routing

Update `src/lib/intent/resolve_intent.js` to map user commands to your flow:

```javascript
if(text === "/my-flow") {  
    console.log("Starting my flow...");
    const activeFlow = await startFlow("my-flow");  // must match flow id

    if (!activeFlow) {
        return createIntentResponse("That flow is unavailable right now.");
    }

    return createIntentResponse(activeFlow.flow.steps[0].question, activeFlow);
}
```

**Requirement:** The flow id passed to `startFlow()` must match your flow definition's `id` field.

### 6. Add Persistence Mapping

Update `src/lib/flows/persistence.js` to wire your commands' `saveFlow()` handler:

```javascript
const flowPersistenceHandlers = {
    "basic-details": commands.basicDetails,
    "favorite-food": commands.food,
    "my-flow": commands.myFlow  // add your flow here
};
```

**Requirement:** The key must match your flow id, and the value must be an object with a `saveFlow()` function.

### 7. Test the Flow

#### Unit Tests

Add tests in `src/test/flow-engine.test.js` to verify command payload shapes and flow transitions:

```javascript
it('runs setup and check commands for my flow with merged answers', async () => {
    executeCommand.mockResolvedValue({ ok: true });

    const activeFlow = {
        id: 'my-flow',
        currentStep: 0,
        answers: {},
        flow: {
            steps: [
                { id: 'step-one', question: 'Q1?', setupCommand: 'myFlow.setup' },
                { id: 'step-two', question: 'Q2?', command: 'myFlow.check' }
            ]
        }
    };

    const result = await saveFlowAnswer(activeFlow, 'Answer One');

    expect(executeCommand).toHaveBeenCalledWith('myFlow.check', {
        answer: 'Answer One',
        stepId: 'step-one',
        answers: { 'step-one': 'Answer One' }
    });
});
```

#### Manual Testing

Test interactively in the sandbox at `src/routes/(app)/sandbox/porto/+page.svelte`:

1. Start dev server: `npm run dev`
2. Navigate to `/app/sandbox`
3. Type your intent command (e.g., `/my-flow`)
4. Complete each step of the flow
5. Verify the final summary displays all saved answers

### 8. Verification Checklist

Before merging, ensure:

- [ ] Flow definition file created with kebab-case id
- [ ] Flow registered in `flowRegistry` in `engine.js`
- [ ] Command handlers module created with `setup()`, `check()` (optional), and `saveFlow()`
- [ ] Commands registered in `commands/index.js`
- [ ] Intent routing added to `resolve_intent.js`
- [ ] Persistence handler mapped in `persistence.js`
- [ ] Unit tests added for command payload shapes
- [ ] Manual test completed: flow starts, progresses, and saves
- [ ] Run `npm run test` — all tests pass
- [ ] Lint check passes (no unused imports or syntax errors)

## Example: Adding a "Preferences" Flow

Here's a minimal complete example:

**1. Flow definition** (`src/lib/flows/preferences.js`):
```javascript
export const preferencesFlow = {
    id: "preferences",
    steps: [
        { id: "theme", question: "Prefer light or dark mode?" },
        { id: "notifications", question: "Enable notifications?" }
    ]
};
```

**2. Commands** (`src/lib/commands/preferences.js`):
```javascript
export const preferencesCommands = {
    async saveFlow({ answers }) {
        console.log("[preferences.saveFlow]", answers);
        return { ok: true, answers };
    }
};
```

**3. Engine registration** (`src/lib/flows/engine.js`):
```javascript
import { preferencesFlow } from "./preferences";
const flowRegistry = { ..., "preferences": preferencesFlow };
```

**4. Commands registration** (`src/lib/commands/index.js`):
```javascript
import { preferencesCommands } from "./preferences";
export const commands = { ..., preferences: preferencesCommands };
```

**5. Intent mapping** (`src/lib/intent/resolve_intent.js`):
```javascript
if(text === "/preferences") {
    const activeFlow = await startFlow("preferences");
    if (!activeFlow) return createIntentResponse("Flow unavailable.");
    return createIntentResponse(activeFlow.flow.steps[0].question, activeFlow);
}
```

**6. Persistence mapping** (`src/lib/flows/persistence.js`):
```javascript
const flowPersistenceHandlers = { ..., "preferences": commands.preferences };
```

Done! Test with `/preferences` in the sandbox.

## Common Pitfalls

1. **Id mismatch** — Flow id in definition, registry key, intent routing, and persistence mapping must all match (kebab-case).
2. **Command path mismatch** — Command path first segment must match the key in `commands/index.js`.
3. **Missing saveFlow()** — Flow won't complete cleanly without a `saveFlow()` handler.
4. **Unhandled command errors** — The engine catches and logs command failures, so test error paths manually to confirm graceful degradation.
5. **Unused commands** — If you don't wire a step's `command` or `setupCommand`, it won't be called; remove unused fields.

## Troubleshooting

**Flow doesn't start:**
- Check flow id matches registry key exactly (kebab-case)
- Confirm flow is imported and registered in `engine.js`

**Command doesn't run:**
- Verify step has `command` or `setupCommand` field
- Confirm command path is spelled correctly (group.action)
- Check commands are registered in `commands/index.js`

**Flow completes but answers don't save:**
- Ensure `saveFlow()` exists in command handlers
- Verify persistence handler is mapped in `persistence.js`
- Check console for warnings about missing handlers

**Tests fail:**
- Run isolated test: `npm run test -- src/test/flow-engine.test.js`
- Mock executeCommand and verify payload shape matches what handlers expect
