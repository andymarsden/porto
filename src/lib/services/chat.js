import { resolveIntentResponse } from '$lib/services/commands.js';

const MAX_TEXTAREA_HEIGHT = 220;

function generateId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createMessage(role, content) {
	return {
		id: generateId(),
		role,
		content,
		createdAt: new Date().toISOString()
	};
}

function formatTimestamp(createdAt) {
	return new Date(createdAt).toLocaleTimeString([], {
		hour: 'numeric',
		minute: '2-digit'
	});
}

function buildMockResponse(userText) {
	return `Mock assistant response: I received your message, "${userText}". Replace this with a real API call when backend integration is ready.`;
}

function addUserAndThinkingMessages(messages, content) {
	const userMessage = createMessage('user', content);
	const thinkingMessage = createMessage('assistant', 'Thinking...');

	return {
		nextMessages: [...messages, userMessage, thinkingMessage],
		thinkingMessage
	};
}

function replaceMessageContent(messages, messageId, content) {
	return messages.map((message) => {
		if (message.id !== messageId) return message;

		return {
			...message,
			content,
			createdAt: new Date().toISOString()
		};
	});
}

async function requestAssistantResponse(userText) {
	const intentResult = await resolveIntentResponse(userText);
	if (intentResult.matched) {
		return intentResult.response;
	}

	await new Promise((resolve) => setTimeout(resolve, 900));
	return buildMockResponse(userText);
}

export {
	MAX_TEXTAREA_HEIGHT,
	addUserAndThinkingMessages,
	formatTimestamp,
	replaceMessageContent,
	requestAssistantResponse
};
