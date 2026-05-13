
import { marked } from "marked";

marked.setOptions({
	gfm: true,
	breaks: true,
});

// Replace ==text== with <mark>text</mark>
function highlightMarkdown(text) {
	// This regex matches ==something== and avoids crossing line breaks
	return text.replace(/==([^=\n]+)==/g, '<mark>$1</mark>');
}

function escapeHtml(value) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

export function renderAssistantMarkdown(content) {
	let text = String(content ?? "");
	// Apply highlight before escaping HTML
	text = highlightMarkdown(text);
	const safeContent = escapeHtml(text);
	// Unescape <mark> tags so they render as HTML
	const html = safeContent.replaceAll('&lt;mark&gt;', '<mark>').replaceAll('&lt;/mark&gt;', '</mark>');
	return marked.parse(html);
}
