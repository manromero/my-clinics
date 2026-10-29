# Button

Import `Button` and `ButtonProps` from `@/lib/components/button`.
It renders a native `<button>` and can be composed in Server or Client Components.
Interactive consumers must use a Client Component, as shown in the
[showcase](../src/app/components/button-specimen.tsx).

| Prop                   | Contract                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `variant`              | `primary` (default gradient), `secondary` (tonal), `tertiary` (text with hover underline), `destructive` (error fill)    |
| `size`                 | `sm`, `md` (default), `lg`; minimum heights 44, 48 and 56px                                                              |
| `startIcon`, `endIcon` | Optional decorative React nodes; use noninteractive SVGs with currentColor and no labels. Visible text remains required. |
| `pending`              | Default false; shows a reduced-motion-aware spinner, sets aria-busy and native disabled; retains the text label          |
| Native button props    | Includes children, disabled, type, form attributes, event handlers, ref, accessible descriptions and className           |

```tsx
<Button startIcon={<PlusIcon />}>Nueva entrada</Button>
<Button variant="secondary" onClick={cancel}>Cancelar</Button>
<Button variant="tertiary" endIcon={<ArrowIcon />}>Ver detalles</Button>
<Button variant="destructive" type="submit" pending={deleting}>Eliminar</Button>
```

The safe default is `type="button"`; opt into `type="submit"` explicitly for forms.
Disabled and pending controls use native disabled semantics: they cannot activate
and are omitted from sequential keyboard focus. Keep operation state in the caller,
set pending for the operation lifetime, and provide a nearby live status for progress,
success or failure. Button does not execute asynchronous work or infer form state.
The text label remains stable during pending; the caller may supply different text.
Do not put links, controls or focusable content inside labels or icon slots.
Icon-only controls belong to the separate IconButton task.

Uses [Alexandria tokens](visual-foundations.md), Public Sans labels, rounded-lg,
a global visible keyboard outline and no decorative shadow or border. All sizes
wrap long labels within their available width. Keep controls on light surfaces for
focus contrast. `className` supports layout composition; overriding semantic state,
contrast, target size or focus styling is the consumer's responsibility.
