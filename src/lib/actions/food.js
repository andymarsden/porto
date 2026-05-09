export async function checkFoodAnswer({ answer }) {

    const bannedFoods = ["pineapple pizza"];

    return {
        valid: !bannedFoods.includes(
            answer.toLowerCase()
        )
    };
}