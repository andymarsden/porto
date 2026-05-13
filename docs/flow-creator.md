# Flow Creator

This document explains the new Flow Creator feature and exactly which files were changed to add it.

## Files changed (most important)

### 1) `src/lib/flows/store.js` (new)

Purpose: Session-memory flow registry for user-created flows.

What it does:

- Stores created flows in a module-level `Map` (`createdFlowRegistry`).
- Normalizes flow ids to kebab-case-safe values.
- Validates required structure:
  - Flow id is required.
  - At least one step is required.
  - Each step must include a non-empty `question`.
- Normalizes steps to generated ids (`step-1`, `step-2`, ...).
- Exposes CRUD APIs:
  - `listCreatedFlows()`
  - `getCreatedFlow(id)`
  - `createFlow(flow)`
  - `updateFlow(flow)`
  - `removeFlow(id)`

Notes:

- This storage is intentionally in-memory only.
- Data resets on browser refresh / app reload.

### 2) `src/lib/flows/engine.js` (updated)

Purpose: Allow `startFlow(...)` to load either built-in flows or session-created flows.

What changed:

- Existing static registry was renamed to built-in registry semantics.
- Added `getFlowById(id)` helper.
- `startFlow(id)` now resolves from:
  1. Built-in flow registry.
  2. Runtime flow store (`getCreatedFlow(id)`).

Impact:

- No changes to step progression logic were required.
- Existing built-in flows still work as before.
- Runtime-created flows now run through the same engine path.

### 3) `src/lib/intent/resolve_intent.js` (updated)

Purpose: Start created flows from chat commands without hardcoding each new flow.

What changed:

- Added `startFlowById(flowId)` helper.
- Added new command entry:
  - `prefix: "run-flow"`
  - `aliases: ["flow"]`
- Usage:
  - `/run-flow my-flow-id`
  - `/flow my-flow-id`

Behavior:

- Validates that a flow id argument is provided.
- Starts flow via `startFlow(flowId)`.
- Returns first step question and options in the same response shape used by existing chat flow handling.

### 4) `src/routes/(app)/flow-creator/+page.svelte` (new)

Purpose: UI route for creating, editing, listing, and deleting runtime flows.

What it includes:

- A route at `/flow-creator`.
- Left panel: list of created session flows.
- Right panel: editor form for flow id and step definitions.
- Step editing supports:
  - Required `question`.
  - Optional `options` input (comma-separated or newline-separated).
- Controls:
  - Create flow.
  - Update existing flow.
  - Delete selected flow.
  - Reset to new flow draft.
- Inline guidance on how to run selected flows in chat using `/run-flow <id>`.

State model:

- Uses Svelte runes state (`$state`) for local UI state.
- Reads/writes through `src/lib/flows/store.js` only.

### 5) `src/lib/components/app-sidebar.svelte` (updated)

Purpose: Add discoverability for the Flow Creator route.

What changed:

- Added a `Flow Creator` item under existing playground navigation.
- Link points to `/flow-creator`.

## How it works end-to-end

1. User opens `/flow-creator`.
2. User creates a flow with id + steps.
3. Route saves flow to in-memory runtime registry (`store.js`).
4. User opens sandbox chat and runs `/run-flow <flow-id>`.
5. Intent resolver calls `startFlow(flowId)`.
6. Flow engine resolves created flow from runtime registry.
7. Chat continues through existing `activeFlow` and `saveFlowAnswer(...)` path.
8. On browser refresh, created flows disappear (expected for current MVP).

## Runtime command examples

- `/run-flow intake-check`
- `/flow intake-check`

If a flow id does not exist, the assistant returns an unavailable-flow message.
If no id is provided, the assistant returns a command usage message.

## Design constraints in this MVP

- Session-memory only (no localStorage, no backend).
- Generic run command for dynamic flows (`run-flow`) instead of creating hardcoded slash commands per flow.
- Step schema currently supports only:
  - required `question`
  - optional `options`

## Validation and build status

Implementation was validated with project build.

- `npm run build` succeeded.
- `npm test` reports no test files in this repository (not a Flow Creator failure).
