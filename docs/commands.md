# Commands

The chat composer supports slash commands.

## How it works

- Type `/` in the chat input to open command suggestions.
- Keep typing to filter the command list (for example `/n`).
- Click a suggestion to insert it into the composer.
- Press Enter to submit the command.

There are two execution paths after submit:

- Local UI command path for debug toggling (`/db`, `/debug`).
- Intent service path for standard mock intent commands (`/n`, `/help`, `/status`, `/clear`).

## Available commands

- `/n` - Kick off the mock N intent.
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

Debug toggling is handled directly in the chat page in `src/routes/(app)/sandbox/chat/+page.svelte`.

When the submitted input matches `db`:

- The page flips local `isDebug` state.
- It appends the user command as a user message.
- It appends an assistant message with exact text:
	- `Debugging turned on`
	- `Debugging turned off`
- It does not call the assistant intent/fallback response pipeline for this command.

When `isDebug` is true, the chat UI shows the current conversation id at the top of the message list.

## Mock intent behavior

For intent-routed commands, the flow goes through `src/lib/services/intents.js`.

When you submit `/n`, the assistant responds with:

- `/n intent hit`

When you submit `/n some text`, the assistant responds with:

- `/n intent hit (some text)`

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
		I -->|Valid content| L[findCommand(content)]

		L --> M{Command is db?}
		M -->|Yes| N[Toggle isDebug and append Debugging turned on or off]
		N --> O{isDebug true?}
		O -->|Yes| P[Show Conversation ID banner]
		O -->|No| Q[Hide Conversation ID banner]

		M -->|No| R[addUserAndThinkingMessages]
		R --> S[Append user message + Thinking... assistant placeholder]
		S --> T[requestAssistantResponse(content)]

		T --> U[resolveIntentResponse in intents service]
		U --> V[findCommand via commands service]
		V --> W{Recognized command?}
		W -->|No| X[Fallback chat mock response after 900ms]
		W -->|Yes| Y[handleIntent after 350ms]
		Y --> Z{Intent name}
		Z -->|n| AA[/n intent hit or with args]
		Z -->|help| AB[List of available slash commands]
		Z -->|status| AC[Mock status response]
		Z -->|clear| AD[Mock clear response]

		X --> AE[replaceMessageContent Thinking... with response]
		AA --> AE
		AB --> AE
		AC --> AE
		AD --> AE

		AE --> AF[isLoading false + scrollToBottom + refocus textarea]

		subgraph Error Path
			T -->|exception| ERR[replace Thinking... with error message]
			ERR --> AF
		end
```

## Extending commands

Edit the command service at `src/lib/services/commands.js` and intent service at `src/lib/services/intents.js`.

- Add a command entry to `COMMANDS`.
- Optionally add aliases with `aliases: ["alias-name"]`.
- Add intent behavior in `handleIntent` for intent-routed commands.
- If a command changes page-local state (like debug), handle it in `sendMessage` in `src/routes/(app)/sandbox/chat/+page.svelte`.

## Troubleshooting

### Command appears in suggestions but does nothing on submit

- Confirm the command is resolvable by `findCommand(input)` in `src/lib/services/commands.js`.
- If the command uses aliases, verify `aliases` is an array of lowercase names (without `/`).
- Check whether the command should be handled locally in `sendMessage` or in `handleIntent`.

### Command does not appear in suggestions

- Confirm the input starts with `/` so `parseSlashCommand(input)` returns a value.
- Verify the command has a `name` and `slash` entry in `COMMANDS`.
- For alias suggestions, confirm `getCommandSuggestions(input)` still uses the flattened list from `toSuggestionEntries`.

### `/debug` works but `/db` does not (or vice versa)

- Ensure `COMMANDS` keeps `name: "db"` as the primary command.
- Ensure `aliases: ["debug"]` is present on the same command object.
- Ensure local debug handling checks `commandMatch.command.name === "db"` so both forms map to one branch.

### Debug message appears but conversation id does not show

- Confirm `isDebug` toggles in `sendMessage` when the debug command is submitted.
- Confirm `conversationId` is initialized in `onMount`.
- Confirm the banner guard is `{#if isDebug && conversationId}` in the chat page template.

### Intent command returns generic mock response instead of intent response

- Check `resolveIntentResponse(input)` in `src/lib/services/intents.js` to confirm command matching still succeeds.
- Verify `handleIntent(commandName, args)` returns a non-null string for the command.
- If `handleIntent` returns `null`, the chat service falls back to the generic mock response path.
