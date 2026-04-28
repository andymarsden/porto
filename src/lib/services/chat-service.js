//const WEBHOOK_URL = "https://infojam.app.n8n.cloud/webhook/d127981d-7968-45b4-9cbd-7efaea63a0e2";
const WEBHOOK_URL = "https://infojam.app.n8n.cloud/webhook/c1bec63f-e2c4-4f37-b634-6d0b2f8ede89";

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
	const envelope = Array.isArray(payload) ? payload[0] : payload;
	const rawMessageContent =
		envelope?.choices?.[0]?.message?.content ??
		envelope?.message?.content ??
		envelope?.content ??
		null;

	let messageContent = rawMessageContent;
	if (typeof rawMessageContent === "string") {
		const trimmed = rawMessageContent.trim();
		if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
			try {
				const parsed = JSON.parse(trimmed);
				if (parsed && typeof parsed === "object") {
					messageContent = parsed;
				}
			} catch {
				messageContent = rawMessageContent;
			}
		}
	}

	const reply =
		typeof messageContent === "string"
			? messageContent
			: messageContent?.content ?? messageContent?.reply ?? messageContent?.text;

	const sourceCandidates =
		messageContent?.sources ?? envelope?.sources ?? payload?.sources;
	const classificationCandidate =
		messageContent?.classification ?? envelope?.classification ?? payload?.classification;
	const sources = Array.isArray(sourceCandidates)
		? sourceCandidates.filter((source) => {
			if (typeof source !== "string") return false;

			try {
				const parsed = new URL(source);
				return parsed.protocol === "http:" || parsed.protocol === "https:";
			} catch {
				return false;
			}
		})
		: [];

	if (typeof reply !== "string" || !reply.trim()) {
		throw new Error("Webhook response did not include a valid assistant message content field.");
	}

	const classification =
		typeof classificationCandidate === "string"
			? classificationCandidate.trim().toUpperCase()
			: "";

	return { reply: reply.trim(), sources, classification };
}
