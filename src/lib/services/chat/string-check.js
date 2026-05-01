export function containsSlashN(input) {
	const value = typeof input === "string" ? input : String(input ?? "");
	return value.includes("/n");
}

export function containsSlashT(input) {
	const value = typeof input === "string" ? input : String(input ?? "");
	return value.includes("/t");
}