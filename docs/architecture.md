# Architecture and shared components

## Confirmed decisions

- Use pnpm, Next.js App Router, TypeScript, and Tailwind CSS.
- Reuse common components across screens.
- Keep shared components directly in `src/lib/components`; introduce subfolders only when their volume makes them useful.
- Keep shared logic in `src/lib` and route-specific implementation close to its route.
- Write project documentation in English.

The current application is a starter with code under `src/app` and the `@/*` import alias. Tailwind CSS v4 is configured through `@tailwindcss/postcss` in `postcss.config.mjs` and imported in `src/app/globals.css`. Existing CSS Modules remain supported. Create the shared folders below when there is code to put in them.

## Organization

Keep routes and layouts in `src/app`. Treat `src/lib` as the application's shared library: reusable logic belongs there, and reusable components belong directly in `src/lib/components`. Keep implementation details used by one route close to that route.

```text
src/
  app/
    layout.tsx
    globals.css
    page.tsx
  lib/
    components/
```

Start with a flat `src/lib/components` directory. Add groups such as `clinics`, `ui`, or `layout` only when the number of components makes navigation difficult and the grouping has a clear purpose.

| Location                                          | Responsibility                                                       | Examples                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| `src/app`                                         | Routing, layouts, loading and error boundaries, and page composition | Clinic list route                                           |
| Route-local `_components` and `_lib`, when needed | UI and helpers used by a single route                                | Route-specific filter panel                                 |
| `src/lib/components`                              | Components reused across screens                                     | Button, clinic selector, navigation                         |
| `src/lib`                                         | Shared business logic, utilities, and infrastructure                 | Fee calculations, date formatting, external service clients |

Start with route-local code for a small screen. Move reusable logic or UI into the shared library when it serves multiple screens. Keep related types and helpers close to the code that uses them.

## Component reuse

Before creating a component, look for an existing component that covers the same interaction or visual pattern. Extend it with a focused prop or compose it when that keeps its purpose clear.

Keep generic components independent of clinic, activity, or reporting rules. Both a reusable button and a reusable clinic selector belong directly in `src/lib/components`; their responsibilities can stay distinct without separate folders. Shared code should not import route files. Routes compose shared components and logic.

Extract repeated patterns when their shared behavior is understood. Avoid a generic component with many unrelated flags just to combine screens that happen to look similar. Keep keyboard interaction, labels, focus behavior, and loading, empty, and error states consistent across consumers.

No component library has been selected. Evaluate one when defining the initial UI; do not assume Tailwind CSS requires a particular library.

## Next.js and styling

Keep pages and layouts as Server Components by default. Add a Client Component boundary for state, event handlers, or browser APIs, close to the interactive part. Keep secrets and server data access out of client imports.

Use Tailwind CSS utilities for new UI and shared theme tokens for colors, typography, and spacing. Keep global CSS focused on the theme and application-wide base styles. Tailwind detects source files automatically; no JavaScript configuration file or explicit content paths are needed for the current setup. Existing CSS Modules can remain during migration. The home page includes a responsive card styled with Tailwind utilities.

## Rationale and references

Next.js supports `src` and route-local code, and presents several organization strategies without requiring a single application architecture. Using `src/lib` for shared logic and a flat `src/lib/components` for shared UI is a project convention.

- [Next.js: project structure and organization](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js: CSS and Tailwind CSS setup](https://nextjs.org/docs/app/getting-started/css)
- [AI Hero: a complete guide to AGENTS.md](https://www.aihero.dev/a-complete-guide-to-agents-md) — keep the root instructions focused and link to detailed guidance when needed.
