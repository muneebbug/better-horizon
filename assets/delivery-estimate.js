/**
 * Better Horizon — Estimated Delivery Date & Shipping Estimator
 * Calculates accurate delivery date windows, live order cutoff countdowns,
 * and ZIP/postal-code-based shipping estimates with cross-page persistence.
 *
 * @module delivery-estimate
 */

import { Component } from '@theme/component';
import { StandardEvents } from '@shopify/events';
import { formatMoney } from '@theme/money-formatting';

const STORAGE_KEY_ZIP = 'better_horizon_delivery_zip';
const STORAGE_KEY_COUNTRY = 'better_horizon_delivery_country';
const ZIP_UPDATED_EVENT = 'delivery-estimate:zip-updated';

/**
 * @typedef {object} DeliveryEstimateRefs
 * @property {HTMLElement} [dateRangeEl] - Container displaying computed delivery dates.
 * @property {HTMLElement} [cutoffCountdownEl] - Element displaying live countdown timer.
 * @property {HTMLElement} [cutoffMessageEl] - Wrapper for the cutoff message.
 * @property {HTMLElement} [zipDisclosure] - Collapsible container for ZIP code input.
 * @property {HTMLInputElement} [zipInput] - Input for ZIP / Postal code.
 * @property {HTMLElement} [zipDisplay] - Element showing the currently active ZIP.
 * @property {HTMLElement} [carrierRatesList] - Container displaying carrier rate quotes.
 * @property {HTMLElement} [liveRegion] - Accessibility announcement live region.
 */

/**
 * Custom element for native shipping delivery date estimation.
 * @extends {Component<DeliveryEstimateRefs>}
 */
export class DeliveryEstimate extends Component {
  /** @type {number | null} */
  #countdownInterval = null;

  /** @type {(() => void) | null} */
  #cartUpdateBound = null;

  /** @type {((e: CustomEvent) => void) | null} */
  #zipUpdateBound = null;

  connectedCallback() {
    super.connectedCallback();
    this.#loadStoredZip();
    this.#calculateDates();
    this.#startCutoffTimer();
    this.#bindEvents();

    this.#cartUpdateBound = () => this.#calculateDates();
    document.addEventListener(StandardEvents.cartLinesUpdate, this.#cartUpdateBound);

    this.#zipUpdateBound = (e) => {
      if (e.detail?.zip && this.refs.zipInput && this.refs.zipInput.value !== e.detail.zip) {
        this.refs.zipInput.value = e.detail.zip;
        this.#updateZipDisplay(e.detail.zip);
        this.#calculateDates();
      }
    };
    document.addEventListener(ZIP_UPDATED_EVENT, this.#zipUpdateBound);
  }

  updatedCallback() {
    super.updatedCallback?.();
    this.#loadStoredZip();
    this.#calculateDates();
    this.#startCutoffTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#countdownInterval) {
      clearInterval(this.#countdownInterval);
      this.#countdownInterval = null;
    }
    if (this.#cartUpdateBound) {
      document.removeEventListener(StandardEvents.cartLinesUpdate, this.#cartUpdateBound);
      this.#cartUpdateBound = null;
    }
    if (this.#zipUpdateBound) {
      document.removeEventListener(ZIP_UPDATED_EVENT, this.#zipUpdateBound);
      this.#zipUpdateBound = null;
    }
  }

  /**
   * Loads cached postal code from localStorage.
   */
  #loadStoredZip() {
    try {
      const savedZip = localStorage.getItem(STORAGE_KEY_ZIP);
      if (savedZip) {
        if (this.refs.zipInput) this.refs.zipInput.value = savedZip;
        this.#updateZipDisplay(savedZip);
      } else {
        this.#updateZipDisplay(null);
      }
    } catch {
      this.#updateZipDisplay(null);
    }
  }

  /**
   * Updates visual badge/display of active ZIP code and toggle text.
   * @param {string | null} zip
   */
  #updateZipDisplay(zip) {
    const badge = this.querySelector('[data-zip-badge]');
    const toggleIcon = this.querySelector('[data-toggle-icon]');
    const checkText = this.querySelector('[data-toggle-text-check]');
    const changeText = this.querySelector('[data-toggle-text-change]');

    if (zip) {
      if (this.refs.zipDisplay) this.refs.zipDisplay.textContent = zip;
      badge?.removeAttribute('hidden');
      toggleIcon?.setAttribute('hidden', '');
      checkText?.setAttribute('hidden', '');
      changeText?.removeAttribute('hidden');
    } else {
      badge?.setAttribute('hidden', '');
      toggleIcon?.removeAttribute('hidden');
      checkText?.removeAttribute('hidden');
      changeText?.setAttribute('hidden', '');
    }
  }

  /**
   * Binds form submit and disclosure toggling.
   */
  #bindEvents() {
    const form = this.querySelector('[data-zip-form]');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.#handleZipSubmit();
      });
    }

    const toggleBtn = this.querySelector('[data-toggle-zip]');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = this.refs.zipDisclosure?.hasAttribute('hidden');
        if (isHidden) {
          this.refs.zipDisclosure?.removeAttribute('hidden');
          toggleBtn.setAttribute('aria-expanded', 'true');
          setTimeout(() => this.refs.zipInput?.focus(), 50);
        } else {
          this.refs.zipDisclosure?.setAttribute('hidden', '');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /**
   * Handles user submission of postal code.
   */
  #handleZipSubmit() {
    const zip = this.refs.zipInput?.value.trim();
    if (!zip) return;

    try {
      localStorage.setItem(STORAGE_KEY_ZIP, zip);
    } catch {
      // Ignore localStorage restrictions
    }

    this.#updateZipDisplay(zip);
    this.#calculateDates();

    // Collapse input disclosure after estimate is applied
    this.refs.zipDisclosure?.setAttribute('hidden', '');
    const toggleBtn = this.querySelector('[data-toggle-zip]');
    toggleBtn?.setAttribute('aria-expanded', 'false');

    // Broadcast update to all other delivery-estimate components on page
    document.dispatchEvent(new CustomEvent(ZIP_UPDATED_EVENT, { detail: { zip } }));

    // If on cart, attempt to fetch live carrier rates via Ajax API
    this.#fetchCarrierRates(zip);

    // Announce to screen reader
    if (this.refs.liveRegion) {
      this.refs.liveRegion.textContent = `Delivery estimate updated for postal code ${zip}.`;
    }
  }

  /**
   * Calculates delivery date window based on handling, transit days, and cutoff time.
   */
  #calculateDates() {
    const minHandling = parseInt(this.dataset.minHandling || '1', 10);
    const maxHandling = parseInt(this.dataset.maxHandling || '2', 10);
    const minTransit = parseInt(this.dataset.minTransit || '2', 10);
    const maxTransit = parseInt(this.dataset.maxTransit || '4', 10);
    const cutoffHour = parseInt(this.dataset.cutoffHour || '14', 10);
    const excludeWeekends = this.dataset.excludeWeekends !== 'false';

    const now = new Date();
    const currentHour = now.getHours();
    const isPastCutoff = currentHour >= cutoffHour;

    // Additional handling day if order placed after cutoff
    const cutoffOffset = isPastCutoff ? 1 : 0;

    const minTotalDays = minHandling + minTransit + cutoffOffset;
    const maxTotalDays = maxHandling + maxTransit + cutoffOffset;

    const minDate = this.#addBusinessDays(now, minTotalDays, excludeWeekends);
    const maxDate = this.#addBusinessDays(now, maxTotalDays, excludeWeekends);

    const locale = document.documentElement.lang || 'en-US';
    const dateFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    };

    const formattedMin = new Intl.DateTimeFormat(locale, dateFormatOptions).format(minDate);
    const formattedMax = new Intl.DateTimeFormat(locale, dateFormatOptions).format(maxDate);

    const dateRangeEl = this.refs.dateRangeEl || this.querySelector('[ref="dateRangeEl"], .delivery-estimate__dates');
    if (dateRangeEl) {
      const template = dateRangeEl.getAttribute('data-template') || '[start] – [end]';
      if (formattedMin === formattedMax) {
        const singleTemplate = dateRangeEl.getAttribute('data-single-template') || '[date]';
        dateRangeEl.textContent = singleTemplate.replace('[date]', formattedMin);
      } else {
        dateRangeEl.textContent = template
          .replace('[date_start]', formattedMin)
          .replace('[date_end]', formattedMax)
          .replace('[start]', formattedMin)
          .replace('[end]', formattedMax);
      }
    }
  }

  /**
   * Adds days to a date, optionally skipping weekends.
   * @param {Date} startDate
   * @param {number} daysToAdd
   * @param {boolean} excludeWeekends
   * @returns {Date}
   */
  #addBusinessDays(startDate, daysToAdd, excludeWeekends) {
    const date = new Date(startDate.getTime());
    let added = 0;

    while (added < daysToAdd) {
      date.setDate(date.getDate() + 1);
      if (excludeWeekends) {
        const dayOfWeek = date.getDay();
        // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          added++;
        }
      } else {
        added++;
      }
    }

    return date;
  }

  /**
   * Initializes real-time order cutoff countdown timer.
   */
  #startCutoffTimer() {
    if (this.dataset.showCountdown === 'false') return;

    if (this.#countdownInterval) {
      clearInterval(this.#countdownInterval);
      this.#countdownInterval = null;
    }

    const updateTimer = () => {
      const now = new Date();
      const cutoffHour = parseInt(this.dataset.cutoffHour || '14', 10);

      const target = new Date(now.getTime());
      target.setHours(cutoffHour, 0, 0, 0);

      let isToday = true;
      if (now.getTime() >= target.getTime()) {
        // Move to tomorrow's cutoff
        target.setDate(target.getDate() + 1);
        isToday = false;
      }

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const timeFormatted = `${hours}h ${minutes}m ${seconds}s`;

      const cutoffMessageEl = this.refs.cutoffMessageEl || this.querySelector('[ref="cutoffMessageEl"], .delivery-estimate__cutoff');
      if (cutoffMessageEl) {
        const template = isToday
          ? cutoffMessageEl.getAttribute('data-template-today')
          : cutoffMessageEl.getAttribute('data-template-tomorrow');

        if (template) {
          cutoffMessageEl.textContent = template.replace('{{ time }}', timeFormatted);
        }
      }
    };

    updateTimer();
    this.#countdownInterval = window.setInterval(updateTimer, 1000);
  }

  /**
   * Infers province / state from postal code for US and Canada.
   * Shopify's /cart/shipping_rates.json strictly requires province for US/CA.
   * @param {string} country
   * @param {string} zip
   * @returns {string | null}
   */
  #inferProvince(country, zip) {
    if (!country || !zip) return null;
    const cleanCountry = country.trim().toLowerCase();
    const cleanZip = zip.trim().toUpperCase().replace(/\s+/g, '');

    // United States ZIP prefix mapping
    if (cleanCountry.includes('united states') || cleanCountry === 'us' || cleanCountry === 'usa') {
      const prefix2 = parseInt(cleanZip.substring(0, 2), 10);
      const prefix3 = parseInt(cleanZip.substring(0, 3), 10);

      if (prefix3 >= 995 && prefix3 <= 999) return 'Alaska';
      if (prefix3 >= 967 && prefix3 <= 968) return 'Hawaii';
      if (prefix2 >= 10 && prefix2 <= 14) return 'New York';
      if (prefix2 >= 15 && prefix2 <= 19) return 'Pennsylvania';
      if (prefix2 === 20) return 'District of Columbia';
      if (prefix2 === 21) return 'Maryland';
      if (prefix2 >= 22 && prefix2 <= 24) return 'Virginia';
      if (prefix2 >= 25 && prefix2 <= 26) return 'West Virginia';
      if (prefix2 >= 27 && prefix2 <= 28) return 'North Carolina';
      if (prefix2 === 29) return 'South Carolina';
      if (prefix2 >= 30 && prefix2 <= 31) return 'Georgia';
      if (prefix2 >= 32 && prefix2 <= 34) return 'Florida';
      if (prefix2 >= 35 && prefix2 <= 36) return 'Alabama';
      if (prefix2 >= 37 && prefix2 <= 38) return 'Tennessee';
      if (prefix2 === 39) return 'Mississippi';
      if (prefix2 >= 40 && prefix2 <= 42) return 'Kentucky';
      if (prefix2 >= 43 && prefix2 <= 45) return 'Ohio';
      if (prefix2 >= 46 && prefix2 <= 47) return 'Indiana';
      if (prefix2 >= 48 && prefix2 <= 49) return 'Michigan';
      if (prefix2 >= 50 && prefix2 <= 52) return 'Iowa';
      if (prefix2 >= 53 && prefix2 <= 54) return 'Wisconsin';
      if (prefix2 >= 55 && prefix2 <= 56) return 'Minnesota';
      if (prefix2 === 57) return 'South Dakota';
      if (prefix2 === 58) return 'North Dakota';
      if (prefix2 === 59) return 'Montana';
      if (prefix2 >= 60 && prefix2 <= 62) return 'Illinois';
      if (prefix2 >= 63 && prefix2 <= 65) return 'Missouri';
      if (prefix2 >= 66 && prefix2 <= 67) return 'Kansas';
      if (prefix2 >= 68 && prefix2 <= 69) return 'Nebraska';
      if (prefix2 >= 70 && prefix2 <= 71) return 'Louisiana';
      if (prefix2 === 72) return 'Arkansas';
      if (prefix2 >= 73 && prefix2 <= 74) return 'Oklahoma';
      if (prefix2 >= 75 && prefix2 <= 79) return 'Texas';
      if (prefix2 >= 80 && prefix2 <= 81) return 'Colorado';
      if (prefix2 >= 82 && prefix2 <= 83) return 'Wyoming';
      if (prefix2 === 84) return 'Utah';
      if (prefix2 >= 85 && prefix2 <= 86) return 'Arizona';
      if (prefix2 >= 87 && prefix2 <= 88) return 'New Mexico';
      if (prefix2 === 89) return 'Nevada';
      if (prefix2 >= 90 && prefix2 <= 96) return 'California';
      if (prefix2 === 97) return 'Oregon';
      if (prefix2 >= 98 && prefix2 <= 99) return 'Washington';
      if (prefix2 >= 1 && prefix2 <= 2) return 'Massachusetts';
      if (prefix2 === 3) return 'New Hampshire';
      if (prefix2 === 4) return 'Maine';
      if (prefix2 === 5) return 'Vermont';
      if (prefix2 === 6) return 'Connecticut';
      if (prefix2 === 7 || prefix2 === 8) return 'New Jersey';
      if (prefix2 === 9) return 'Rhode Island';
      return 'New York';
    }

    // Canada postal code initial letter mapping
    if (cleanCountry === 'canada' || cleanCountry === 'ca') {
      const firstChar = cleanZip.charAt(0);
      const caMap = {
        A: 'Newfoundland and Labrador',
        B: 'Nova Scotia',
        C: 'Prince Edward Island',
        E: 'New Brunswick',
        G: 'Quebec',
        H: 'Quebec',
        J: 'Quebec',
        K: 'Ontario',
        L: 'Ontario',
        M: 'Ontario',
        N: 'Ontario',
        P: 'Ontario',
        R: 'Manitoba',
        S: 'Saskatchewan',
        T: 'Alberta',
        V: 'British Columbia',
        X: 'Northwest Territories',
        Y: 'Yukon'
      };
      return caMap[firstChar] || 'Ontario';
    }

    return null;
  }

  /**
   * Fetches real shipping rates directly from Shopify's localized shipping rates endpoint:
   * GET /{locale}/cart/shipping_rates.json
   * @param {string} zip
   */
  async #fetchCarrierRates(zip) {
    const carrierRatesEl = this.refs.carrierRatesList || this.querySelector('[ref="carrierRatesList"], .delivery-estimate__carrier-rates');
    if (!carrierRatesEl) return;

    const country = this.dataset.defaultCountry || 'United States';
    const province = this.#inferProvince(country, zip);

    // Build URLSearchParams
    const params = new URLSearchParams();
    params.set('shipping_address[country]', country);
    params.set('shipping_address[zip]', zip);
    if (province) {
      params.set('shipping_address[province]', province);
    }
    const queryString = params.toString();

    // Determine root locale prefix if available
    const rootUrl = window.Shopify?.routes?.root || '/';
    const cleanRoot = rootUrl.endsWith('/') ? rootUrl : `${rootUrl}/`;
    const endpoint = `${cleanRoot}cart/shipping_rates.json?${queryString}`;

    try {
      carrierRatesEl.innerHTML = '<span class="delivery-estimate__rates-loading">Fetching shipping options...</span>';

      const maxAttempts = 8;
      let attempts = 0;

      const fetchRates = async () => {
        attempts++;
        try {
          const response = await fetch(endpoint, {
            headers: { 'Accept': 'application/json' }
          });

          if (response.status === 202) {
            // Shopify is calculating rates in background, retry
            if (attempts < maxAttempts) {
              setTimeout(fetchRates, 500);
            } else {
              carrierRatesEl.innerHTML = '';
            }
            return;
          }

          if (!response.ok) {
            carrierRatesEl.innerHTML = '';
            return;
          }

          const data = await response.json();
          const rates = data.shipping_rates;

          if (rates && Array.isArray(rates) && rates.length > 0) {
            this.#renderShippingRates(rates, carrierRatesEl);
          } else if (attempts < 3) {
            setTimeout(fetchRates, 500);
          } else {
            carrierRatesEl.innerHTML = '';
          }
        } catch {
          carrierRatesEl.innerHTML = '';
        }
      };

      fetchRates();
    } catch {
      carrierRatesEl.innerHTML = '';
    }
  }

  /**
   * Renders the list of shipping rates in the UI formatted in the active localized store currency.
   * @param {Array<object>} rates
   * @param {HTMLElement} container
   */
  #renderShippingRates(rates, container) {
    if (!rates || rates.length === 0) {
      container.innerHTML = '';
      return;
    }

    const moneyFormat = this.dataset.moneyFormat || '{{amount}}';
    const activeCurrency = this.dataset.currency || 'USD';

    const rateItemsHtml = rates.map((rate) => {
      const priceVal = parseFloat(rate.price);
      const isFree = isNaN(priceVal) || priceVal === 0 || rate.price === '0.00';

      let priceText = 'Free';
      if (!isFree) {
        try {
          const cents = Math.round(priceVal * 100);
          priceText = formatMoney(cents, moneyFormat, activeCurrency);
        } catch {
          try {
            const locale = document.documentElement.lang || 'en-US';
            priceText = new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: activeCurrency
            }).format(priceVal);
          } catch {
            priceText = `${activeCurrency} ${rate.price}`;
          }
        }
      }

      const name = rate.presentment_name || rate.name || 'Shipping';

      let transitInfo = '';
      if (rate.delivery_days && Array.isArray(rate.delivery_days) && rate.delivery_days.length > 0) {
        if (rate.delivery_days.length === 1) {
          transitInfo = ` (${rate.delivery_days[0]} business days)`;
        } else {
          transitInfo = ` (${rate.delivery_days[0]}–${rate.delivery_days[1]} business days)`;
        }
      }

      return `
        <li class="delivery-estimate__rate-item">
          <span class="delivery-estimate__rate-name">${name}${transitInfo}</span>
          <span class="delivery-estimate__rate-price">${priceText}</span>
        </li>
      `;
    }).join('');

    container.innerHTML = `
      <ul class="delivery-estimate__rates-list" role="list">
        ${rateItemsHtml}
      </ul>
    `;
  }
}

if (!customElements.get('delivery-estimate')) {
  customElements.define('delivery-estimate', DeliveryEstimate);
}
