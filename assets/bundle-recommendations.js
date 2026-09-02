/**
 * Better Horizon — Frequently Bought Together / Bundle Recommendations
 * Fetches native Shopify recommendations or renders curated metafield items,
 * calculates bundle totals, handles variant selection, and adds all selected items to cart.
 *
 * @module bundle-recommendations
 */

import { formatMoney } from '@theme/money-formatting';
import { updateCartState } from './wishlist.js';
import { StandardEvents } from '@shopify/events';

/**
 * @typedef {object} CartItemPayload
 * @property {number} id - The variant ID to add to cart.
 * @property {number} quantity - The quantity of the variant.
 */

/**
 * Custom element managing the Frequently Bought Together bundle recommendations,
 * live price aggregation, variant selection, and multi-item cart dispatch.
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

  /** @type {string} */
  moneyFormat;

  /** @type {string} */
  currency;

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
    this.moneyFormat = this.dataset.moneyFormat || '{{amount}}';
    this.currency = this.dataset.currency || 'USD';
    this.totalPriceEl = this.querySelector('[data-bundle-total]');
    this.addButton = this.querySelector('[data-bundle-add-button]');
    this.itemsContainer = this.querySelector('[data-bundle-items]');

    this.initCheckboxes();
    this.initVariantSelects();
    this.updateTotal();

    if (this.addButton) {
      this.addButton.addEventListener('click', this.handleAddBundle.bind(this));
    }

    const target =
      this.closest('.shopify-section, dialog, [id*="ProductInformation-"], [id*="QuickAdd-"]') ||
      document;
    target.addEventListener(StandardEvents.productSelect, this.#handleProductSelect);
  }

  /**
   * Cleans up event listeners upon disconnection.
   * @returns {void}
   */
  disconnectedCallback() {
    const target =
      this.closest('.shopify-section, dialog, [id*="ProductInformation-"], [id*="QuickAdd-"]') ||
      document;
    target.removeEventListener(StandardEvents.productSelect, this.#handleProductSelect);
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
   * Attaches change event listeners to all variant selection dropdowns.
   * @returns {void}
   */
  initVariantSelects() {
    /** @type {NodeListOf<HTMLSelectElement>} */
    const selects = this.querySelectorAll('[data-bundle-variant-select]');
    selects.forEach((select) => {
      select.addEventListener('change', (event) => this.handleVariantChange(event));
    });
  }

  /**
   * Handles changes to an item's variant select dropdown.
   * Updates checkbox data attributes, displayed price, thumbnail image, and bundle total.
   *
   * @param {Event | { target: HTMLSelectElement }} event - The select change event.
   * @returns {void}
   */
  handleVariantChange(event) {
    const select = /** @type {HTMLSelectElement} */ (event.target);
    if (!select) return;

    const bundleItem = select.closest('.bundle-item');
    if (!bundleItem) return;

    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption) return;

    const variantId = selectedOption.value;
    const priceCents = parseInt(selectedOption.dataset.priceCents || '0', 10);
    const imageUrl = selectedOption.dataset.image;

    // Update checkbox data attributes
    const checkbox = /** @type {HTMLInputElement | null} */ (
      bundleItem.querySelector('input[type="checkbox"]')
    );
    if (checkbox) {
      checkbox.dataset.variantId = variantId;
      checkbox.dataset.priceCents = String(priceCents);
    }

    // Update item price display
    const priceEl = bundleItem.querySelector('[data-item-price]');
    if (priceEl) {
      priceEl.textContent = formatMoney(priceCents, this.moneyFormat, this.currency);
    }

    // Update item image if variant has its own image
    if (imageUrl) {
      const img = /** @type {HTMLImageElement | null} */ (
        bundleItem.querySelector('.bundle-item__image')
      );
      if (img) {
        img.src = imageUrl;
      }
    }

    // Recalculate bundle total
    this.updateTotal();

    // If this is the main item, sync to main page variant-picker
    if (bundleItem.classList.contains('bundle-item--main')) {
      this.#syncToMainVariantPicker(variantId, select);
    }
  }

  /**
   * Synchronizes the chosen variant ID with the main page variant picker.
   *
   * @param {string} variantId
   * @param {HTMLSelectElement} selectElement
   */
  #syncToMainVariantPicker(variantId, selectElement) {
    const cleanId = String(variantId).split('/').pop();
    const productId = this.productId;
    const section = this.closest('.shopify-section') || document;
    const variantPicker = section.querySelector(`variant-picker[data-product-id="${productId}"]`);
    if (!variantPicker) return;

    // 1. Single-variant input direct match
    const directInput = variantPicker.querySelector(
      `input[data-variant-id="${cleanId}"], option[data-variant-id="${cleanId}"]`
    );
    if (directInput instanceof HTMLInputElement && !directInput.checked) {
      directInput.checked = true;
      if (typeof variantPicker.updateSelectedOption === 'function') {
        variantPicker.updateSelectedOption(directInput);
      }
      directInput.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    // 2. Retrieve option values for this variant
    let optionValues = [];
    const selectedOption = selectElement?.options[selectElement.selectedIndex];
    if (selectedOption?.dataset?.options) {
      optionValues = selectedOption.dataset.options.split('|||');
    }

    if (optionValues.length === 0) {
      const script = this.querySelector('script[data-product-variants]');
      if (script) {
        try {
          const parsed = JSON.parse(script.textContent || '[]');
          const variantsList = Array.isArray(parsed) ? parsed : [parsed];
          const targetVariant = variantsList.find((v) => String(v.id) === cleanId);
          if (targetVariant && Array.isArray(targetVariant.options)) {
            optionValues = targetVariant.options;
          }
        } catch (e) {
          console.warn('[bundle-recommendations] Could not parse variants JSON:', e);
        }
      }
    }

    if (optionValues.length === 0) return;

    // 3. Update fieldsets and selects in the variant-picker
    const fieldsets = variantPicker.querySelectorAll('fieldset');
    const selects = variantPicker.querySelectorAll('select');
    let triggerElement = null;

    if (fieldsets.length > 0) {
      fieldsets.forEach((fieldset, idx) => {
        const targetVal = optionValues[idx];
        if (!targetVal) return;

        const radios = Array.from(fieldset.querySelectorAll('input'));
        const matchingRadio = radios.find((r) => r.value === targetVal);
        if (matchingRadio) {
          if (!matchingRadio.checked) {
            matchingRadio.checked = true;
            triggerElement = matchingRadio;
          }
          if (typeof variantPicker.updateSelectedOption === 'function') {
            variantPicker.updateSelectedOption(matchingRadio);
          }
        }
      });
    }

    if (selects.length > 0) {
      selects.forEach((sel, idx) => {
        const targetVal = optionValues[idx];
        if (!targetVal) return;

        if (sel.value !== targetVal) {
          sel.value = targetVal;
          triggerElement = sel;
          if (typeof variantPicker.updateSelectedOption === 'function') {
            variantPicker.updateSelectedOption(sel);
          }
        }
      });
    }

    // 4. Trigger change event
    if (triggerElement) {
      triggerElement.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      const anyChecked = variantPicker.querySelector('input:checked, select');
      if (anyChecked) {
        anyChecked.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  /**
   * Handles page-level variant changes to keep the main bundle item in sync.
   *
   * @param {any} event - The product select event.
   * @returns {void}
   */
  #handleProductSelect = (event) => {
    if (!(event.target instanceof Element) || event.target.closest('product-card')) return;

    event.promise
      ?.then(({ variant, detail }) => {
        const rawId = detail?.variantId || variant?.id || detail?.resource?.id;
        if (!rawId) return;

        const cleanId = String(rawId).split('/').pop();
        if (!cleanId) return;

        const mainItem = this.querySelector('.bundle-item--main');
        if (!mainItem) return;

        const select = /** @type {HTMLSelectElement | null} */ (
          mainItem.querySelector('[data-bundle-variant-select]')
        );

        if (select) {
          const matchingOption = Array.from(select.options).find(
            (opt) => opt.value === cleanId || opt.value === String(rawId)
          );

          if (matchingOption) {
            if (select.value !== matchingOption.value) {
              select.value = matchingOption.value;
              this.handleVariantChange({ target: select });
            }
          }
        } else {
          const priceCents = variant?.price?.amount
            ? Math.round(parseFloat(variant.price.amount) * 100)
            : detail?.resource?.price;

          const checkbox = /** @type {HTMLInputElement | null} */ (
            mainItem.querySelector('input[type="checkbox"]')
          );
          if (checkbox) {
            checkbox.dataset.variantId = cleanId;
            if (priceCents) checkbox.dataset.priceCents = String(priceCents);
          }

          const priceEl = mainItem.querySelector('[data-item-price]');
          if (priceEl && priceCents) {
            priceEl.textContent = formatMoney(priceCents, this.moneyFormat, this.currency);
          }

          this.updateTotal();
        }
      })
      .catch(() => {});
  };

  /**
   * Computes the sum of all currently checked bundle items and updates the formatted total UI using theme money formatting.
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
      this.totalPriceEl.textContent = formatMoney(totalCents, this.moneyFormat, this.currency);
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
