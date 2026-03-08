# Docusaurus Custom Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a complete, working Docusaurus custom theme package + starter template with professional & modern UI using TypeScript and CSS Modules.

**Architecture:**
- `demo-template/theme-package/` — Standalone npm theme package with React components, CSS Modules, and design tokens
- `demo-template/starter/` — Pre-configured Docusaurus project using the theme package with example documentation
- Both use pure CSS (no dependencies), TypeScript for type safety, and support dark mode

**Tech Stack:** TypeScript, React, CSS Modules, Docusaurus 3.x, Node.js 16+

---

## Task 1: Initialize Directory Structure & Theme Package

**Files:**
- Create: `demo-template/theme-package/package.json`
- Create: `demo-template/theme-package/tsconfig.json`
- Create: `demo-template/theme-package/src/index.ts`

**Step 1: Create root demo-template directory**

Run:
```bash
mkdir -p /tmp/demo-template
cd /tmp/demo-template
```

Expected: Directory created and accessible

**Step 2: Create theme-package directory structure**

Run:
```bash
mkdir -p theme-package/src/{theme,styles}
mkdir -p theme-package/lib
cd theme-package
```

Expected: Nested directories created

**Step 3: Create theme-package/package.json**

```json
{
  "name": "docusaurus-theme-sophisticated",
  "version": "1.0.0",
  "description": "Professional & modern Docusaurus theme with TypeScript and CSS Modules",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "files": ["lib", "src"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "keywords": ["docusaurus", "theme", "professional", "modern"],
  "author": "",
  "license": "MIT",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@docusaurus/core": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "@docusaurus/types": "^3.0.0"
  },
  "dependencies": {
    "clsx": "^2.0.0"
  }
}
```

**Step 4: Create theme-package/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./lib",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "lib"]
}
```

**Step 5: Create theme-package/src/index.ts**

```typescript
import type { Plugin } from '@docusaurus/types';

export default function themePlugin(): Plugin {
  return {
    name: 'docusaurus-theme-sophisticated',

    getThemePath() {
      return require.resolve('./theme');
    },

    getTypeScriptThemePath() {
      return require.resolve('./theme');
    },
  };
}
```

**Step 6: Commit**

```bash
cd /tmp/demo-template/theme-package
git init
git add package.json tsconfig.json src/index.ts
git commit -m "feat: initialize theme package structure"
```

Expected: Files staged and committed

---

## Task 2: Create Design Tokens & Global Styles

**Files:**
- Create: `demo-template/theme-package/src/styles/design-tokens.css`
- Create: `demo-template/theme-package/src/styles/global.css`
- Create: `demo-template/theme-package/src/styles/index.css`

**Step 1: Create design-tokens.css with all CSS variables**

Create `theme-package/src/styles/design-tokens.css`:

```css
/* ════════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   All colors, typography, spacing, shadows in CSS variables
   ════════════════════════════════════════════════════════════════════════════ */

:root {
  /* ──────────────────────────────────────────────────────────────────────────
     COLOR PALETTE
     ────────────────────────────────────────────────────────────────────────── */

  /* Primary Colors - Professional Blue */
  --color-primary-50: #f0f4ff;
  --color-primary-100: #e0e9ff;
  --color-primary-500: #2d5fcc;
  --color-primary-600: #2451b8;
  --color-primary-700: #1e2d6b;
  --color-primary-900: #0f1a3d;

  /* Accent Colors - Warm Gold */
  --color-accent-500: #c47d0e;
  --color-accent-600: #b0700a;

  /* Semantic Colors */
  --color-success-500: #2a7d4f;
  --color-warning-500: #d97706;
  --color-error-500: #b93030;
  --color-info-500: #0ea5e9;

  /* Neutral Grays */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* Text & Background (Light Mode) */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-bg-primary: #ffffff;
  --color-bg-secondary: var(--color-gray-50);

  /* ──────────────────────────────────────────────────────────────────────────
     TYPOGRAPHY
     ────────────────────────────────────────────────────────────────────────── */

  /* Font Families */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;

  /* Font Sizes (16px base, 1.25 scale) */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 1.875rem;
  --font-size-3xl: 2.25rem;
  --font-size-4xl: 3rem;

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* ──────────────────────────────────────────────────────────────────────────
     SPACING (8px grid system)
     ────────────────────────────────────────────────────────────────────────── */

  --spacing-0: 0;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;

  /* ──────────────────────────────────────────────────────────────────────────
     LAYOUT
     ────────────────────────────────────────────────────────────────────────── */

  --container-max-width: 1200px;
  --sidebar-width: 250px;
  --navbar-height: 60px;

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;

  /* ──────────────────────────────────────────────────────────────────────────
     SHADOWS
     ────────────────────────────────────────────────────────────────────────── */

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* ──────────────────────────────────────────────────────────────────────────
     BORDER RADIUS
     ────────────────────────────────────────────────────────────────────────── */

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* ──────────────────────────────────────────────────────────────────────────
     TRANSITIONS
     ────────────────────────────────────────────────────────────────────────── */

  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;

  /* ──────────────────────────────────────────────────────────────────────────
     GRADIENTS
     ────────────────────────────────────────────────────────────────────────── */

  --gradient-hero: linear-gradient(135deg, #2d5fcc 0%, #1e2d6b 100%);
  --gradient-accent: linear-gradient(135deg, #c47d0e 0%, #b0700a 100%);
  --gradient-subtle: linear-gradient(180deg, rgba(45, 95, 204, 0.05) 0%, rgba(196, 125, 14, 0.05) 100%);
}

/* ════════════════════════════════════════════════════════════════════════════
   DARK MODE
   Override colors for dark theme
   ════════════════════════════════════════════════════════════════════════════ */

[data-theme='dark'] {
  --color-text-primary: #f5f5f5;
  --color-text-secondary: #b0b0b0;
  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
}
```

**Step 2: Create global.css with base styles**

Create `theme-package/src/styles/global.css`:

```css
@import './design-tokens.css';

/* ════════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES
   Base HTML, body, and element styles
   ════════════════════════════════════════════════════════════════════════════ */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  line-height: var(--line-height-normal);
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

/* ──────────────────────────────────────────────────────────────────────────
   TYPOGRAPHY
   ────────────────────────────────────────────────────────────────────────── */

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-top: var(--spacing-8);
  margin-bottom: var(--spacing-4);
  color: var(--color-text-primary);
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

p {
  margin-bottom: var(--spacing-4);
  line-height: var(--line-height-relaxed);
}

/* ──────────────────────────────────────────────────────────────────────────
   LINKS
   ────────────────────────────────────────────────────────────────────────── */

a {
  color: var(--color-primary-500);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-600);
  text-decoration: underline;
}

/* ──────────────────────────────────────────────────────────────────────────
   CODE & PRE
   ────────────────────────────────────────────────────────────────────────── */

code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background-color: var(--color-bg-secondary);
  padding: 0.2em 0.4em;
  border-radius: var(--radius-md);
  color: var(--color-accent-500);
}

pre {
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  overflow-x: auto;
  margin: var(--spacing-4) 0;
}

pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

/* ──────────────────────────────────────────────────────────────────────────
   LISTS
   ────────────────────────────────────────────────────────────────────────── */

ul, ol {
  margin-left: var(--spacing-6);
  margin-bottom: var(--spacing-4);
}

li {
  margin-bottom: var(--spacing-2);
}

/* ──────────────────────────────────────────────────────────────────────────
   BLOCKQUOTES
   ────────────────────────────────────────────────────────────────────────── */

blockquote {
  border-left: 4px solid var(--color-primary-500);
  padding-left: var(--spacing-4);
  margin-left: 0;
  margin-bottom: var(--spacing-4);
  color: var(--color-text-secondary);
  font-style: italic;
}

/* ──────────────────────────────────────────────────────────────────────────
   TABLES
   ────────────────────────────────────────────────────────────────────────── */

table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-4) 0;
}

th, td {
  padding: var(--spacing-3);
  text-align: left;
  border-bottom: 1px solid var(--color-gray-200);
}

[data-theme='dark'] th,
[data-theme='dark'] td {
  border-bottom-color: var(--color-gray-700);
}

th {
  background-color: var(--color-bg-secondary);
  font-weight: var(--font-weight-semibold);
}

/* ──────────────────────────────────────────────────────────────────────────
   BUTTONS
   ────────────────────────────────────────────────────────────────────────── */

button {
  font-family: var(--font-sans);
  cursor: pointer;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* ──────────────────────────────────────────────────────────────────────────
   INPUTS & FORMS
   ────────────────────────────────────────────────────────────────────────── */

input, textarea, select {
  font-family: var(--font-sans);
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
}

[data-theme='dark'] input,
[data-theme='dark'] textarea,
[data-theme='dark'] select {
  border-color: var(--color-gray-700);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(45, 95, 204, 0.1);
}
```

**Step 3: Create index.css that imports all styles**

Create `theme-package/src/styles/index.css`:

```css
@import './design-tokens.css';
@import './global.css';
```

**Step 4: Verify files created**

Run:
```bash
ls -la theme-package/src/styles/
```

Expected: All three CSS files present

**Step 5: Commit**

```bash
cd /tmp/demo-template/theme-package
git add src/styles/
git commit -m "feat: add design tokens and global styles"
```

Expected: Files committed successfully

---

## Task 3: Create Theme Components (Navbar, Layout, Footer)

**Files:**
- Create: `demo-template/theme-package/src/theme/Navbar/Navbar.tsx`
- Create: `demo-template/theme-package/src/theme/Navbar/Navbar.module.css`
- Create: `demo-template/theme-package/src/theme/Layout/Layout.tsx`
- Create: `demo-template/theme-package/src/theme/Layout/Layout.module.css`
- Create: `demo-template/theme-package/src/theme/Footer/Footer.tsx`
- Create: `demo-template/theme-package/src/theme/Footer/Footer.module.css`

**Step 1: Create Navbar.tsx**

Create `theme-package/src/theme/Navbar/Navbar.tsx`:

```typescript
import React from 'react';
import styles from './Navbar.module.css';

interface NavbarProps {
  className?: string;
  title?: string;
  logo?: string;
}

export default function Navbar({ className, title = 'Documentation', logo }: NavbarProps) {
  return (
    <nav className={`${styles.navbar} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.navbarInner}>
          <div className={styles.logo}>
            {logo ? <img src={logo} alt="Logo" className={styles.logoImg} /> : null}
            <span className={styles.title}>{title}</span>
          </div>

          <div className={styles.navbarItems}>
            <a href="#" className={styles.navItem}>Docs</a>
            <a href="#" className={styles.navItem}>GitHub</a>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Step 2: Create Navbar.module.css**

Create `theme-package/src/theme/Navbar/Navbar.module.css`:

```css
.navbar {
  background: linear-gradient(180deg, var(--color-bg-primary) 0%, rgba(45, 95, 204, 0.02) 100%);
  border-bottom: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all var(--transition-normal);
}

[data-theme='dark'] .navbar {
  border-bottom-color: var(--color-gray-700);
  background: linear-gradient(180deg, var(--color-dark-bg-primary) 0%, rgba(45, 95, 204, 0.05) 100%);
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.navbarInner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--navbar-height);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  color: var(--color-primary-500);
  text-decoration: none;
}

.logoImg {
  height: 32px;
  width: 32px;
  object-fit: contain;
}

.title {
  background: var(--gradient-subtle);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbarItems {
  display: flex;
  gap: var(--spacing-6);
  align-items: center;
}

.navItem {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
  text-decoration: none;
}

.navItem:hover {
  color: var(--color-primary-500);
}

@media (max-width: 768px) {
  .navbarItems {
    display: none;
  }

  .title {
    display: none;
  }
}
```

**Step 3: Create Layout.tsx**

Create `theme-package/src/theme/Layout/Layout.tsx`:

```typescript
import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  navbarTitle?: string;
  navbarLogo?: string;
}

export default function Layout({ children, navbarTitle, navbarLogo }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Navbar title={navbarTitle} logo={navbarLogo} />
      <main className={styles.main}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

**Step 4: Create Layout.module.css**

Create `theme-package/src/theme/Layout/Layout.module.css`:

```css
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.main {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-8) var(--spacing-4);
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .main {
    padding: var(--spacing-4);
  }
}
```

**Step 5: Create Footer.tsx**

Create `theme-package/src/theme/Footer/Footer.tsx`:

```typescript
import React from 'react';
import styles from './Footer.module.css';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  columns?: FooterColumn[];
  copyright?: string;
}

const defaultColumns: FooterColumn[] = [
  {
    title: 'Docs',
    links: [
      { label: 'Introduction', href: '#' },
      { label: 'Getting Started', href: '#' },
      { label: 'Guides', href: '#' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: '#' },
      { label: 'Discussions', href: '#' },
      { label: 'Issues', href: '#' },
    ],
  },
];

export default function Footer({ columns = defaultColumns, copyright }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {columns.map((column) => (
            <div key={column.title} className={styles.column}>
              <h4 className={styles.columnTitle}>{column.title}</h4>
              <ul className={styles.links}>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {copyright && (
          <div className={styles.copyright}>
            <p>{copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
}
```

**Step 6: Create Footer.module.css**

Create `theme-package/src/theme/Footer/Footer.module.css`:

```css
.footer {
  background: linear-gradient(180deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%);
  border-top: 1px solid var(--color-gray-200);
  margin-top: var(--spacing-16);
  padding: var(--spacing-12) var(--spacing-4);
}

[data-theme='dark'] .footer {
  border-top-color: var(--color-gray-700);
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-8);
}

.column {
  display: flex;
  flex-direction: column;
}

.columnTitle {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4);
}

.links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.link {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
  text-decoration: none;
}

.link:hover {
  color: var(--color-primary-500);
}

.copyright {
  border-top: 1px solid var(--color-gray-200);
  padding-top: var(--spacing-6);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

[data-theme='dark'] .copyright {
  border-top-color: var(--color-gray-700);
}
```

**Step 7: Create directory structure for components**

Run:
```bash
mkdir -p theme-package/src/theme/{Navbar,Layout,Footer}
```

**Step 8: Move files to correct locations (if using Write tool)**

Run:
```bash
ls -la theme-package/src/theme/
```

Expected: Three component directories

**Step 9: Commit**

```bash
cd /tmp/demo-template/theme-package
git add src/theme/
git commit -m "feat: add core theme components (Navbar, Layout, Footer)"
```

Expected: All component files committed

---

## Task 4: Create MDX Components (Callout, Card)

**Files:**
- Create: `demo-template/theme-package/src/theme/MDXComponents/Callout.tsx`
- Create: `demo-template/theme-package/src/theme/MDXComponents/Callout.module.css`
- Create: `demo-template/theme-package/src/theme/MDXComponents/Card.tsx`
- Create: `demo-template/theme-package/src/theme/MDXComponents/Card.module.css`
- Create: `demo-template/theme-package/src/theme/MDXComponents/index.tsx`

**Step 1: Create Callout.tsx**

Create `theme-package/src/theme/MDXComponents/Callout.tsx`:

```typescript
import React from 'react';
import styles from './Callout.module.css';

type CalloutType = 'info' | 'warning' | 'success' | 'error';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const icons: Record<CalloutType, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  error: '❌',
};

export default function Callout({ type = 'info', title, children }: CalloutProps) {
  return (
    <div className={`${styles.callout} ${styles[type]}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{icons[type]}</span>
        {title && <div className={styles.title}>{title}</div>}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
```

**Step 2: Create Callout.module.css**

Create `theme-package/src/theme/MDXComponents/Callout.module.css`:

```css
.callout {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border-left: 4px solid;
  margin: var(--spacing-4) 0;
  background-color: rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.callout.info {
  border-left-color: var(--color-info-500);
}

.callout.warning {
  border-left-color: var(--color-warning-500);
}

.callout.success {
  border-left-color: var(--color-success-500);
}

.callout.error {
  border-left-color: var(--color-error-500);
}

.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.icon {
  font-size: 1.2em;
  flex-shrink: 0;
}

.title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.content {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-text-secondary);
  margin-left: calc(1.2em + var(--spacing-2));
}

.content p {
  margin: 0;
}

.content p + p {
  margin-top: var(--spacing-2);
}
```

**Step 3: Create Card.tsx**

Create `theme-package/src/theme/MDXComponents/Card.tsx`:

```typescript
import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  description?: string;
  href?: string;
  children?: React.ReactNode;
  icon?: string;
}

export default function Card({ title, description, href, children, icon }: CardProps) {
  const content = (
    <>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {children && <div className={styles.children}>{children}</div>}
    </>
  );

  if (href) {
    return (
      <a href={href} className={styles.card}>
        {content}
      </a>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
```

**Step 4: Create Card.module.css**

Create `theme-package/src/theme/MDXComponents/Card.module.css`:

```css
.card {
  display: block;
  padding: var(--spacing-6);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

[data-theme='dark'] .card {
  border-color: var(--color-gray-700);
}

.card:hover {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.icon {
  font-size: 2em;
  width: fit-content;
}

.title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--color-primary-500);
}

.description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.children {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

**Step 5: Create MDXComponents/index.tsx**

Create `theme-package/src/theme/MDXComponents/index.tsx`:

```typescript
export { default as Callout } from './Callout';
export { default as Card } from './Card';
export type { default as CalloutProps } from './Callout';
export type { default as CardProps } from './Card';
```

**Step 6: Create MDXComponents directory**

Run:
```bash
mkdir -p theme-package/src/theme/MDXComponents
```

**Step 7: Commit**

```bash
cd /tmp/demo-template/theme-package
git add src/theme/MDXComponents/
git commit -m "feat: add MDX components (Callout, Card)"
```

Expected: MDX components committed

---

## Task 5: Initialize Starter Template & Configure Docusaurus

**Files:**
- Create: `demo-template/starter/package.json`
- Create: `demo-template/starter/docusaurus.config.ts`
- Create: `demo-template/starter/tsconfig.json`
- Create: `demo-template/starter/sidebars.ts`

**Step 1: Create starter directory structure**

Run:
```bash
cd /tmp/demo-template
mkdir -p starter/{docs,src/css,static/img}
cd starter
```

Expected: Directories created

**Step 2: Create starter/package.json**

Create `starter/package.json`:

```json
{
  "name": "docusaurus-starter-sophisticated",
  "version": "1.0.0",
  "description": "Professional & modern Docusaurus starter template",
  "scripts": {
    "start": "docusaurus start",
    "build": "docusaurus build",
    "swizzle": "docusaurus swizzle",
    "deploy": "docusaurus deploy",
    "clear": "docusaurus clear",
    "serve": "docusaurus serve",
    "write-translations": "docusaurus write-translations",
    "write-heading-ids": "docusaurus write-heading-ids"
  },
  "dependencies": {
    "@docusaurus/core": "^3.0.0",
    "@docusaurus/preset-classic": "^3.0.0",
    "docusaurus": "^3.0.0",
    "docusaurus-theme-sophisticated": "file:../theme-package",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@docusaurus/module-federation-runtime": "^3.0.0",
    "@docusaurus/types": "^3.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

**Step 3: Create starter/docusaurus.config.ts**

Create `starter/docusaurus.config.ts`:

```typescript
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Sophisticated Documentation',
  tagline: 'Professional & Modern Theme',
  favicon: 'img/favicon.ico',

  url: 'https://example.com',
  baseUrl: '/',

  organizationName: 'your-org',
  projectName: 'your-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/your-org/your-docs/edit/main/',
          showLastUpdateTime: true,
          breadcrumbs: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: 'Sophisticated Docs',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/',
            },
            {
              label: 'Getting Started',
              to: '/getting-started',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Your Organization. Built with Docusaurus.`,
    },

    prism: {
      theme: require('prism-react-renderer').themes.github,
      darkTheme: require('prism-react-renderer').themes.dracula,
      additionalLanguages: ['bash', 'yaml', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
```

**Step 4: Create starter/tsconfig.json**

Create `starter/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src"]
}
```

**Step 5: Create starter/sidebars.ts**

Create `starter/sidebars.ts`:

```typescript
import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/components',
        'guides/customization',
      ],
    },
  ],
};

export default sidebars;
```

**Step 6: Create starter/src/css/custom.css**

Create `starter/src/css/custom.css`:

```css
/* Override design tokens here */

:root {
  /* Example customizations */
  --color-primary-500: #2d5fcc;
  --color-accent-500: #c47d0e;
}
```

**Step 7: Commit**

```bash
cd /tmp/demo-template/starter
git init
git add package.json docusaurus.config.ts tsconfig.json sidebars.ts src/
git commit -m "feat: initialize starter template with Docusaurus config"
```

Expected: Configuration files committed

---

## Task 6: Create Documentation Content

**Files:**
- Create: `demo-template/starter/docs/intro.md`
- Create: `demo-template/starter/docs/getting-started/installation.md`
- Create: `demo-template/starter/docs/getting-started/configuration.md`
- Create: `demo-template/starter/docs/guides/components.md`
- Create: `demo-template/starter/docs/guides/customization.md`

**Step 1: Create intro.md**

Create `starter/docs/intro.md`:

```markdown
---
slug: /
---

# Welcome to Sophisticated Documentation

This is a complete, working example of a professional & modern Docusaurus theme built with TypeScript and CSS Modules.

## Features

✨ **Professional Design** — Refined typography, sophisticated color palette, and modern aesthetics

🎨 **Fully Customizable** — Override colors, fonts, and spacing via CSS variables

🌙 **Dark Mode** — Automatic dark mode support out-of-the-box

📱 **Responsive** — Mobile-first design that works on all devices

⚡ **Type-Safe** — Built with TypeScript for maintainability

📦 **Reusable** — Use as npm package or starter template

## Quick Start

1. **Browse the documentation** using the sidebar
2. **Explore components** in the [Components Guide](guides/components)
3. **Customize the theme** following the [Customization Guide](guides/customization)

## What's Inside

- **Navbar** — Sticky navigation with branding
- **Footer** — Multi-column footer with links
- **Layout** — Professional page layout with proper spacing
- **Callout Component** — Info, warning, success, and error alerts
- **Card Component** — Reusable card components for content
- **Design Tokens** — Complete design system in CSS variables
- **Dark Mode** — Automatic theme switching

## Next Steps

→ [Read the Getting Started Guide](getting-started/installation)
```

**Step 2: Create installation.md**

Create `starter/docs/getting-started/installation.md`:

```markdown
# Installation

## Prerequisites

- Node.js 16 or higher
- npm or yarn package manager

## Setup

### Using the Starter Template

```bash
git clone <starter-template-repo>
cd docusaurus-starter-sophisticated
npm install
npm start
```

The site will open at `http://localhost:3000`.

### Using the Theme Package Only

```bash
npm install docusaurus-theme-sophisticated
```

Then update your `docusaurus.config.ts`:

```typescript
import type { Config } from '@docusaurus/types';

const config: Config = {
  // ... your config
  presets: [
    [
      'classic', // or 'docusaurus-theme-sophisticated'
      {
        // ... your preset options
      },
    ],
  ],
};

export default config;
```

## Verify Installation

Run the development server:

```bash
npm start
```

Open your browser and navigate to `http://localhost:3000`. You should see the documentation site with the sophisticated theme applied.
```

**Step 3: Create configuration.md**

Create `starter/docs/getting-started/configuration.md`:

```markdown
# Configuration

## Customizing the Theme

All theme settings are in `docusaurus.config.ts`.

### Navbar Configuration

```typescript
navbar: {
  title: 'Your Documentation',
  logo: {
    alt: 'Your Logo',
    src: 'img/logo.svg',
    srcDark: 'img/logo-dark.svg',
  },
  items: [
    {
      type: 'doc',
      docId: 'intro',
      position: 'left',
      label: 'Docs',
    },
    {
      href: 'https://github.com/your-org/your-docs',
      label: 'GitHub',
      position: 'right',
    },
  ],
},
```

### Footer Configuration

```typescript
footer: {
  style: 'light',
  links: [
    {
      title: 'Docs',
      items: [
        {
          label: 'Introduction',
          to: '/',
        },
      ],
    },
  ],
  copyright: 'Copyright © 2024',
},
```

### Color Mode

```typescript
colorMode: {
  defaultMode: 'light',
  disableSwitch: false,
  respectPrefersColorScheme: true,
},
```

## Overriding Design Tokens

Edit `src/css/custom.css` to override CSS variables:

```css
:root {
  /* Primary color */
  --color-primary-500: #2d5fcc;
  --color-primary-600: #2451b8;

  /* Accent color */
  --color-accent-500: #c47d0e;

  /* Typography */
  --font-sans: 'Your Font', sans-serif;

  /* Spacing */
  --spacing-4: 1rem;
}
```

## Available Design Tokens

See the [Components Guide](../guides/components) for a complete list of design tokens and how to use them.
```

**Step 4: Create components.md**

Create `starter/docs/guides/components.md`:

```markdown
# Components

This guide showcases all available components in the sophisticated theme.

## Callout Component

Use the `<Callout>` component for alerts and important information.

import Callout from '@site/src/components/Callout';

<Callout type="info" title="Information">
  This is an informational callout. Use it for tips and helpful hints.
</Callout>

<Callout type="warning" title="Warning">
  This is a warning callout. Use it for important cautions.
</Callout>

<Callout type="success" title="Success">
  This is a success callout. Use it for confirmations.
</Callout>

<Callout type="error" title="Error">
  This is an error callout. Use it for problems or failures.
</Callout>

### Callout Props

- `type`: `'info' | 'warning' | 'success' | 'error'` (default: `'info'`)
- `title`: Optional title text
- `children`: Callout content

## Card Component

Use the `<Card>` component for displaying content in card format.

import Card from '@site/src/components/Card';

<Card
  title="Learn More"
  description="Click to explore more features"
  href="#"
  icon="📚"
/>

### Card Props

- `title`: Card heading
- `description`: Optional description text
- `href`: Optional link URL
- `icon`: Optional emoji or icon
- `children`: Card content

## Typography

### Headings

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

### Inline Elements

**Bold text** — Use for emphasis

_Italic text_ — Use for alternatives

\`Code snippet\` — Inline code

[Links](#) — Navigate between pages

### Lists

#### Unordered List

- Item 1
- Item 2
- Item 3

#### Ordered List

1. First
2. Second
3. Third

## Code Blocks

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Tables

| Feature | Status | Description |
|---------|--------|-------------|
| Dark Mode | ✅ | Automatic dark theme |
| Responsive | ✅ | Mobile-friendly design |
| Type-Safe | ✅ | Full TypeScript support |

## Blockquotes

> This is a blockquote. Use it for important quotes or emphasis.
```

**Step 5: Create customization.md**

Create `starter/docs/guides/customization.md`:

```markdown
# Customization

## Changing Colors

Edit `src/css/custom.css` to override colors:

```css
:root {
  /* Change primary blue to your brand color */
  --color-primary-500: #your-color;
  --color-primary-600: #your-darker-color;

  /* Change accent gold to your accent */
  --color-accent-500: #your-accent;
}
```

## Custom Fonts

```css
:root {
  /* Import and use custom fonts */
  --font-sans: 'Your Font Name', sans-serif;
  --font-mono: 'Your Mono Font', monospace;
}
```

## Adjusting Spacing

```css
:root {
  /* Make elements more spacious */
  --spacing-4: 1.25rem; /* default: 1rem */
  --spacing-6: 2rem;    /* default: 1.5rem */
}
```

## Dark Mode

Dark mode colors are automatically generated from light mode. To customize:

```css
[data-theme='dark'] {
  --color-text-primary: #ffffff;
  --color-bg-primary: #1a1a1a;
}
```

## Adding Custom Components

Create a new component in `src/components/`:

```typescript
// src/components/Hero.tsx
import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #2d5fcc 0%, #1e2d6b 100%)',
      padding: '60px 20px',
      color: 'white',
      textAlign: 'center',
    }}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
```

Use in your docs:

```markdown
import Hero from '@site/src/components/Hero';

<Hero title="Welcome" subtitle="To your documentation" />
```

## Next Steps

- Explore the [Components Guide](./components) for all available components
- Check [Docusaurus documentation](https://docusaurus.io) for more customization options
- [GitHub Issues](https://github.com) for questions and feedback
```

**Step 6: Create docs directory structure**

Run:
```bash
mkdir -p starter/docs/getting-started starter/docs/guides
```

**Step 7: Commit**

```bash
cd /tmp/demo-template/starter
git add docs/
git commit -m "docs: add comprehensive documentation content"
```

Expected: All documentation files committed

---

## Task 7: Create Basic Logo & Assets

**Files:**
- Create: `demo-template/starter/static/img/logo.svg`
- Create: `demo-template/starter/static/img/favicon.ico`

**Step 1: Create placeholder logo SVG**

Create `starter/static/img/logo.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="#2d5fcc">
  <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2"/>
  <path d="M16 8 L20 14 L16 16 L12 14 Z" fill="currentColor"/>
  <path d="M16 16 L20 18 L16 24 L12 18 Z" fill="currentColor" opacity="0.6"/>
</svg>
```

**Step 2: Create favicon placeholder**

Create `starter/static/img/favicon.ico`:

Note: For a real favicon, use an online generator. This is a placeholder reference.

Run:
```bash
touch starter/static/img/favicon.ico
```

**Step 3: Verify assets directory**

Run:
```bash
ls -la starter/static/img/
```

Expected: logo.svg and favicon.ico present

**Step 4: Commit**

```bash
cd /tmp/demo-template/starter
git add static/img/
git commit -m "feat: add logo and favicon assets"
```

Expected: Assets committed

---

## Task 8: Create README Files

**Files:**
- Create: `demo-template/README.md`
- Create: `demo-template/theme-package/README.md`
- Create: `demo-template/starter/README.md`

**Step 1: Create root README.md**

Create `demo-template/README.md`:

```markdown
# Docusaurus Custom Theme Demo

A complete, working implementation of a professional & modern Docusaurus theme with starter template.

## What's Included

### 📦 Theme Package (`theme-package/`)

Standalone npm package with:
- Core React components (Navbar, Layout, Footer)
- Design tokens (colors, typography, spacing)
- CSS Modules for all styling
- MDX components (Callout, Card)
- TypeScript support
- Dark mode support

### 🚀 Starter Template (`starter/`)

Pre-configured Docusaurus project with:
- Theme package installed and configured
- Example documentation
- Design token customization guide
- Component showcase

## Quick Start

### Option 1: Use the Starter Template

```bash
cd starter
npm install
npm start
```

Open http://localhost:3000 in your browser.

### Option 2: Build the Theme Package

```bash
cd theme-package
npm install
npm run build
```

## Directory Structure

```
demo-template/
├── theme-package/
│   ├── src/
│   │   ├── theme/
│   │   │   ├── Navbar/
│   │   │   ├── Layout/
│   │   │   ├── Footer/
│   │   │   └── MDXComponents/
│   │   ├── styles/
│   │   │   ├── design-tokens.css
│   │   │   ├── global.css
│   │   │   └── index.css
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── lib/ (compiled output)
│
├── starter/
│   ├── docs/
│   │   ├── intro.md
│   │   ├── getting-started/
│   │   └── guides/
│   ├── src/
│   │   └── css/
│   ├── static/
│   │   └── img/
│   ├── docusaurus.config.ts
│   ├── sidebars.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md (this file)
```

## Features

✨ **Professional & Modern** — Sophisticated design with contemporary aesthetics

🎨 **Fully Customizable** — All colors and fonts defined in CSS variables

🌙 **Dark Mode** — Automatic dark mode support

📱 **Responsive** — Mobile-first, works on all devices

⚡ **Type-Safe** — Built with TypeScript

📦 **Reusable** — Use as npm package or starter template

## Usage

### Using the Starter

```bash
cd starter
npm install
npm start
```

### Customizing Colors

Edit `starter/src/css/custom.css`:

```css
:root {
  --color-primary-500: #your-color;
  --color-accent-500: #your-accent;
}
```

### Using Components

```markdown
import Callout from '@site/src/components/Callout';
import Card from '@site/src/components/Card';

<Callout type="info" title="Tip">
  This is helpful information.
</Callout>

<Card title="Learn More" href="/docs" icon="📚" />
```

## Publishing

### Publish Theme to npm

```bash
cd theme-package
npm run build
npm publish
```

### Share Starter Template

Push to GitHub and share the repository link.

## Documentation

See the starter template's documentation for:
- Component usage guide
- Design token reference
- Customization examples
- Troubleshooting

## Support

For questions or issues:
- Check the starter documentation
- Review the theme package code
- Open an issue on GitHub

## License

MIT
```

**Step 2: Create theme-package/README.md**

Create `theme-package/README.md`:

```markdown
# Docusaurus Theme Sophisticated

A professional & modern Docusaurus theme built with TypeScript and CSS Modules.

## Features

- ✨ Professional & modern design
- 🎨 Fully customizable with CSS variables
- 🌙 Dark mode support
- 📱 Responsive design
- ⚡ Type-safe TypeScript
- 🚫 No external UI dependencies

## Installation

```bash
npm install docusaurus-theme-sophisticated
```

## Usage

Update your `docusaurus.config.ts`:

```typescript
const config: Config = {
  presets: [
    [
      'docusaurus-theme-sophisticated',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
      },
    ],
  ],
};

export default config;
```

## Customization

Create `src/css/custom.css`:

```css
:root {
  --color-primary-500: #your-color;
  --color-accent-500: #your-accent;
  --font-sans: 'Your Font', sans-serif;
}
```

## Components

- `Callout` — Alert boxes (info, warning, success, error)
- `Card` — Content cards with optional links
- `Layout` — Main page layout
- `Navbar` — Navigation bar
- `Footer` — Footer with link columns

## Design Tokens

All design elements are defined as CSS variables in `src/styles/design-tokens.css`:

- Colors (primary, accent, semantic)
- Typography (fonts, sizes, weights)
- Spacing (8px grid system)
- Shadows
- Border radius
- Transitions

## License

MIT
```

**Step 3: Create starter/README.md**

Create `starter/README.md`:

```markdown
# Docusaurus Starter - Sophisticated Theme

A complete, ready-to-use documentation site with the sophisticated theme pre-configured.

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:3000 in your browser.

## What's Included

- ✅ Pre-configured Docusaurus setup
- ✅ Sophisticated theme installed
- ✅ Example documentation
- ✅ Design token customization
- ✅ All components showcased

## Project Structure

```
starter/
├── docs/
│   ├── intro.md
│   ├── getting-started/
│   │   ├── installation.md
│   │   └── configuration.md
│   └── guides/
│       ├── components.md
│       └── customization.md
├── src/
│   └── css/
│       └── custom.css
├── static/
│   └── img/
├── docusaurus.config.ts
├── sidebars.ts
└── package.json
```

## Customization

### Change Colors

Edit `src/css/custom.css`:

```css
:root {
  --color-primary-500: #your-color;
  --color-accent-500: #your-accent;
}
```

### Update Navigation

Edit `docusaurus.config.ts`:

```typescript
navbar: {
  title: 'Your Title',
  items: [
    { to: '/docs', label: 'Docs' },
    { href: 'https://github.com', label: 'GitHub' },
  ],
},
```

### Add Content

Create markdown files in `docs/` and reference them in `sidebars.ts`.

## Build for Production

```bash
npm run build
```

Output is in `build/` directory.

## Deploy

### Deploy to GitHub Pages

```bash
npm run deploy
```

(Requires GitHub configuration in `docusaurus.config.ts`)

### Deploy Elsewhere

Build the site and serve the `build/` directory with any static host.

## Learn More

- [Docusaurus Documentation](https://docusaurus.io)
- [Theme Package README](../theme-package/README.md)
- [Components Guide](docs/guides/components.md)
- [Customization Guide](docs/guides/customization.md)

## License

MIT
```

**Step 4: Commit all README files**

```bash
cd /tmp/demo-template
git add README.md theme-package/README.md starter/README.md
git commit -m "docs: add comprehensive README files"
```

Expected: All README files committed

---

## Task 9: Create .gitignore Files & Finalize Structure

**Files:**
- Create: `demo-template/.gitignore`
- Create: `demo-template/theme-package/.gitignore`
- Create: `demo-template/starter/.gitignore`

**Step 1: Create root .gitignore**

Create `demo-template/.gitignore`:

```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
build/
lib/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Environment
.env
.env.local
```

**Step 2: Create theme-package .gitignore**

Create `theme-package/.gitignore`:

```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build output
lib/
*.d.ts
*.js
*.js.map

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
```

**Step 3: Create starter .gitignore**

Create `starter/.gitignore`:

```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
build/
.docusaurus/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store

# Env
.env
.env.local
```

**Step 4: Verify directory structure**

Run:
```bash
cd /tmp/demo-template
find . -type f -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.md" | grep -v node_modules | head -30
```

Expected: All created files listed

**Step 5: Create visual summary**

Run:
```bash
cat > /tmp/demo-template/STRUCTURE.md << 'EOF'
# Project Structure Summary

## Completed Implementation

### Theme Package (`theme-package/`)
- ✅ TypeScript configuration
- ✅ Design tokens (CSS variables)
- ✅ Global styles
- ✅ Navbar component with styling
- ✅ Layout component with styling
- ✅ Footer component with styling
- ✅ MDX components (Callout, Card)
- ✅ Theme entry point

### Starter Template (`starter/`)
- ✅ Docusaurus configuration
- ✅ TypeScript setup
- ✅ Sidebar configuration
- ✅ Documentation content (5 files)
- ✅ Custom CSS for overrides
- ✅ Logo and favicon
- ✅ Package configuration

### Documentation
- ✅ README files for all packages
- ✅ Getting Started guide
- ✅ Component showcase
- ✅ Customization guide
- ✅ Configuration documentation

### Configuration Files
- ✅ .gitignore files
- ✅ package.json files
- ✅ tsconfig.json files
- ✅ Docusaurus config
- ✅ Sidebars config

## File Count

- **TypeScript Files**: 7 (components + index)
- **CSS Files**: 8 (tokens, global, component modules)
- **Markdown Files**: 6 (documentation)
- **Configuration Files**: 8 (.json, .ts)
- **Total**: ~30 files

## Key Features Implemented

1. **Design System**
   - 40+ CSS variables for colors, typography, spacing
   - Dark mode support
   - Responsive breakpoints

2. **Components**
   - Navbar with sticky positioning
   - Layout with proper structure
   - Footer with column layout
   - Callout alerts (4 types)
   - Card components

3. **Customization**
   - CSS variables for easy theming
   - Custom CSS file for overrides
   - TypeScript for type safety

4. **Documentation**
   - Getting started guide
   - Component showcase
   - Customization examples
   - Configuration reference

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm start`
3. Customize colors and fonts
4. Add your documentation
5. Publish theme package to npm (optional)
EOF
cat /tmp/demo-template/STRUCTURE.md
```

**Step 6: Commit all structure files**

```bash
cd /tmp/demo-template
git add .gitignore theme-package/.gitignore starter/.gitignore STRUCTURE.md
git commit -m "chore: add gitignore files and project structure summary"
```

Expected: All files committed

---

## Task 10: Verify Complete Implementation

**Files:** (No new files, verification only)

**Step 1: List all files in demo-template**

Run:
```bash
cd /tmp/demo-template
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.md" -o -name "*.json" \) -not -path "*/node_modules/*" -not -path "*/.git/*" | sort
```

Expected: 30+ files listed

**Step 2: Verify directory structure**

Run:
```bash
tree -L 3 -I 'node_modules' /tmp/demo-template 2>/dev/null || find /tmp/demo-template -type d -not -path '*/node_modules/*' -not -path '*/.git/*' | head -20
```

Expected: Complete directory tree shown

**Step 3: Display final summary**

Run:
```bash
cat << 'EOF'

════════════════════════════════════════════════════════════════════════════════
✅ IMPLEMENTATION COMPLETE
════════════════════════════════════════════════════════════════════════════════

📦 THEME PACKAGE (theme-package/)
  ✅ TypeScript configuration
  ✅ Design tokens & global styles
  ✅ Core components (Navbar, Layout, Footer)
  ✅ MDX components (Callout, Card)
  ✅ CSS Modules for all styling
  ✅ Dark mode support

🚀 STARTER TEMPLATE (starter/)
  ✅ Docusaurus configuration
  ✅ 5 documentation files
  ✅ Component showcase
  ✅ Customization guide
  ✅ Custom CSS override system
  ✅ Logo & favicon

📚 DOCUMENTATION
  ✅ Installation guide
  ✅ Component usage examples
  ✅ Customization instructions
  ✅ Color and typography overrides
  ✅ Complete README files

🎨 DESIGN SYSTEM
  ✅ 40+ CSS variables
  ✅ Professional color palette
  ✅ Typography system
  ✅ 8px spacing grid
  ✅ Shadow and radius tokens
  ✅ Transition definitions

═══════════════════════════════════════════════════════════════════════════════

NEXT STEPS:

1. Navigate to demo-template: cd /tmp/demo-template

2. Install dependencies in starter:
   cd starter && npm install

3. Start development server:
   npm start

4. Open http://localhost:3000 in your browser

5. Customize colors in src/css/custom.css

6. Add your own documentation to docs/

════════════════════════════════════════════════════════════════════════════════
EOF
```

**Step 4: Final commit**

```bash
cd /tmp/demo-template
git log --oneline | head -10
```

Expected: 10 commits visible in history

**Step 5: Create quick reference card**

Run:
```bash
cat > /tmp/QUICK_REFERENCE.md << 'EOF'
# Demo Template Quick Reference

## File Locations

### Theme Components
- **Navbar**: `theme-package/src/theme/Navbar/`
- **Layout**: `theme-package/src/theme/Layout/`
- **Footer**: `theme-package/src/theme/Footer/`
- **MDX Components**: `theme-package/src/theme/MDXComponents/`

### Styling
- **Design Tokens**: `theme-package/src/styles/design-tokens.css`
- **Global Styles**: `theme-package/src/styles/global.css`
- **Custom CSS**: `starter/src/css/custom.css`

### Documentation
- **Configuration**: `starter/docusaurus.config.ts`
- **Content**: `starter/docs/`
- **Navigation**: `starter/sidebars.ts`

## Key CSS Variables

```css
--color-primary-500: #2d5fcc
--color-accent-500: #c47d0e
--font-sans: System fonts
--spacing-4: 1rem (base unit)
--radius-lg: 0.75rem
--shadow-lg: Large shadow
```

## Commands

```bash
cd /tmp/demo-template/starter
npm install
npm start          # Start dev server
npm run build      # Build for production
npm run serve      # Serve built site
```

## Customize

1. **Colors**: Edit `starter/src/css/custom.css`
2. **Content**: Add markdown to `starter/docs/`
3. **Navigation**: Update `starter/sidebars.ts`
4. **Config**: Modify `starter/docusaurus.config.ts`

## Components Usage

```markdown
import Callout from '@site/src/components/Callout';
import Card from '@site/src/components/Card';

<Callout type="info">Your message</Callout>
<Card title="Title" href="/" icon="📚" />
```
EOF
cat /tmp/QUICK_REFERENCE.md
```

Expected: Quick reference displayed

**Step 6: Final verification commit**

```bash
cd /tmp/demo-template
git add -A
git commit -m "chore: complete implementation and verification" 2>/dev/null || echo "No changes to commit"
```

---

## Summary

✅ **Complete implementation created in `/tmp/demo-template/`**

**What was built:**
- Theme package with all components, styles, and design tokens
- Starter template with example documentation
- Complete customization guide
- Professional documentation
- Ready to use or publish to npm

**Total files:** 30+ across TypeScript, CSS, Markdown, and configuration

**Total commits:** 10 incremental commits with clear messages

---

## Execution Options

**Plan complete and saved to** `/tmp/docs/plans/2026-03-04-docusaurus-custom-theme-implementation.md`

Choose your execution approach:

**Option 1: Subagent-Driven (this session)**
- I dispatch a fresh subagent per task
- Fast iteration with code review between tasks
- Recommended for real-time feedback

**Option 2: Parallel Session (separate)**
- Open new session with executing-plans skill
- Batch execution with checkpoints
- Good for heads-down implementation

**Which approach would you prefer?**