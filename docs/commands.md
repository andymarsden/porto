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

## Extending commands

Edit the command service at `src/lib/services/commands.js`.

- Add a command entry to `COMMANDS`.
- Add intent behavior in `handleIntent`.
- The chat page suggestions and submit flow use this service automatically.
