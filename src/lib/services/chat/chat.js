import { resolveAssistantReply } from "$lib/services/chat/intent.js";
import { addTitleToNote } from "$lib/services/chat/note.js";

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
        messages: [],
        pendingAction: null
    };
}

function resolvePendingAction(currentConversation, text) {
    const { pendingAction } = currentConversation;

    if (!pendingAction) {
        return null;
    }

    if (pendingAction.type === "note-title-prompt") {
        const normalizedResponse = text.trim().toLowerCase();
        const skipped = normalizedResponse === "/skip" || normalizedResponse === "skip" || normalizedResponse === "no";
        const replyContent = skipped ? "Title skipped." : `Title "${text.trim()}" added to note.`;

        if (!skipped) {
            addTitleToNote(pendingAction.noteId, text);
        }

        return {
            assistantContent: replyContent,
            intent: "note-title-prompt"
        };
    }

    return null;
}

export function buildConversationUpdate(currentConversation, rawInput) {
    const text = normalizeInput(rawInput);

    if (!text) {
        return currentConversation;
    }

    const pending = resolvePendingAction(currentConversation, text);

    let assistantContent;
    let intent;
    let nextPendingAction = null;

    if (pending) {
        assistantContent = pending.assistantContent;
        intent = pending.intent;
    } else {
        const assistantReply = resolveAssistantReply(text, { conversation: currentConversation });
        assistantContent = assistantReply.content;
        intent = assistantReply.intent;
        nextPendingAction = assistantReply.pendingAction ?? null;
    }

    const nextConversation = {
        ...currentConversation,
        pendingAction: nextPendingAction,
        messages: [
            ...currentConversation.messages,
            createMessage("user", text),
            createMessage("assistant", assistantContent, intent)
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