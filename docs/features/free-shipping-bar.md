---
title: Free Shipping Progress Bar
description: Dynamic threshold progress bar in the cart drawer and cart page that calculates remaining amount live against cart subtotal.
sidebar_position: 8
---

# Free Shipping Progress Bar

The **Free Shipping Progress Bar** displays real-time progress towards qualifying for free shipping. It works in the cart drawer and as a standalone Theme Block on the cart page or within sections.

---

## Key Features

- **Live Cart Calculation:** Updates immediately as shoppers add items, change quantities, or remove items.
- **Cart Drawer & Cart Page Block:** Available at the top of the cart drawer and as a placeable theme block on the cart page.
- **Accurate Currency Formatting:** Uses the store's native money format with proper decimal places and separators.
- **Accessible Progress:** Uses native ARIA progressbar roles and live regions for screen readers.
- **Goal State:** Automatically displays a success message once the threshold is reached.
- **Primary Currency Scoped:** Displays when customers shop in your primary store currency where your threshold is set.
- **RTL Ready:** Progress fills and text aligns cleanly in Right-to-Left languages.

---

## Global Theme Settings

Global settings are configured in **Theme Settings > Cart**:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enable_free_shipping_bar` | checkbox | `true` | Turn the free shipping progress bar on or off in the cart drawer. |
| `free_shipping_alignment` | select | `left` | Default alignment of the progress text (`left`, `center`, `right`). |
| `free_shipping_threshold` | number | `50` | Minimum cart subtotal required to get free shipping (in store currency, e.g. `50`). |
| `free_shipping_message` | text | `"Spend [amount] more for free shipping"` | Text shown before reaching the goal. `[amount]` is replaced with the remaining balance. |
| `free_shipping_success_message` | text | `"You've unlocked free shipping!"` | Message shown once the customer reaches or exceeds the threshold. |

---

## Cart Page Block Settings

When placed as a block on the cart page or sections, you can customize block-level styles or inherit global defaults:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `alignment` | select | `left` | Text alignment (`left`, `center`, `right`). |
| `threshold` | number | `0` | Optional override for the threshold. Leave blank to use the global setting. |
| `message` | text | `""` | Optional override for the progress message. |
| `success_message` | text | `""` | Optional override for the unlocked message. |
| `padding-block-start` | range | `12px` | Top padding. |
| `padding-block-end` | range | `12px` | Bottom padding. |

---

## Files

- `blocks/free-shipping-bar.liquid` — Placeable theme block for the cart page and sections.
- `snippets/free-shipping-bar.liquid` — Core markup and styling.
- `assets/free-shipping-bar.js` — Live progress calculation and cart event engine.
- `snippets/cart-drawer.liquid` — Drawer integration.
- `templates/cart.json` — Cart template block configuration.
