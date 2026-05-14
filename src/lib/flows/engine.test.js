import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("$lib/commands/execute", () => ({
    executeCommand: vi.fn()
}));

import { executeCommand } from "$lib/commands/execute";
import { saveFlowAnswer } from "./engine.js";

function createActiveFlow(stepOverrides = []) {
    return {
        id: "test-flow",
        currentStep: 0,
        answers: {},
        flow: {
            steps: [
                {
                    id: "question-one",
                    question: "Pick one",
                    ...stepOverrides[0]
                },
                {
                    id: "question-two",
                    question: "Next question",
                    ...stepOverrides[1]
                }
            ]
        }
    };
}

describe("saveFlowAnswer option matching", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("accepts bracket label answers like A/B/C and stores canonical option text", async () => {
        const activeFlow = createActiveFlow([
            {
                options: ["[A] Yes", "[B] No"]
            }
        ]);

        const result = await saveFlowAnswer(activeFlow, "a");

        expect(result.activeFlow.answers["question-one"]).toBe("[A] Yes");
        expect(result.activeFlow.currentStep).toBe(1);
        expect(result.isComplete).toBe(false);
    });

    it("accepts case-insensitive text for plain options and stores canonical option", async () => {
        const activeFlow = createActiveFlow([
            {
                options: ["Yes", "No"]
            }
        ]);

        const result = await saveFlowAnswer(activeFlow, "yes");

        expect(result.activeFlow.answers["question-one"]).toBe("Yes");
        expect(result.activeFlow.currentStep).toBe(1);
    });

    it("accepts plain option text when options are bracketed", async () => {
        const activeFlow = createActiveFlow([
            {
                options: ["[A] Porto Hub", "[B] Porto Online"]
            }
        ]);

        const result = await saveFlowAnswer(activeFlow, "porto online");

        expect(result.activeFlow.answers["question-one"]).toBe("[B] Porto Online");
        expect(result.activeFlow.currentStep).toBe(1);
    });

    it("repeats the same question with guidance when option input is invalid", async () => {
        const activeFlow = createActiveFlow([
            {
                options: ["[A] Yes", "[B] No"]
            }
        ]);

        const result = await saveFlowAnswer(activeFlow, "maybe");

        expect(result.activeFlow.currentStep).toBe(0);
        expect(result.answers).toEqual({});
        expect(result.nextStep?.id).toBe("question-one");
        expect(result.nextStep?.options).toEqual(["[A] Yes", "[B] No"]);
        expect(result.errorMessage).toContain("Please choose one of the listed options");
    });

    it("passes the canonical option to validate commands", async () => {
        executeCommand.mockResolvedValue({ ok: true });

        const activeFlow = createActiveFlow([
            {
                options: ["[A] Yes", "[B] No"],
                validate: "debug.check"
            }
        ]);

        await saveFlowAnswer(activeFlow, "b");

        expect(executeCommand).toHaveBeenCalledWith("debug.check", {
            answer: "[B] No",
            stepId: "question-one",
            answers: {
                "question-one": "[B] No"
            }
        });
    });
});
