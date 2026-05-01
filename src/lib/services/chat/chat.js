import { resolveAssistantReply } from "$lib/services/chat/intent.js";

function normalizeInput(input) {
    return typeof input === "string" ? input.trim() : String(input ?? "").trim();
}

function createMessage(role, content, intent = null) {
    return {
        id: crypto.randomUUID(),
        role,
        content,
        intent,
        createdAt: new Date().toISOString()
    };
}

function updateConversationMetadata(conversation) {
    return {
        ...conversation,
        updatedAt: new Date().toISOString()
    };
}

export function createConversation() {
    const timestamp = new Date().toISOString();

    return {
        id: crypto.randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp,
        messages: []
    };
}

export function buildConversationUpdate(currentConversation, rawInput) {
    const text = normalizeInput(rawInput);

    if (!text) {
        return currentConversation;
    }

    const assistantReply = resolveAssistantReply(text, { conversation: currentConversation });

    const nextConversation = {
        ...currentConversation,
        messages: [
            ...currentConversation.messages,
            createMessage("user", text),
            createMessage("assistant", assistantReply.content, assistantReply.intent)
        ]
    };

    return updateConversationMetadata(nextConversation);
}

export function serializeConversation(conversation) {
    return JSON.stringify(conversation);
}

export function deserializeConversation(serializedConversation) {
    try {
        const parsed = JSON.parse(serializedConversation);
        if (!parsed || typeof parsed !== "object") {
            return null;
        }

        if (!parsed.id || !Array.isArray(parsed.messages)) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}