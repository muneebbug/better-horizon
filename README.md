# Better Horizon

Better Horizon is a customized version of Shopify's official **Horizon** theme. It adds common store features directly into the theme so you can run your store without installing extra monthly apps.

---

## Live Demo

- **Link:** [https://better-horizon-theme.myshopify.com/](https://better-horizon-theme.myshopify.com/)
- **Password:** `1`

---

## Why Better Horizon?

Most Shopify stores install 5 to 10 apps just to get basic features like a wishlist, size guide, or bundle discounts. These apps often slow down your website and charge monthly fees.

Better Horizon builds these features directly into the theme using clean Liquid and vanilla JavaScript. Everything is fast, lightweight, and accessible.

---

## Built-in Features

- **Custom Form Builder:** Fully modular block-based forms (inputs, textareas, dropdowns with nested options, checkboxes, radio groups) that submit natively through Shopify without third-party form apps.
- **Estimated Delivery Date:** Real-time shipping calculation showing earliest and latest delivery dates, order cut-off countdowns, and optional postal code lookup.
- **Gift Wrap & Message:** Gift packaging option with nested line item pricing and custom gift note handling.
- **Wishlist:** Customers can save items to a wishlist, view them in a slide-out drawer, and add them straight to cart.
- **Quick View:** Lets shoppers preview product details and select variants without leaving the collection page.
- **Back in Stock Alerts:** An email signup form that appears on sold-out variants so customers can be notified when items return.
- **Frequently Bought Together:** Shows product bundles with automatic price calculations and one-click add to cart.
- **Free Shipping Progress Bar:** Shows customers how much more they need to spend to unlock free shipping directly inside the cart drawer.
- **Cart Drawer & Page Upsells:** Recommends complementary products inside the cart drawer and cart page using metafields and Shopify recommendations.
- **Size Guide:** A popup modal that can pull size charts from Shopify pages or product metafields.
- **Countdown Timer:** Displays a clean countdown for sales and limited-time offers.
- **Payment Icons:** Shows your store's accepted payment methods with optional security headings and color settings.
- **Trust Badges:** Highlights shipping terms, return guarantees, and customer support.
- **Variant Image Swatches:** Shows color and variant images as clickable swatches on product pages and product cards.
- **Country Switcher Banner:** Suggests local currency and regional stores to international visitors.
- **Right-to-Left (RTL) Support:** Built-in styling for Arabic, Hebrew, and Urdu languages.
- **Built-in SEO:** Generates structured data (JSON-LD) for Google search results and rich snippets.

---

## Getting Started

### Requirements
- Node.js 22 or higher
- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli)

### Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/muneebbug/better-horizon.git
   cd better-horizon
   ```

2. Start the local preview:
   ```bash
   shopify theme dev --store your-store.myshopify.com
   ```

3. Open the local link in your browser to view your live changes.

### Check Code for Errors

To make sure all Liquid files and schemas are valid:

```bash
shopify theme check
```

---

## Installing on Your Store

### Option 1: Upload a ZIP file
1. Download the repository ZIP file from GitHub.
2. In your Shopify Admin, go to **Online Store > Themes**.
3. Under **Theme library**, click **Add theme > Upload zip file**.
4. Test the theme in preview, then click **Publish**.

### Option 2: Push with Shopify CLI
```bash
shopify theme push --store your-store.myshopify.com --unpublished
```

---

## Documentation

Detailed documentation for each block, setting, and feature is located in the [`docs/`](docs/) folder.

---

## License

This theme is licensed under the Shopify Theme License. See [`LICENSE.md`](LICENSE.md) for details.
