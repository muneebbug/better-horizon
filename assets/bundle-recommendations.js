/**
 * Better Horizon — Frequently Bought Together / Bundle Recommendations
 * Fetches native Shopify recommendations or renders curated metafield items,
 * calculates bundle totals, and adds all selected items to cart.
 */

import { updateCartState } from './wishlist.js';

export class BundleRecommendations extends HTMLElement {
  connectedCallback() {
    this.productId = this.dataset.productId;
    this.sectionId = this.dataset.sectionId;
    this.limit = parseInt(this.dataset.limit || '2', 10);
    this.totalPriceEl = this.querySelector('[data-bundle-total]');
    this.addButton = this.querySelector('[data-bundle-add-button]');
    this.itemsContainer = this.querySelector('[data-bundle-items]');

    this.initCheckboxes();
    this.updateTotal();

    if (this.addButton) {
      this.addButton.addEventListener('click', this.handleAddBundle.bind(this));
    }
  }

  initCheckboxes() {
    const checkboxes = this.querySelectorAll('input[type="checkbox"][data-variant-id]');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => this.updateTotal());
    });
  }

  updateTotal() {
    const checked = Array.from(this.querySelectorAll('input[type="checkbox"][data-variant-id]:checked'));
    let totalCents = 0;

    checked.forEach(cb => {
      const price = parseInt(cb.dataset.priceCents || '0', 10);
      totalCents += price;
    });

    if (this.totalPriceEl) {
      const formatted = (totalCents / 100).toFixed(2);
      const currencySymbol = this.dataset.currencySymbol || '$';
      this.totalPriceEl.textContent = `${currencySymbol}${formatted}`;
    }

    if (this.addButton) {
      this.addButton.disabled = checked.length === 0;
    }
  }

  async handleAddBundle(e) {
    e.preventDefault();
    const checked = Array.from(this.querySelectorAll('input[type="checkbox"][data-variant-id]:checked'));
    if (checked.length === 0) return;

    if (this.addButton) {
      this.addButton.disabled = true;
      this.addButton.setAttribute('aria-busy', 'true');
      this.addButton.textContent = 'Adding bundle...';
    }

    const items = checked.map(cb => ({
      id: parseInt(cb.dataset.variantId, 10),
      quantity: 1
    }));

    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      if (res.ok) {
        await updateCartState();
        const cartDrawer = document.querySelector('#cart-drawer');
        if (cartDrawer && typeof cartDrawer.open === 'function') {
          cartDrawer.open();
        }
        if (this.addButton) this.addButton.textContent = 'Added to Cart!';
        setTimeout(() => {
          if (this.addButton) this.addButton.textContent = this.dataset.buttonText || 'Add Bundle to Cart';
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding bundle to cart', err);
    } finally {
      if (this.addButton) {
        this.addButton.disabled = false;
        this.addButton.removeAttribute('aria-busy');
      }
    }
  }
}

if (!customElements.get('bundle-recommendations')) {
  customElements.define('bundle-recommendations', BundleRecommendations);
}
