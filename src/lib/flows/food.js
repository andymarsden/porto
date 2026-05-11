import { optimizeDeps } from "vite";

export const foodFlow = {
    id: "favorite-food",

    steps: [
        {
            id: "chineese-food",
            question: "What is your favorite Chinese food?",
            setupCommand: "food.setup",
            options:["Dumplings", "Kung Pao Chicken", "Sweet and Sour Pork"]
        },
        {
            id: "italian-food",
            question: "What is your favorite Italian food?",
            command: "food.check",
            options:["Pizza", "Pasta", "Lasagna"]
        },
        {
            id: "japanese-food",
            question: "What is your favorite Japanese food?",
        },
        {
            id: "indian-food",
            question: "What is your favorite Indian food?",
        }
    ]
};