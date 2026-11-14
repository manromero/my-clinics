# Task 02 — Refine the clinic earnings breakdown

Status: `in_progress`

## Objective

Compare each clinic's earnings after IRPF with the total already shown in
the summary's `Ganancia tras IRPF` card.

## Scope

- In the monthly summary, replace the signed-price comparison with
  `Ganancias tras IRPF por clínica`. Show each clinic's signed earnings after
  IRPF in euros, in blue for positive and zero amounts and red for losses,
  using the saved totals for the selected month and clinic filter.
  Remove the price labels and legend from this chart; keep prices in the
  headline figures and monthly breakdown.
- Divide each clinic's earnings after IRPF by the signed total in the
  `Ganancia tras IRPF` card for the selected month and clinic filter.
  That total already includes losses. When the total is positive, cap the
  visual fill of each bar at 100%. Leave bars unfilled when the total or
  the clinic's earnings after IRPF are zero or negative.
- Replace the existing chart explanation with «Cada barra muestra la
  ganancia de la clínica como porcentaje del total que figura en
  “Ganancia tras IRPF”. Las pérdidas se muestran en rojo, con la barra
  vacía.» Show a minus sign on negative amounts.
- In both the chart and the monthly breakdown, include a clinic only if it
  has at least one saved activity record in scope, whether it is active or
  inactive. Keep clinics with zero earnings and recorded activity in both
  sections. Preserve the selected filters and show the no-activity state
  when there are no records.
- Keep the existing calculations, saved data, and clinic filters. No database
  or Activity screen changes are in scope.

## Dependencies

- [Task 01](<task 01 - connect the summary to supabase.md>) and its saved
  per-clinic totals and row counts.
- [S04 — Monthly summary](../../screens.md#s04--monthly-summary),
  [monthly summary requirements](../../requirements.md#monthly-summary), and
  [Alexandria](../../screens/alexandria/DESIGN.md).

## Acceptance criteria

- Given clinics with activity and earnings after IRPF of €10, €90, €0,
  −€10, and €10, the `Ganancia tras IRPF` card shows €100. The positive
  amounts appear in blue with bars of 10%, 90%, and 10%. The zero amount
  appears in blue with an unfilled bar, and −€10 appears in red with an
  unfilled bar. A clinic without records is absent from both sections.
- When the signed total after IRPF is zero or negative, the chart keeps each
  clinic with activity visible and leaves its bar unfilled. If a positive
  clinic's ratio exceeds 100%, its bar is fully filled and its amount is
  still shown in full.
- Filtering to a clinic with €750 after IRPF shows €750 in the card and a
  100% bar. Filtering to a clinic without records keeps that selection and
  shows the no-activity state. Changing the month updates both sections.
- The chart's new explanation matches its behavior. The amounts and their
  signs remain readable on desktop and mobile without relying on bar length
  or color.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
Verify the chart and breakdown with signed-in synthetic data that covers mixed
earnings, net totals of zero or less, ratios above 100%, zero earnings with
records, and clinics without records.
Check that amounts and row counts still match Activity for the same scope.
Inspect desktop and mobile and collect visual evidence under the
[standard workflow](../../development-workflow.md#visual-pr-evidence).

## Progress notes

The user approved publishing this definition on `develop`. Implementation
will be assigned separately through the
[standard workflow](../../development-workflow.md).

## Execution context

- Assignment branch: `feature/summary-net-earnings-comparison`, from updated
  `develop` at `a0a799f8c0616f576520aaaeef1e3c3faa2b0741`.
- Readiness: task 01 is merged, the requirements and S04 references are in
  place, and both ordinary synthetic fixture accounts authenticated and read
  their respective active clinic through the local validation launcher.
- `src/app/summary/_lib/summary-view.ts` resolves the scope and assembles the
  saved groups from the existing monthly totals RPC. Its displayed clinic list
  currently also includes active clinics without a group; the filter options
  and displayed rows serve different purposes. Both presentation sections use
  this list. `summary-comparison.tsx` currently scales by absolute prices, and
  `summary-results.tsx` selects the empty states.
- Use the [local signed-in procedure](../../supabase.md#local-signed-in-validation)
  with the separate role sessions and temporary owner-scoped synthetic rows as
  needed. Compare the same scope in Activity and Summary. Capture desktop and
  mobile evidence against Alexandria and S04. No database or Activity changes.
- No open product decisions or outstanding hypotheses. Correction rounds used: 0.
