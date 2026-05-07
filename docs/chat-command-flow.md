# Chat Command Flow

This document describes the current command architecture for the sandbox chat page and how command handling is separated from UI code.

## Goals

- Keep page code focused on UI events and rendering.
- Keep command business logic in service code.
- Use one structured result shape so command handling is predictable and easy to extend.

## Where logic lives

- `src/routes/(app)/sandbox/chat/+page.svelte`
- `src/lib/services/chat.js`
- `src/lib/services/intents.js`
- `src/lib/services/commands.js`

Responsibilities:

- Chat page:
  - Handles submit, keyboard events, focus, loading state, and scroll behavior.
  - Calls `handleCommand(...)` first.
  - Applies `messages` and `stateUpdates` from the command result.
  - Falls back to placeholder + `requestAssistantResponse(...)` when command is not handled.
- chat.js:
  - Creates message objects and conversation IDs.
  - Runs command orchestration in `handleCommand(...)`.
  - Returns fallback mock assistant response in `requestAssistantResponse(...)`.
- intents.js:
  - Defines command intent behavior and returns command response text.
- commands.js:
  - Source of truth for slash command registry, aliases, parsing, and matching.

## Structured command contract

`handleCommand(userText, { isDebug })` returns:

- `handled` (boolean)
- `messages` (message array)
- `stateUpdates` (object)
- `debugMeta` (object or null)

Typical use:

- If `handled` is true:
  - append returned `messages`
  - apply `stateUpdates`
  - skip fallback response
- If `handled` is false:
  - continue normal non-command flow

## Debug command behavior

For `/db` and `/debug`:

- Command is resolved via command + intent services.
- `handleCommand(...)` toggles the next `isDebug` value.
- Service returns:
  - user command message
  - assistant confirmation message (`Debugging turned on` or `Debugging turned off`)
  - `stateUpdates.isDebug`

The page applies `stateUpdates.isDebug` and updates the debug banner visibility.

## Non-command behavior

When input is not a command:

1. Page appends user + `Thinking...` placeholder.
2. Page calls `requestAssistantResponse(...)`.
3. Fallback mock response replaces the placeholder.

Important: command intent resolution is not re-run in `requestAssistantResponse(...)`.

## Why this split

- Fewer command branches in the page component.
- Easier to add stateful commands without touching UI orchestration.
- Better testability because command decisions are centralized in service code.
- Clearer migration path to real backend command and chat APIs.

## Extending commands safely

1. Add command metadata in `commands.js`.
2. Add intent response behavior in `intents.js`.
3. If state changes are needed (like a toggle), map those in `handleCommand(...)` via `stateUpdates`.
4. Keep page logic generic: consume result contract, do not add command-specific branches.
