const notes = [];

export function createNote(content) {
    const note = {
        id: crypto.randomUUID(),
        title: null,
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
    return value.replace(/\/n/g, "").trim();
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
