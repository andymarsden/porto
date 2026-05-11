const DEFAULT_BARNSLEY_SEARCH_ENDPOINT = "https://infojam.app.n8n.cloud/webhook/c1bec63f-e2c4-4f37-b634-6d0b2f8ede89";

export const barnsleyCommands = {
    async search({ text }) {


        const payload = {
            question: text
        };

        const response = await fetch(DEFAULT_BARNSLEY_SEARCH_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        
        const result = await response.json();
        console.log("BARNSLEY", result);

        return result;
    }
}