---
title: Cart Drawer Upsell & Recommendations
description: Smart product upsells in the cart drawer and on the cart page powered by product metafields and Shopify recommendations with complete styling controls.
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
- **Clean Variant Dropdowns:** Compact, beautifully styled variant dropdowns that fit seamlessly inside each recommendation card without awkward wrapping.
- **Quick-Add Pill Button:** Interactive quick-add button featuring the theme's native `icon-add-to-cart.svg`, global button styling inheritance, and custom color support.
- **Live Section Morphing & Cart Persistence:** Automatically morphs cart sections in real-time when items are added, removed, or quantities change without full page reloads or losing recommendation slots.
- **Flexible Layouts:** Supports **List** (compact vertical rows), **Horizontal Carousel** with slide navigation controls, and **2-Column Grid**.
- **Full Styling & Color Control:** Container styles (`Default card`, `Minimal`, `Outline only`, `Custom colors`), button styles (`Secondary`, `Primary`, `Outline`, `Custom`), image sizing, and custom colors.
- **RTL Ready:** Layouts, carousel navigation, and alignments automatically adapt for Arabic, Hebrew, and Urdu.

---

## Settings

### Theme Settings (Cart Drawer)
Configured under **Theme Settings > Cart**:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enable_cart_drawer_upsell` | checkbox | `true` | Turn upsell recommendations on or off in the cart drawer. |
| `cart_drawer_upsell_heading` | text | `"You might also like"` | Header title shown above the recommendations in the drawer. |
| `cart_drawer_upsell_layout` | select | `list` | Layout style (`list`, `slider`, `grid_2`). |

### Theme Block Settings (Cart Page & Sections)
Configured on the **Cart upsell** block (`blocks/cart-upsell.liquid`):

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `heading` | inline_richtext | `"Recommended for you"` | Section title text. |
| `layout` | select | `slider` | Layout style (`list`, `slider`, `grid_2`). |
| `products_to_show` | range | `4` | Maximum number of recommended items to show (2 to 8). |
| `image_size` | range | `52` | Product thumbnail size (40–80px). |
| `image_border_radius` | range | `6` | Product thumbnail corner radius (0–16px). |
| `gap` | range | `10` | Spacing between cards (6–24px). |
| `card_style` | select | `default` | Style preset (`default`, `minimal`, `outline`, `custom`). |
| `background_color` | color | `""` | Container background (visible when `custom`). |
| `border_color` | color | `""` | Container border (visible when `custom`). |
| `border_width` | range | `1` | Container border width (0–4px, visible when `custom`). |
| `border_radius` | range | `8` | Container corner radius (0–24px, visible when `custom`). |
| `heading_color` | color | `""` | Heading text color. |
| `product_title_color` | color | `""` | Product title text color. |
| `price_color` | color | `""` | Price text color. |
| `button_style` | select | `secondary` | Button preset (`secondary`, `primary`, `outline`, `custom`). |
| `button_background_color` | color | `""` | Button background (visible when `custom`). |
| `button_text_color` | color | `""` | Button text color (visible when `custom`). |
| `button_border_color` | color | `""` | Button border color (visible when `custom`). |
| `button_border_radius` | range | `8` | Button corner radius (0–24px, visible when `custom`). |
| `type_preset` | select | `h4` | Typography style preset (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `paragraph`). |
| `alignment` | text_alignment | `left` | Heading alignment (`left`, `center`, `right`). |

---

## Files

- `snippets/cart-upsell.liquid` — Core markup, styles, quick-add pill buttons, and typography presets for drawer and page contexts.
- `assets/cart-upsell.js` — Client-side Web Component managing multi-item recommendation sourcing, live section morphing, carousel navigation, and `/cart/add.js` dispatching.
- `blocks/cart-upsell.liquid` — Placeable theme block with typography, button style, and layout schema controls.
- `snippets/cart-drawer.liquid` — Drawer slot integration.
- `templates/cart.json` — Cart page template configuration.
