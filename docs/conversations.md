# Conversations

Each chat session is assigned a unique conversation ID when the page loads.

## Current behavior

- A new conversation ID is generated via `createConversation()` in `src/lib/services/chat.js` on every page mount.
- The ID is ephemeral: it exists only for the lifetime of the current page session and is lost on refresh.
- The ID is passed through to `requestAssistantResponse()` so it can be forwarded to a real API later to maintain server-side context.

## Resetting a conversation

To add a reset button that starts a new conversation mid-session without refreshing the page:

1. Call `createConversation()` to get a new ID and assign it to `conversationId`.
2. Reset `messages` to a fresh startup message via `getStartupMessage()`.

Example:

```js
function resetConversation() {
    conversationId = createConversation().id;
    messages = [getStartupMessage()];
}
```

Wire this to a button in the chat UI wherever it makes sense (e.g. in the header or as a `/clear` command intent).

## Extending to persistent conversations

When backend storage is ready, the following changes are needed:

1. **On new conversation** — `POST /conversations` with the conversation object, store the returned ID.
2. **On each message send** — include `conversationId` in the API request body so messages are associated server-side.
3. **On page load** — optionally `GET /conversations/:id` to resume a previous session rather than starting fresh.
4. **Conversation list** — `GET /conversations` to retrieve a user's saved conversation history for a sidebar or history view.

The `createConversation()` helper in `src/lib/services/chat.js` is the right place to add the API call in step 1, keeping the page component unaware of persistence details.
