# Task 02 — Private template infrastructure

Status: `in_progress`

## Objective

Independently investigate the best private Supabase template solution for this
application, then implement and verify the selected infrastructure. Existing
suggestions are hypotheses to challenge, not a preselected architecture.

## Scope and exclusions

Two mandatory phases: evidence-based investigation and independent decision review,
then selected infrastructure implementation/configuration. Deliver a substantive
versioned `template-storage-decision.md` in this milestone directory during this
future task, followed by applicable schema/migration/types, tests, reproducible
configuration and operator runbook/rollback. Do not create a placeholder report now.
No clinic UI, invoice history or alterations to platform-managed table definitions.
Follow [database rules](../../../supabase/AGENTS.md), [Supabase guide](../../supabase.md)
and [milestone sources](readme.md#source-references).

## Dependencies and authorization

Existing clinics/authentication; independent of 01. At implementation intake verify
exact remote identity and migration/configuration write authorization. Planning,
linking or earlier unrelated rollout permission grants none. Disposable lifecycle
and application rollout are separate scopes. Hosted unavailability is a recorded
blocker: repository files alone cannot complete this task.

## Phase 1 — Investigation and decision acceptance criteria

- Inspect actual repository code, installed dependencies/Next.js guides, deployment
  baseline and authorized hosted settings. Consult current official sources; record
  source links, inspection date, relevant versions/configuration and applicability.
  Separate verified facts, hypotheses, tradeoffs, unknowns and unresolved blockers.
- Compare meaningful viable approaches, including transfer, validation, access and
  persistence together. Candidate examples include authenticated/signed direct
  uploads versus application server handlers/proxies/actions, authoritative PDF
  validation boundaries/sequencing, Storage read/access/cache lifetimes, metadata
  association and failure atomicity/cleanup. These examples are neither mandatory
  choices nor an exhaustive catalogue; justify the comparison's coverage.
- Define measurable criteria and justify weights or a simple scoring scale before
  choosing: owner security; Save/Cancel correctness under failure/concurrency;
  valid 10 MB transfer through actual host/body/multipart limits; desktop/mobile
  performance; operational cost, complexity and maintainability; privacy and the
  lifetime of download/read access. Security/correctness constraints cannot be
  traded away for a higher aggregate score. Quantify limits, latency/resource
  behavior or costs where material and distinguish measurements from estimates.
- Resolve uncertain critical assumptions with targeted synthetic proof-of-concept
  checks within explicitly authorized targets/scope, never production. Document
  methods, versions, actual results and limitations. Reject alternatives with
  evidence rather than intuition; report remaining uncertainty instead of guessing.
- The decision report contains the comparison, evidence, risks, recommendation,
  rationale, rejected alternatives, proof results and unresolved blockers. Contract
  the chosen lifecycle, ownership/validation boundary, metadata association,
  identity/freshness mechanism, read access and recovery/cleanup for 03–06.
  Staging, promotion and immutable objects are possible techniques, not mandates.
- Independent review challenges the depth, evidence and choice against both viable
  alternatives and earlier suggestions before configuration starts. Do not choose
  implementation defaults ahead of investigation/review. Resolve routine technical
  choices through this process; seek user decisions only for actual missing product
  decisions or access authorization. A reviewed design phase can unblock 03 even
  if hosted setup is unavailable; it does not complete 02.

## Phase 2 — Selected infrastructure acceptance criteria

- Implement the reviewed choice using Supabase private owner-only storage and
  metadata. Preserve active/inactive clinics without templates and optional original
  filename display. Enforce accepted Save/Cancel semantics without partial saved
  clinic/template changes, and validate authoritative PDF bytes/clinic ownership:
  readable, unencrypted PDF with the five required text fields in requirements.
  Prevent unvalidated files from becoming usable/readable invoice templates and
  prevent path/metadata forgery. No public URLs or service secrets in client code.
- Decide/document one 10 MB byte convention across browser, authoritative validator
  and Storage; prove valid boundary files transfer through the selected route with
  overhead accounted for. Do not assume default Next.js or host limits.
- Provide reproducible hosted configuration, verification, scoped rollback and
  runbook for the chosen approach. `config.toml` alone is not hosted setup.
- Desired SQL, append-only migration, replay/upgrade tests and schema parity agree.
  Generate types using `pnpm db:types`, never by hand. Existing catalog coverage
  concerns `public`; explicitly extend applicable Storage policy/config validation
  before claiming coverage, preserving platform objects and stating coverage limits.
- Test two ordinary users and anonymous requests for select/read, insert/upload,
  update, delete and path/clinic-ID forgery, including inactive clinics. Both metadata
  and bytes are owner-only. SQL assertions alone do not prove actual Storage API
  upload/download/delete behavior.
- Verify the selected lifecycle/identity/freshness/recovery contracts and record
  departures from the reviewed report with rationale and renewed affected review.
  Both phases must pass to mark 02 done; no generated invoice storage.

## Validation

Run `pnpm db:types`, `pnpm db:validate`, and `pnpm db:test-tooling` if harness changes,
plus applicable [application checks](readme.md#completion-and-validation). Record
actual replay, parity, upgrade preservation and type freshness. Perform Storage API
transfer/boundary/ownership probes on an explicitly authorized synthetic target;
record exact head, target, cleanup and redacted results. Research/local files/SQL
role tests do not replace hosted setup and API checks. No UI screenshots required.

## Execution context

- Readiness: phase 1 research and authorized disposable probes may proceed. The
  user authorized pausing development to release capacity, then deleting disposable
  targets and restoring development after testing. The pause request returned HTTP
  200 after verifying exact project identity; follow-up status was `PAUSING`.
  Verify `INACTIVE` before provisioning. Never pause or modify production.
- Branch: `feature/private-template-infrastructure`; base is `develop` commit
  `22942979af63c2db5c7331fc9726c3a75d022f0d`.
- Authorized synthetic scope: create/test/delete disposable projects in organization
  `njnmfutclorywskqrftd`, including necessary Auth/Storage/API probe configuration.
  Persistent rollout to development requires a separate concrete reviewed scope.
- Required sequencing: investigate with substantive evidence, obtain independent
  decision review, then implement the reviewed infrastructure. No architecture is
  preselected. Both phases remain required for completion.
- Relevant references: this task, milestone index, requirements invoice section,
  `supabase/AGENTS.md`, `docs/supabase.md`, architecture, installed Next.js guides,
  current official Supabase and deployment documentation, existing database runner,
  catalog, upgrade checks and clinic ownership/save actions.
- Verified tooling: Node 24.14.0, pnpm 11.25.0, Next.js 16.4.3, Supabase CLI 3.0.0.
  Management API reads work with Node `--use-system-ca`; keep TLS verification on.
  Local ignored validation credential files exist. Never expose their values.
- Research lead, not a decision: current Vercel documentation describes a 20 MiB
  inbound-body beta under specific compute/memory settings, alongside the default
  4.5 MB limit. Verify applicability to the actual host before rejecting server
  transfer. Next.js Server Actions default to 1 MB including multipart overhead.
- Validation: task-specific proof, boundary and ownership checks plus generated
  types, replay/parity/upgrade/type freshness and applicable application checks.
  No UI screenshots are required. Do not use the paused development project for
  signed-in checks; use disposable ordinary users for Storage API probes.
- Phase 1 accepted by the independent reviewer at
  `67fd610d804b1f453e385aa7801603c29d250996`, base as above. No blockers. See
  `template-storage-decision.md` and its committed reproducible probe/results.
  The reviewer independently reran local PDF/boundary checks, lint, formatting,
  syntax, links and diff checks; inspected hosted evidence/source hash rather than
  rerunning hosted probes. No application/schema/build/type validation is claimed
  for the research-only phase.
- Research targets `jvncfmriewhwyyjrpciu`, `etxkuazppylxohjbscya` and
  `emvglsxducywzeyjwmvq` were deleted with inventory absence confirmed. Development
  was restored and verified `ACTIVE_HEALTHY`. Expanded local PAT access was
  verified without recording credentials. Repeat the authorized pause/restore
  lifecycle only when disposable validation needs capacity.
- Phase 2 implements the accepted quarantine/validated-buffer sealing/atomic
  publication/server-authorized read contract and decimal 10 MB limit. It must
  prove actual selected policies/lifecycle, not reuse model results as acceptance.
- Optional O1: research SQL conflict assertions accept generic request rejection;
  if reused for acceptance, require expected redacted SQLSTATE and winning state.
  This is not a phase 1 blocker and does not extend scope independently.
- Open items: separately scoped development rollout authorization, execution and
  target verification. Technical implementation and independent review passed;
  the task stays `in_progress` and PR stays draft until hosted setup is complete.
- Phase 2 initial review of `8cf9e8577a22fb551ac401c4b67211878520d6bc`
  found B1 blocking: `begin.uploadGrant` exports the full ordinary-user account
  token across the existing HttpOnly boundary. Independent raw REST probes could
  create/read unrelated owned clinics after cancellation without cookies. Replace
  this with a narrower transfer capability and independently re-review the
  affected transport/lifetime contract. Signed standard upload was proven;
  signed TUS was not proven by reviewer diagnostics and must not be assumed.
- Other phase 2 checks passed: implementer full replay/types/parity/upgrade and
  actual Next production proof; reviewer independently passed 383 unit tests,
  required application checks, fresh SQL and all 14 non-Next hosted lifecycle
  checks. The reviewer inspected, rather than reran, full type-generation/parity/
  upgrade and production HTTP evidence. No UI review applies.
- PR: <https://github.com/manromero/my-clinics/pull/72> (draft). All implementation
  and reviewer disposable targets were deleted and absence confirmed. Development
  was paused for correction validation and is now restored: project, database,
  Auth, REST and Storage were independently read as `ACTIVE_HEALTHY`.
- B1 fixed and independently verified at
  `402bf77f33dade2e6dbd894c8ec4c141791bae6f`: no account token is returned. A
  path-scoped, no-upsert signed TUS capability uses `/upload/resumable/sign`.
  The revised transport/lifetime contract and rollout proposal were independently
  accepted. Initial failed signed-TUS diagnostics used the different JWT endpoint.
- Current-head application checks and 383 unit tests passed. Sixteen affected
  hosted checks passed. The reviewer independently passed required application
  checks, document links and a fresh signed-transfer/credential/Cancel/expiry
  probe. Both source hashes matched recorded evidence. The previous full database
  replay/types/parity/upgrade and production HTTP evidence applies to unchanged
  SQL, generated types and read route; it was not repeated for the correction.
- Independent correction proof: 10 MB resumes without account Authorization;
  wrong path/bucket and upload-token download attempts are denied; unrelated
  account POST/GET return 401 and Auth returns 403. Cancel blocks validation and
  publication even if issued capability bytes arrive later. Expired reservations
  cannot renew grants. Saved bytes and pointer remain intact.
- Correction rounds used: 1 of 2 completed. No open code blockers or new optional
  findings. O1 is addressed. The existing Next.js security advisory remains a
  separate follow-up, not resolved by this task.

## Progress notes

2026-11-26 restoration verification: Development `lvqbrjybwstvdhaxyxyn` and its
database/Auth/REST/Storage services are `ACTIVE_HEALTHY` after restoration. A
read-only migration-history transaction returned the six existing versions through
`20261114120000`; the new `20261126160000` migration is absent. This confirms the
reviewed persistent rollout is still pending, not already applied. All disposable
projects remain removed. Final technical and documentation review passed; only
explicit persistent rollout authorization/execution/verification remains before
the task can be complete.

2026-11-26: Correction 1 technical review passed at `402bf77` with B1 fixed and no
open code blockers. The revised signed-TUS contract and concrete rollout proposal
were independently accepted. The reviewer target `cqzvbgbhximespqlqamd` and all
implementation targets were deleted with absence confirmed. Development restore
was requested successfully after the last independent probe. PR #72 remains draft
and task 02 remains `in_progress`: applying migration
`20261126160000_private_templates.sql`, private buckets, server credential and
cleanup/verification to `lvqbrjybwstvdhaxyxyn` requires separate user authorization.
No such persistent rollout or production change is claimed. Human acceptance and
manual merge remain pending. Detailed checks and review history are preserved in
the PR; final tracking changes receive documentation review.

2026-11-26: Phase 2 initial independent review of PR #72 at `8cf9e85` found B1:
the upload grant exposes the full account token rather than a file-scoped
capability. All other reviewed checks passed, including a fresh hosted lifecycle
suite and 383 unit tests. Correction round 1 is assigned to the same implementer;
the same reviewer will verify the revised transfer and security contract. Signed
TUS remains unproven; supported alternatives must be evaluated honestly. No
persistent development rollout is authorized or claimed.

2026-11-26: Phase 1 investigation and independent decision review passed at
`67fd610d804b1f453e385aa7801603c29d250996`. Actual 10 MB raw/multipart/TUS transfers,
byte hashes, owner isolation, cache revocation limitations and server-read proof
are recorded with precise limits. The reviewer accepted the proposed contract
without blocking findings; optional O1 concerns diagnostics in the research SQL
model. Phase 2 may begin; it must independently implement and validate production
policies and lifecycle. All disposable research projects are absent and development
is restored. The task remains `in_progress`, with no automatic correction rounds
used. Persistent development rollout remains separately unauthorized.

2026-11-26: The user authorized pausing `my-clinics_dev`
(`lvqbrjybwstvdhaxyxyn`) to create the disposable project. Exact ref/name/organization
were verified before requesting pause; the API returned HTTP 200. This supersedes
the earlier capacity decision blocker, subject to successful pause/provisioning.
The coordinator will restore development after disposable cleanup.

2026-11-26 authorization follow-up: The user authorized creating a disposable
project for this task, following the proposed create/test/delete scope. An actual
Management API creation attempt for a randomly named `myclinics-validation-intake-`
project in `njnmfutclorywskqrftd` returned HTTP 400, `entitlement_required` /
`free_project_limit`: the account owner has reached the two-active-Free-project
limit across organizations. No project was created and no cleanup was needed.
The authorization blocker above is superseded; capacity remains blocked. Resolving
capacity requires the user's decision to pause, remove or upgrade an existing
project, or provide another eligible authorized environment. No existing project
was changed. Shared-development rollout remains separately unauthorized.

2026-11-26 intake: The user assigned this task. Readiness is blocked before
implementation: task-specific authorization for disposable Auth/Storage/API probes
is pending, and read-only Management API inspection found the Free organization
`njnmfutclorywskqrftd` has two active projects: development
`lvqbrjybwstvdhaxyxyn` and production `xihkrkgrhupiwcsfjctp`. The existing validation
runner requires a free project slot. No existing project may be removed to obtain
capacity; the user must resolve capacity or authorize a suitable alternative target.
Shared-development rollout remains separately scoped and unauthorized for this task.
No implementation branch, configuration, disposable project, migration, generated
types, proof results or independent decision review is claimed. Correction count: 0.
The task remains `pending` at intake. Repository and official-source inspection
began; no architecture has been selected. Node Management API reads succeeded using
the Windows system certificate trust store (`--use-system-ca`), with TLS verification
enabled; the initial CLI inventory attempt failed at transport level.

Planning only. Byte convention, API decisions, target permission and hosted results
remain implementation-intake work; none is claimed. Human acceptance is pending.

2026-11-26: User clarified that deep independent analysis and decision review must
precede configuration. Earlier transport observations and suggested architectures
are hypotheses only, not approved choices. No research or implementation ran now.
