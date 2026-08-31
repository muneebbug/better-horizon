# Contributing to Better Horizon

Thank you for your interest in contributing to **Better Horizon**! As an open-source project, our goal is to maintain and extend Shopify's Horizon theme with native, zero-app merchandising utilities, state-of-the-art accessibility, and high-performance technical SEO.

---

## 🧭 Development Workflow

### 1. Prerequisites
- **Node.js:** v20.x or higher
- **Shopify CLI:** v3.x (`npm install -g @shopify/cli`)
- **Shopify Partner Account:** A development store with **Developer Preview (Theme Blocks)** enabled.

### 2. Local Environment Setup

1. **Fork and Clone:**
   ```bash
   git clone https://github.com/<your-username>/better-horizon.git
   cd better-horizon
   ```

2. **Add Upstream Remote:**
   ```bash
   git remote add upstream https://github.com/Shopify/horizon.git
   git fetch upstream
   ```

3. **Start Local Development Server:**
   ```bash
   shopify theme dev --store <your-preview-store>.myshopify.com
   ```

---

## 📐 Architecture & Standards

All contributions must strictly conform to Horizon's architecture:

### 1. Theme Blocks & Liquid Standards
- Reusable components must be built as **Theme Blocks** (`blocks/*.liquid`) or reusable snippets (`snippets/*.liquid`).
- Always pass parameters into snippets explicitly using `{% render 'snippet-name', prop: value %}`.
- All Theme Blocks must include valid JSON `{% schema %}` blocks with clear labels, default values, and `presets`.

### 2. Native Web Components & Vanilla JavaScript
- UI interactivity should be implemented via native **Web Components** (Custom Elements extending `HTMLElement` or `Component` from `assets/component.js`).
- Never introduce heavy frontend frameworks (React, Vue, Alpine, jQuery).
- Progressive enhancement: Core content and server-rendered HTML must remain accessible even if JavaScript fails or is disabled.

### 3. CSS & Scoped Stylesheets
- Scoped component styles must live inside `{% stylesheet %}` blocks or dedicated stylesheets in `assets/`.
- Use BEM naming conventions and CSS Custom Properties for theme tokens (`--color-background`, `--gap-md`, etc.).

### 4. Accessibility (WCAG 2.2 AA)
- Every interactive element must be keyboard operable with visible high-contrast focus rings.
- Form inputs must have accessible associated `<label>` elements or `aria-label`.
- Semantic HTML first: Use `<button>`, `<dialog>`, `<table>`, `<nav>`, `<aside>`, not clickable `<div>` elements.
- Dialogs and drawers must support `aria-modal="true"`, focus trapping, and Escape key dismissal.

---

## 🔄 Upstream Synchronization

Better Horizon maintains a continuous tracking remote with official `Shopify/horizon`:

To manually sync changes from upstream:
```bash
git fetch upstream
git checkout main
git merge upstream/main
```
Resolve any merge conflicts, preserving Better Horizon utilities and enhancements, and verify with `shopify theme check`.

---

## 🧪 Testing & Verification

Before submitting a Pull Request, you **must** run:
```bash
shopify theme check
```
- Your pull request must pass with **0 errors and 0 warnings**.
- Automated CI will run `shopify theme check` on all pull requests.

---

## 📝 Commit Convention

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` Adds a new merchandising utility, feature, or block.
- `fix:` Fixes a bug, broken schema, or accessibility issue.
- `refactor:` Code refactoring without changing functionality.
- `docs:` Documentation or README updates.
- `perf:` Performance optimizations (e.g. image loading, LCP).
- `chore:` Maintenance, upstream sync, or tooling configuration.

---

## 🚀 Pull Request Checklist

- [ ] Code follows Horizon Theme Block and Web Component conventions.
- [ ] Accessibility standards (WCAG 2.2 AA) are met.
- [ ] `shopify theme check` passes with 0 offenses.
- [ ] Clear description of the changes with before/after screenshots if UI is changed.
