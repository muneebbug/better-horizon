---
title: Design Tokens & CSS Standards
description: Guide to Better Horizon's design token system, adaptive color opacity curves, and typography tokens.
sidebar_position: 3
---

# Design Tokens & CSS Standards

Better Horizon utilizes a cohesive design token architecture defined in `snippets/theme-styles-variables.liquid` and `snippets/color-palette.liquid`.

---

## 🎨 Core CSS Tokens

### Colors
- `--color-background`: Active section/page background.
- `--color-foreground`: Active section/page text color.
- `--color-input-background`: Input field background.
- `--color-input-text`: Input field text color.
- `--color-input-border`: Calculated input border color.
- `--color-foreground-subdued`: `rgb(var(--color-foreground-rgb) / var(--opacity-subdued-text))` for helper hints and secondary metadata.

### Borders & Radius
- `--style-border-width`: Standard 1px stroke.
- `--style-border-radius-inputs`: Corner radius for form fields and cards (default `8px`).
- `--style-border-radius-buttons-primary`: Primary pill button radius (`9999px` or custom).
- `--style-border-radius-buttons-secondary`: Secondary button radius.

### Spacing Tokens
- `--gap-xs`: `0.5rem` (8px)
- `--gap-sm`: `0.75rem` (12px)
- `--gap-md`: `1rem` (16px)
- `--gap-lg`: `1.5rem` (24px)
- `--gap-xl`: `2rem` (32px)

---

## ⚠️ Translucent Border Rule
Never hardcode solid black or grey borders (e.g. `border: 1px solid #000000;`). Always use:
```css
border: var(--style-border-width, 1px) solid rgb(var(--color-foreground-rgb) / var(--opacity-10-25, 0.15));
```
This ensures borders smoothly adjust across light, dark, and high-contrast theme palettes.
