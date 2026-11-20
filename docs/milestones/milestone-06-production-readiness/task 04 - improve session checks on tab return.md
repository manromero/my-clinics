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

The user expanded this definition on 2026-11-20 to cover session continuity,
history restoration, bounded caching, invalidation, and their relationship with
prefetch. Implementation remains pending and will be assigned in a later session.
The continuity and remote-revocation policy requires an explicit recorded decision
before any relaxation of the existing guarantees.

## Execution context

- Initial intake on 2026-11-20 was blocked; implementation had not started. Keep the task
  and milestone index `pending`. No assignment branch or PR has been created.
- The user approved separate implementer and reviewer subagents with explicit
  role instructions as a fallback for unavailable native role selection.
- The clean checkout is on `feature/stabilize-signed-in-navigation` at
  `f65b21a8752a0a7c4a726c8ed08d104f0f4c9b39`. Local `develop` and
  `origin/develop` both point to `8f2e293ff6e925fdb002c447fc6f8bf3d28f45d9`;
  these local references do not establish the current remote baseline.
- `git fetch origin develop` failed with permission denied writing
  `.git/FETCH_HEAD`. The session cannot prepare the required Git baseline.
- `pnpm start --hostname 127.0.0.1 --port 3205` could not start: Corepack attempted
  to download the pinned pnpm 11.25.0 and reported `ENOTFOUND registry.npmjs.org`.
  Required pnpm validation has not run.
- Both role invocations of `scripts/agent-validation.mjs` failed to sign in to
  their synthetic fixtures. Live signed-in checks and performance measurements
  have not run. Fixture validity has not been established.
- `gh auth status` reported an invalid credential. Recheck authentication with
  working network access before deciding whether reauthentication is needed.
- Static inspection confirms that the history guard hides the full shell on
  blur/visibility changes, verifies returns through `/auth/session`, forces a
  route refresh after the first history destination commit, and reloads bfcache
  documents. Page/layout ownership currently uses the user ID rather than a
  distinct sign-in generation. These findings are not measured performance results.
- No privacy relaxation has been approved. Complete production investigation and
  record verification-age and remote-revocation tradeoffs before asking for any
  decision that changes existing guarantees. Correction rounds used: 0 of 2.

### Resumed intake and policy proposal

The following rechecks supersede the initial access failures above. Task and
milestone status remain `pending`: the continuity-policy decision is still open,
no implementation branch has been prepared, and no application changes have been
made. Preserve the pre-existing task-file edits. Correction rounds used: 0 of 2.

- Remote access and GitHub authentication now work. Fetching `origin/develop`
  succeeded at `f8ccff523befef138295369cdd5bd47f19928d20`, which includes Task 03.
  The inspected checkout remains at
  `f65b21a8752a0a7c4a726c8ed08d104f0f4c9b39`.
- The declared pnpm 11.25.0 is available and `pnpm build` passed. Both ordinary
  synthetic fixture launchers opened isolated Chrome sessions successfully.
  Their previous connection failure was TLS certificate trust, resolved with
  `NODE_USE_SYSTEM_CA=1` while retaining TLS verification. This setting is also
  needed by the local production server in this environment.
- Production baseline investigation uses the implementer role under the
  previously approved explicit-instruction fallback. Native role selection is
  not exposed by this session. Independent investigation review remains pending.
- Initial Chrome desktop (1440 x 960) synthetic blur/focus samples concealed
  private content for 337, 107, and 114 ms. Touch-mobile emulation (390 x 844)
  samples were 156, 103, and 122 ms. Each made one `GET /auth/session` and no
  route/data refresh. Actual tab activation emitted blur, hidden, visible, and
  focus events: restoration was 104 ms desktop and 314 ms mobile emulation,
  with one session request each. These are small baseline samples, not an
  after-change comparison or physical-device evidence.
- Direct ordinary-user API samples separated identity and data latency:
  `getUser()` took 190, 81, 156, 155, and 90 ms; `getClaims()` took 45 ms cold
  and 1 ms on each of four warm calls; one owned-clinic query took 497 ms.
  Browser route timings do not establish server Auth/data request counts.
- A separate new synthetic session was signed out with `scope: "local"`, leaving
  the browser sessions untouched. Checking its previous access token through a
  new client made `getUser()` reject it (HTTP 400, 163 ms), while `getClaims()`
  accepted it (45 ms). A valid signed JWT alone does not establish current
  remote-session continuity. See [getUser](https://supabase.com/docs/reference/javascript/auth-getuser),
  [getClaims](https://supabase.com/docs/reference/javascript/auth-getclaims), and
  [session revocation](https://supabase.com/docs/guides/auth/sessions#how-to-ensure-an-access-token-jwt-cannot-be-used-after-a-user-signs-out).
- A final repeated same-document Back traversal took 561 ms to restored content
  (last blocked sample at 550 ms). Case-insensitive header classification found
  two non-prefetch destination RSC requests (275 and 333 ms), four additional
  prefetch requests, and a favicon request. The first destination response and
  the guard's unconditional refresh duplicate route work in this measured case.
  Requests can overlap; their durations must not be added as blocking time.
- An actual document-history probe did not enter browser bfcache:
  `pageshow.persisted` was false. Chrome reported no-store-related exclusion
  reasons. Persisted-document restoration and physical-device suspension remain
  unverified; same-document App Router history must be reported separately.
- Installed Next.js 16.4.3 documentation confirms that `router.refresh()` requests
  another server render and that experimental `staleTimes` does not change
  Back/Forward cache behavior. Cache age is not an authentication policy.
- Proposed decision, not approved: allow immediate reuse only within 30 seconds
  of successful remote verification, while the same session generation is
  established, the token is unexpired, and no failure/invalidation exists.
  Bound verification age by request start or a trusted server verification time,
  never by late response arrival. Recheck remotely in the background on return;
  conceal on failure or lease
  expiry. Verify before showing after longer absence, suspension, or browser
  document restoration. The proposed guarantee is concealment by verification-lease expiry while
  active, not guaranteed delivery or detection of a remote revocation within
  30 seconds. A failed or unavailable check cannot extend visible reuse.
  The conservative alternative verifies before showing on every return, then
  conditionally reuses data without a compulsory full route refresh.
- Independent reviewer source inspection confirmed the current guard behavior.
  Its fresh desktop synthetic blur/focus sample restored content after 951 ms
  with one session request, demonstrating that the earlier small latency samples
  are observations, not an upper bound. Full acceptance review has not run.
- The coordinator requested this exact policy choice from the user. Neither
  elapsed time nor a cached user ID may establish a lease. Implementation and
  branch preparation await the decision; cache implementation remains unchosen.

### Approved implementation policy and assignment

The user clarified the decision on 2026-11-20: follow conventional Next.js and
Supabase session management, show existing same-session content and revalidate in
the background when returning. The custom 30-second verification lease is
withdrawn; earlier proposals and pending-decision notes above are historical.
This authorization is a presentation policy, not an authorization bypass or
permission to weaken cross-account isolation because fixtures are synthetic.

- Readiness passed. Both dedicated synthetic fixtures were rechecked successfully;
  the production baseline runs on loopback with trusted system certificates.
- Assignment branch: `feature/session-continuity`, from updated `develop` at
  `f8ccff523befef138295369cdd5bd47f19928d20`. Existing investigation edits
  were carried forward without discarding or stashing them.
- Use supported framework cache/restoration and Supabase session mechanisms.
  Reuse eligible content within the same established, unexpired session while
  checking remotely on foreground return and reconnect. Keep freshness separate
  from authorization, and invalidate affected views after writes.
- Do not implement the proposed 30-second lease, a bespoke periodic authentication
  poll, a new persistent private-data store, or destination-prefetch scheduling.
  A cached user ID alone cannot establish session continuity. Use a session-specific
  context to reject superseded content and responses, including same-user re-login.
- Block private content for unknown, expired, signed-out or changed contexts;
  failed verification must provide local accessible recovery without being
  treated as successful. Slow verification alone must not replace the document.
- Verification age follows the server-established session/token expiry and
  lifecycle events, without a new arbitrary freshness window. Remote revocation
  becomes known at the next successful remote check; background or offline
  contexts do not have guaranteed immediate detection. Check on return/reconnect,
  and discard revoked context once detected. Preserve existing independent
  server authorization, RLS and HttpOnly credentials on all reads and writes.
- Compare native cache reuse with client-cache libraries using the installed
  framework documentation; do not add SWR/TanStack solely by assumption. Record
  concrete cache bounds, generation identity and invalidation contract for Task05.
- Separate implementer and reviewer reuse the approved explicit-role fallback.
  Handoffs include the local signed-in procedure and measured baseline. Full
  implementation checks and independent acceptance review remain outstanding.
  Correction rounds used: 0 of 2.

### Initial implementation review and correction round 1

[Draft PR 66](https://github.com/manromero/my-clinics/pull/66) contains initial
implementation `1c336e998a2602b3adac47e10ac34abba3d7723d`, independently
reviewed against `f8ccff523befef138295369cdd5bd47f19928d20`. Task and index
remain `in_progress`. Initial review is blocked; correction round 1 of 2 is
assigned, with no optional findings.

- R03 (open): accepting another generation overwrites the earlier invalidation.
  Actual module reproduction accepts A at 100, invalidates A, accepts B at 200,
  then incorrectly accepts A at 300. Terminally superseded contexts must remain
  rejected across subsequent context changes, regardless of a newer timestamp.
  Correct the fence and cover delayed old work/account-transition behavior.
- R04 (open): complete comparable cold and throttled production measurements on
  desktop and touch mobile, refreshed/restored timing, blocking, request classes,
  layout movement, cross-tab business-data invalidation and keyboard/focus/scroll
  preservation. Marker expiry is not evidence of actual token expiry; clearly
  identify real, simulated and unverified scenarios.
- Independent lint, typecheck, formatting and 297 tests passed. Reviewer verified
  actual Activity create/edit/delete and restored Summary (123.45 to 200 to 0),
  exact synthetic-row cleanup, eight-second timeout/retry, expired-marker blocking
  and HttpOnly credential-cookie flags. Desktop/mobile visual inspection of all
  three screens found no new visual blocker. This does not waive R03/R04.
- Coordinator independently retrieved all three saved inline PR images as PNG,
  checked their expected dimensions and byte equality, and visually inspected
  the retrieved files. GitHub tooling CI passed; hosted database checks skipped
  because no schema changed. Human acceptance and manual merge remain pending.
- Managed baseline-worktree preparation did not return and was stopped. A
  read-only Git worktree inventory found no new baseline checkout. A static
  tracked-source export at the exact base may be used for isolated production
  measurement without disturbing the assignment checkout or other worktrees.
