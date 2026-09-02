/**
 * Better Horizon — Back in Stock Web Component
 * Allows customers to request notification when an out-of-stock item is replenished.
 * Listens to ProductSelectEvent to dynamically show/hide based on selected variant stock.
 *
 * @module back-in-stock
 */

import { Component } from '@theme/component';
import { morph } from '@theme/morph';
import { StandardEvents, ProductSelectEvent } from '@shopify/events';

/**
 * Custom element managing the back-in-stock notification capture form,
 * dynamic variant stock synchronization, and submission.
 *
 * @extends {Component}
 */
export class BackInStock extends Component {
  /** @type {HTMLFormElement | null} */
  form = null;

  /** @type {HTMLInputElement | null} */
  emailInput = null;

  /** @type {HTMLElement | null} */
  statusMessage = null;

  /** @type {HTMLButtonElement | null} */
  submitButton = null;

  connectedCallback() {
    super.connectedCallback();
    this.#bindForm();

    const target =
      this.closest('.shopify-section, dialog, [id*="ProductInformation-"], [id*="QuickAdd-"], product-card') ||
      document;
    target.addEventListener(StandardEvents.productSelect, this.#handleProductSelect);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.form) {
      this.form.removeEventListener('submit', this.handleSubmit);
    }
    const target =
      this.closest('.shopify-section, dialog, [id*="ProductInformation-"], [id*="QuickAdd-"], product-card') ||
      document;
    target.removeEventListener(StandardEvents.productSelect, this.#handleProductSelect);
  }

  /**
   * Binds internal form references and listeners.
   * @returns {void}
   */
  #bindForm() {
    this.form = this.querySelector('form');
    this.emailInput = this.querySelector('input[type="email"]');
    this.statusMessage = this.querySelector('[data-status-message]');
    this.submitButton = this.querySelector('button[type="submit"]');

    if (this.form) {
      this.form.removeEventListener('submit', this.handleSubmit);
      this.form.addEventListener('submit', this.handleSubmit);
    }
  }

  /**
   * Handles variant changes dispatched by variant pickers.
   * Dynamically shows/hides block and morphs body content based on selected variant availability.
   *
   * @param {ProductSelectEvent} event
   * @returns {void}
   */
  #handleProductSelect = (event) => {
    if (!(event.target instanceof Element) || event.target.closest('product-card')) return;

    event.promise
      .then(({ variant, detail }) => {
        if (!detail?.html) return;

        const { html, newProduct, resource } = detail;

        if (newProduct) {
          this.dataset.productId = newProduct.id;
        } else if (detail.productId && detail.productId !== this.dataset.productId) {
          return;
        }

        const blockId = this.dataset.blockId;
        const newBlock = blockId
          ? html.querySelector(`back-in-stock[data-block-id="${blockId}"]`) || html.querySelector('back-in-stock')
          : html.querySelector('back-in-stock');

        if (!newBlock) return;

        // Determine if selected variant is sold out
        const isAvailable =
          resource?.available !== undefined
            ? resource.available
            : variant?.availableForSale !== undefined
            ? variant.availableForSale
            : !newBlock.hasAttribute('hidden');

        if (!isAvailable) {
          this.removeAttribute('hidden');
        } else {
          this.setAttribute('hidden', '');
        }

        // Morph children so contact[body] hidden input has updated variant title and SKU
        morph(this, newBlock, { childrenOnly: true });

        this.#updateVariantDetails(resource, variant, newBlock, event.product);
        this.#bindForm();
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') console.warn('[back-in-stock] Event promise rejected:', error);
      });
  };

  /**
   * Updates hidden contact form fields with the selected variant's exact title, SKU, and direct link.
   *
   * @param {any} resource
   * @param {any} variant
   * @param {HTMLElement} [newBlock]
   * @param {any} [productInfo]
   * @returns {void}
   */
  #updateVariantDetails(resource, variant, newBlock, productInfo) {
    const productTitle =
      this.dataset.productTitle ||
      productInfo?.title ||
      newBlock?.dataset.productTitle ||
      '';
    const productHandle =
      this.dataset.productHandle ||
      productInfo?.handle ||
      newBlock?.dataset.productHandle ||
      '';
    const variantId =
      resource?.id ||
      variant?.id ||
      newBlock?.dataset.variantId ||
      this.dataset.variantId ||
      '';
    const rawVariantTitle =
      resource?.title ||
      variant?.title ||
      newBlock?.dataset.variantTitle ||
      '';
    const variantTitle =
      rawVariantTitle && rawVariantTitle !== 'Default Title' ? rawVariantTitle : '';
    const variantSku =
      resource?.sku ||
      newBlock?.dataset.variantSku ||
      'N/A';

    const fullProductTitle = variantTitle ? `${productTitle} - ${variantTitle}` : productTitle;
    const shopUrl = this.dataset.shopUrl || window.location.origin;
    const variantLink = `${shopUrl}/products/${productHandle}?variant=${variantId}`;

    if (variantId) this.dataset.variantId = String(variantId);
    if (variantTitle) this.dataset.variantTitle = variantTitle;
    if (variantSku) this.dataset.variantSku = variantSku;

    const inputProduct = this.querySelector('input[name="contact[Product]"]');
    if (inputProduct) inputProduct.value = fullProductTitle;

    const inputLink = this.querySelector('input[name="contact[Variant Link]"]');
    if (inputLink) inputLink.value = variantLink;

    const inputSku = this.querySelector('input[name="contact[SKU]"]');
    if (inputSku) inputSku.value = variantSku;
  }

  /**
   * Submits the notification request form via fetch to Shopify contact endpoint.
   *
   * @param {SubmitEvent} event
   * @returns {Promise<void>}
   */
  handleSubmit = async (event) => {
    event.preventDefault();
    if (!this.emailInput || !this.emailInput.value) return;

    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.setAttribute('aria-busy', 'true');
    }

    try {
      if (this.form) {
        const formData = new FormData(this.form);
        await fetch(this.form.action || '/contact#contact_form', {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });
      }

      this.showSuccess();
    } catch {
      // Fallback for contact form submission
      this.showSuccess();
    } finally {
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.removeAttribute('aria-busy');
      }
    }
  };

  /**
   * Displays confirmation success state and focuses status message for screen readers.
   * @returns {void}
   */
  showSuccess() {
    if (this.form) {
      this.form.style.display = 'none';
    }
    if (this.statusMessage) {
      this.statusMessage.removeAttribute('hidden');
      this.statusMessage.focus();
    }
  }
}

if (!customElements.get('back-in-stock')) {
  customElements.define('back-in-stock', BackInStock);
}

if (!customElements.get('back-in-stock-form')) {
  customElements.define('back-in-stock-form', BackInStock);
}
