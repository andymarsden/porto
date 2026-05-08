const VALID_MESSAGE_STATUSES = new Set(["pending", "complete", "error"]);

function generateId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeStatus(status) {
    if (!VALID_MESSAGE_STATUSES.has(status)) {
        return "complete";
    }

    return status;
}

function normalizeOptions(options) {
    return Array.isArray(options) ? options : [];
}

export function createChatMessage({
    id,
    role,
    content,
    message,
    intent = "unknown",
    options = [],
    status = "complete",
    createdAt,
}) {
    // `message` is canonical text; `content` is kept for current UI compatibility.
    const resolvedMessage = String(message ?? content ?? "");

    return {
        id: id ?? generateId(),
        role,
        content: resolvedMessage,
        message: resolvedMessage,
        intent: String(intent ?? "unknown"),
        options: normalizeOptions(options),
        status: normalizeStatus(status),
        createdAt: createdAt ?? new Date().toISOString(),
    };
}
