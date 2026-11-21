# Task 04 — Improve session continuity and history restoration

Status: `done`

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
restoration, bounded caching and invalidation. The selected policy uses conventional
established-session reuse with background verification and data revalidation; the
proposed custom 30-second lease was withdrawn.

[PR 66](https://github.com/manromero/my-clinics/pull/66) is ready for human
acceptance and manual merge after two correction rounds. The post-delivery report
of repeated destination loaders is fixed and independently verified. Agent
completion does not represent human approval or a merge.

## Execution context

- Branch: `feature/session-continuity`, based on updated `develop` at
  `f8ccff523befef138295369cdd5bd47f19928d20`; Task 03 was available on that base.
- Current product head: `77eaabca5804a7de16bf2d6233f3de8f624d25bf`. Separate
  implementer and reviewer agents used the previously user-approved explicit-role
  fallback; native role selection was not exposed by this session.
- Server `getUser()` authorization, RLS and HttpOnly credentials remain independent
  of presentation metadata. Session-specific generation distinguishes sign-ins,
  including signing back into the same account. No authentication poll, arbitrary
  verification-age lease or Task 05 prefetch scheduler was added.
- Eligible native Router Cache content is reused immediately. Foreground return
  and reconnect verify the session and refresh data in the background. A fresh
  destination server commit avoids redundant data refresh from an overlapping
  check; cached/older content and changed data revisions still refresh. This
  provenance comparison does not change authentication acceptance.
- Header links target canonical monthly URLs directly, preserving year, month
  and clinic through Clinics and dropping unsupported pagination. Initial Clinics
  uses the server-provided Madrid period. Domain scope logic stays in the signed-in
  shell; shared navigation/header components only receive generic href overrides.
- Unknown, expired, changed, failed or retired contexts block private content.
  Initial private server markup remains transparent, inert and hidden from
  accessibility APIs until client activation accepts its context, retaining layout.
  Session expiry follows the token; remote revocation is known at the next remote
  check, without promising immediate offline/background detection.
- Drafts and restoration metadata are in memory, bounded to 32 URL scopes per
  context. Native RSC allocation stays framework-managed. The durable retired
  generation journal contains noncredential metadata only, is bounded to 256
  entries and fails closed without evicting retired generations.
- Clinic writes invalidate Clinics, Activity and Summary; Activity writes
  invalidate Activity and Summary. Cross-tab revision notices remain separate
  from session invalidation, and foreground refresh observes nonlocal writes.
- Task 05 can reuse full-scope, generation-fenced native payloads under the same
  expiry/write invalidation contract and account for background-refresh cache
  eviction before scheduling new prefetch work.

## Validation and review

Detailed commands, traces, measurements, review history and evidence attribution
are preserved in [PR 66](https://github.com/manromero/my-clinics/pull/66).

- Current product head passed `pnpm lint`, `pnpm typecheck`, `pnpm format:check`,
  `pnpm test` (41 files, 310 tests) and `pnpm build` on its first invocation.
  The reviewer independently repeated the checks/tests and inspected the saved
  successful build log. Exact-head GitHub tooling and Vercel checks passed.
  Hosted database checks were appropriately skipped; no schema changed.
- Initial review at `1c336e998a2602b3adac47e10ac34abba3d7723d` blocked on
  R03 (retired-generation revival) and R04 (missing validation). Correction
  round 1 passed at `84c0a721d59f4102c7aed665e980d3e0b73d9c85`, including
  304 tests, retired replay, delayed hydration, 24 baseline/current performance
  cases, all six focus/scroll/draft cases, real token refresh/revocation, nonlocal
  and cross-tab writes with precise cleanup, and document Back scroll recovery.
- After delivery at `c598a8f2a7d82f52b936d89da1fd3bf52b65a0e6`, the user
  reported a repeated loading label during ordinary navigation. Round 2 reproduced
  bare monthly links redirecting to scoped URLs: 16 of 24 baseline cases had two
  loaders separated by an empty interval and two destination RSC requests. A
  foreground verification completing after navigation also caused an extra refresh.
- Round 2 corrected both causes at the current product head. All 24 comparable
  and 24 warm author cases settled with one destination RSC, at most one continuous
  loader and no intermediate empty state or data-to-loader recurrence. A real held
  Auth response released after fresh destination content caused no extra refresh.
- Independent final review covered all six directed header transitions on desktop
  and throttled touch (12 cases), the held Auth race, real Enter-key navigation
  with year/month/owned-clinic scope, and a retired-context held-script privacy
  spot-check. It independently parsed the baseline/corrected traces and opened
  eight current-source visual captures. No blockers or optional findings remain.
- Thirteen historical public images remain source-attributed and unchanged.
  The user explicitly authorized the ten round-1 synthetic captures/report after
  automatic review required specific consent for the public destination. All ten
  were independently retrieved and verified by dimensions and byte hashes.
  Round-2 captures remain local; the PR records the new loading timelines and
  counts without relabelling historical screenshots as current-source captures.
- Task and milestone tracking are completed in this PR and receive a final
  documentation-only review. Correction rounds used: 2 of 2. Human acceptance
  and manual merge remain pending; no automatic third correction is permitted.

## Limitations and tradeoffs

- Chrome 157 desktop and touch emulation were tested. Physical phones, Safari,
  Firefox and true OS suspension were not. Genuine `pageshow.persisted=true`
  was not obtained because of no-store exclusions; actual full-document Back
  was tested separately. Google provider changes and production deployment
  were outside scope.
- Measurements are observations, not latency guarantees. Round 1 recorded slower
  throttled cold activation (roughly 0.82–0.86 s to 1.88–1.95 s) while private
  content waited for client acceptance. Round 2 reran focused navigation/race
  traces, not a new cold-document/CLS or expiry suite. Browser throttling did not
  throttle Supabase server calls; browser counts are not exclusive server waterfalls.
- Corrupt, unavailable or full journal storage fails closed with accessible
  instructions to close MyClinics tabs and reset site data before signing in
  again. Retired generations are not silently forgotten to recover.
- The installed Next.js 16.4.3 security advisory remains a separate dependency
  follow-up. This task did not upgrade dependencies or claim to resolve it.
