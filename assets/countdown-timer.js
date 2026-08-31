/**
 * Better Horizon — Countdown Timer Web Component
 * Bound to real metafield dates or verified promotion timestamps.
 * Gracefully hides when target timestamp has passed (Zero fake urgency).
 */

export class CountdownTimer extends HTMLElement {
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

  disconnectedCallback() {
    if (this.timer) clearInterval(this.timer);
  }

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

  hide() {
    this.style.display = 'none';
  }
}

if (!customElements.get('countdown-timer')) {
  customElements.define('countdown-timer', CountdownTimer);
}
