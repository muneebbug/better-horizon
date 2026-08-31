/**
 * Better Horizon — Geo-based Market Suggestion Banner
 * Detects visitor market via Shopify Markets API (/browsing_context_suggestions.json)
 * and prompts them to switch if their location differs from the active store country.
 *
 * @module market-banner
 */

/**
 * @typedef {object} DetectedCountry
 * @property {string} [name] - The human-readable name of the country.
 * @property {string} [handle] - The country handle / ISO code (e.g. 'PK', 'US').
 * @property {string} [iso_code] - The ISO 3166-1 alpha-2 code.
 */

/**
 * @typedef {object} MarketSuggestion
 * @property {string} [action_url] - Direct URL for market redirect.
 * @property {string} [country_code] - The country code for this suggestion.
 * @property {DetectedCountry} [country] - The country object for this suggestion.
 */

/**
 * @typedef {object} BrowsingContextResponse
 * @property {{ country?: DetectedCountry, country_name?: string, country_code?: string }} [detected_values] - Detected country details.
 * @property {MarketSuggestion[]} [suggestions] - Array of suggestions from Shopify.
 */

/**
 * Custom element managing the geo-located market banner prompt.
 *
 * @extends {HTMLElement}
 */
export class MarketBanner extends HTMLElement {
  /** @type {string | undefined} */
  currentCountry;

  /** @type {string} */
  dismissKey = 'better_horizon_market_dismissed';

  /** @type {HTMLElement | null} */
  banner;

  /** @type {HTMLElement | null} */
  countryNameEl;

  /** @type {HTMLButtonElement | null} */
  switchBtn;

  /** @type {HTMLButtonElement | null} */
  dismissBtn;

  /**
   * Initializes references and queries Shopify Browsing Context Suggestions API.
   * @returns {void}
   */
  connectedCallback() {
    this.currentCountry = this.dataset.currentCountry;

    if (sessionStorage.getItem(this.dismissKey)) return;

    this.banner = this.querySelector('[data-market-banner-inner]');
    this.countryNameEl = this.querySelector('[data-detected-country-name]');
    this.switchBtn = this.querySelector('[data-market-switch-btn]');
    this.dismissBtn = this.querySelector('[data-market-dismiss-btn]');

    if (this.dismissBtn) {
      this.dismissBtn.addEventListener('click', () => this.dismiss());
    }

    this.checkMarketSuggestion();
  }

  /**
   * Asynchronously fetches contextual recommendations and displays the banner if a different country is detected.
   * @returns {Promise<void>}
   */
  async checkMarketSuggestion() {
    try {
      const res = await fetch('/browsing_context_suggestions.json');
      if (!res.ok) return;

      /** @type {BrowsingContextResponse} */
      const data = await res.json();
      const detectedCountry = data.detected_values?.country;

      // Extract country code from handle, iso_code, or country_code
      const detectedCode = (
        detectedCountry?.handle ||
        detectedCountry?.iso_code ||
        data.detected_values?.country_code ||
        ''
      ).trim().toUpperCase();

      const detectedName =
        detectedCountry?.name ||
        data.detected_values?.country_name ||
        'your region';

      const currentCode = (this.currentCountry || '').trim().toUpperCase();

      // If no valid country detected or visitor is already in the matching country, do not show
      if (!detectedCode || detectedCode === currentCode) {
        return;
      }

      const suggestions = data.suggestions || [];
      const firstSuggestion = suggestions[0];
      const targetCode = (
        firstSuggestion?.country_code ||
        firstSuggestion?.country?.handle ||
        firstSuggestion?.country?.iso_code ||
        detectedCode
      ).trim().toUpperCase();

      if (this.countryNameEl) {
        this.countryNameEl.textContent = detectedName;
      }

      if (this.switchBtn) {
        this.switchBtn.textContent = `Switch to ${detectedName}`;
        this.switchBtn.addEventListener('click', () => {
          // If suggestion has a direct URL, redirect
          if (firstSuggestion?.action_url) {
            sessionStorage.setItem(this.dismissKey, 'true');
            window.location.href = firstSuggestion.action_url;
            return;
          }

          // Otherwise submit standard localization form
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = '/localization';

          const methodInput = document.createElement('input');
          methodInput.type = 'hidden';
          methodInput.name = '_method';
          methodInput.value = 'PUT';
          form.appendChild(methodInput);

          const countryInput = document.createElement('input');
          countryInput.type = 'hidden';
          countryInput.name = 'country_code';
          countryInput.value = targetCode;
          form.appendChild(countryInput);

          const returnToInput = document.createElement('input');
          returnToInput.type = 'hidden';
          returnToInput.name = 'return_to';
          returnToInput.value = window.location.pathname + window.location.search;
          form.appendChild(returnToInput);

          document.body.appendChild(form);
          sessionStorage.setItem(this.dismissKey, 'true');
          form.submit();
        });
      }

      this.show();
    } catch {
      // Silently ignore network or API errors
    }
  }

  /**
   * Shows the market suggestion banner.
   * @returns {void}
   */
  show() {
    this.removeAttribute('hidden');
    this.classList.add('is-visible');
  }

  /**
   * Dismisses the market suggestion banner for the rest of the user session.
   * @returns {void}
   */
  dismiss() {
    sessionStorage.setItem(this.dismissKey, 'true');
    this.classList.remove('is-visible');
    setTimeout(() => {
      this.setAttribute('hidden', '');
    }, 300);
  }
}

if (!customElements.get('market-banner')) {
  customElements.define('market-banner', MarketBanner);
}


