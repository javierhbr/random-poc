# Custom Docusaurus Template: Professional & Modern UI

A comprehensive guide to building a reusable, visually distinctive Docusaurus theme package and starter template with sophisticated, modern aesthetics.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Design System](#design-system)
4. [Setup Instructions](#setup-instructions)
5. [Theme Package Development](#theme-package-development)
6. [Starter Template Creation](#starter-template-creation)
7. [Customization Guide](#customization-guide)
8. [Publishing & Distribution](#publishing--distribution)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers building a hybrid custom Docusaurus theme solution:

- **Theme Package (`@yourorg/docusaurus-theme-sophisticated`)**: A reusable npm package that replaces Docusaurus's classic preset with a custom design system
- **Starter Template (`docusaurus-starter-sophisticated`)**: A pre-configured Docusaurus project using the theme package, ready to clone and customize

**Benefits:**
- ✅ Easy to implement (step-by-step instructions)
- ✅ Highly reusable (share as npm package or starter)
- ✅ Visually distinctive (professional + modern design)
- ✅ TypeScript + CSS Modules (type-safe, maintainable)
- ✅ No external UI libraries (pure CSS + React)

**Timeline:** ~14-20 hours total (can be done incrementally)

---

## Architecture

### High-Level Structure

```
your-org/
├── docusaurus-theme-sophisticated/     (Theme Package A)
│   ├── src/
│   │   ├── theme/
│   │   │   ├── Navbar/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   ├── Layout/
│   │   │   ├── DocPage/
│   │   │   └── MDXComponents/
│   │   ├── styles/
│   │   │   ├── design-tokens.css
│   │   │   ├── global.css
│   │   │   └── utilities.css
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── docusaurus-starter-sophisticated/    (Starter Template B)
    ├── docs/
    ├── src/
    ├── docusaurus.config.ts
    ├── package.json
    └── README.md
```

### Consumer Integration

**Option 1: Use Starter Template (Easiest)**
```bash
git clone <starter-template-repo>
npm install
npm start
# Customize docs/ and design tokens
```

**Option 2: Install Theme Package in Existing Project**
```bash
npm install @yourorg/docusaurus-theme-sophisticated
# Update docusaurus.config.ts to use theme
```

---

## Design System

### Color Palette

Define all colors as CSS variables for easy customization:

```css
/* design-tokens.css */

:root {
  /* Primary Colors */
  --color-primary-50: #f0f4ff;
  --color-primary-100: #e0e9ff;
  --color-primary-500: #2d5fcc;
  --color-primary-600: #2451b8;
  --color-primary-700: #1e2d6b;
  --color-primary-900: #0f1a3d;

  /* Accent Colors */
  --color-accent-500: #c47d0e;
  --color-accent-600: #b0700a;

  /* Semantic Colors */
  --color-success-500: #2a7d4f;
  --color-warning-500: #d97706;
  --color-error-500: #b93030;
  --color-info-500: #0ea5e9;

  /* Neutral */
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

  /* Text & Background */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-bg-primary: #ffffff;
  --color-bg-secondary: var(--color-gray-50);

  /* Dark Mode */
  --color-dark-bg-primary: #1a1a1a;
  --color-dark-bg-secondary: #2d2d2d;
  --color-dark-text-primary: #f5f5f5;
  --color-dark-text-secondary: #b0b0b0;
}

/* Dark Mode */
[data-theme='dark'] {
  --color-text-primary: var(--color-dark-text-primary);
  --color-text-secondary: var(--color-dark-text-secondary);
  --color-bg-primary: var(--color-dark-bg-primary);
  --color-bg-secondary: var(--color-dark-bg-secondary);
}
```

### Typography

```css
/* design-tokens.css */

:root {
  /* Font Families */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;

  /* Font Sizes (16px base, 1.25 scale) */
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.5rem;      /* 24px */
  --font-size-2xl: 1.875rem;   /* 30px */
  --font-size-3xl: 2.25rem;    /* 36px */
  --font-size-4xl: 3rem;       /* 48px */

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Spacing & Layout

```css
/* design-tokens.css */

:root {
  /* Spacing (8px grid) */
  --spacing-0: 0;
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;

  /* Container */
  --container-max-width: 1200px;
  --sidebar-width: 250px;
  --sidebar-width-mobile: 100%;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Border Radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}
```

### Gradients

```css
/* design-tokens.css */

:root {
  /* Gradients */
  --gradient-hero: linear-gradient(135deg, #2d5fcc 0%, #1e2d6b 100%);
  --gradient-accent: linear-gradient(135deg, #c47d0e 0%, #b0700a 100%);
  --gradient-subtle: linear-gradient(180deg, rgba(45, 95, 204, 0.05) 0%, rgba(196, 125, 14, 0.05) 100%);
}
```

---

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm/yarn
- Basic knowledge of React and CSS
- Docusaurus familiarity (reading the docs is sufficient)

### Step 1: Create Theme Package Directory

```bash
# Create a monorepo root (optional, but recommended)
mkdir docusaurus-theme-suite
cd docusaurus-theme-suite

# Create theme package
mkdir docusaurus-theme-sophisticated
cd docusaurus-theme-sophisticated

# Initialize npm package
npm init -y

# Add description to package.json
# "name": "@yourorg/docusaurus-theme-sophisticated",
# "description": "Professional & modern Docusaurus theme"
# "main": "lib/index.js",
```

### Step 2: Install Dependencies

```bash
npm install --save-dev \
  typescript \
  @types/react \
  @types/node \
  react \
  react-dom \
  docusaurus-core \
  @docusaurus/types

npm install \
  clsx
```

### Step 3: Configure TypeScript

Create `tsconfig.json`:

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
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "lib"]
}
```

---

## Theme Package Development

### Directory Structure

```
src/
├── theme/
│   ├── Navbar/
│   │   ├── Navbar.tsx
│   │   ├── Navbar.module.css
│   │   └── NavbarItem.tsx
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── Sidebar.module.css
│   │   └── SidebarItem.tsx
│   ├── Footer/
│   │   ├── Footer.tsx
│   │   └── Footer.module.css
│   ├── Layout/
│   │   ├── Layout.tsx
│   │   └── Layout.module.css
│   ├── DocPage/
│   │   ├── DocPage.tsx
│   │   └── DocPage.module.css
│   ├── MDXComponents/
│   │   ├── Callout.tsx
│   │   ├── Card.tsx
│   │   ├── CodeBlock.tsx
│   │   └── index.tsx
│   └── NotFound/
│       └── NotFound.tsx
├── styles/
│   ├── design-tokens.css
│   ├── global.css
│   ├── utilities.css
│   └── dark-mode.css
└── index.ts
```

### 1. Design Tokens (CSS Variables)

Create `src/styles/design-tokens.css`:

```css
:root {
  /* All colors, typography, spacing defined above */
}

[data-theme='dark'] {
  /* Dark mode overrides */
}
```

### 2. Global Styles

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
}

body {
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  line-height: var(--line-height-normal);
  transition: background-color var(--transition-normal),
              color var(--transition-normal);
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-top: var(--spacing-8);
  margin-bottom: var(--spacing-4);
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

/* Paragraphs */
p {
  margin-bottom: var(--spacing-4);
  line-height: var(--line-height-relaxed);
}

/* Links */
a {
  color: var(--color-primary-500);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-600);
  text-decoration: underline;
}

/* Code */
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
  border-left: 4px solid var(--color-primary-500);
  padding-left: var(--spacing-4);
  margin-left: 0;
  margin-bottom: var(--spacing-4);
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

/* Buttons */
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
```

### 3. Navbar Component

Create `src/theme/Navbar/Navbar.tsx`:

```typescript
import React from 'react';
import { useNavbarSecondaryMenu } from '@docusaurus/theme-common/internal';
import { NavbarSecondaryMenuFiller } from '@docusaurus/theme-common';
import NavbarItem from './NavbarItem';
import styles from './Navbar.module.css';

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  const secondaryMenu = useNavbarSecondaryMenu();

  return (
    <nav className={`${styles.navbar} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.navbarInner}>
          <div className={styles.logo}>
            {/* Logo and title */}
          </div>

          <div className={styles.navbarItems}>
            {/* Nav items will be populated by Docusaurus */}
          </div>
        </div>
      </div>

      {secondaryMenu && <NavbarSecondaryMenuFiller />}
    </nav>
  );
}
```

Create `src/theme/Navbar/Navbar.module.css`:

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
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  color: var(--color-primary-500);
}

.navbarItems {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
}

@media (max-width: 768px) {
  .navbarItems {
    display: none;
  }
}
```

### 4. Layout Component

Create `src/theme/Layout/Layout.tsx`:

```typescript
import React from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
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
      </div>
      <Footer />
    </div>
  );
}
```

Create `src/theme/Layout/Layout.module.css`:

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
  max-width: var(--container-max-width);
  margin: 0 auto;
  width: 100%;
}

.main {
  flex: 1;
  padding: var(--spacing-8);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .main {
    padding: var(--spacing-4);
  }
}
```

### 5. MDX Components (Callout, Card, etc.)

Create `src/theme/MDXComponents/Callout.tsx`:

```typescript
import React from 'react';
import styles from './Callout.module.css';

interface CalloutProps {
  type: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
}

export default function Callout({ type, title, children }: CalloutProps) {
  const colorMap = {
    info: 'var(--color-info-500)',
    warning: 'var(--color-warning-500)',
    success: 'var(--color-success-500)',
    error: 'var(--color-error-500)',
  };

  return (
    <div className={`${styles.callout} ${styles[type]}`}>
      {title && <div className={styles.title}>{title}</div>}
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
  background-color: rgba(0, 0, 0, 0.02);
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

.title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-base);
}

.content {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}
```

Create `src/theme/MDXComponents/Card.tsx`:

```typescript
import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  description?: string;
  href?: string;
  children?: React.ReactNode;
}

export default function Card({ title, description, href, children }: CardProps) {
  const content = (
    <>
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

Create `src/theme/MDXComponents/Card.module.css`:

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
}

[data-theme='dark'] .card {
  border-color: var(--color-gray-700);
}

.card:hover {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2);
  color: var(--color-primary-500);
}

.description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-3);
}

.children {
  font-size: var(--font-size-sm);
}
```

### 6. Theme Index

Create `src/index.ts`:

```typescript
import type { ThemeConfig, Config } from '@docusaurus/types';

export default function themePlugin(context: any, options: any) {
  return {
    name: '@yourorg/docusaurus-theme-sophisticated',

    getThemePath() {
      return require.resolve('./theme');
    },

    getTypeScriptThemePath() {
      return require.resolve('./theme');
    },

    configureWebpack() {
      return {
        module: {
          rules: [
            {
              test: /\.module\.css$/,
              use: [
                'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    modules: true,
                  },
                },
              ],
            },
          ],
        },
      };
    },
  };
}
```

---

## Starter Template Creation

### Step 1: Create Starter Project

```bash
cd ..
mkdir docusaurus-starter-sophisticated
cd docusaurus-starter-sophisticated

npm init -y
```

### Step 2: Add Dependencies

```bash
npm install \
  docusaurus \
  @docusaurus/core \
  @docusaurus/preset-classic \
  react \
  react-dom \
  @yourorg/docusaurus-theme-sophisticated

npm install --save-dev \
  typescript \
  @types/react \
  @types/node
```

### Step 3: Configure Docusaurus

Create `docusaurus.config.ts`:

```typescript
import type { Config } from '@docusaurus/types';

const config: Config = {
  title: 'Your Documentation',
  tagline: 'Built with sophisticated theme',
  favicon: 'img/favicon.ico',

  url: 'https://yourdomain.com',
  baseUrl: '/',

  organizationName: 'yourorg',
  projectName: 'your-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@yourorg/docusaurus-theme-sophisticated',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/yourorg/your-docs/edit/main/',
          showLastUpdateTime: true,
          breadcrumbs: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: 'Your Docs',
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/yourorg/your-docs',
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
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Your Organization.`,
    },
  },
};

export default config;
```

### Step 4: Add Documentation

Create `docs/intro.md`:

```markdown
# Welcome

This is your documentation site built with a sophisticated, modern Docusaurus theme.

## Features

- **Professional Design** — Refined typography and color palette
- **Modern Aesthetic** — Gradients, animations, and contemporary layouts
- **Type-Safe** — Built with TypeScript
- **Customizable** — Easy to override colors, fonts, and spacing

## Quick Start

1. Clone this repository
2. Edit `docusaurus.config.ts` with your project details
3. Add your documentation to the `docs/` folder
4. Customize design tokens in `src/css/custom.css`
5. Run `npm start` to preview

## Customization

See the [Customization Guide](#customization-guide) below for detailed instructions.
```

Create `src/css/custom.css`:

```css
/* Override design tokens here */

:root {
  /* Example: Change primary color */
  --color-primary-500: #2d5fcc;
  --color-primary-600: #2451b8;

  /* Example: Change accent color */
  --color-accent-500: #c47d0e;
}
```

### Step 5: Create sidebar configuration

Create `sidebars.ts`:

```typescript
import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: ['getting-started/installation'],
    },
    {
      type: 'category',
      label: 'Guides',
      items: ['guides/customization'],
    },
  ],
};

export default sidebars;
```

---

## Customization Guide

### Override Design Tokens

Edit `src/css/custom.css` in your starter template:

```css
:root {
  /* Colors */
  --color-primary-500: #your-color;
  --color-accent-500: #your-accent;

  /* Typography */
  --font-sans: 'Your Font', sans-serif;

  /* Spacing */
  --spacing-4: 1rem;

  /* Other tokens... */
}
```

### Customize Navbar

Edit `docusaurus.config.ts` to add/modify navbar items:

```typescript
navbar: {
  title: 'Your Title',
  items: [
    { to: '/docs', label: 'Documentation' },
    { href: 'https://example.com', label: 'External Link' },
  ],
},
```

### Add Custom Components

Use MDX components in your documentation:

```markdown
import Callout from '@yourorg/docusaurus-theme-sophisticated/Callout';
import Card from '@yourorg/docusaurus-theme-sophisticated/Card';

<Callout type="info" title="Tip">
  This is an informational callout.
</Callout>

<Card title="Learn More" href="/docs">
  Click to read more about this topic.
</Card>
```

### Dark Mode

Dark mode is automatically handled via CSS variables. No additional configuration needed.

---

## Publishing & Distribution

### Publish Theme Package to npm

1. **Update package.json:**

```json
{
  "name": "@yourorg/docusaurus-theme-sophisticated",
  "version": "1.0.0",
  "description": "Professional & modern Docusaurus theme",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "files": ["lib", "src"],
  "scripts": {
    "build": "tsc",
    "prepublish": "npm run build"
  }
}
```

2. **Build:**

```bash
npm run build
```

3. **Publish:**

```bash
npm publish
```

### Share Starter Template

1. Push to GitHub
2. Add `README.md` with setup instructions
3. Share link in your documentation

---

## Troubleshooting

### CSS Modules not loading

Ensure your Webpack configuration in `src/index.ts` includes CSS module handling.

### Dark mode not working

Check that `[data-theme='dark']` selectors are present in your CSS files.

### TypeScript errors

Run `npm run build` to check for compilation errors. Update `tsconfig.json` if needed.

### Components not rendering

Verify that components are exported from `src/theme/MDXComponents/index.tsx` and registered in the theme.

---

## Next Steps

1. ✅ Set up theme package structure
2. ✅ Create core components (Navbar, Layout, Footer)
3. ✅ Define design tokens and global styles
4. ✅ Build MDX components (Callout, Card, etc.)
5. ✅ Create starter template
6. ✅ Publish to npm (optional)
7. ✅ Share with community

Congratulations! You now have a reusable, professional Docusaurus theme.
