import { describe, expect, it, vi, afterEach } from "vitest";
import {
    DEFAULT_TITLE_SUGGESTION_ERROR,
    TITLE_SUGGESTION_STATUS
} from "$lib/services/chat/constants.js";
import {
    fetchSuggestedTitle,
    isTitleSuggestionPending
} from "$lib/services/chat/title-suggestion.js";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("fetchSuggestedTitle", () => {
    it("returns suggested title on successful webhook response", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({ "suggested title": "  Buy Milk  " })
        });

        const result = await fetchSuggestedTitle("buy milk");

        expect(result).toEqual({
            ok: true,
            suggestedTitle: "Buy Milk",
            errorMessage: ""
        });
    });

    it("returns fallback when response payload has no usable title", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({ suggestedTitle: "   " })
        });

        const result = await fetchSuggestedTitle("buy milk");

        expect(result).toEqual({
            ok: false,
            suggestedTitle: "",
            errorMessage: DEFAULT_TITLE_SUGGESTION_ERROR
        });
    });

    it("returns fallback when webhook response is not ok", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({})
        });

        const result = await fetchSuggestedTitle("buy milk");

        expect(result).toEqual({
            ok: false,
            suggestedTitle: "",
            errorMessage: DEFAULT_TITLE_SUGGESTION_ERROR
        });
    });

    it("returns fallback when network fails", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

        const result = await fetchSuggestedTitle("buy milk");

        expect(result).toEqual({
            ok: false,
            suggestedTitle: "",
            errorMessage: DEFAULT_TITLE_SUGGESTION_ERROR
        });
    });
});

describe("isTitleSuggestionPending", () => {
    it("returns true for pending statuses", () => {
        expect(isTitleSuggestionPending(TITLE_SUGGESTION_STATUS.LOADING)).toBe(true);
        expect(isTitleSuggestionPending(TITLE_SUGGESTION_STATUS.READY)).toBe(true);
        expect(isTitleSuggestionPending(TITLE_SUGGESTION_STATUS.FAILED)).toBe(true);
    });

    it("returns false for resolved statuses", () => {
        expect(isTitleSuggestionPending(TITLE_SUGGESTION_STATUS.ACCEPTED)).toBe(false);
        expect(isTitleSuggestionPending(TITLE_SUGGESTION_STATUS.DECLINED)).toBe(false);
    });
});
