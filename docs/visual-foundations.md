# Alexandria visual foundations

The public styling API is the semantic Tailwind theme in
[src/app/globals.css](../src/app/globals.css). The light theme follows
[Alexandria](screens/alexandria/DESIGN.md), using the shared S01–S04 palette.
The [/components/foundations](../src/app/components/foundations/page.tsx) specimens demonstrate the contract.
No component library is introduced: Tailwind v4 and native HTML are sufficient for
foundations. Complex interaction primitives will be evaluated in their own tasks.

## Color and surfaces

Use `bg-primary` / `text-on-primary` for actions, `text-primary` for links,
and `from-primary to-primary-container` for action gradients. White action text
is readable across both gradient endpoints. Blue is reserved for actions/focus,
not general decoration. Gold `text-tertiary` is metadata/accent; the bright gold
`bg-tertiary-container text-on-tertiary-container` is for highlights.

Surface steps (light to dark): `surface-container-lowest` #ffffff,
`surface` #faf9fa, `surface-container-low` #f5f3f4,
`surface-container` #efedee, `surface-container-high` #e9e8e9,
`surface-container-highest` #e3e2e3, `surface-dim` #dbdadb.
Use `text-on-surface` (#1b1c1d) or `text-on-surface-variant` (#434653)
across these tones. Separate regions with whitespace and tonal changes.

Supported state pairs: `bg-error-container text-on-error-container`,
`bg-success-container text-success`, and
`bg-warning-container text-warning`. Always include a text explanation;
color alone does not communicate status. Error (#ba1a1a) also works on white.
Success green is a semantic extension of the reference palette.
Focus uses `focus` (#094cb2), a global 2px outline with 4px offset.
On dark or primary backgrounds, place focusable controls on a light surface
or explicitly use a white outer ring so focus retains 3:1 contrast.

## Typography and font loading

Root layout uses `next/font/google` variable fonts, Latin subsets (including
Spanish accents), `display: swap`, preloading and automatic self hosting.
Build time requires access to Google Fonts; visitors load font assets from the
application origin. No runtime Google requests or external stylesheet is needed.
Fallbacks are Georgia/serif for Noto Serif and Arial/sans-serif for Inter and
Public Sans. Font variable mapping alone uses `@theme inline`.

| Role            | Utilities                     | Size / leading |
| --------------- | ----------------------------- | -------------- |
| Display         | `font-headline text-display`  | 48px / 1.15    |
| Heading         | `font-headline text-headline` | 32px / 1.3     |
| Section title   | `font-headline text-title`    | 24px / 1.35    |
| Body            | `font-body text-body`         | 16px / 1.75    |
| Label           | `font-label text-label`       | 14px / 1.5     |
| Supporting text | `font-label text-caption`     | 12px / 1.5     |

Use one h1 and logical heading levels; typography utilities do not impose HTML
semantics. `font-sans` and `font-serif` alias body and headline for existing
consumers. Avoid the export's accidental all-serif body text.

## Geometry and responsive composition

Spacing is a 4px base: utilities 1, 2, 3, 4, 6, 8, 12 and 16 give
4, 8, 12, 16, 24, 32, 48 and 64px. `p-gutter` is 24px;
`gap-section` is 48px. Prefer these scales over new arbitrary values.

Radii: `rounded-sm` 4px, `rounded-md` 8px, `rounded-lg` 12px,
`rounded-xl` 16px and `rounded-2xl` 24px. Minimum corner is sm;
pills may use `rounded-full`. This resolves inconsistent export radii.

Default mobile composition is single-column with 24px gutters.
Use Tailwind's existing sm (640px), md (768px), lg (1024px), xl (1280px)
breakpoints when content needs more space. Use
`text-headline sm:text-display` for large page titles, wrapping labels and
`min-w-0` in grids. Keep controls reachable with at least 44px target height.
The catalogue uses two swatch columns on narrow screens and three from sm.

## Elevation, focus and motion

Ordinary content uses no borders or shadows. Floating menus may use the
ordinary variables `--floating-opacity: 80%` and `--floating-blur: 20px`.
`shadow-floating` is a 32px blur at 6% on-surface tint, reserved for floating
content/modal layers. There is no default card shadow.

The only decorative border exception is `--ghost-border`: outline-variant
at 15% opacity for an input's edge or floating layer. It cannot serve as the
sole control or state cue. Accessibility outlines, validation and input focus
indicators are functional exceptions to the no-line rule.

`--duration-fast` (150ms) is for color feedback;
`--duration-standard` (220ms) and `ease-standard` are for entering content.
Use `duration-(--duration-fast) ease-standard` and `animate-reveal`.
Reduced-motion preference reduces all animations/transitions to 0.01ms and
disables smooth scrolling, preserving content and state announcements.
Motion is optional decoration, never required to understand a change.

No runtime theme helper or theme provider is needed. Route-local specimen
registration is not a shared component API and carries no domain behavior.
