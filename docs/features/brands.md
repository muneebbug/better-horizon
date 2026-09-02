---
title: Brands & Logo List Section
description: Clean, responsive, and accessible brand logo bar built with native Theme Blocks, customizable header, hover effects, and multiple mobile layouts.
sidebar_position: 18
---

# Brands & Logo List Section

The **Brands & Logo List** section showcases partner logos, press mentions, certifications, or vendor brands in a clean, high-performance, and responsive bar.

Built entirely on Shopify's native Theme Blocks architecture, it renders native `image`, `text`, and `_heading` blocks with zero third-party scripts or layout shift.

---

## 🚀 Key Features

- **🧩 Native Theme Blocks Architecture:**
  - Employs Horizon's native section header pattern (`static-header` via `group` block) with full typography, alignment, and spacing controls.
  - Allowed blocks are strictly filtered to `image`, `text`, and `_heading` blocks.
- **🎨 Grayscale & Hover Animations:**
  - **Grayscale Filter:** `None (Full color)`, `Always grayscale`, or `Grayscale (Color on hover)`.
  - **Hover Effects:** `None`, `Fade opacity`, `Subtle scale`, or `Lift upward`.
  - Individual resting opacity (10–100%) and hover opacity (10–100%) controls.
- **📱 Responsive Mobile Layouts:**
  - `Horizontal swipe scroll`: Smooth touch scroll with hidden scrollbars for clean mobile UX.
  - `Wrap in rows`: Logos wrap into balanced rows.
  - `Grid columns`: Configurable 2 to 4 columns on mobile screens.
- **⚡ Natural Aspect Ratio Preservation:**
  - Logo images maintain their natural aspect ratios and shrink-wrap without distortion, clipping, or fixed aspect-ratio stretching.
  - Independent desktop and mobile logo height controls (e.g. 28px desktop, 20px mobile) and maximum width limits.
- **♿ WCAG 2.2 AA Compliant:**
  - Images support descriptive `alt` text or pass decorative `alt=""` attributes.
  - Interactive logo links feature visible high-contrast focus rings and accessible target states.

---

## ⚙️ Section Settings

### Size & Layout
- `section_width`: Page container width (`Page width` or `Full width`).
- `alignment`: Logo distribution (`Space between`, `Center`, `Space around`, `Space evenly`, `Left`).
- `logo_height`: Desktop logo height in pixels (Range: 15–100px, Default: 28px).
- `logo_height_mobile`: Mobile logo height in pixels (Range: 12–60px, Default: 20px).
- `logo_max_width`: Maximum logo width in pixels (Range: 50–300px, Default: 150px).
- `gap`: Gap between logos on desktop (Range: 10–100px, Default: 48px).
- `gap_mobile`: Gap between logos on mobile (Range: 8–60px, Default: 24px).

### Mobile Layout
- `mobile_layout`: Display mode on mobile devices (`Horizontal swipe scroll`, `Wrap in rows`, `Grid columns`).
- `grid_mobile_columns`: Column count when mobile layout is set to Grid (Range: 2–4, Default: 3).

### Appearance & Effects
- `logo_opacity`: Default resting opacity (Range: 10–100%, Default: 90%).
- `logo_hover_opacity`: Opacity on hover (Range: 10–100%, Default: 100%).
- `grayscale_mode`: Grayscale filtering (`None`, `Always grayscale`, `Grayscale (Color on hover)`).
- `hover_effect`: Micro-animation on hover (`None`, `Fade opacity`, `Subtle scale`, `Lift upward`).
- `background_color`: Optional section background color override.
- `text_color`: Optional text color override.

### Spacing & Padding
- Standard `t:content.padding` sliders for block start/end and inline start/end padding.

---

## 🧩 Allowed Blocks

| Block | Type | Description |
| :--- | :--- | :--- |
| **Image** | `image` | Native Horizon image block with link, object fit, and width settings. |
| **Text** | `text` | Native paragraph or rich text block. |
| **Heading** | `_heading` | Native semantic heading block (`h1`–`h6`) with typography presets. |

---

## 📁 Files

- `sections/brands.liquid` — Section markup, Theme Block header slot, and schema configuration.
- `snippets/brands-styles.liquid` — Scoped CSS, CSS custom properties, grayscale filters, and hover keyframes.
