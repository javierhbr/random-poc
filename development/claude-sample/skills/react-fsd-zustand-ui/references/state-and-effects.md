# State and Effects Reference

## First question: do you need state at all?
Before adding state:
- can it be computed during render?
- can it be derived from props or other state?
- can it stay local in the component?

If yes, avoid more state.

---

## When `useEffect` is correct
Use `useEffect` for synchronization with external systems:
- browser APIs
- subscriptions
- analytics on screen appearance
- imperative third-party widgets
- fetching when your framework does not provide a better mechanism

## When `useEffect` is wrong
Do not use it for:
- deriving values from props or state
- reacting to button clicks or form submits
- resetting state on prop change when keying solves it
- expensive calculations that belong in `useMemo`

### Prefer these alternatives

#### Derived values
```ts
const fullName = `${firstName} ${lastName}`
```

#### Expensive derived values
```ts
const filtered = useMemo(() => expensiveFilter(items, query), [items, query])
```

#### Event-driven logic
```ts
const onSubmit = async () => {
  await save(form)
  onDone()
}
```

#### Resetting subtree state
```tsx
<UserEditor key={userId} userId={userId} />
```

---

## Zustand guidance

### Use Zustand when
- multiple components need the same client state
- state outlives a single component
- you want minimal global state without provider boilerplate

### Do not use Zustand when
- state is purely local and short-lived
- state is only for one component and easy with `useState`

---

## Store design rules
- keep stores small
- model actions explicitly
- select only what each component needs
- avoid grabbing the entire store
- separate domain state from transient form state unless shared usage requires otherwise

### Good
```ts
const count = useCounterStore((s) => s.count)
const increment = useCounterStore((s) => s.increment)
```

### Bad
```ts
const store = useCounterStore()
```

### Multiple selections
Use shallow selection when needed:
```ts
const { count, loading } = useCounterStore(
  useShallow((s) => ({ count: s.count, loading: s.loading }))
)
```

---

## Suggested store shape
```ts
type UserState = {
  users: User[]
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  addUser: (input: NewUser) => Promise<void>
}
```

---

## Example: page + store + no fake effect

### Store
```ts
import { create } from 'zustand'

type ProductFiltersState = {
  query: string
  setQuery: (query: string) => void
}

export const useProductFiltersStore = create<ProductFiltersState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
}))
```

### Component
```tsx
export function ProductSearch() {
  const query = useProductFiltersStore((s) => s.query)
  const setQuery = useProductFiltersStore((s) => s.setQuery)

  const filteredProducts = useMemo(
    () => filterProducts(products, query),
    [products, query]
  )

  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <ProductList items={filteredProducts} />
    </>
  )
}
```

No `useEffect` needed because the list is derived during render.
