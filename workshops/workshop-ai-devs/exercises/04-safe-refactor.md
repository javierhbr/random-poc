# Exercise 4 (BONUS) — Safe refactor

> ⏱️ 20 minutes · 👥 Solo or pairs · 🛠️ Recommended: Claude Code

> This exercise is optional. It works as homework if there's no time during the workshop.

---

## Your task

Refactor a legacy function **without changing its behavior**, using the AI as a safety net.

**The challenge:** many juniors refactor code and break things because they don't know what behavior they were supposed to preserve. The pro trick is: **write characterization tests BEFORE touching anything**.

---

## The code to refactor

Create `src/utils/legacyDiscount.ts`:

```typescript
export function calc(p: number, q: number, t: string, vip: boolean, c: string): number {
  let r = 0;
  if (t === "P") {
    r = p * q;
    if (q > 10) r = r - r * 0.05;
    if (q > 50) r = r - r * 0.05;
    if (vip) r = r - r * 0.1;
  } else if (t === "S") {
    r = p * q;
    if (vip) r = r - r * 0.15;
  } else if (t === "B") {
    r = p * q * 0.7;
    if (vip) r = r - r * 0.05;
  }
  if (c === "MX" || c === "ES") r = r * 1.16;
  if (r < 0) r = 0;
  return Math.round(r * 100) / 100;
}
```

Yes, it's horrible. On purpose. One-letter variables, magic numbers, tangled logic, no descriptive types.

---

## The safe refactor flow (4 steps)

### Step 1 — Understand what it does (3 min)

**Template:**

```
I'm sending you a legacy function. DO NOT suggest changes yet.
First I want to understand what it does.

[paste code]

Answer:
1. What does this function calculate? One sentence.
2. What do the parameters p, q, t, vip, c mean?
3. What cases / branches does it have?
4. Is there any weird behavior that looks like a bug
   but is probably intentional?
```

### Step 2 — Generate characterization tests (5 min)

These tests capture the **current** behavior, including weird stuff. They are your safety net.

**Template:**

```
Now generate Vitest tests that capture the CURRENT behavior of
this function, including weird cases. DO NOT refactor, DO NOT
fix apparent bugs. Just document what the function does TODAY,
so I can use these tests as a safety net during the refactor.

Make sure to cover:
- Each type (P, S, B)
- With and without VIP
- Different countries (MX, ES, US, other)
- Small, medium and large quantities (that trigger the volume
  discounts)
- Edge cases: p=0, q=0, negative numbers, unknown type
```

Run the tests. **All of them must pass against the original code.** If any fail, the AI guessed the behavior wrong — fix it before moving on.

### Step 3 — Refactor with the safety net (8 min)

**Template:**

```
Now refactor the `calc` function with these goals:
- Descriptive names (no more single letters)
- Explicit types (no free-form string for `t` or `c`)
- Named constants for the magic numbers
- Split the P/S/B type branches into smaller functions

Constraints:
- DO NOT change the behavior. The tests from the previous step
  must still pass without modification.
- DO NOT fix apparent bugs (that's another PR).
- Keep the same public signature, or document what changes and why.
```

Run the tests. If they pass → you won. If they fail → the AI changed behavior; iterate.

### Step 4 — Validate (4 min)

**Template:**

```
Compare the original and refactored code. Confirm:
1. Are they functionally equivalent across ALL possible inputs?
2. Is there any edge case where they could diverge?
3. Any subtle change in numerical precision?
```

---

## The key lesson

After doing this exercise, you know the pro trick for refactoring legacy code:

> **Tests first. Refactor after. AI accelerates both steps, but the order matters more than the speed.**

If you refactor without characterization tests, you're not refactoring: you're **praying**.

---

## ⚠️ Don't read this until you've finished

<details>
<summary>👀 Hints about the original code</summary>

What the function appears to do:

- `p` = unit price, `q` = quantity, `t` = sale type, `vip` = bool, `c` = country
- Type `"P"` (Product): volume discounts (5% if q>10, another 5% if q>50) and 10% if VIP
- Type `"S"` (Service): only VIP discount of 15%
- Type `"B"` (Bundle): 30% base discount, another 5% if VIP
- If country is MX or ES, multiply by 1.16 (tax)
- If result is negative, clamp to 0
- Round to 2 decimals

**Suspicious bugs you should NOT "fix" during the refactor:**

1. The 5% discount for q>50 is applied AFTER the 5% for q>10, so for q>50 you end up with a compound discount (~9.75%) instead of a flat 10%. Bug? Intentional? You don't know — leave it alone.

2. If `t` is anything other than "P", "S", "B" → the function returns 0. It probably should throw an error, but that's another PR.

3. Tax is applied to the amount AFTER discount, not to the subtotal. This may or may not be correct depending on the country's tax law. Leave it alone.

**That's why characterization tests matter:** they capture these quirks and warn you if you change them by accident.

</details>
