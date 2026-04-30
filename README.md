# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Documentation

Project documentation is stored in the top-level [docs](docs/) folder.

The list below is auto-generated from markdown files in [docs](docs/). Run `npm run docs:index` after adding, removing, or renaming docs.

<!-- docs-index:start -->
- [App Areas (Web, App, Blank)](docs/app-areas.md)
- [Documentation Workflow](docs/documentation-workflow.md)
- [Robots.txt Maintenance](docs/robots.md)
<!-- docs-index:end -->

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.1 create --template minimal --no-types --add tailwindcss="plugins:typography" --install npm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
