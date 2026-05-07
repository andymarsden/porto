const NOTES = [];

function generateNoteId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeNoteContent(content) {
	return String(content ?? '').trim();
}

function buildNotePreview(content, maxLength = 60) {
	const normalized = normalizeNoteContent(content);
	if (normalized.length <= maxLength) return normalized;
	return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function createNote(content) {
	const normalized = normalizeNoteContent(content);
	if (!normalized) return null;

	const note = {
		id: generateNoteId(),
		content: normalized,
		createdAt: new Date().toISOString()
	};

	NOTES.push(note);
	return note;
}

function listNotes() {
	return [...NOTES];
}

function getNotesCount() {
	return NOTES.length;
}

export { buildNotePreview, createNote, getNotesCount, listNotes, normalizeNoteContent };
