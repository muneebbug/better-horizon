---
title: Dynamic Size Guide Modal
description: Documentation for Better Horizon's dynamic size guide modal sourcing rich content from Shopify Pages or product metafields.
sidebar_position: 7
---

# Dynamic Size Guide Modal

The **Size Guide** theme block provides an accessible popup modal displaying measurement tables and sizing instructions.

---

## 🚀 Key Features

- **🚫 Zero Hardcoded Mock Data:** The button and modal **only render** when valid content exists for the current product or selected page.
- **📑 Flexible Sourcing Modes:**
  1. **Auto (Recommended):** Uses `custom.size_chart` product metafield first; falls back to a global page if configured.
  2. **Shopify Page:** Uses a dedicated Shopify Page containing rich text, images, diagrams, or HTML tables.
  3. **Product Metafield:** Reads `product.metafields.custom.size_chart` (Rich text, HTML, or page reference).
- **♿ Accessible Dialog:** Built with native `<dialog>` element, backdrop filter, focus management, and `Escape` key dismissal.

---

## ⚙️ Block Settings

| Setting | Type | Options / Default | Description |
| :--- | :--- | :--- | :--- |
| `button_label` | text | `"Size Guide"` | Label on the trigger button. |
| `heading` | text | `"Size & Measurement Guide"` | Title at the top of the modal dialog. |
| `description` | text | `"Refer to the measurements below to find your perfect fit."` | Subtitle description. |
| `content_source` | select | `auto` / `page` / `metafield` | Sourcing strategy. |
| `page` | page | `null` | Shopify Page picker selector. |

---

## 🛠️ Metafield Setup (Optional)

1. Navigate to **Shopify Admin > Settings > Custom data > Products**.
2. Click **Add definition**:
   - **Name:** Size Chart
   - **Namespace and key:** `custom.size_chart`
   - **Type:** Rich Text, Multi-line text, or Page Reference
3. Fill in product-specific measurements in the product admin.

---

## 📁 Files
- `blocks/size-chart.liquid` — Block template and modal stylesheet.
