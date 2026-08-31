---
title: Back in Stock Notification
description: Sold-out variant email capture block integrating natively with Shopify customer tags without third-party apps.
sidebar_position: 3
---

# Back in Stock Notification

The **Back in Stock** theme block displays an email capture form when a product variant is out of stock.

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

## 🎨 Design System & Styling

- **Height & Spacing Harmony:** Email input and submit button share the exact same `44px` height and theme border radius.
- **Adaptive Soft Borders:** Uses `var(--style-border-width, 1px) solid rgb(var(--color-foreground-rgb) / var(--opacity-10-25, 0.15))`.
- **Responsive Stacking:** Stacks vertically on mobile viewports below `480px`.

---

## ⚙️ Block Settings

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `heading` | text | `"Notify me when available"` | Primary block title. |
| `subheading` | text | `"We will email you as soon as this item is restocked."` | Explanatory helper caption. |
| `email_placeholder`| text | `"Enter your email"` | Placeholder inside email input. |
| `button_label` | text | `"Notify Me"` | Primary action button label. |
| `success_message` | text | `"Thank you! We will notify you when restocked."` | Confirmation message. |

---

## 📁 Files
- `blocks/back-in-stock.liquid` — Theme block template and stylesheet.
- `assets/back-in-stock.js` — Client-side Web Component handler.
