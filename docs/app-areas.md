# App Areas (Web, App, Blank)

This project is split into three route groups with independent layouts. Some routes have explicit URL prefixes (for example, `/app` and `/blank`), while others are grouped only for layout and do not include the group name in the URL.

## URL structure

| Area | URL prefix | Purpose |
|------|-----------|---------|
| web | `/` | Public-facing website |
| app | Mixed (`/app`, `/sandbox/*`, `/cheese`) | Sidebar-driven application area |
| blank | `/blank/*` | Minimal canvas with no shell UI |

Visiting `/` renders the web area directly with no redirect.

## File structure

```
src/routes/
  (web)/
    +layout.svelte            ← Web shell layout
    +page.svelte              ← Landing page at /

  (app)/
    +layout.svelte            ← Sidebar shell layout for all routes in (app)
    app/
      +page.svelte            ← Landing page at /app
    sandbox/
      +page.svelte            ← Landing page at /sandbox
      chat/+page.svelte       ← /sandbox/chat
      notes/+page.svelte      ← /sandbox/notes
    cheese/
      +page.svelte            ← /cheese

  (blank)/blank/
    +layout.svelte            ← Bare layout (children only)
    +page.svelte              ← Landing page at /blank
```

The `(web)`, `(app)`, and `(blank)` folder names use SvelteKit route group syntax. Parenthesized group names do not appear in URLs. URL segments come from non-parenthesized folders only (for example `app/` creates `/app`, and `sandbox/notes` creates `/sandbox/notes`).

## How each layout works

### Web layout (`(web)/+layout.svelte`)

Wraps pages in a `min-h-screen flex flex-col` container. Add a nav bar, header, or footer here for the public-facing site.

### App layout (`(app)/+layout.svelte`)

Wraps pages in the sidebar shell using `Sidebar.Provider` and `AppSidebar`. Every page in the `(app)` route group (for example `/app`, `/sandbox/*`, `/cheese`) gets the sidebar automatically.

### Blank layout (`(blank)/blank/+layout.svelte`)

Renders children directly with no wrapper. Inherits global CSS (fonts, colour variables) via the root layout only.

## How to add a new page to an existing area

1. Create a `.svelte` file at the appropriate path:
   - Web: `src/routes/(web)/your-page/+page.svelte`
  - App (under `/app`): `src/routes/(app)/app/your-page/+page.svelte`
  - App (under `/sandbox`): `src/routes/(app)/sandbox/your-page/+page.svelte`
   - Blank: `src/routes/(blank)/blank/your-page/+page.svelte`
2. The page automatically inherits its area layout. No further wiring needed.

## How to add a new area

1. Create a route group folder under `src/routes/`, for example `(admin)/admin/`.
2. Add a `+layout.svelte` inside it with the shell UI for that area.
3. Add a `+page.svelte` as the area landing page.

## How to change the web layout shell

Edit `src/routes/(web)/+layout.svelte`. Add a nav bar, footer, or any wrapper HTML there.

## How to change the app sidebar

The sidebar content lives in `src/lib/components/app-sidebar.svelte`. The layout at `src/routes/(app)/+layout.svelte` imports and renders it. Edit the layout to change the shell structure (for example add a top bar above the sidebar), or edit `app-sidebar.svelte` to change the sidebar contents.

## How to share a component across all areas

Put it in `src/lib/components/` and import it in whichever layout(s) need it. Since layouts do not inherit from each other (only from the minimal root layout), you must add the import to each area layout individually.

## Global styles

All global CSS (Tailwind base, theme variables, fonts) is imported in `src/routes/layout.css`, which is loaded by the root layout. This applies to all three areas automatically. Area-specific styles should be scoped inside that area's layout or individual page components.
