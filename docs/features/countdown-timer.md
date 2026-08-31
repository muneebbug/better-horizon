---
title: Real Date Countdown Timer
description: Promotional and metafield-bound countdown timer strictly driving authentic purchase urgency.
sidebar_position: 6
---

# Real Date Countdown Timer

The **Countdown Timer** theme block displays a real-time countdown timer bound to ISO dates.

---

## 🚀 Key Features

- **⏱️ Tabular Numerals:** Uses `font-variant-numeric: tabular-nums` to eliminate jitter while seconds tick down.
- **📅 Dynamic Date Sourcing:**
  1. **Product Metafield:** `product.metafields.custom.sale_end_date` (ISO timestamp).
  2. **Block Setting:** Global static end date (e.g. `2026-12-31T23:59:59Z`).
- **🛡️ Auto-Hide on Expiry:** When the target date passes, the block automatically unmounts or hides.

---

## ⚙️ Block Settings

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `heading` | text | `"Limited Time Offer"` | Header title above the timer boxes. |
| `end_date` | text | `""` | ISO timestamp string (e.g. `2026-12-31T23:59:59Z`). |

---

## 🛠️ Metafield Setup (Optional)

1. Navigate to **Shopify Admin > Settings > Custom data > Products**.
2. Add definition:
   - **Name:** Sale End Date
   - **Namespace and key:** `custom.sale_end_date`
   - **Type:** Date and time (`Date and time`)
3. Set the date on sale products.

---

## 📁 Files
- `blocks/countdown-timer.liquid` — Block markup and styling.
- `assets/countdown-timer.js` — Interval countdown engine.
