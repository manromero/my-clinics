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
- [Development workflow contract](docs/development-workflow.md): coordinator intake and delivery, separate implementer and reviewer, two correction rounds, evidence, and manual user merge. Native [implementer](.codex/agents/implementer.toml) and [reviewer](.codex/agents/reviewer.toml) configuration is validated; the [workflow history](docs/milestones/milestone-00-development-workflow/workflow-history.md) links setup evidence and accepted decisions. Start fresh agents with selected context per task and reuse them for that task's correction/review rounds. Task 03 execution evidence is recorded in its [validation report](docs/milestones/milestone-00-development-workflow/workflow-validation.md).
- [Architecture and shared components](docs/architecture.md): application organization and shared component conventions.
- [Requirements](docs/requirements.md): confirmed scope, business rules, and acceptance criteria.
- [Milestones and tasks](docs/milestones/readme.md): validated milestones, task definitions, and progress tracking.
- [Screens](docs/screens.md): proposed screens, functionality, forms, navigation, and links to the Google Stitch visual references.
- [Alexandria design guidance](docs/screens/alexandria/DESIGN.md): visual language used by the reference screens in `docs/screens/`.

All project documentation is maintained in English.

The reference spreadsheet is kept in `docs/`, alongside the [requirements specification](docs/requirements.md). Excel files are excluded from Git.

## Initial scope

1. Manage clinics, each with a default percentage and active/inactive state.
2. Record activity with percentage-based fees or direct amounts.
3. Display a monthly summary by clinic.

These modules have not been implemented yet. Their behavior is defined in the requirements and screens documents above.

See the [official Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation).
