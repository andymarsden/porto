import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/commands/execute', () => ({
	executeCommand: vi.fn()
}));

import { executeCommand } from '$lib/commands/execute';
import { saveFlowAnswer, startFlow } from '$lib/flows/engine.js';

describe('flow engine', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns null when starting unknown flow id', async () => {
		await expect(startFlow('missing-flow')).resolves.toBeNull();
		expect(executeCommand).not.toHaveBeenCalled();
	});

	it('runs first step setup command when starting food flow', async () => {
		executeCommand.mockResolvedValue({ ok: true });

		const result = await startFlow('favorite-food');

		expect(executeCommand).toHaveBeenCalledWith('food.setup', {
			id: 'favorite-food',
			stepId: 'chineese-food',
			answers: {}
		});
		expect(result).toMatchObject({
			id: 'favorite-food',
			currentStep: 0,
			answers: {}
		});
	});

	it('continues flow start when setup command fails', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		executeCommand.mockRejectedValue(new Error('setup failed'));

		const result = await startFlow('favorite-food');

		expect(result).not.toBeNull();
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it('passes merged answers to step command and advances flow', async () => {
		executeCommand.mockResolvedValue({ ok: true });
		const activeFlow = {
			id: 'basic-details',
			currentStep: 0,
			answers: { existing: 'yes' },
			flow: {
				steps: [
					{ id: 'name', question: 'Name?', command: 'debug.echo' },
					{ id: 'age', question: 'Age?' }
				]
			}
		};

		const result = await saveFlowAnswer(activeFlow, ' Andy ');

		expect(executeCommand).toHaveBeenCalledWith('debug.echo', {
			answer: 'Andy',
			stepId: 'name',
			answers: {
				existing: 'yes',
				name: 'Andy'
			}
		});
		expect(result.activeFlow.currentStep).toBe(1);
		expect(result.activeFlow.answers).toEqual({
			existing: 'yes',
			name: 'Andy'
		});
		expect(result.nextStep?.id).toBe('age');
		expect(result.isComplete).toBe(false);
	});

	it('marks flow complete at final step', async () => {
		const activeFlow = {
			id: 'basic-details',
			currentStep: 0,
			answers: {},
			flow: {
				steps: [{ id: 'name', question: 'Name?' }]
			}
		};

		const result = await saveFlowAnswer(activeFlow, 'Andy');

		expect(result.isComplete).toBe(true);
		expect(result.nextStep).toBeNull();
		expect(result.answers).toEqual({ name: 'Andy' });
	});

	it('continues flow progression when step command fails', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		executeCommand.mockRejectedValue(new Error('step failed'));
		const activeFlow = {
			id: 'basic-details',
			currentStep: 0,
			answers: {},
			flow: {
				steps: [
					{ id: 'name', question: 'Name?', command: 'debug.echo' },
					{ id: 'age', question: 'Age?' }
				]
			}
		};

		const result = await saveFlowAnswer(activeFlow, 'Andy');

		expect(result.activeFlow.currentStep).toBe(1);
		expect(result.nextStep?.id).toBe('age');
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});
