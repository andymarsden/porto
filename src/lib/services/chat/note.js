const notes = [];
const NOTE_COMMAND_PREFIX = /^\s*(\/n|create note|new note)\s*/i;

function deriveDefaultTitle(content) {
    const value = typeof content === "string" ? content.trim() : String(content ?? "").trim();

    if (!value) {
        return "Untitled note";
    }

    return value.slice(0, 20);
}

export function createNote(content) {
    const note = {
        id: crypto.randomUUID(),
        title: deriveDefaultTitle(content),
        content,
        createdAt: new Date().toISOString()
    };

    notes.push(note);

    return note;
}

export function addTitleToNote(noteId, title) {
    const note = notes.find((n) => n.id === noteId);

    if (!note) {
        return null;
    }

    note.title = title.trim();

    return note;
}

export function getNotes() {
    return [...notes];
}

export function extractNoteTextFromCommand(input) {
    const value = typeof input === "string" ? input : String(input ?? "");
    return value.replace(NOTE_COMMAND_PREFIX, "").trim();
}

export function serializeNotes() {
    return JSON.stringify(notes);
}

export function loadNotes(rawJson) {
    try {
        const parsed = JSON.parse(rawJson);

        if (!Array.isArray(parsed)) {
            return;
        }

        notes.length = 0;
        parsed.forEach((n) => notes.push(n));
    } catch {
        // malformed data — leave notes untouched
    }
}
