---
title: Custom Forms & Form Blocks
description: Fully modular, block-based form builder system enabling custom contact, inquiry, survey, and lead generation forms.
sidebar_position: 15
---

# Custom Forms & Modular Form Blocks

The **Custom Forms** feature provides a 100% modular, theme-native form builder architecture for Better Horizon. Merchants can assemble, configure, and reorder any combination of inputs, text areas, dropdown select menus with options, checkboxes, radio button groups, and submit buttons directly inside the Shopify Theme Editor.

---

## Key Features

- **Everything is a Block:** Compose forms from scratch or use pre-configured presets directly within any section or layout container.
- **Shopify Native Form Submission:** Submits securely via Shopify's standard `{% form 'contact' %}` endpoint, routing messages directly to the merchant's customer email and Shopify Admin inbox.
- **Strictly Scoped Option Blocks:** Select Option blocks (`_form-select-option`) are private and can **only** be added inside Select Menu blocks (`form-select`), keeping the block hierarchy clean and error-free.
- **Fractional Responsive Layouts:** Controls field width on desktop (`100%`, `50%`, `33%`, `auto`) while automatically converting to comfortable touch-friendly stacked layouts on mobile devices.
- **WCAG 2.2 AA Accessible:** Built with semantic `<label>` associations, `aria-required`, `aria-describedby` helper text, accessible fieldset/legend groupings, visible high-contrast focus rings, and autofocus live regions for status announcements.
- **Theme-Integrated Design:** Fully respects Horizon's input border width, border radius, background colors, text colors, and typography tokens.

---

## Block Library

All form blocks are organized under the **Forms** category in the Shopify Theme Editor:

### 1. `Form` (Main Container)
- **File:** `blocks/form.liquid`
- **Purpose:** Acts as the form root, renders `<form>` tags, captures hidden metadata, and handles success/error alerts.
- **Allowed Child Blocks:** `form-input`, `form-textarea`, `form-select`, `form-checkbox`, `form-radio-group`, `form-submit-button`, `text`, `heading`, `group`, `_divider`, `@app`.
- **Key Settings:** Custom success/error messages, field gap (8–48px), background color, text color, input style presets (default vs custom border width/radius), width, and padding.

### 2. `Input field`
- **File:** `blocks/form-input.liquid`
- **Input Types:** `text`, `email`, `tel`, `number`, `url`, `date`, `password`, `hidden`.
- **Key Settings:** Property name (`contact[name]`, `contact[email]`, `contact[phone]`, `contact[Company]`), visible/hidden label, placeholder, default value, required flag, browser autocomplete type, width (`100%`, `50%`, `33%`, `auto`), helper text, and spacing.

### 3. `Text area`
- **File:** `blocks/form-textarea.liquid`
- **Purpose:** Multiline messages, comments, or detailed feedback.
- **Key Settings:** Property name (`contact[body]`), label, placeholder, default content, required flag, rows (2–12), maximum character limit, width, and helper text.

### 4. `Select menu`
- **File:** `blocks/form-select.liquid`
- **Purpose:** Dropdown menu container.
- **Allowed Child Blocks:** `_form-select-option` (strictly constrained).
- **Key Settings:** Property name (`contact[Subject]`, `contact[Department]`), label, placeholder option, required flag, width, and helper text.

### 5. `Option` (Nested inside Select Menu)
- **File:** `blocks/_form-select-option.liquid`
- **Purpose:** Individual `<option>` item inside a Select Menu.
- **Key Settings:** Option display label, submission value, selected by default, and disabled status.

### 6. `Checkbox`
- **File:** `blocks/form-checkbox.liquid`
- **Purpose:** Opt-ins, terms agreement, or single boolean selections.
- **Key Settings:** Property name (`contact[newsletter]`, `contact[terms]`), rich-text label, checked value (`Yes`), checked by default, required flag, and helper text.

### 7. `Radio group`
- **File:** `blocks/form-radio-group.liquid`
- **Purpose:** Single-select radio choices grouped under a fieldset and legend.
- **Key Settings:** Property name (`contact[inquiry_type]`), legend label, options list (one per line), default option, layout (`column` stacked vs `row` inline), and required flag.

### 8. `Submit button`
- **File:** `blocks/form-submit-button.liquid`
- **Purpose:** Form submission trigger button.
- **Key Settings:** Button label ("Send message"), style class (`button-primary`, `button-secondary`, `button-outline`), width (`auto`, `full_width`), alignment (`left`, `center`, `right`), and top/bottom padding.

---

## Section Preset

A ready-to-use **Contact form** preset is pre-configured in `sections/section.liquid` under the **Forms** category, featuring:
- Heading ("Get in touch")
- Name input (50% width)
- Email input (50% width, required)
- Phone input (50% width)
- Subject select dropdown with 3 options (50% width)
- Message textarea (100% width, required)
- Newsletter subscription checkbox (100% width)
- Full-width primary submit button
