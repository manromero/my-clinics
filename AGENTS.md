# Agent instructions

MyClinics is a web application for a dental professional to manage clinics, activity, and income.

## Project essentials

- Use pnpm for dependencies and scripts; use the version declared in `package.json` and keep `pnpm-lock.yaml` as the lockfile.
- Use Next.js App Router and TypeScript. Tailwind CSS is the selected styling approach; its setup is still pending.
- Write all project documentation in English.
- Keep shared components directly in `src/lib/components`, without subfolders until their volume justifies grouping. Read [architecture and component guidance](docs/architecture.md) before adding UI or choosing where application code belongs.
- Read the [Git workflow](docs/git-workflow.md) before creating branches, committing, merging, or tagging releases.

## Validation

For application changes, run `pnpm lint`, `pnpm typecheck`, and `pnpm format:check`. Run `pnpm build` for changes affecting the production build. For documentation-only changes, check formatting and links. Report checks that could not run.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
