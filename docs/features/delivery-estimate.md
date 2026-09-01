---
title: Estimated Delivery Date & Shipping Estimator
description: Native zero-app shipping delivery date estimation with handling/transit rules, live cutoff countdowns, and cross-page ZIP code calculation for PDP and Cart.
sidebar_position: 15
---

# Estimated Delivery Date & Shipping Estimator

The **Estimated Delivery Date & Shipping Estimator** provides customers with real-time, accurate delivery date estimates, order dispatch countdowns, and interactive postal code lookups across the Product Details Page (PDP), Quick View modals, Cart Drawer, and Cart Page — with **zero recurring app fees**.

---

## Key Features

- **Accurate Business Day Math:**
  - Calculates dynamic delivery date ranges (e.g. `Thursday, Oct 12 – Monday, Oct 16`) from configurable handling days + transit days.
  - Automatically skips non-working days (weekends: Saturday & Sunday).
  - Evaluates daily order cutoff hour (e.g. 2:00 PM / 14:00) with a live ticking countdown timer (*"Order within 3h 42m for dispatch today"*).
- **Interactive Postal Code / ZIP Lookup:**
  - Customers can enter their postal code to calculate exact delivery windows and carrier rates.
  - Remembers entered ZIP codes in `localStorage` across product pages, cart drawer, and cart page.
  - Synchronizes across multiple components on the page in real-time.
- **Shopify Ajax Shipping Rates Integration:**
  - When items are in the cart, it queries Shopify's Ajax Cart Shipping Rates API (`/cart/shipping_rates.json`) to display real carrier quotes.
- **Visual Styles & Custom Icons:**
  - Card style options: `Default card`, `Minimal (borderless)`, `Outline only`.
  - Icon selection: `Delivery truck`, `Airplane / Express`, `Package box`, `Calendar date`, `Clock`.
  - Custom color controls for card background, border, icon, heading, delivery dates highlight, and cutoff countdown text.
- **WCAG 2.2 AA Accessible:**
  - Built with polite ARIA live regions, semantic inputs, full keyboard accessibility, and high-contrast focus rings.

---

## Configuration Settings

### Product Theme Block (`blocks/delivery-estimate.liquid`)

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `heading` | text | `"Estimated delivery"` | Custom title displayed above the date estimate. |
| `min_handling_days` | range | `1` | Minimum days required to process/pack orders (0–7). |
| `max_handling_days` | range | `2` | Maximum days required to process/pack orders (0–14). |
| `min_transit_days` | range | `2` | Minimum carrier transit days (1–14). |
| `max_transit_days` | range | `4` | Maximum carrier transit days (1–30). |
| `cutoff_hour` | range | `14` | Daily cutoff hour (in 24h format, e.g. 14 for 2:00 PM). |
| `exclude_weekends` | checkbox | `true` | Exclude Saturdays and Sundays from delivery estimates. |
| `show_countdown` | checkbox | `true` | Show real-time order cutoff countdown timer. |
| `show_zip_estimator` | checkbox | `true` | Enable ZIP / postal code lookup field. |
| `card_style` | select | `default` | Style preset (`default`, `minimal`, `outline`, `custom`). |
| `background_color` | color | `""` | Custom card background color (visible when `custom`). |
| `border_color` | color | `""` | Custom card border color (visible when `custom`). |
| `border_width` | range | `1` | Card border width (0–4px, visible when `custom`). |
| `border_radius` | range | `8` | Card corner radius (0–24px, visible when `custom`). |
| `show_icon` | checkbox | `true` | Toggle delivery icon visibility. |
| `icon_type` | select | `shipping` | Choose from `shipping`, `airplane`, `box`, `calendar`, `clock`. |
| `icon_size` | range | `20` | Icon size (16–32px). |
| `icon_color` | color | `""` | Custom icon color. |
| `heading_color` | color | `""` | Custom heading text color. |
| `dates_color` | color | `""` | Custom delivery date highlight color. |
| `countdown_color` | color | `""` | Custom countdown timer text color. |

### Global Cart Settings (`config/settings_schema.json`)

Configure default cart estimates under **Theme Settings > Cart > Estimated delivery date**:
- **Enable estimated delivery date in cart:** Toggle globally for Cart Drawer and Cart Page.
- Global handling time, transit time, and cutoff hour defaults.

---

## Files

- `assets/delivery-estimate.js` — Custom Web Component (`<delivery-estimate>`) handling date math, countdown timers, and persistent storage.
- `snippets/delivery-estimate.liquid` — Responsive UI snippet for PDP, cart drawer, and cart page.
- `blocks/delivery-estimate.liquid` — Placeable PDP theme block.
- `locales/en.default.json` (and 33 locale files) — Multilingual translation keys.
