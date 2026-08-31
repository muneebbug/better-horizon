/**
 * Better Horizon — Cart Upsell & Drawer Recommendations
 * Sourced from product metafields across all cart items with fallback to Shopify recommendations.
 * Supports List, 2-Column Grid, and Horizontal Carousel modes.
 *
 * @module cart-upsell
 */

import { formatMoney } from '@theme/money-formatting';
import { updateCartState } from './wishlist.js';
import { StandardEvents } from '@shopify/events';
import { morphSection } from '@theme/section-renderer';

/**
 * @typedef {object} ShopifyRecommendationProduct
 * @property {number} id - Product ID
 * @property {string} title - Product title
 * @property {string} handle - Product handle
 * @property {string} url - Product URL
 * @property {boolean} available - Availability status
 * @property {number} price - Price in cents
 * @property {number} [compare_at_price] - Compare at price in cents
 * @property {string} [featured_image] - URL of featured image
 * @property {Array<{ id: number, title: string, price: number, available: boolean }>} variants - Product variants
 */

/**
 * Custom element managing upsell recommendations inside the cart drawer and cart page.
 *
 * @extends {HTMLElement}
 */
export class CartUpsell extends HTMLElement {
  /** @type {string} */
  context = 'drawer';

  /** @type {string} */
  layout = 'list';

  /** @type {number} */
  limit = 4;

  /** @type {number[]} */
  cartProductIds = [];

  /** @type {string | null} */
  primaryProductId = null;

  /** @type {string} */
  moneyFormat = '{{amount}}';

  /** @type {string} */
  currency = 'USD';

  /** @type {string} */
  buttonStyle = 'button-secondary';

  /** @type {HTMLElement | null} */
  itemsContainer = null;

  /** @type {HTMLButtonElement | null} */
  prevBtn = null;

  /** @type {HTMLButtonElement | null} */
  nextBtn = null;

  /** @type {boolean} */
  #isFetching = false;

  /** @type {MutationObserver | null} */
  #observer = null;

  /**
   * Initializes references and fetches recommendations across all cart products.
   * @returns {void}
   */
  connectedCallback() {
    this.context = this.dataset.context || 'drawer';
    this.layout = this.dataset.layout || 'list';
    this.limit = parseInt(this.dataset.limit || '4', 10);
    this.primaryProductId = this.dataset.primaryProductId || null;
    this.moneyFormat = this.dataset.moneyFormat || '{{amount}}';
    this.currency = this.dataset.currency || 'USD';
    this.buttonStyle = this.dataset.buttonStyle || 'button-secondary';

    const idsRaw = this.dataset.cartProductIds || '';
    this.cartProductIds = idsRaw
      ? idsRaw.split(',').map((id) => parseInt(id.trim(), 10)).filter(Boolean)
      : [];

    this.itemsContainer = this.querySelector('[data-upsell-items]');

    this.#initVariantSelectors();
    this.#initAddButtons();
    this.#initCarousel();
    this.#setupObserver();

    // Fetch fallback recommendations across all cart items if slots remain open
    const renderedCards = this.querySelectorAll('.cart-upsell-card');
    if (renderedCards.length < this.limit) {
      this.#fetchRecommendationsForAllCartItems();
    }

    document.addEventListener(StandardEvents.cartLinesUpdate, this.#handleCartLinesUpdate);
    document.addEventListener('cart:update', this.#handleCartUpdate);
  }

  /**
   * Cleans up event listeners when removed from DOM.
   * @returns {void}
   */
  disconnectedCallback() {
    this.#observer?.disconnect();
    document.removeEventListener(StandardEvents.cartLinesUpdate, this.#handleCartLinesUpdate);
    document.removeEventListener('cart:update', this.#handleCartUpdate);
  }

  /**
   * Monitors DOM changes from section morphing and ensures recommendations stay populated.
   * @returns {void}
   */
  #setupObserver() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(() => {
      this.#initVariantSelectors();
      this.#initAddButtons();
      this.#initCarousel();

      const cards = this.querySelectorAll('.cart-upsell-card');
      if (cards.length < this.limit && !this.#isFetching) {
        this.#fetchRecommendationsForAllCartItems();
      }
    });

    if (this.itemsContainer) {
      this.#observer.observe(this.itemsContainer, { childList: true });
    }
  }

  /**
   * Initializes carousel navigation buttons and touch scroll tracking.
   * @returns {void}
   */
  #initCarousel() {
    this.prevBtn = this.querySelector('[data-carousel-prev]');
    this.nextBtn = this.querySelector('[data-carousel-next]');

    if (this.prevBtn && this.nextBtn && this.itemsContainer) {
      this.prevBtn.onclick = () => this.#navigateCarousel(-1);
      this.nextBtn.onclick = () => this.#navigateCarousel(1);
      this.itemsContainer.onscroll = () => this.#updateArrowStates();
      this.#updateArrowStates();
    }
  }

  /**
   * Slides the carousel by 1 item with smooth wrap-around.
   * @param {number} direction - -1 for previous, 1 for next
   * @returns {void}
   */
  #navigateCarousel(direction) {
    if (!this.itemsContainer) return;
    const cards = Array.from(this.itemsContainer.querySelectorAll('.cart-upsell-card'));
    if (cards.length === 0) return;

    const cardWidth = this.itemsContainer.clientWidth;
    const currentScroll = this.itemsContainer.scrollLeft;
    let targetScroll = currentScroll + direction * cardWidth;

    const maxScroll = (cards.length - 1) * cardWidth;
    if (targetScroll < 0) {
      targetScroll = maxScroll;
    } else if (targetScroll > maxScroll + 10) {
      targetScroll = 0;
    }

    this.itemsContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }

  /**
   * Controls visibility of carousel arrows when multiple items exist.
   * @returns {void}
   */
  #updateArrowStates() {
    if (!this.itemsContainer || !this.prevBtn || !this.nextBtn) return;
    const cards = this.itemsContainer.querySelectorAll('.cart-upsell-card');
    const controls = this.querySelector('[data-carousel-controls]');
    if (controls) {
      /** @type {HTMLElement} */ (controls).style.display = cards.length > 1 ? 'inline-flex' : 'none';
    }
  }

  /**
   * Initializes variant selector dropdown change events.
   * @returns {void}
   */
  #initVariantSelectors() {
    this.querySelectorAll('[data-variant-select]').forEach((select) => {
      select.onchange = (event) => {
        const target = /** @type {HTMLSelectElement} */ (event.target);
        const card = target.closest('.cart-upsell-card');
        if (!card) return;

        const selectedOption = target.options[target.selectedIndex];
        const addBtn = /** @type {HTMLButtonElement | null} */ (card.querySelector('[data-upsell-add-btn]'));
        const priceEl = card.querySelector('.cart-upsell-card__price');

        if (addBtn) {
          addBtn.dataset.variantId = target.value;
        }
        if (priceEl && selectedOption?.dataset?.price) {
          priceEl.textContent = selectedOption.dataset.price;
        }
      };
    });
  }

  /**
   * Initializes click listeners on all "+ Add" buttons.
   * @returns {void}
   */
  #initAddButtons() {
    this.querySelectorAll('[data-upsell-add-btn]').forEach((btn) => {
      btn.onclick = this.#handleAddClick;
    });
  }

  /**
   * Handles adding a recommended upsell variant to the cart.
   * @param {MouseEvent} event
   * @returns {Promise<void>}
   */
  #handleAddClick = async (event) => {
    event.preventDefault();
    const btn = /** @type {HTMLButtonElement} */ (event.currentTarget);
    const variantId = btn.dataset.variantId;
    if (!variantId) return;

    const card = btn.closest('.cart-upsell-card');
    const origHtml = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<span class="cart-upsell-card__btn-text">Adding...</span>';

    try {
      const cartComponents = Array.from(document.querySelectorAll('cart-items-component'));
      const sectionIds = new Set();
      cartComponents.forEach((comp) => {
        if (comp instanceof HTMLElement && comp.dataset.sectionId) {
          sectionIds.add(comp.dataset.sectionId);
        }
      });

      const body = {
        items: [{ id: parseInt(variantId, 10), quantity: 1 }],
        sections: Array.from(sectionIds).join(','),
        sections_url: window.location.pathname
      };

      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const responseData = await res.json();
        btn.innerHTML = '<span class="cart-upsell-card__btn-text">Added! ✓</span>';

        if (responseData.sections) {
          for (const [secId, secHtml] of Object.entries(responseData.sections)) {
            try {
              await morphSection(secId, secHtml);
            } catch (e) {
              console.warn(`morphSection failed for ${secId}:`, e);
            }
          }
        }

        await updateCartState();

        // Animate card removal from recommendations after being added
        if (card) {
          setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            setTimeout(() => {
              card.remove();
              this.#updateArrowStates();
              this.#fetchRecommendationsForAllCartItems();
            }, 300);
          }, 500);
        }
      } else {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    } catch (err) {
      console.error('Error adding upsell to cart:', err);
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  };

  /**
   * Fetches native Shopify product recommendations across ALL products currently in the cart.
   * @returns {Promise<void>}
   */
  async #fetchRecommendationsForAllCartItems() {
    if (!this.itemsContainer || this.#isFetching) return;
    this.#isFetching = true;

    try {
      // Sync fresh cart state if cartProductIds is empty
      if (this.cartProductIds.length === 0) {
        const cartRes = await fetch('/cart.js');
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          this.cartProductIds = (cartData.items || []).map((/** @type {{ product_id: number }} */ item) => item.product_id);
          if (cartData.item_count === 0) {
            this.classList.add('is-hidden');
            this.style.display = 'none';
            this.#isFetching = false;
            return;
          }
        }
      }

      const existingProductIds = new Set(
        Array.from(this.querySelectorAll('.cart-upsell-card')).map((card) =>
          parseInt(/** @type {HTMLElement} */ (card).dataset.productId || '0', 10)
        )
      );

      // Exclude all items currently in cart
      this.cartProductIds.forEach((id) => existingProductIds.add(id));

      const queryProductIds = [...this.cartProductIds];
      if (this.primaryProductId && !queryProductIds.includes(parseInt(this.primaryProductId, 10))) {
        queryProductIds.push(parseInt(this.primaryProductId, 10));
      }

      let addedCount = this.querySelectorAll('.cart-upsell-card').length;

      for (const prodId of queryProductIds) {
        if (addedCount >= this.limit) break;
        if (!prodId) continue;

        const endpoint = `/recommendations/products.json?product_id=${prodId}&limit=6&intent=related`;
        const res = await fetch(endpoint);
        if (!res.ok) continue;

        const data = await res.json();
        /** @type {ShopifyRecommendationProduct[]} */
        const products = data?.products || [];

        for (const product of products) {
          if (addedCount >= this.limit) break;
          if (!product.available || existingProductIds.has(product.id)) continue;

          existingProductIds.add(product.id);
          const cardHtml = this.#createCardMarkup(product);
          const temp = document.createElement('div');
          temp.innerHTML = cardHtml.trim();
          const cardEl = temp.firstElementChild;

          if (cardEl && this.itemsContainer) {
            this.itemsContainer.appendChild(cardEl);
            addedCount++;
          }
        }
      }

      this.#initVariantSelectors();
      this.#initAddButtons();
      this.#updateArrowStates();

      if (this.querySelectorAll('.cart-upsell-card').length > 0) {
        this.classList.remove('is-hidden');
        this.removeAttribute('hidden');
        this.style.display = '';
      }
    } catch (err) {
      console.warn('Unable to load recommendations:', err);
    } finally {
      this.#isFetching = false;
    }
  }

  /**
   * Generates HTML markup for a recommendation product card.
   * @param {ShopifyRecommendationProduct} product
   * @returns {string}
   */
  #createCardMarkup(product) {
    const variant = product.variants?.[0];
    if (!variant) return '';

    const formattedPrice = formatMoney(variant.price, this.moneyFormat, this.currency);
    const hasMultipleVariants = product.variants.length > 1;

    let variantSelectHtml = '';
    if (hasMultipleVariants) {
      const optionsHtml = product.variants
        .filter((v) => v.available)
        .map(
          (v) =>
            `<option value="${v.id}" data-price="${formatMoney(v.price, this.moneyFormat, this.currency)}">${v.title} - ${formatMoney(v.price, this.moneyFormat, this.currency)}</option>`
        )
        .join('');

      variantSelectHtml = `
        <div class="cart-upsell-card__variant-wrapper">
          <select class="cart-upsell-card__variant-select" data-variant-select aria-label="Select variant for ${product.title}">
            ${optionsHtml}
          </select>
        </div>
      `;
    }

    return `
      <div class="cart-upsell-card cart-upsell-card--${this.context} cart-upsell-card--${this.layout}" data-product-id="${product.id}" data-handle="${product.handle}">
        <div class="cart-upsell-card__media">
          <a href="${product.url}" tabindex="-1" aria-hidden="true">
            ${
              product.featured_image
                ? `<img src="${product.featured_image}" alt="${product.title}" class="cart-upsell-card__image" width="70" height="70" loading="lazy">`
                : `<div class="cart-upsell-card__placeholder"></div>`
            }
          </a>
        </div>
        <div class="cart-upsell-card__content">
          <a href="${product.url}" class="cart-upsell-card__title">${product.title}</a>
          <div class="cart-upsell-card__pricing">
            <span class="cart-upsell-card__price">${formattedPrice}</span>
          </div>
          ${variantSelectHtml}
        </div>
        <button type="button" class="${this.buttonStyle} cart-upsell-card__add-btn" data-upsell-add-btn data-variant-id="${variant.id}" aria-label="Add ${product.title} to cart">
          <span aria-hidden="true" class="svg-wrapper cart-upsell-card__btn-icon">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="var(--icon-stroke-width, 1.5)" d="M16.608 9.421V6.906H3.392v8.016c0 .567.224 1.112.624 1.513.4.402.941.627 1.506.627H8.63M8.818 3h2.333c.618 0 1.212.247 1.649.686a2.35 2.35 0 0 1 .683 1.658v1.562H6.486V5.344c0-.622.246-1.218.683-1.658A2.33 2.33 0 0 1 8.82 3"/><path stroke="currentColor" stroke-linecap="round" stroke-width="var(--icon-stroke-width, 1.5)" d="M14.608 12.563v5m2.5-2.5h-5"/></svg>
          </span>
          <span class="cart-upsell-card__btn-text">Add</span>
        </button>
      </div>
    `;
  }

  /**
   * Handles StandardEvents.cartLinesUpdate from Shopify.
   * @param {import('@shopify/events').CartLinesUpdateEvent} event
   */
  #handleCartLinesUpdate = (event) => {
    event.promise?.then(async ({ detail }) => {
      if (detail?.cart?.item_count === 0) {
        this.classList.add('is-hidden');
        this.style.display = 'none';
        return;
      }

      this.classList.remove('is-hidden');
      this.removeAttribute('hidden');
      this.style.display = '';

      // Refresh cart product IDs from fresh cart state
      try {
        const cartRes = await fetch('/cart.js');
        if (cartRes.ok) {
          const cart = await cartRes.json();
          this.cartProductIds = (cart.items || []).map((/** @type {{ product_id: number }} */ item) => item.product_id);
          
          // Remove recommendations that were just added to cart
          this.querySelectorAll('.cart-upsell-card').forEach((card) => {
            const pid = parseInt(/** @type {HTMLElement} */ (card).dataset.productId || '0', 10);
            if (this.cartProductIds.includes(pid)) {
              card.remove();
            }
          });

          await this.#fetchRecommendationsForAllCartItems();
        }
      } catch (e) {
        console.warn('Error refreshing recommendations after cartLinesUpdate:', e);
      }
    });
  };

  /**
   * Handles custom cart:update event.
   * @param {CustomEvent<{ cart?: { item_count?: number, items?: Array<{ product_id: number }> } }>} event
   */
  #handleCartUpdate = async (event) => {
    const itemCount = event.detail?.cart?.item_count;
    if (itemCount === 0) {
      this.classList.add('is-hidden');
      this.style.display = 'none';
      return;
    }

    this.classList.remove('is-hidden');
    this.removeAttribute('hidden');
    this.style.display = '';

    if (event.detail?.cart?.items) {
      this.cartProductIds = event.detail.cart.items.map((item) => item.product_id);
      this.querySelectorAll('.cart-upsell-card').forEach((card) => {
        const pid = parseInt(/** @type {HTMLElement} */ (card).dataset.productId || '0', 10);
        if (this.cartProductIds.includes(pid)) {
          card.remove();
        }
      });
    }

    await this.#fetchRecommendationsForAllCartItems();
  };
}

if (!customElements.get('cart-upsell')) {
  customElements.define('cart-upsell', CartUpsell);
}
