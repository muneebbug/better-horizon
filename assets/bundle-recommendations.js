/**
 * Better Horizon — Frequently Bought Together / Bundle Recommendations
 * Fetches native Shopify recommendations or renders curated metafield items,
 * calculates bundle totals, and adds all selected items to cart.
 *
 * @module bundle-recommendations
 */

import { updateCartState } from './wishlist.js';

/**
 * @typedef {object} CartItemPayload
 * @property {number} id - The variant ID to add to cart.
 * @property {number} quantity - The quantity of the variant.
 */

/**
 * Custom element managing the Frequently Bought Together bundle recommendations,
 * live price aggregation, and multi-item cart dispatch.
 *
 * @extends {HTMLElement}
 */
export class BundleRecommendations extends HTMLElement {
  /** @type {string | undefined} */
  productId;

  /** @type {string | undefined} */
  sectionId;

  /** @type {number} */
  limit;

  /** @type {HTMLElement | null} */
  totalPriceEl;

  /** @type {HTMLButtonElement | null} */
  addButton;

  /** @type {HTMLElement | null} */
  itemsContainer;

  /**
   * Initializes the bundle recommendations element when attached to the DOM.
   * @returns {void}
   */
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

  /**
   * Attaches change event listeners to all variant selection checkboxes.
   * @returns {void}
   */
  initCheckboxes() {
    /** @type {NodeListOf<HTMLInputElement>} */
    const checkboxes = this.querySelectorAll('input[type="checkbox"][data-variant-id]');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => this.updateTotal());
    });
  }

  /**
   * Computes the sum of all currently checked bundle items and updates the formatted total UI.
   * @returns {void}
   */
  updateTotal() {
    /** @type {HTMLInputElement[]} */
    const checked = Array.from(this.querySelectorAll('input[type="checkbox"][data-variant-id]:checked'));
    let totalCents = 0;

    checked.forEach((checkbox) => {
      const price = parseInt(checkbox.dataset.priceCents || '0', 10);
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

  /**
   * Handles clicking the bundle add-to-cart button.
   * Dispatches all selected variants to `/cart/add.js` in a single request.
   *
   * @param {MouseEvent} event - The button click event.
   * @returns {Promise<void>}
   */
  async handleAddBundle(event) {
    event.preventDefault();
    /** @type {HTMLInputElement[]} */
    const checked = Array.from(this.querySelectorAll('input[type="checkbox"][data-variant-id]:checked'));
    if (checked.length === 0) return;

    if (this.addButton) {
      this.addButton.disabled = true;
      this.addButton.setAttribute('aria-busy', 'true');
      this.addButton.textContent = 'Adding bundle...';
    }

    /** @type {CartItemPayload[]} */
    const items = checked.map((checkbox) => ({
      id: parseInt(checkbox.dataset.variantId || '0', 10),
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
        /** @type {HTMLElement & { open?: () => void } | null} */
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

