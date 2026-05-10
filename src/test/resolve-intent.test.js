import { beforeEach, describe, expect, it, vi } from 'vitest';

const { startFlowMock, playEnqueueMock, debugEchoMock, getLastSavedFlowMock } = vi.hoisted(() => ({
	startFlowMock: vi.fn(),
	playEnqueueMock: vi.fn(),
	debugEchoMock: vi.fn(),
	getLastSavedFlowMock: vi.fn()
}));

vi.mock('$lib/flows/engine.js', () => ({
	startFlow: startFlowMock
}));

vi.mock('$lib/commands', () => ({
	commands: {
		play: { enqueue: playEnqueueMock },
		debug: { echo: debugEchoMock },
		basicDetails: { getLastSavedFlow: getLastSavedFlowMock }
	}
}));

import { resolveIntent } from '$lib/intent/resolve_intent.js';

describe('resolveIntent /play command', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		playEnqueueMock.mockResolvedValue({ ok: true, payload: { music: 'random' } });
	});

	it('uses random music payload when command has no argument', async () => {
		const response = await resolveIntent('/play');

		expect(playEnqueueMock).toHaveBeenCalledWith({ music: 'random' });
		expect(response).toEqual({
			text: 'Queued music: random',
			activeFlow: null
		});
	});

	it('uses trailing command text as music payload', async () => {
		const response = await resolveIntent('/play lofi beats');

		expect(playEnqueueMock).toHaveBeenCalledWith({ music: 'lofi beats' });
		expect(response).toEqual({
			text: 'Queued music: lofi beats',
			activeFlow: null
		});
	});

	it('defaults to random for whitespace-only argument', async () => {
		const response = await resolveIntent('/play    ');

		expect(playEnqueueMock).toHaveBeenCalledWith({ music: 'random' });
		expect(response).toEqual({
			text: 'Queued music: random',
			activeFlow: null
		});
	});

	it('returns a safe failure message when play command fails', async () => {
		playEnqueueMock.mockResolvedValue({ ok: false, payload: { music: 'house' } });

		const response = await resolveIntent('/play house');

		expect(playEnqueueMock).toHaveBeenCalledWith({ music: 'house' });
		expect(response).toEqual({
			text: 'Could not queue music right now. Tried: house',
			activeFlow: null
		});
	});
});
