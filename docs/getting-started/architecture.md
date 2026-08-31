---
title: Architecture Overview
description: Technical architecture of Better Horizon, Liquid Storefront patterns, Theme Blocks, and Custom Elements.
sidebar_position: 3
---

# Technical Architecture

Better Horizon is built on modern Shopify Liquid Storefront standards.

---

## 🏛️ Core Principles

1. **Theme Blocks (`blocks/*.liquid`):** Reusable, nestable visual components with dedicated schemas.
2. **Liquid Storefronts:** Server-rendered HTML first with progressive enhancement.
3. **Vanilla Web Components:** Custom Elements extending `HTMLElement` (no React, Vue, or heavy libraries required on the storefront).
4. **Scoped Stylesheets:** Scoped CSS within `{% stylesheet %}` or modular snippets to keep bundle size minimal.

---

## 📂 Repository Structure

```
better-horizon/
├── assets/                 # JS Custom Elements, CSS stylesheets, and SVG icons
├── blocks/                 # Native Theme Blocks (e.g. wishlist-button, back-in-stock)
├── config/
│   └── settings_schema.json # Global theme configuration settings
├── docs/                   # Complete documentation markdown files
├── layout/
│   └── theme.liquid        # Global base HTML shell
├── locales/                # Internationalization JSON dictionaries
├── sections/               # Shopify dynamic and static sections
├── snippets/               # Reusable Liquid snippets (modals, drawers, utilities)
└── templates/              # JSON page and product template definitions
```

---

## ⚡ Web Component Lifecycle

All interactive behaviors use native Custom Elements loaded with `type="module"` and `defer`:

```javascript
export class WishlistDrawer extends HTMLElement {
  connectedCallback() {
    this.initEvents();
    this.render();
  }

  disconnectedCallback() {
    this.cleanup();
  }
}

if (!customElements.get('wishlist-drawer')) {
  customElements.define('wishlist-drawer', WishlistDrawer);
}
```
