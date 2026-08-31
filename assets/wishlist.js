/**
 * Better Horizon — Native Wishlist Web Components
 * Zero-app, localStorage-backed with cross-tab and cross-component synchronization.
 */

const STORAGE_KEY = 'better_horizon_wishlist';

/**
 * Refreshes the cart drawer section markup in the background and updates header bubbles without opening the cart drawer.
 */
export async function updateCartState() {
  try {
    const cartItemsComp = document.querySelector('#cart-drawer cart-items-component') || document.querySelector('cart-items-component');
    const sectionId = cartItemsComp?.dataset.sectionId || 'cart-drawer-section';

    const [sectionRes, cartRes] = await Promise.all([
      fetch(`/?section_id=${sectionId}`),
      fetch('/cart.js')
    ]);

    if (sectionRes.ok) {
      const sectionHtml = await sectionRes.text();
      const doc = new DOMParser().parseFromString(sectionHtml, 'text/html');

      // Strictly target #cart-drawer
      const newDrawerInner = doc.querySelector('#cart-drawer .cart-drawer__inner') || doc.querySelector('#cart-drawer dialog');
      const currentDrawerInner = document.querySelector('#cart-drawer .cart-drawer__inner') || document.querySelector('#cart-drawer dialog');

      if (newDrawerInner && currentDrawerInner) {
        currentDrawerInner.innerHTML = newDrawerInner.innerHTML;
        if (newDrawerInner.className) {
          currentDrawerInner.className = newDrawerInner.className;
        }
      }
    }

    if (cartRes.ok) {
      const cartData = await cartRes.json();
      document.querySelectorAll('cart-icon').forEach(icon => {
        const countEl = icon.querySelector('.cart-bubble__text-count');
        const bubble = icon.querySelector('.cart-bubble');
        if (countEl) {
          countEl.textContent = cartData.item_count > 0 ? cartData.item_count : '';
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
    }
  } catch (err) {
    console.error('Error updating cart state', err);
  }
}

export class WishlistManager {
  /**
   * @returns {Array<{id: string, handle: string, title: string, price: string, image: string, url: string, variantId?: string}>}
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
   * @param {Array} items
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
   * @param {string} handle
   * @returns {boolean}
   */
  static has(handle) {
    if (!handle) return false;
    return this.getItems().some(item => item.handle === handle);
  }

  /**
   * @param {object} item
   */
  static toggle(item) {
    if (!item || !item.handle) return;
    const items = this.getItems();
    const index = items.findIndex(i => i.handle === item.handle);
    if (index > -1) {
      items.splice(index, 1);
    } else {
      items.push(item);
    }
    this.saveItems(items);
  }

  /**
   * @param {string} handle
   */
  static remove(handle) {
    const items = this.getItems().filter(i => i.handle !== handle);
    this.saveItems(items);
  }
}

/**
 * <wishlist-button> Web Component
 */
export class WishlistButton extends HTMLElement {
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

  disconnectedCallback() {
    if (this.button) {
      this.button.removeEventListener('click', this.boundClickHandler);
    }
    window.removeEventListener('wishlist:change', this.boundChangeHandler);
  }

  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    WishlistManager.toggle({
      id: this.productId,
      variantId: this.variantId,
      handle: this.productHandle,
      title: this.productTitle,
      price: this.productPrice,
      image: this.productImage,
      url: this.productUrl
    });

    this.updateState();
  }

  updateState() {
    const isSaved = WishlistManager.has(this.productHandle);
    this.setAttribute('data-active', isSaved ? 'true' : 'false');
    if (this.button) {
      this.button.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
      const label = isSaved ? 'Remove from wishlist' : 'Add to wishlist';
      this.button.setAttribute('aria-label', `${label}: ${this.productTitle}`);
    }
  }
}

/**
 * <wishlist-count> Web Component
 */
export class WishlistCount extends HTMLElement {
  connectedCallback() {
    this.updateCount();
    this.boundHandler = this.updateCount.bind(this);
    window.addEventListener('wishlist:change', this.boundHandler);
  }

  disconnectedCallback() {
    window.removeEventListener('wishlist:change', this.boundHandler);
  }

  updateCount() {
    const count = WishlistManager.getItems().length;
    this.textContent = count > 0 ? count : '';
    this.setAttribute('data-count', count);

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
 * <wishlist-drawer> Web Component
 */
export class WishlistDrawer extends HTMLElement {
  connectedCallback() {
    this.listContainer = this.querySelector('[data-wishlist-items]');
    this.emptyState = this.querySelector('[data-wishlist-empty]');
    this.innerWrapper = this.querySelector('.wishlist-drawer__inner') || this;

    this.render();
    this.boundHandler = this.render.bind(this);
    window.addEventListener('wishlist:change', this.boundHandler);

    this.addEventListener('click', async (e) => {
      // 1. Remove Item
      const removeBtn = e.target.closest('[data-remove-handle]');
      if (removeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const handle = removeBtn.dataset.removeHandle;
        WishlistManager.remove(handle);
        return;
      }

      // 2. Add to Cart from Wishlist
      const addCartBtn = e.target.closest('[data-wishlist-add-to-cart]');
      if (addCartBtn) {
        e.preventDefault();
        e.stopPropagation();
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
            // Update cart drawer and bubble in the background
            await updateCartState();

            // Give visual feedback and then remove from wishlist
            addCartBtn.innerHTML = '<span class="button-text">Added! ✓</span>';
            setTimeout(() => {
              WishlistManager.remove(handle);
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

  disconnectedCallback() {
    window.removeEventListener('wishlist:change', this.boundHandler);
  }

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

    this.listContainer.innerHTML = items.map(item => `
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
