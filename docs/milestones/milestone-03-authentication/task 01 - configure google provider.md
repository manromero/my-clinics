# Task 01 — Configure Google in Supabase Auth

Status: `done`

## Objective

Prepare the approved hosted Supabase environment to accept Google sign-in.

## Scope

Set up the Google OAuth consent screen and web OAuth client. Register the
Supabase provider callback in Google Cloud, then enable Google in the Supabase
Auth settings with the client ID and secret. Set the Supabase Site URL and
allowlist the application callback URLs needed by the approved environment.
Use Google's test accounts while the consent screen is in testing and document
any Google publishing steps needed for general access.

Keep the Google client secret in the provider settings and document the setup
without secret values. Task 02 implements the application callback and validates
the complete flow.

## Dependencies

- [Milestone 02 Task 03](<../milestone-02-clinic-management/task 03 - supabase local foundations.md>).
- Access to the approved Google Cloud and Supabase projects and the application
  URLs for the environment being configured.
- [Supabase guide to Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
  and [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## Acceptance criteria

- Google and Supabase are configured for the approved environment with the
  correct provider callback and application redirect URLs.
- The consent configuration supports the accounts needed to validate Task 02.
  Any remaining step for general Google access is documented.
- The setup can be reproduced from the documented settings without copying
  secrets into Git or application configuration.

## Validation

Verify the project identities and the consent, provider and redirect settings.
Record the checked environment and results without credentials.

## Progress notes

Execution started on 2026-11-11. The user created the Google OAuth web client
and identified the Google Cloud project as `myclinics-dev`. The hosted Auth
endpoint now redirects to Google with the expected provider callback.
The user confirmed External / Testing and that the intended test users were
added. [PR #47](https://github.com/manromero/my-clinics/pull/47) targets
`develop`. Human approval and manual merge remain pending. Correction rounds
used: 0.

The [hosted Google OAuth procedure](../../supabase.md#google-oauth-for-hosted-development)
records the settings needed to reproduce the setup. Credential-free HTTP checks
confirmed that the provider starts with the expected Supabase callback and that a
simulated cancellation returns to the requested local application callback or
falls back to `http://localhost:3000/` when no redirect is supplied or a foreign
origin is requested. The same-origin redirect check cannot distinguish an
explicit entry from Supabase's built-in Site URL rule.
[Supabase redirect selection](https://github.com/supabase/auth/blob/master/internal/utilities/request.go)

Independent review at `436eda5995b58fae5b49beac4cb73417947a4c1c` reproduced
the live checks and passed formatting, link and whitespace checks. It reported
no documentation defects. The user checked both dashboards and confirmed that
Supabase lists `http://localhost:3000/auth/callback` (GOOGLE-01) and that the
Google web client lists `http://localhost:3000` as the authorized origin and
`https://lvqbrjybwstvdhaxyxyn.supabase.co/auth/v1/callback` as the authorized
redirect URI (GOOGLE-02). The full application sign-in flow is Task 02.

## Execution context

- Milestone 02 Task 03 is complete. Branch `feature/google-auth-provider` is
  based on remote `develop` at `5ec142d79b3caf6e08a265753397a87287b53981`.
- Supabase target is the hosted development project (`lvqbrjybwstvdhaxyxyn`),
  per the [Supabase guide](../../supabase.md#synthetic-development-rollout).
  Google was disabled at intake. The public authorization endpoint now returns
  HTTP 302 to `accounts.google.com` with the expected provider callback.
- Local Next.js development settings: Google authorized origin and Supabase
  Site URL `http://localhost:3000`, and exact Supabase redirect URL
  `http://localhost:3000/auth/callback`. Task 02 must use the same callback.
- Google Cloud web client redirect URI: the user confirmed that the Supabase
  Google provider panel displays
  `https://lvqbrjybwstvdhaxyxyn.supabase.co/auth/v1/callback`. This is distinct
  from the application callback allowed in Supabase.
- Use External / Testing for development and the test accounts intended for Task 02.
  Request only basic sign-in scopes. Google's
  [app state guide](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview)
  documents a basic identity exception to the testing allowlist; the allowlist
  alone is not an app authorization boundary. For general access, publish the
  production OAuth app after any required Google verification and the milestone's
  security gate, then verify sign-in with an account outside the test list.
- Verify consent, client type and callback, provider enablement, Site URL and
  exact redirect list after saving. Record redacted results for independent review.
  Enter the OAuth secret directly in the Supabase Google provider settings and
  omit it from Git, application configuration, chat and evidence.
