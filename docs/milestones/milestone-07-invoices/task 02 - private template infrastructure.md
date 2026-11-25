# Task 02 — Private template infrastructure

Status: `pending`

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

## Progress notes

Planning only. Byte convention, API decisions, target permission and hosted results
remain implementation-intake work; none is claimed. Human acceptance is pending.

2026-11-26: User clarified that deep independent analysis and decision review must
precede configuration. Earlier transport observations and suggested architectures
are hypotheses only, not approved choices. No research or implementation ran now.
