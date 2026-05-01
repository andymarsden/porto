import { resolveAssistantReply } from "$lib/services/intent.js";

function normalizeInput(input) {
    return typeof input === "string" ? input.trim() : String(input ?? "").trim();
}

export function buildMessages(currentMessages, rawInput) {
    const text = normalizeInput(rawInput);

    if (!text) {
        return currentMessages;
    }

    const assistantReply = resolveAssistantReply(text);

    return [
        ...currentMessages,
        { role: "user", content: text },
        { role: "assistant", content: assistantReply.content }
    ];
}