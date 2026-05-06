# Commands

The chat composer supports slash commands.

## How it works

- Type `/` in the chat input to open command suggestions.
- Keep typing to filter the command list (for example `/n`).
- Click a suggestion to insert it into the composer.
- Press Enter to submit the command.

Recognized commands are routed through the intents handler and return a mock intent response for now.

## Available commands

- `/n` - Kick off the mock N intent.
- `/help` - Return a list of commands.
- `/status` - Return a mock status response.
- `/clear` - Return a mock clear confirmation.

## Mock intent behavior

When you submit `/n`, the assistant responds with:

- `/n intent hit`

When you submit `/n some text`, the assistant responds with:

- `/n intent hit (some text)`

## Flow diagram

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
		I -->|Valid content| L[addUserAndThinkingMessages]
		L --> M[Append user message + Thinking... assistant placeholder]
		M --> N[requestAssistantResponse(content)]

		N --> O[resolveIntentResponse in intents service]
		O --> P[findCommand via commands service]
		P --> Q{Recognized command?}
		Q -->|No| R[Fallback chat mock response after 900ms]
		Q -->|Yes| S[handleIntent after 350ms]
		S --> T{Intent name}
		T -->|n| U[/n intent hit or with args]
		T -->|help| V[List of available slash commands]
		T -->|status| W[Mock status response]
		T -->|clear| X[Mock clear response]

		R --> Y[replaceMessageContent Thinking... with response]
		U --> Y
		V --> Y
		W --> Y
		X --> Y

		Y --> Z[isLoading false + scrollToBottom + refocus textarea]

		subgraph Error Path
			N -->|exception| ERR[replace Thinking... with error message]
			ERR --> Z
		end
```

## Extending commands

Edit the command service at `src/lib/services/commands.js` and intent service at `src/lib/services/intents.js`.

- Add a command entry to `COMMANDS`.
- Add intent behavior in `handleIntent`.
- The chat page suggestions and submit flow use this service automatically.
