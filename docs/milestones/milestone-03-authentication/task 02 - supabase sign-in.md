# Task 02 — Integrate Supabase sign-in and sessions

Status: `pending`

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

Implementation pending assignment.
