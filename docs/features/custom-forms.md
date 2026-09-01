---
title: Custom Forms & Form Blocks
description: Fully modular, block-based form builder system enabling custom contact, inquiry, survey, and lead generation forms with deep styling and layout customization.
sidebar_position: 15
---

# Custom Forms & Modular Form Blocks

The **Custom Forms** feature provides a 100% modular, theme-native form builder architecture for Better Horizon. Merchants can assemble, configure, and style any combination of inputs, text areas, dropdown select menus, checkboxes, radio button groups, and submit buttons directly inside the Shopify Theme Editor.

---

## Key Features

- **Everything is a Block:** Compose forms from scratch or use pre-configured presets directly within any section or layout container.
- **Deep Visual Customization:**
  - **Container Styles:** `Minimal (transparent / borderless)`, `Default card`, `Outline only`, or `Custom colors` (with custom background, border color, border width, corner radius, and inner padding).
  - **Input Sizing:** `Compact (38px height)`, `Default (46px height)`, or `Spacious (54px height)`.
  - **Typography & Labels:** Custom label text colors, font sizes (`Small 12px`, `Medium 14px`, `Large 16px`), and weights (`Normal 400`, `Medium 500`, `Semibold 600`, `Bold 700`).
  - **Input Colors:** Custom input background, text, border, active focus border, placeholder colors, and corner radius (0–32px).
  - **Custom Submit Buttons:** Primary, Secondary, Outline, and Custom styling presets with dedicated background, text, border, and radius sliders.
- **Leading Icons:** Choose from built-in vector icons (`user`, `email`, `phone`, `calendar`, `lock`, `globe`, `search`, `hash`) for polished, modern input fields.
- **Fractional Responsive Layouts:** Full control over field widths (`100%`, `75%`, `50%`, `33%`, `25%`, `auto`) with automatic stacking on mobile.
- **Live Character Counters:** Real-time limit enforcement and live character counters on textareas.
- **Radio Layouts:** Choose between `Horizontal (inline wrap)`, `Vertical (stacked)`, `2 Columns Grid`, or `3 Columns Grid`.
- **WCAG 2.2 AA Accessible:** Built with semantic `<label>` associations, `aria-required`, `aria-describedby` helper text, accessible fieldset/legend groupings, visible high-contrast focus rings, and autofocus live regions for status announcements.

---

## Block Library

All form blocks are organized under the **Forms** category in the Shopify Theme Editor:

### 1. `Form` (Main Container)
- **File:** `blocks/form.liquid`
- **Purpose:** Acts as the form root, renders `<form>` tags, captures hidden metadata, and handles success/error alerts.
- **Allowed Child Blocks:** `form-input`, `form-textarea`, `form-select`, `form-checkbox`, `form-radio-group`, `form-submit-button`, `text`, `group`, `_divider`, `@app`.
- **Key Settings:** Container styles (`minimal`, `default`, `outline`, `custom`), field gap (4–48px), field sizing (`compact`, `default`, `spacious`), label typography & colors, input color overrides, success/error messages & alert colors, width, and padding.

### 2. `Input field`
- **File:** `blocks/form-input.liquid`
- **Input Types:** `text`, `email`, `tel`, `number`, `url`, `date`, `time`, `password`, `hidden`.
- **Key Settings:** Property name (`contact[name]`, `contact[email]`, `contact[phone]`, `contact[Company]`), leading icon (`none`, `user`, `email`, `phone`, `calendar`, `lock`, `globe`, `search`, `hash`), placeholder, default value, required flag, browser autocomplete, width (`100%`, `75%`, `50%`, `33%`, `25%`, `auto`), helper text, and optional field-level color overrides.

### 3. `Text area`
- **File:** `blocks/form-textarea.liquid`
- **Purpose:** Multiline messages, comments, or detailed feedback.
- **Key Settings:** Property name (`contact[body]`), label, placeholder, default content, required flag, rows (2–12), minimum height (60–300px), maximum character limit, live character counter toggle, width (`100%`, `75%`, `50%`, `auto`), helper text, and field-level styling overrides.

### 4. `Select menu`
- **File:** `blocks/form-select.liquid`
- **Purpose:** Dropdown menu container.
- **Allowed Child Blocks:** `_form-select-option` (strictly constrained).
- **Key Settings:** Property name (`contact[Subject]`, `contact[Department]`), label, placeholder option, required flag, width (`100%`, `75%`, `50%`, `33%`, `25%`, `auto`), helper text, and styling overrides.

### 5. `Option` (Nested inside Select Menu)
- **File:** `blocks/_form-select-option.liquid`
- **Purpose:** Individual `<option>` item inside a Select Menu.
- **Key Settings:** Option display label, submission value, selected by default, and disabled status.

### 6. `Checkbox`
- **File:** `blocks/form-checkbox.liquid`
- **Purpose:** Opt-ins, terms agreement, or single boolean selections.
- **Key Settings:** Property name (`contact[newsletter]`, `contact[terms]`), rich-text label, checked value (`Yes`), checked by default, required flag, checkbox size (`small`, `medium`, `large`), width (`100%`, `50%`, `auto`), helper text, and optional active fill/border colors.

### 7. `Radio group`
- **File:** `blocks/form-radio-group.liquid`
- **Purpose:** Single-select radio choices grouped under a fieldset and legend.
- **Key Settings:** Property name (`contact[inquiry_type]`), legend label, options list (one per line), default option, layout (`row`, `column`, `grid-2`, `grid-3`), required flag, width (`100%`, `75%`, `50%`, `auto`), and custom active background/text/border colors.

### 8. `Submit button`
- **File:** `blocks/form-submit-button.liquid`
- **Purpose:** Form submission trigger button.
- **Key Settings:** Button label ("Send message"), style class (`button-primary`, `button-secondary`, `button-outline`, `button-custom`), custom background/text/border/radius controls (when `custom`), button sizing (`small`, `medium`, `large`), width (`auto`, `full_width`), alignment (`left`, `center`, `right`), and padding.

---

## Section Preset

A ready-to-use **Contact form** preset is pre-configured in `sections/section.liquid` under the **Forms** category, featuring:
- Heading ("Get in touch")
- Name input (50% width with User icon)
- Email input (50% width with Email icon, required)
- Phone input (50% width with Phone icon)
- Subject select dropdown with 3 options (50% width)
- Message textarea (100% width, required)
- Newsletter subscription checkbox (100% width)
- Full-width primary submit button
