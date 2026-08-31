---
title: Cart Drawer Upsell & Recommendations
description: Smart product upsells in the cart drawer and on the cart page powered by product metafields and Shopify recommendations.
sidebar_position: 9
---

# Cart Drawer Upsell & Recommendations

The **Cart Upsell** feature displays smart, high-converting product recommendations directly inside the cart drawer and on the cart page.

It inspects all items in the cart to pull complementary products from the `custom.bundle_products` product metafield, and automatically falls back to Shopify's native recommendation engine (`/recommendations/products.json`).

---

## Key Features

- **Cart-Wide Recommendation Sourcing:** Continuously analyzes all items currently in the cart to find relevant cross-sells.
- **Metafield-First with Native Fallback:** Uses `custom.bundle_products` (the same metafield as Frequently Bought Together) and seamlessly falls back to Shopify's recommendation API when metafields are not populated.
- **Automatic Cart Deduplication:** Excludes any products that the customer has already added to their cart.
- **Quick-Add Pill Button:** Interactive quick-add button featuring the theme's native `icon-add-to-cart.svg`, global button styling inheritance, and custom color support.
- **Live Section Morphing & Cart Persistence:** Automatically morphs cart sections in real-time when items are added, removed, or quantities change without full page reloads or losing recommendation slots.
- **Flexible Layouts:** Supports **List** (compact horizontal rows), **2-Column Grid**, and **Horizontal Carousel** with slide navigation controls.
- **Full Typography Control:** Matches the theme's heading preset typography system (`h1` through `h6`, `paragraph`) with text alignment controls.
- **RTL Ready:** Layouts, carousel navigation, and alignments automatically adapt for Arabic, Hebrew, and Urdu.

---

## Settings

### Theme Settings (Cart Drawer)
Configured under **Theme Settings > Cart**:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enable_cart_drawer_upsell` | checkbox | `true` | Turn upsell recommendations on or off in the cart drawer. |
| `cart_drawer_upsell_heading` | text | `"You might also like"` | Header title shown above the recommendations in the drawer. |
| `cart_drawer_upsell_layout` | select | `list` | Layout style (`list`, `grid_2` [2-column grid], or `slider` [horizontal carousel]). |

### Theme Block Settings (Cart Page & Sections)
Configured on the **Cart upsell** block (`blocks/cart-upsell.liquid`):

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `heading` | inline_richtext | `"Recommended for you"` | Section title text. |
| `type_preset` | select | `h4` | Typography style preset (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `paragraph`). |
| `alignment` | text_alignment | `left` | Heading alignment (`left`, `center`, `right`). |
| `layout` | select | `list` | Layout style (`list`, `grid_2` [2-column grid], or `slider` [horizontal carousel]). |
| `products_to_show` | range | `4` | Maximum number of recommended items to show (2 to 8). |
| `style_class` | select | `button-secondary` | Button style (`button` [Primary], `button-secondary` [Secondary], `button-custom` [Custom]). |
| `custom_button_background` | color | — | Background color when button style is set to Custom. |
| `custom_button_text` | color | — | Text and icon color when button style is set to Custom. |
| `custom_button_border` | color | — | Border color when button style is set to Custom. |
| `padding-block-start` | range | `16px` | Top padding. |
| `padding-block-end` | range | `16px` | Bottom padding. |
| `padding-inline-start` | range | `0px` | Left/Inline start padding. |
| `padding-inline-end` | range | `0px` | Right/Inline end padding. |

---

## Files

- `snippets/cart-upsell.liquid` — Core markup, styles, quick-add pill buttons, and typography presets for drawer and page contexts.
- `assets/cart-upsell.js` — Client-side Web Component managing multi-item recommendation sourcing, live section morphing, carousel navigation, and `/cart/add.js` dispatching.
- `blocks/cart-upsell.liquid` — Placeable theme block with typography, button style, and layout schema controls.
- `snippets/cart-drawer.liquid` — Drawer slot integration.
- `blocks/_cart-summary.liquid` — Summary sidebar integration on cart page.
- `templates/cart.json` — Cart page template configuration.
