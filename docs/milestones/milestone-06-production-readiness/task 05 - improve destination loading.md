# Task 05 — Improve destination loading with prefetch

Status: `in_progress`

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
- Apply Task 04's session-continuity, cache identity, and invalidation contract
  when reusing prefetched results. Verify that eligible prefetched content avoids
  redundant blocking refreshes and is discarded when its session context changes.
  Task 04 owns that policy and any supporting bounded cache; this task owns
  destination selection, prefetch scheduling, and integration with loading states.

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

Implementation assigned on 2026-11-21 under the coordinator, implementer, and
independent reviewer workflow.

[PR 67](https://github.com/manromero/my-clinics/pull/67) contains the implementation
and detailed measurements. Independent product review passed; the PR remains a
draft and this task remains `in_progress` because required inline screenshot
publication awaits specific user authorization following an automatic approval
review rejection. No screenshots have been uploaded. Human acceptance and manual
merge remain pending.

## Execution context

- Readiness: approved scope and criteria are actionable; Tasks 03 and 04 are
  merged into `develop` (Task 04 in PR 66). No open product decisions.
- Branch: `feature/destination-prefetch`; updated `develop` base:
  `22782ee745b882ddd2320ae9d98fc979b59bde2f`. Checkout was clean at intake.
- Native `implementer` and `reviewer` roles are exposed in this session and will
  be selected sequentially, with one writer at a time.
- Verified synthetic target: `lvqbrjybwstvdhaxyxyn`. Both configured ordinary
  fixture accounts can sign in and read their active owned clinic. Chrome is
  available. Follow [local signed-in validation](../../supabase.md#local-signed-in-validation)
  independently for each role; keep credentials and raw traces private.
- Relevant sources: [requirements](../../requirements.md),
  [architecture](../../architecture.md), [screens](../../screens.md), Alexandria
  and S02/S03/S04 Stitch references, Task 04's policy and PR 66, and installed
  Next.js 16.4.3 documentation (`prefetching.md`, `loading.md`, `use-router.md`).
- Relevant code: signed-in shell, history guard, session fence and data
  invalidation helpers; main navigation and header; Activity/Summary scoped links;
  the three destination pages and their Suspense fallbacks.
- Verified finding: header monthly links already use canonical year/month/clinic
  URLs. Task 04 uses generation-fenced native Router Cache payloads and server
  authorization, with background verification and write invalidation. Preserve
  these guarantees and avoid redundant blocking refreshes.
- Investigation hypothesis: default prefetch for dynamic authenticated routes
  may not prepare complete destination data. Compare native full link prefetch,
  loading boundaries and targeted scheduling against a production baseline before
  choosing the smallest supported improvement. This is not a prescribed design.
- Validation: all four required checks, useful regression tests, comparable
  before/after desktop and touch production measurements (cold and repeat),
  early-click and failed-request recovery, monthly scope, writes, sign-out and
  account switching. Preserve sanitized timing/request/layout evidence and
  source-attributed screenshots in the PR using the required skills.
- No database/schema, OAuth provider, dependency upgrade, broad caching policy,
  persistent private storage or production deployment changes are authorized.
- Correction rounds used: 0 of 2. Human acceptance and manual merge are pending.

## Implementation and validation

- Product head: `ebf42ca793a3eafc257186b3ec0e5b6f9a7dd799`. Native full prefetch
  targets only the two alternate canonical main-navigation destinations after
  Task 04 accepts session presentation. Next.js owns scheduling and in-memory
  caching; existing session generation fences and write invalidation are retained.
- Added a route loading boundary and shared content-region skeleton. Cold or
  unfinished requests retain the shell and show pending feedback in the main area.
- Comparable production traces cover all six directed transitions, cold and
  repeat, on desktop and touch emulation. With equal 3.5-second pre-click dwell,
  baseline readiness was 405–725 ms desktop and 186–540 ms touch; final readiness
  was 9–21 ms and 14–24 ms. All 24 final cases had zero post-click destination RSC
  requests. Cold here means an unvisited destination with prefetch opportunity,
  not immediate navigation before speculative work can finish.
- Recorded movement including recent-input shifts decreased from about 0.109 on
  desktop Summary to at most 0.0185 desktop, and from up to 0.1492 touch to zero.
  These observations are not Web Vitals CLS or latency guarantees.
- Implementer checks passed: `pnpm lint`, `pnpm typecheck`,
  `pnpm format:check`, `pnpm test` (41 files, 312 tests), `pnpm build` on an
  unchanged retry, and `git diff --check`. Initial build invocations stopped on
  the installed Next.js security advisory. No security check was disabled or
  dependency changed. GitHub tooling and Vercel passed; hosted migration checks
  were appropriately skipped because no schema or generated types changed.
- Independent native reviewer verified the product head against base
  `22782ee745b882ddd2320ae9d98fc979b59bde2f`, repeated required checks and tests,
  and saved its fresh build failure/success logs. Its own 24 navigation cases
  measured 12–24 ms desktop and 15–27 ms touch, with no post-click destination
  requests or loader frames.
- Independent live checks covered held-response early navigation, failed prefetch
  recovery, monthly clinic scope, blocked-session scheduling, slow streamed
  loading, create/edit/delete totals and cleanup, late-response sign-out, and
  account switching. All eight intended implementer captures and independent
  captures were inspected against Alexandria and the relevant Stitch references.
- Product review found no blocking defects or optional UI/code findings.
  Correction rounds used: 0 of 2. The existing Next.js security upgrade is a
  separate dependency follow-up.

## Remaining blocker and limitations

- Automatic approval review rejected uploading the eight authenticated-session
  screenshots to GitHub because their external publication requires specific user
  authorization, even though fixture content is synthetic. Local captures remain
  available and independently inspected. Specific approval was requested; no
  upload retry or workaround has been attempted. PR 67 records the inventory,
  source commits, viewport metadata, results and publication limitation.
- The task and milestone remain `in_progress` until this evidence requirement is
  resolved. No product correction round was consumed by the publication blocker.
- Chrome 157 desktop and touch emulation were tested; physical devices, Safari
  and Firefox were not. Browser throttling does not throttle server-side Supabase
  calls. Google OAuth changes and production deployment are outside scope.
