/**
 * Better Horizon — Native Wishlist Web Components
 * Zero-app, localStorage-backed with cross-tab and cross-component synchronization.
 *
 * @module wishlist
 */

/**
 * The localStorage key used to store wishlist items.
 * @constant {string}
 */
const STORAGE_KEY = 'better_horizon_wishlist';

/**
 * @typedef {object} WishlistItem
 * @property {string} id - The product GraphQL or numeric ID.
 * @property {string} [variantId] - The selected variant ID.
 * @property {string} handle - The product handle.
 * @property {string} title - The product title.
 * @property {string} price - The formatted product price string.
 * @property {string} image - The product image URL.
 * @property {string} url - The product relative or absolute URL.
 */

import { morphSection } from '@theme/section-renderer';

/**
 * Refreshes all cart section markup (cart drawer and cart page) and updates header bubbles and totals.
 *
 * @returns {Promise<void>}
 */
export async function updateCartState() {
  try {
    const cartComponents = Array.from(document.querySelectorAll('cart-items-component'));
    const sectionIds = new Set();

    cartComponents.forEach((comp) => {
      if (comp instanceof HTMLElement && comp.dataset.sectionId) {
        sectionIds.add(comp.dataset.sectionId);
      }
    });

    if (sectionIds.size === 0) {
      sectionIds.add('cart-drawer-section');
    }

    const sectionFetches = Array.from(sectionIds).map(async (sectionId) => {
      try {
        const url = window.location.pathname.includes('/cart')
          ? `${window.location.pathname}?section_id=${sectionId}`
          : `/?section_id=${sectionId}`;
        const res = await fetch(url);
        if (res.ok) {
          const sectionHtml = await res.text();
          try {
            await morphSection(sectionId, sectionHtml);
          } catch {
            const doc = new DOMParser().parseFromString(sectionHtml, 'text/html');
            const newComp = doc.querySelector(`[data-section-id="${sectionId}"]`) || doc.querySelector('#cart-drawer .cart-drawer__inner');
            const currentComp = document.querySelector(`[data-section-id="${sectionId}"]`) || document.querySelector('#cart-drawer .cart-drawer__inner');
            if (newComp && currentComp) {
              currentComp.innerHTML = newComp.innerHTML;
            }
          }
        }
      } catch (e) {
        console.warn(`Failed to refresh section ${sectionId}:`, e);
      }
    });

    const [cartRes] = await Promise.all([
      fetch('/cart.js'),
      ...sectionFetches
    ]);

    if (cartRes.ok) {
      const cartData = await cartRes.json();
      document.querySelectorAll('cart-icon').forEach((icon) => {
        const countEl = icon.querySelector('.cart-bubble__text-count');
        const bubble = icon.querySelector('.cart-bubble');
        if (countEl) {
          countEl.textContent = cartData.item_count > 0 ? String(cartData.item_count) : '';
          countEl.classList.remove('hidden');
        }
        if (bubble) {
          if (cartData.item_count > 0) {
            bubble.classList.remove('visually-hidden');
            icon.classList.add('header-actions__cart-icon--has-cart');
          } else {
            bubble.classList.add('visually-hidden');
            icon.classList.remove('header-actions__cart-icon--has-cart');
          }
        }
      });

      document.dispatchEvent(new CustomEvent('cart:update', { detail: { cart: cartData } }));
    }
  } catch (err) {
    console.error('Error updating cart state', err);
  }
}

/**
 * Storage manager for managing client-side wishlist items in localStorage.
 */
export class WishlistManager {
  /**
   * Retrieves the current list of saved wishlist items from localStorage.
   *
   * @returns {WishlistItem[]} The array of wishlist items.
   */
  static getItems() {
    try {
      const items = localStorage.getItem(STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  }

  /**
   * Saves the provided items array to localStorage and broadcasts the change event.
   *
   * @param {WishlistItem[]} items - The array of items to persist.
   * @returns {void}
   */
  static saveItems(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('wishlist:change', { detail: { items } }));
    } catch (e) {
      console.warn('Unable to save wishlist to localStorage', e);
    }
  }

  /**
   * Checks whether a product handle is currently saved in the wishlist.
   *
   * @param {string} handle - The product handle to check.
   * @returns {boolean} True if the item is in the wishlist.
   */
  static has(handle) {
    if (!handle) return false;
    return this.getItems().some((item) => item.handle === handle);
  }

  /**
   * Toggles an item into or out of the wishlist.
   *
   * @param {WishlistItem} item - The product item object.
   * @returns {void}
   */
  static toggle(item) {
    if (!item || !item.handle) return;
    const items = this.getItems();
    const index = items.findIndex((i) => i.handle === item.handle);
    if (index > -1) {
      items.splice(index, 1);
    } else {
      items.push(item);
    }
    this.saveItems(items);
  }

  /**
   * Removes an item by product handle from the wishlist.
   *
   * @param {string} handle - The product handle to remove.
   * @returns {void}
   */
  static remove(handle) {
    const items = this.getItems().filter((i) => i.handle !== handle);
    this.saveItems(items);
  }
}

/**
 * Custom element representing a wishlist toggle button on product cards and pages.
 *
 * @extends {HTMLElement}
 */
export class WishlistButton extends HTMLElement {
  /** @type {HTMLButtonElement | null} */
  button;

  /** @type {string | undefined} */
  productHandle;

  /** @type {string} */
  productTitle = '';

  /** @type {string} */
  productPrice = '';

  /** @type {string} */
  productImage = '';

  /** @type {string} */
  productUrl = '';

  /** @type {string} */
  productId = '';

  /** @type {string} */
  variantId = '';

  /** @type {(event: MouseEvent) => void} */
  boundClickHandler;

  /** @type {() => void} */
  boundChangeHandler;

  /**
   * Attaches click handlers and subscribes to wishlist state updates.
   * @returns {void}
   */
  connectedCallback() {
    this.button = this.querySelector('button');
    if (!this.button) return;

    this.productHandle = this.dataset.productHandle;
    this.productTitle = this.dataset.productTitle || '';
    this.productPrice = this.dataset.productPrice || '';
    this.productImage = this.dataset.productImage || '';
    this.productUrl = this.dataset.productUrl || '';
    this.productId = this.dataset.productId || '';
    this.variantId = this.dataset.variantId || '';

    this.updateState();

    this.boundClickHandler = this.handleClick.bind(this);
    this.boundChangeHandler = this.updateState.bind(this);

    this.button.addEventListener('click', this.boundClickHandler);
    window.addEventListener('wishlist:change', this.boundChangeHandler);
  }

  /**
   * Removes all attached event listeners when disconnected from the DOM.
   * @returns {void}
   */
  disconnectedCallback() {
    if (this.button) {
      this.button.removeEventListener('click', this.boundClickHandler);
    }
    window.removeEventListener('wishlist:change', this.boundChangeHandler);
  }

  /**
   * Handles user click on the wishlist button.
   *
   * @param {MouseEvent} event - The button click event.
   * @returns {void}
   */
  handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    WishlistManager.toggle({
      id: this.productId,
      variantId: this.variantId,
      handle: this.productHandle || '',
      title: this.productTitle,
      price: this.productPrice,
      image: this.productImage,
      url: this.productUrl
    });

    this.updateState();
  }

  /**
   * Updates the button's active attribute, aria-pressed, and accessible label.
   * @returns {void}
   */
  updateState() {
    const isSaved = WishlistManager.has(this.productHandle || '');
    this.setAttribute('data-active', isSaved ? 'true' : 'false');
    if (this.button) {
      this.button.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
      const label = isSaved ? 'Remove from wishlist' : 'Add to wishlist';
      this.button.setAttribute('aria-label', `${label}: ${this.productTitle}`);
    }
  }
}

/**
 * Custom element displaying the total count of wishlist items in header badges.
 *
 * @extends {HTMLElement}
 */
export class WishlistCount extends HTMLElement {
  /** @type {() => void} */
  boundHandler;

  /**
   * Initializes the count badge and listens for global wishlist changes.
   * @returns {void}
   */
  connectedCallback() {
    this.updateCount();
    this.boundHandler = this.updateCount.bind(this);
    window.addEventListener('wishlist:change', this.boundHandler);
  }

  /**
   * Removes the global change listener.
   * @returns {void}
   */
  disconnectedCallback() {
    window.removeEventListener('wishlist:change', this.boundHandler);
  }

  /**
   * Renders the updated item count and toggles visibility badges.
   * @returns {void}
   */
  updateCount() {
    const count = WishlistManager.getItems().length;
    this.textContent = count > 0 ? String(count) : '';
    this.setAttribute('data-count', String(count));

    const bubble = this.closest('.wishlist-bubble');
    const icon = this.closest('.header-actions__wishlist-icon');
    if (count > 0) {
      if (bubble) bubble.classList.remove('visually-hidden');
      if (icon) icon.classList.add('header-actions__wishlist-icon--has-items');
      this.classList.remove('visually-hidden');
    } else {
      if (bubble) bubble.classList.add('visually-hidden');
      if (icon) icon.classList.remove('header-actions__wishlist-icon--has-items');
      this.classList.add('visually-hidden');
    }
  }
}

/**
 * Custom element controlling the slide-out wishlist drawer and rendering saved items.
 *
 * @extends {HTMLElement}
 */
export class WishlistDrawer extends HTMLElement {
  /** @type {HTMLElement | null} */
  listContainer;

  /** @type {HTMLElement | null} */
  emptyState;

  /** @type {HTMLElement | null} */
  innerWrapper;

  /** @type {() => void} */
  boundHandler;

  /**
   * Initializes the drawer and attaches delegating action listeners.
   * @returns {void}
   */
  connectedCallback() {
    this.listContainer = this.querySelector('[data-wishlist-items]');
    this.emptyState = this.querySelector('[data-wishlist-empty]');
    this.innerWrapper = this.querySelector('.wishlist-drawer__inner') || this;

    this.render();
    this.boundHandler = this.render.bind(this);
    window.addEventListener('wishlist:change', this.boundHandler);

    this.addEventListener('click', async (event) => {
      const target = /** @type {HTMLElement} */ (event.target);

      // 1. Remove Item
      const removeBtn = target.closest('[data-remove-handle]');
      if (removeBtn) {
        event.preventDefault();
        event.stopPropagation();
        const handle = /** @type {HTMLElement} */ (removeBtn).dataset.removeHandle;
        if (handle) WishlistManager.remove(handle);
        return;
      }

      // 2. Add to Cart from Wishlist
      const addCartBtn = /** @type {HTMLButtonElement | null} */ (target.closest('[data-wishlist-add-to-cart]'));
      if (addCartBtn) {
        event.preventDefault();
        event.stopPropagation();
        const variantId = addCartBtn.dataset.variantId;
        const handle = addCartBtn.dataset.handle;
        if (!variantId) {
          window.location.href = addCartBtn.dataset.url || `/products/${handle}`;
          return;
        }

        addCartBtn.disabled = true;
        const origText = addCartBtn.innerHTML;
        addCartBtn.innerHTML = '<span class="button-text">Adding...</span>';

        try {
          const res = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ items: [{ id: parseInt(variantId, 10), quantity: 1 }] })
          });

          if (res.ok) {
            await updateCartState();
            addCartBtn.innerHTML = '<span class="button-text">Added! ✓</span>';
            setTimeout(() => {
              if (handle) WishlistManager.remove(handle);
            }, 600);
          } else {
            addCartBtn.disabled = false;
            addCartBtn.innerHTML = origText;
          }
        } catch (err) {
          console.error('Error adding wishlist item to cart', err);
          addCartBtn.disabled = false;
          addCartBtn.innerHTML = origText;
        }
      }
    });
  }

  /**
   * Removes change listener upon disconnection.
   * @returns {void}
   */
  disconnectedCallback() {
    window.removeEventListener('wishlist:change', this.boundHandler);
  }

  /**
   * Renders the current list of wishlist cards in the drawer container.
   * @returns {void}
   */
  render() {
    const items = WishlistManager.getItems();
    if (!this.listContainer) return;

    if (items.length === 0) {
      this.listContainer.innerHTML = '';
      if (this.innerWrapper) {
        this.innerWrapper.classList.add('wishlist-drawer--empty');
      }
      return;
    }

    if (this.innerWrapper) {
      this.innerWrapper.classList.remove('wishlist-drawer--empty');
    }

    this.listContainer.innerHTML = items.map((item) => `
      <div class="wishlist-item" data-handle="${item.handle}">
        <div class="wishlist-item__media">
          <a href="${item.url}" class="wishlist-item__media-container">
            ${item.image ? `<img src="${item.image}" alt="${item.title}" class="wishlist-item__media-image" width="72" height="72" loading="lazy">` : `<div class="wishlist-item__media-image" style="background-color: var(--color-background-secondary);"></div>`}
          </a>
        </div>
        <div class="wishlist-item__details">
          <div class="wishlist-item__title-row">
            <a href="${item.url}" class="wishlist-item__title">${item.title}</a>
            <span class="wishlist-item__price">${item.price}</span>
          </div>
          <div class="wishlist-item__actions">
            <button
              type="button"
              class="button button-secondary wishlist-item__add-to-cart"
              data-wishlist-add-to-cart
              data-variant-id="${item.variantId || ''}"
              data-handle="${item.handle}"
              data-url="${item.url}"
            >
              <span class="button-text">Add to cart</span>
            </button>
            <button
              type="button"
              class="wishlist-item__remove-btn"
              data-remove-handle="${item.handle}"
              aria-label="Remove ${item.title} from wishlist"
            >
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path class="remove-icon-bottom" d="M11.5 9v4.25M8.5 9v4.25M5.75 12.2V6h8.5c0 2.421 0 3.779 0 6.2 0 .853 0 1.447-.038 1.91-.037.453-.106.714-.207.911a2.498 2.498 0 0 1-.983 1.017c-.197.1-.458.17-.911.207-.463.037-1.057.038-1.91.038h-.4c-.853 0-1.447 0-1.91-.038-.453-.037-.714-.106-.911-.207a2.498 2.498 0 0 1-.984-1.017c-.1-.197-.17-.458-.207-.911C5.75 13.647 5.75 13.053 5.75 12.2z" stroke="currentColor" stroke-width="var(--icon-stroke-width, 1.5)" stroke-linecap="round"/>
                <path class="remove-icon-top" d="M4.25 6h11.5M8 5.25a2 2 0 1 1 4 0" stroke="currentColor" stroke-width="var(--icon-stroke-width, 1.5)" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

if (!customElements.get('wishlist-button')) {
  customElements.define('wishlist-button', WishlistButton);
}
if (!customElements.get('wishlist-count')) {
  customElements.define('wishlist-count', WishlistCount);
}
if (!customElements.get('wishlist-drawer')) {
  customElements.define('wishlist-drawer', WishlistDrawer);
}

