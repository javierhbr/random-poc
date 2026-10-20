---
name: Clarion Evaluation System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#703a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#934e00'
  on-tertiary-container: '#ffd2b1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is engineered for high-stakes hiring evaluations, calibration meetings, and executive candidate debriefs. The brand identity balances institutional authority with modern ergonomic fluidity. It avoids sterile corporate clunkiness in favor of an exacting, high-clarity workspace tailored to deep focus, fast keyboard navigation, and qualitative analysis.

### Design Movement: Modern Precision Enterprise
The design system combines Swiss graphic restraint with refined SaaS product principles. It relies on crisp surface separation, razor-thin borders, disciplined typography, and decisive semantic color hits to direct cognitive attention without sensory fatigue.

### Emotional Response & Principles
- **Unbiased Clarity:** High visual legibility ensures evaluation rubrics, scores, and interview notes remain objective and easy to parse under time constraints.
- **Ergonomic Focus:** Low-glare off-whites and cool slate neutrals eliminate retinal strain during long review loops.
- **Calibrated Rigor:** Intentional typographic hierarchies and precise alignments signal structure, fair measurement, and operational integrity.

## Colors

The palette establishes an ergonomic hierarchy optimized for extended sessions of reading, synthesizing feedback, and rubric scoring.

### Surface System
- **Canvas Base:** `#f8fafc` (Slate 50) provides a soft, glare-free foundational backdrop.
- **Card & Workspace Surface:** `#ffffff` creates sharp contrast for active document panes, candidate dossiers, and scoring rubrics.
- **Muted Surface & Form Wells:** `#f1f5f9` (Slate 100) separates secondary utility docks, sidebars, and input wells from the focal evaluation canvas.
- **Border Tone:** `#e2e8f0` (Slate 200) defines clean, non-distracting boundaries across all containers.

### Typography & Content
- **Text High-Emphasis:** `#0f172a` (Slate 900) for rubrics, key criteria, and headline copy.
- **Text Medium-Emphasis:** `#334155` (Slate 700) for running body commentary and evaluation narratives.
- **Text Low-Emphasis:** `#64748b` (Slate 500) for metadata timestamps, score guides, and inactive helper notes.

### Semantic & Status Accents
- **Primary Indigo (`#4f46e5` / Hover: `#4338ca`):** Anchors primary actions, active evaluation tabs, progress tracks, and selected score milestones.
- **Secondary Emerald (`#059669` / Surface: `#ecfdf5`):** Denotes calibrated competencies, completed assessments, and strong positive recommendations ("Strong Hire").
- **Amber Warning (`#d97706` / Surface: `#fffbeb`):** Signals non-blocking missing criteria, calibration variances, or neutral observations.
- **Critical Red (`#dc2626` / Surface: `#fef2f2`):** Flagged bias concerns, incomplete required fields, or "Strong No Hire" determinations.

## Typography

The type system prioritizes structural precision and legibility across continuous evaluation prose and dense rubric tables.

### Font Selections
- **Primary Family (Hanken Grotesk):** Applied to headlines and narrative body text. Its contemporary geometric chassis with humanist proportions provides warmth without sacrificing crisp line architecture.
- **Functional Mono/Technical Family (Geist):** Used strictly for data badges, candidate metrics, scoring pill labels, keyboard shortcuts, and table headings. Geist introduces a high-density, technical aesthetic that elevates the tool's instrument-grade feel.

### Typographic Rules
- Use tabular numbers in Geist for all rating counters, score summaries (e.g., `4.8 / 5.0`), and interview timestamps.
- Body paragraphs within feedback composer areas maintain a line length bounded between 60 to 75 characters for optimal review pacing.
- Heading sizes transition cleanly between desktop multi-column rubric layouts and single-column responsive modes.

## Layout & Spacing

The layout operates on a disciplined 4px base increment within an asymmetric fluid-column workspace designed for simultaneous note synthesis and structured rating.

### Desktop Three-Pane Layout (min-width: 1280px)
- **Left Dock (320px fixed):** Candidate overview, stage metadata, linked job scorecard, and competency checklist.
- **Center Canvas (Flexible, min 640px, max 920px):** Rich text interview notes composer, syntax blocks, and direct quote captures.
- **Right Inspector (360px fixed):** Interactive rating scales, calibrated leveling guide, and final recommendation selector.

### Tablet Layout (768px - 1279px)
The inspector transitions to an anchored side drawer or stacked lower panel. The center canvas expands across remaining width with a `1.5rem` gutter.

### Mobile Reflow (< 768px)
Single-column stream with a sticky bottom bar for submission progress and stage navigation. Canvas margin shrinks to `1rem` to maximize text editor line length.

## Elevation & Depth

This design system avoids heavy shadows, dark drop ambients, and simulated real-world skeuomorphism. Visual depth is established through **structural surface tiers and delicate outlines**.

### Tonal Stratification
- **Level 0 (Base Canvas):** `#f8fafc` — the infinite structural floor.
- **Level 1 (Subordinate Containers):** `#f1f5f9` — used for non-editable contexts, sidebar panels, and input track wells.
- **Level 2 (Active Cards & Focus Panels):** `#ffffff` bounded by a 1px border of `#e2e8f0`.
- **Level 3 (Overlays & Calibration Modals):** `#ffffff` with a subtle precision shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)`, bordered by `#cbd5e1`.

### Ghost Focus Rings
Interactive elements in active or focused states reject thick outer rings. Instead, they utilize a clean double layer: a 1px inset ring of `#ffffff` paired with an exterior 2px halo in `#4f46e5` at 80% opacity.

## Shapes

The geometric approach embraces crisp, tailored corners (`roundedness: 1` — 4px base). This compact curve language communicates technical precision and maximizes usable screen space inside data-heavy tables and rubric grids.

- **Inputs, Buttons, and Chips:** Built on a uniform `0.25rem` (4px) radius.
- **Evaluation Cards and Rubric Containers:** Scaled to `0.5rem` (8px, `rounded-lg`) to clearly separate overarching panels from inner inputs.
- **Feedback Drawers and Modal Dialogs:** Capped at `0.75rem` (12px, `rounded-xl`) with crisp boundary definitions.
- **Full-Pill Exceptions:** Restricted entirely to binary hire/no-hire toggle badges and numeric score pills to visually decouple data tags from interactive rectangular inputs.

## Components

### Buttons
- **Primary:** Background `#4f46e5`, text `#ffffff`, border none, border-radius 4px. Hover state shifts to `#4338ca`. Active state transitions to `#3730a3`.
- **Secondary / Ghost:** Background `#ffffff`, text `#334155`, 1px border `#e2e8f0`. Hover state renders `#f8fafc` with border `#cbd5e1`.
- **Destructive ("Strong No Hire" action):** Background `#ffffff`, text `#dc2626`, 1px border `#fecaca`. Hover produces `#fef2f2`.
- **Sizing:** Compact (32px height, 12px padding) and Standard (40px height, 16px padding). Typography set in Geist medium.

### Input Fields & Narrative Composer
- **Text Area & Rich Text Block:** Background `#ffffff`, 1px border `#e2e8f0`, text `#0f172a`. Focused border transitions to `#4f46e5` with no heavy outline. Placeholder text utilizes `#94a3b8`.
- **Inline Prompt Wells:** Background `#f1f5f9` with left accent stripe (3px solid `#4f46e5`) used for interview question cues and leveling guidelines.

### Rubric & Rating Chips
- **Neutral State:** Background `#f8fafc`, border 1px solid `#e2e8f0`, text `#475569`.
- **Selected Positive (Competent / Advanced):** Background `#ecfdf5`, border 1px solid `#10b981`, text `#065f46`, font weight 600.
- **Selected Developing / Needs Work:** Background `#fffbeb`, border 1px solid `#f59e0b`, text `#92400e`, font weight 600.

### Checkboxes & Radio Selection
- Unchecked boxes feature a 1px border in `#cbd5e1` on white.
- Checked state fills with `#4f46e5` displaying a crisp white 1.5px checkmark/dot. Smooth 120ms ease-out scale transition.

### Cards & Rubric Rows
- Constructed with `#ffffff` backgrounds and `#e2e8f0` outer outlines.
- Rubric rows feature alternating hover row highlighting via `#f8fafc` to facilitate horizontal tracking across multi-column criteria (e.g., "1 - Unsatisfactory" to "4 - Exemplary").

### Recommendation Selector (Specialized Component)
A segmented, 4-tier decision toggle ("Strong No Hire", "No Hire", "Hire", "Strong Hire") set within a `#f1f5f9` recessed container with 4px padding. Selected states pop out as elevated white tiles with dedicated semantic indicators (Emerald for positive tiers, Slate for neutral/marginal, Red for negative).