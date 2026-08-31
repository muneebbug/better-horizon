/**
 * Better Horizon — Native Cookie & Privacy Consent Banner
 * Implements Shopify Customer Privacy API and Google Analytics 4 Consent Mode v2.
 * Zero external paid app dependency.
 *
 * @module cookie-consent
 */

/**
 * @typedef {object} ConsentState
 * @property {boolean} analytics - Whether analytics consent was granted.
 * @property {boolean} marketing - Whether marketing consent was granted.
 * @property {number} timestamp - Epoch timestamp of when consent was updated.
 */

/**
 * Custom element managing cookie consent banner, modal preferences dialog,
 * Shopify Customer Privacy API integration, and GA4 Consent Mode v2 updates.
 *
 * @extends {HTMLElement}
 */
export class CookieConsentBanner extends HTMLElement {
  /** @type {string} */
  storageKey = 'better_horizon_consent_state';

  /** @type {HTMLElement | null} */
  banner;

  /** @type {HTMLDialogElement | null} */
  modal;

  /** @type {HTMLButtonElement | null} */
  acceptBtn;

  /** @type {HTMLButtonElement | null} */
  declineBtn;

  /** @type {HTMLButtonElement | null} */
  prefsBtn;

  /** @type {HTMLButtonElement | null} */
  savePrefsBtn;

  /** @type {HTMLButtonElement | null} */
  closeModalBtn;

  /** @type {HTMLInputElement | null} */
  analyticsCheckbox;

  /** @type {HTMLInputElement | null} */
  marketingCheckbox;

  /**
   * Initializes references, binds event listeners, and checks existing consent state.
   * @returns {void}
   */
  connectedCallback() {
    this.banner = this.querySelector('[data-consent-banner]');
    this.modal = this.querySelector('[data-consent-modal]');
    this.acceptBtn = this.querySelector('[data-consent-accept-all]');
    this.declineBtn = this.querySelector('[data-consent-decline-all]');
    this.prefsBtn = this.querySelector('[data-consent-prefs]');
    this.savePrefsBtn = this.querySelector('[data-consent-save-prefs]');
    this.closeModalBtn = this.querySelector('[data-consent-close-modal]');

    this.analyticsCheckbox = this.querySelector('[data-consent-analytics]');
    this.marketingCheckbox = this.querySelector('[data-consent-marketing]');

    this.initEvents();
    this.checkConsent();
  }

  /**
   * Registers DOM event listeners for buttons and global preference triggers.
   * @returns {void}
   */
  initEvents() {
    if (this.acceptBtn) {
      this.acceptBtn.addEventListener('click', () => this.setConsent(true, true));
    }
    if (this.declineBtn) {
      this.declineBtn.addEventListener('click', () => this.setConsent(false, false));
    }
    if (this.prefsBtn) {
      this.prefsBtn.addEventListener('click', () => this.openPreferences());
    }
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => this.closePreferences());
    }
    if (this.savePrefsBtn) {
      this.savePrefsBtn.addEventListener('click', () => {
        const analytics = this.analyticsCheckbox ? this.analyticsCheckbox.checked : false;
        const marketing = this.marketingCheckbox ? this.marketingCheckbox.checked : false;
        this.setConsent(analytics, marketing);
        this.closePreferences();
      });
    }

    // Allow external triggers to re-open preferences (e.g. from footer privacy links)
    document.addEventListener('cookie-consent:open-preferences', () => this.openPreferences());
  }

  /**
   * Checks localStorage for an existing consent state; displays the banner if not set.
   * @returns {void}
   */
  checkConsent() {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) {
      this.showBanner();
    } else {
      try {
        /** @type {ConsentState} */
        const state = JSON.parse(saved);
        this.applyConsentToVendors(state.analytics, state.marketing);
      } catch {
        this.showBanner();
      }
    }
  }

  /**
   * Displays the cookie consent banner.
   * @returns {void}
   */
  showBanner() {
    if (this.banner) {
      this.banner.removeAttribute('hidden');
      this.banner.classList.add('is-visible');
    }
  }

  /**
   * Hides the cookie consent banner with transition delay.
   * @returns {void}
   */
  hideBanner() {
    if (this.banner) {
      this.banner.classList.remove('is-visible');
      setTimeout(() => this.banner?.setAttribute('hidden', ''), 300);
    }
  }

  /**
   * Opens the granular preferences modal dialog.
   * @returns {void}
   */
  openPreferences() {
    if (this.modal) {
      this.modal.showModal();
    }
  }

  /**
   * Closes the granular preferences modal dialog.
   * @returns {void}
   */
  closePreferences() {
    if (this.modal) {
      this.modal.close();
    }
  }

  /**
   * Saves consent preferences to localStorage, synchronizes with APIs, and hides banner.
   *
   * @param {boolean} analytics - Whether analytics consent is granted.
   * @param {boolean} marketing - Whether marketing consent is granted.
   * @returns {void}
   */
  setConsent(analytics, marketing) {
    /** @type {ConsentState} */
    const state = { analytics, marketing, timestamp: Date.now() };
    localStorage.setItem(this.storageKey, JSON.stringify(state));

    this.applyConsentToVendors(analytics, marketing);
    this.hideBanner();
  }

  /**
   * Dispatches consent directives to Shopify Customer Privacy API, GA4 Consent Mode, and custom events.
   *
   * @param {boolean} analytics - Analytics consent state.
   * @param {boolean} marketing - Marketing consent state.
   * @returns {void}
   */
  applyConsentToVendors(analytics, marketing) {
    // 1. Shopify Customer Privacy API
    // @ts-ignore
    if (window.Shopify && window.Shopify.customerPrivacy) {
      // @ts-ignore
      if (typeof window.Shopify.customerPrivacy.setTrackingConsent === 'function') {
        // @ts-ignore
        window.Shopify.customerPrivacy.setTrackingConsent(
          {
            analytics,
            marketing,
            preferences: true,
            sale_of_data: false
          },
          () => {}
        );
      }
    }

    // 2. Google Analytics 4 Consent Mode v2
    // @ts-ignore
    if (typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('consent', 'update', {
        ad_storage: marketing ? 'granted' : 'denied',
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_user_data: marketing ? 'granted' : 'denied',
        ad_personalization: marketing ? 'granted' : 'denied'
      });
    }

    // 3. Custom Event for other theme scripts
    document.dispatchEvent(new CustomEvent('consent:updated', {
      detail: { analytics, marketing }
    }));
  }
}

if (!customElements.get('cookie-consent-banner')) {
  customElements.define('cookie-consent-banner', CookieConsentBanner);
}

