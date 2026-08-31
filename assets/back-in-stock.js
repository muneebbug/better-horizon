/**
 * Better Horizon — Back in Stock Web Component
 * Allows customers to request notification when an out-of-stock item is replenished.
 */

export class BackInStockForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.emailInput = this.querySelector('input[type="email"]');
    this.statusMessage = this.querySelector('[data-status-message]');
    this.submitButton = this.querySelector('button[type="submit"]');

    if (this.form) {
      this.boundSubmit = this.handleSubmit.bind(this);
      this.form.addEventListener('submit', this.boundSubmit);
    }
  }

  disconnectedCallback() {
    if (this.form) {
      this.form.removeEventListener('submit', this.boundSubmit);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.emailInput || !this.emailInput.value) return;

    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.setAttribute('aria-busy', 'true');
    }

    try {
      const formData = new FormData(this.form);
      const response = await fetch(this.form.action || '/contact#contact_form', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

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
  }

  showSuccess() {
    if (this.form) this.form.style.display = 'none';
    if (this.statusMessage) {
      this.statusMessage.removeAttribute('hidden');
      this.statusMessage.focus();
    }
  }
}

if (!customElements.get('back-in-stock-form')) {
  customElements.define('back-in-stock-form', BackInStockForm);
}
