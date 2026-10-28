# MyClinics screens

Updated: 2026-10-28.

This document maps the confirmed [requirements](requirements.md) to screens and
interactions for the first version. Requirements remain the source of truth for
business rules. The page grouping, routes, and form presentation below are the
proposed screen design; they have not been implemented.

Documentation is in English. User-facing names and example labels are in Spanish.

## Visual design references

The user supplied Google Stitch exports in `docs/screens/` as the visual
direction to follow when implementing the screens. They complement the
functional specification below and may contain missing details or imperfections.

Start with [Alexandria design guidance](screens/alexandria/DESIGN.md), which
explains the shared visual language: Noto Serif headings, Inter body text,
Public Sans labels, blue primary actions, gold accents, and hierarchy through
whitespace and tonal surfaces.

Each supplied screen has a generated HTML reference and a PNG showing its
intended appearance:

| Screen                 | Generated HTML                                         | Visual reference                                         |
| ---------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| S01 — Sign-in          | [code.html](screens/s01_iniciar_sesi_n/code.html)      | [screen.png](screens/s01_iniciar_sesi_n/screen.png)      |
| S02 — Clinics          | [code.html](screens/s02_gesti_n_de_cl_nicas/code.html) | [screen.png](screens/s02_gesti_n_de_cl_nicas/screen.png) |
| S03 — Monthly activity | [code.html](screens/s03_actividad_mensual/code.html)   | [screen.png](screens/s03_actividad_mensual/screen.png)   |
| S04 — Monthly summary  | [code.html](screens/s04_resumen_mensual/code.html)     | [screen.png](screens/s04_resumen_mensual/screen.png)     |

There is currently no supplied S05 Settings export. Apply the same Alexandria
visual language and shared navigation to that screen using its functional
description below.

### How to use the references

- Read Alexandria and review both the HTML and image for the relevant screen
  before implementing its UI.
- Follow the visual direction, composition, and component styling, adapting them
  where necessary to meet the confirmed requirements and responsive behavior.
- Confirmed [requirements](requirements.md) govern calculations, permissions,
  data, and behavior. The functional descriptions in this document identify
  controls and states that may be absent from the visual exports.
- Resolve gaps or conflicts in favor of the confirmed behavior while preserving
  the design's visual language. The exports do not add product scope.
- Treat sample names, amounts, dates, and account details as reference content,
  not application configuration or authorization rules.
- Adapt the generated HTML into the project's Next.js, TypeScript, and Tailwind
  architecture described in [architecture](architecture.md). Its scripts and
  dependency setup are prototype material, not a prescribed implementation.
- Preserve the supplied exports as reference files. Implement application code
  in the source tree and cover loading, empty, error, form, and mobile states
  described below even when the export only illustrates a populated screen.

## Screen map

| ID  | Screen           | Spanish navigation label | Proposed route | Purpose                                            |
| --- | ---------------- | ------------------------ | -------------- | -------------------------------------------------- |
| S01 | Sign-in          | Acceder                  | `/login`       | Sign in with Ana's authorized Google account       |
| S02 | Clinics          | Clínicas                 | `/clinics`     | Manage clinic names, percentages, and active state |
| S03 | Monthly activity | Actividad                | `/activity`    | Enter and correct activity for a selected month    |
| S04 | Monthly summary  | Resumen                  | `/summary`     | Review monthly amounts and row counts by clinic    |
| S05 | Settings         | Ajustes                  | `/settings`    | Change Ana's default IRPF rate and access sign-out |

After successful sign-in, open Monthly activity for the current month in
Europe/Madrid. Protected screens share navigation to Clinics, Activity, Summary,
and Settings. Keep the signed-in identity and sign-out action accessible.

Use a shared year/month and clinic selection for Activity and Summary. Moving
between those screens preserves that context. Initial entry defaults to the
current month and all clinics. The all-clinics option includes inactive clinics
with recorded activity for the selected period.

## S01 — Sign-in

**Purpose:** grant Ana access to her saved data.

### Content and actions

- Application name and a `Continuar con Google` button.
- Start Google sign-in and validate that the account is authorized.
- On success, open Monthly activity.
- For a different Google account, show an access-denied state with an option to
  try another account. Do not display application records.

### States

- Ready to sign in.
- Sign-in in progress, with repeated submission prevented.
- Sign-in canceled or failed, with a retry action.
- Account authenticated but not authorized.
- Session expired: require sign-in before showing protected data again.

## S02 — Clinics

**Purpose:** maintain the clinics used when recording activity.

### Content and actions

- List clinic name, default percentage, and `Activa` or `Inactiva` state.
- Keep both active and inactive clinics discoverable.
- `Nueva clínica` opens the clinic form.
- `Editar` opens the selected clinic's form.
- Allow deactivation and reactivation through an explicit state control in the
  form, saved together with the clinic changes.
- Explain beside the state control that deactivation preserves existing activity
  and prevents new entries for that clinic.

### Clinic form

Use a dialog or panel opened from the list, adapting its size to mobile.

| Field      | Behavior                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| Nombre     | Required; reject blank or duplicate names after trimming spaces and ignoring case |
| Porcentaje | Required; 0–100%, with up to two decimal places                                   |
| Estado     | Active/inactive; new clinics default to active                                    |

Provide `Guardar` and `Cancelar`. A changed percentage affects new activity;
existing rows retain their applied percentage. Display validation beside the
affected field. After a successful save, refresh the list and show confirmation.
On failure, keep the form values available for retry.

### States

- Loading clinics.
- No clinics yet, with a `Nueva clínica` action.
- All clinics inactive, with access to edit/reactivate them.
- Load failure with retry.
- Form validation error, saving, save success, or save failure.

## S03 — Monthly activity

**Purpose:** progressively enter activity and correct existing records.

### Period and filtering

- Select year and month; open the current month initially.
- Filter by one clinic or choose `Todas las clínicas`.
- Allow selecting an inactive clinic when it has historical activity to review.
- Provide a link to Monthly summary with the same period and clinic filter.
- Keep the selected period and filter visible on mobile as well as desktop.

### Activity list

Show rows in chronological date order with these data available:

| Field               | Presentation                                             |
| ------------------- | -------------------------------------------------------- |
| Fecha               | Stored activity date in Spanish date format              |
| Clínica             | Clinic name; identify an inactive clinic when applicable |
| Concepto            | Optional description; blank is valid                     |
| Importe             | Original signed price in euros                           |
| Cálculo             | `Porcentaje` or `Importe directo`                        |
| Porcentaje aplicado | Stored percentage for percentage-mode rows               |
| Ganancia bruta      | Calculated or directly entered signed earnings           |
| IRPF aplicado       | Stored rate used for that row                            |
| Ganancia tras IRPF  | Rounded signed net earnings                              |
| Acciones            | Edit or delete the row                                   |

On mobile, use a compact row or card with secondary details accessible without
removing required information. Clearly mark rows with a negative price or
negative earnings using a visual accent and a text label such as
`Importe negativo`; retain minus signs so identification does not depend on color.

### Create and edit activity

`Nueva actividad` opens a form from the list. Use the same form for editing.

| Field            | Behavior                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Fecha            | Required calendar date; determines the reporting month                                       |
| Clínica          | Required; active clinics selectable for creation or reassignment                             |
| Concepto         | Optional free text                                                                           |
| Importe          | Required signed euro amount, up to two decimals; zero is valid                               |
| Modo de cálculo  | Explicit choice between percentage-based and direct earnings; percentage mode is the default |
| Ganancia directa | Required in direct mode; signed euro amount, up to two decimals; zero is valid               |

Show the applied percentage when relevant, the stored/default IRPF rate, and a
preview of gross and net earnings. In direct mode, retain the activity price and
use the entered direct amount for gross earnings. Negative entries use the same
two modes and the same signed IRPF calculation as positive entries.

For a new row in the current month, propose today for the first entry. Reuse the
last entered date within the selected month for later entries. For a first entry
in another month, require the user to choose a date in that month. A selected
active clinic filter can prefill the clinic field.

Editing price, date, or description preserves the row's stored percentage and
IRPF. Changing clinic uses the new clinic's current percentage and preserves
IRPF, calculation mode, and any direct earnings. Existing rows at inactive
clinics remain editable while their clinic remains unchanged.

Provide `Guardar` and `Cancelar`. Saving updates the list and affected summaries;
canceling leaves stored data unchanged. A date edit may move an existing row to
another month: update both summaries and make clear why it no longer appears in
the current list. Failed saves retain entered values and allow retry.

### Delete activity

`Eliminar` opens a confirmation dialog identifying the row by date, clinic, and
amount. Confirming removes it and updates the affected summary. Canceling keeps
the row. A failed deletion leaves the row in place and shows the failure.

### States

- Loading activity.
- No activity for the selected month or filter, with a create action when an
  active clinic is available.
- No active clinics: explain that a clinic must be created or reactivated before
  adding activity, and link to Clinics. Historical rows remain available.
- Load failure with retry.
- Form validation error, saving, save success, or save failure.
- Delete confirmation, deletion in progress, or deletion failure.

## S04 — Monthly summary

**Purpose:** review the selected month's figures by clinic and overall.

### Content and actions

- Use the same year/month and clinic controls as Monthly activity.
- Show the selected period and clinic scope prominently.
- Provide a link back to Monthly activity preserving both selections.
- Show one row per included clinic and a total row for the selected scope.

| Measure            | Meaning                                                           |
| ------------------ | ----------------------------------------------------------------- |
| Importe total      | Sum of signed activity prices before applying clinic percentages  |
| Ganancia bruta     | Sum of rounded earnings from both calculation modes               |
| Ganancia tras IRPF | Sum of rounded row earnings after applying each row's stored IRPF |
| Nº de registros    | Count of all saved rows, including negative and zero rows         |

Include active clinics with no activity as zero rows. Include inactive clinics
when they have activity in the selected month. When filtering to one clinic,
both the clinic figures and the total describe only that clinic.

All amounts include negative entries according to the requirements. Calculate
totals from rounded row values, preserving their signs. Display monetary amounts
with two decimals and row counts as integers. Update figures after saved activity
changes, deletions, or date changes affecting the month.

### States

- Loading summary.
- Month with no activity: zero amounts/counts for included active clinics.
- No included clinics: clear empty state with navigation to Clinics or a different
  period/filter.
- Load failure with retry.

## S05 — Settings

**Purpose:** manage the default IRPF rate for new activity and the current session.

### Content and actions

- Display the signed-in Google identity.
- Show Ana's current default IRPF, initially 15%.
- Allow editing the default IRPF with explicit `Guardar` and `Cancelar` actions.
- Explain that the change applies to new activity. Existing rows retain their
  recorded IRPF rate.
- Show save success or failure, retaining input values on failure.
- Provide `Cerrar sesión`, returning to Sign-in and removing access to protected
  content until Ana signs in again.

### States

- Loading settings.
- Editing, saving, save success, or save failure.
- Load failure with retry.
- Sign-out in progress or failed, with appropriate feedback.

## Shared interaction rules

- Use Spanish labels and regional formatting, with euro amounts and explicit
  percentage symbols. Keep calendar dates stable across device timezones.
- Make required and optional fields clear, and associate validation errors with
  their inputs. Do not treat a valid zero as a missing value.
- Keep form actions reachable on narrow screens and support keyboard navigation,
  labeled controls, and visible focus. Dialogs must manage focus and return it
  to the opening control when closed.
- Show loading and operation states and prevent duplicate submissions while a
  save or deletion is in progress.
- Display saved data consistently across Ana's desktop and mobile sessions.
- Apply authorization to every protected screen and data operation.
- Use the calculation, historical-rate, and signed-rounding rules defined in
  [requirements](requirements.md); screens must not introduce alternate formulas.

## Main user flows

1. **Start working:** Sign-in → Google authorization → Monthly activity for the
   current month.
2. **Prepare a clinic:** Clinics → New clinic → Save → Monthly activity.
3. **Record work or an expense:** Monthly activity → New activity → Select a
   calculation mode → Review earnings → Save → Updated list and summary.
4. **Review a month:** Monthly activity → Select month/clinic → Monthly summary
   with the same selections → Return to the matching activity list.
5. **Correct history:** Monthly activity → Select prior month → Edit or confirm
   deletion → Updated affected summaries.
6. **Stop using a clinic:** Clinics → Edit → Set inactive → Save → Existing
   activity remains available and new entry for that clinic is blocked.
7. **Change default withholding:** Settings → Edit IRPF → Save → New entries use
   the new rate, existing entries retain their stored rate.
