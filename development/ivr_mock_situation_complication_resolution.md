
# Automated Testing Mocks for IVR Platform
## Situation – Complication – Resolution

---

# 1. Situation

The IVR platform requires **extensive automated testing** to validate call flows and service integrations during development and CI/CD pipelines.

To support these tests, the system depends on **Mocks (MOCs)** that simulate the behavior of external APIs consumed by the IVR.

Currently:

- The IVR platform **runs outside Capital One infrastructure**, which limits the internal tooling we can use.
- Because of this constraint, we **cannot use internal tools such as MIMEO** for mocking services.
- Capital One recently introduced a **Mock solution within the Exchange platform**, which allows APIs to be mocked and exposed externally.

This solution initially appeared to be a viable replacement for the **existing vendor-hosted mock platform** we were using.

The intended process with the Exchange Mock platform is:

1. Create the real API definitions.
2. Attach the APIs to the Mock solution.
3. Configure the mock behavior.
4. Submit for technical owner review.
5. Approve and promote:
   - Draft → Staging
   - Staging → Production

This governance model works reasonably well **when the number of mocks is small**.

---

# 2. Complication

The IVR automated testing framework requires **a very large number of mocks** to support all testing scenarios.

For full coverage across flows and test cases we need:

**1,000+ mocks**

These mocks are required to:

- Run **local development tests**
- Execute **pipeline automated tests**
- Simulate **multiple API states and scenarios**

However, we have discovered several critical limitations.

## Platform scalability limitation

The **Exchange Mock UI is not capable of handling the volume of mocks required**.

At scale:

- The UI becomes extremely slow
- Approvals cannot be completed
- Moving mocks from **Draft → Staging → Production becomes practically impossible**

This creates a **hard operational bottleneck**.

---

## Temporary workaround (not sustainable)

Working with the Mocks platform team, we obtained **API access to the platform**.

Using these APIs we were able to:

- Programmatically upload **1,000+ mocks**
- Bypass the UI limitations during initial configuration

However:

- This **does not solve the approval workflow problem**
- Mocks **cannot be approved via API**
- The long-term availability of these APIs **is not guaranteed**

Therefore, the current workaround **does not unblock the operational process**.

---

## Original assumption

Before adopting this solution:

- We **presented our use case to the Mocks platform team**
- They acknowledged the large volume but indicated it **should eventually work**
- At the time, it was **the only viable path to migrate mocks from Penton to Capital One infrastructure**

In practice, we are now discovering that **the platform was not designed to operate at this scale**.

As a result:

**The IVR automated testing strategy is currently blocked by the Mock platform limitations.**

---

# 3. Resolution

We are currently evaluating three possible paths to resolve the issue.

---

# Option 1 – Partner with the Mock Platform Team

We have offered **engineering support to the Mocks platform team** to help improve the system so it can support our scale.

Potential areas of contribution:

- UI scalability improvements
- Bulk approval mechanisms
- Automation APIs
- Operational tooling

The team is currently evaluating whether they will accept this collaboration.

### Pros

- Keeps alignment with **Capital One internal platform strategy**
- No new infrastructure required
- Improves the platform for other teams as well

### Risks

- Timeline is uncertain
- Platform architecture may not support the required scale even with improvements

---

# Option 2 – Build an Internal Mock Platform

Develop a **custom mock service within Capital One** that:

- Supports **high-volume mock definitions**
- Exposes APIs **publicly to the IVR platform**
- Is optimized for **CI/CD test execution**

This solution could be implemented using technologies such as:

- Wiremock
- Lightweight API mocking services
- Containerized mock environments

### Pros

- Full control of scalability and performance
- Tailored to IVR testing requirements
- Faster iteration and automation

### Risks

- Requires **approval exceptions** to bypass the Exchange gateway governance
- Requires infrastructure approval for **internet-accessible services**
- Additional operational ownership

---

# Option 3 – Use an External Mocking Vendor

Evaluate **specialized mocking platforms** such as:

- Wiremock Cloud
- MockServer
- Other API mocking vendors

These platforms are designed specifically for **large-scale mocking environments**.

### Pros

- Purpose-built for mocking
- Highly scalable
- Reduced internal development effort

### Risks

- Vendor onboarding process
- Security and compliance approvals
- Integration with Capital One network and governance policies

---

# Recommendation

If the **Mocks platform team cannot provide a near-term solution**, we should proceed with evaluating **Option 2 or Option 3** in parallel to avoid blocking:

- IVR automated testing
- CI/CD pipeline execution
- Development velocity

A decision should prioritize:

- Scalability for **1,000+ mocks**
- Automation support
- Operational simplicity
