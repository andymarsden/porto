import { beforeEach, describe, expect, it, vi } from 'vitest';

const { basicDetailsSaveFlow, foodSaveFlow } = vi.hoisted(() => ({
	basicDetailsSaveFlow: vi.fn(async ({ answers }) => ({ ok: true, answers })),
	foodSaveFlow: vi.fn(async ({ answers }) => ({ ok: true, answers }))
}));

vi.mock('$lib/commands', () => ({
	commands: {
		basicDetails: { saveFlow: basicDetailsSaveFlow },
		food: { saveFlow: foodSaveFlow }
	}
}));

import { persistCompletedFlow } from '$lib/flows/persistence.js';

describe('flow persistence resolver', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('persists answers for mapped basic details flow', async () => {
		const answers = { name: 'Andy' };

		await persistCompletedFlow('basic-details', answers);

		expect(basicDetailsSaveFlow).toHaveBeenCalledWith({ answers });
		expect(foodSaveFlow).not.toHaveBeenCalled();
	});

	it('persists answers for mapped favorite food flow', async () => {
		const answers = { 'italian-food': 'Pizza' };

		await persistCompletedFlow('favorite-food', answers);

		expect(foodSaveFlow).toHaveBeenCalledWith({ answers });
		expect(basicDetailsSaveFlow).not.toHaveBeenCalled();
	});

	it('returns null for an unmapped flow id', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		await expect(persistCompletedFlow('missing-flow', { a: '1' })).resolves.toBeNull();
		expect(basicDetailsSaveFlow).not.toHaveBeenCalled();
		expect(foodSaveFlow).not.toHaveBeenCalled();
		expect(warnSpy).toHaveBeenCalled();

		warnSpy.mockRestore();
	});
});
