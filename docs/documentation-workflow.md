# Documentation Workflow

This project uses a small workflow to keep documentation discoverable and up to date on GitHub.

## Where documentation lives

- Put documentation files in `docs/`.
- Use markdown files (`.md`).

Important deployment note:

- Top-level `docs/` is not publicly served by SvelteKit.
- Public web assets are served from `static/`, and routes come from `src/routes/`.
- Keep private/internal docs in `docs/`, not in `static/`.

## Robots.txt location and updates

Crawler rules are managed in:

- `static/robots.txt`

Because `static/` is served at the site root, this becomes `/robots.txt` in production.

To change crawler behavior:

1. Edit `static/robots.txt`.
2. Commit and deploy.

Current full-block example:

```txt
User-agent: *
Disallow: /
```

## Auto-generated docs index in README

The README contains a managed block that is auto-generated from markdown files in `docs/`.

Script:

- `npm run docs:index`

Managed markers in `README.md`:

- `<!-- docs-index:start -->`
- `<!-- docs-index:end -->`

How generation works:

1. Scans `docs/` recursively for `.md` files.
2. Uses each file's first `# Heading` as the link title.
3. Rewrites only the marker block in `README.md`.

## Pre-commit hook setup

This repo includes a tracked git hook script at:

- `.githooks/pre-commit`

What it does before each commit:

1. Runs `npm run docs:index`.
2. Stages `README.md` if the docs list changed.

One-time setup per clone:

- Run `npm run hooks:install`

This sets git's hooks path to `.githooks` for your local clone.

## Typical usage

1. Add or edit docs in `docs/`.
2. Commit as normal.
3. The pre-commit hook updates and stages README docs links automatically.

If you prefer manual control, you can still run:

- `npm run docs:index`
