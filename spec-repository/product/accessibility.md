# Accessibility Standards

> Version: 1.0.0 | Target: WCAG 2.1 Level AA

---

## MUST

- **MUST** achieve WCAG 2.1 Level AA compliance for all user-facing changes
- **MUST** support keyboard-only navigation for the complete checkout flow
- **MUST** provide visible focus indicators on all interactive elements
- **MUST** include alt text for all product images and functional images
- **MUST** use semantic HTML: headings, landmarks, lists, buttons (not divs)
- **MUST** associate labels with form inputs (htmlFor / aria-labelledby)
- **MUST** announce dynamic content changes with aria-live regions
- **MUST** maintain minimum contrast ratio 4.5:1 for normal text, 3:1 for large text

## SHOULD

- **SHOULD** test with screen readers (NVDA + Chrome, VoiceOver + Safari)
- **SHOULD** provide skip-to-content links
- **SHOULD** not rely solely on colour to convey information

## Testing Gate

Before shipping any external-facing feature:
- [ ] Automated: axe-core scan with zero critical or serious violations
- [ ] Manual: keyboard-only walkthrough of the complete user flow
- [ ] Manual: screen reader test on the primary user flow
