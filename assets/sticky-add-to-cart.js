import { Component } from '@theme/component';
import { ThemeEvents, QuantitySelectorUpdateEvent } from '@theme/events';
import { morph } from '@theme/morph';
import { onAnimationEnd } from '@theme/utilities';
import { StandardEvents, ProductSelectEvent, CartLinesUpdateEvent, CartErrorEvent } from '@shopify/events';

/**
 * @typedef {Object} ProductVariant
 * @property {string|number} [id] - Variant ID
 * @property {string} [title] - Variant title
 * @property {string} [name] - Variant name
 * @property {boolean} [available] - Whether variant is available
 * @property {number} [price] - Variant price
 * @property {Object} [featured_media] - Featured media object
 * @property {Object} [featured_media.preview_image] - Preview image data
 * @property {string} [featured_media.preview_image.src] - Image source URL
 * @property {string} [featured_media.alt] - Alt text for the image
 */

/**
 * @typedef {HTMLElement & {
 *   source: Element,
 *   destination: Element,
 *   useSourceSize: string | boolean
 * }} FlyToCart
 */

/**
 * @typedef {Object} StickyAddToCartRefs
 * @property {HTMLElement} stickyBar - The floating bar container
 * @property {HTMLButtonElement} addToCartButton - Sticky bar's button
 * @property {HTMLElement} quantityDisplay - Quantity display container
 * @property {HTMLElement} quantityNumber - Quantity number element
 * @property {HTMLImageElement} [productImage] - Product image element
 */

/**
 * A custom element that manages a sticky add-to-cart bar.
 * Shows when the main buy buttons scroll out of view.
 * Supports inline variant selection with disabled/strikethrough states,
 * custom positioning (top/bottom), quantity adjustment, and two-way sync with the page.
 *
 * @extends {Component<StickyAddToCartRefs>}
 */
class StickyAddToCartComponent extends Component {
  requiredRefs = ['stickyBar', 'addToCartButton', 'quantityDisplay', 'quantityNumber'];

  /** @type {IntersectionObserver | null} */
  #buyButtonsIntersectionObserver = null;

  /** @type {IntersectionObserver | null} */
  #mainBottomObserver = null;

  /** @type {number | undefined} */
  #resetTimeout;

  /** @type {boolean} */
  #isStuck = false;

  /** @type {number | null} */
  #animationTimeout = null;

  /** @type {AbortController} */
  #abortController = new AbortController();

  /** @type {HTMLButtonElement | null} */
  #targetAddToCartButton = null;

  /** @type {number} */
  #currentQuantity = 1;

  /** @type {boolean} */
  #hiddenByBottom = false;

  connectedCallback() {
    super.connectedCallback();

    this.#setupIntersectionObserver();
    this.#setupVariantSelect();
    this.#setupQuantityControls();

    const { signal } = this.#abortController;
    const target = this.closest('.shopify-section') || document;
    target.addEventListener(StandardEvents.productSelect, this.#handleProductSelect, { signal });

    document.addEventListener(StandardEvents.cartLinesUpdate, this.#handleCartAddComplete, { signal });
    document.addEventListener(StandardEvents.cartError, this.#handleCartAddComplete, { signal });
    document.addEventListener(ThemeEvents.quantitySelectorUpdate, this.#handleQuantityUpdate, { signal });

    this.#getInitialQuantity();

    // Hide bar if chat is already active
    customElements.whenDefined('shopify-chat').then(() => {
      if (signal.aborted) return;
      if (this.#isStuck && this.#isChatActive()) this.#hideStickyBar();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#buyButtonsIntersectionObserver?.disconnect();
    this.#mainBottomObserver?.disconnect();
    this.#abortController.abort();
    if (this.#animationTimeout) {
      clearTimeout(this.#animationTimeout);
    }
  }

  /**
   * Sets up event listeners on the inline variant select dropdown.
   */
  #setupVariantSelect() {
    const select = /** @type {HTMLSelectElement | null} */ (
      this.querySelector('[data-sticky-variant-select]')
    );
    if (!select) return;

    select.removeEventListener('change', this.#handleVariantSelectChange);
    select.addEventListener('change', this.#handleVariantSelectChange);
  }

  /**
   * Handles user changing the variant dropdown within the sticky bar.
   * Updates internal state, displays, button availability, and triggers sync to the main variant-picker.
   *
   * @param {Event} event
   */
  #handleVariantSelectChange = (event) => {
    const select = /** @type {HTMLSelectElement} */ (event.target);
    if (!select) return;

    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption) return;

    const variantId = selectedOption.value;
    const priceCents = parseInt(selectedOption.dataset.priceCents || '0', 10);
    const imageUrl = selectedOption.dataset.image;
    const isAvailable = !selectedOption.disabled;

    this.dataset.currentVariantId = variantId;
    this.dataset.variantAvailable = String(isAvailable);

    // Update sticky button state
    if (this.refs.addToCartButton) {
      this.refs.addToCartButton.disabled = !isAvailable;
      const textSpan = this.refs.addToCartButton.querySelector('.add-to-cart-text__content span:first-child');
      if (textSpan) {
        textSpan.textContent = isAvailable
          ? window.theme?.translations?.addToCart || 'Add to cart'
          : window.theme?.translations?.soldOut || 'Sold out';
      }
    }

    // Update thumbnail image
    if (imageUrl && this.refs.productImage) {
      this.refs.productImage.src = imageUrl;
    }

    // Sync to main page variant-picker
    this.#syncToMainVariantPicker(variantId);
  };

  /**
   * Synchronizes the chosen variant ID with the main page variant picker.
   *
   * @param {string} variantId
   */
  #syncToMainVariantPicker(variantId) {
    const cleanId = String(variantId).split('/').pop();
    const productId = this.dataset.productId;
    const section = this.closest('.shopify-section') || document;
    const variantPicker = section.querySelector(`variant-picker[data-product-id="${productId}"]`);
    if (!variantPicker) return;

    // 1. Single-variant input direct match (e.g. combined listing / single variant)
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
    const select = /** @type {HTMLSelectElement | null} */ (
      this.querySelector('[data-sticky-variant-select]')
    );
    const selectedOption = select?.options[select.selectedIndex];
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
          console.warn('[sticky-add-to-cart] Could not parse variants JSON:', e);
        }
      }
    }

    if (optionValues.length === 0) {
      // Fallback: update hidden input[name="id"] in product form
      const form = this.#getProductForm();
      if (form) {
        const idInput = /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="id"]'));
        if (idInput) {
          idInput.value = cleanId;
          idInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      return;
    }

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

    // 4. Trigger change event to fetch updated section and update main page UI
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
   * Sets up quantity buttons in the sticky bar if present.
   */
  #setupQuantityControls() {
    const qtyWrapper = this.querySelector('.sticky-add-to-cart__quantity-wrapper');
    if (!qtyWrapper) return;

    const decreaseBtn = qtyWrapper.querySelector('[data-qty-action="decrease"]');
    const increaseBtn = qtyWrapper.querySelector('[data-qty-action="increase"]');
    const qtyValueEl = qtyWrapper.querySelector('[data-sticky-qty-value]');

    const updateQty = (newQty) => {
      this.#currentQuantity = Math.max(1, newQty);
      if (qtyValueEl) qtyValueEl.textContent = String(this.#currentQuantity);
      this.#updateButtonText();

      // Sync with main page quantity input
      const mainQtyInput = document.querySelector('quantity-selector input[name="quantity"]');
      if (mainQtyInput instanceof HTMLInputElement) {
        mainQtyInput.value = String(this.#currentQuantity);
        mainQtyInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    decreaseBtn?.addEventListener('click', () => updateQty(this.#currentQuantity - 1));
    increaseBtn?.addEventListener('click', () => updateQty(this.#currentQuantity + 1));
  }

  /**
   * Sets up the IntersectionObserver to watch the buy buttons visibility.
   */
  #setupIntersectionObserver() {
    const productForm = this.#getProductForm();
    if (!productForm) return;

    const buyButtonsBlock = productForm.closest('.buy-buttons-block');
    if (!buyButtonsBlock) return;

    const footer = document.querySelector('footer') ?? document.querySelector('[class*="footer-group"]');
    if (!footer) return;

    // Observer for buy buttons visibility
    this.#buyButtonsIntersectionObserver = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry) return;

      if (!entry.isIntersecting && !this.#isStuck) {
        const rect = entry.target.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top < 0) {
          if (this.#isChatActive()) return;
          this.#showStickyBar();
        }
      } else if (entry.isIntersecting && this.#isStuck) {
        this.#hiddenByBottom = false;
        this.#hideStickyBar();
      }
    });

    // Observer for footer visibility - hides sticky bar at page bottom
    this.#mainBottomObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;

        if (entry.isIntersecting && this.#isStuck) {
          this.#hiddenByBottom = true;
          this.#hideStickyBar();
        } else if (!entry.isIntersecting && this.#hiddenByBottom) {
          const rect = buyButtonsBlock.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top < 0) {
            this.#hiddenByBottom = false;
            if (!this.#isChatActive()) {
              this.#showStickyBar();
            }
          }
        }
      },
      {
        rootMargin: '200px 0px 0px 0px',
      }
    );

    this.#buyButtonsIntersectionObserver.observe(buyButtonsBlock);
    this.#mainBottomObserver.observe(footer);
    this.#targetAddToCartButton = productForm.querySelector('[ref="addToCartButton"]');
  }

  // Public action handlers
  /**
   * Handles the add to cart button click in the sticky bar.
   */
  handleAddToCartClick = async () => {
    if (!this.#targetAddToCartButton) {
      const productForm = this.#getProductForm();
      if (productForm) {
        this.#targetAddToCartButton = productForm.querySelector('[ref="addToCartButton"]');
      }
    }
    if (!this.#targetAddToCartButton) return;

    this.#targetAddToCartButton.dataset.puppet = 'true';
    this.#targetAddToCartButton.click();
    const cartIcon = document.querySelector('.header-actions__cart-icon');

    if (this.refs.addToCartButton.dataset.added !== 'true') {
      this.refs.addToCartButton.dataset.added = 'true';
    }

    if (!cartIcon || !this.refs.addToCartButton || !this.refs.productImage) return;
    if (this.#resetTimeout) clearTimeout(this.#resetTimeout);

    const flyToCartElement = /** @type {FlyToCart} */ (document.createElement('fly-to-cart'));
    flyToCartElement.classList.add('fly-to-cart--sticky');
    flyToCartElement.style.setProperty('background-image', `url(${this.refs.productImage.src})`);
    flyToCartElement.useSourceSize = 'true';
    flyToCartElement.source = this.refs.productImage;
    flyToCartElement.destination = cartIcon;

    document.body.appendChild(flyToCartElement);

    await onAnimationEnd([this.refs.addToCartButton, flyToCartElement]);
    this.#resetTimeout = setTimeout(() => {
      this.refs.addToCartButton.removeAttribute('data-added');
    }, 800);
  };

  /**
   * Handles product select events (variant selected and updated on the main page).
   * Synchronizes the sticky bar dropdown, thumbnail, price, and availability.
   *
   * @param {ProductSelectEvent} event
   */
  #handleProductSelect = (event) => {
    if (!(event.target instanceof Element) || event.target.closest('product-card')) return;

    const { optionValueId } = event.detail ?? {};
    if (optionValueId) {
      this.dataset.currentVariantId = optionValueId;
    }

    event.promise
      .then(({ detail }) => {
        if (!detail?.html) return;

        const { html, productId, resource: variant } = detail;
        if (productId && productId !== this.dataset.productId) return;

        const newStickyAddToCart = /** @type {HTMLElement | null} */ (html.querySelector('sticky-add-to-cart'));
        if (newStickyAddToCart) {
          const newStickyBar = newStickyAddToCart.querySelector('[ref="stickyBar"]');
          if (newStickyBar) {
            const currentStuck = this.refs.stickyBar.getAttribute('data-stuck') || 'false';
            const variantAvailable = newStickyAddToCart.dataset.variantAvailable;

            morph(this.refs.stickyBar, newStickyBar, { childrenOnly: true });

            this.refs.stickyBar.setAttribute('data-stuck', currentStuck);
            this.dataset.variantAvailable = variantAvailable;

            if (variant && variant.id) {
              const cleanId = String(variant.id).split('/').pop();
              this.dataset.currentVariantId = cleanId || String(variant.id);
            }

            const productForm = this.#getProductForm();
            if (productForm) {
              this.#targetAddToCartButton = productForm.querySelector('[ref="addToCartButton"]');
            }

            this.#setupVariantSelect();
            this.#setupQuantityControls();
            this.#updateButtonText();
            return;
          }
        }

        // Fallback if sticky-add-to-cart was not morphed in the HTML response
        if (variant && variant.id) {
          this.#syncFromMainProduct(variant);
        }
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') console.warn('[sticky-add-to-cart] Event promise rejected:', error);
      });
  };

  /**
   * Synchronizes local state from variant data when server HTML does not contain sticky-add-to-cart.
   *
   * @param {ProductVariant} variant
   */
  #syncFromMainProduct(variant) {
    if (!variant?.id) return;
    const cleanId = String(variant.id).split('/').pop();
    if (!cleanId) return;

    this.dataset.currentVariantId = cleanId;
    this.dataset.variantAvailable = String(variant.available ?? true);

    const select = /** @type {HTMLSelectElement | null} */ (
      this.querySelector('[data-sticky-variant-select]')
    );
    if (select) {
      const matchingOption = Array.from(select.options).find(
        (opt) => opt.value === cleanId || opt.value === String(variant.id)
      );
      if (matchingOption && select.value !== matchingOption.value) {
        select.value = matchingOption.value;
      }
    }

    if (this.refs.addToCartButton) {
      this.refs.addToCartButton.disabled = !(variant.available ?? true);
    }

    if (variant.featured_media?.preview_image?.src && this.refs.productImage) {
      this.refs.productImage.src = variant.featured_media.preview_image.src;
    }
  }

  /**
   * Handles cart add complete (success or error) - resets puppet flag.
   *
   * @param {CartLinesUpdateEvent | CartErrorEvent} event
   */
  #handleCartAddComplete = (event) => {
    const resetPuppet = () => {
      if (this.#targetAddToCartButton) {
        this.#targetAddToCartButton.dataset.puppet = 'false';
      }
    };

    if ('promise' in event && event.promise instanceof Promise) {
      event.promise.finally(resetPuppet);
    } else {
      resetPuppet();
    }
  };

  /**
   * Handles quantity selector update events from elsewhere on the page.
   *
   * @param {QuantitySelectorUpdateEvent} event
   */
  #handleQuantityUpdate = (event) => {
    if (event.detail.cartLine) return;

    this.#currentQuantity = event.detail.quantity;
    const qtyValueEl = this.querySelector('[data-sticky-qty-value]');
    if (qtyValueEl) qtyValueEl.textContent = String(this.#currentQuantity);
    this.#updateButtonText();
  };

  /**
   * Shows the sticky bar with animation.
   */
  #showStickyBar() {
    const { stickyBar } = this.refs;
    this.#isStuck = true;
    stickyBar.dataset.stuck = 'true';
  }

  /**
   * Hides the sticky bar with animation.
   */
  #hideStickyBar() {
    const { stickyBar } = this.refs;
    this.#isStuck = false;
    stickyBar.dataset.stuck = 'false';
  }

  /**
   * Checks whether the Shopify Chat is active on the page.
   *
   * @returns {boolean}
   */
  #isChatActive() {
    if (!customElements.get('shopify-chat')) return false;
    return Boolean(document.querySelector('shopify-chat'));
  }

  /**
   * Gets the product form element.
   *
   * @returns {HTMLElement | null}
   */
  #getProductForm() {
    const productId = this.dataset.productId;
    if (!productId) return null;

    const sectionElement = this.closest('.shopify-section');
    if (!sectionElement) return null;

    const sectionId = sectionElement.id.replace('shopify-section-', '');
    return document.querySelector(
      `#shopify-section-${sectionId} product-form-component[data-product-id="${productId}"]`
    );
  }

  /**
   * Gets the initial quantity from the data attribute.
   */
  #getInitialQuantity() {
    this.#currentQuantity = parseInt(this.dataset.initialQuantity || '1') || 1;
    this.#updateButtonText();
  }

  /**
   * Updates the button text to include quantity.
   */
  #updateButtonText() {
    const { addToCartButton, quantityDisplay, quantityNumber } = this.refs;
    if (!addToCartButton || !quantityDisplay || !quantityNumber) return;

    const available = !addToCartButton.disabled;
    quantityNumber.textContent = this.#currentQuantity.toString();

    if (available && this.#currentQuantity > 1) {
      quantityDisplay.style.display = 'inline';
    } else {
      quantityDisplay.style.display = 'none';
    }
  }
}

if (!customElements.get('sticky-add-to-cart')) {
  customElements.define('sticky-add-to-cart', StickyAddToCartComponent);
}
