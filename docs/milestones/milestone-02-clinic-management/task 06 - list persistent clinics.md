# Task 06 — List persistent clinics through the service boundary

Status: `in_progress`

## Objective

Deliver the first complete vertical slice from the Clinics screen to hosted development
Supabase while establishing the required boundary for all later operations.

## Scope

Implement a clinic service, a technology-independent repository contract, the
Supabase repository implementation and typed client, and a server entry point
appropriate to the installed Next.js version. Map database DTOs to clinic domain
objects and infrastructure failures to explicit application outcomes. Keep business
validation in the service/domain without UI or infrastructure dependencies, and
preserve existing preview behavior and distinguishable outcomes. The UI calls
the server entry point, which calls the service; the service uses the repository
contract. Neither UI nor server entry points call repositories directly.

Move the existing in-memory implementation behind the same service and repository
boundary, preserving its synthetic preview scenarios and completed behavior. Keep
this layering focused; do not introduce an additional application framework.
Keep Data API disabled until Task 09; select and verify a server-only connection
compatible with that restriction when this task is assigned. Do not enable the API
or weaken the security gate to make the integration pass.
Keep credentials and privileged client setup in server-only modules, outside client
imports and bundles. Read the relevant installed Next.js documentation first.

Connect persistent listing only. Keep unsupported persistent create, edit, state
change and delete actions unavailable until their respective tasks. Separate
in-memory previews clearly so no persistent screen reports a successful write that
only changed memory. Hosted development synthetic data only; authentication remains the final
gate before real data or public use.

## Dependencies

- [Task 05](<task 05 - clinic database model.md>).
- [Tasks 01](<task 01 - clinic interactions.md>) and
  [02](<task 02 - delete clinics.md>) for preview regression coverage.
- [Architecture](../../architecture.md), [S02](../../screens.md#s02--clinics),
  and [visual references](../../screens.md#visual-design-references).

## Acceptance criteria

- The hosted development persistent list shows active and inactive clinics with correct names,
  percentages and Spanish statuses through the complete approved layer sequence.
- Domain/service contracts do not expose Supabase DTOs or SDK errors. Database
  mapping and load failures have explicit tested outcomes.
- Loading, empty, all-inactive, failure and retry states work. Reload shows the
  saved database state; unavailable persistent writes cannot falsely succeed.
- The in-memory preview uses the same service boundary and retains the completed
  interactions and deterministic failure scenarios without writing to Supabase.
- Generated database types are used by the Supabase client. Server-only code and
  secrets do not reach client imports or bundles. There are no direct repository
  calls from UI or server entry points and no added architecture framework.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Test service and
repository behavior, DTO/domain and error mapping, and the Supabase list integration
against hosted development synthetic data. Review imports and client bundles for server secrets.
Run existing preview regressions. Verify live persistent list states and retry on
desktop/mobile against S02, Alexandria and Stitch; capture evidence. Run production
build and application checks. This is not a security acceptance check.

## Progress notes

Implementation pending assignment. Planning decision recorded on 2026-11-07;
this task definition does not start implementation.

## Execution context

- Readiness: approved scope and acceptance criteria; Tasks 01, 02 and 05 are
  complete, with Task 05 merged in PR #41. Clean checkout and remote access
  verified; pnpm 11.25.0 and Node 24.14.0 available. Native implementer and
  reviewer roles are exposed by the active session.
- Branch: `feature/persistent-clinic-list`; base:
  `67605dcf49f7d48922e683aeca467ea863ec8cd7` (updated `origin/develop`).
- Sources: task, milestone, root/database agent rules, requirements, architecture,
  S02 and Alexandria/Stitch references, development/Git workflow, Supabase guide;
  installed Next.js 16.4.3 route-handler and server/client-boundary documentation.
  Official connection guidance:
  [Postgres connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
  and [Postgres.js](https://supabase.com/docs/guides/database/postgres-js).
- Verified findings: the existing `/clinics` route uses only synthetic memory
  data. Its source currently includes business validation and must be split into
  the approved service/repository boundary. Generated clinic types exist. IDs are
  bigint identity columns; preserve exact IDs as strings before numeric JavaScript
  transport. The Data API must remain disabled; use server-only PostgreSQL access,
  with generated types in the infrastructure client and explicit DTO mapping.
- Relevant files: `src/app/clinics/`, `src/lib/supabase/database.types.ts`,
  `supabase/seed.sql`, migration/schema assets, database validation scripts and CI.
- Authorization: on 2026-11-08 the user explicitly authorized Free temporary
  `myclinics-validation-*` projects in organization `njnmfutclorywskqrftd`, synthetic
  migration/seed/test writes with Data API disabled, cleanup, and the existing CI
  secret. Shared development `lvqbrjybwstvdhaxyxyn` is excluded from writes. No
  authorization to extract stored local credentials is implied.
- Constraints: persistent listing only; persistent writes unavailable. Preserve
  separate memory previews, interaction regressions and deterministic failures.
  No public deployment, real data, local database/Docker, authentication work,
  Data API enablement, new framework or manual edits to generated types.
- Validation: service/repository and DTO/error tests; preview regressions; real
  hosted PostgreSQL listing with Data API disabled; live desktop/mobile states
  and retry; Alexandria/Stitch comparison and screenshots; lint, typecheck,
  formatting, production build; inspect imports and browser bundles for secrets.
  Capture exact heads, CI/evidence links and infrastructure limitations.
- Open product questions: none. A shared-development application connection is
  not configured; integration validation uses the authorized disposable targets.
  Verify direct/pooler connectivity in that environment rather than assuming it.
- Correction rounds used: 0 of 2.
