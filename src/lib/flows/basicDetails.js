import { command } from "$app/server";

export const basicDetailsFlow = {
    id: "basic-details",

    steps: [
        {
            id: "name",
            question: "What is your name?"
        },
        {
            id:"postcode",
            question: "What is your postcode?",
            command:"basicDetails.getPostcodeInfo"
        },

        {
            id: "age",
            question: "What is your age?"
        }
    ]
};