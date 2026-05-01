let currentFavoriteTeam = "Liverpool";

export function load() {
    return { favoriteTeam: currentFavoriteTeam };
}

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const favoriteTeam = String(formData.get("favoriteTeam") ?? "").trim();

        if (favoriteTeam) {
            currentFavoriteTeam = favoriteTeam;
        }

        return { success: true };
    }
};