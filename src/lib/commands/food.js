import { generateId } from "$lib/utils.js";
import { checkFoodAnswer } from "$lib/actions/food";
import { parseDate } from "$lib/utils.js";


const FLOW_SUBMISSIONS = [];

export const foodCommands = {
    async capitalize(text) {
        return String(text.answer ?? "").toUpperCase();
    },

//function to check for valid date
    async validateDate(text) {
        console.log("[food.validateDate] Validating date answer:", text.answer);
        const parsedDate = parseDate(String(text.answer ?? ""));
        const isValid = !!parsedDate;

        return {
            valid: isValid,
            message: isValid
                ? undefined
                : "Sorry, I couldn't understand that date. Please try again with a different format."
        };
    },

    async normalizeDate(text) {
        const parsedDate = parseDate(String(text.answer ?? ""));
        if (!parsedDate) {
            return {
                error: "Sorry, I couldn't understand that date. Please try again with a different format."
            };
        }
        return parsedDate.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
    },

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
    },

    async politeResponse(payload) {
        let userAnswer = {};
        userAnswer.text = payload.answer?.toLowerCase() ?? "";
        //add a line break in the string below
        userAnswer.pre_text = `# Thanks\n\n**You said your favorite Chinese food** is ${userAnswer.text}.\nI need to highlight these ==very important words==.`;
        userAnswer.post_text = "";
        return userAnswer;
    },
    async japaneseFoodCheck(payload) {

        const bannedFoods = ["beef"];
        const normalizedAnswer = String(payload.answer ?? "").trim().toLowerCase();
        const isValid = !bannedFoods.includes(normalizedAnswer);

        return {
            valid: isValid,
            message: isValid
                ? undefined
                : "beef is not allowed here. Please choose another Japanese food."
        };

    }

};
