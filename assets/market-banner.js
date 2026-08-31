/**
 * Better Horizon — Geo-based Market Suggestion Banner
 * Detects visitor market via Shopify Markets API (/browsing_context_suggestions.json)
 * and prompts them to switch if their location differs from the active store country.
 */

export class MarketBanner extends HTMLElement {
  connectedCallback() {
    this.currentCountry = this.dataset.currentCountry;
    this.dismissKey = 'better_horizon_market_dismissed';

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

  async checkMarketSuggestion() {
    try {
      const res = await fetch('/browsing_context_suggestions.json');
      if (!res.ok) return;

      const data = await res.json();
      const detected = data.detected_values?.country;
      const suggestions = data.suggestions;

      if (!detected || detected.iso_code === this.currentCountry) {
        return;
      }

      if (this.countryNameEl) {
        this.countryNameEl.textContent = detected.name;
      }

      if (this.switchBtn) {
        this.switchBtn.textContent = `Switch to ${detected.name}`;
        this.switchBtn.addEventListener('click', () => {
          // If suggestion has a direct URL, redirect
          if (suggestions && suggestions.length > 0 && suggestions[0].action_url) {
            window.location.href = suggestions[0].action_url;
            return;
          }
          // Otherwise submit localization form
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
          countryInput.value = detected.iso_code;
          form.appendChild(countryInput);

          document.body.appendChild(form);
          form.submit();
        });
      }

      this.show();
    } catch {
      // Silently ignore network or API errors
    }
  }

  show() {
    this.removeAttribute('hidden');
    this.classList.add('is-visible');
  }

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
