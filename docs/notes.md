# Notes Prototype

This document describes the prototype notes feature driven by the `/n` command in sandbox chat.

## Scope

Current scope is intentionally small:

- Notes are stored in-memory only.
- Notes are created from chat input.
- No note list UI is rendered yet.
- Notes are lost on page refresh.

## Command behavior

`/n` has two modes:

- Immediate save: `/n <text>`
- Capture mode: `/n` with no text

### Immediate save

When the user sends `/n buy milk`:

1. Command is resolved by chat command services.
2. Notes service saves `buy milk` into in-memory storage.
3. Assistant confirms save with a short preview.

### Capture mode

When the user sends `/n` with no text:

1. Assistant asks for note content in the next message.
2. The page sets `awaitingNoteContent = true`.
3. Next non-command message is saved as the note content.
4. Assistant confirms save with a short preview.
5. Capture mode is cleared.

If the next message while waiting starts with `/`, capture mode is canceled and the new command is processed.

## Architecture

Main files:

- `src/lib/services/notes.js`
- `src/lib/services/intents.js`
- `src/lib/services/chat.js`
- `src/routes/(app)/sandbox/chat/+page.svelte`

### notes.js

Notes service provides prototype storage and helper utilities:

- `createNote(content)`
- `listNotes()`
- `getNotesCount()`
- `normalizeNoteContent(content)`
- `buildNotePreview(content)`

Storage is a module-level array, which keeps implementation simple for prototyping.

### intents.js

The `/n` intent decides whether to:

- save immediately (when args exist), or
- set capture mode via `stateUpdates.awaitingNoteContent = true` (when args are empty).

### chat.js

`handleCommand(...)` returns a structured command result and passes state updates through to the page. This keeps command orchestration out of UI rendering code.

### page send flow

The chat page applies state updates and handles the one-message capture branch:

- if waiting for note content and message is non-command, save note now
- if waiting and message is command, cancel waiting and execute command

## Data shape

Prototype note object:

```js
{
  id: string,
  content: string,
  createdAt: string
}
```

## Current limitations

- No persistence across refreshes.
- No edit/delete UI.
- No note browsing UI.
- No deduplication or tagging.

## Extension roadmap

Suggested next steps:

1. Add a storage adapter interface (`memory`, `sessionStorage`, `localStorage`, API).
2. Add list/read/update/delete service APIs with validation.
3. Add a notes panel UI (for example using the existing Sheet component).
4. Add note metadata (`title`, `updatedAt`, `tags`).
5. Add tests for `/n` immediate and capture flows.

By keeping note storage and note transforms in services, these upgrades can happen without large chat page rewrites.
