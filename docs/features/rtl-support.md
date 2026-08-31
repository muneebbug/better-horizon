---
title: Right-to-Left (RTL) Support
description: Native bidirectional layout support for Arabic, Hebrew, Urdu, and Persian storefronts.
sidebar_position: 10
---

# Right-to-Left (RTL) Support

Better Horizon includes first-class support for Right-to-Left (RTL) languages such as **Arabic (`ar`)**, **Hebrew (`he`)**, **Urdu (`ur`)**, and **Persian (`fa`)**.

---

## 🚀 How It Works

In `layout/theme.liquid`, the theme checks the active locale's ISO code:

```liquid
{%- if localization.language.iso_code == 'ar' or localization.language.iso_code == 'he' or localization.language.iso_code == 'ur' or localization.language.iso_code == 'fa' -%}
  <html class="no-js" lang="{{ request.locale.iso_code }}" dir="rtl">
  {{ 'rtl.css' | asset_url | stylesheet_tag }}
{%- else -%}
  <html class="no-js" lang="{{ request.locale.iso_code }}" dir="ltr">
{%- endif -%}
```

---

## 🎨 Stylesheet Coverage

`assets/rtl.css` mirrors layout directions, navigation chevrons, margin/padding offsets, drawer positions, and form inputs cleanly.

---

## 📁 Files
- `assets/rtl.css` — Core bidirectional stylesheet.
- `layout/theme.liquid` — HTML direction attribute and stylesheet injection.
