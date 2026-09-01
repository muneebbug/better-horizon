---
title: Frequently Bought Together
description: Product cross-sell bundle recommendations with checkbox selectors, clean list layout, custom styling, and multi-item one-click add to cart.
sidebar_position: 4
---

# Frequently Bought Together (Bundles)

The **Frequently Bought Together** block increases Average Order Value (AOV) by allowing customers to bundle complementary items in a single click without installing paid third-party apps.

---

## 🚀 Key Features

- **🎯 3-Tier Product Sourcing:**
  1. **Curated Metafield (Highest Priority):** Reads product list from `product.metafields.custom.bundle_products`.
  2. **Theme Editor Fallback:** Uses default products selected in the block settings when no metafield is configured.
  3. **Collection Fallback:** Automatically selects complementary products from the same collection.
- **📐 Clean & Polished List Layout:**
  - High-converting vertical product rows with checkboxes, thumbnails, product titles, and prices.
  - Aligned footer with live Total Price on the left and CTA button on the right.
- **🎨 Complete Styling & Color Control:**
  - Custom container styles (`Default card`, `Minimal borderless`, `Outline only`, `Custom colors`).
  - Custom background color, border color, border width, and corner radius.
  - Color pickers for heading, product title, individual price, and total bundle price.
  - Button styling presets (`Primary`, `Secondary`, `Outline`, `Custom`) and conditional custom button color overrides.
- **✅ Interactive Checkbox Selection:** Customers can check/uncheck recommended items with instant price recalculation.
- **💰 Live Price Summation:** Total bundle price dynamically updates in real-time.
- **🛒 Multi-Item Cart Dispatch:** Adds all checked items concurrently via Shopify's `/cart/add.js` API and refreshes the cart drawer.
- **♿ WCAG 2.2 AA Compliant:** Accessible checkbox labelling, keyboard navigable, and screen reader announcements.

---

## ⚙️ Block Settings (Theme Editor)

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `heading` | text | `"Frequently Bought Together"` | Heading displayed above the bundle items. |
| `button_label` | text | `"Add Bundle to Cart"` | Primary CTA button label. |
| `image_size` | range | `64` | Thumbnail size (48–96px). |
| `image_border_radius` | range | `6` | Thumbnail corner radius (0–16px). |
| `gap` | range | `12` | Spacing between bundle items (8–24px). |
| `card_style` | select | `default` | Container style (`default`, `minimal`, `outline`, `custom`). |
| `background_color` | color | `""` | Container background color (visible when `custom`). |
| `border_color` | color | `""` | Container border color (visible when `custom`). |
| `border_width` | range | `1` | Container border width (0–4px, visible when `custom`). |
| `border_radius` | range | `8` | Container corner radius (0–24px, visible when `custom`). |
| `heading_color` | color | `""` | Heading text color. |
| `product_title_color` | color | `""` | Product title text color. |
| `price_color` | color | `""` | Item price text color. |
| `total_price_color` | color | `""` | Total bundle price text color. |
| `button_style` | select | `primary` | Button style preset (`primary`, `secondary`, `outline`, `custom`). |
| `button_background_color` | color | `""` | Custom button background (visible when `custom`). |
| `button_text_color` | color | `""` | Custom button text color (visible when `custom`). |
| `button_border_color` | color | `""` | Custom button border color (visible when `custom`). |
| `button_border_radius` | range | `8` | Button corner radius (0–24px, visible when `custom`). |
| `products` | product_list | `empty` | Default fallback products to recommend when no product-specific metafield is assigned. |
| `products_to_show` | range (1–4) | `2` | Maximum number of complementary items to display alongside the main product. |

---

## 🛠️ Metafield Setup for Product-Specific Bundles

To curate custom bundles for specific products:

1. Navigate to **Shopify Admin > Settings > Custom data > Products**.
2. Click **Add definition**:
   - **Name:** `Bundle Products`
   - **Namespace and key:** `custom.bundle_products`
   - **Type:** `List of products` (`List of Product`)
3. In your **Shopify Admin > Products**, edit any product and select complementary items in the **Bundle Products** metafield.

---

## 📁 Files

- [`blocks/frequently-bought-together.liquid`](blocks/frequently-bought-together.liquid) — Block template, Theme Editor schema, and scoped stylesheet.
- [`assets/bundle-recommendations.js`](assets/bundle-recommendations.js) — Price calculation and multi-item cart dispatch custom element.
