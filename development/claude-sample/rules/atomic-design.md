---
paths:
  - "src/components/**"
---

# Atomic Design Rules

## Layer Hierarchy

```
atoms/      — Stateless primitives (Button, Badge, Input, Icon)
molecules/  — Composed atoms, single focused interaction (Card, Dialog, TabNav)
organisms/  — Domain-aware sections, compose atoms + molecules (Modals, complex sections)
```

## Import Rules (strict one-direction)

| Layer | Can import from |
|-------|----------------|
| atoms | third-party only |
| molecules | `../atoms/` only |
| organisms | `../atoms/`, `../molecules/`, `@/types`, `@/stores`, `@/services`, `@/hooks` |

**Never import upward** — atoms never import molecules, molecules never import organisms.

## Atoms

- Location: `src/components/ui/atoms/`
- ❌ NO local state, hooks, or business logic
- ❌ NO imports from other UI layers
- ✅ Export from `atoms/index.ts`
- ✅ Use `cn()` for class merging, `cva()` for variants
- ✅ Dynamic colors via inline `style` prop only

## Molecules

- Location: `src/components/ui/molecules/`
- ❌ NO domain/business logic, NO auth/family state
- ✅ Accept `className` prop as override slot
- ✅ Export from `molecules/index.ts`

## Organisms

- Location: `src/components/ui/organisms/`
- ✅ Use portal rendering for modals: `document.getElementById('modal-root')`
- ❌ NO direct API calls (use services/hooks)
- ❌ NO imports from `pages/` or `AppWrapper`

## CSS Rules

- ✅ Tailwind CSS utility classes only
- ✅ Responsive via Tailwind prefixes (`sm:`, `md:`, `lg:`)
- ✅ `cn()` with classes grouped by: Layout → Sizing → Spacing → Responsive → Visual → Typography → Interactive → Motion → Conditional → className override
- ❌ NO `<style>` JSX tags
- ❌ NO `@media` queries in components
- ❌ Inline `style` only for truly dynamic values

## Placement Decision

```
New component needed?
├─ Used in one page only?         → keep it in that page
├─ Stateless primitive?           → atoms/
├─ Composed unit, no domain?      → molecules/
└─ Domain-aware or complex?       → organisms/
```
