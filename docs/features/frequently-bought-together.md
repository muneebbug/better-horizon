---
title: Frequently Bought Together
description: Product cross-sell bundle recommendations with checkbox selectors and multi-item one-click add to cart.
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

- [`blocks/frequently-bought-together.liquid`](file:///c:/Users/realm/Desktop/better-horizon/blocks/frequently-bought-together.liquid) — Block template, Theme Editor schema, and scoped stylesheet.
- [`assets/bundle-recommendations.js`](file:///c:/Users/realm/Desktop/better-horizon/assets/bundle-recommendations.js) — Price calculation and multi-item cart dispatch custom element.

