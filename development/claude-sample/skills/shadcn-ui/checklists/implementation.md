# shadcn/ui Implementation Checklist

Use this checklist when implementing shadcn/ui components.

## 📋 Setup (One-Time)

- [ ] shadcn/ui initialized: `npx shadcn-ui@latest init`
- [ ] Theme configured in `src/app/globals.css` or `src/index.css`
- [ ] `cn` utility exists at `src/lib/utils.ts`
- [ ] Theme provider configured (if using dark mode)
- [ ] Required dependencies installed:
  - [ ] `class-variance-authority`
  - [ ] `clsx`
  - [ ] `tailwind-merge`
  - [ ] `@radix-ui/react-*` (as needed)

## 🔧 Adding Components

- [ ] Use CLI to add components (NEVER manual copy)
  ```bash
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add dialog
  npx shadcn-ui@latest add form
  ```
- [ ] Component files added to `src/components/ui/`
- [ ] Check for duplicate imports in `package.json`

## 💻 Component Development

### TypeScript

- [ ] Interface extends appropriate HTML element props
- [ ] `React.forwardRef` used when component needs ref
- [ ] `displayName` set for debugging
- [ ] Proper type exports: `export type { ComponentProps }`

### Variants (cva)

- [ ] Variants defined with `class-variance-authority`
- [ ] Base classes defined
- [ ] Default variants specified
- [ ] Exported: `export { componentVariants }`

### Styling

- [ ] Uses `cn` utility for className merging
- [ ] No hardcoded colors (use CSS variables)
- [ ] Mobile-first responsive design
- [ ] Dark mode classes included

### Composition

- [ ] Uses Radix UI primitives correctly
- [ ] `asChild` prop supported where needed
- [ ] Compound components follow shadcn patterns
- [ ] Proper component hierarchy

## ♿ Accessibility

### Keyboard

- [ ] Tab navigation works correctly
- [ ] Enter/Space activate interactive elements
- [ ] Escape closes dialogs/dropdowns
- [ ] Arrow keys navigate menus/lists

### ARIA

- [ ] Proper roles assigned
- [ ] `aria-label` or `aria-labelledby` for complex elements
- [ ] `aria-describedby` for additional context
- [ ] `aria-expanded` for collapsible elements
- [ ] `aria-hidden` for decorative elements

### Screen Readers

- [ ] `sr-only` class for icon-only buttons
- [ ] Meaningful text alternatives
- [ ] Proper heading hierarchy
- [ ] Focus indicators visible

### Testing

- [ ] Test with keyboard only
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Check color contrast (WCAG AA minimum)
- [ ] Verify focus order is logical

## 🎨 Theming

- [ ] CSS variables used (not hardcoded colors)
  - [ ] `bg-background` instead of `bg-white`
  - [ ] `text-foreground` instead of `text-black`
  - [ ] `bg-primary` for primary actions
- [ ] Light mode styled
- [ ] Dark mode styled (`.dark` classes)
- [ ] Custom theme colors added to globals.css if needed
- [ ] No inline styles

## 📝 Forms (if applicable)

- [ ] Zod schema defined
- [ ] react-hook-form configured with zodResolver
- [ ] Form components used:
  - [ ] `<Form>`
  - [ ] `<FormField>`
  - [ ] `<FormItem>`
  - [ ] `<FormLabel>`
  - [ ] `<FormControl>`
  - [ ] `<FormMessage>`
- [ ] Default values set
- [ ] Loading state during submission
- [ ] Error handling with toast
- [ ] Form reset after successful submission

## ⚡ Performance

- [ ] Heavy components lazy loaded with `React.lazy()`
- [ ] Suspense boundaries with fallback
- [ ] `React.memo` for expensive components
- [ ] Controlled state only when necessary
- [ ] No unnecessary re-renders (check with React DevTools)

## 📱 Responsive Design

- [ ] Mobile-first classes (`base → sm: → md: → lg:`)
- [ ] Touch targets minimum 44x44px
- [ ] Text readable on small screens
- [ ] Dialogs/modals work on mobile
- [ ] Tables responsive or scrollable

## 🧪 Testing

- [ ] Component renders without errors
- [ ] Props work as expected
- [ ] Variants render correctly
- [ ] Keyboard navigation works
- [ ] Accessible with screen reader
- [ ] Works in both light and dark modes
- [ ] Responsive on mobile devices

## 📚 Documentation

- [ ] JSDoc comments for component props
- [ ] Usage examples in comments
- [ ] Complex logic explained
- [ ] Props interface documented

## ✅ Pre-Commit

- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Linter passes
- [ ] Component follows shadcn patterns
- [ ] Accessibility verified
- [ ] Dark mode tested
- [ ] Mobile responsive

## 🚀 Common Combinations

### Modal with Form

- [ ] Dialog component added
- [ ] Form component added
- [ ] Button for trigger
- [ ] Controlled open state
- [ ] Reset form on close
- [ ] Loading state during submit

### Data Table with Actions

- [ ] Table component added
- [ ] Dropdown menu for actions
- [ ] Button for each row action
- [ ] Responsive columns (hidden on mobile)
- [ ] Empty state handled

### Theme Toggle

- [ ] Theme provider configured
- [ ] `useTheme` hook used
- [ ] Icon changes with theme
- [ ] Stored in localStorage
- [ ] System preference respected
