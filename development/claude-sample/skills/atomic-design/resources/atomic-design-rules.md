# Atomic Design + CSS Rules for foyer-app-pwa

## Overview

The `src/components/ui/` directory is restructured using Atomic Design principles with three layers:
- **atoms/** — Primitive, stateless UI building blocks
- **molecules/** — Composed, focused-interaction components
- **organisms/** — Domain-aware complex components

All responsive behavior uses **Tailwind CSS** exclusively. NO `<style>` JSX tags, NO `@media` queries in components.

---

## 1. Atomic Design Layer Rules

### 1.1 Atoms (Primitive Building Blocks)

**Location**: `src/components/ui/atoms/`

**Characteristics**:
- Stateless, dependency-free
- NO imports from molecules/, organisms/, or domain directories
- Pure UI primitives: Button, Badge, Input, Icon, Avatar, Counter, etc.

**Current Atoms (16 total)**:
- Button, badge, input, textarea, Select, progress
- icon, icons, Counter, Avatar, ActionButton
- UsageBar, PlanBadge, ErrorState, table, dropdown-menu

**Rules**:
- ✅ Export from `atoms/index.ts`
- ✅ Use `cn()` from `@/lib/utils` for class merging
- ✅ Use `cva()` for multi-variant components
- ✅ Dynamic colors via inline `style` prop only
- ❌ NO imports from other UI layers
- ❌ NO local state or hooks
- ❌ NO `<style>` JSX tags

---

### 1.2 Molecules (Composed, Focused Interactions)

**Location**: `src/components/ui/molecules/`

**Characteristics**:
- Compose atoms into reusable units
- Single focused interaction or purpose
- NO domain business logic

**Current Molecules (10 total)**:
- Card, StatsCard, TitleCard, TabNavigation, EmptyState
- TaskListSeparator, TaskListFilter, AvatarSelector, ConfirmDialog, BehaviorRow

**Rules**:
- ✅ Import from `../atoms/` ONLY
- ✅ Export from `molecules/index.ts`
- ✅ Accept `className` prop for override slot
- ✅ Use `cn()` for all multi-condition classes
- ❌ NO imports from organisms/ or domain directories
- ❌ NO auth/family/health state management
- ❌ NO `<style>` JSX tags

---

### 1.3 Organisms (Domain-Aware Components)

**Location**: `src/components/ui/organisms/`

**Characteristics**:
- Compose atoms + molecules
- May contain local state and domain imports
- Complex, self-contained sections

**Current Organisms (6 total)**:
- modal/ directory (10 modal components)
- BehaviorSection, BehaviorAddModal, BehaviorCounter
- BehaviorQuickSelect, BehaviorSummaryTable, EmailVerificationModal

**Rules**:
- ✅ Import from `../atoms/` and `../molecules/`
- ✅ Import from `@/types`, `@/stores`, `@/services`, `@/hooks`
- ✅ Export from `organisms/index.ts`
- ✅ Use portal rendering for modals: `document.getElementById('modal-root')`
- ❌ NO imports from `pages/` or `AppWrapper`
- ❌ NO direct API calls (use services)
- ❌ NO `<style>` JSX tags

---

## 2. CSS & Responsive Rules

### 2.1 Tailwind Only - NO Raw CSS

**Rule**: All styling must use Tailwind CSS utility classes. NO `<style>` JSX tags, NO raw CSS.

---

### 2.2 Responsive Prefixes - NO @media Queries

**Rule**: Use Tailwind responsive prefixes instead of `@media` queries.

**Breakpoints** (Tailwind default):
- `max-sm:` — Below 640px (mobile)
- `sm:` — 640px and above
- `md:` — 768px and above
- `lg:` — 1024px and above
- `xl:` — 1280px and above
- `2xl:` — 1536px and above

---

### 2.3 cn() BEM-Style Class Grouping

**Rule**: Group Tailwind classes with `cn()` using comment sections for readability.

**Pattern** (ALWAYS follow this order):
- Layout (flex, grid, block, hidden)
- Positioning (relative, absolute, fixed, z-)
- Sizing (w-, h-, min-, max-)
- Spacing (p-, m-, gap-)
- Responsive overrides (sm:, md:, lg:)
- Visual (bg-, rounded-, shadow-, border-)
- Typography (text-, font-, leading-)
- Interactive (hover:, focus:, active:, disabled:)
- Motion (transition-, animate-, duration-)
- Conditional state (ternary expressions)
- Override slot (className prop)

---

## 3. Import Rules

### 3.1 Backwards-Compatible Re-exports

All legacy import paths continue to work via re-export files.

### 3.2 Internal Layer Imports

**Within atoms/** → Import from same layer or third-party only
**Within molecules/** → Import from atoms layer only
**Within organisms/** → Import from atoms + molecules + domain

---

## Quick Reference

**Creating a new component?**
- Atom: `src/components/ui/atoms/NewAtom.tsx`
- Molecule: `src/components/ui/molecules/NewMolecule.tsx` (imports atoms)
- Organism: `src/components/ui/organisms/NewOrganism.tsx` (imports atoms + molecules)

**Styling Rules**:
- ✅ Tailwind CSS classes only
- ✅ Use `cn()` for multi-condition classes
- ❌ NO `<style>` JSX tags
- ❌ NO `@media` queries in components
- ❌ Inline `style` prop only for dynamic values

---

**Status**: Production ready ✅
