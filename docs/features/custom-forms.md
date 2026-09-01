---
title: Custom Forms & Form Blocks
description: Modular form builder blocks for contact forms, product line item properties, cart attributes, file uploads, and custom form fields.
sidebar_position: 15
---

# Custom Forms & Modular Form Blocks

Better Horizon includes modular form blocks that can be placed inside the **Form** container block, inside layout blocks like **Group** or **Card**, or directly in any section on product, cart, and custom pages.

---

## Field Purpose Options

Every form field block includes a **Field purpose** setting to control how submitted data is formatted:

| Option | Output Format | Where to Use | Example |
| :--- | :--- | :--- | :--- |
| **Contact form** *(Default)* | `contact[name]` | Standard contact and inquiry forms. | Entering `email` outputs `name="contact[email]"`. |
| **Line item property** | `properties[name]` | Product pages for item-specific options (engravings, custom sizes, artwork uploads). | Entering `artwork` outputs `name="properties[artwork]"`. |
| **Cart attribute** | `attributes[name]` | Cart drawer, cart page, or checkout for order-wide notes and files. | Entering `delivery_notes` outputs `name="attributes[delivery_notes]"`. |
| **Custom** | `name` | Raw unwrapped HTML attribute for custom app forms or newsletter integrations. | Entering `customer[note]` outputs `name="customer[note]"`. |

---

## Block Library

All form blocks are found under the **Forms** category in the Shopify Theme Editor:

### 1. `Form` (Container)
- **File:** `blocks/form.liquid`
- **Purpose:** Form root container. Renders `<form>` tags, handles hidden metadata, and displays success/error alerts.
- **Allowed Child Blocks:** `form-input`, `form-textarea`, `form-select`, `form-checkbox`, `form-radio-group`, `form-file-input`, `form-submit-button`, `text`, `group`, `_divider`, `@app`.
- **Key Settings:** Container card style (`minimal`, `default`, `outline`, `custom`), field gap (4–48px), field sizing (`compact`, `default`, `spacious`), label typography and colors, input color overrides, and alert messages.

### 2. `Input field`
- **File:** `blocks/form-input.liquid`
- **Input Types:** `text`, `email`, `tel`, `number`, `url`, `date`, `time`, `password`, `hidden`.
- **Key Settings:** Field purpose (`contact`, `property`, `attribute`, `custom`), field name (`name`, `email`, `phone`, `Engraving`, `po_number`), leading icon (`none`, `user`, `email`, `phone`, `calendar`, `lock`, `globe`, `search`, `hash`), placeholder, default value, required flag, autocomplete, field width (`100%`, `75%`, `50%`, `33%`, `25%`, `auto`), and helper text.

### 3. `Text area`
- **File:** `blocks/form-textarea.liquid`
- **Purpose:** Multiline text for messages, comments, instructions, gift notes, or custom specifications.
- **Key Settings:** Field purpose (`contact`, `property`, `attribute`, `custom`), field name (`body`, `special_instructions`, `gift_note`), label, placeholder, default text, required flag, rows (2–12), minimum height (60–300px), max character limit, live character counter toggle, width, and helper text.

### 4. `Select menu`
- **File:** `blocks/form-select.liquid`
- **Purpose:** Dropdown select menu with nested option items.
- **Allowed Child Blocks:** `_form-select-option`.
- **Key Settings:** Field purpose (`contact`, `property`, `attribute`, `custom`), field name (`Subject`, `Department`, `Packaging`, `delivery_timeframe`), label, placeholder option, required flag, width, and helper text.

### 5. `Option` (Nested in Select Menu)
- **File:** `blocks/_form-select-option.liquid`
- **Purpose:** Single `<option>` item inside a Select Menu.
- **Key Settings:** Display label, submission value, selected by default, and disabled status.

### 6. `Checkbox`
- **File:** `blocks/form-checkbox.liquid`
- **Purpose:** Single checkbox for terms agreement, newsletter opt-in, gift wrap add-on, or delivery confirmations.
- **Key Settings:** Field purpose (`contact`, `property`, `attribute`, `custom`), field name (`newsletter`, `terms`, `Gift Wrap`, `leave_at_door`), rich-text label, checked value (`Yes`), checked by default, required flag, size (`small`, `medium`, `large`), and width.

### 7. `Radio group`
- **File:** `blocks/form-radio-group.liquid`
- **Purpose:** Radio button group under an accessible `<fieldset>` and `<legend>`.
- **Key Settings:** Field purpose (`contact`, `property`, `attribute`, `custom`), field name (`inquiry_type`, `Font Choice`, `packing_slip_preference`), legend label, options list (one per line), default selected option, layout (`row`, `column`, `grid-2`, `grid-3`), required flag, and width.

### 8. `File upload`
- **File:** `blocks/form-file-input.liquid`
- **Web Component:** `assets/form-file-input.js` (`<form-file-input>`)
- **Purpose:** Drag-and-drop file upload zone with live image/video previews, single/multi-file selection, format/size validation, and multiple layout display modes.
- **Key Settings:**
  - **Field purpose:** `contact`, `property`, `attribute`, `custom`.
  - **Selection Mode:** Single file or Multiple files (with maximum file count limit).
  - **Allowed Extensions:** Images & Videos (`image/*,video/*`), Images only (`image/*`), Documents only (`.pdf,.doc,.docx,.txt,.csv`), All files, or Custom extensions list.
  - **Max File Size:** Configurable 1–50 MB limit with client-side validation.
  - **Live In-Place Preview:** The preview appears in place of the upload dropzone. Clicking the remove button (`x`) removes the file and restores the dropzone.
  - **File List Layouts & "Add More":**
    - `Vertical list`: Thumbnail on the left, file info (name, size, type) in the middle, remove button on the right, plus an inline dashed "Add more files" button.
    - `Thumbnail grid`: Horizontal wrapping grid cards with thumbnail and remove button, plus an "Add more" dashed tile.
    - `Compact chips`: Inline pills with file name, size, and remove button, plus an "Add more" dashed pill chip.
  - **Thumbnail Size:** Custom pixel slider (5–180px).
  - **Container Style Presets (Cards & Preview):**
    - `Default (subtle card)`: Theme-consistent soft border (`1px`) and gentle background.
    - `Minimal (borderless / transparent)`: Clean, modern borderless display with soft translucent background.
    - `Outline only`: Transparent background with subtle 1px border.
    - `Custom colors`: Full granular controls for background, border color, border width (0–4px), corner radius (0–32px), text color, and meta color.
  - **Dropzone Styling:** Optional background, border color, label, hint text, and radius override.

### 9. `Submit button`
- **File:** `blocks/form-submit-button.liquid`
- **Purpose:** Button that submits the parent form.
- **Key Settings:** Button label ("Send message"), style class (`button-primary`, `button-secondary`, `button-outline`, `button-custom`), size (`small`, `medium`, `large`), width (`auto`, `full_width`), and alignment (`left`, `center`, `right`).

---

## Common Use Cases

### 1. Line Item Properties & Product Customization
To add custom options (monograms, engravings, or custom artwork uploads) to an individual product:
1. Add the form block (e.g., **Input field** or **File upload**) inside the product section or buy-buttons area.
2. Set **Field purpose** to **Line item property (`properties[...]`)**.
3. Set the **Field name** (e.g., `Custom Artwork` or `Engraving text`).
4. When added to cart, the data/file is attached directly to that product line item.

### 2. Cart Attributes (Order Notes & Instructions)
To capture order-level information for the whole order:
1. Add the form block inside the cart drawer, cart template, or cart section.
2. Set **Field purpose** to **Cart attribute (`attributes[...]`)**.
3. Set the **Field name** (e.g., `delivery_instructions` or `gift_message`).
4. When the customer checks out, the attribute is attached to the entire order and visible in Shopify Admin under Additional Details.

### 3. Contact & Inquiry Forms
To build a custom contact form:
1. Add the **Form** container block to any page or section.
2. Add nested fields (**Input field**, **Text area**, **Select menu**, **Checkbox**, **Radio group**, **File upload**, **Submit button**).
3. Keep **Field purpose** set to **Contact form (`contact[...]`)**.
4. Submissions are sent directly through Shopify's native contact email system.
