export const CHAT_INTENTS = {
    CREATE_NOTE: "create-note",
    TIMESTAMP: "timestamp",
    ECHO: "echo"
};

export const TITLE_SUGGESTION_STATUS = {
    LOADING: "loading",
    READY: "ready",
    ACCEPTED: "accepted",
    DECLINED: "declined",
    FAILED: "failed"
};

export const CHAT_WORKFLOW_STATUS = {
    MESSAGE_RECORDED: "message-recorded",
    TITLE_REVIEW_REQUIRED: "title-review-required",
    TITLE_SUGGESTION_LOADING: "title-suggestion-loading",
    TITLE_SUGGESTION_READY: "title-suggestion-ready",
    TITLE_SUGGESTION_FAILED: "title-suggestion-failed",
    NOTE_SAVED_ACCEPTED_TITLE: "note-saved-accepted-title",
    NOTE_SAVED_DEFAULT_TITLE: "note-saved-default-title"
};

export const DEFAULT_TITLE_SUGGESTION_ERROR =
    "Could not suggest a title. You can still save the note with its default title.";

export const NOTE_CREATION_ERROR = "Could not save the note.";

export const TITLE_SUGGESTION_WEBHOOK_URL =
    "https://infojam.app.n8n.cloud/webhook/866df0d7-d4a5-41b7-8bf6-223b66e19f22";
