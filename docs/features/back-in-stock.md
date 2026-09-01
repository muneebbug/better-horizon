---
title: Back in Stock Notification
description: Sold-out variant email capture block integrating natively with Shopify customer tags without third-party apps, featuring full layout and design customization.
sidebar_position: 3
---

# Back in Stock Notification

The **Back in Stock** theme block displays an email capture form when a product variant is out of stock to capture high-intent buyers.

---

## 🚀 How It Works

1. **Sold-Out Detection:** Automatically detects when the active variant has `available == false`.
2. **Customer Capture:** Submits via Shopify's standard `/contact` form with customer tag:
   ```
   contact[tags] = "back-in-stock-request"
   ```
   Body contains the product title, SKU, and request timestamp.
3. **In-Place Confirmation:** Disables the form upon submit and renders a confirmation checkmark badge (`Thank you! We will notify you when restocked.`).

---

## 🎨 Design System & Customization

- **Layout Options:** Choose between `Inline (input & button side-by-side)` and `Stacked (full-width button below)`.
- **Container Styling:** `Default card`, `Minimal (borderless / transparent)`, `Outline only`, and `Custom colors`.
- **Full Color Customization:**
  - Container background and border colors with custom border radius (visible when `Custom colors` is selected).
  - Heading, subheading, and success confirmation colors.
  - Input field background, text, and border colors.
  - Button styling presets (`Primary`, `Secondary`, `Outline`, `Custom`) with conditional custom background, text, and border color overrides.
- **Theme Padding Controls:** Standard `t:content.padding` sliders.

---

## ⚙️ Block Settings

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `heading` | text | `"Notify me when available"` | Primary block title. |
| `subheading` | text | `"We will email you as soon as this item is restocked."` | Explanatory helper caption. |
| `email_placeholder`| text | `"Enter your email"` | Placeholder inside email input. |
| `button_label` | text | `"Notify Me"` | Primary action button label. |
| `success_message` | text | `"Thank you! We will notify you when restocked."` | Confirmation message. |
| `layout` | select | `inline` | Form layout (`inline`, `stacked`). |
| `card_style` | select | `default` | Container style (`default`, `minimal`, `outline`, `custom`). |
| `background_color` | color | `""` | Container background fill (visible when `custom`). |
| `border_color` | color | `""` | Container border stroke (visible when `custom`). |
| `border_width` | range | `1` | Container border thickness (0–4px, visible when `custom`). |
| `border_radius` | range | `8` | Container corner radius (0–24px, visible when `custom`). |
| `heading_color` | color | `""` | Heading text color. |
| `subheading_color` | color | `""` | Subheading text color. |
| `success_color` | color | `""` | Success icon and text color. |
| `input_background_color` | color | `""` | Input field background color. |
| `input_text_color` | color | `""` | Input field text color. |
| `input_border_color` | color | `""` | Input field border color. |
| `input_border_radius` | range | `8` | Input field corner radius (0–24px). |
| `button_style` | select | `primary` | Button style preset (`primary`, `secondary`, `outline`, `custom`). |
| `button_background_color` | color | `""` | Custom button background color (visible when `custom`). |
| `button_text_color` | color | `""` | Custom button text color (visible when `custom`). |
| `button_border_color` | color | `""` | Custom button border color (visible when `custom`). |
| `button_border_radius` | range | `8` | Button corner radius (0–24px, visible when `custom`). |

---

## 📁 Files
- `blocks/back-in-stock.liquid` — Theme block template, schema, and scoped styles.
- `assets/back-in-stock.js` — Client-side Web Component handler.
