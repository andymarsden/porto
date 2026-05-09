import { generateId } from "$lib/utils.js";
import { checkFoodAnswer } from "$lib/actions/food";

const FLOW_SUBMISSIONS = [];

export const foodCommands = {
    async saveFlow({ answers }) {
        const submission = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            answers: { ...(answers ?? {}) }
        };

        FLOW_SUBMISSIONS.push(submission);

        // Temporary mock persistence path for flow payloads.
        console.log("[food.saveFlow]", submission);

        return {
            ok: true,
            savedAt: submission.createdAt,
            answers: submission.answers
        };
    },

    async getLastSavedFlow() {
        return FLOW_SUBMISSIONS[FLOW_SUBMISSIONS.length - 1] ?? null;
    },

    async check(payload) {
        console.info("[food.check] Payload:", payload);
        return await checkFoodAnswer(payload);
    },

    async setup(payload) {
        console.info("[food.setup] Payload:", payload);
        // You can perform any setup actions here if needed.
        return {
            ok: true,
            message: "Food flow setup complete."
        }
    }
};
