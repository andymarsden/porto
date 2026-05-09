# Porto Testing

This guide explains how automated tests are set up for the Porto chat page and how to add new tests.

## Test stack

Porto tests use:

- `vitest` for running tests
- `@testing-library/svelte` for rendering Svelte components and user interactions
- `jsdom` as the browser-like environment
- `@testing-library/jest-dom` for readable DOM assertions
- `@vitest/coverage-v8` for coverage reports

## Files added

- `src/test/porto-page.test.js`: Porto page behavior tests
- `src/test/setup.js`: global test setup (`jest-dom` matchers)
- `vite.config.js`: Vitest config (`test` block)

## Run tests

From the project root:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:coverage
```

Coverage HTML output is generated under `coverage/`.

## What Porto tests currently cover

- Enter submits the composer and sends message flow
- Shift+Enter does not submit
- Thinking state is shown while awaiting response
- Composer disables while thinking and re-enables after response
- Fallback assistant text is used when intent resolver returns `null` or `undefined`

## How to write a new Porto test

1. Open `src/test/porto-page.test.js`.
2. Add a new `it(...)` case inside the existing `describe('Porto page', ...)` block.
3. Render the page with Testing Library:

```js
render(Page);
```

4. Get the composer textarea by label (stable selector):

```js
const composer = screen.getByLabelText('Message');
```

5. Simulate user input/interaction:

```js
await fireEvent.input(composer, { target: { value: '/echo hi' } });
await fireEvent.keyDown(composer, { key: 'Enter' });
```

6. Assert UI outcome:

```js
expect(await screen.findByText('Echo: hi')).toBeInTheDocument();
```

## Mocking intent behavior

Porto page calls `resolveIntent` from `src/lib/intent/resolve_intent.js`. The test file mocks that module to keep tests deterministic and fast.

Examples:

```js
resolveIntent.mockResolvedValue('Echo: hello');
```

```js
resolveIntent.mockResolvedValue(undefined);
```

For pending states, use a deferred promise so you can assert loading UI before resolving.

## Troubleshooting

- If tests fail with missing DOM APIs, confirm `test.environment` is `jsdom` in `vite.config.js`.
- If `toBeInTheDocument` is unknown, confirm `src/test/setup.js` imports `@testing-library/jest-dom/vitest`.
- If selectors are brittle, prefer accessible queries like `getByLabelText`, `getByRole`, or visible text.
