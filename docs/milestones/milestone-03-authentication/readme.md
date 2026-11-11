# Milestone 03 — Authentication

The user defined this milestone on 2026-11-11 by splitting the former
Milestone 02 authentication task. Implementation starts when each task is assigned.

## Objective

Let anyone with a Google account sign in to MyClinics through Supabase Auth.
Each user can list, create, edit, deactivate and reactivate only their own clinics.

## Scope

- Build the Spanish sign-in screen, configure Google as a Supabase Auth provider
  and integrate sign-in, session handling and sign-out in Next.js.
- Protect the Clinics screen and its server operations with a verified session.
  Use Supabase Row Level Security (RLS) and database grants for owner-only access.
- Replace the [synthetic development exception](../../supabase.md#synthetic-development-rollout)
  before using real data or opening the app for public use.
- Keep persistent clinic deletion deferred until real activity references can
  enforce eligibility. Activity and additional authentication providers are outside
  this milestone.

## Task index

| Task                                                                               | Status        | Direct dependencies                                                                                    |
| ---------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| [00 — Build the sign-in screen structure](<task 00 - sign-in screen structure.md>) | `in_progress` | Milestone 01                                                                                           |
| [01 — Configure Google in Supabase Auth](<task 01 - configure google provider.md>) | `pending`     | [Milestone 02 Task 03](<../milestone-02-clinic-management/task 03 - supabase local foundations.md>)    |
| [02 — Integrate Supabase sign-in and sessions](<task 02 - supabase sign-in.md>)    | `pending`     | 00, 01                                                                                                 |
| [03 — Restrict clinics to their owners](<task 03 - authorize clinic access.md>)    | `pending`     | 02, [Milestone 02 Task 08](<../milestone-02-clinic-management/task 08 - update persistent clinics.md>) |

## Delivery and validation

Follow the [development workflow](../../development-workflow.md) for each assigned
implementation task. Validate UI on desktop and mobile against [S01](../../screens.md#s01--sign-in),
[S02](../../screens.md#s02--clinics) and the [visual references](../../screens.md#visual-design-references).
Follow the [hosted database workflow](../../supabase.md) for schema changes and validation.

## Completion criteria

All tasks pass their checks and independent review, receive human acceptance and
are merged into `develop`. Two Google accounts can sign in independently. Each
can manage its own clinics and see saved changes across sessions and devices.
Signed-out requests cannot access clinics. The other account's data remains
inaccessible through both the app and the Data API. The temporary anonymous
grants and policies are removed. Before public use, verify that Google sign-in
works for accounts outside the consent screen's test-user list.
