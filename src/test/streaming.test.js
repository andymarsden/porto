import { describe, expect, it, vi } from 'vitest';

import { chunkTextByWords, streamTextByWords } from '$lib/utils/streaming.js';

describe('streaming utils', () => {
	it('chunks text by words while preserving whitespace', () => {
		expect(chunkTextByWords('one  two\nthree', 2)).toEqual(['one  two', '\nthree']);
	});

	it('uses a minimum chunk size of one word', () => {
		expect(chunkTextByWords('one two', 0)).toEqual(['one', ' two']);
	});

	it('streams chunks in order and returns the final text', async () => {
		const updates = [];
		const waitFn = vi.fn(() => Promise.resolve());

		const result = await streamTextByWords('one two three', {
			wordsPerChunk: 2,
			delayMs: 10,
			onChunk: (nextText, chunk) => {
				updates.push({ nextText, chunk });
			},
			waitFn
		});

		expect(result).toBe('one two three');
		expect(updates).toEqual([
			{ nextText: 'one two', chunk: 'one two' },
			{ nextText: 'one two three', chunk: ' three' }
		]);
		expect(waitFn).toHaveBeenCalledTimes(1);
		expect(waitFn).toHaveBeenCalledWith(10);
	});
});
