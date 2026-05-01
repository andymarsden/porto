# Theming

This project uses CSS custom properties (variables) defined in `src/routes/layout.css` to control the colour scheme. All colours use the `oklch` colour space.

## How the colour system works

Shadcn-svelte components consume a set of semantic CSS variables such as `--background`, `--foreground`, `--sidebar`, etc. Changing a variable value here updates every component that references it — no component-level edits needed.

## Key variables

| Variable | Purpose |
|----------|---------|
| `--background` | Main page/content area background |
| `--foreground` | Default text colour on the background |
| `--sidebar` | Sidebar panel background |
| `--sidebar-foreground` | Default text colour inside the sidebar |
| `--muted` | Muted surface colour (used for cards, skeletons, etc.) |

## Swapping sidebar and main background colours

By default the convention from shadcn is:

- Main background — pure white (`oklch(1 0 0)`)
- Sidebar — off-white/muted (`oklch(0.985 0 0)`)

This project swaps those so the content area feels slightly recessed and the sidebar stands out:

- Main background — off-white/muted (`oklch(0.985 0 0)`)
- Sidebar — pure white (`oklch(1 0 0)`)

To change this, edit the two variables in `src/routes/layout.css` inside the `:root` block:

```css
:root {
  --background: oklch(0.985 0 0); /* muted gray — main content area */
  --sidebar:    oklch(1 0 0);     /* white — sidebar panel */
}
```

Swap the values back if you want to return to the shadcn default.

## Dark mode

The same variables are overridden inside the `.dark` class block further down in `layout.css`. Keep both in sync when adjusting colours.
