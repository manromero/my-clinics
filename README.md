# MyClinics

A web application for a dental professional to manage clinics, activity, and income.

The current starter uses Next.js App Router, TypeScript, Tailwind CSS v4, ESLint, and Prettier, with source code under `src/` and the `@/*` import alias. Dependencies are managed with pnpm. Existing CSS Modules remain supported.

## Local development

Use Node.js 24 (the version used to create the project) and the pnpm version declared in `package.json`.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

## Styling

Tailwind CSS runs through `@tailwindcss/postcss` in `postcss.config.mjs` and is imported in `src/app/globals.css`. Add utility classes directly to components; source detection is automatic, so no `tailwind.config.js` is needed for the current setup. The home page includes a responsive example card.

See the [Tailwind CSS guide for Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs) and [project styling conventions](docs/architecture.md#nextjs-and-styling).

## Commands

| Command             | Purpose                                     |
| ------------------- | ------------------------------------------- |
| `pnpm dev`          | Start the development server                |
| `pnpm build`        | Create a production build                   |
| `pnpm start`        | Serve the production build                  |
| `pnpm lint`         | Run ESLint                                  |
| `pnpm typecheck`    | Generate Next.js types and check TypeScript |
| `pnpm format`       | Apply Prettier formatting                   |
| `pnpm format:check` | Check formatting                            |

## Project guidance

- [Agent instructions](AGENTS.md)
- [Git workflow](docs/git-workflow.md): `develop` → feature branch → `develop` → `main`, followed by a release tag on `main`.
- [Architecture and shared components](docs/architecture.md): application organization and shared component conventions.

All project documentation is maintained in English.

The reference spreadsheet is kept in the parent directory, outside the application source. Excel files are excluded from Git.

## Initial scope

1. Manage clinics and percentages by activity type.
2. Record activity with percentage-based fees or direct amounts.
3. Display a monthly summary by clinic.

These modules have not been implemented yet. Invoicing, amount reconciliation, and AI integration are planned for later iterations.

See the [official Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation).
