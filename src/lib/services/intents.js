import { COMMANDS, findCommand } from '$lib/services/commands.js';
import { buildNotePreview, createNote, getNotesCount } from '$lib/services/notes.js';

async function handleIntent(commandName, args) {
	await new Promise((resolve) => setTimeout(resolve, 350));

	if (commandName === 'n') {
		if (args) {
			const note = createNote(args);
			if (!note) {
				return {
					response: 'Please send note content in your next message.',
					stateUpdates: {
						awaitingNoteContent: true
					}
				};
			}

			const preview = buildNotePreview(note.content);
			return {
				response: `Note saved: "${preview}"`,
				stateUpdates: {
					awaitingNoteContent: false
				}
			};
		}

		return {
			response: 'Please send note content in your next message.',
			stateUpdates: {
				awaitingNoteContent: true
			}
		};
	}

	if (commandName === 'help') {
		return `Available commands: ${COMMANDS.map((command) => command.slash).join(', ')}`;
	}

	if (commandName === 'status') {
		return `Mock status: all systems nominal. Notes in memory: ${getNotesCount()}.`;
	}

	if (commandName === 'clear') {
		return 'Mock clear intent hit. Hook this up to clear the chat list.';
	}

	return null;
}

async function resolveIntentResponse(input) {
	const match = findCommand(input);
	if (!match) {
		return {
			matched: false,
			response: null
		};
	}

	const response = await handleIntent(match.command.name, match.args);
	if (!response) {
		return {
			matched: false,
			response: null
		};
	}

	if (typeof response === 'string') {
		return {
			matched: true,
			response,
			command: match.command,
			args: match.args,
			stateUpdates: {}
		};
	}

	return {
		matched: true,
		response: response.response,
		command: match.command,
		args: match.args,
		stateUpdates: response.stateUpdates ?? {}
	};
}

export { handleIntent, resolveIntentResponse };
