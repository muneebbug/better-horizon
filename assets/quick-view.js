/**
 * Better Horizon — Quick View Web Component
 * Accessible modal dialog fetching product information on demand.
 *
 * @module quick-view
 */

/**
 * Custom element managing the Quick View modal dialog and dynamic content fetching.
 *
 * @extends {HTMLElement}
 */
export class QuickViewModal extends HTMLElement {
  /** @type {HTMLDialogElement | null} */
  dialog;

  /** @type {HTMLElement | null} */
  content;

  /** @type {HTMLButtonElement | null} */
  closeBtn;

  /** @type {HTMLElement | null} */
  previousFocus = null;

  /**
   * Initializes modal references and listens for `quick-view:open` global events.
   * @returns {void}
   */
  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    this.content = this.querySelector('[data-quick-view-content]');
    this.closeBtn = this.querySelector('[data-quick-view-close]');

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.dialog) {
      this.dialog.addEventListener('cancel', () => this.close());
      this.dialog.addEventListener('click', (event) => {
        if (event.target === this.dialog) this.close();
      });
    }

    document.addEventListener('quick-view:open', (event) => {
      const customEvent = /** @type {CustomEvent<{ url: string, trigger?: HTMLElement }>} */ (event);
      if (customEvent.detail && customEvent.detail.url) {
        this.open(customEvent.detail.url, customEvent.detail.trigger);
      }
    });
  }

  /**
   * Opens the quick view modal dialog and asynchronously fetches product content.
   *
   * @param {string} productUrl - The product URL to fetch.
   * @param {HTMLElement} [triggerEl] - The triggering element to return focus to on close.
   * @returns {Promise<void>}
   */
  async open(productUrl, triggerEl) {
    this.previousFocus = triggerEl || /** @type {HTMLElement | null} */ (document.activeElement);
    if (this.dialog) {
      this.dialog.showModal();
      document.body.style.overflow = 'hidden';
    }

    if (this.content) {
      this.content.innerHTML = '<div class="quick-view__loading"><span class="loading-spinner"></span>Loading product...</div>';
      try {
        const response = await fetch(`${productUrl}?view=quick-view`);
        if (response.ok) {
          const html = await response.text();
          this.content.innerHTML = html;
        } else {
          // Fallback to fetching regular product page content
          const fallback = await fetch(productUrl);
          const fallbackText = await fallback.text();
          const doc = new DOMParser().parseFromString(fallbackText, 'text/html');
          const productInfo = doc.querySelector('.product-information') || doc.querySelector('#MainContent');
          if (productInfo) {
            this.content.innerHTML = productInfo.innerHTML;
          } else {
            window.location.href = productUrl;
          }
        }
      } catch (err) {
        console.error('Quick view fetch error', err);
        window.location.href = productUrl;
      }
    }
  }

  /**
   * Closes the quick view modal dialog and restores focus to the triggering element.
   * @returns {void}
   */
  close() {
    if (this.dialog) {
      this.dialog.close();
      document.body.style.overflow = '';
    }
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
  }
}

/**
 * Custom element representing a trigger button that requests opening the Quick View modal.
 *
 * @extends {HTMLElement}
 */
export class QuickViewButton extends HTMLElement {
  /** @type {HTMLButtonElement | null} */
  button;

  /** @type {string | undefined} */
  url;

  /**
   * Attaches click handler to dispatch the `quick-view:open` event.
   * @returns {void}
   */
  connectedCallback() {
    this.button = this.querySelector('button');
    this.url = this.dataset.productUrl;

    if (this.button && this.url) {
      this.button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        document.dispatchEvent(new CustomEvent('quick-view:open', {
          detail: { url: this.url, trigger: this.button }
        }));
      });
    }
  }
}

if (!customElements.get('quick-view-modal')) {
  customElements.define('quick-view-modal', QuickViewModal);
}
if (!customElements.get('quick-view-button')) {
  customElements.define('quick-view-button', QuickViewButton);
}

