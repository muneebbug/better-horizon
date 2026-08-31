/**
 * Better Horizon — Estimated Delivery Date & Shipping Estimator
 * Calculates accurate delivery date windows, live order cutoff countdowns,
 * and ZIP/postal-code-based shipping estimates with cross-page persistence.
 *
 * @module delivery-estimate
 */

import { Component } from '@theme/component';
import { StandardEvents } from '@shopify/events';

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
   * Fetches real shipping rates from Shopify Ajax Cart API if in cart context.
   * Handles asynchronous 202 polling.
   * @param {string} zip
   */
  async #fetchCarrierRates(zip) {
    const carrierRatesEl = this.refs.carrierRatesList || this.querySelector('[ref="carrierRatesList"], .delivery-estimate__carrier-rates');
    if (!carrierRatesEl) return;

    const country = this.dataset.defaultCountry || 'United States';
    const maxAttempts = 6;
    let attempts = 0;

    const pollRates = async () => {
      attempts++;
      try {
        const url = `/cart/shipping_rates.json?shipping_address[country]=${encodeURIComponent(country)}&shipping_address[zip]=${encodeURIComponent(zip)}`;
        const response = await fetch(url);

        if (response.status === 202) {
          // Calculation in progress, retry after brief delay
          if (attempts < maxAttempts) {
            setTimeout(pollRates, 600);
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

        if (rates && rates.length > 0) {
          const rateItemsHtml = rates.map((rate) => `
            <li class="delivery-estimate__rate-item">
              <span class="delivery-estimate__rate-name">${rate.presentment_name || rate.name}</span>
              <span class="delivery-estimate__rate-price">${rate.price === '0.00' ? 'Free' : `${rate.currency || ''} ${rate.price}`}</span>
            </li>
          `).join('');

          carrierRatesEl.innerHTML = `
            <ul class="delivery-estimate__rates-list" role="list">
              ${rateItemsHtml}
            </ul>
          `;
        } else if (attempts < 3) {
          setTimeout(pollRates, 800);
        } else {
          carrierRatesEl.innerHTML = '';
        }
      } catch {
        carrierRatesEl.innerHTML = '';
      }
    };

    pollRates();
  }
}

if (!customElements.get('delivery-estimate')) {
  customElements.define('delivery-estimate', DeliveryEstimate);
}
