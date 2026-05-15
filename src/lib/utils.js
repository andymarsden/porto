import { clsx, } from "clsx";
import { twMerge } from "tailwind-merge";
import * as chrono from "chrono-node";


export function cn(...inputs) {
	return twMerge(clsx(inputs));
}



export function parseDate(value) {
    if (typeof value !== "string" || !value.trim()) return null;

    const parsed = chrono.parseDate(value);
    return parsed ?? null;
}

export function formatTimestamp(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";

	return date.toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit",
	});
}

export function wait(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function generateId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any