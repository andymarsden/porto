const COMMANDS = [
	{
		name: "n",
		slash: "/n",
		description: "Create a note from command text"
	},
	{
		name: "db",
		slash: "/db",
		aliases: ["debug"],
		description: "Toggle debug mode"
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

// Parses slash command input into a normalized command name and argument string.
// It trims whitespace, requires a leading "/", lowercases the command token,
// and preserves the rest of the text as a single args value.
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

// Expands one command into suggestion entries for the primary slash and aliases.
// Aliases reuse the same metadata so the UI can surface /db and /debug uniformly.
function toSuggestionEntries(command) {
	const aliases = Array.isArray(command.aliases) ? command.aliases : [];
	return [
		command,
		...aliases.map((alias) => ({
			...command,
			name: alias,
			slash: `/${alias}`
		}))
	];
}

// Builds the command suggestion list for the composer.
// If only "/" is typed, it returns all commands plus alias entries.
// If partial text is present, it filters by command name prefix.
function getCommandSuggestions(input) {
	const parsed = parseSlashCommand(input);
	if (!parsed) return [];
	const suggestions = COMMANDS.flatMap(toSuggestionEntries);

	if (!parsed.name) {
		return suggestions;
	}

	return suggestions.filter((command) => command.name.startsWith(parsed.name));
}

// Resolves submitted text to a canonical command definition and parsed args.
// Matching is case-insensitive (from parseSlashCommand) and checks both
// the command's primary name and any configured alias names.
function findCommand(input) {
	const parsed = parseSlashCommand(input);
	if (!parsed || !parsed.name) return null;

	const command = COMMANDS.find((entry) => {
		if (entry.name === parsed.name) return true;
		const aliases = Array.isArray(entry.aliases) ? entry.aliases : [];
		return aliases.includes(parsed.name);
	});
	if (!command) return null;

	return {
		command,
		args: parsed.args
	};
}

export { COMMANDS, findCommand, getCommandSuggestions, parseSlashCommand };
