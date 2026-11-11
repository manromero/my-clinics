# Task 02 — Integrate Supabase sign-in and sessions

Status: `in_progress`

## Objective

Connect the sign-in page to Supabase Auth so a Google user can start, keep and
end a MyClinics session.

## Scope

Follow the [Supabase App Router SSR guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework&router=app)
for cookie-backed sessions and refresh. Start Google sign-in with
`signInWithOAuth` and exchange the PKCE code for a session in the application
callback. On success, open `/clinics`. Show Spanish feedback and allow retry
when sign-in is canceled or fails. Connect the app's sign-out action to Supabase
and return to `/login`.

This task establishes the session. Task 03 connects that session to clinic
authorization and closes the anonymous development exception.

## Dependencies

- [Task 00](<task 00 - sign-in screen structure.md>) and
  [Task 01](<task 01 - configure google provider.md>).
- [S01 — Sign-in](../../screens.md#s01--sign-in) and
  [Supabase Google OAuth flow](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

## Acceptance criteria

- A Google user can sign in from `/login` and return with a verified Supabase
  session. The callback redirects only to the intended application destination.
- The session survives reload and refreshes through the standard Supabase SSR
  flow. The UI prevents repeated sign-in submissions while a request starts.
- Cancellation and errors allow retry. Sign-out clears the session and returns
  to the sign-in page.

## Validation

Run the required application checks and build. Verify successful sign-in,
cancellation or failure, reload, refresh and sign-out against the configured
provider. Verify the live flow on desktop and mobile.

## Progress notes

Execution started on 2026-11-11. Correction rounds used: 0.

## Execution context

- Ready for implementation: Tasks 00 and 01 are merged into `develop` (PRs
  #46 and #47). Branch `feature/supabase-sign-in` starts at remote `develop`
  commit `e2e0f046261cb2ba1e9b0b6b5203f829b40eda11`.
- `src/app/login/page.tsx` contains the sign-in specimen used by the app.
  `src/app/clinics/page.tsx` currently uses the public header. Review both
  routes against the screen references, and reuse shared controls.
- The current clinic Data API client deliberately uses the anonymous role for
  synthetic development data. The existing SQL grants clinic access to `anon`
  only. Keep that client and its behavior separate from Auth in this task;
  Task 03 owns the switch to authenticated, owner-scoped clinic access.
- Use the hosted development provider configured by Task 01, with
  `http://localhost:3000/auth/callback` as the registered local callback. Read
  the official Supabase SSR guide and the installed Next.js guides before edits.
- The required live success, refresh and sign-out checks need an interactive
  Google test account. Verify the rest of the flow independently and record any
  remaining account or environment limitations. No open product decisions.
