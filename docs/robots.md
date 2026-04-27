# Robots.txt Maintenance

This project keeps crawler rules in:

- `static/robots.txt`

SvelteKit serves files from `static/` at the site root, so `static/robots.txt` becomes `/robots.txt` in production.

## Current configuration

The current file blocks all crawling:

```txt
User-agent: *
Disallow: /
```

## How to update in the future

1. Open `static/robots.txt`.
2. Update rules as needed.
3. Keep one `User-agent` block per crawler policy.
4. Commit and deploy your changes.

## Common examples

### Allow all crawling

```txt
User-agent: *
Disallow:
```

### Block all crawling

```txt
User-agent: *
Disallow: /
```

### Block one path only

```txt
User-agent: *
Disallow: /private/
```

## Deployment visibility note

This `docs/` folder is not publicly served by SvelteKit because only `static/` assets and built app output are exposed to users.

As long as you keep documentation in top-level `docs/` (not inside `static/` or `src/routes/`), visitors cannot access it via your deployed app URL.
