export const foodFlow = {
    id: "favorite-food",

    steps: [
        {
            id: "chineese-food",
            question: "What is your favorite Chinese food?",
            setupCommand: "food.setup",
            options:["[a] Dumplings", "[b] Kung Pao Chicken", "[c] Sweet and Sour Pork", "[d] Spring Rolls", "[e] Fried Rice", "[f] Noodles", "[g] Mapo Tofu", "[h] Hot Pot", "[i] Peking Duck", "[j] Dim Sum", "[k] Wonton Soup", "[l] Char Siu", "[m] Szechuan Chicken", "[n] General Tso's Chicken", "[o] Egg Rolls", "[p] Moo Shu Pork", "[q] Beef and Broccoli", "[r] Orange Chicken", "[s] Sesame Chicken", "[t] Lo Mein"],
            command: "food.politeResponse"
        
        },
        {
            id: "italian-food",
            question: "What is your favorite Italian food?",
            validate: "food.check",
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