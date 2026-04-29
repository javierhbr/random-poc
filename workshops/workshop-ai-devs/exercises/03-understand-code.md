# Exercise 3 — Understand unfamiliar code

> ⏱️ 15 minutes · 👥 Pairs · 🛠️ Any tool

---

## Your task

This is the most underrated use case: using AI as an **onboarding tutor** when you land in a new codebase.

You just joined a project. Your tech lead tells you "I need you to change the tax calculation in `orderProcessor.ts` because there's now a different rate for the food category". They open the file. You're staring at this:

---

## The code (you didn't write it)

Create the file `src/services/orderProcessor.ts`:

```typescript
import { randomUUID } from "crypto";

type Category = "electronics" | "clothing" | "food" | "other";

interface CartItem {
  productId: string;
  name: string;
  category: Category;
  unitPrice: number;
  quantity: number;
}

interface CustomerInfo {
  id: string;
  email: string;
  country: string;
  isVip: boolean;
  signupDate: Date;
}

interface ProcessedOrder {
  orderId: string;
  customerId: string;
  subtotal: number;
  discountApplied: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  items: CartItem[];
  createdAt: Date;
  estimatedDelivery: Date;
}

const TAX_RATES: Record<string, number> = {
  US: 0.07,
  ES: 0.21,
  MX: 0.16,
  DEFAULT: 0.1,
};

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.99;
const VIP_DISCOUNT = 0.1;
const BULK_DISCOUNT_THRESHOLD = 5;
const BULK_DISCOUNT = 0.05;

function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

function calculateDiscount(subtotal: number, customer: CustomerInfo, items: CartItem[]): number {
  let discount = 0;
  if (customer.isVip) {
    discount += subtotal * VIP_DISCOUNT;
  }
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  if (totalQuantity >= BULK_DISCOUNT_THRESHOLD) {
    discount += subtotal * BULK_DISCOUNT;
  }
  const yearsAsCustomer =
    (Date.now() - customer.signupDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (yearsAsCustomer >= 5) {
    discount += subtotal * 0.03;
  }
  return discount;
}

function calculateTax(amount: number, country: string): number {
  const rate = TAX_RATES[country] ?? TAX_RATES.DEFAULT;
  return amount * rate;
}

function calculateShipping(subtotal: number, country: string): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (country === "US") return SHIPPING_COST;
  return SHIPPING_COST * 2;
}

function estimateDelivery(country: string): Date {
  const days = country === "US" ? 3 : 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function processOrder(items: CartItem[], customer: CustomerInfo): ProcessedOrder {
  if (items.length === 0) {
    throw new Error("Cannot process empty order");
  }
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, customer, items);
  const taxableAmount = subtotal - discount;
  const tax = calculateTax(taxableAmount, customer.country);
  const shipping = calculateShipping(subtotal, customer.country);
  const total = taxableAmount + tax + shipping;
  return {
    orderId: randomUUID(),
    customerId: customer.id,
    subtotal,
    discountApplied: discount,
    taxAmount: tax,
    shippingCost: shipping,
    total,
    items,
    createdAt: new Date(),
    estimatedDelivery: estimateDelivery(customer.country),
  };
}

export function reprocessOrder(originalOrder: ProcessedOrder, customer: CustomerInfo): ProcessedOrder {
  return processOrder(originalOrder.items, customer);
}
```

---

## The questions (10 min)

Without reading the code line by line, use your favorite tool to answer these 4 questions:

### 1. What does this file do? (in ONE sentence)

```
[answer]
```

### 2. What are the public functions (entry points)?

```
[answer]
```

### 3. If I change `calculateTax` so `food` has a different rate, what parts of the code might break or need adjusting?

```
[answer]
```

### 4. Are there any code smells or obvious risks?

```
[answer]
```

---

## Suggested prompt template

```
I'm sending you a file from a repo I'm new to. I didn't write it.

[paste the code here, or use @file in your IDE]

Answer in this order, no long paragraphs:

1. What does this file do in ONE sentence?
2. What are the public functions (entry points)?
3. What does it depend on? Which modules does it import?
4. I need to change the tax calculation so the "food" category
   has a different rate. What parts of the code would I have
   to change, and what could break?
5. Are there code smells or obvious risks I should know about
   before touching this file?

Be concise. Bullet points.
```

---

## Debrief (3 min)

Discuss with your pair:

- How many minutes would it have taken you to understand this on your own vs with the AI?
- Did the AI catch anything you wouldn't have seen?
- Is there anything the AI said that's NOT correct? (look critically!)

---

## ⚠️ Things the AI should have caught

<details>
<summary>👀 Expected code smells and risks</summary>

A good AI answer should mention at least some of these points:

1. **The tax calculation doesn't differentiate by category.** To implement the change the tech lead is asking for, you have to refactor `calculateTax` to take items (not just amount) or do a per-line calculation.

2. **Magic numbers without context.** `0.03` (loyalty discount) is hardcoded inline instead of being a constant like the others.

3. **Discount stacking with no cap.** A VIP customer with a bulk order and 5+ years of loyalty stacks 18% in discounts. Is that intentional? Is there a cap?

4. **`reprocessOrder` ignores the original `orderId`.** It generates a new UUID, which is probably NOT what you want when "reprocessing".

5. **`estimatedDelivery` is non-deterministic.** It uses `new Date()` directly, which makes tests hard. Better to inject the clock.

6. **Prices are `number`, not integer cents.** Risk of floating-point precision errors like `0.1 + 0.2 !== 0.3`. In real production, prices should be integers (cents) or safe decimals.

7. **`country` as a free string.** It should be an enum or union type, not `string`.

8. **No input validation.** If a negative `unitPrice` or a decimal `quantity` arrives, the code processes it without complaint.

If the AI identified **3 or more** of these points, it gave you an excellent answer. If it identified fewer, try refining the prompt: "is there any other risk related to numerical precision or testing?"

</details>
