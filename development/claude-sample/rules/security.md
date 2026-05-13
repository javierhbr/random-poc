---
paths:
  - "src/**"
---

# Frontend Security Rules

## Input Validation

- ✅ Validate all user input and API responses with **Zod**
- ✅ Validate URL params before using in logic or rendering (UUID format, numeric, etc.)
- ❌ Never trust `any` or blindly use API responses without schema validation

```typescript
// ✅
const UserSchema = z.object({ name: z.string() });
const safeData = UserSchema.parse(apiResponse);
```

## XSS Prevention

- ❌ NEVER use `dangerouslySetInnerHTML` without DOMPurify sanitization
- ✅ Always `import DOMPurify from 'dompurify'` when rendering user-generated HTML
- ❌ NEVER use `eval()` — use `JSON.parse()` for JSON

```typescript
// ✅
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

## External Links

- ✅ Always `rel="noopener noreferrer"` on `target="_blank"` links (prevents `window.opener` access)

```tsx
// ✅
<a href={url} target="_blank" rel="noopener noreferrer">Link</a>
```

## Authentication & Tokens

- ❌ NEVER store tokens in `localStorage` or `sessionStorage`
- ✅ Use httpOnly cookies (backend sets with `Secure` + `SameSite` flags)
- ✅ Clean up auth state on logout
- ❌ Never expose tokens in console logs or Redux DevTools

## Sensitive Data

- ❌ NEVER hardcode API keys, secrets, or credentials in client code
- ✅ Use environment variables (`VITE_` prefix for Vite)
- ❌ Never `console.log` sensitive data in production

```typescript
// ✅
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

## Network

- ✅ All API calls must use **HTTPS** — reject HTTP endpoints in production
- ✅ Validate redirect URLs against a whitelist before navigation
- ❌ Never `window.location.href = userProvidedUrl` directly

```typescript
// ✅
const allowed = ['/dashboard', '/profile'];
if (allowed.includes(destination)) navigate(destination);
```

## Quick Security Checklist

- [ ] All inputs validated with Zod
- [ ] No `dangerouslySetInnerHTML` without DOMPurify
- [ ] Tokens NOT in localStorage
- [ ] No hardcoded secrets or API keys
- [ ] No `console.log` of sensitive data in production
- [ ] All API calls use HTTPS
- [ ] External links have `rel="noopener noreferrer"`
- [ ] No `eval()` usage
