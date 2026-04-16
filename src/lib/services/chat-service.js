// Mock async chat call shaped like a future API request.
export async function sendMessageToApiMock(userText) {
	await new Promise((resolve) => setTimeout(resolve, 700));

	if (userText.trim().toLowerCase() === "/fail") {
		throw new Error("Mock API failure triggered.");
	}

	return {
		reply: `Echo: ${userText}`,
	};
}
