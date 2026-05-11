import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';

vi.mock('$lib/intent/resolve_intent.js', () => ({
	resolveIntent: vi.fn()
}));

vi.mock('$lib/utils.js', async () => {
	const actual = await vi.importActual('$lib/utils.js');
	return {
		...actual,
		wait: vi.fn(() => Promise.resolve())
	};
});

import Page from '../routes/(app)/sandbox/porto/+page.svelte';
import { resolveIntent } from '$lib/intent/resolve_intent.js';
import { wait } from '$lib/utils.js';

function createDeferred() {
	let resolve;
	const promise = new Promise((res) => {
		resolve = res;
	});
	return { promise, resolve };
}

function getComposer() {
	return screen.getByLabelText('Message');
}

describe('Porto page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		wait.mockImplementation(() => Promise.resolve());
	});

	afterEach(() => {
		cleanup();
	});

	it('submits with Enter and renders assistant response', async () => {
		resolveIntent.mockResolvedValue('Echo: hello');
		render(Page);

		const composer = getComposer();
		await fireEvent.input(composer, { target: { value: '/echo hello' } });
		await fireEvent.keyDown(composer, { key: 'Enter' });

		expect(resolveIntent).toHaveBeenCalledWith('/echo hello');
		expect(await screen.findByText('/echo hello')).toBeInTheDocument();
		expect(await screen.findByText('Echo: hello')).toBeInTheDocument();
		expect(screen.queryByLabelText('Assistant is thinking')).not.toBeInTheDocument();
	});

	it('does not submit on Shift+Enter', async () => {
		render(Page);

		const composer = getComposer();
		await fireEvent.input(composer, { target: { value: '/echo no-submit' } });
		await fireEvent.keyDown(composer, { key: 'Enter', shiftKey: true });

		expect(resolveIntent).not.toHaveBeenCalled();
		expect(screen.queryByText('/echo no-submit')).not.toBeInTheDocument();
	});

	it('shows thinking state while response is pending and re-enables composer after completion', async () => {
		const deferred = createDeferred();
		resolveIntent.mockReturnValue(deferred.promise);
		render(Page);

		const composer = getComposer();
		await fireEvent.input(composer, { target: { value: '/echo pending' } });
		await fireEvent.keyDown(composer, { key: 'Enter' });

		const thinkingElements = await screen.findAllByLabelText('Assistant is thinking');
		expect(thinkingElements.length).toBeGreaterThan(0);
		expect(composer).toBeDisabled();

		deferred.resolve('Echo: done');

		expect(await screen.findByText('Echo: done')).toBeInTheDocument();
		await waitFor(() => {
			expect(composer).not.toBeDisabled();
		});
		expect(screen.queryByLabelText('Assistant is thinking')).not.toBeInTheDocument();
	});

	it('uses fallback text when resolver returns nullish', async () => {
		resolveIntent.mockResolvedValue(undefined);
		render(Page);

		const composer = getComposer();
		await fireEvent.input(composer, { target: { value: '/unknown' } });
		await fireEvent.keyDown(composer, { key: 'Enter' });

		await waitFor(() => {
			expect(document.body.textContent).toContain('Unknown command. Try /echo <message>.(from page)');
		});
	});

	it('streams assistant text in chunked updates before completion', async () => {
		const streamTickResolvers = [];
		wait.mockImplementation((ms) => {
			if (ms === 700) {
				return Promise.resolve();
			}

			return new Promise((resolve) => {
				streamTickResolvers.push(resolve);
			});
		});

		resolveIntent.mockResolvedValue('Echo: hello there friend');
		render(Page);

		const composer = getComposer();
		await fireEvent.input(composer, { target: { value: '/echo hi' } });
		await fireEvent.keyDown(composer, { key: 'Enter' });

		await waitFor(() => {
			expect(document.body.textContent).toContain('Echo: hello');
		});
		expect(document.body.textContent).not.toContain('Echo: hello there friend');
		expect(composer).toBeDisabled();

		expect(streamTickResolvers.length).toBeGreaterThan(0);
		streamTickResolvers.shift()?.();

		await waitFor(() => {
			expect(document.body.textContent).toContain('Echo: hello there friend');
		});
		await waitFor(() => {
			expect(composer).not.toBeDisabled();
		});
	});

	it('renders album card when /play command is submitted', async () => {
		resolveIntent.mockResolvedValue({
			text: null,
			activeFlow: null,
			card: {
				type: 'album',
				name: 'Comfort Eagle',
				artist: 'CAKE',
				imageUrl: 'https://example.com/cover.jpg'
			}
		});
		render(Page);

		const composer = getComposer();
		await fireEvent.input(composer, { target: { value: '/play comfort eagle' } });
		await fireEvent.keyDown(composer, { key: 'Enter' });

		expect(resolveIntent).toHaveBeenCalledWith('/play comfort eagle');
		expect(await screen.findByText('/play comfort eagle')).toBeInTheDocument();
		expect(await screen.findByText('Comfort Eagle')).toBeInTheDocument();
		expect(await screen.findByText('CAKE')).toBeInTheDocument();
	});
});
