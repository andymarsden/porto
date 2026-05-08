import { normalizeAssistantResponse } from "$lib/services/v2/types.js";

function hasWord(text, word) {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escapedWord}\\b`, "i").test(text);
}

function normalizeInput(text) {
    return String(text ?? "").trim();
}

const INTENT_RULES = [
    {
        intent: "get_weather",
        matches: ({ lowerText }) => hasWord(lowerText, "weather"),
    },
    {
        intent: "create_note",
        matches: ({ lowerText }) =>
            lowerText.startsWith("/n") || lowerText === "new note",
    },
    {
        intent: "greeting",
        matches: ({ lowerText }) =>
            hasWord(lowerText, "hello") || hasWord(lowerText, "hi"),
    },
    {
        intent: "echo",
        matches: ({ lowerText }) => hasWord(lowerText, "echo"),
    },
    {
        intent: "options",
        matches: ({ lowerText }) =>
            lowerText.startsWith("/o") || hasWord(lowerText, "options"),
    },
];

/**
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function detectIntent(text) {
    const normalizedText = normalizeInput(text);
    const lowerText = normalizedText.toLowerCase();

    for (const rule of INTENT_RULES) {
        if (rule.matches({ normalizedText, lowerText })) {
            return rule.intent;
        }
    }

    // Future: route unknowns to an LLM-powered intent detector.
    return "unknown";
}

async function buildResponse(intent, message) {
    if (intent === "greeting") {
        return {
            intent,
            message: "Hello! How can I help today?",
            options: [
                {
                    id: "1",
                    label: "Create a note",
                    value: "new note",
                    type: "primary",
                },
                {
                    id: "2",
                    label: "Show options",
                    value: "/o",
                    type: "secondary",
                },
            ],
            status: "complete",
        };
    }

    if (intent === "create_note") {
        return {
            intent,
            message: "Sure, tell me what note you want to create.",
            options: [],
            status: "complete",
        };
    }

    if (intent === "get_weather") {
        return {
            intent,
            message: "I can help with weather soon. For now, try another command.",
            options: [],
            status: "complete",
        };
    }

    if (intent === "echo") {
        return {
            intent,
            message: `Hello! You said: ${String(message ?? "")}`,
            options: [],
            status: "complete",
        };
    }

    if (intent === "options") {
        return {
            intent,
            message: "Here are some options for you:",
            options: [
                {
                    id: "1",
                    label: "Tell me more",
                    value: "Tell me more",
                    type: "primary",
                },
                {
                    id: "2",
                    label: "hello",
                    value: "echo",
                    type: "secondary",
                },
            ],
            status: "complete",
        };
    }

    return {
        intent,
        message: "A boring default message",
        options: [],
        status: "complete",
    };
}

/**
 * @param {string} message
 * @returns {Promise<import("$lib/services/v2/types.js").AssistantResponse>}
 */
export async function respondToMessage(message) {
    const intent = await detectIntent(message);
    const response = await buildResponse(intent, message);
    return normalizeAssistantResponse(response);
}
