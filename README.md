# Better Horizon 🚀

An enhanced, open-source Shopify theme built on Shopify's official **Horizon** architecture. **Better Horizon** extends the base theme with native, zero-paid-app merchandising utilities, advanced technical SEO, and strict WCAG 2.2 AA accessibility standards.

---

## 📌 Project Overview

- **Base Theme Foundation:** Shopify Horizon (Fork pinned to commit [`1c479ca`](https://github.com/Shopify/horizon/commit/1c479ca2825f0a2066a935720d6512a659fa257f) / Release v4.1.4).
- **License:** Shopify Theme License (see [`LICENSE.md`](LICENSE.md) — original copyright retained).
- **Distribution Model:** Distributed directly via GitHub for manual installation via Shopify CLI (`shopify theme push`) or Admin ZIP upload. (Not submitted to the Shopify Theme Store).
- **Zero Paid App Dependency:** Everything is built using Shopify native capabilities (Liquid, Web Components, Metafields, Metaobjects, Customer Privacy API, Shopify Flow).

---

## ✨ Features & Enhancements

### 🔍 Technical SEO & Performance (Phase 1)
- **Comprehensive JSON-LD Structured Data:** Full Schema.org support for `WebSite` (with `SearchAction`), `Organization` (with social links), `BreadcrumbList`, rich `Product` (with variant offers, SKU, barcode, availability, reviews), `Article` / `BlogPosting`, and `FAQPage`.
- **Automated Meta Descriptions:** Intelligent fallback meta descriptions generated dynamically from product, article, collection, or page content with HTML stripped.
- **Canonical & Multi-Market Hreflang:** Automatic multi-language and multi-market alternate tags.
- **High-Performance Media Delivery:** High-priority LCP preloading for hero and main product imagery with native lazy-loading for below-the-fold media.
- **Enhanced 404 Experience:** Built-in search input and navigation links.
- **CI Gated Merges:** Automated GitHub Actions running `shopify theme check`.

### 🛒 Native Merchandising Utilities (Phase 2)
- **📌 Native Wishlist System:** Zero-app, `localStorage`-backed toggle button and slide-out wishlist drawer with single-click remove and persistent state across cards and pages.
- **⚡ Quick View Modal:** Dynamic product dialog loaded on demand without leaving collection/catalog pages.
- **🔔 Back-in-Stock Capture:** Customer email capture form on out-of-stock items, connected to Shopify Customer / Shopify Flow notifications.
- **📦 Frequently Bought Together / Bundles:** Automatic bundle recommendations with live total calculation and 1-click batch `/cart/add.js` addition.
- **📏 Dynamic Size Chart:** Accessible modal dialog with semantic measurement tables and custom metaobject support.
- **⏱️ Real Date Countdown Timer:** Promotion timer strictly bound to real timestamps and product metafields (zero fake urgency).

### 🌍 Internationalization, Trust & Privacy (Phase 3)
- **🌐 Geo-based Market Suggestion Banner:** Prompts shoppers from different countries/markets to switch to their regional store for local currency and shipping.
- **🛡️ Native Cookie & Privacy Consent Banner:** Direct integration with Shopify's Customer Privacy API and Google Analytics 4 Consent Mode v2 (zero third-party app cost).
- **🔒 Trust Badges & Guarantee Bar Block:** Composable reassurance block for Free Shipping, 30-Day Guarantees, Secure SSL Checkout, and 24/7 Support.
- **📖 Complete RTL (Right-to-Left) Localization:** Native stylesheet support for Arabic (`ar`), Hebrew (`he`), Persian (`fa`), and Urdu (`ur`) with mirrored layouts, icon rotations, and drawer positions.

---

## 🚀 Getting Started

### Installation via Shopify CLI

1. Clone this repository:
   ```bash
   git clone https://github.com/muneebbug/better-horizon.git
   cd better-horizon
   ```

2. Connect to your Shopify development store:
   ```bash
   shopify theme dev --store <your-store>.myshopify.com
   ```

3. Push the theme to your store:
   ```bash
   shopify theme push --store <your-store>.myshopify.com
   ```

### Installation via Shopify Admin ZIP

1. Download the repository ZIP from GitHub.
2. In your Shopify Admin, navigate to **Online Store > Themes**.
3. Under **Theme library**, click **Add theme > Upload zip file**.

---

## 🔄 Staying in Sync with Upstream Horizon

To pull upstream security patches and fixes without overwriting merchant configurations:

1. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/Shopify/horizon.git
   ```

2. Fetch upstream updates:
   ```bash
   git fetch upstream
   ```

3. Deliberately merge or cherry-pick specific fixes on a dedicated branch:
   ```bash
   git checkout -b update/upstream-sync
   git merge upstream/main
   # Review diff, resolve any conflicts, and run:
   shopify theme check
   ```

---

## 🛠️ Development & Quality Standards

- **Theme Blocks & Liquid:** We follow Shopify's latest Theme Block architecture. See [`.cursor/rules/blocks.mdc`](.cursor/rules/blocks.mdc) and [`.cursor/rules/liquid.mdc`](.cursor/rules/liquid.mdc).
- **Web Components:** Native custom elements extending `Component` / `DeclarativeShadowElement`. See [`.cursor/rules/javascript-standards.mdc`](.cursor/rules/javascript-standards.mdc).
- **Accessibility:** Strict adherence to WCAG 2.2 AA. All interactive elements are keyboard-accessible and screen-reader verified across Shadow DOM boundaries. See [`.cursor/rules/global-accessibility-standards.mdc`](.cursor/rules/global-accessibility-standards.mdc).

---

## 📄 License

This project is licensed under the Shopify Theme License. See [LICENSE.md](LICENSE.md) for full terms.
