# Alexandria visual foundations

[Alexandria](screens/alexandria/DESIGN.md) defines the visual direction.
[globals.css](../src/app/globals.css) is the source of truth for token values and
utilities; inspect their appearance at `/components/foundations`. This guide
records cross-cutting decisions rather than duplicating token tables.

## Using the theme

- Consume semantic Tailwind utilities instead of repeating hex values. Reserve
  primary blue for actions, links and focus; gold is for metadata and highlights.
- Separate ordinary content with whitespace and tonal surfaces, without borders
  or shadows. Reserve floating elevation for menus and modal layers. Ghost borders
  are limited to input/floating layers and cannot be the sole control/state cue.
  Functional focus and validation indicators are allowed.
- Use Noto Serif for headings, Inter for body text and Public Sans for labels.
  Typography utilities do not replace semantic heading levels: use one h1 and
  a logical hierarchy.
- Use existing spacing/radius scales and Tailwind breakpoints. Start with a single
  column and 24px gutters; allow labels to wrap and controls to remain reachable
  with at least 44px target height.

## Accessibility and motion

Status colors always need explanatory text. The default blue focus outline is
intended for light surfaces; on dark or primary surfaces use a light outer
indicator with sufficient contrast. Preserve focus when composing controls.

Motion is optional decoration. Use existing timing/easing utilities and respect
reduced motion; content and state announcements must remain understandable
without animation.

## Implementation decisions

Tailwind v4's CSS-first theme and native HTML are sufficient for the current
foundations. No theme provider or component library is required. Evaluate focused
accessible primitives in the tasks that need complex interactions.

The root layout loads fonts through `next/font/google`, with Spanish coverage,
swap behavior and local fallbacks. Builds need Google Fonts access; visitors load
self-hosted assets from the application origin. Keep font-variable aliases in
`@theme inline` and other theme values in `@theme`.
