/**
 * Better Horizon — Countdown Timer Web Component
 * Bound to real metafield dates or verified promotion timestamps.
 * Gracefully hides when target timestamp has passed (Zero fake urgency).
 *
 * @module countdown-timer
 */

/**
 * Custom element managing real-time sale countdown timers.
 *
 * @extends {HTMLElement}
 */
export class CountdownTimer extends HTMLElement {
  /** @type {string | undefined} */
  endTimeStr;

  /** @type {number} */
  endTime = 0;

  /** @type {HTMLElement | null} */
  daysEl;

  /** @type {HTMLElement | null} */
  hoursEl;

  /** @type {HTMLElement | null} */
  minutesEl;

  /** @type {HTMLElement | null} */
  secondsEl;

  /** @type {ReturnType<typeof setInterval> | null} */
  timer = null;

  /**
   * Initializes target timestamps and begins the 1-second countdown interval.
   * @returns {void}
   */
  connectedCallback() {
    this.endTimeStr = this.dataset.endTime;
    if (!this.endTimeStr) {
      this.hide();
      return;
    }

    this.endTime = new Date(this.endTimeStr).getTime();
    if (isNaN(this.endTime) || this.endTime <= Date.now()) {
      this.hide();
      return;
    }

    this.daysEl = this.querySelector('[data-days]');
    this.hoursEl = this.querySelector('[data-hours]');
    this.minutesEl = this.querySelector('[data-minutes]');
    this.secondsEl = this.querySelector('[data-seconds]');

    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  /**
   * Clears the interval timer when disconnected from the DOM.
   * @returns {void}
   */
  disconnectedCallback() {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * Calculates remaining days, hours, minutes, and seconds, updating the DOM text.
   * Hides the component when the target time has passed.
   * @returns {void}
   */
  tick() {
    const now = Date.now();
    const diff = this.endTime - now;

    if (diff <= 0) {
      if (this.timer) clearInterval(this.timer);
      this.hide();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (this.daysEl) this.daysEl.textContent = String(days).padStart(2, '0');
    if (this.hoursEl) this.hoursEl.textContent = String(hours).padStart(2, '0');
    if (this.minutesEl) this.minutesEl.textContent = String(minutes).padStart(2, '0');
    if (this.secondsEl) this.secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  /**
   * Hides the component from layout display.
   * @returns {void}
   */
  hide() {
    this.style.display = 'none';
  }
}

if (!customElements.get('countdown-timer')) {
  customElements.define('countdown-timer', CountdownTimer);
}

