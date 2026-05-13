# UI Patterns Reference

## Core UI rules
- never hide usable data behind a loading spinner
- always show errors to the user
- every collection needs an empty state
- disable actions while a request is in flight
- provide visible feedback for mutations

---

## Rendering order for async data

Preferred order:
1. error
2. initial loading when no data exists
3. empty state
4. data view

```tsx
if (error) return <ErrorState error={error} onRetry={refetch} />
if (loading && !data) return <LoadingState />
if (!data?.items.length) return <EmptyState />
return <ItemList items={data.items} />
```

Wrong:
```tsx
if (loading) return <LoadingState />
```

That causes stale-data flashing on refetch.

---

## Skeleton vs spinner

Use skeletons when:
- content shape is known
- rendering cards, tables, lists, profile panels

Use spinners when:
- content shape is unknown
- action is small and local
- button or modal action is pending

---

## Error hierarchy
Choose the smallest correct error surface:
1. field-level inline error
2. toast for recoverable action failure
3. banner for page-level partial failure
4. full-screen error for unrecoverable failure

---

## Action buttons
```tsx
<Button
  onClick={handleSubmit}
  isLoading={isSubmitting}
  disabled={!isValid || isSubmitting}
>
  Submit
</Button>
```

Never leave a trigger active while the request is pending.

---

## Empty states
Every list needs one.

### Search empty state
```tsx
<EmptyState
  icon="search"
  title="No results found"
  description="Try different search terms"
/>
```

### First-use empty state
```tsx
<EmptyState
  icon="plus-circle"
  title="No items yet"
  description="Create your first item"
  action={{ label: 'Create item', onClick: handleCreate }}
/>
```

---

## Mutation pattern
```tsx
const [saveItem, { loading }] = useSaveItemMutation({
  onCompleted: () => {
    toast.success({ title: 'Saved successfully' })
  },
  onError: (error) => {
    console.error('save failed', error)
    toast.error({ title: 'Save failed' })
  },
})
```

Never swallow errors silently.

---

## UI checklist

Before finishing a component, verify:
- error state exists
- empty state exists
- loading is shown only when needed
- buttons are disabled during async work
- user receives feedback after mutations
- optimistic updates are used only when rollback is possible
