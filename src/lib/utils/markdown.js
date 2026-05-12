import { marked } from "marked";

marked.setOptions({
	gfm: true,
	breaks: true,
});

function escapeHtml(value) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

export function renderAssistantMarkdown(content) {
	const safeContent = escapeHtml(String(content ?? ""));
	return marked.parse(safeContent);
}
