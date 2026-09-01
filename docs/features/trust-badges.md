---
title: Trust Badges & Guarantee Bar
description: Highly customizable store reassurance bar featuring layout options, vector icons, custom image uploads, color styling, and flexible alignments.
sidebar_position: 5
---

# Trust Badges & Guarantee Bar

The **Trust Badges & Guarantee Bar** theme block displays store value propositions, credentials, and customer reassurance to build buyer confidence.

---

## 🚀 Key Features

- **🛡️ Up to 6 Configurable Badges:** Configure from 1 to 6 reassurance badges with individual enable toggles and optional links.
- **🎨 Icons or Custom Uploads:**
  - **Icons:** Pick from 12 built-in vector presets (`shipping`, `shield`, `lock`, `support`, `return`, `star`, `award`, `heart`, `clock`, `globe`, `check`, `zap`).
  - **Custom Image:** Upload custom brand icons or badges via Shopify's media manager.
- **📐 Flexible Layouts & Orientations:**
  - **Layout Styles:** `Grid` (multi-column), `Horizontal` (inline wrap), or `Vertical` (stacked list).
  - **Grid Columns:** Select 1 to 4 desktop columns (or `Auto-fit`), and 1 or 2 mobile columns.
  - **Badge Orientation:** Choose `Icon beside text (Horizontal)` or `Icon above text (Vertical)`.
  - **Alignment:** Align items `Left`, `Center`, or `Right`.
- **🎨 Complete Styling & Color Control:**
  - Container styles: `Default card`, `Minimal (borderless / transparent)`, `Outline only`, and `Custom colors`.
  - Custom background color, border color, border width, and border radius (active when `Custom colors` is chosen).
  - Custom icon color, heading text color, and subtext color.
  - Icon size slider (16px to 48px) and badge spacing controls.

---

## ⚙️ Block Settings

### Layout & Arrangement
- `layout`: Choose between `Grid`, `Horizontal (inline wrap)`, and `Vertical (stacked)`.
- `columns_desktop`: Number of desktop columns in grid mode (`Auto-fit`, `1`, `2`, `3`, `4`).
- `columns_mobile`: Number of mobile columns (`1` or `2`).
- `badge_orientation`: `Horizontal` (icon beside text) or `Vertical` (icon above text).
- `alignment`: Content alignment (`Left`, `Center`, `Right`).
- `icon_size`: Sizing of icons in pixels (Range: 16–48px, Default: 22px).
- `gap`: Gap spacing between badges (Range: 8–40px, Default: 16px).

### Appearance & Colors
- `card_style`: Container style preset (`Default card`, `Minimal`, `Outline only`, `Custom colors`).
- `background_color`: Custom container background fill (visible when `Custom colors` is selected).
- `border_color`: Custom container border stroke (visible when `Custom colors` is selected).
- `border_width`: Border thickness in pixels (Range: 0–4px, Default: 1px, visible when `Custom colors` is selected).
- `border_radius`: Container corner roundness (Range: 0–24px, Default: 8px, visible when `Custom colors` is selected).
- `icon_color`: Color for vector preset icons.
- `heading_color`: Text color for badge titles.
- `subtext_color`: Text color for badge subtitles.

### Badge Items (1 through 6)
Each badge includes:
- `badge_X_enable`: Toggle visibility for this badge.
- `badge_X_icon_type`: Select `Icons` (preset) or `Custom image`.
- `badge_X_icon`: Vector icon preset dropdown.
- `badge_X_image`: Image picker for custom uploaded icons.
- `badge_X_heading`: Badge title text.
- `badge_X_subtext`: Optional supporting description.
- `badge_X_link`: Optional URL to make the badge clickable.

---

## 📁 Files
- `blocks/trust-badge-bar.liquid` — Block template, Theme Editor schema, and scoped styles.
