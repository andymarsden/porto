# Notes Sandbox Page

## Overview

The Notes page in the sandbox area displays notes created from chat commands.

Route:

- `/app/sandbox/notes`

Primary source:

- `src/lib/services/chat/note.js`

## What The Page Shows

The page renders:

- Title (`title`)
- Created timestamp (shown as relative time, with absolute datetime available on hover)
- Note content (`content`)

If no notes exist, an empty-state message is shown.

## Refresh Behavior

The page updates notes in two ways:

1. Automatic refresh every 3 seconds
2. Manual refresh via the `Refresh` button

The auto-refresh interval is cleaned up when the page is destroyed.

## Data Model

Notes are currently in-memory and reset on full page reload.

```js
{
  id: string,
  title: string,
  content: string,
  createdAt: string
}
```

The page does not display the note ID in the card UI.

## Relationship To Chat

Notes are typically created from chat using one of these prefixes:

- `/n`
- `create note`
- `new note`

Example:

```text
/n buy milk
```

After note creation, chat may prompt for an optional title.

## Known Limitation

Because notes are stored in memory only, notes are not persisted across refreshes or restarts.

## Future Improvements

1. Persist notes in localStorage using existing serialize/load helpers.
2. Add note sorting controls (newest first / oldest first).
3. Add search and filtering by title/content.
4. Add note editing and deletion from the notes page.
