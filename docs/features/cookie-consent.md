---
title: Cookie Consent & Privacy Banner
description: GDPR and CCPA compliant cookie banner integrating with Shopify Customer Privacy API and Google Consent Mode v2.
sidebar_position: 8
---

# Cookie Consent & Privacy Banner

Better Horizon includes a built-in **Privacy & Cookie Consent Banner** compatible with global privacy laws (GDPR, CCPA, ePrivacy) without recurring app fees.

---

## 🚀 Key Features

- **🌐 Google Consent Mode v2:** Automatically updates consent states (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`).
- **🛡️ Shopify Customer Privacy API:** Dispatches tracking preferences to `window.Shopify.customerPrivacy`.
- **⚙️ Granular Preferences Modal:** Allows visitors to toggle Analytics vs. Marketing cookies individually while keeping Necessary cookies active.
- **🎨 Theme Styling:** Fully matches theme fonts, translucent borders, and palette tokens.

---

## 📁 Files
- `snippets/cookie-consent.liquid` — Banner and preferences modal markup.
- `assets/cookie-consent.js` — Client engine, storage management, and consent dispatch.
