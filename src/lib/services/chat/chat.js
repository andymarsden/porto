import { resolveAssistantReply } from "$lib/services/chat/intent.js";
import { CHAT_WORKFLOW_STATUS } from "$lib/services/chat/constants.js";

function normalizeInput(input) {
    return typeof input === "string" ? input.trim() : String(input ?? "").trim();
}

function createMessage(role, content, intent = null, meta = null) {
    return {
        id: crypto.randomUUID(),
        role,
        content,
        intent,
        meta,
        createdAt: new Date().toISOString()
    };
}

function updateConversationMetadata(conversation) {
    return {
        ...conversation,
        updatedAt: new Date().toISOString()
    };
}

function createConversationEvent(intentId, workflowStatus, meta = null) {
    return {
        id: crypto.randomUUID(),
        intentId,
        workflowStatus,
        meta,
        createdAt: new Date().toISOString()
    };
}

export function createConversation() {
    const timestamp = new Date().toISOString();

    return {
        id: crypto.randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp,
        messages: [],
        events: []
    };
}

export function appendConversationEvent(conversation, { intentId, workflowStatus, meta = null }) {
    const event = createConversationEvent(intentId, workflowStatus, meta);

    return updateConversationMetadata({
        ...conversation,
        events: [...(conversation.events ?? []), event]
    });
}

function resolveWorkflowStatus(assistantReply) {
    if (assistantReply?.meta?.requiresTitleReview) {
        return CHAT_WORKFLOW_STATUS.TITLE_REVIEW_REQUIRED;
    }

    return CHAT_WORKFLOW_STATUS.MESSAGE_RECORDED;
}

export function buildConversationUpdate(currentConversation, rawInput) {
    const text = normalizeInput(rawInput);

    if (!text) {
        return currentConversation;
    }

    const assistantReply = resolveAssistantReply(text, { conversation: currentConversation });
    const workflowStatus = resolveWorkflowStatus(assistantReply);
    const debugEvent = createConversationEvent(assistantReply.intent, workflowStatus, assistantReply.meta);

    const nextConversation = {
        ...currentConversation,
        messages: [
            ...currentConversation.messages,
            createMessage("user", text),
            createMessage("assistant", assistantReply.content, assistantReply.intent, assistantReply.meta)
        ],
        events: [...(currentConversation.events ?? []), debugEvent]
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

        if (parsed.events && !Array.isArray(parsed.events)) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}