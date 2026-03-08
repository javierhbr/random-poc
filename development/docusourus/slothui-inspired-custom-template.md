# Slothui-Inspired Docusaurus Custom Theme

A modern, production-grade Docusaurus custom theme implementation matching the clean, professional design of Slothui documentation sites.

---

## Quick Links

- [Overview](#overview)
- [Architecture](#architecture)
- [Design System](#design-system)
- [Setup Instructions](#setup-instructions)
- [Theme Components](#theme-components)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

---

## Overview

Build a sophisticated Docusaurus theme with:

✅ **Clean Navigation** — Sidebar with category collapsing, breadcrumb trails
✅ **Professional Layout** — Three-column design: sidebar, main content, TOC
✅ **Modern Aesthetics** — Slothui-inspired design tokens, smooth transitions
✅ **Type-Safe** — Built with TypeScript, full type coverage
✅ **Zero Dependencies** — Pure CSS Modules, no UI libraries
✅ **Dark Mode** — CSS variables for seamless theme switching

**Timeline:** 16-20 hours (can be split across multiple sessions)
**Complexity:** Intermediate (React + CSS + Docusaurus internals)

---

## Architecture

### Project Structure

```
docusaurus-theme-slothui/
├── src/
│   ├── theme/
│   │   ├── Navbar/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Navbar.module.css
│   │   │   ├── NavItem.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Sidebar.module.css
│   │   │   ├── SidebarItem.tsx
│   │   │   └── SidebarCategory.tsx
│   │   ├── DocPage/
│   │   │   ├── DocPage.tsx
│   │   │   ├── DocPage.module.css
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── TableOfContents.tsx
│   │   ├── Footer/
│   │   │   ├── Footer.tsx
│   │   │   └── Footer.module.css
│   │   ├── MDXComponents/
│   │   │   ├── Callout.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── index.tsx
│   │   ├── Layout.tsx
│   │   └── Layout.module.css
│   └── styles/
│       ├── design-tokens.css
│       ├── global.css
│       ├── utilities.css
│       └── animations.css
├── package.json
├── tsconfig.json
└── README.md
```

### Three-Column Layout (Like Slothui)

```
┌─────────────────────────────────────────────────────────┐
│ NAVBAR (sticky, full width)                             │
├─────────┬──────────────────────────────┬────────────────┤
│SIDEBAR  │ MAIN CONTENT                 │ TABLE OF       │
│         │                              │ CONTENTS (TOC) │
│ - Intro │ Heading 1                    │ - Heading 1    │
│ - Docs  │ Lorem ipsum...               │ - Heading 2    │
│   - API │                              │ - Heading 3    │
│   - FAQ │ Heading 2                    │                │
│         │ More content...              │                │
├─────────┴──────────────────────────────┴────────────────┤
│ FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Design System

### Design Tokens (Slothui Inspired)

Create `src/styles/design-tokens.css`:

```css
:root {
  /* --- Color Palette --- */

  /* Primary: Professional Blue */
  --color-primary-50: #f0f4ff;
  --color-primary-100: #e0e9ff;
  --color-primary-200: #c5d7ff;
  --color-primary-500: #3b5bdb;
  --color-primary-600: #2d47b8;
  --color-primary-700: #2238a0;

  /* Secondary: Neutral Gray */
  --color-gray-50: #fafbfc;
  --color-gray-100: #f3f5f7;
  --color-gray-200: #e8ecf1;
  --color-gray-300: #d9dfe6;
  --color-gray-400: #c1c7d0;
  --color-gray-500: #8891a0;
  --color-gray-600: #626b7a;
  --color-gray-700: #454d5a;
  --color-gray-800: #2c3139;
  --color-gray-900: #1a1d23;

  /* Semantic Colors */
  --color-success: #2d6a4f;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-info: #0ea5e9;

  /* Text & Background */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-tertiary: var(--color-gray-500);
  --color-bg-primary: #ffffff;
  --color-bg-secondary: var(--color-gray-50);
  --color-bg-tertiary: var(--color-gray-100);
  --color-border: var(--color-gray-200);

  /* --- Typography --- */

  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;

  --font-size-xs: 0.75rem;      /* 12px */
  --font-size-sm: 0.875rem;     /* 14px */
  --font-size-base: 1rem;       /* 16px */
  --font-size-lg: 1.125rem;     /* 18px */
  --font-size-xl: 1.5rem;       /* 24px */
  --font-size-2xl: 1.875rem;    /* 30px */
  --font-size-3xl: 2.25rem;     /* 36px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* --- Spacing --- */

  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */

  /* --- Borders & Shadows --- */

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* --- Transitions --- */

  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;

  /* --- Layout --- */

  --navbar-height: 60px;
  --sidebar-width: 250px;
  --toc-width: 200px;
  --container-max-width: 1280px;
}

/* Dark Mode */
[data-theme='dark'] {
  --color-text-primary: var(--color-gray-50);
  --color-text-secondary: var(--color-gray-400);
  --color-text-tertiary: var(--color-gray-500);
  --color-bg-primary: #1a1d23;
  --color-bg-secondary: var(--color-gray-800);
  --color-bg-tertiary: var(--color-gray-700);
  --color-border: var(--color-gray-700);
}
```

### Global Styles

Create `src/styles/global.css`:

```css
@import './design-tokens.css';

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

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-top: var(--spacing-8);
  margin-bottom: var(--spacing-4);
  color: var(--color-text-primary);
}

h1 { font-size: var(--font-size-3xl); }
h2 { font-size: var(--font-size-2xl); }
h3 { font-size: var(--font-size-xl); }
h4 { font-size: var(--font-size-lg); }

/* Paragraphs */
p {
  margin-bottom: var(--spacing-4);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

/* Links */
a {
  color: var(--color-primary-600);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-500);
  text-decoration: underline;
}

/* Code */
code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background-color: var(--color-bg-secondary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  color: var(--color-primary-600);
}

pre {
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  overflow-x: auto;
  margin: var(--spacing-4) 0;
  border: 1px solid var(--color-border);
}

pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

/* Lists */
ul, ol {
  margin-left: var(--spacing-6);
  margin-bottom: var(--spacing-4);
}

li {
  margin-bottom: var(--spacing-2);
}

/* Blockquotes */
blockquote {
  border-left: 3px solid var(--color-primary-500);
  padding-left: var(--spacing-4);
  margin: var(--spacing-4) 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-4) 0;
}

th, td {
  padding: var(--spacing-3);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

th {
  background-color: var(--color-bg-secondary);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
```

---

## Setup Instructions

### 1. Create Theme Package

```bash
mkdir docusaurus-theme-slothui
cd docusaurus-theme-slothui

npm init -y

# Install dependencies
npm install --save-dev typescript @types/react @types/node
npm install react react-dom docusaurus-core @docusaurus/types
npm install clsx
```

Update `package.json`:

```json
{
  "name": "docusaurus-theme-slothui",
  "version": "1.0.0",
  "description": "Professional Docusaurus theme inspired by Slothui",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "files": ["lib", "src"],
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### 2. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "sourceMap": true,
    "outDir": "./lib",
    "rootDir": "./src",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  },
  "include": ["src"],
  "exclude": ["node_modules", "lib"]
}
```

### 3. Build Directory Structure

```bash
mkdir -p src/theme/{Navbar,Sidebar,DocPage,Footer,MDXComponents}
mkdir -p src/styles
```

---

## Theme Components

### Navbar Component

Create `src/theme/Navbar/Navbar.tsx`:

```typescript
import React from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <strong>Slothui Docs</strong>
        </div>

        <div className={styles.navItems}>
          <a href="/" className={styles.navLink}>API Reference</a>
          <a href="/blog" className={styles.navLink}>Blog</a>
          <a href="https://github.com" className={styles.navLink}>GitHub</a>
        </div>

        <button className={styles.themeToggle} aria-label="Toggle theme">
          🌙
        </button>
      </div>
    </nav>
  );
}
```

Create `src/theme/Navbar/Navbar.module.css`:

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  height: var(--navbar-height);
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-4);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-600);
}

.navItems {
  display: flex;
  gap: var(--spacing-6);
  align-items: center;
}

.navLink {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.navLink:hover {
  color: var(--color-primary-600);
}

.themeToggle {
  background: none;
  border: 1px solid var(--color-border);
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1.2em;
}
```

### Sidebar Component

Create `src/theme/Sidebar/Sidebar.tsx`:

```typescript
import React, { useState } from 'react';
import styles from './Sidebar.module.css';

interface SidebarItem {
  label: string;
  href?: string;
  items?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  { label: 'Overview', href: '/' },
  {
    label: 'Hooks',
    items: [
      { label: 'useCallback', href: '/hooks/useCallback' },
      { label: 'useContext', href: '/hooks/useContext' },
      { label: 'useEffect', href: '/hooks/useEffect' },
    ]
  },
  { label: 'API Reference', href: '/api' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Hooks']));

  const toggleExpand = (label: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpanded(newExpanded);
  };

  const renderItem = (item: SidebarItem, key: string) => {
    const isExpanded = expanded.has(item.label);

    if (item.items) {
      return (
        <div key={key} className={styles.category}>
          <button
            className={styles.categoryButton}
            onClick={() => toggleExpand(item.label)}
          >
            <span>{item.label}</span>
            <span className={isExpanded ? styles.expandedIcon : styles.icon}>›</span>
          </button>
          {isExpanded && (
            <div className={styles.categoryItems}>
              {item.items.map((subItem, idx) =>
                renderItem(subItem, `${key}-${idx}`)
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <a key={key} href={item.href} className={styles.link}>
        {item.label}
      </a>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        {sidebarItems.map((item, idx) => renderItem(item, `item-${idx}`))}
      </div>
    </aside>
  );
}
```

Create `src/theme/Sidebar/Sidebar.module.css`:

```css
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  max-height: calc(100vh - var(--navbar-height));
}

.sidebarContent {
  padding: var(--spacing-6) var(--spacing-4);
}

.category {
  margin-bottom: var(--spacing-4);
}

.categoryButton {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: none;
  border: none;
  padding: var(--spacing-2) var(--spacing-3);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.categoryButton:hover {
  background-color: var(--color-bg-tertiary);
}

.icon {
  transition: transform var(--transition-normal);
}

.expandedIcon {
  transform: rotate(90deg);
}

.categoryItems {
  padding-left: var(--spacing-4);
  margin-top: var(--spacing-2);
}

.link {
  display: block;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.link:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-primary-600);
}
```

### Table of Contents Component

Create `src/theme/DocPage/TableOfContents.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import styles from './TableOfContents.module.css';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const h2s = Array.from(document.querySelectorAll('h2, h3'));
    const headingsList = h2s
      .filter(el => el.id)
      .map(el => ({
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName[1]),
      }));
    setHeadings(headingsList);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    });

    document.querySelectorAll('h2, h3').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className={styles.toc}>
      <div className={styles.tocContent}>
        <h5 className={styles.tocTitle}>On This Page</h5>
        <nav className={styles.tocNav}>
          {headings.map(heading => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`${styles.tocLink} ${
                activeId === heading.id ? styles.active : ''
              }`}
              style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
```

Create `src/theme/DocPage/TableOfContents.module.css`:

```css
.toc {
  width: var(--toc-width);
  padding: var(--spacing-6);
  overflow-y: auto;
  max-height: calc(100vh - var(--navbar-height));
  border-left: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.tocContent {
  position: sticky;
  top: var(--spacing-4);
}

.tocTitle {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tocNav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.tocLink {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  border-left: 2px solid transparent;
}

.tocLink:hover {
  color: var(--color-primary-600);
  background-color: var(--color-bg-tertiary);
}

.tocLink.active {
  color: var(--color-primary-600);
  border-left-color: var(--color-primary-600);
}
```

### Callout Component

Create `src/theme/MDXComponents/Callout.tsx`:

```typescript
import React from 'react';
import styles from './Callout.module.css';

type CalloutType = 'info' | 'warning' | 'success' | 'error';

interface CalloutProps {
  type: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const icons = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  error: '❌',
};

export default function Callout({ type, title, children }: CalloutProps) {
  return (
    <div className={`${styles.callout} ${styles[type]}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{icons[type]}</span>
        {title && <strong className={styles.title}>{title}</strong>}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
```

Create `src/theme/MDXComponents/Callout.module.css`:

```css
.callout {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border-left: 4px solid;
  margin: var(--spacing-4) 0;
  background-color: var(--color-bg-secondary);
}

.callout.info {
  border-left-color: var(--color-info);
}

.callout.warning {
  border-left-color: var(--color-warning);
}

.callout.success {
  border-left-color: var(--color-success);
}

.callout.error {
  border-left-color: var(--color-error);
}

.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.icon {
  font-size: 1.2em;
}

.title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.content {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}
```

### Layout Component

Create `src/theme/Layout.tsx`:

```typescript
import React from 'react';
import Navbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';
import TableOfContents from './DocPage/TableOfContents';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          {children}
        </main>
        <TableOfContents />
      </div>
    </div>
  );
}
```

Create `src/theme/Layout.module.css`:

```css
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.container {
  display: flex;
  flex: 1;
}

.main {
  flex: 1;
  padding: var(--spacing-8);
  max-width: 850px;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .main {
    padding: var(--spacing-4);
  }
}
```

---

## Customization

### Change Primary Colors

Edit `src/styles/design-tokens.css`:

```css
:root {
  --color-primary-500: #your-primary;
  --color-primary-600: #your-primary-dark;
}
```

### Modify Sidebar Items

Edit `src/theme/Sidebar/Sidebar.tsx`:

```typescript
const sidebarItems: SidebarItem[] = [
  { label: 'Getting Started', href: '/intro' },
  {
    label: 'Components',
    items: [
      { label: 'Button', href: '/components/button' },
      { label: 'Input', href: '/components/input' },
    ]
  },
];
```

---

## Troubleshooting

**Components not rendering?** Ensure exports in MDX component index.

**Dark mode not working?** Check `[data-theme='dark']` CSS selectors.

**Sidebar collapsing unexpectedly?** Verify state management with `useState`.

**TOC not updating?** Ensure headings have `id` attributes.

---

## Next Steps

1. ✅ Create design tokens (CSS variables)
2. ✅ Build core components (Navbar, Sidebar, TOC)
3. ✅ Style with CSS Modules
4. ✅ Add MDX components (Callout, Card, etc.)
5. ✅ Integrate with Docusaurus
6. ✅ Test dark mode
7. ✅ Optimize for mobile

**Result:** A professional, reusable Docusaurus theme ready for production.
