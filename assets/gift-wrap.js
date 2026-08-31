/**
 * Better Horizon — Gift Wrap & Note Component
 * Manages line-item properties (properties[Gift wrap], properties[Gift note], etc.)
 * with accessible disclosure toggling, input disabling when hidden, and character counting.
 *
 * @module gift-wrap
 */

import { Component } from '@theme/component';
import { StandardEvents } from '@shopify/events';

/**
 * @typedef {object} GiftWrapRefs
 * @property {HTMLInputElement} [toggleCheckbox] - Checkbox triggering gift wrap or note.
 * @property {HTMLElement} [disclosurePanel] - Collapsible container holding note fields.
 * @property {HTMLTextAreaElement} [noteTextarea] - Gift note message textarea.
 * @property {HTMLInputElement} [toInput] - Optional recipient name input.
 * @property {HTMLInputElement} [fromInput] - Optional sender name input.
 * @property {HTMLElement} [characterCount] - Character counter element.
 * @property {HTMLElement} [liveRegion] - Live region for accessibility announcements.
 */

/**
 * Custom element managing gift note & gift wrap line-item properties on product forms.
 * @extends {Component<GiftWrapRefs>}
 */
export class GiftWrapOption extends Component {
  /** @type {(() => void) | null} */
  #cartAddEventBound = null;

  connectedCallback() {
    super.connectedCallback();
    this.#initializeState();
    this.#bindEvents();

    this.#cartAddEventBound = (event) => {
      if (event.action === 'add') {
        event.promise?.then(() => this.#resetForm()).catch(() => {});
      }
    };
    document.addEventListener(StandardEvents.cartLinesUpdate, this.#cartAddEventBound);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#cartAddEventBound) {
      document.removeEventListener(StandardEvents.cartLinesUpdate, this.#cartAddEventBound);
      this.#cartAddEventBound = null;
    }
  }

  /**
   * Initializes input states based on initial checkbox checked status or mode.
   * @returns {void}
   */
  #initializeState() {
    const isCollapsible = this.dataset.mode === 'collapsible';
    if (isCollapsible && this.refs.toggleCheckbox) {
      this.#updateVisibility(this.refs.toggleCheckbox.checked, false);
    } else {
      this.#enableFields();
    }
    this.#updateCharacterCount();
  }

  /**
   * Binds change and input events.
   * @returns {void}
   */
  #bindEvents() {
    if (this.refs.toggleCheckbox) {
      this.refs.toggleCheckbox.onchange = (event) => {
        const target = /** @type {HTMLInputElement} */ (event.target);
        this.#updateVisibility(target.checked, true);
      };
    }

    if (this.refs.noteTextarea) {
      this.refs.noteTextarea.oninput = () => {
        this.#updateCharacterCount();
      };
    }
  }

  /**
   * Toggles visibility and enabled state of disclosure panel and inputs.
   * @param {boolean} isExpanded
   * @param {boolean} announce
   * @returns {void}
   */
  #updateVisibility(isExpanded, announce = true) {
    const panel = this.refs.disclosurePanel;
    const checkbox = this.refs.toggleCheckbox;

    if (checkbox) {
      checkbox.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }

    if (panel) {
      if (isExpanded) {
        panel.removeAttribute('hidden');
        panel.classList.add('is-open');
        this.#enableFields();
        this.#updateCharacterCount();

        if (announce && this.refs.liveRegion) {
          this.refs.liveRegion.textContent = 'Gift note fields are now open.';
        }

        // Smooth focus into textarea
        setTimeout(() => {
          this.refs.noteTextarea?.focus();
        }, 100);
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.remove('is-open');
        this.#disableFields();

        if (announce && this.refs.liveRegion) {
          this.refs.liveRegion.textContent = 'Gift note fields are now hidden.';
        }
      }
    }
  }

  /**
   * Enables inputs in the disclosure so their line-item properties are submitted.
   * @returns {void}
   */
  #enableFields() {
    const inputs = this.#getAllInputs();
    inputs.forEach((input) => {
      input.disabled = false;
    });
  }

  /**
   * Disables inputs and clears values so empty line-item properties are NOT submitted.
   * @returns {void}
   */
  #disableFields() {
    const isCollapsible = this.dataset.mode === 'collapsible';
    if (!isCollapsible) return;

    const inputs = this.#getAllInputs();
    inputs.forEach((input) => {
      input.value = '';
      input.disabled = true;
    });
    this.#updateCharacterCount();
  }

  /**
   * Gets all text and textarea inputs within the disclosure panel.
   * @returns {(HTMLInputElement | HTMLTextAreaElement)[]}
   */
  #getAllInputs() {
    const list = [];
    if (this.refs.noteTextarea) list.push(this.refs.noteTextarea);
    if (this.refs.toInput) list.push(this.refs.toInput);
    if (this.refs.fromInput) list.push(this.refs.fromInput);
    return list;
  }

  /**
   * Updates live character counter display.
   * @returns {void}
   */
  #updateCharacterCount() {
    if (!this.refs.characterCount || !this.refs.noteTextarea) return;

    const currentLength = this.refs.noteTextarea.value.length;
    const maxLength = this.refs.noteTextarea.maxLength || 200;

    const template = this.refs.characterCount.getAttribute('data-template');
    if (!template) return;

    const updatedText = template
      .replace('[current]', currentLength.toString())
      .replace('[max]', maxLength.toString());

    this.refs.characterCount.textContent = updatedText;
  }

  /**
   * Resets form values after adding to cart.
   * @returns {void}
   */
  #resetForm() {
    if (this.refs.toggleCheckbox) {
      this.refs.toggleCheckbox.checked = false;
      this.#updateVisibility(false, false);
    } else {
      this.#getAllInputs().forEach((input) => {
        input.value = '';
      });
      this.#updateCharacterCount();
    }
  }
}

if (!customElements.get('gift-wrap-option')) {
  customElements.define('gift-wrap-option', GiftWrapOption);
}
