# Global workflow exercise assignment

Approved scope: the representative Task 03 exercise from Task 00, with the user's
2026-10-28 authorization to execute and format five existing visual references.
This document refines technical exercise details without adding clinic behavior.

## Temporary UI

Create `/workflow-demo` as an isolated temporary Next.js route. Keep the existing
home page and shared product behavior unchanged. Use route-local client state.

- Show a single responsive card titled `Prueba del flujo`, a short explanation,
  and initial visible status `Pendiente` in a polite live region.
- Primary button `Completar prueba` changes status to `Completado` and becomes
  disabled. Secondary button `Reiniciar` restores `Pendiente` and enables it.
- Use native buttons, visible keyboard focus, readable contrast, and no clipped
  text or horizontal overflow at 1440×900 and 390×844. Verify repeated completion
  and reset, keyboard activation, and a fresh load starting pending.
- Follow Alexandria's blue primary action, tonal surfaces, generous whitespace,
  rounded card and serif heading/sans body. Consult the activity screen's local
  Stitch HTML/screenshot for visual language; this small exercise is not a replica
  of a product screen. Use available font fallbacks, with no new network font or
  dependency requirement.
- No persistence, patient/clinic data, authentication, API, external submission,
  new dependencies, component-library decision, or product scope.

Capture desktop/mobile pending and completed states, viewport and commit, and
functional/keyboard observations. The reviewer independently inspects actual code,
reference images and captured running result; identify who performed live actions.
Remove the temporary route before final ready delivery and review that removal.
Retain its source snapshot or commit references and visual evidence in this
milestone's exercise history so the review remains auditable.

## Real fixture correction

Create an isolated working fixture under `validation-fixtures/workflow/`, outside
production imports. Its `countAtOrBelow(values, limit)` specification matches the
existing reviewer exercise: count finite values less than or equal to a finite
limit, preserve input, include repeated boundaries, zero, negatives and empty input.
Input validation and performance work are excluded.

For initial review, seed the working implementation from the existing intentional
strict-comparison defect in `validation-fixtures/reviewer/initial.mjs`. Its runner
must exercise that working file directly and report the equality failure. Record
this as an expected initial fixture blocker, not a failing product check.

The reviewer must produce a concrete blocker with location, impact, reproduction,
and verification; adding a JSDoc usage example is explicitly optional. The same
implementer must then edit the working implementation, commit the actual fix, and
rerun its check. The same reviewer verifies the new commit and closes the blocker.
Do not satisfy this by selecting an already-written corrected file. Retain the
corrected working fixture and its checks; history records the initial commit.

## Required checks and bounded handoffs

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for the
temporary app changes; rerun relevant checks after corrections and route removal.
The user approved formatting only these existing baseline references:

- `docs/screens/alexandria/DESIGN.md`
- `docs/screens/s01_iniciar_sesi_n/code.html`
- `docs/screens/s02_gesti_n_de_cl_nicas/code.html`
- `docs/screens/s03_actividad_mensual/code.html`
- `docs/screens/s04_resumen_mensual/code.html`

Keep their content and visual intent intact. Do not add dependencies or unrelated
changes to make checks pass. Report any failed/unavailable required checks as such.

Use documented simulations for product ambiguity, missing evidence, disagreement
and a blocker after round 2. Demonstrate the concrete coordinator/user handoff,
without manufacturing extra defects or claiming simulations are real corrections.
Real correction budget: two rounds after initial review; no automatic third round.
Optional suggestions wait for final human review and never pause execution.

## Final deliverable

Open a real PR to `develop` with implementation/check/evidence descriptions. Before
ready delivery, the implementer removes the temporary route, archives its source
and references, moves the contract's exercise/walkthrough/setup notes into milestone
history, and leaves the contract focused on everyday rules. The coordinator records
reviews/commits/results and includes task/index `done` after checks and independent
review complete. Final tracking changes receive a narrow recheck.

Human acceptance and manual merge remain pending in GitHub at agent delivery.
No automatic merge or post-merge status commit is part of the exercise.
