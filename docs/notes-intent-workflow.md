# Notes Intent Workflow

## Overview

The `/n` command in the chat interface allows users to create notes inline. Note creation is handled by the chat intent layer and delegates to a dedicated note service. The optional title follow-up flow is now implemented using conversation pending actions.

## Command Syntax

```
/n <note text>
```

Examples:

```
/n buy milk
/n follow up with the team on Friday
```

The `/n` token can appear anywhere in the message, but the convention is to lead with it.

## Current Behavior

| Input | Outcome |
|---|---|
| `/n buy milk` | Note created with content "buy milk" and no title; assistant asks whether to add a title |
| `/n` alone | No note created; assistant replies "Please provide note text after /n" |
| `<title text>` after note prompt | Title is added to the most recently prompted note and assistant confirms |
| `/skip` after note prompt | Title step is skipped and assistant confirms |
| Any other text | Normal intent resolution (e.g. `/t` for timestamp, or echo fallback) |

## Note Model (MVP)

Notes are managed in `src/lib/services/chat/note.js`.

```js
{
  id: string,        // generated with crypto.randomUUID()
  title: string|null,
  content: string,   // extracted note body text after /n is stripped
  createdAt: string  // ISO timestamp
}
```

Notes are stored in an in-memory array. They reset on page refresh.

## Service API

`src/lib/services/chat/note.js` exports:

- `createNote(content)` — creates and stores a note; returns the note object.
- `addTitleToNote(noteId, title)` — sets a title on an existing note; returns updated note or null.
- `getNotes()` — returns a shallow copy of the current notes array.
- `extractNoteTextFromCommand(input)` — strips `/n` tokens from the input string and trims the result.
- `serializeNotes()` — serializes current notes array to JSON.
- `loadNotes(rawJson)` — replaces in-memory notes from JSON when valid.

## Intent Integration

The `create-note` handler in `src/lib/services/chat/intent.js` owns the note command flow:

1. Match: `containsSlashN(text)` from `string-check.js`
2. Extract body text via `extractNoteTextFromCommand(text)`
3. If body is empty: reply with prompt asking for note text, do not create
4. If body is non-empty: call `createNote(noteText)` and return both:
- assistant content asking for optional title
- `pendingAction: { type: "note-title-prompt", noteId }`

`resolveAssistantReply(...)` returns a normalized object for all intents:

```js
{
  intent: string,
  content: string,
  pendingAction: object|null
}
```

## Conversation Pending Action (Implemented)

The chat conversation model now includes a pending action state for multi-step flows:

### Proposed conversation extension

Add a `pendingAction` field to the conversation model:

```js
{
  id: ...,
  messages: [...],
  pendingAction: {
    type: "note-title-prompt",
    noteId: "<id of the created note>"
  } | null
}
```

### Suggested flow

1. User sends `/n buy milk`
2. Note is created; reply is "Note created. Would you like to add a title? Reply with your title or /skip"
3. `pendingAction` is set to `{ type: "note-title-prompt", noteId: "<id>" }` on the conversation
4. On next user message, the chat service checks `conversation.pendingAction` before running intent resolution
5. If pending action is active: pass the user's text as the title for that note (or skip if `/skip`)
6. Clear `pendingAction` after handling

This keeps the multi-step flow entirely in the service layer without adding UI state or components.

Current implementation lives in `src/lib/services/chat/chat.js`:

- `createConversation()` initializes `pendingAction: null`
- `buildConversationUpdate(...)` resolves pending actions before normal intent matching
- `resolvePendingAction(...)` handles:
  - title application via `addTitleToNote(...)`
  - `/skip` command
  - assistant confirmation messages

## Adding Persistence

Notes currently live in memory only. To persist them:

1. After `createNote(...)`, call `localStorage.setItem('porto:notes', JSON.stringify(getNotes()))`
2. On app load, read and restore notes to the in-memory array in `note.js`
3. Reuse existing `loadNotes(rawJson)` and `serializeNotes()` helpers in the note service as the integration seam

## Recommended Next Extensions

1. Add note `updatedAt` for title edits and future note editing.
2. Store `conversation` and `notes` separately with explicit storage keys.
3. Add validation constraints for title length/content in `addTitleToNote(...)`.
4. Support explicit command form for title, such as `/title <text>`, while pending action is active.
