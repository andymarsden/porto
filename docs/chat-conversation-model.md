# Chat Conversation Model (MVP)

## Purpose

The chat sandbox now uses a single in-memory `conversation` object instead of a raw message array. This makes it easier to add persistence and multi-conversation support later.

## Current Model

The conversation shape is managed in `src/lib/services/chat/chat.js`.

```js
{
  id: string,
  createdAt: string,
  updatedAt: string,
  messages: [
    {
      id: string,
      role: "user" | "assistant",
      content: string,
      intent: string | null,
      createdAt: string
    }
  ]
}
```

Notes:
- `id` is generated client-side with `crypto.randomUUID()` when the page loads.
- The conversation resets on browser refresh in the current MVP.
- `updatedAt` changes whenever a new message pair is appended.

## Service API

Primary functions in `src/lib/services/chat/chat.js`:
- `createConversation()`
- `buildConversationUpdate(conversation, input)`
- `serializeConversation(conversation)`
- `deserializeConversation(serializedConversation)`

Intent routing still happens in `src/lib/services/chat/intent.js`.

## How To Add Local Persistence Later

Recommended place: `src/routes/(app)/sandbox/chat/+page.svelte`

1. On page init, try reading from `localStorage`.
2. Parse using `deserializeConversation(...)`.
3. If parse fails, fall back to `createConversation()`.
4. After each conversation update, save with `serializeConversation(...)`.

Suggested storage key:
- `porto:sandbox:chat:conversation`

This keeps storage concerns in the route file and business logic in the service layer.
