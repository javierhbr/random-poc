# Exercise 1 — Debugging with CIVR

> ⏱️ 25 minutes · 👥 Pairs · 🛠️ Any of the 3 tools

---

## Your task

Your QA team reports an intermittent bug in production:

> "The `GET /users/:id/profile` endpoint sometimes returns `orders` as an empty `{}` object instead of an array of orders. The unit tests pass in CI. We can reproduce it in staging but not locally."

Your job: **find the root cause and fix it properly**, not just patch the symptom.

---

## The code

Create a file `src/routes/users.ts` with this:

```typescript
import express, { Request, Response } from "express";

const app = express();

interface User {
  id: string;
  name: string;
  email: string;
}

interface Order {
  id: string;
  userId: string;
  total: number;
  createdAt: Date;
}

// Database simulation
async function fetchUserById(id: string): Promise<User | null> {
  await new Promise((r) => setTimeout(r, 50));
  if (id === "404") return null;
  return { id, name: "Ana Pérez", email: "ana@example.com" };
}

async function fetchUserOrders(userId: string): Promise<Order[]> {
  await new Promise((r) => setTimeout(r, 100));
  return [
    { id: "o1", userId, total: 120, createdAt: new Date() },
    { id: "o2", userId, total: 80, createdAt: new Date() },
  ];
}

app.get("/users/:id/profile", async (req: Request, res: Response) => {
  try {
    const user = await fetchUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const orders = fetchUserOrders(user.id);

    return res.json({
      user,
      orders,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.listen(3000, () => console.log("Server on :3000"));
```

---

## Part 1 — Bad prompt (5 min)

First, try with a **deliberately bad** prompt:

> "this code isn't working, fix it: [paste code]"

📝 **Note:** what did it answer? Did it identify the real problem or invent things? Did it make changes it shouldn't?

---

## Part 2 — Prompt with CIVR (15 min)

Now rewrite your prompt using the **CIVR** framework:

- **C**ontext: stack, what the endpoint does, where the bug reproduces
- **I**nput: the code + the logs (or "no visible logs")
- **V**alidate: ask for explanation before the fix
- **R**efine: if the first answer doesn't convince you, iterate

📝 **Write your prompt here before sending it:**

```
[write the full prompt as a pair]
```

Send it to your tool of choice. It should:
1. Identify the root cause
2. Explain why it happens
3. Propose the minimal fix

---

## Part 3 — Bonus (5 min, if you finish early)

Ask the AI to:

> "Write a test with Vitest + supertest that would prevent this bug in the future. The test should fail against the original code and pass after the fix."

Did the AI write a test that would actually catch this bug? Or does it just check that the endpoint responds 200?

---

## ⚠️ Don't read this until you've finished

<details>
<summary>👀 Solution (spoiler)</summary>

### Root cause

There are **two bugs**, and only one is obvious:

**Bug 1 — Missing `await` (the obvious one):**
```typescript
const orders = fetchUserOrders(user.id); // ❌ returns an unresolved Promise
```

When JSON.stringify tries to serialize an unresolved Promise, it returns `{}` (empty object). That's why the frontend receives `orders: {}` instead of an array.

The fix:
```typescript
const orders = await fetchUserOrders(user.id);
```

**Bug 2 — Silent try/catch (the subtle one):**

Even though the `try/catch` is there, since `fetchUserOrders` is **never awaited**, any error that promise throws becomes an *unhandled promise rejection* that the `catch` doesn't catch. That means in production you could be losing errors silently.

Once you add the `await`, the catch will work correctly.

### Why the unit tests pass

The tests probably mock `fetchUserOrders` and only check the 200 status code, not the contents of the `orders` field. That's why the bug passes CI but fails manual QA.

### Test that would catch the bug

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/routes/users";

describe("GET /users/:id/profile", () => {
  it("returns orders as an array, not an empty object", async () => {
    const res = await request(app).get("/users/123/profile");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true); // <- this catches the bug
    expect(res.body.orders.length).toBeGreaterThan(0);
  });
});
```

</details>
