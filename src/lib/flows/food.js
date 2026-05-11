export const foodFlow = {
    id: "favorite-food",

    steps: [
        {
            id: "chineese-food",
            question: "What is your favorite Chinese food?",
            setupCommand: "food.setup"
        },

        {
            id: "italian-food",
            question: "What is your favorite Italian food?",
            command: "food.check"
        }
        ,

        {
            id: "japanese-food",
            question: "What is your favorite Japanese food?",
        }
    ]
};