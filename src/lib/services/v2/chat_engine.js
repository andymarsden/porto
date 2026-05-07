import { detect_intent } from "$lib/services/v2/intent_engine.js";

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function _mockResponse(userText) {
    return {
        text: `Mock response to: "${userText}"`,
        options: [
            { id: "opt-1", label: "Tell me more", value: "Tell me more" },
            { id: "opt-2", label: "Show examples", value: "Show examples" },
            { id: "opt-3", label: "Clarify", value: "Clarify" },
        ],
    };
}

function _assistantResponse(userText, intent) {
    const resolvedIntent = intent || "default";

    return {
        text: `Intent "${resolvedIntent}" response: "${userText}"`,
    };
}

export function createMessage(role, content) {
    return {
        id: generateId(),
        role,
        content,
        createdAt: new Date().toISOString(),
    };
}

export function replaceMessageContent(messages, messageId, content) {
    return messages.map((message) => {
        if (message.id !== messageId) return message;

        return {
            ...message,
            content,
            createdAt: new Date().toISOString(),
        };
    });
}

// Shared chat pipeline used by both typed sends and option-button clicks.
export async function sendUserMessage({
    content,
    isLoading,
    getMessages,
    setMessages,
    setIsLoading,
    createMessage,
    scrollToBottom,
    revealAssistantContent,
    focusComposer,
}) {
    if (isLoading()) return;
    setIsLoading(true);

    try {
        const thinkingMessage = createMessage("assistant", "Thinking...");
        setMessages([...getMessages(), createMessage("user", content), thinkingMessage]);

        await scrollToBottom();
        await wait(900);

        const intent = await detect_intent(content);
        const response =
            intent === "greeting"
                ? _assistantResponse(content, "greeting")
                : _mockResponse(content);

        await revealAssistantContent(thinkingMessage.id, response?.text ?? "");

        if (response.options?.length) {
            setMessages(
                getMessages().map((message) =>
                    message.id === thinkingMessage.id
                        ? { ...message, options: response.options }
                        : message,
                ), 
            );
        }
    } finally {
        setIsLoading(false);
        await scrollToBottom();
        focusComposer?.();
    }
}