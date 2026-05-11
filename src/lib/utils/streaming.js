import { wait } from "$lib/utils.js";

export function chunkTextByWords(text, wordsPerChunk = 1) {
    const normalizedText = String(text ?? "");
    if (!normalizedText) return [];

    const normalizedWordsPerChunk = Math.max(1, Number(wordsPerChunk) || 1);
    const tokens = normalizedText.match(/\S+|\s+/g) ?? [];

    const chunks = [];
    let currentChunk = "";
    let wordsInChunk = 0;

    for (const token of tokens) {
        currentChunk += token;

        if (/\S/.test(token)) {
            wordsInChunk += 1;
        }

        if (wordsInChunk >= normalizedWordsPerChunk) {
            chunks.push(currentChunk);
            currentChunk = "";
            wordsInChunk = 0;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}

export async function streamTextByWords(text, options = {}) {
    const {
        wordsPerChunk = 1,
        delayMs = 30,
        onChunk,
        waitFn = wait,
    } = options;

    const chunks = chunkTextByWords(text, wordsPerChunk);
    let accumulatedText = "";

    for (let index = 0; index < chunks.length; index += 1) {
        accumulatedText += chunks[index];
        onChunk?.(accumulatedText, chunks[index]);

        if (delayMs > 0 && index < chunks.length - 1) {
            await waitFn(delayMs);
        }
    }

    return accumulatedText;
}
