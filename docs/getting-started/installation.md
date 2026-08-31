---
title: Installation & Setup
description: How to install, run, and deploy Better Horizon using Shopify CLI or manual ZIP upload.
sidebar_position: 1
---

# Installation & Setup

You can run **Better Horizon** locally for development using Shopify CLI or upload it directly to any Shopify store.

---

## Live Demo

You can test the theme before installing:
- **Link:** [https://better-horizon-theme.myshopify.com/](https://better-horizon-theme.myshopify.com/)
- **Password:** `1`

---

## 🛠️ Local Development with Shopify CLI

### Prerequisites
- Node.js (v18.0.0 or higher)
- Shopify CLI (`npm install -g @shopify/cli @shopify/theme`)
- Active Shopify development or store account

### 1. Clone the Repository
```bash
git clone https://github.com/muneebbug/better-horizon.git
cd better-horizon
```

### 2. Start Theme Development Server
Connect and preview live theme changes against your store:
```bash
shopify theme dev --store your-store-name.myshopify.com
```

This will launch a local development server with hot reload:
- Local preview: `http://127.0.0.1:9292`
- Theme Editor preview: Output link provided in terminal

---

## 🧪 Validating Code Quality

Better Horizon adheres to strict code standards. Run `shopify theme check` to inspect Liquid templates, schemas, and assets:

```bash
shopify theme check
```

---

## 📦 Production Deployment

### Option A: Shopify CLI Push
To push changes directly to your live store or an unpublished development theme:
```bash
shopify theme push --store your-store-name.myshopify.com --unpublished
```

### Option B: ZIP Upload
1. Package the repository root (excluding `.git/`, `node_modules/`, and `.github/`):
   ```bash
   shopify theme package
   ```
2. Navigate to your **Shopify Admin > Online Store > Themes**.
3. Click **Add theme > Upload zip file**.
4. Click **Publish** once tested.
