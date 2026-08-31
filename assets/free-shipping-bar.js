/**
 * Better Horizon — Free Shipping Progress Bar
 * Calculates progress against free shipping threshold in the cart drawer and cart page.
 *
 * @module free-shipping-bar
 */

import { formatMoney } from '@theme/money-formatting';
import { StandardEvents } from '@shopify/events';

/**
 * Custom element managing the live free shipping threshold progress in the cart drawer and cart page.
 *
 * @extends {HTMLElement}
 */
export class FreeShippingBar extends HTMLElement {
  /** @type {number} */
  thresholdCents = 0;

  /** @type {string} */
  moneyFormat = '{{amount}}';

  /** @type {string} */
  currency = 'USD';

  /** @type {string} */
  messageTemplate = 'Spend [amount] more for free shipping';

  /** @type {string} */
  successMessage = "You've unlocked free shipping!";

  /** @type {HTMLElement | null} */
  progressFill = null;

  /** @type {HTMLElement | null} */
  messageEl = null;

  /** @type {HTMLElement | null} */
  trackEl = null;

  /**
   * Initializes references and listens to cart updates.
   * @returns {void}
   */
  connectedCallback() {
    this.thresholdCents = parseInt(this.dataset.thresholdCents || '5000', 10);
    this.moneyFormat = this.dataset.moneyFormat || '{{amount}}';
    this.currency = this.dataset.currency || 'USD';
    this.messageTemplate = this.dataset.message || 'Spend [amount] more for free shipping';
    this.successMessage = this.dataset.successMessage || "You've unlocked free shipping!";

    this.progressFill = this.querySelector('[data-progress-fill]');
    this.messageEl = this.querySelector('[data-message-el]');
    this.trackEl = this.querySelector('[role="progressbar"]');

    const initialTotal = parseInt(this.dataset.cartTotal || '0', 10);
    if (initialTotal <= 0 && !window.Shopify?.designMode) {
      this.#hideBar();
    } else {
      this.updateProgress(initialTotal);
    }

    document.addEventListener(StandardEvents.cartLinesUpdate, this.#handleCartLinesUpdate);
    document.addEventListener('cart:update', this.#handleCartUpdate);
  }

  /**
   * Cleans up event listeners when removed from DOM.
   * @returns {void}
   */
  disconnectedCallback() {
    document.removeEventListener(StandardEvents.cartLinesUpdate, this.#handleCartLinesUpdate);
    document.removeEventListener('cart:update', this.#handleCartUpdate);
  }

  /**
   * Hides the free shipping bar and its parent block wrapper when cart is empty.
   * @returns {void}
   */
  #hideBar() {
    this.hidden = true;
    this.style.display = 'none';
    const blockWrapper = this.closest('.free-shipping-block');
    if (blockWrapper) {
      blockWrapper.hidden = true;
      blockWrapper.style.display = 'none';
    }
  }

  /**
   * Shows the free shipping bar and its parent block wrapper when cart has items.
   * @returns {void}
   */
  #showBar() {
    this.hidden = false;
    this.style.display = '';
    const blockWrapper = this.closest('.free-shipping-block');
    if (blockWrapper) {
      blockWrapper.hidden = false;
      blockWrapper.style.display = '';
    }
  }

  /**
   * Handles StandardEvents.cartLinesUpdate from Shopify.
   * @param {import('@shopify/events').CartLinesUpdateEvent} event
   */
  #handleCartLinesUpdate = (event) => {
    event.promise?.then(({ detail }) => {
      let total = detail?.cart?.total_price;
      if (total === undefined && detail?.cart?.item_count === 0) {
        total = 0;
      }
      if (total !== undefined) {
        this.updateProgress(total);
      }
    });
  };

  /**
   * Handles custom cart:update event if dispatched.
   * @param {CustomEvent<{ cart?: { total_price?: number, item_count?: number } }>} event
   */
  #handleCartUpdate = (event) => {
    let total = event.detail?.cart?.total_price;
    if (total === undefined && event.detail?.cart?.item_count === 0) {
      total = 0;
    }
    if (total !== undefined) {
      this.updateProgress(total);
    }
  };

  /**
   * Updates the progress bar percentage and message given a cart total in minor units.
   * @param {number} totalCents - Cart total price in minor units.
   * @returns {void}
   */
  updateProgress(totalCents) {
    if (!this.thresholdCents || this.thresholdCents <= 0) return;

    if (totalCents <= 0 && !window.Shopify?.designMode) {
      this.#hideBar();
      return;
    }

    this.#showBar();

    const isUnlocked = totalCents >= this.thresholdCents;
    const progressPercent = Math.min(100, Math.max(0, (totalCents / this.thresholdCents) * 100));

    if (this.progressFill) {
      this.progressFill.style.width = `${progressPercent}%`;
    }

    if (this.trackEl) {
      this.trackEl.setAttribute('aria-valuenow', progressPercent.toFixed(0));
      this.trackEl.setAttribute(
        'aria-valuetext',
        isUnlocked ? this.successMessage : `${progressPercent.toFixed(0)}% towards free shipping`
      );
    }

    if (this.messageEl) {
      if (isUnlocked) {
        this.messageEl.innerHTML = this.successMessage;
        this.classList.add('is-unlocked');
      } else {
        const remainingCents = Math.max(0, this.thresholdCents - totalCents);
        const formattedAmount = formatMoney(remainingCents, this.moneyFormat, this.currency);
        const amountHtml = `<strong class="free-shipping-bar__amount">${formattedAmount}</strong>`;
        this.messageEl.innerHTML = this.messageTemplate.replace('[amount]', amountHtml);
        this.classList.remove('is-unlocked');
      }
    }
  }
}

if (!customElements.get('free-shipping-bar')) {
  customElements.define('free-shipping-bar', FreeShippingBar);
}
