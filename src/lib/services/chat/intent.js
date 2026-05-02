import { containsSlashN, containsSlashT } from "$lib/services/chat/string-check.js";
import { createNote, extractNoteTextFromCommand } from "$lib/services/chat/note.js";

function normalizeIntentInput(input) {
    return typeof input === "string" ? input : String(input ?? "");
}

//containsSlashR

const intentHandlers = [
    {
        id: "create-note",
        command: "/n",
        usage: "/n ",
        label: "Create Note",
        description: "Create a note from the text you provide.",
        match(text) {
            return containsSlashN(text);
        },
        buildReply(text) {
            const noteText = extractNoteTextFromCommand(text);

            if (!noteText) {
                return {
                    content: "Please provide note text after /n, create note, or new note",
                    pendingAction: null
                };
            }

            const note = createNote(noteText);

            return {
                content: "Note created. Would you like to add a title? Reply with your title (or skip / no).",
                pendingAction: { type: "note-title-prompt", noteId: note.id }
            };
        }
    },
    {
        id: "timestamp",
        command: "/t",
        usage: "/t",
        label: "Timestamp",
        description: "Insert the current ISO timestamp.",
        match(text) {
            return containsSlashT(text);
        },
        buildReply() {
            return `Timestamp: ${new Date().toISOString()}`;
        }
    }
];

export function resolveAssistantReply(input, _context = {}) {
    const text = normalizeIntentInput(input);

    for (const handler of intentHandlers) {
        if (handler.match(text)) {
            const reply = handler.buildReply(text);
            const content = typeof reply === "string" ? reply : reply.content;
            const pendingAction = typeof reply === "object" ? (reply.pendingAction ?? null) : null;

            return { intent: handler.id, content, pendingAction };
        }
    }

    return {
        intent: "echo",
        content: `Echo: ${text}`,
        pendingAction: null
    };
}

export function getAvailableCommands() {
    return intentHandlers
        .filter((handler) => typeof handler.command === "string")
        .map(({ id, command, usage, label, description }) => ({
            id,
            command,
            usage: usage ?? command,
            label: label ?? command,
            description: description ?? ""
        }));
}

export { intentHandlers };