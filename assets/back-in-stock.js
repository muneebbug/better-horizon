/**
 * Better Horizon — Back in Stock Web Component
 * Allows customers to request notification when an out-of-stock item is replenished.
 *
 * @module back-in-stock
 */

/**
 * Custom element managing the back-in-stock notification capture form and submission.
 *
 * @extends {HTMLElement}
 */
export class BackInStockForm extends HTMLElement {
  /** @type {HTMLFormElement | null} */
  form;

  /** @type {HTMLInputElement | null} */
  emailInput;

  /** @type {HTMLElement | null} */
  statusMessage;

  /** @type {HTMLButtonElement | null} */
  submitButton;

  /** @type {(event: SubmitEvent) => void} */
  boundSubmit;

  /**
   * Initializes references and binds the submit event listener.
   * @returns {void}
   */
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

  /**
   * Removes submit listener upon disconnection.
   * @returns {void}
   */
  disconnectedCallback() {
    if (this.form) {
      this.form.removeEventListener('submit', this.boundSubmit);
    }
  }

  /**
   * Asynchronously submits the notification request form via fetch.
   *
   * @param {SubmitEvent} event - The form submit event.
   * @returns {Promise<void>}
   */
  async handleSubmit(event) {
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
            'Accept': 'application/json'
          }
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
  }

  /**
   * Displays the confirmation success state and focuses the status message for screen readers.
   * @returns {void}
   */
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

