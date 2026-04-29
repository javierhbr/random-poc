# Exercise 2 — Build an endpoint with iterative flow

> ⏱️ 30 minutes · 👥 Pairs · 🛠️ Recommended: Claude Code or Windsurf

---

## Your task

Build a `POST /api/products` endpoint that takes a new product, validates it, stores it in memory, and returns the created product with its ID.

**Product requirements:**
- `name`: string, minimum 3 characters, maximum 100
- `price`: positive number (greater than 0)
- `stock`: non-negative integer
- `category`: one of `"electronics" | "clothing" | "food" | "other"`

**Endpoint requirements:**
- Validation with Zod
- If validation fails, respond 400 with the errors
- If everything's good, respond 201 with the product + generated ID
- Tests with Vitest + supertest

---

## The iterative flow (3 steps)

> 🚨 **Exercise rule:** Don't ask the AI to "build me the whole endpoint". Follow the 3 steps in order.

### Step 1 — Ask for the plan (5 min)

Your first prompt **must NOT ask for code**. Ask only for the plan.

**Suggested template:**

```
Context: TypeScript + Express + Zod + Vitest. I'm in a repo with
this structure:
  src/
    routes/      ← defines endpoints
    controllers/ ← request/response logic
    services/    ← business logic
    schemas/     ← validation with Zod
  tests/

I want to build POST /api/products with these requirements:
[paste the requirements above]

DO NOT write code yet. Give me a numbered list of the steps you
would follow, indicating which files you would create or touch
in each step and in what order. I want to understand the plan
before implementing.
```

📝 **Discuss as a pair:**
- Does the plan make sense?
- Is any step missing?
- Is any step unnecessary?
- In what order would YOU do them?

---

### Step 2 — Implement step by step (15 min)

Now execute the plan **one step at a time**. After each step, **read the code**, make sure you understand it, and only then move to the next.

**Template for each step:**

```
Perfect. Now execute only step N of your plan: [describe the
step]. Show me the code and wait for my confirmation before
moving to the next step.
```

⚠️ **Common trap:** juniors get bored of the step-by-step flow and say "ok do it all". Resist. The point of the exercise is to practice the iterative flow.

📝 **Note:**
- At which step did the AI surprise you (something you didn't expect)?
- Did you have to correct it at any step?

---

### Step 3 — Tests with edge cases (10 min)

Once the endpoint works, ask for tests:

**Template:**

```
Now generate tests with Vitest + supertest for POST /api/products.
Include these cases:

Happy paths:
- complete valid product

Validation edge cases:
- empty name
- 2-character name (just below minimum)
- 101-character name (just above maximum)
- price = 0 (not allowed, must be > 0)
- negative price
- decimal stock (3.5)
- negative stock
- category with invalid value
- empty payload
- payload with unexpected extra fields (are they ignored or rejected?)

Each test should check the status code AND the response shape.
```

📝 **Read the tests and ask yourself:**
- Do they cover what they promise?
- Is there any edge case the AI missed?
- Is any test redundant?

---

## Bonus (if you finish early)

1. **Ask the AI:** "what happens if two requests arrive at the same time? Does my code have a race condition?"

2. **Add an extra endpoint:** `GET /api/products/:id`. This time try to do it in **a single interaction** now that you've established context.

3. **Compare tools:** repeat the exercise with a different tool. Which one felt more comfortable and why?

---

## ⚠️ Don't read this until you've finished

<details>
<summary>👀 Example of a good solution</summary>

### `src/schemas/product.ts`
```typescript
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: z.enum(["electronics", "clothing", "food", "other"]),
});

export type ProductInput = z.infer<typeof productSchema>;

export interface Product extends ProductInput {
  id: string;
  createdAt: Date;
}
```

### `src/services/products.ts`
```typescript
import { randomUUID } from "crypto";
import { Product, ProductInput } from "../schemas/product";

const products = new Map<string, Product>();

export function createProduct(input: ProductInput): Product {
  const product: Product = {
    ...input,
    id: randomUUID(),
    createdAt: new Date(),
  };
  products.set(product.id, product);
  return product;
}

export function getProductById(id: string): Product | undefined {
  return products.get(id);
}
```

### `src/controllers/products.ts`
```typescript
import { Request, Response } from "express";
import { productSchema } from "../schemas/product";
import * as productsService from "../services/products";

export function createProductController(req: Request, res: Response) {
  const result = productSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.flatten(),
    });
  }

  const product = productsService.createProduct(result.data);
  return res.status(201).json(product);
}
```

### `src/routes/products.ts`
```typescript
import { Router } from "express";
import { createProductController } from "../controllers/products";

export const productsRouter = Router();
productsRouter.post("/products", createProductController);
```

### Reflection

This exercise is NOT about the "correct" solution. It's about the **flow**: ask for a plan → implement step by step → tests with edge cases. If you followed that flow, you won, regardless of whether your code looks identical to the example.

</details>
