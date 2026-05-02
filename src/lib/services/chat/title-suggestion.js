import {
    DEFAULT_TITLE_SUGGESTION_ERROR,
    TITLE_SUGGESTION_STATUS,
    TITLE_SUGGESTION_WEBHOOK_URL
} from "$lib/services/chat/constants.js";

function parseSuggestedTitle(payload) {
    if (!payload || typeof payload !== "object") {
        return null;
    }

    const candidate = payload["suggested title"] ?? payload.suggestedTitle;

    if (typeof candidate !== "string") {
        return null;
    }

    const title = candidate.trim();
    return title.length > 0 ? title : null;
}

export async function fetchSuggestedTitle(noteContent, options = {}) {
    const webhookUrl = options.webhookUrl ?? TITLE_SUGGESTION_WEBHOOK_URL;

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ note: noteContent })
        });

        if (!response.ok) {
            return {
                ok: false,
                suggestedTitle: "",
                errorMessage: DEFAULT_TITLE_SUGGESTION_ERROR
            };
        }

        const payload = await response.json();
        const suggestedTitle = parseSuggestedTitle(payload);

        if (!suggestedTitle) {
            return {
                ok: false,
                suggestedTitle: "",
                errorMessage: DEFAULT_TITLE_SUGGESTION_ERROR
            };
        }

        return {
            ok: true,
            suggestedTitle,
            errorMessage: ""
        };
    } catch {
        return {
            ok: false,
            suggestedTitle: "",
            errorMessage: DEFAULT_TITLE_SUGGESTION_ERROR
        };
    }
}

export function isTitleSuggestionPending(status) {
    return (
        status === TITLE_SUGGESTION_STATUS.LOADING ||
        status === TITLE_SUGGESTION_STATUS.READY ||
        status === TITLE_SUGGESTION_STATUS.FAILED
    );
}
