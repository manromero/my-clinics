# Task 03 — Keep the interface visible during navigation

Status: `pending`

## Objective

Remove the blank flash reported when navigating between Clínicas, Actividad,
and Resumen with a valid session.

## Scope

- Reproduce the issue in a production build, trace when the interface goes
  blank, and implement the fix supported by the findings. Record the cause
  and the evidence for the chosen approach. Evaluate App Router layout and
  loading behavior where relevant.
- Keep the shared interface visible and stable throughout normal signed-in
  navigation. Preserve active-link, history, focus, and scroll behavior.
- Include browser back and forward in the investigation while preserving
  protection against restoring private content from an old session.
  Tab-return behavior and prefetch are covered by Tasks 04 and 05.

## Dependencies

- [Task 01](<task 01 - reorder signed-in navigation.md>).
- [Architecture](../../architecture.md) and the installed Next.js guides
  for [layouts](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
  and [navigation](https://nextjs.org/docs/app/getting-started/linking-and-navigating).

## Acceptance criteria

- On desktop and mobile, navigating among the three screens in the same
  valid session has no blank document frame or visible header reset,
  including with a throttled connection. Loading, if needed, is confined
  to the changing content.
- The URL, active link, and displayed screen agree after navigation,
  including on back and forward. Existing filter-preserving links,
  keyboard navigation, and region-level retry behavior still work.
- Signed-out visits, sign-out, and restoration after sign-out or account
  change cannot reveal another session's private content.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
Use a signed-in production build. Record comparable before-and-after video
or frame traces on desktop and mobile, including throttled navigation.
Check cold URLs, back and forward, and history after sign-out.
Collect [visual evidence](../../development-workflow.md#visual-pr-evidence).

## Progress notes

Scope approved. Awaiting implementation assignment.
