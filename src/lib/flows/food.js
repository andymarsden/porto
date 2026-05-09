import { command } from "$app/server";

export const foodFlow = {
    id: "food",

    steps: [
        {
            id: "chineese-food",
            question: "What is your favorite Chinese food?",
            setup_command: "food.setup"
        },

        {
            id: "italian-food",
            question: "What is your favorite Italian food?",
            command: "food.check"
        }
    ]
};