import { respond } from "$lib/services/v2/intent_engine.js";
import { createChatMessage } from "$lib/objects/chat_message.js";

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
    let thinkingMessage;

    try {
        thinkingMessage = createMessage("assistant", "Thinking...", {
            intent: "thinking",
            status: "pending",
        });
        setMessages([...getMessages(), createMessage("user", content), thinkingMessage]);

        await scrollToBottom();
        await wait(350); // Simulate processing delay

        const responseMessage = await respond(content);
        const responseText = responseMessage.message ?? "";
   
        await revealAssistantContent(thinkingMessage.id, responseText);

        //Options - if the response includes options, we add them to the message, which will trigger the UI to render buttons.
        setMessages(
            getMessages().map((message) =>
                message.id === thinkingMessage.id
                    ? createChatMessage({
                        ...message,
                        intent: responseMessage.intent ?? "unknown",
                        options: responseMessage.options ?? [],
                        status: responseMessage.status ?? "complete",
                    })
                    : message,
            ),
        );

    } catch (error) {
        console.error("sendUserMessage failed", error);

        if (thinkingMessage?.id) {
            const fallbackText = "Something went wrong. Please try again.";
            setMessages(
                getMessages().map((message) =>
                    message.id === thinkingMessage.id
                        ? createChatMessage({
                            ...message,
                            content: fallbackText,
                            message: fallbackText,
                            intent: "error",
                            options: [],
                            status: "error",
                        })
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