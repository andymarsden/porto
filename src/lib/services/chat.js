import { resolveIntentResponse } from '$lib/services/intents.js';
import { buildNotePreview, createNote } from '$lib/services/notes.js';

const MAX_TEXTAREA_HEIGHT = 220;
const STARTUP_MESSAGES = [
    'Hi Andy,\nWhat do you want to do today....',
	'Welcome back. Ask a question or use a slash command to get started.',
	'Welcome to STAT. What can we do for you today?',
	'Hello. I can respond to messages or route slash commands through mock intents.',
	'Start anywhere. You can send a message or open the command list with /.'
];

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


async function handleCommand(userText, { isDebug = false } = {}) {
	const startedAt = Date.now();
	const intentResult = await resolveIntentResponse(userText);
	//if intent is not matched
	if (!intentResult.matched) {
		return {
			handled: false,
			messages: [],
			stateUpdates: {},
			debugMeta: null
		};
	}

	//if intent in debug command, toggle debug mode and return appropriate response
	if (intentResult.command?.name === 'db') {
		const nextIsDebug = !isDebug;
		return {
			handled: true,
			messages: [
				createMessage('user', userText),
				createMessage('assistant', nextIsDebug ? 'Debugging turned on' : 'Debugging turned off')
			],
			stateUpdates: {
				isDebug: nextIsDebug
			},
			debugMeta: {
				commandName: 'db',
				args: intentResult.args ?? '',
				resolvedAtMs: Date.now() - startedAt
			}
		};
	}

	return {
		handled: true,
		messages: [createMessage('user', userText), createMessage('assistant', intentResult.response)],
		stateUpdates: intentResult.stateUpdates ?? {},
		debugMeta: {
			commandName: intentResult.command?.name ?? '',
			args: intentResult.args ?? '',
			resolvedAtMs: Date.now() - startedAt
		}
	};
}

// Creates a new conversation. In the future this will be persisted and retrievable by ID.
function createConversation() {
	return {
		id: generateId(),
		createdAt: new Date().toISOString()
	};
}

function getStartupMessage() {
	const index = Math.floor(Math.random() * STARTUP_MESSAGES.length);
	return createMessage('assistant', STARTUP_MESSAGES[index]);
}

function formatTimestamp(createdAt) {
	return new Date(createdAt).toLocaleTimeString([], {
		hour: 'numeric',
		minute: '2-digit'
	});
}

// conversationId will be forwarded to the real API so the server can maintain context.
function buildMockResponse(userText, conversationId) {
	return `Mock assistant response (conversation: ${conversationId}): I received your message, "${userText}". Replace this with a real API call when backend integration is ready.`;
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

function toImmediateResult(messages, stateUpdates = {}) {
	return {
		kind: 'immediate',
		messages,
		stateUpdates,
		thinkingMessage: null
	};
}

function toAssistantRequestResult(messages, thinkingMessage, stateUpdates = {}) {
	return {
		kind: 'assistant-request',
		messages,
		stateUpdates,
		thinkingMessage
	};
}

async function resolveSubmission(content, { messages, awaitingNoteContent = false, isDebug = false } = {}) {
	if (awaitingNoteContent && !content.startsWith('/')) {
		const note = createNote(content);
		const assistantMessage = note
			? `Note saved: "${buildNotePreview(note.content)}"`
			: 'Please send note content in your next message.';

		return toImmediateResult(
			[...messages, createMessage('user', content), createMessage('assistant', assistantMessage)],
			{ awaitingNoteContent: !note }
		);
	}

	const commandResult = await handleCommand(content, { isDebug });
	if (commandResult.handled) {
		const nextState = {
			...commandResult.stateUpdates
		};

		if (awaitingNoteContent && content.startsWith('/')) {
			nextState.awaitingNoteContent = false;
		}

		return toImmediateResult(
			commandResult.messages.length > 0 ? [...messages, ...commandResult.messages] : messages,
			nextState
		);
	}

	const { nextMessages, thinkingMessage } = addUserAndThinkingMessages(messages, content);
	return toAssistantRequestResult(nextMessages, thinkingMessage, {
		awaitingNoteContent: awaitingNoteContent && content.startsWith('/') ? false : awaitingNoteContent
	});
}

async function requestAssistantResponse(userText, conversationId) {
	await new Promise((resolve) => setTimeout(resolve, 900));
	return buildMockResponse(userText, conversationId);
}

export {
	MAX_TEXTAREA_HEIGHT,
	createConversation,
	createMessage,
	getStartupMessage,
	addUserAndThinkingMessages,
	formatTimestamp,
	replaceMessageContent,
	resolveSubmission,
	handleCommand,
	requestAssistantResponse
};
