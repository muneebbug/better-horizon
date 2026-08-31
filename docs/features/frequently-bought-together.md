---
title: Frequently Bought Together
description: Product cross-sell bundle recommendations with checkbox selectors and multi-item one-click add to cart.
sidebar_position: 4
---

# Frequently Bought Together (Bundles)

The **Frequently Bought Together** block increases Average Order Value (AOV) by allowing customers to bundle complementary items in a single click.

---

## 🚀 Key Features

- **🎯 Smart Product Sourcing:**
  1. **Curated Metafield (Preferred):** Reads product list from `product.metafields.custom.bundle_products`.
  2. **Automated Fallback:** Pulls complementary products from the same collection.
- **✅ Interactive Selection:** Customers can check/uncheck recommended items.
- **💰 Live Price Summation:** Total bundle price dynamically updates in real-time.
- **🛒 Multi-Item Cart Dispatch:** Adds all checked items concurrently via `/cart/add.js` and refreshes the cart bubble and drawer.

---

## ⚙️ Block Settings

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `heading` | text | `"Frequently Bought Together"` | Heading displayed above the bundle items. |
| `button_label` | text | `"Add Bundle to Cart"` | Primary CTA button label. |

---

## 🛠️ Metafield Setup (Optional)

To curate custom bundles per product:
1. Navigate to **Shopify Admin > Settings > Custom data > Products**.
2. Click **Add definition**:
   - **Name:** Bundle Products
   - **Namespace and key:** `custom.bundle_products`
   - **Type:** List of products (`List of Product`)
3. Select complementary items in the product editor.

---

## 📁 Files
- `blocks/frequently-bought-together.liquid` — Block template and scoped stylesheet.
- `assets/bundle-recommendations.js` — Price calculation and multi-item cart dispatch engine.
