---
title: Payment Methods Block
description: Dynamic payment methods icons block displaying all store-enabled payment gateways with customizable headings and alignments.
sidebar_position: 8
---

# Payment Methods Block

The **Payment Methods** theme block displays the icons for all payment methods currently enabled in your Shopify store admin.

---

## 🚀 Key Features

- **💳 Dynamic Gateway Sourcing:** Uses `shop.enabled_payment_types` to render the store's configured gateways (Visa, Mastercard, Amex, Apple Pay, Google Pay, PayPal, Shop Pay, Klarna, etc.).
- **🔒 Security Header:** Optional customizable title (e.g. `"Guaranteed Safe Checkout"`) with a lock/shield icon.
- **🎨 Grayscale / Full Color Modes:** Choose between full color badges or subtle monochrome/grayscale icons.
- **📐 Layout & Size Controls:** Configurable alignment (Left, Center, Right) and icon size (Small, Medium, Large).
- **📐 Zero Margin:** Uses `margin: 0;` to integrate seamlessly within parent section gaps.

---

## ⚙️ Block Settings

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `heading` | text | `"Guaranteed Safe Checkout"` | Optional title above icons. |
| `show_lock_icon` | checkbox | `true` | Show security lock icon next to heading. |
| `horizontal_alignment`| select | `Left` (`flex-start`) | Alignment (Left, Center, Right). |
| `icon_size` | select | `Medium` | Small (20px), Medium (24px), Large (30px). |
| `color_mode` | select | `Full color` | Full color or monochrome grayscale. |
| `gap` | range | `8px` | Spacing between icons (4px – 24px). |

---

## 📁 Files
- `blocks/payment-icons.liquid` — Block template and styling.
