import { detect_intent,respond } from "$lib/services/v2/intent_engine.js";

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
            { id: "opt-1", label: "Tell me more", value: "Tell me more", type: "primary" },
            { id: "opt-2", label: "Show examples", value: "Show examples", type: "secondary" },
            { id: "opt-3", label: "Clarify", value: "Clarify", type: "tertiary" },
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

function resolveIntent(intent, content) {
    let response = "";
    if (intent === "greeting") {
        response = _assistantResponse(content, "greeting");
    }
    else if (intent === "create_note") {
        response = _assistantResponse(content, intent);
    }
    else {
        response = _mockResponse(content);
    }
    return response;
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

        const response_message = await detect_intent(content);
        const intent = await respond(content);
        console.log("Detected intent:", intent, "for message:", response_message);

        const response = resolveIntent(intent, content);

   

        await revealAssistantContent(thinkingMessage.id, response?.text ?? "");

        //Options - if the response includes options, we add them to the message, which will trigger the UI to render buttons.
        if (response.options?.length) {
            console.log("Adding options to message", response.options);
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