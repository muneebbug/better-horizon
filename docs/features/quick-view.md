---
title: Quick View & Quick Add
description: Documentation for product card quick preview modals, variant selection, and interactive loading spinners on Quick Add buttons.
sidebar_position: 2
---

# Quick View & Quick Add

Better Horizon enhances the standard product catalog browsing experience with modal previews and responsive button feedback.

---

## ⚡ Quick Add Loading Spinner

When a customer clicks the **"Choose"** button on product cards with variants:
1. The button immediately receives `data-loading="true"` and `disabled = true` to prevent duplicate clicks.
2. The cart icon and text smoothly hide and are replaced by a centered, animated spinning indicator (`.quick-add__spinner`).
3. Once the Quick Add modal finishes rendering and opens (`#openQuickAddModal`), the button resets to its default interactive state.

### Files Involved
- `snippets/quick-add.liquid` — Spinner container and text wrapping.
- `snippets/quick-add-styles.liquid` — CSS rotation keyframes and loading states.
- `assets/quick-add.js` — Async fetch state toggle inside `handleClick()`.

---

## 🔍 Quick View Modal

The **Quick View** modal enables full product detail previews directly from collection grids without leaving the page.

### Features
- **Accessible `<dialog>`:** Native keyboard trapping (`Escape` to close, focus preservation).
- **Responsive Layout:** Adaptive gallery, title, pricing, variant pickers, and buy buttons.
- **Theme Settings Toggle:** Located under **Theme Settings > Product cards > Quick View > Enable Quick View modal**.

### Files Involved
- `blocks/quick-view-button.liquid` — Theme block button placed on product grids.
- `snippets/quick-view-modal.liquid` — Modal dialog container in theme layout.
- `assets/quick-view.js` — Web component engine fetching and injecting product HTML.
