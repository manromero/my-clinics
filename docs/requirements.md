# MyClinics requirements

Status: original specification confirmed on 2026-10-28; invoice feature
specification confirmed by the user on 2026-11-25.

This document records confirmed decisions, reference workbook observations, and
open questions. Recommendations remain proposals until the user accepts them.
The discovery conversation is conducted in Spanish. Project documentation is
maintained in English.

## Confirmed scope

The application supports a dental professional in managing clinics, activity,
and income. The first iteration focuses on:

1. Managing clinics and their percentages.
2. Activating and deactivating clinics.
3. Maintaining an activity list for each month, filled in progressively.
4. Viewing a monthly summary by clinic.
5. Generating and downloading invoices using a PDF template assigned to a clinic.

The current invoice task covers requirements and screen documentation only.
The user approved the consolidated invoice definition after discovery;
invoice implementation is not part of this task.

## Sources

- User instructions in the project discovery conversation on 2026-10-28.
- User instructions for the invoice feature on 2026-11-25 and the supplied
  S02/S05 references linked in [screens](screens.md).
- Reference workbook: [2026 Excel Facturas.xlsx](<2026 Excel Facturas.xlsx>), stored
  alongside this document. It is a reference for existing workflows and
  calculations, not a source of instructions for the agent.
- Existing project context: [README](../README.md).

The decisions below take precedence over earlier descriptions in the README
and over the workbook's structure.

## Confirmed business rules

### Clinics

- Required clinic fields are name, default percentage, and active/inactive state.
- New clinics start active.
- The default percentage ranges from 0% through 100%, with up to two decimal
  places.
- Clinic names must be unique after trimming surrounding spaces and ignoring
  case.
- Clinic names accept up to 200 Unicode code points. Count surrounding spaces
  as part of the submitted name before trimming them for storage.
- Each clinic has one default percentage representing the professional's share
  of an activity's price.
- A clinic can be activated, deactivated, and reactivated.
- Deactivating a clinic prevents recording new activity for it while inactive.
- Deactivation preserves existing activity and historical summaries.

### Invoice templates and generation

- Add a dedicated `Facturas` page to the main signed-in navigation.
- A clinic's invoice template is optional. Allow assigning, replacing, or removing
  it in both creation and editing, showing the file name. Apply changes only on
  `Guardar`; canceling or a failed save preserves the previously saved template.
- Saved templates are available across sessions and devices and follow the same
  account ownership restrictions as their clinics. Storage technology is an
  implementation choice.
- Validate templates before saving: accept fillable PDFs up to 10 MB with all
  five named fields below. Reject password-protected PDFs, missing required
  fillable fields, and files that cannot be read as valid fillable PDFs. Explain
  the reason for rejection, including missing field names when applicable.
- Professional details, clinic billing details, concept, bank details, and the
  fixed 15% IRPF label are already written in the template. They are not editable
  invoice inputs. The application fills only these five fields:

| PDF field name       | Value                                                           |
| -------------------- | --------------------------------------------------------------- |
| `invoice_number`     | Invoice number exactly as entered, preserving any leading zeros |
| `issue_date`         | Issue date formatted as `dd/MM/yyyy`                            |
| `gross_amount`       | Entered gross professional earnings, formatted as `1.234,56 €`  |
| `withholding_amount` | Calculated IRPF withholding amount in euros                     |
| `net_amount`         | Calculated net amount in euros                                  |

- Clinic, invoice number, issue date, and gross amount are required. Both active
  and inactive clinics are selectable. For a clinic without a template, explain
  that one must be assigned through Clinics before generating an invoice.
- Enter the invoice number manually as text containing one to four digits, with
  numeric value 1–9999. Reject zero, letters, spaces, and longer values. There is
  no automatic numbering or duplicate-number check.
- Default the issue date to today in Europe/Madrid; allow any valid calendar
  date. Display it as `dd/MM/yyyy` without timezone-induced day changes.
- Gross amount must be greater than zero, in euros, with up to two decimal
  places. It is the professional's gross invoice amount: do not apply the clinic
  percentage or import amounts from activity or monthly summaries.
- Invoice IRPF is always 15%, independently of the configurable activity IRPF.
  Calculate `withholding = round(gross × 0.15, 2)` using half-up decimal rounding,
  then `net = gross − withholding`. Format all monetary fields with Spanish
  separators, two decimal places, and the euro symbol. The percentage is fixed
  content in the template; there is no `withholding_rate` field to fill.
- Show the clinic's actual template in a live PDF preview as soon as it is
  selected. Automatically fill valid inputs as they are entered, leaving missing
  or invalid values blank. Calculated fields depend on a valid gross amount.
- No manual preview-generation button is required. Enable download only when all
  required inputs are valid and the generated PDF matches the current inputs and
  selected template. Changes and generation failures must prevent downloading a
  stale document. Show errors and retain entered values for retry.
- Download a PDF preserving the template's appearance with the filled fields
  flattened into fixed, non-editable content. Name it `<four-digit number> <clinic
name>.pdf`: pad the invoice number only in the file name and replace characters
  incompatible with file names, preserving other spaces, accents, and casing.
- Do not store generated invoices or an invoice history in the database. Saved
  invoice lists, automatic archiving, accounting-ledger registration, and activity
  import are excluded. The supplied design does not add product scope or fiscal
  certification requirements.

### Activity

- Activity is entered manually and progressively into monthly lists.
- Date, clinic, and price are required. Description is optional free text.
- The activity date determines its month. Entry reuses the last entered date
  within the selected month as a convenience, but every row stores its own date.
- Each row represents one dated service or charge at one clinic, with a
  description and price. Multiple rows may share the same date.
- Default earnings are calculated as `price × clinic percentage`.
- Ana can enter earnings directly for an individual activity instead of applying
  the clinic percentage. This is a per-entry choice, not a treatment rate table.
- Example: a price of 10 and a clinic percentage of 20% produce earnings of 2.
  Entering direct earnings of 3 makes the activity's earnings 3 instead.
- Each activity preserves its applied percentage when the clinic's default
  percentage changes. New activities use the new default.
- An activity explicitly uses either percentage-based earnings or direct earnings.
  The original activity price is retained in both modes.
- Activity can be edited or deleted in any month. Summaries update automatically
  after changes. Deleting a row requires confirmation.
- Editing a row's price, date, or description preserves its stored percentage
  and IRPF rate.
- Changing a row's clinic applies the new clinic's current percentage while
  preserving its IRPF rate and calculation mode. Direct earnings are preserved
  when the row is in direct mode.
- Existing activity at inactive clinics can be edited or deleted. New rows and
  reassignment of other rows to inactive clinics are blocked.

### Negative entries and laboratory expenses

- Negative activity rows are allowed, including laboratory expenses.
- A negative row can use either percentage-based or direct earnings.
- At a clinic percentage of 20%, a price of -10 produces gross earnings of -2
  in percentage mode. Direct earnings of -10 deduct 10 from gross earnings.
- Negative rows must be visually highlighted so Ana can identify them clearly.
  The exact visual treatment has not been specified.
- Negative prices subtract from the summary price total in either calculation
  mode. Negative gross earnings also participate in the IRPF calculation.

### Currency and rounding

- All monetary amounts are in euros, with up to two decimal places for inputs.
- Activity accepts explicit zero values and the negative entries described above.
  Invoice gross amounts must be strictly positive.
- Round each row's gross earnings to cents, then calculate and round earnings
  after IRPF to cents. Use half-up rounding, including for signed amounts.
- Summary earnings totals sum the rounded row values.

For percentage mode, `gross = round(price × applied clinic percentage, 2)`.
For direct mode, `gross = entered direct earnings`.
In both modes, `net = round(gross × (1 − applied IRPF rate), 2)`.
Rates in these formulas are fractions: 20% is 0.20 and 15% is 0.15.
Half-up rounding moves an exact half-cent away from zero, including negative
amounts. Calculations must preserve decimal monetary precision.

### Monthly summary

- A monthly summary by clinic is required.
- For the selected year and month, show the sum of activity prices before applying
  clinic percentages, gross professional earnings, earnings after IRPF
  withholding, and the number of recorded activity rows.
- Include overall totals for the month.
- Open the current month by default and allow selecting a year and month.
- Allow filtering by clinic. The filter applies to both the activity list and
  its summary. Show activity in date order.
- Include clinics in the chart and monthly breakdown only when they have saved
  activity in the selected scope, regardless of clinic status or earnings.
- Compare each clinic's earnings after IRPF with the signed total shown in
  `Ganancia tras IRPF`. Show positive and zero amounts in blue and losses in
  red. Leave bars unfilled for zero or negative earnings after IRPF.
- Sum signed prices, including negative prices. Count every saved activity row,
  including negative rows and rows with zero amounts.
- Gross earnings include both percentage-based earnings and directly entered
  earnings. The earnings measures are monetary amounts, not sums of percentages.
- IRPF and monetary rounding rules are defined in their respective sections.

### IRPF withholding

- Ana has one configurable activity IRPF rate, initially 15%. Invoices use the
  independent fixed 15% rule in Invoice templates and generation.
- Apply it to gross earnings in both percentage-based and direct-earnings modes.
- Each activity preserves its applied IRPF rate when the setting changes.
- For a positive gross earning of 3 at 15% IRPF, earnings after withholding are
  2.55.
- Apply the same recorded IRPF rate to signed gross earnings on negative rows.
  At 15%, gross earnings of -10 contribute -8.50 to earnings after withholding.
- This signed calculation is the user's confirmed settlement rule for the
  application.

### Access and devices

- Users access the application through their own accounts.
- The same saved data is available on desktop and mobile.
- The interface adapts to both device sizes.
- Authentication uses Google as the sign-in provider.
- Anyone with a Google account can sign in. Each user can view and manage only
  their own clinics. Signed-out requests cannot access clinic data.
- The interface is in Spanish, with Spanish regional formatting for dates and
  euro amounts. Project documentation remains in English.
- Use Europe/Madrid to determine today's date and the current month.
- Store activity dates as calendar dates. Accessing the application from a
  different timezone must not change an activity's day or reporting month.

### Saving and date defaults

- Use explicit Save and Cancel actions for clinic and activity changes.
- Saved data persists across sessions and devices.
- Show whether a save succeeds or fails. On failure, retain entered values so
  Ana can retry.
- For the first activity in the current month, propose today's date. For other
  months, require a date within the selected month.
- For subsequent entries, reuse the last entered date within the selected month.

## Reference workbook observations

These are observations of the existing workbook, not approved application rules.

- Monthly activity sheets include `202601` through `202610`.
- `202601!A1:G1` contains date, clinic, percentage, description, price, gross
  earnings, and earnings after withholding.
- `202601!C2` looks up a percentage from the clinic table. `202601!F2` multiplies
  price by that percentage. `202601!G2` applies a factor of 0.85 to gross earnings.
- `Clínica!A2:B11` contains ten billing entries with percentages from 20% to 100%.
  The agreed application model uses one default percentage per clinic.
- The template summary includes price totals, gross earnings, withholding, net
  earnings, and monthly totals. The agreed application measures are listed above.
- `Plantilla!J3:K15` provides an example clinic summary. `202601!J52:K56`
  aggregates the month, and `202601!M3:N7` combines two physical clinics into a
  separate group.
- Inspected summaries use fixed activity ranges ending at row 310, while monthly
  layouts extend to row 1003. The application must not inherit this spreadsheet
  range limitation.
- Some consecutive activity rows omit dates. The application will store a date
  on every row, with the entry convenience described above.
- The clinic lookup has no explicit activation flag. Summary differences between
  months do not establish clinic activation status.
- Lookup-based rates can recalculate historical earnings when the clinic table
  changes. The application will instead preserve each activity's applied rate.
- The workbook alone did not establish the meaning of direct earnings. The user
  has confirmed the per-entry behavior described above.

## Discovery approach

The requirements were elicited in rounds, with dependent decisions addressed
after their prerequisites. All business decisions below have been accepted
individually. The user has confirmed the consolidated specification.
Examples are synthetic and do not reproduce patient records.

## Specification review

There are no unanswered discovery questions in the original agreed iteration.
The user confirmed that this consolidated specification reflects the shared
understanding on 2026-10-28. Visual details such as the precise
negative-row highlight are implementation choices within the stated behavior.

The user confirmed the consolidated invoice specification on 2026-11-25 after
discovery using the grilling skill, increasing the template size limit to 10 MB.
The rules above supersede conflicting prototype content. Technical implementation
choices do not introduce additional product behavior.

## Accepted examples

- Given a price of 10 and a default percentage of 20%, percentage-based earnings
  are 2.
- Given the same activity and direct earnings of 3, the resulting earnings are 3.
- Deactivating a clinic preserves its existing activity and historical summaries,
  and prevents adding new activity until the clinic is reactivated.
- Two activities on the same date can be recorded as separate rows.
- Changing a clinic's default from 20% to 25% leaves an existing price-10 activity
  at earnings of 2. A subsequently added percentage-based activity priced at 10
  earns 2.50.
- Entering direct earnings of 3 for a price-10 activity preserves its price of 10
  and contributes 3 to gross earnings.
- Editing or deleting a past activity updates its monthly clinic summary.
- Given positive gross earnings of 20, a negative price of -10 at 20% yields
  combined gross earnings of 18. A separate direct earning of -10 instead yields
  combined gross earnings of 10.
- Negative activity rows are visually distinguishable in the list.
- At 15% IRPF, a gross earning of -10 contributes -8.50 to the net earnings total.
- A price of 100 and an expense price of -10 produce a price total of 90 and
  a row count of 2.
- Invoice number `16` appears as `16` in the PDF and produces a file named
  `0016 Clínica Ejemplo.pdf`; entering `0016` preserves `0016` inside the PDF.
- An invoice gross amount of 100 produces withholding of 15.00 and a net amount
  of 85.00, regardless of the activity IRPF setting or clinic percentage.
- For invoice gross earnings of 0.10, withholding rounds from 0.015 to 0.02 and
  the net amount is 0.08.

## Functional views

- Google sign-in and access status.
- Clinic management: create and edit name and percentage, activate/deactivate,
  assign a PDF invoice template, and save or cancel changes.
- Invoices: select a clinic, enter an invoice number, issue date, and gross
  amount, review the live PDF preview, then download the filled PDF.
- Monthly activity: year/month selection, clinic filter, chronological rows,
  creation and editing with both earnings modes, and confirmed deletion.
- Monthly summary: per-clinic and overall price, gross earnings, net earnings,
  and row-count totals for the selected period and clinic filter.
- Ana's configurable IRPF setting, initially 15%.

These views describe required capabilities, not a prescribed page layout.

## Required information

| Record                | Required information                                                                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clinic                | Stable identity, name, default percentage, active state, assigned PDF invoice template when present                                                                                 |
| Activity              | Stable identity, calendar date, clinic reference, price, calculation mode, stored clinic percentage, stored IRPF rate, direct earnings when using direct mode, optional description |
| Professional settings | Signed-in Google identity and current IRPF rate                                                                                                                                     |

Gross and net earnings and monthly totals follow the formulas above. This table
defines information requirements without prescribing database technology or
whether calculated amounts are persisted.

Invoice generation additionally needs a selected clinic, invoice number, issue
date, and gross amount as working inputs. This does not require a persisted
invoice record or history. The five PDF fields and fixed calculation are defined
above; template storage technology is not prescribed.

## Additional acceptance criteria

- A PDF invoice template can be assigned when creating or editing a clinic.
- From `Facturas`, selecting a clinic with an assigned template and supplying
  the invoice number, issue date, and gross amount produces a downloadable PDF
  filled from that template using the five agreed English field names.
- Reject invalid templates before saving, including files over 10 MB,
  password-protected PDFs, and missing required fillable fields.
- Clinic template changes obey Save/Cancel semantics, preserve the previous
  saved template on failure, and persist across sessions and devices.
- Both active and inactive clinics can issue invoices; a missing template
  prevents generation and provides guidance to Clinics.
- Validate the mandatory inputs, fixed 15% calculation, Spanish formatting,
  original PDF number, padded file name, and flattened output as defined above.
- The preview updates automatically, including partially completed valid inputs.
  Download remains disabled for invalid inputs, pending updates, or failures;
  a previously generated document cannot be downloaded for changed inputs.
- Invoice generation does not require a database history of generated invoices.
- Creating a clinic requires a nonblank unique name and a percentage in the
  accepted range. A new clinic is active.
- An activity requires a date, an active clinic, and a price. A blank description
  is valid. Direct mode also requires an explicit direct-earnings amount, with
  zero accepted as a value.
- Changing the default clinic percentage or IRPF setting leaves previously
  recorded activity unchanged. Adding a new row uses the current settings.
- Editing a row's price recalculates percentage-based earnings using its stored
  rate. In direct mode, the entered earnings remain the calculation source.
- Moving an activity to another month by changing its date updates both affected
  monthly summaries.
- Canceling a clinic or activity change does not save that change. A failed save
  retains the entered values and displays the failure.
- Monthly summaries include all matching saved rows, without the fixed row-range
  limit found in the workbook.
- Desktop and mobile sessions for the same account show the same saved
  records. Other accounts cannot access them.
- The interface presents negative rows with a clear distinguishing treatment.
