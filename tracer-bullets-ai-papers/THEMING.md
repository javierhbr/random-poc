# Theming Guide — `uncle-dev-themes.docs.html`

This page is a single self-contained HTML file styled with **Tailwind (CDN)** plus a
small set of **CSS custom properties** (variables). Almost every color in the UI is
driven by a token like `var(--ink)` or `var(--accent)`, so you change the look by
editing tokens — not by hunting through markup.

---

## 1. How the styling works

There are three layers:

1. **Base tokens** — defined on `:root` (the default *Violet · light* theme).
2. **Theme overrides** — each `[data-theme="..."]` block redefines those base tokens.
3. **Derived overlays** — a second `:root` block computes lines, fills, glows, and
   accent tints from the active theme using `color-mix()`. You usually never touch these.

The active theme is set by a `data-theme` attribute on `<html>`. The floating
**palette pill** at the bottom of the page flips that attribute and remembers your
choice in `localStorage`.

All the relevant code lives inside one `<style>` block near the top of the file
(search for `===== base tokens`).

---

## 2. The token vocabulary

Every theme defines the same set of tokens. Match this contract and the whole page
re-skins automatically.

| Token | What it controls |
|-------|------------------|
| `--bg` | Page background |
| `--surface` | Cards, panels, the search bar background |
| `--panel` | Code/terminal block background |
| `--panel-ink` | Text inside code/terminal blocks |
| `--ink` | Strongest text (headings, key words) |
| `--ink-1` → `--ink-4` | Text ramp from strong → faint (body, labels, captions) |
| `--accent` | Brand color (icons, dots, highlights) |
| `--accent-link` | Accent used for links and primary buttons |
| `--accent-deep` | Pressed/hover accent, accent-on-accent text |
| `--on-accent` | Text/icon color placed **on top of** an accent fill |
| `--grad-from` / `--grad-to` | Endpoints of the gradient headings |
| `--code-str` | String color in code samples |

> **Contrast rule:** on light themes `--on-accent` is usually `#ffffff`; on dark
> themes it's a very dark shade of the accent so accent buttons stay readable.

### Derived overlays (automatic — do not hand-edit)

These recompute from the active theme's `--ink` / `--accent`, so they always stay in
harmony. You only edit them if you want to change *the formula itself* (e.g. make all
borders heavier site-wide):

`--line`, `--line-2`, `--line-3` (borders) · `--fill-0` … `--fill-3` (subtle fills) ·
`--accent-soft`, `--accent-soft2`, `--accent-line*`, `--accent-glow*`, `--glow`,
`--accent-shadow`.

---

## 3. Common tasks

### A. Tweak an existing theme

Find its block (e.g. `[data-theme="zinc-dark"]`) and change the token values. Reload —
nothing else needs touching.

### B. Change the *default* look

The default theme is the bare `:root` block (currently *Violet · light*). Edit those
values, or point users at a different default by changing the saved preference logic at
the bottom of the file:

```js
var saved=''; try{ saved=localStorage.getItem('ud-theme')||''; }catch(e){}
apply(saved);                 // '' means the :root default
```

To ship a different default, change `apply(saved)` to e.g. `apply(saved || 'zinc-dark')`.

### C. Add a brand-new theme

Three steps:

**1. Add a token block** next to the other themes in the `<style>`:

```css
[data-theme="ocean-dark"]{
  --bg:#0b1622; --surface:#13212f; --panel:#0f1b27; --panel-ink:#cfe0ee;
  --ink:#eef6ff; --ink-1:#d8e6f4; --ink-2:#aac1d6; --ink-3:#7a93aa; --ink-4:#5e7689;
  --accent:#38bdf8; --accent-link:#7dd3fc; --accent-deep:#bae6fd; --on-accent:#062033;
  --grad-from:#ffffff; --grad-to:#7dd3fc; --code-str:#6ee7b7;
}
```

**2. Add a swatch** to the palette pill (the `.theme-pill__dots` group near the bottom).
The `--dot` color should be the theme's accent so the swatch matches:

```html
<button class="swatch" data-theme="ocean-dark" title="Ocean · dark" style="--dot:#38bdf8"></button>
```

**3. Reload.** The switcher JS picks it up automatically via `data-theme` — no JS edits
needed. An empty `data-theme=""` always maps back to the `:root` default.

### D. Change fonts

The UI font is **Inter**, loaded via the Google Fonts `<link>` in `<head>` and applied
on the `<body>` `style` attribute. Swap the font by changing both the `<link>` URL and
the `font-family` fallback stack on `<body>`. Code blocks use the `font-mono` Tailwind
utility (system monospace) — change those with a `--font-mono` declaration or by editing
the `font-mono` usages.

### E. Adjust global density / scale

Overall text size is set once:

```css
html { font-size: 17.5px; }
```

Lower it (e.g. `16px`) for a denser layout, raise it for a roomier one — everything
sized in `rem`/`em` scales with it.

### F. Tune transitions

Theme switching is animated by this rule:

```css
*,*::before,*::after { transition: background-color .4s ease, border-color .4s ease, color .3s ease; }
```

Shorten the durations for snappier switching, or remove the rule for instant changes.

---

## 4. Quick checklist for a new theme

- [ ] Defined **all** tokens from the table in §2 (don't leave gaps — undefined tokens
      fall back to the `:root` default and can look broken).
- [ ] `--on-accent` contrasts against `--accent-link` (white on light, dark on dark).
- [ ] `--ink` → `--ink-4` is a smooth strong→faint ramp.
- [ ] Added a matching `.swatch` button with the right `--dot`.
- [ ] Reloaded and clicked the swatch to verify text, buttons, code blocks, and the
      hero gradient all read correctly.

---

## 5. Where things live (line landmarks)

| Section | Find it by searching for |
|---------|--------------------------|
| Base tokens / default theme | `===== base tokens` |
| Theme override blocks | `[data-theme="` |
| Derived overlays | `derived overlays` |
| Palette pill markup | `class="theme-pill"` |
| Theme switcher JS | `localStorage.setItem('ud-theme'` |
| Global font size | `html { font-size:` |
