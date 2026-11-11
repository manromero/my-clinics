# Task 00 — Build the sign-in screen structure

Status: `in_progress`

## Objective

Build the initial Spanish sign-in page at `/login`.

## Scope

Create the public page with the MyClinics identity and the
`Continuar con Google` control in its intended position. Reuse shared components
and follow the [S01 visual reference](../../screens.md#visual-design-references).
Keep the control inactive until Task 02 connects it to Supabase Auth.

## Dependencies

- [Milestone 01](../milestone-01-shared-components/readme.md).
- [S01 — Sign-in](../../screens.md#s01--sign-in) and [architecture](../../architecture.md).

## Acceptance criteria

- `/login` renders the intended structure on desktop and mobile.
- The application identity and sign-in control are readable and accessible.
- The page can be opened without Supabase Auth configuration. The inactive
  control starts no sign-in request.

## Validation

Run the required application checks and build. Inspect the page live and capture
desktop and mobile screenshots.

## Execution context

- Ready: the task scope, acceptance criteria, and shared-component dependency
  are available. Assignment branch: `feature/sign-in-screen`; base:
  `b1d47b4e8e9d077473800a73af09a1e360608f27` (`develop`).
- Follow [S01](../../screens.md#s01--sign-in), the Stitch HTML and PNG, and
  [Alexandria](../../screens/alexandria/DESIGN.md). Use the generic Spanish
  Google label from S01 in place of the prototype's named account and omit its
  authentication simulator. The prototype's PNG is cropped; use the HTML for
  the rest of the composition.
- Keep `/login` public and independent of Supabase configuration. Task 02 owns
  the authentication behavior. No database, session, or protected-route work
  is needed for this task.
- Run lint, typecheck, format check and production build. Verify `/login` live
  without Supabase Auth configuration, including the inactive control, and
  capture desktop and mobile evidence.
- Open questions: none. Correction rounds used: 0.

## Progress notes

Implementation assigned; independent review pending.
