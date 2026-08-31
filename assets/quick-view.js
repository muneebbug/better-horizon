/**
 * Better Horizon — Quick View Web Component
 * Accessible modal dialog fetching product information on demand.
 */

export class QuickViewModal extends HTMLElement {
  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    this.content = this.querySelector('[data-quick-view-content]');
    this.closeBtn = this.querySelector('[data-quick-view-close]');

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.dialog) {
      this.dialog.addEventListener('cancel', () => this.close());
      this.dialog.addEventListener('click', (e) => {
        if (e.target === this.dialog) this.close();
      });
    }

    document.addEventListener('quick-view:open', (e) => {
      if (e.detail && e.detail.url) {
        this.open(e.detail.url, e.detail.trigger);
      }
    });
  }

  async open(productUrl, triggerEl) {
    this.previousFocus = triggerEl || document.activeElement;
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
 * <quick-view-button> Web Component
 */
export class QuickViewButton extends HTMLElement {
  connectedCallback() {
    this.button = this.querySelector('button');
    this.url = this.dataset.productUrl;

    if (this.button && this.url) {
      this.button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
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
