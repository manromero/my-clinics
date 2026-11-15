# Milestone 05 — Monthly summary

Tasks 00 and 01 were merged into `develop` in
[PR #59](https://github.com/manromero/my-clinics/pull/59) and
[PR #60](https://github.com/manromero/my-clinics/pull/60), respectively.
Task 02 is delivered in [PR #61](https://github.com/manromero/my-clinics/pull/61)
and awaits human approval and manual merge.

## Objective

Deliver [S04 — Monthly summary](../../screens.md#s04--monthly-summary) at
`/summary`. A signed-in professional can see the selected month's figures at a
glance, compare clinics, and open the corresponding activity list. The summary
and [S03 — Monthly activity](../../screens.md#s03--monthly-activity) agree for the
same period and clinic filter.

## Scope and design

- Add `Resumen` to the signed-in main navigation. Reuse the Activity year,
  month, and clinic controls and URL parameters (`year`, `month`, `clinic`).
  Default to the current month in Europe/Madrid with all clinics selected.
  Keep Activity as the post-sign-in destination.
- Follow the [S04 Stitch design](../../screens.md#visual-design-references) and
  [Alexandria](../../screens/alexandria/DESIGN.md): a period and scope header,
  key figures, a comparison of earnings after IRPF by clinic, and a clinic
  breakdown with consolidated totals. Use Spanish labels, two decimal places
  for euros, and integer record counts. Keep the numeric values readable
  without the chart, including on mobile.
- The required measures are signed prices, gross earnings, earnings after IRPF,
  and all saved row counts. Show IRPF as the signed adjustment
  `net − gross` if presented as a deduction, without labeling it with a fixed
  rate. Do not carry over sample-only fiscal annotations or average percentages
  from the mockup.
- Include only clinics with saved activity in the comparison and monthly
  breakdown, whether active or inactive. The comparison shows each clinic's
  earnings after IRPF against the total on the `Ganancia tras IRPF` card.
  Zero amounts appear in blue and losses in red, both beside unfilled bars.
  A single-clinic filter scopes the headline figures, comparison, breakdown,
  and consolidated totals together. Preserve an owned selection with no
  records and show the no-activity state for that scope.
- Exclude the PDF download and Liquidaciones link. This is a read-only summary:
  no settlement workflow or IRPF settings.

## Delivery sequence

| Task                                                                                             | Status | Direct dependencies                                         |
| ------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------- |
| [00 — Build the summary with fixtures](<task 00 - summary with fixtures.md>)                     | `done` | [Milestone 04](../milestone-04-monthly-activity/readme.md)  |
| [01 — Connect the summary to Supabase](<task 01 - connect the summary to supabase.md>)           | `done` | 00 and the hosted Milestone 04 activity data and totals RPC |
| [02 — Refine the clinic earnings breakdown](<task 02 - refine the clinic earnings breakdown.md>) | `done` | 01                                                          |

Task 00 can be reviewed with clearly labeled synthetic figures on development.
Task 01 replaces the temporary data source and enables the context-preserving
links between the real Activity and Summary views. The existing
`activity_period_totals` RPC already provides overall and per-clinic totals;
no new schema or migration is planned.

## Completion criteria

- An authenticated user sees only their own saved data on desktop and mobile.
  The same URL scope produces matching totals in Activity and Summary, including
  for a month that exceeds one activity-list page.
- Creating, editing, moving, or deleting activity is reflected when viewing the
  affected months. The summary uses stored rounded gross and net amounts, with
  no recalculation at current clinic or IRPF rates and no fallback to fixtures.
- Loading, no activity, no included clinics, and read failure are distinct.
  A failed read can be retried without losing the selected filters.
- Each implementation task follows the standard
  [development workflow](../../development-workflow.md) and
  [Git workflow](../../git-workflow.md), including a feature branch, separate
  implementer and reviewer roles, and a pull request targeting `develop` for
  human approval and manual merge.
