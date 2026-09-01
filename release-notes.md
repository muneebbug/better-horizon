# Release Notes — Better Horizon 1.0.0

Better Horizon 1.0.0 is the first official release of Better Horizon, built on Shopify Horizon 4.1.5. This release adds built-in storefront features, customizable theme blocks, Right-to-Left (RTL) language support, and full WCAG 2.2 AA accessibility.

## What's New

### New Theme Blocks
* **Frequently Bought Together**: Bundle complementary products on product pages with automatic discounts, variant pickers, and one-click add to cart.
* **Estimated Delivery Date**: Show estimated delivery dates on product and cart pages based on handling times, transit days, daily cutoff hours, and postal code lookup.
* **Cart Upsell & Recommendations**: Show product recommendations in the cart drawer and on the cart page with list, slider, and grid layouts.
* **Back in Stock Alerts**: Collect customer emails on sold-out products and variants with restock notification tags.
* **Trust Badges & Guarantees**: Highlight shipping, security, and return guarantees with built-in icons or custom image uploads.
* **Free Shipping Bar**: Show a progress bar toward free shipping thresholds in the cart drawer and cart page.
* **Low Stock Indicator**: Display live inventory counts to inform shoppers when stock is running low.
* **Countdown Timer**: Add flash sale countdown timers with custom end dates and unit labels.
* **Size Chart Guide**: Add an accessible size guide modal that pulls measurement tables and diagrams from a selected Shopify Page or the product's custom size chart metafield (`custom.size_chart`).
* **Gift Wrap**: Let customers add gift wrapping and a personalized message from the product page.
* **Custom Forms**: Build contact and inquiry forms using modular input, textarea, select, checkbox, and radio blocks.

### Storefront Features
* **Wishlist Drawer**: Client-side wishlist with a slide-out drawer, heart buttons, and item counter.
* **Quick View**: Preview product details and add items to cart directly from catalog cards.
* **Market Suggestion Banner**: Automatic banner suggesting local store and currency settings for international visitors.
* **RTL Language Support**: Full right-to-left layout and navigation support for Arabic, Hebrew, Urdu, and Persian.

### Design & Customization
* Added unified container styles (`Default`, `Minimal`, `Outline`, `Custom`) across all custom blocks.
* Added unified button presets (`Primary`, `Secondary`, `Outline`, `Custom`) with color and border radius controls.
* Added dedicated Cart Drawer settings in Theme Settings for layout, item limits, and colors.
* Strict WCAG 2.2 AA compliance with keyboard navigation, visible focus rings, and accessible touch targets.

### Upstream Horizon 4.1.5 Improvements
* Fixed rounded corner blocks being forced to equal heights.
* Fixed the page jumping to the top when closing the cart drawer on mobile.
* Fixed duplicate country listings in the country selector.
* Fixed desktop header dropdown menus opening blank during initial page load.
* Improved iPhone display in landscape mode around the notch and home indicator.
* Fixed cart item quantity inputs resetting during mid-edit refreshes.
* General rendering performance and script loading optimizations.
