---
title: Accessibility Standards (WCAG 2.2 AA)
description: Strict accessibility implementation standards, focus rings, ARIA roles, and keyboard navigation.
sidebar_position: 4
---

# Accessibility Standards (WCAG 2.2 AA)

Better Horizon meets strict **WCAG 2.2 Level AA** accessibility compliance.

---

## ♿ Core Requirements

1. **Full Keyboard Operability:** Every interactive trigger, drawer, dialog, and button must be operable with `Tab`, `Enter`, `Space`, and `Escape`.
2. **Focus Visibility:** Interactive elements must display high-contrast dual focus rings (`:focus-visible`). Never set `outline: none` without providing a focus style.
3. **Touch Target Sizing:** Minimum `44×44px` interactive touch target size (WCAG 2.5.8).
4. **Color Contrast:** Minimum 4.5:1 text contrast ratio and 3:1 graphical control contrast ratio (WCAG 1.4.3 & 1.4.11).
5. **Screen Reader Semantics:**
   - Use semantic HTML (`<button>`, `<a>`, `<dialog>`, `<nav>`, `<main>`).
   - Use `aria-expanded`, `aria-controls`, `aria-haspopup`, and `aria-live="polite"` where appropriate.
   - Decorative icons must have `aria-hidden="true"`.
