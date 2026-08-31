---
title: Wishlist System
description: Complete guide to Better Horizon's built-in wishlist drawer, header counter bubble, product buttons, and direct cart synchronization.
sidebar_position: 1
---

# Wishlist System

Better Horizon includes a lightweight, client-side **Wishlist System** requiring zero external apps, third-party subscriptions, or database setup.

---

## 🚀 Key Features

- **❤️ Header Action Icon & Counter Bubble:** Matches the native Cart bubble 1:1, including item count badge and SVG donut mask.
- **📱 Slide-out Drawer:** Uses the theme's native `<theme-drawer>` container (`#wishlist-drawer`) with isolated styling classes (`.wishlist-drawer__*`).
- **🛒 Direct Add to Cart from Wishlist:** Adds the item to the cart in the background, gives instant `"Adding..."` → `"Added! ✓"` feedback, and removes the item from the wishlist after 600ms while keeping the wishlist drawer open.
- **🔒 Persistent Storage:** Saves wishlist items to browser `localStorage` under `better_horizon_wishlist`.

---

## 🧩 Components & Files

| Component | File Path | Description |
| :--- | :--- | :--- |
| **Drawer Markup** | `snippets/wishlist-drawer.liquid` | Dialog structure and slide-out panel markup. |
| **Header Icon** | `snippets/header-actions.liquid` | Heart icon trigger with `.cart-bubble` count. |
| **Heart SVG** | `assets/icon-heart.svg` | 20x20 SVG vector matching theme icon stroke. |
| **Product Button** | `blocks/wishlist-button.liquid` | Theme block for product pages and quick views. |
| **Client Engine** | `assets/wishlist.js` | State management, storage, drawer rendering, and cart dispatch. |

---

## ⚙️ Configuration & Settings

To toggle the Wishlist icon in the theme header:
1. Open **Shopify Theme Editor (`Customize`)**.
2. Navigate to **Theme Settings > Wishlist**.
3. Check/uncheck **Enable Wishlist in header**.

---

## 💻 Developer Usage

### 1. Adding a Wishlist Button to any Product Card or Section:
```liquid
{% render 'wishlist-button', product: product %}
```

### 2. Opening the Wishlist Drawer via JavaScript:
```javascript
import { toggleWishlistDrawer } from 'wishlist.js';

// Open wishlist drawer
toggleWishlistDrawer(true);
```
