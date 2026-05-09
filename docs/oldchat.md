import { createChatMessage } from "$lib/objects/chat_message.js";
import { respondToMessage } from "$lib/services/v2/intent.js";
import { normalizeAssistantResponse } from "$lib/services/v2/types.js";

const DEFAULT_PROCESSING_DELAY_MS = 350;
const DEFAULT_MIN_WORDS_PER_CHUNK = 2;
const DEFAULT_MAX_WORDS_PER_CHUNK = 5;
const DEFAULT_MIN_REVEAL_DELAY_MS = 30;
const DEFAULT_MAX_REVEAL_DELAY_MS = 70;

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMessage(role, content, overrides = {}) {
    return createChatMessage({
        role,
        content,
        ...overrides,
    });
}

export function replaceMessageContent(messages, messageId, content) {
    return messages.map((message) => {
        if (message.id !== messageId) return message;

        return createChatMessage({
            ...message,
            content,
            message: content,
        });
    });
}

function chunkWords(fullText, minWords = 2, maxWords = 5) {
    const words = fullText.split(" ").filter(Boolean);
    const chunks = [];
    let index = 0;

    while (index < words.length) {
        const size =
            minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
        chunks.push(words.slice(index, index + size).join(" "));
        index += size;
    }

    return chunks;
}

/**
 * Creates a reveal function that streams assistant text in word chunks.
 */
export function createAssistantContentRevealer({
    getMessages,
    setMessages,
    minWordsPerChunk = DEFAULT_MIN_WORDS_PER_CHUNK,
    maxWordsPerChunk = DEFAULT_MAX_WORDS_PER_CHUNK,
    minDelayMs = DEFAULT_MIN_REVEAL_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_REVEAL_DELAY_MS,
}) {
    return async function revealAssistantContent(messageId, fullText) {
        const normalizedText = String(fullText ?? "");

        if (!normalizedText.trim()) {
            setMessages(
                replaceMessageContent(getMessages(), messageId, normalizedText),
            );
            return;
        }

        const chunks = chunkWords(
            normalizedText,
            minWordsPerChunk,
            maxWordsPerChunk,
        );
        let displayed = "";

        for (const chunk of chunks) {
            displayed = displayed ? `${displayed} ${chunk}` : chunk;
            setMessages(replaceMessageContent(getMessages(), messageId, displayed));
            // Slightly random delays keep the typing animation from feeling robotic.
            await wait(minDelayMs + Math.random() * (maxDelayMs - minDelayMs));
        }
    };
}

function applyAssistantResponse(messages, messageId, assistantResponse) {
    return messages.map((message) => {
        if (message.id !== messageId) return message;

        return createChatMessage({
            ...message,
            intent: assistantResponse.intent,
            options: assistantResponse.options,
            status: assistantResponse.status,
        });
    });
}

/**
 * Shared chat pipeline used by both typed sends and option-button clicks.
 */
export async function sendUserMessage({
    content,
    isLoading,
    getMessages,
    setMessages,
    setIsLoading,
    scrollToBottom,
    revealAssistantContent,
    focusComposer,
    processingDelayMs = DEFAULT_PROCESSING_DELAY_MS,
    responder = respondToMessage,
}) {
    if (isLoading()) return;

    setIsLoading(true);
    let thinkingMessage;

    try {
        thinkingMessage = createMessage("assistant", "Thinking...", {
            intent: "thinking",
            status: "pending",
        });

        setMessages([
            ...getMessages(),
            createMessage("user", content),
            thinkingMessage,
        ]);

        await scrollToBottom();
        await wait(processingDelayMs);

        const assistantResponse = normalizeAssistantResponse(
            await responder(content),
        );

        await revealAssistantContent(
            thinkingMessage.id,
            assistantResponse.message,
        );

        setMessages(
            applyAssistantResponse(
                getMessages(),
                thinkingMessage.id,
                assistantResponse,
            ),
        );
    } catch (error) {
        console.error("sendUserMessage failed", error);

        if (thinkingMessage?.id) {
            const fallbackText = "Something went wrong. Please try again.";
            setMessages(
                applyAssistantResponse(
                    replaceMessageContent(
                        getMessages(),
                        thinkingMessage.id,
                        fallbackText,
                    ),
                    thinkingMessage.id,
                    {
                        intent: "error",
                        message: fallbackText,
                        options: [],
                        status: "error",
                    },
                ),
            );
        }
    } finally {
        setIsLoading(false);
        await scrollToBottom();
        focusComposer?.();
    }
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