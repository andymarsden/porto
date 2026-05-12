export async function checkFoodAnswer({ answer }) {

    const bannedFoods = ["pineapple pizza"];
    const normalizedAnswer = String(answer ?? "").trim().toLowerCase();
    const isValid = !bannedFoods.includes(normalizedAnswer);

    return {
        valid: isValid,
        message: isValid
            ? undefined
            : "Pineapple pizza is not allowed here. Please choose another food."
    };
}