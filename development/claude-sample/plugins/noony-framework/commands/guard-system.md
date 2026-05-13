---
name: noony-guard-system
description: Use when implementing authorization, restricting endpoints by permissions, setting up role-based access control (RBAC), checking user permissions, configuring RouteGuards, using GuardSetup presets, implementing ownership-based or team-based access, or adding wildcard/complex permission expressions in Noony handlers.
---

# skill:noony-guard-system

## Does exactly this

RouteGuards for authorization: three protection methods (simple, wildcard, complex), GuardSetup presets for environment configuration, permission ordering rules, and RBAC patterns including ownership checks.

## When to use

- "Restrict endpoint to specific permissions"
- "Role-based access control (RBAC)"
- "Ownership-based or team-based access"
- "GuardSetup production vs development"
- "Simple vs wildcard vs complex permission checks"
- "Permission guards after authentication"

## Do not use this skill when

- For authentication SETUP (token verification) → see AuthenticationMiddleware docs
- For error handling in guards (403 responses) → use `noony-error-handling`
- For middleware ordering of guards in the pipeline → use `noony-middleware-ordering`
- For DI in guard middleware → use `noony-dependency-injection`
- For testing guard authorization → use `noony-testing-handlers`

## Prerequisites

Guards require:
- **AuthenticationMiddleware** must run first (sets `context.user`)
- **Path parameters extracted** (`noony-path-parameters`) before guards that check resource ownership
- **Correct middleware ordering** per `noony-middleware-ordering`'s canonical order

## Steps

1. Configure guards once at startup with `GuardSetup.production()` or `GuardSetup.development()`

2. Place guards AFTER `AuthenticationMiddleware` per `noony-middleware-ordering`'s canonical order — user must exist before checking permissions

3. Ensure path parameters are extracted (`noony-path-parameters`) before guards that check resource ownership

4. Use `RouteGuards.requirePermissions()` for simple permission checks (most common)

5. Use `RouteGuards.requireWildcardPermissions()` for hierarchical patterns like `admin:*`

6. Use inline `before()` middleware for complex ownership/team-based checks that need DB lookups

7. Test guard authorization with mock users and permission arrays → see `noony-testing-handlers`

## Rules

- `AuthenticationMiddleware` MUST run before guards — guards need `context.user` populated
- Guards check `context.user.permissions` array for required permissions
- `GuardSetup` configured ONCE at startup — never per-request
- Middleware ordering: ErrorHandler → Auth → Guards → business logic
- Use simple permissions for most cases — wildcards add matching overhead
- Permission naming convention: `resource:action` (e.g., `posts:create`, `admin:*`)
- 403 Forbidden returned when authenticated but lacking permissions

## Anti-patterns

- ❌ Guards before `AuthenticationMiddleware` — `context.user` not populated yet, always fails
- ❌ `GuardSetup.production()` inside request handler — initialization latency per request
- ❌ Complex wildcard expressions when simple permissions suffice — unnecessary overhead
- ❌ Hardcoding role checks in handler body instead of using guards — scatters authorization logic
- ❌ Same permissions for all endpoints — no granularity, defeats purpose of RBAC
- ❌ Inconsistent permission naming (`admin-read` vs `admin:read`) — wildcards won't match dashes
- ❌ Ownership guards without path parameter extraction — `context.req.params` is empty

## Done when

- You know the difference between authentication (who) and authorization (what)
- Guards placed after `AuthenticationMiddleware` in the pipeline
- Path parameters available before ownership guards
- Simple permission checks working with `requirePermissions()`
- You understand the three protection methods and when to use each

---

## Reference: GuardSetup Presets

```typescript
import { GuardSetup } from '@noony-serverless/core';

// Production - Strict access control
GuardSetup.production([
  { resource: 'posts', permissions: ['posts:list', 'posts:read', 'posts:create'] },
  { resource: 'users', permissions: ['users:read'] },
  { resource: 'admin', permissions: ['admin:*'] }
]);

// Development - Permissive (skip guards or log only)
GuardSetup.development();

// Environment-based setup:
if (process.env.NODE_ENV === 'production') {
  GuardSetup.production([ ... ]);
} else {
  GuardSetup.development();
}
```

## Reference: requirePermissions() — Simple Checks

```typescript
import { RouteGuards } from '@noony-serverless/core';

// Single permission check
const createPostHandler = new Handler<CreatePostRequest, AuthUser>()
  .use(new ErrorHandlerMiddleware())
  .use(new AuthenticationMiddleware(tokenVerifier))
  .use(RouteGuards.requirePermissions('posts:create'))
  .handle(async (context) => {
    const post = await postService.create(context.req.validatedBody!);
    return { postId: post.id };
  });

// Multiple permissions (user must have ALL)
const deletePostHandler = new Handler<any, AuthUser>()
  .use(new ErrorHandlerMiddleware())
  .use(new AuthenticationMiddleware(tokenVerifier))
  .use(RouteGuards.requirePermissions(['posts:delete', 'audit:log']))
  .handle(async (context) => {
    await postService.delete(context.req.params.postId);
    return { success: true };
  });
```

## Reference: requireWildcardPermissions() — Pattern Matching

```typescript
const reportHandler = new Handler<any, AuthUser>()
  .use(new ErrorHandlerMiddleware())
  .use(new AuthenticationMiddleware(tokenVerifier))
  .use(RouteGuards.requireWildcardPermissions('reports:*'))
  .handle(async (context) => {
    // User needs any 'reports:*' permission
    // Valid: reports:read, reports:write, reports:export
    const report = await reportService.generate();
    return { reportId: report.id };
  });
```

**Wildcard Matching Rules:**
- `admin:*` matches `admin:read`, `admin:write`
- Does NOT match `admin-read` or `admin_read` — use `:` separator always
- `resource:*:read` matches `resource:users:read`, `resource:posts:read`

## Reference: Complex Authorization — Ownership & Teams

```typescript
// Ownership-Based Access
const updatePostHandler = new Handler<UpdatePostRequest, AuthUser>()
  .use(new ErrorHandlerMiddleware())
  .use(new AuthenticationMiddleware(tokenVerifier))
  .use({
    before: async (context) => {
      const user = context.user!;
      const postId = context.req.params.postId;

      const post = await postService.getById(postId);
      if (!post) throw new NotFoundError('Post not found');

      // Owner can edit their own posts
      if (post.authorId === user.id) return;

      // Admins can edit any post
      if (user.permissions.includes('posts:admin')) return;

      throw new ForbiddenError('You cannot edit this post');
    }
  })
  .handle(async (context) => {
    const post = await postService.update(
      context.req.params.postId,
      context.req.validatedBody!
    );
    return { post };
  });
```

## Reference: Permission Strategy Decision Table

| Strategy | Method | Matching | Performance | Use When |
|----------|--------|----------|-------------|----------|
| Plain | `requirePermissions` | Exact string | Fastest | Simple permission lists |
| Wildcard | `requireWildcardPermissions` | Glob pattern (`*`) | Medium | Hierarchical resource access |
| Expression | `requireComplexPermissions` | Boolean tree | Slowest | Complex AND/OR/NOT business rules |

Avoid Expression permissions on endpoints receiving more than ~500 requests per minute.

## Reference: Testing Guards

```typescript
describe('Guard Authorization', () => {
  it('should reject user without permission', async () => {
    const mockUser: AuthUser = {
      id: 'user-1',
      email: 'user@example.com',
      permissions: ['posts:read'] // Missing 'posts:create'
    };

    const context = { user: mockUser, req: {}, res: {} } as any;
    const guard = RouteGuards.requirePermissions('posts:create');

    await expect(guard.before!(context)).rejects.toThrow(ForbiddenError);
  });
});
```
