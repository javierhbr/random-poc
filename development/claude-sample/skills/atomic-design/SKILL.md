---
name: atomic-design
description: Organize UI components in atomic layers (atoms, molecules, organisms) with proper dependency rules
---

# skill:atomic-design

## Does exactly this
Guides component placement and architectural organization using atomic design principles: atoms (base), molecules (combined), organisms (complex).

## Use this skill when
- Creating new UI components
- Deciding which layer a component belongs in
- Avoiding cross-layer violations
- Auditing component imports and dependencies

## Three Layers (Strict Rules)

**Atoms** — Stateless base components (Button, Input, Label, Badge)
- No dependencies on other UI components
- Single responsibility

**Molecules** — Combinations of atoms (SearchBar, Card, FormField)
- Combine 2+ atoms
- No organism dependencies

**Organisms** — Complete sections (Header, TaskList, Modal)
- Domain-aware (know about tasks, rewards, etc.)
- Can depend on molecules + atoms

## Critical Rule

**NO backward dependencies:** Organisms can use molecules. Molecules can use atoms. Atoms use none.

## FSD Layer Mapping

**Atoms & Molecules** → `shared/ui/` directory in Feature-Sliced Design

**Organisms** → `features/` or `widgets/` layers in Feature-Sliced Design

→ Use `react-fsd-zustand-ui` skill for FSD layer placement decisions

## Steps — in order, no skipping

1. **Identify component scope** — Is it a single element, combination, or full section?
2. **Determine layer** — Atom (base), Molecule (combined 2+ atoms), Organism (complex)
3. **Check dependencies** — Ensure no atom uses molecule; no molecule uses organism
4. **Place in directory** — `src/components/ui/{atoms|molecules|organisms}/`
5. **Export from index** — Add to layer's `index.ts` barrel export

## Output

Component in correct atomic layer with proper imports and exports.

## Done when

- Component placed in correct layer
- No layer violation (atoms don't import molecules/organisms)
- Exported from layer's `index.ts`
- No circular dependencies

## If you need more detail

→ `resources/atomic-design-rules.md` for complete rules, current component lists, CSS patterns
