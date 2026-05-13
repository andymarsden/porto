import { generateId } from "$lib/utils.js";

const POSTCODE_LOOKUP_API = "https://infojam.app.n8n.cloud/webhook/8b3f24d0-1cfd-457f-ab50-431eb33ab5df";

const FLOW_SUBMISSIONS = [];

export const basicDetailsCommands = {
    async saveFlow({ answers }) {
        const submission = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            answers: { ...(answers ?? {}) }
        };

        FLOW_SUBMISSIONS.push(submission);

        // Temporary mock persistence path for flow payloads.
        console.log("[basic-details.saveFlow]", submission);

        return {
            ok: true,
            savedAt: submission.createdAt,
            answers: submission.answers
        };
    },

    async getLastSavedFlow() {
        return FLOW_SUBMISSIONS[FLOW_SUBMISSIONS.length - 1] ?? null;
    },

    async getPostcodeInfo(payload) {
       

    //Get the postcode from the API
    //TODO This should actually go in actions, but I'm putting it here for simplicity

    let postcode = {"postcode":`${payload.answer}`};

//clean postcode by removing spaces and making uppercase
//postcode.postcode = postcode.postcode.replace(/\s/g, "").toUpperCase();

    const response = await fetch(POSTCODE_LOOKUP_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(postcode)
            });

            let responseBody = null;

            try {
                responseBody = await response.clone().json();
            } catch {
                responseBody = null;
            }

            //console.log("[basic-details.getPostcodeInfo] API response", responseBody);

            const ward = responseBody?.admin_ward ?? "unknown";
            const longitude = responseBody?.longitude ?? responseBody?.lng ?? "unknown";
            const latitude = responseBody?.latitude ?? responseBody?.lat ?? "unknown";

        let userAnswer = {};

        userAnswer.pre_text = `You entered the postcode: **${payload.answer}**, which is in the ward of **${ward}**. The coordinates are: Longitude: ${longitude}, Latitude: ${latitude}.\n\n`;
        return userAnswer;
    }
};
