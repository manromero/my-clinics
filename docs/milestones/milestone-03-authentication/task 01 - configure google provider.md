# Task 01 — Configure Google in Supabase Auth

Status: `pending`

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

Implementation pending assignment.
