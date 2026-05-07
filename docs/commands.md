# Commands

The chat composer supports slash commands.

## How it works

- Type `/` in the chat input to open command suggestions.
- Keep typing to filter the command list (for example `/n`).
- Click a suggestion to insert it into the composer.
- Press Enter to submit the command.

There are two execution paths after submit:

- Service command path in `src/lib/services/chat.js` via `handleCommand(...)`.
- Fallback assistant path for non-command input in `requestAssistantResponse(...)`.

## Available commands

- `/n` - Create a note from command text, or enter capture mode when no text is provided.
- `/db` - Toggle local debug mode on/off.
- `/debug` - Alias for `/db`.
- `/help` - Return a list of commands.
- `/status` - Return a mock status response.
- `/clear` - Return a mock clear confirmation.

## Parsing and aliases

Command parsing lives in `src/lib/services/commands.js`.

- `parseSlashCommand(input)` trims input, checks for a `/` prefix, and splits command name plus args.
- `findCommand(input)` matches by primary command name and also by aliases.
- `getCommandSuggestions(input)` expands entries so aliases appear in the suggestion UI.

For debug, the canonical command entry is `db` with alias `debug`.
This means both `/db` and `/debug` match the same command and behavior.

## Debug mode behavior

Debug toggling is handled in `src/lib/services/chat.js` by `handleCommand(...)`.

When the submitted input matches `db` (or alias `debug`):

- The chat service returns a structured command result with `stateUpdates.isDebug`.
- The page applies `stateUpdates` and appends returned `messages`.
- The assistant confirmation text remains:
	- `Debugging turned on`
	- `Debugging turned off`

The page does not contain command-specific branches anymore.

When `isDebug` is true, the chat UI shows the current conversation id at the top of the message list.

## Note command behavior

For command responses (`/n`, `/help`, `/status`, `/clear`), `handleCommand(...)` calls `resolveIntentResponse(...)` in `src/lib/services/intents.js`.

For non-command messages, the page continues to fallback flow and calls `requestAssistantResponse(...)`, which now returns only the generic mock assistant response.

When you submit `/n` with content (for example `/n buy milk`):

- The note is saved to in-memory note storage.
- The assistant confirms with a preview, for example `Note saved: "buy milk"`.

When you submit `/n` with no content:

- The assistant asks for note content in your next message.
- The next non-command message is saved as the note content.
- If the next message is another slash command, pending note capture is canceled and the new command runs.

See `docs/notes.md` for full details and extension guidance.

## End-to-end flow

```mermaid
flowchart TD
		A[User types in chat textarea] --> B{Draft changes?}
		B -->|Yes| C[getCommandSuggestions(draft)]
		C --> D{Starts with slash / ?}
		D -->|No| E[No suggestions shown]
		D -->|Yes| F[Show filtered command list above textarea]
		F --> G[User clicks suggestion]
		G --> H[applyCommandSuggestion sets draft to slash command]

		A --> I{User submits Enter or Send}
		I -->|If loading| J[Abort send]
		I -->|If empty after trim| K[Abort send]
		I -->|Valid content| L[handleCommand content and isDebug]

		L --> M{Handled?}
		M -->|Yes| N[Append command messages and apply stateUpdates]
		N --> O{isDebug true?}
		O -->|Yes| P[Show Conversation ID banner]
		O -->|No| Q[Hide Conversation ID banner]

		M -->|No| R[addUserAndThinkingMessages]
		R --> S[Append user message + Thinking... assistant placeholder]
		S --> T[requestAssistantResponse fallback mock response]
		T --> U[replaceMessageContent Thinking... with response]
		U --> AF[isLoading false + scrollToBottom + refocus textarea]

		subgraph Error Path
			T -->|exception| ERR[replace Thinking... with error message]
			ERR --> AF
		end
```

## Command result contract

`handleCommand(...)` returns a consistent object shape:

- `handled` — boolean indicating whether the input was consumed as a command.
- `messages` — array of message objects to append to the chat list.
- `stateUpdates` — mutable state patches for the page (currently `isDebug` and `awaitingNoteContent`).
- `debugMeta` — optional diagnostics (`commandName`, `args`, `resolvedAtMs`).

When `handled` is `false`, the page continues the standard assistant fallback path.

## Extending commands

Edit the command service at `src/lib/services/commands.js` and intent service at `src/lib/services/intents.js`.

- Add a command entry to `COMMANDS`.
- Optionally add aliases with `aliases: ["alias-name"]`.
- Add intent behavior in `handleIntent` for intent-routed commands.
- If a command changes page-local state (like debug), return it via `stateUpdates` in `handleCommand` in `src/lib/services/chat.js`.

## Troubleshooting

### Command appears in suggestions but does nothing on submit

- Confirm the command is resolvable by `findCommand(input)` in `src/lib/services/commands.js`.
- If the command uses aliases, verify `aliases` is an array of lowercase names (without `/`).
- Check whether the command behavior belongs in `handleIntent` (response text) and whether it needs a `stateUpdates` patch in `handleCommand`.

### Command does not appear in suggestions

- Confirm the input starts with `/` so `parseSlashCommand(input)` returns a value.
- Verify the command has a `name` and `slash` entry in `COMMANDS`.
- For alias suggestions, confirm `getCommandSuggestions(input)` still uses the flattened list from `toSuggestionEntries`.

### `/debug` works but `/db` does not (or vice versa)

- Ensure `COMMANDS` keeps `name: "db"` as the primary command.
- Ensure `aliases: ["debug"]` is present on the same command object.
- Ensure `handleCommand` checks `intentResult.command?.name === "db"` so both forms map to one branch.

### Debug message appears but conversation id does not show

- Confirm `stateUpdates.isDebug` is returned by `handleCommand` and applied in `sendMessage`.
- Confirm `conversationId` is initialized in `onMount`.
- Confirm the banner guard is `{#if isDebug && conversationId}` in the chat page template.

### Intent command returns generic mock response instead of intent response

- Check `resolveIntentResponse(input)` in `src/lib/services/intents.js` to confirm command matching succeeds.
- Verify `handleIntent(commandName, args)` returns a non-null response payload for the command.
- If command handling returns `handled: false`, the page continues fallback and calls `requestAssistantResponse(...)`.
