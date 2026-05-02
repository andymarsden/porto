import { clsx, } from "clsx";
import { format as formatTimeAgo } from "timeago.js";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

function padToTwoDigits(value) {
	return String(value).padStart(2, "0");
}

export function formatDateTime(value, options = {}) {
	const date = value instanceof Date ? value : new Date(value);
	const { mode = "absolute" } = options;

	if (Number.isNaN(date.getTime())) {
		return "--/--/-- --:--";
	}

	if (mode === "relative") {
		const now = new Date();
		const seconds = Math.floor((now - date) / 1000);

		if (seconds < 5) return 'just now';
if (seconds < 60) return 'a few seconds ago';
		return formatTimeAgo(date);
	}

	const day = padToTwoDigits(date.getDate());
	const month = padToTwoDigits(date.getMonth() + 1);
	const year = String(date.getFullYear()).slice(-2);
	const hours = padToTwoDigits(date.getHours());
	const minutes = padToTwoDigits(date.getMinutes());

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any