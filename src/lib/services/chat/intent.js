import { containsSlashN, containsSlashT } from "$lib/services/chat/string-check.js";
import { CHAT_INTENTS } from "$lib/services/chat/constants.js";
import { extractNoteTextFromCommand } from "$lib/services/chat/note.js";

function normalizeIntentInput(input) {
    return typeof input === "string" ? input : String(input ?? "");
}

//containsSlashR

function createReply(intent, content, meta = null) {
    return {
        intent,
        content,
        meta
    };
}

const intentHandlers = [
    {
        id: CHAT_INTENTS.CREATE_NOTE,
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
                return createReply(
                    CHAT_INTENTS.CREATE_NOTE,
                    "Please provide note text after /n, create note, or new note",
                    { noteText: "", requiresTitleReview: false }
                );
            }

            return createReply(
                CHAT_INTENTS.CREATE_NOTE,
                "Review the suggested title below before saving your note.",
                { noteText, requiresTitleReview: true }
            );
        }
    },
    {
        id: CHAT_INTENTS.TIMESTAMP,
        command: "/t",
        usage: "/t",
        label: "Timestamp",
        description: "Insert the current ISO timestamp.",
        match(text) {
            return containsSlashT(text);
        },
        buildReply() {
            return createReply(CHAT_INTENTS.TIMESTAMP, `Timestamp: ${new Date().toISOString()}`);
        }
    }
];

export function resolveAssistantReply(input, _context = {}) {
    const text = normalizeIntentInput(input);

    for (const handler of intentHandlers) {
        if (handler.match(text)) {
            return handler.buildReply(text);
        }
    }

    return createReply(CHAT_INTENTS.ECHO, `Echo: ${text}`);
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