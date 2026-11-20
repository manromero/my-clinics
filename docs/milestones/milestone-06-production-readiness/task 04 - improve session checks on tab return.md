# Task 04 — Improve session continuity and history restoration

Status: `pending`

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

The user expanded this definition on 2026-11-20 to cover session continuity,
history restoration, bounded caching, invalidation, and their relationship with
prefetch. Implementation remains pending and will be assigned in a later session.
The continuity and remote-revocation policy requires an explicit recorded decision
before any relaxation of the existing guarantees.
