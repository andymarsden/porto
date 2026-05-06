import { COMMANDS, findCommand } from '$lib/services/commands.js';

async function handleIntent(commandName, args) {
	await new Promise((resolve) => setTimeout(resolve, 350));

	if (commandName === 'n') {
		if (args) {
			return `/n intent hit (${args})`;
		}

		return '/n intent hit';
	}

	if (commandName === 'help') {
		return `Available commands: ${COMMANDS.map((command) => command.slash).join(', ')}`;
	}

	if (commandName === 'status') {
		return 'Mock status: all systems nominal.';
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

	return {
		matched: true,
		response,
		command: match.command,
		args: match.args
	};
}

export { handleIntent, resolveIntentResponse };
