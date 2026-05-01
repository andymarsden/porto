import { containsSlashN, containsSlashT } from "$lib/services/chat/string-check.js";

function normalizeIntentInput(input) {
    return typeof input === "string" ? input : String(input ?? "");
}

const intentHandlers = [
    {
        id: "create-note",
        match(text) {
            return containsSlashN(text);
        },
        buildReply() {
            return "Do you want to create a note";
        }
    },
    {
        id: "timestamp",
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
            return {
                intent: handler.id,
                content: handler.buildReply(text)
            };
        }
    }

    return {
        intent: "echo",
        content: `Echo: ${text}`
    };
}

export { intentHandlers };