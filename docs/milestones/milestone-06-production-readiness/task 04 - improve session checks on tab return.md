# Task 04 — Improve session continuity and history restoration

Status: `in_progress`

## Objective

Make returning to the app and moving through browser history feel immediate
when session continuity is established. Avoid unnecessary blocking checks and
full route refreshes while preserving account isolation, authorization, data
freshness, filters, scroll, focus, and in-progress form input.

## Scope

### Investigation and policy

- Reproduce tab/app return and Back/Forward on desktop and mobile in a production
  build. Distinguish same-document App Router restoration from browser document
  restoration through bfcache, including suspension and `pageshow.persisted`.
- Separate session continuity, data freshness, and server authorization. Measure
  blocking time, request counts, Auth latency, data-query latency, rendering, and
  any repeated work. Investigate whether Task 03's refresh after the first route
  commit repeats a server render that was already freshly authorized.
- Compare conditional restoration with background revalidation, a lightweight
  session check, and the current blocking fresh-render approach. Evaluate
  Supabase `getClaims()` versus `getUser()`, token expiry, and remote revocation
  detection. Record what each check establishes and its performance cost.
- Define when cached content can be shown immediately, when background refresh
  is appropriate, and when verification must block private content. Record the
  permitted verification age and acceptable delay in detecting remote session
  revocation. Obtain the user's decision before implementing any policy that
  relaxes existing privacy guarantees; elapsed time or a cached user ID alone
  must not silently establish session validity.

### Session lifecycle and bounded caching

- Centralize session continuity and invalidation. Evaluate a session generation
  established at sign-in and invalidated on sign-out or account change, including
  signing back into the same account. Associate restored content and pending
  responses with that context and discard results from a superseded context.
- Evaluate a bounded in-memory cache and stale-while-revalidate for previously
  visited screens within the approved continuity policy. Include session context,
  route, year, month, and clinic in cache identity where applicable. Choose
  supported framework mechanisms or an appropriate client cache only after
  comparing their fit; adopting SWR or TanStack Query is not predetermined.
- Coordinate sign-in, sign-out, account changes, expiry, and invalidation across
  tabs. Account for missed notifications during suspension, overlapping events,
  and responses arriving after sign-out, account change, retry, or navigation.
  Review the existing BroadcastChannel behavior and authentication cookie updates.
- Preserve server authorization on data access and writes, RLS, and HttpOnly
  authentication cookies. Client continuity markers guide presentation; they
  must not grant access to server data.
- Invalidate affected Activity, Summary, and Clinics views after their relevant
  writes. Distinguish data invalidation from session invalidation. Bound cache
  lifetime and size and avoid sharing private data between users.

### User experience and boundaries

- Restore eligible previously visited content without a compulsory full route
  refresh. Revalidate data in the background when the approved policy allows.
  Keep a stable shell and region-level loading, streaming, or skeleton feedback
  when the destination must wait. Preserve form input and navigation context.
- Deduplicate overlapping checks and handle slow, failed, offline, and reconnect
  cases according to the policy. Provide accessible local recovery without
  treating a failed check as verified or replacing the full document solely
  because a valid response is slow.
- Record how session-aware restoration and invalidation will allow useful
  prefetch results to be reused by [Task 05](<task 05 - improve destination loading.md>).
  Task 05 owns destination prefetch and scheduling. This task owns session policy,
  conditional cache reuse, and the invalidation contract it will consume.
- OAuth provider policy changes, financial calculation changes, shared public
  caching of private data, persistent offline storage, and deployment are excluded.

## Dependencies

- [Task 03](<task 03 - stabilize signed-in navigation.md>).
- [Authentication requirements](../../requirements.md#access-and-devices),
  [S01 — Sign-in](../../screens.md#s01--sign-in), and the
  [Supabase guide](../../supabase.md).
- Installed Next.js guides for authentication, router refresh, caching, and
  prefetch. Confirm behavior against the installed version.
- Primary references for the investigation:
  [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/advanced-guide),
  [getClaims](https://supabase.com/docs/reference/javascript/auth-getclaims),
  [Next.js authentication](https://nextjs.org/docs/app/guides/authentication),
  [router refresh](https://nextjs.org/docs/app/api-reference/functions/use-router),
  [bfcache](https://web.dev/articles/bfcache),
  [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API),
  [SWR revalidation](https://swr.vercel.app/docs/revalidation), and
  [TanStack Query keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys).

## Acceptance criteria

- The chosen policy, its guarantees, any user-approved tradeoffs, and the rejected
  alternatives are recorded. Evidence distinguishes identity checks, data refresh,
  and authorization. Performance claims include measured before/after results.
- Eligible same-session Back/Forward and tab/app returns reuse existing content
  without an unconditional blocking route refresh. The same shell remains mounted;
  filters, form input, focus, URL, active link, and scroll remain consistent.
- Uncertain, expired, signed-out, or changed session contexts follow the approved
  blocking policy. Restored cached routes and late responses cannot reveal or
  reactivate private content from a superseded session, including after sign-out
  and sign-in as the same user.
- Cross-tab and restored-document scenarios remain isolated. A burst of return
  events produces no duplicate concurrent verification or repeated visible flashes.
- Creating, editing, and deleting data invalidates all affected cached views.
  Restored and subsequently prefetched views use the expected URL scope and
  show the write result under the documented freshness policy.
- Slow and failed verification, retries, late responses, offline operation, and
  reconnect have accessible local feedback and recovery consistent with the
  policy. Cold or blocked destinations keep a stable content layout.
- Cache entries and requests are bounded. Authentication credentials remain
  HttpOnly and server-side authorization remains enforced independently of UI state.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
Record comparable before-and-after production traces on desktop and touch mobile
using synthetic accounts. Report time to restored content, time to refreshed data,
blocking duration, request counts, and visible layout movement for cold, repeated,
and throttled navigation. Cover:

- Back/Forward, browser document restoration, tab/app switching, suspension,
  rapid repeated events, and scope-preserving navigation.
- Short and long absences, expiry, remote revocation under the approved detection
  policy, normal and cross-tab sign-out, account switching, and same-user sign-in
  after sign-out.
- Responses delayed across a session transition, retry, or navigation. Include
  the stale-response privacy case and the long-response stable-shell case found
  during Task 03.
- Writes followed by restored views, cache invalidation, slow and failed checks,
  offline/reconnect, and keyboard/focus/scroll/form preservation.

Identify the tested browser engines and any unverified cases. Collect
[visual evidence](../../development-workflow.md#visual-pr-evidence).

## Progress notes

The user expanded this task on 2026-11-20 to cover session continuity, history
restoration, bounded caching, invalidation and the contract for Task 05. The user
then selected conventional established-session reuse with background verification
and data revalidation; the proposed custom 30-second lease was withdrawn.

[PR 66](https://github.com/manromero/my-clinics/pull/66) is reopened for a
user-reported double loading state during ordinary screen navigation. The previous
delivery passed review after one correction round; correction round 2 is now
active. Human acceptance and manual merge remain pending.

## Execution context

- Branch: `feature/session-continuity`, based on updated `develop` at
  `f8ccff523befef138295369cdd5bd47f19928d20`; Task 03 was available on that base.
- Product head: `84c0a721d59f4102c7aed665e980d3e0b73d9c85`. Separate implementer
  and reviewer agents used the previously user-approved explicit-role fallback;
  native role selection was not exposed by this session.
- Keep server `getUser()` authorization, RLS and HttpOnly credentials independent
  of presentation metadata. The session-specific generation distinguishes
  sign-ins, including signing back into the same account.
- Reuse eligible native Router Cache content immediately, verify on foreground
  return/reconnect and refresh data in the background. A freshly authorized first
  history commit skips the former compulsory second render. Native refresh may
  evict other history entries; an evicted destination makes one fresh render.
- Session expiry follows the token and lifecycle events, without a new poll or
  verification-age lease. Remote revocation is detected at the next successful
  remote check; offline/background detection is not promised to be immediate.
- Unknown, expired, changed, failed or retired contexts block private content.
  Private server markup remains transparent, inert and hidden from accessibility
  APIs until client activation accepts its context, while retaining geometry.
- Drafts and restoration metadata are in memory, bounded to 32 URL scopes per
  session context. Native RSC allocation stays framework-managed. The durable
  retired-generation journal contains noncredential metadata only, is bounded
  to 256 entries and fails closed without evicting retired generations.
- Clinic writes invalidate Clinics, Activity and Summary; Activity writes
  invalidate Activity and Summary. Cross-tab revision notifications are distinct
  from session invalidation. Foreground refresh also observes nonlocal writes.
- Task 05 can reuse full-scope, generation-fenced native payloads under the same
  expiry/write invalidation contract and account for native background-refresh
  eviction before scheduling new prefetch work. No scheduler was added here.

## Validation and review

Detailed commands, measurements, review history and verified inline screenshots
are preserved in [PR 66](https://github.com/manromero/my-clinics/pull/66).

- `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm test` passed
  (40 files, 304 tests). The implementer's `pnpm build` passed on unchanged retry
  after the installed Next.js advisory. The reviewer independently repeated the
  static checks/tests and inspected exact-head Vercel build and tooling success.
  Hosted database checks were appropriately skipped; no schema changed.
- Initial review at `1c336e998a2602b3adac47e10ac34abba3d7723d` blocked on
  R03 (superseded generation revival) and R04 (missing validation). Correction
  round 1 fixed both. Re-review at the product head above passed code, functional
  and desktop/touch visual review with no remaining blockers or optional findings.
- R03 verification includes newer-timestamp retired-generation replay, delayed
  hydration with ten held scripts, local recovery and legitimate cold activation.
  Exact token credentials were never recorded in evidence.
- R04 evidence includes 24 baseline and 24 final-head production cases, with
  destination/scope-aware visibility and separate Auth/data/response timings.
  Both roles verified focus, scroll, drafts and URL across all six desktop/touch
  screen cases. Real document Back retained 400 px while scripts were held and
  after hydration.
- Actual expired-JWT renewal, token rotation, remote revocation, timeout/retry,
  nonlocal and cross-tab changes and precise synthetic-fixture cleanup were
  verified with the distinctions between author and reviewer evidence recorded
  in the PR. Independent Activity create/edit/delete restored matching Summary
  values; no temporary business rows were retained.
- The user explicitly authorized publication of the ten synthetic screenshots
  and sanitized report after automatic approval review required specific consent
  for the public destination. Publication then succeeded. The coordinator
  independently retrieved all ten final PNGs and verified dimensions and
  byte-identical hashes against the inspected local captures; the three initial
  historical attachments remain preserved.
- Task and milestone tracking are completed in the same PR and receive a final
  documentation-only review. Correction rounds used: 1 of 2. Human acceptance
  and manual merge remain pending in GitHub.

## Limitations and tradeoffs

- Chrome 157 desktop and touch emulation were tested; physical phones, Safari,
  Firefox and true OS suspension were not. Genuine `pageshow.persisted=true`
  was not obtained because of browser no-store exclusions; actual full-document
  Back was tested separately. Google provider policy and production deployment
  were outside scope.
- Measurements use one sample per matched case and are observations, not latency
  guarantees. Scripted foreground returns restored content in 10–12 ms while
  fresh data arrived later. Under the simulated slow link, cold private activation
  increased from roughly 0.82–0.86 s to 1.88–1.95 s because it waits for client
  context acceptance. Browser throttling did not throttle Supabase server calls.
- Corrupt, unavailable or full journal storage fails closed with accessible
  instructions to close MyClinics tabs and reset site data before signing in
  again. Retired generations are not silently forgotten to recover.
- The installed Next.js 16.4.3 security advisory remains a separate dependency
  follow-up; this task did not upgrade dependencies or claim that it resolved it.

## Post-delivery correction round 2

The user reports that switching between screens (for example Activity to Summary)
shows the destination loading label, briefly flashes, then shows the same loading
label again before the data. Investigate and correct this visible repeated load
for ordinary header navigation among all three screens, including cold/warm and
slow navigation. Do not treat a generic visible heading as proof that the intended
destination/scope is ready. Preserve session isolation, server authorization,
background freshness, URL/filter scope, drafts, focus and scroll.

- Reopened branch: `feature/session-continuity`, current head
  `c598a8f2a7d82f52b936d89da1fd3bf52b65a0e6`; PR 66 is open and unmerged.
  Updated remote `develop` still points to the original assignment base.
- Both synthetic role launchers succeeded on the production baseline. Use the
  existing local signed-in validation procedure and approved fixture project.
- Static hypotheses, not reproduced conclusions: unscoped header links can enter
  a monthly route that redirects after reading data; foreground or history refresh
  may overlap a navigation; Suspense boundaries can reset between partial commits.
  Classify actual non-prefetch destination requests, redirects, background checks
  and visible loader intervals before selecting a fix.
- This is the second and final automatic correction round, not a new task or
  reset review budget. Preserve earlier R03/R04 findings and evidence. No Task 05
  prefetch scheduler or authentication-policy change is authorized by this report.
