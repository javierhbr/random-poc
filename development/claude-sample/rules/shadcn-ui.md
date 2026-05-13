---
paths:
  - "src/components/**"
---

# shadcn/ui Component Rules

## Core Philosophy

- **Copy, don't install** — Components live in `src/components/ui/` (you own the code)
- **Composition first** — Build complex UIs from simple Radix primitives
- **Accessible by default** — WCAG 2.1 compliant via Radix
- **TypeScript-first** — Full type safety throughout
- **No hardcoded colors** — Always use CSS variables for dark mode support

## 4-Step Component Pattern

```typescript
// 1. Imports — React, Radix primitives, CVA, cn()
import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 2. Variants — CVA for multi-variant components
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: { default: 'bg-primary text-primary-foreground', outline: 'border border-input' },
      size: { default: 'h-10 px-4 py-2', sm: 'h-9 px-3', lg: 'h-11 px-8' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

// 3. Interface — extend HTML attributes + VariantProps
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// 4. Implementation — React.forwardRef with display name
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
Button.displayName = 'Button'

// 5. Export component + variants
export { Button, buttonVariants }
```

## Theming Rules

- ✅ Use CSS variables: `bg-background`, `text-foreground`, `border-input`, `bg-primary`, etc.
- ❌ No hardcoded Tailwind color classes like `bg-gray-100` or `text-black`
- ✅ Dark mode works automatically when using CSS variables

## Accessibility Requirements

- ✅ Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- ✅ ARIA labels on icon-only buttons
- ✅ Focus visible ring via `focus-visible:ring-2`
- ✅ Use Radix Dialog/Popover/Select for complex interactive components

## Forms (react-hook-form + zod)

Never hand-roll form validation. Always:

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = z.object({ email: z.string().email() });

function MyForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>Save</Button>
      </form>
    </Form>
  );
}
```

## Loading States

```typescript
// Inline button loader
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>

// Content placeholder
{isLoading ? <Skeleton className="h-4 w-full" /> : <Content />}
```

## Error Handling

```typescript
// Transient errors → toast
toast({ variant: 'destructive', title: 'Error', description: error.message });

// Persistent errors → Alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>{error.message}</AlertDescription>
</Alert>
```

❌ Never surface errors only via `console.error` — always show UI feedback.

## Responsive Design

- Mobile-first: `flex-col md:flex-row`, `w-full md:w-1/3`
- Dialogs: `sm:max-w-[425px] max-w-[95vw]`
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

## Performance

```typescript
// Memoize list-item components
const TaskItem = React.memo(({ task }: { task: Task }) => <div>{task.title}</div>);
TaskItem.displayName = 'TaskItem';

// Lazy-load heavy panels
const HeavyChart = React.lazy(() => import('@/components/heavy-chart'));
<React.Suspense fallback={<Skeleton className="h-[400px]" />}>
  <HeavyChart />
</React.Suspense>

// Controlled Dialog only when programmatic close is needed
const [open, setOpen] = React.useState(false);
<Dialog open={open} onOpenChange={setOpen}>...</Dialog>
```

## Done When

- [ ] Component accepts `className` prop (override slot)
- [ ] TypeScript types properly defined
- [ ] Dark mode works (CSS variables only)
- [ ] Variants defined with CVA
- [ ] Keyboard accessible
- [ ] Forms: zod schema + `zodResolver` + shadcn `Form`/`FormField` components
- [ ] Loading states shown (button spinner OR Skeleton)
- [ ] Errors surfaced via `toast` or `Alert` (not console only)
- [ ] Responsive mobile-first classes applied
