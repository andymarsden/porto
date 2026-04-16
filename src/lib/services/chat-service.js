const WEBHOOK_URL = "https://infojam.app.n8n.cloud/webhook/d127981d-7968-45b4-9cbd-7efaea63a0e2";

export async function sendMessageToApi(question) {
	const response = await fetch(WEBHOOK_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ question }),
	});

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}.`);
	}

	const payload = await response.json();
	const reply = payload?.[0]?.choices?.[0]?.message?.content;

	if (typeof reply !== "string" || !reply.trim()) {
		throw new Error("Webhook response did not include choices[0].message.content.");
	}

	return { reply };
}
