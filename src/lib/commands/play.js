const DEFAULT_PLAY_ENDPOINT = "https://infojam.app.n8n.cloud/webhook/79a3ad2d-28ee-493f-bc29-4c27706f85cc";

function normalizeMusicValue(value) {
    const normalized = String(value ?? "").trim();
    return normalized || "random";
}

function getPlayEndpoint() {
    const configuredEndpoint = String(import.meta.env.PUBLIC_PLAY_API_URL ?? "").trim();
    return configuredEndpoint || DEFAULT_PLAY_ENDPOINT;
}

export const playCommands = {
    async enqueue({ music }) {
        const payload = {
            music: normalizeMusicValue(music)
        };

        const endpoint = getPlayEndpoint();

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            let responseBody = null;

            try {
                responseBody = await response.clone().json();
            } catch {
                responseBody = null;
            }

            console.log("[play.enqueue] API response", {
                endpoint,
                payload,
                status: response.status,
                returned: responseBody
            });

            if (!response.ok) {
                return {
                    ok: false,
                    status: response.status,
                    payload
                };
            }

            return {
                ok: true,
                status: response.status,
                payload,
                data: responseBody
            };
        } catch (error) {
            console.warn("[play.enqueue] Dummy API request failed", error);

            return {
                ok: false,
                payload,
                error: "request_failed"
            };
        }
    },
    createCard(data) {
        return {
            type: "album",
            name: data?.name ?? "Unknown album",
            artist: data?.artists?.[0]?.name ?? "Unknown artist",
            // use the 300px image if available, fall back down the list
            imageUrl: data?.images?.[1]?.url ?? data?.images?.[0]?.url ?? null,
        };
    }
};

//{{ JSON.parse($json.output[1].content[0].text).albumuri}}

// {{$json.body.music}}