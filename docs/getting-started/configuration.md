---
title: Configuration & Settings
description: Overview of global theme configuration, settings schema categories, and customization options.
sidebar_position: 2
---

# Theme Configuration & Settings

All settings in Better Horizon follow native Shopify schema conventions in `config/settings_schema.json`.

---

## 🧭 Theme Editor Categories

When opening the **Shopify Theme Editor (`Customize`)**, settings are organized into standard categories:

| Category | Description |
| :--- | :--- |
| **Logo and favicon** | Default logo, inverse logo (transparent headers), mobile heights, and favicon picker. |
| **Colors** | Global color palette (background, foreground, accents, and contrast overrides). |
| **Typography** | Body, heading, and button font families, scale sizes, line-heights, and tracking. |
| **Cart** | Cart drawer vs page type, seller notes, discount code inputs, and price fonts. |
| **Wishlist** | Dedicated controls to toggle the Wishlist icon in header actions. |
| **Product cards** | Quick Add controls, Quick View preview modal toggle, second image hover, and carousels. |
| **Localization** | Regional store country suggestion banner controls. |
| **Variant pickers** | Swatch dimensions, radii, borders, and button widths. |

---

## 🎨 Color System & Palettes

Better Horizon utilizes CSS custom properties calculated in `snippets/theme-styles-variables.liquid` and `snippets/color-palette.liquid`:

- `--color-background`: Base background color.
- `--color-foreground`: Primary text and icon color.
- `--color-input-background`: Input field surface background.
- `--color-input-border`: Translucent adaptive border for inputs and cards.
- `--color-foreground-subdued`: Subdued captions and helper hints.
