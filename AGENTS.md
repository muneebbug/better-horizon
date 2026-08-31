# AI Agent Instructions for Better Horizon

Welcome to the **Better Horizon** codebase — a first-party Shopify theme built with modern Liquid Storefronts, native Theme Blocks, Web Components, and strict accessibility standards.

This file serves as the master guide for all AI coding agents working on this repository. All detailed rules, standards, and component patterns are modularly organized inside [`.cursor/rules/`](.cursor/rules/). Agents **must** consult and follow the corresponding rule files when working in specific areas of the codebase.

---

## 🧭 Quick Rule Navigator

Before making changes, identify the relevant files you are modifying and refer to the corresponding rule files in [`.cursor/rules/`](.cursor/rules/):

### 1. Core Architecture & Shopify Templating

| Rule | Rule File | Scope / Globs | Summary |
| :--- | :--- | :--- | :--- |
| **Liquid Standards** | [`.cursor/rules/liquid.mdc`](.cursor/rules/liquid.mdc) | `*.liquid` | Liquid syntax, tags, filters, variable assignments, loops, control flow, and schema rules. |
| **Sections** | [`.cursor/rules/sections.mdc`](.cursor/rules/sections.mdc) | `sections/*.liquid` | Section architecture, static vs. dynamic sections, presets, schema requirements, and structure. |
| **Theme Blocks** | [`.cursor/rules/blocks.mdc`](.cursor/rules/blocks.mdc) | `blocks/*.liquid` | Theme block development, static blocks (`{% content_for 'block' %}`), nested blocks, and scoped styles. |
| **Snippets** | [`.cursor/rules/snippets.mdc`](.cursor/rules/snippets.mdc) | `snippets/*.liquid` | Reusable snippet components, parameter passing via `render`, and modular markup patterns. |
| **Templates** | [`.cursor/rules/templates.mdc`](.cursor/rules/templates.mdc) | `templates/*.json` | JSON template structure, section ordering, block hierarchies, and settings defaults. |
| **Schemas** | [`.cursor/rules/schemas.mdc`](.cursor/rules/schemas.mdc) | `blocks/*.liquid`, `sections/*.liquid`, `schemas/*` | JSON schema structure, input setting types, blocks, presets, and validation rules. |
| **Theme Settings** | [`.cursor/rules/theme-settings.mdc`](.cursor/rules/theme-settings.mdc) | `config/settings_schema.json` | Global theme settings structure, categories, and controls. |
| **Locales** | [`.cursor/rules/locales.mdc`](.cursor/rules/locales.mdc) | `locales/*.json` | Translation file schemas, key naming conventions, and structure. |
| **Localization** | [`.cursor/rules/localization.mdc`](.cursor/rules/localization.mdc) | `*.liquid`, `schemas/*` | Localization filters (`\| t`), translation variables, schema translation tags (`t:`), and internationalization. |
| **Assets** | [`.cursor/rules/assets.mdc`](.cursor/rules/assets.mdc) | `assets/*` | Asset organization, static CSS, JS, SVGs, images, and theme asset bundling/loading. |

### 2. Frontend Web Standards & Code Quality

| Rule | Rule File | Scope / Globs | Summary |
| :--- | :--- | :--- | :--- |
| **HTML Standards** | [`.cursor/rules/html-standards.mdc`](.cursor/rules/html-standards.mdc) | `*.liquid` | Semantic HTML5 structure, doctype, attributes, and markup quality. |
| **CSS Standards** | [`.cursor/rules/css-standards.mdc`](.cursor/rules/css-standards.mdc) | `assets/*.css`, `{% stylesheet %}`, `{% style %}` | CSS architecture, custom properties, BEM conventions, and scoped stylesheet usage. |
| **JavaScript Standards** | [`.cursor/rules/javascript-standards.mdc`](.cursor/rules/javascript-standards.mdc) | `assets/*.js`, `{% javascript %}`, `{% script %}` | Custom Elements / Web Components, vanilla JavaScript, event delegation, and progressive enhancement. |

### 3. Global Accessibility Standards (WCAG 2.2 AA)

| Rule | Rule File | Scope / Globs | Summary |
| :--- | :--- | :--- | :--- |
| **Global Accessibility** | [`.cursor/rules/global-accessibility-standards.mdc`](.cursor/rules/global-accessibility-standards.mdc) | Global / `*.liquid` | Page language, viewport scaling, page title attributes, and skip navigation links. |
| **Color Contrast** | [`.cursor/rules/color-contrast-accessibility.mdc`](.cursor/rules/color-contrast-accessibility.mdc) | `*.css`, `*.liquid`, UI | WCAG 1.4.3 & 1.4.11 contrast compliance (minimum 4.5:1 text, 3:1 graphical/UI controls). |
| **Focus Order & Styles** | [`.cursor/rules/focus-order-and-styles-accessibility.mdc`](.cursor/rules/focus-order-and-styles-accessibility.mdc) | `*.liquid`, `*.css`, `*.js` | WCAG 2.4.7/2.4.13 focus visibility, dual-color high-contrast focus rings, and natural DOM tab order. |
| **Mobile Accessibility** | [`.cursor/rules/mobile-accessibility-standards.mdc`](.cursor/rules/mobile-accessibility-standards.mdc) | `*.liquid`, `*.css` | WCAG 2.5.8 touch target size minimums (44×44px / 24×24px minimums), spacing, and orientation. |
| **Heading Hierarchy** | [`.cursor/rules/heading-accessibility.mdc`](.cursor/rules/heading-accessibility.mdc) | `*.liquid` | Strict heading hierarchy (`h1` through `h6`), single `h1` per page, no skipped heading levels. |
| **Landmarks** | [`.cursor/rules/landmark-accessibility.mdc`](.cursor/rules/landmark-accessibility.mdc) | `*.liquid` | Proper ARIA landmark regions (`<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`). |
| **Image Alt Text** | [`.cursor/rules/image-alt-text-accessibility.mdc`](.cursor/rules/image-alt-text-accessibility.mdc) | `*.liquid` | Descriptive alternative text for informative imagery; `alt=""` and `aria-hidden="true"` for decorative icons. |
| **Table Accessibility** | [`.cursor/rules/table-accessibility.mdc`](.cursor/rules/table-accessibility.mdc) | `*.liquid` | Semantic `<table>`, `<th>` with `scope="col|row"`, `<caption>`, and accessible responsive table patterns. |
| **Motion & Animation** | [`.cursor/rules/animation-accessibility.mdc`](.cursor/rules/animation-accessibility.mdc) | `*.css`, `*.js` | `prefers-reduced-motion` media queries, pause/stop/hide controls for moving content (WCAG 2.2.2, 2.3.3). |

### 4. Interactive Component Accessibility Patterns

| Rule | Rule File | Pattern Highlights |
| :--- | :--- | :--- |
| **Accordions** | [`.cursor/rules/accordion-accessibility.mdc`](.cursor/rules/accordion-accessibility.mdc) | WAI-ARIA accordion pattern, `<button>` triggers with `aria-expanded` and `aria-controls`. |
| **Breadcrumbs** | [`.cursor/rules/breadcrumb-accessibility.mdc`](.cursor/rules/breadcrumb-accessibility.mdc) | `<nav aria-label="Breadcrumb">`, `<ol>` list structure, `aria-current="page"` on current item. |
| **Carousels / Sliders** | [`.cursor/rules/carousel-accessibility.mdc`](.cursor/rules/carousel-accessibility.mdc) | Slide grouping, live region management, accessible play/pause controls, keyboard navigation. |
| **Cart Drawer** | [`.cursor/rules/cart-drawer-accessibility.mdc`](.cursor/rules/cart-drawer-accessibility.mdc) | Dialog role, `aria-modal="true"`, focus trap inside open drawer, focus restoration on close. |
| **Chat Windows** | [`.cursor/rules/chat-window-accessibility.mdc`](.cursor/rules/chat-window-accessibility.mdc) | Polite ARIA live regions (`aria-live="polite"`), message list structure, clear send triggers. |
| **Color Swatches** | [`.cursor/rules/color-swatch-accessibility.mdc`](.cursor/rules/color-swatch-accessibility.mdc) | Accessible radio inputs or buttons, visible names, announced swatch labels and states. |
| **Comboboxes** | [`.cursor/rules/combobox-accessibility.mdc`](.cursor/rules/combobox-accessibility.mdc) | ARIA 1.2 Combobox pattern, keyboard navigation (Up/Down/Enter/Escape), active descendant. |
| **Disclosures** | [`.cursor/rules/disclosure-accessibility.mdc`](.cursor/rules/disclosure-accessibility.mdc) | Native `<details>`/`<summary>` or accessible button toggles with `aria-expanded`. |
| **Dropdown Navigation** | [`.cursor/rules/dropdown-navigation-accessibility.mdc`](.cursor/rules/dropdown-navigation-accessibility.mdc) | Keyboard accessible navigation menus, disclosure toggles, Escape to close, focus return. |
| **Flip Cards** | [`.cursor/rules/flip-card-accessibility.mdc`](.cursor/rules/flip-card-accessibility.mdc) | Keyboard-flippable card controls, accessible state reflection, screen reader alternative. |
| **Forms** | [`.cursor/rules/form-accessibility.mdc`](.cursor/rules/form-accessibility.mdc) | Associated `<label>` elements, `aria-describedby` for errors/hints, `aria-invalid`, clear validation. |
| **Modals / Dialogs** | [`.cursor/rules/modal-accessibility.mdc`](.cursor/rules/modal-accessibility.mdc) | `dialog` element or `role="dialog"`, `aria-modal="true"`, focus trapping, Escape dismissal. |
| **Product Cards** | [`.cursor/rules/product-card-accessibility.mdc`](.cursor/rules/product-card-accessibility.mdc) | Logical link nesting, clear accessible product name, price reading, accessible swatch pickers. |
| **Product Filters** | [`.cursor/rules/product-filter-accessibility.mdc`](.cursor/rules/product-filter-accessibility.mdc) | Accessible facet checkboxes/radios, live count announcements, clear all buttons. |
| **Media Galleries** | [`.cursor/rules/product-media-gallery-accessibility.mdc`](.cursor/rules/product-media-gallery-accessibility.mdc) | Main media viewer, thumbnail buttons with `aria-current`, zoom modal accessibility. |
| **Sale Prices** | [`.cursor/rules/sale-price-accessibility.mdc`](.cursor/rules/sale-price-accessibility.mdc) | Screen-reader accessible price labels (`<span class="visually-hidden">Regular price:</span>`). |
| **Sliders / Range** | [`.cursor/rules/slider-accessibility.mdc`](.cursor/rules/slider-accessibility.mdc) | Native `<input type="range">` or ARIA slider with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. |
| **Switches** | [`.cursor/rules/switch-accessibility.mdc`](.cursor/rules/switch-accessibility.mdc) | `role="switch"`, `aria-checked="true|false"`, keyboard Space/Enter toggling. |
| **Tabs** | [`.cursor/rules/tab-accessibility.mdc`](.cursor/rules/tab-accessibility.mdc) | `role="tablist"`, `role="tab"`, `role="tabpanel"`, arrow key navigation, `aria-selected`. |
| **Tooltips** | [`.cursor/rules/tooltip-accessibility.mdc`](.cursor/rules/tooltip-accessibility.mdc) | `role="tooltip"`, `aria-describedby`, triggered on both hover and focus, Escape dismissal. |

### 5. Workflow & Continuous Documentation

| Rule | Rule File | Summary |
| :--- | :--- | :--- |
| **Commit Messages** | [`.cursor/rules/commit-messages.mdc`](.cursor/rules/commit-messages.mdc) | Conventional commit formatting standards (`feat:`, `fix:`, `refactor:`, `docs:`). |
| **Prompts & References** | [`.cursor/rules/prompts-and-references.mdc`](.cursor/rules/prompts-and-references.mdc) | Proactive living documentation maintenance in `.cursor/prompts/` and `.cursor/references/`. |

---

## ⚡ Non-Negotiable Directives for AI Agents

### 1. ⚠️ Schema Editing Rules
- **NEVER** edit the `{% schema %}` block directly in `.liquid` files if the schema is managed via source files in the `schemas/` directory.
- Edit the corresponding source file in `schemas/` and run `pnpm run build:schemas` (or `npm run build:schemas`) to regenerate the schema in the Liquid files.
- Refer to [`.cursor/rules/schemas.mdc`](.cursor/rules/schemas.mdc) for detailed schema configurations.

### 2. ♿ Strict WCAG 2.2 AA Accessibility Compliance
- Every interactive element **must** be keyboard operable (Tab, Enter, Space, Arrows, Escape).
- Never remove focus outlines without providing an accessible alternative. Use high-contrast focus rings.
- Ensure all interactive touch targets meet the minimum 44×44px or 24×24px spacing requirements.
- Always use semantic HTML first (`<button>`, `<a>`, `<dialog>`, `<details>`, `<nav>`, `<header>`, `<main>`) rather than `<div>` with click listeners.

### 3. 🧩 Theme Blocks & Liquid Architecture
- Horizon utilizes Shopify Theme Blocks. Blocks are reusable components placed via `{% content_for 'block', type: 'block-name', id: 'unique-id' %}`.
- Keep components modular. Pass data into snippets using `render 'snippet-name', prop: value` (never use deprecated `include`).
- Scoped CSS specific to a block or section should live inside `{% stylesheet %}` blocks or dedicated assets. Shared global styles belong in `assets/base.css`.
- Refer to [`.cursor/rules/blocks.mdc`](.cursor/rules/blocks.mdc) and [`.cursor/rules/sections.mdc`](.cursor/rules/sections.mdc).

### 4. 🌐 Web Components & Native JavaScript
- Horizon favors native Web Components (Custom Elements extending `HTMLElement`) for UI behaviors.
- Write vanilla JavaScript with progressive enhancement in mind. Ensure the server-rendered HTML is accessible even before JavaScript executes.
- Refer to [`.cursor/rules/javascript-standards.mdc`](.cursor/rules/javascript-standards.mdc).

### 5. 📝 Living Documentation Maintenance
- All agents are required to keep `.cursor/prompts/` and `.cursor/references/` updated as living documents whenever new patterns, edge cases, or solutions are discovered.
- Refer to [`.cursor/rules/prompts-and-references.mdc`](.cursor/rules/prompts-and-references.mdc).

---

## 📁 Repository Overview

```
better-horizon/
├── .cursor/
│   └── rules/                  # Complete library of 44 .mdc rule definitions
├── assets/                     # CSS stylesheets, vanilla JS scripts, SVGs, and fonts
├── blocks/                     # Theme block Liquid templates
├── config/
│   └── settings_schema.json    # Global theme configuration settings schema
├── layout/                     # Main theme layout templates (e.g. theme.liquid)
├── locales/                    # Translation JSON dictionaries (en.default.json, etc.)
├── sections/                   # Shopify section Liquid templates
├── snippets/                   # Reusable Liquid snippet components
├── templates/                  # JSON page, product, collection, and blog templates
├── AGENTS.md                   # This master agent instructions file
└── README.md                   # Project overview and Shopify CLI getting started
```
