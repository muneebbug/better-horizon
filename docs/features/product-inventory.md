---
title: Real-Time Low-Stock Indicator & Progress Bar
description: Dynamic inventory availability indicator featuring pulsing status dots, low-stock thresholds, custom tiered messages, and animated stock progress bars.
sidebar_position: 16
---

# Real-Time Low-Stock Indicator & Progress Bar

The **Product Inventory & Low-Stock Indicator** block provides real-time stock availability, urgency alerts, and an animated progress bar pulled directly from live Shopify inventory counts. When shoppers switch variants on the product page or in quick-view modals, the indicator updates instantly with zero page reload.

---

## Key Features

- **Live Stock Status Indicators:** Displays clear, customizable stock state badges with pulsing status dots:
  - **In Stock (High Stock):** Pulsing green dot with custom in-stock messaging (e.g. `3,432 in stock` or `In stock, ready to ship`).
  - **Low Stock Urgency:** Pulsing amber dot triggered when inventory falls below the configurable `low_stock_threshold` (e.g. `Only 5 left in stock - order soon!`).
  - **Nearly Sold Out Alert:** High-urgency pulsing red dot triggered when stock falls below `nearly_sold_out_threshold` (e.g. `Hurry! Only 2 remaining!`).
  - **Pre-Order / Backorder:** Automatically displayed when all three conditions are met:
    1. Inventory is **tracked by Shopify** on the variant (`variant.inventory_management == 'shopify'`).
    2. Inventory quantity is **0 or less** (`variant.inventory_quantity <= 0`).
    3. **"Continue selling when out of stock"** is enabled in the Shopify Admin (`variant.inventory_policy == 'continue'`).
  - **Out of Stock:** Displayed when inventory quantity is 0 or less and "Continue selling when out of stock" is disabled (or item is unavailable).
- **Animated Stock Progress Bar:** Striped progress bar calculating current inventory against a customizable maximum baseline count. Dynamically shifts colors (green → amber → red) to visually communicate scarcity.
- **Smart Visibility Controls:** Options to automatically hide the block when an item is out of stock or when an item has high stock (only showing when inventory is scarce).
- **100% Real-Time Variant Switching:** Seamlessly synchronizes inventory text, progress bar width, and status colors when switching variants via Shopify's standard event system.

---

## Block Settings

Located in **Product Information** sections under the `Product` block category:

### Thresholds & Visibility
- `low_stock_threshold` (Range: 1–50, Default: 10): Upper inventory limit for low-stock warning.
- `nearly_sold_out_threshold` (Range: 1–10, Default: 3): Upper limit for high-urgency nearly sold out alert.
- `show_inventory_quantity` (Checkbox, Default: true): Display exact numerical inventory count.
- `hide_when_out_of_stock` (Checkbox, Default: false): Hide the indicator entirely when sold out.
- `hide_when_high_stock` (Checkbox, Default: false): Only display the block when inventory reaches low-stock or nearly sold-out levels.

### Progress Bar
- `show_progress_bar` (Checkbox, Default: true): Toggle the visual inventory progress bar.
- `progress_bar_max` (Range: 10–100, Default: 30): Maximum baseline count for 100% progress width calculation.
- `progress_bar_height` (Range: 4–12px, Default: 6px): Height of the progress bar track.
- `animate_pulse` (Checkbox, Default: true): Enables glowing radar-pulse micro-animation on the status dot.

### Custom Messaging
- `text_in_stock`: Template for in-stock items (Supports `[count]`, default: `[count] in stock`).
- `text_low_stock`: Template for low-stock items (Supports `[count]`, default: `Only [count] left in stock - order soon!`).
- `text_nearly_sold_out`: Template for nearly sold-out items (Supports `[count]`, default: `Hurry! Only [count] remaining!`).
- `text_out_of_stock`: Message shown when inventory is depleted (Default: `Currently out of stock`).
- `text_preorder`: Message shown when quantity is tracked, count is 0 or less, and "Continue selling when out of stock" is turned on in Shopify (Default: `Available for pre-order`).

### Colors
- `color_in_stock`: Color for in-stock dot and progress bar (Default: `#10B981`).
- `color_low_stock`: Color for low-stock state (Default: `#F59E0B`).
- `color_nearly_sold_out`: Color for nearly sold out state (Default: `#EF4444`).
- `color_out_of_stock`: Color for out of stock state (Default: `#6B7280`).
- `progress_bg_color`: Custom background color for the progress bar track.
