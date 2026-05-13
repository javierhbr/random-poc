---
name: shadcn-ui
description: Expert shadcn/ui component implementation with React, TypeScript, Tailwind CSS, and Radix UI primitives. Auto-activates when working with UI components.
---

# shadcn/ui Implementation Skill

Expert guidance for building accessible, well-structured shadcn/ui components with React, TypeScript, Tailwind CSS, and Radix UI primitives.

## 🎯 Core Principles

### What is shadcn/ui?

shadcn/ui is NOT a component library - it's a collection of **re-usable components** that you can copy into your apps. Components are:

- Built on Radix UI primitives
- Styled with Tailwind CSS
- Fully customizable (you own the code)
- Accessible by default
- TypeScript-first

### Key Philosophy

- **Copy, don't install**: Components live in your `components/ui` directory
- **Customize freely**: Modify components to fit your needs
- **Composition over configuration**: Build complex UIs from simple primitives
- **Accessibility first**: WCAG 2.1 compliant out of the box

---

## 🏗️ Code Style and Structure

### TypeScript Best Practices

```typescript
// ✅ CORRECT - Proper component interface
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
```

### Component Structure

```typescript
// 1. Imports
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// 2. Variants (using cva)
const componentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: { ... },
      size: { ... },
    },
    defaultVariants: { ... },
  }
);

// 3. Interface
interface ComponentProps extends VariantProps<typeof componentVariants> {
  // Props
}

// 4. Component implementation
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  (props, ref) => {
    // Implementation
  }
);
Component.displayName = 'Component';

// 5. Export
export { Component, componentVariants };
```

### Naming Conventions

- **Components**: PascalCase (`Button`, `DialogTrigger`)
- **Props**: camelCase with auxiliary verbs (`isLoading`, `hasError`, `canSubmit`)
- **Variants**: lowercase strings (`'default'`, `'destructive'`, `'outline'`)
- **Files**: kebab-case (`button.tsx`, `dialog-trigger.tsx`)

---

## 🎨 shadcn/ui Implementation Patterns

### Adding Components with CLI

```bash
# ✅ CORRECT - Use CLI to add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form

# Components are added to src/components/ui/
```

**NEVER manually copy component code - always use the CLI!**

### The `cn` Utility

```typescript
// Located at src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ CORRECT Usage
<Button className={cn('bg-blue-500', isActive && 'bg-green-500')} />

// Merges Tailwind classes correctly, removing conflicts
```

### Customizing Components

```typescript
// ✅ CORRECT - Extend in components/ui directory
// src/components/ui/button.tsx

// Add new variant
const buttonVariants = cva(
  // ... base classes
  {
    variants: {
      variant: {
        default: '...',
        destructive: '...',
        // ✅ Add custom variant
        success: 'bg-green-600 text-white hover:bg-green-700',
      },
    },
  }
);

// Use new variant
<Button variant="success">Save</Button>
```

### Component Composition

```typescript
// ✅ CORRECT - Compound component pattern
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description text</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {/* Dialog content */}
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## ♿ Accessibility Patterns

### Focus Management

```typescript
// ✅ CORRECT - Proper focus management
const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn('fixed ... focus:outline-none', className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute ... focus:ring-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
```

### ARIA Attributes

```typescript
// ✅ CORRECT - Proper ARIA
<Button
  aria-label="Add task"
  aria-describedby="task-description"
  aria-pressed={isActive}
>
  <Plus className="h-4 w-4" />
  <span className="sr-only">Add new task</span>
</Button>
```

### Keyboard Navigation

```typescript
// ✅ CORRECT - Keyboard support
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
  if (e.key === 'Escape') {
    handleClose();
  }
};

<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleAction}
>
  Custom Interactive Element
</div>
```

---

## 🎨 Theming and Styling

### CSS Variables

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ... more variables */
  }
}
```

### Using Theme Colors

```typescript
// ✅ CORRECT - Use theme variables
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">Primary</Button>
  <Button variant="destructive">Destructive</Button>
</div>

// ❌ WRONG - Hardcoded colors
<div className="bg-white text-black">
  <Button className="bg-blue-600 text-white">Primary</Button>
</div>
```

### Dark Mode

```typescript
// ✅ CORRECT - Theme provider
// App.tsx or layout.tsx
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <YourApp />
    </ThemeProvider>
  );
}

// Toggle dark mode
import { useTheme } from '@/components/theme-provider';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
```

---

## 📝 Form Patterns with react-hook-form + zod

### Complete Form Example

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

// 1. Define schema
const formSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

// 2. Component
function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>Your public display name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## ⚡ Performance Patterns

### Memoization

```typescript
// ✅ CORRECT - Memo for expensive renders
const TaskList = React.memo(({ tasks }: { tasks: Task[] }) => {
  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
});
TaskList.displayName = 'TaskList';
```

### Lazy Loading

```typescript
// ✅ CORRECT - Lazy load heavy components
const HeavyChart = React.lazy(() => import('@/components/heavy-chart'));

function Dashboard() {
  return (
    <React.Suspense fallback={<Skeleton className="h-[400px]" />}>
      <HeavyChart />
    </React.Suspense>
  );
}
```

### Controlled vs Uncontrolled

```typescript
// ✅ CORRECT - Uncontrolled for simple forms
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>...</DialogContent>
</Dialog>

// ✅ CORRECT - Controlled for complex state
const [open, setOpen] = React.useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>...</DialogContent>
</Dialog>

// Close programmatically
const handleSubmit = async () => {
  await saveData();
  setOpen(false); // Close after save
};
```

---

## 🔧 Common Patterns

### Loading States

```typescript
// ✅ CORRECT - Loading button
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>

// ✅ CORRECT - Loading skeleton
{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
) : (
  <Content />
)}
```

### Error Handling

```typescript
// ✅ CORRECT - Toast for errors
import { toast } from '@/components/ui/use-toast';

try {
  await saveData();
  toast({
    title: 'Success',
    description: 'Data saved successfully',
  });
} catch (error) {
  toast({
    variant: 'destructive',
    title: 'Error',
    description: error.message,
  });
}

// ✅ CORRECT - Alert for persistent errors
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>{error.message}</AlertDescription>
</Alert>
```

### Responsive Design

```typescript
// ✅ CORRECT - Mobile-first responsive
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Content</div>
</div>

// ✅ CORRECT - Responsive dialog
<Dialog>
  <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

## ✅ Implementation Checklist

### Before Starting

- [ ] shadcn/ui initialized in project (`npx shadcn-ui@latest init`)
- [ ] Theme configured in `globals.css`
- [ ] `cn` utility exists at `src/lib/utils.ts`
- [ ] Components added via CLI (not manually copied)

### Component Development

- [ ] TypeScript interfaces defined with proper extends
- [ ] Component uses `React.forwardRef` when needed
- [ ] `displayName` set for debugging
- [ ] Variants defined with `cva` from class-variance-authority
- [ ] Uses `cn` utility for className merging
- [ ] Proper default props

### Accessibility

- [ ] Keyboard navigation supported
- [ ] Focus management implemented
- [ ] ARIA attributes added where needed
- [ ] Screen reader text with `sr-only` for icons
- [ ] Color contrast meets WCAG 2.1 AA

### Styling

- [ ] Uses CSS variables from theme
- [ ] Mobile-first responsive classes
- [ ] Dark mode support
- [ ] No hardcoded colors (use theme variables)

### Forms (if applicable)

- [ ] Schema defined with zod
- [ ] react-hook-form with zodResolver
- [ ] Form components from shadcn/ui
- [ ] Loading states during submission
- [ ] Error handling with toast

### Performance

- [ ] Expensive components memoized
- [ ] Heavy components lazy loaded
- [ ] Controlled state only when necessary
- [ ] No unnecessary re-renders

---

## 📚 Quick Reference

### Essential Commands

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton

# Add all components
npx shadcn-ui@latest add
```

### Common Component Combinations

**Modal with Form:**

```typescript
<Dialog>
  <DialogTrigger asChild>
    <Button>Add Item</Button>
  </DialogTrigger>
  <DialogContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

**Table with Actions:**

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 🎯 Key Takeaways

### Always Do:

- ✅ Use CLI to add components
- ✅ Customize in `components/ui` directory
- ✅ Use `cn` utility for className merging
- ✅ Follow compound component patterns
- ✅ Implement proper accessibility
- ✅ Use theme variables (not hardcoded colors)
- ✅ Support both light and dark modes
- ✅ Add TypeScript interfaces
- ✅ Use react-hook-form + zod for forms

### Never Do:

- ❌ Manually copy component code (use CLI)
- ❌ Modify components outside `components/ui`
- ❌ Hardcode colors (use theme variables)
- ❌ Skip accessibility features
- ❌ Forget `displayName` on forwardRef components
- ❌ Use inline styles
- ❌ Skip dark mode support

---

**Version:** 1.0
**Source:** .claude/shadcn-ui-rule.md
**Last Updated:** 2026-01-12

**Related Documentation:**

- [Component Examples](./examples/) - Copy-paste ready implementations
- [Implementation Checklist](./checklists/implementation.md) - Pre-commit validation
- [Official Docs](https://ui.shadcn.com/) - Complete component reference
