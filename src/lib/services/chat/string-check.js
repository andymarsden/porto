export function containsSlashN(input) {
	const value = typeof input === "string" ? input : String(input ?? "");
	return /^\s*(\/n(?:\s+|$)|create note(?:\s+|$)|new note(?:\s+|$))/i.test(value);
}

export function containsSlashT(input) {
	const value = typeof input === "string" ? input : String(input ?? "");
	return value.includes("/t");
}