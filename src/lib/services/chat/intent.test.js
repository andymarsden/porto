import { describe, expect, it } from "vitest";
import { CHAT_INTENTS } from "$lib/services/chat/constants.js";
import { resolveAssistantReply } from "$lib/services/chat/intent.js";

describe("resolveAssistantReply", () => {
    it("returns normalized echo reply", () => {
        const reply = resolveAssistantReply("hello world");

        expect(reply).toEqual({
            intent: CHAT_INTENTS.ECHO,
            content: "Echo: hello world",
            meta: null
        });
    });

    it("returns timestamp intent for /t", () => {
        const reply = resolveAssistantReply("/t");

        expect(reply.intent).toBe(CHAT_INTENTS.TIMESTAMP);
        expect(reply.content.startsWith("Timestamp:")).toBe(true);
        expect(reply.meta).toBeNull();
    });

    it("returns create note reply metadata when note text exists", () => {
        const reply = resolveAssistantReply("/n buy milk and eggs");

        expect(reply).toEqual({
            intent: CHAT_INTENTS.CREATE_NOTE,
            content: "Review the suggested title below before saving your note.",
            meta: {
                noteText: "buy milk and eggs",
                requiresTitleReview: true
            }
        });
    });

    it("returns create note guidance when note text is missing", () => {
        const reply = resolveAssistantReply("/n");

        expect(reply).toEqual({
            intent: CHAT_INTENTS.CREATE_NOTE,
            content: "Please provide note text after /n, create note, or new note",
            meta: {
                noteText: "",
                requiresTitleReview: false
            }
        });
    });
});
