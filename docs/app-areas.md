# App Areas (Web, App, Blank)

This project is split into three isolated areas, each at its own URL prefix and with its own independent layout.

## URL structure

| Area | URL prefix | Purpose |
|------|-----------|---------|
| web | `/` | Public-facing website |
| app | `/app/*` | Authenticated/sidebar-driven application |
| blank | `/blank/*` | Minimal canvas with no shell UI |

Visiting `/` renders the web area directly with no redirect.

## File structure

```
src/routes/
  (web)/
    +layout.svelte            ← Web shell layout
    +page.svelte              ← Landing page at /

  (app)/app/
    +layout.svelte            ← Sidebar shell layout
    +page.svelte              ← Landing page at /app

  (blank)/blank/
    +layout.svelte            ← Bare layout (children only)
    +page.svelte              ← Landing page at /blank
```

The `(web)`, `(app)`, and `(blank)` folder names use SvelteKit route group syntax. The parentheses prevent the group name appearing in the URL. The web area's `+page.svelte` sits directly inside `(web)/` so it resolves to `/`. The `app/` and `blank/` inner folders create their respective URL prefixes.

## How each layout works

### Web layout (`(web)/+layout.svelte`)

Wraps pages in a `min-h-screen flex flex-col` container. Add a nav bar, header, or footer here for the public-facing site.

### App layout (`(app)/app/+layout.svelte`)

Wraps pages in the sidebar shell using `Sidebar.Provider` and `AppSidebar`. Every page under `/app/*` automatically gets the sidebar. Add a top nav or breadcrumb here if needed across all app pages, or add it to individual pages if it varies per page.

### Blank layout (`(blank)/blank/+layout.svelte`)

Renders children directly with no wrapper. Inherits global CSS (fonts, colour variables) via the root layout only.

## How to add a new page to an existing area

1. Create a `.svelte` file at the appropriate path:
   - Web: `src/routes/(web)/your-page/+page.svelte`
   - App: `src/routes/(app)/app/your-page/+page.svelte`
   - Blank: `src/routes/(blank)/blank/your-page/+page.svelte`
2. The page automatically inherits its area layout. No further wiring needed.

## How to add a new area

1. Create a route group folder under `src/routes/`, for example `(admin)/admin/`.
2. Add a `+layout.svelte` inside it with the shell UI for that area.
3. Add a `+page.svelte` as the area landing page.
4. Optionally update `src/routes/+page.server.js` if you want `/` to redirect to the new area instead of `/web`.

## How to change which area / redirects to

Edit `src/routes/+page.server.js`:

```js
import { redirect } from '@sveltejs/kit';

export function load() {
  redirect(307, '/web'); // change /web to your target
}
```

## How to change the web layout shell

Edit `src/routes/(web)/web/+layout.svelte`. Add a nav bar, footer, or any wrapper HTML there.

## How to change the app sidebar

The sidebar content lives in `src/lib/components/app-sidebar.svelte`. The layout at `src/routes/(app)/app/+layout.svelte` imports and renders it. Edit the layout to change the shell structure (e.g. add a top bar above the sidebar), or edit `app-sidebar.svelte` to change the sidebar contents.

## How to share a component across all areas

Put it in `src/lib/components/` and import it in whichever layout(s) need it. Since layouts do not inherit from each other (only from the minimal root layout), you must add the import to each area layout individually.

## Global styles

All global CSS (Tailwind base, theme variables, fonts) is imported in `src/routes/layout.css`, which is loaded by the root layout. This applies to all three areas automatically. Area-specific styles should be scoped inside that area's layout or individual page components.
