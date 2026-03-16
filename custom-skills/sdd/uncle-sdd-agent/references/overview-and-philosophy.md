# Overview and Philosophy

This skill combines three complementary strengths:

- BMAD for progressive context, role-based routing, and scale-aware planning
- OpenSpec for one canonical change package and a stable artifact chain
- Speckit for executable specifications, clarify discipline, and phased delivery

The core idea is simple:

- one platform workflow
- one change package per approved change
- a small number of phases
- explicit review and archive

Three durable ownership artifacts live in the platform repo and make the
methodology deterministic rather than judgment-dependent:

- component ownership boundary — tells the team who owns what before any epic
  is opened; prevents scope from bleeding across components
- dependency map — translates cross-component relationships into three impact
  tiers that drive JIRA structure automatically
- shared glossary — defines shared terms once so proposals and specs use
  consistent language across all roles and components

These artifacts are not DDD theory. They are practical lookup files written
once during Platform and read at every Assess, Specify, Plan, and Deliver step.

The methodology should feel practical for teams, not academic.

That means:

- use the smallest sufficient workflow
- keep each phase owner clear
- keep artifacts aligned with reality
- make PR review part of delivery
- make ownership classification a lookup, not a conversation
- make JIRA structure a consequence of impact tiers, not a freeform decision
