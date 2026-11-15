# Task 05 — Improve destination loading with prefetch

Status: `pending`

## Objective

Make the destination feel ready sooner when switching among the app's main
sections, and avoid a jump when its content loads.

## Scope

- Measure how the three destinations load in a production build. Investigate
  what Next.js already prefetches, how dynamic authenticated routes behave,
  and whether the movement comes from a loading state or delayed data.
- Implement the best supported improvement. Compare built-in link prefetch
  and loading boundaries with more targeted prefetch if useful. Record why
  the chosen approach improves the observed transition and what remains
  uncached. Provide a stable pending state for a cold or slow destination.
- Keep prefetch limited to useful destinations and URL scopes. Preserve
  authentication, account isolation, and freshness after writes. Broad
  caching changes or speculative loading of every filter value are out of scope.

## Dependencies

- [Task 03](<task 03 - stabilize signed-in navigation.md>) and
  [Task 04](<task 04 - improve session checks on tab return.md>).
- [Activity and Summary scope](../../screens.md#screen-map) and the
  [Next.js prefetching guide](https://nextjs.org/docs/app/guides/prefetching).
  Confirm behavior against the version installed in the repository.

## Acceptance criteria

- Under comparable production-build conditions, the frequent transitions
  benefit from earlier destination readiness or less visible layout
  movement, with evidence for both cold and repeat navigation. Loading
  feedback stays in the destination content area when data is still pending.
- Desktop pointer and mobile touch navigation both remain usable, including
  when a user follows a link before a prefetch completes. The displayed data
  matches the destination URL, including links that carry a monthly scope.
- Navigation after creating, editing, or deleting data shows the expected
  result even if the destination was prefetched earlier. Prefetched private
  data cannot be reused after sign-out or an account change. No unbounded
  requests or shared caching of account data are introduced.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
Compare network and visual traces under equivalent before-and-after
conditions on desktop and mobile with synthetic signed-in data. Record what
loads before the click, time to visible destination content, request counts,
and any observed layout movement. Verify failed requests, writes,
sign-out, and account switching. Collect
[visual evidence](../../development-workflow.md#visual-pr-evidence).

## Progress notes

Scope approved. Awaiting implementation assignment.
