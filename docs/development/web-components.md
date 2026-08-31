---
title: Web Components Architecture
description: Standards for writing native JavaScript Custom Elements in Better Horizon with progressive enhancement.
sidebar_position: 2
---

# Web Components Architecture

Better Horizon strictly uses **Vanilla Web Components (Custom Elements)** to power interactive storefront behaviors.

---

## 🛠️ Standards & Best Practices

1. **Extend `HTMLElement`:**
   ```javascript
   export class CustomAccordion extends HTMLElement {
     connectedCallback() {
       this.button = this.querySelector('button');
       this.button?.addEventListener('click', this.handleClick);
     }

     disconnectedCallback() {
       this.button?.removeEventListener('click', this.handleClick);
     }

     handleClick = () => {
       const isExpanded = this.button.getAttribute('aria-expanded') === 'true';
       this.button.setAttribute('aria-expanded', String(!isExpanded));
     };
   }

   if (!customElements.get('custom-accordion')) {
     customElements.define('custom-accordion', CustomAccordion);
   }
   ```

2. **Progressive Enhancement:** Server-rendered HTML must be fully readable and structured before JavaScript executes.
3. **No Global State Pollution:** Component instances manage their own listeners and clean up on `disconnectedCallback()`.
