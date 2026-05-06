const COMMANDS = [
	{
		name: "n",
		slash: "/n",
		description: "Kick off the mock N intent"
	},
	{
		name: "help",
		slash: "/help",
		description: "Show available commands"
	},
	{
		name: "status",
		slash: "/status",
		description: "Show mock workspace status"
	},
	{
		name: "clear",
		slash: "/clear",
		description: "Show a mock clear confirmation"
	}
];

function parseSlashCommand(input) {
	const text = input.trim();
	if (!text.startsWith("/")) return null;

	const [rawCommand = "", ...rest] = text.slice(1).split(/\s+/);
	const name = rawCommand.toLowerCase();
	if (!name) {
		return {
			name: "",
			args: ""
		};
	}

	return {
		name,
		args: rest.join(" ").trim()
	};
}

function getCommandSuggestions(input) {
	const parsed = parseSlashCommand(input);
	if (!parsed) return [];

	if (!parsed.name) {
		return COMMANDS;
	}

	return COMMANDS.filter((command) => command.name.startsWith(parsed.name));
}

function findCommand(input) {
	const parsed = parseSlashCommand(input);
	if (!parsed || !parsed.name) return null;

	const command = COMMANDS.find((entry) => entry.name === parsed.name);
	if (!command) return null;

	return {
		command,
		args: parsed.args
	};
}

export { COMMANDS, findCommand, getCommandSuggestions, parseSlashCommand };
