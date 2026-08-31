/**
 * Better Horizon — Native Cookie & Privacy Consent Banner
 * Implements Shopify Customer Privacy API and Google Analytics 4 Consent Mode v2.
 * Zero external paid app dependency.
 */

export class CookieConsentBanner extends HTMLElement {
  connectedCallback() {
    this.storageKey = 'better_horizon_consent_state';
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

  checkConsent() {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) {
      this.showBanner();
    } else {
      try {
        const state = JSON.parse(saved);
        this.applyConsentToVendors(state.analytics, state.marketing);
      } catch {
        this.showBanner();
      }
    }
  }

  showBanner() {
    if (this.banner) {
      this.banner.removeAttribute('hidden');
      this.banner.classList.add('is-visible');
    }
  }

  hideBanner() {
    if (this.banner) {
      this.banner.classList.remove('is-visible');
      setTimeout(() => this.banner.setAttribute('hidden', ''), 300);
    }
  }

  openPreferences() {
    if (this.modal) {
      this.modal.showModal();
    }
  }

  closePreferences() {
    if (this.modal) {
      this.modal.close();
    }
  }

  setConsent(analytics, marketing) {
    const state = { analytics, marketing, timestamp: Date.now() };
    localStorage.setItem(this.storageKey, JSON.stringify(state));

    this.applyConsentToVendors(analytics, marketing);
    this.hideBanner();
  }

  applyConsentToVendors(analytics, marketing) {
    // 1. Shopify Customer Privacy API
    if (window.Shopify && window.Shopify.customerPrivacy) {
      if (typeof window.Shopify.customerPrivacy.setTrackingConsent === 'function') {
        window.Shopify.customerPrivacy.setTrackingConsent(
          {
            analytics: analytics,
            marketing: marketing,
            preferences: true,
            sale_of_data: false
          },
          () => {}
        );
      }
    }

    // 2. Google Analytics 4 Consent Mode v2
    if (typeof window.gtag === 'function') {
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
