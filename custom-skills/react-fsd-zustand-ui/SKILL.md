---
name: react-fsd-zustand-ui
description: Use for React features, pages, widgets, and refactors that need Feature-Sliced Design, correct useEffect usage, Zustand state patterns, and resilient async UI states. Triggers on React architecture, FSD, Zustand, useEffect, loading/error/empty states, widgets, pages, slices, selectors, store design, and refactoring UI flows.
---

# React FSD + Zustand + UI Patterns

## Purpose
Use this skill when building or refactoring React code that needs:
- clear architectural placement
- minimal and correct state management
- proper `useEffect` decisions
- strong loading / error / empty / success UI behavior

## Layer 1: Operating Rules

### 1) Place code with FSD "Pages First"
Start by keeping code where it is used.
- If code is used in one page only, keep it in `pages/`
- If code is a large reusable composition across pages, use `widgets/`
- If code is a reusable user interaction, use `features/`
- If code is a reusable business domain concept, use `entities/`
- If code is generic infrastructure, use `shared/`

Do not extract to lower layers too early.

### 2) Treat `useEffect` as an escape hatch
Use `useEffect` only to synchronize with external systems.
Do **not** use it for:
- derived state
- user event handling
- resetting state that should be controlled by keys
- computations that belong in render or `useMemo`

### 3) Use Zustand for shared client state, not everything
Use Zustand when state is shared or long-lived across components.
Do not introduce global stores for purely local UI state that can stay inside a component or page.

### 4) UI must always represent reality
For async UI:
- show loading only when there is no usable data yet
- always surface errors to the user
- always define empty states for collections
- disable triggers during async operations
- prefer optimistic updates when safe

## Required workflow

When asked to implement or refactor:
1. Classify the code by FSD layer first
2. Decide whether state is local, page-level, widget-level, or shared
3. Check if `useEffect` is actually needed
4. If shared state is needed, design a small Zustand store with narrow selectors
5. Implement loading, error, empty, and mutation feedback states
6. Export only public API from slices
7. Avoid same-layer cross-coupling unless explicitly modeled

## Output expectations
When applying this skill:
- explain where files belong
- explain why each `useEffect` exists, or remove it
- use selectors for Zustand access
- include empty/error/loading handling in UI work
- keep public APIs clean with `index.ts`

## Quick decisions

### Should this live in `pages/`, `widgets/`, `features/`, `entities/`, or `shared/`?
See [references/architecture.md](references/architecture.md)

### Do I really need `useEffect`?
See [references/state-and-effects.md](references/state-and-effects.md)

### How should the async UI behave?
See [references/ui-patterns.md](references/ui-patterns.md)
