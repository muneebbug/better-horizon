---
title: Gift Note & Gift Wrap Option
description: Zero-app line-item property block enabling customers to request gift wrapping and add personalized gift messages on product forms.
sidebar_position: 14
---

# Gift Note & Gift Wrap Option

The **Gift Note & Gift Wrap Option** allows merchants to offer gift wrapping services and personalized customer gift notes directly on product pages, quick view modals, and featured product sections without requiring any third-party app or recurring subscription.

---

## Key Features

- **100% Native Shopify Line-Item Properties:** Submits properties directly on the active cart item (`properties[Gift wrap]`, `properties[Gift note]`, `properties[To]`, `properties[From]`), which surface on orders in the Shopify Admin, cart drawer, cart page, and order notifications.
- **Multiple Display Modes:**
  - `Checkbox with collapsible gift note`: Checking the gift wrap checkbox smoothly expands the message textarea. Unchecking automatically collapses and disables fields so empty properties are not submitted.
  - `Always visible`: Renders both checkbox and textarea in open state.
  - `Gift wrap checkbox only`: For stores that only offer gift wrapping without custom messages.
  - `Gift note only`: For stores that offer free gift messaging.
- **Live Character Counter:** Real-time character limit enforcement and counter (`140/200 characters used`) with accessible announcements.
- **Optional Recipient (To / From) Fields:** Captures sender and recipient names if enabled.
- **Theme-Integrated Design:** Supports native Horizon input custom tokens, border radius, background colors, and typography.
- **WCAG 2.2 AA Accessible:** Built with semantic `<label>` elements, `aria-expanded`, live regions, and full keyboard operability.

---

## Block Configuration Settings

When placed as a Theme Block on the product page or sections, configure the following:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `display_mode` | select | `collapsible` | Choose between `collapsible`, `always_visible`, `wrap_only`, or `note_only`. |
| `enable_gift_wrap` | checkbox | `true` | Show the gift wrap checkbox. |
| `wrap_label` | text | `"Add gift wrapping"` | Label displayed next to the checkbox. |
| `wrap_property_name` | text | `"Gift wrap"` | Line-item property key submitted to Shopify. |
| `enable_gift_note` | checkbox | `true` | Enable personalized message textarea. |
| `note_label` | text | `"Include a personalized gift note"` | Label for the message field. |
| `note_property_name` | text | `"Gift note"` | Line-item property key for the note. |
| `note_placeholder` | textarea | `"Write your gift message here..."` | Placeholder text in the textarea. |
| `max_characters` | range | `200` | Maximum character limit (50–500). |
| `show_recipient_fields` | checkbox | `false` | Show additional "To" and "From" name inputs. |
| `input_style` | select | `default` | Choose `default` or `custom` for customized input borders and colors. |

---

## Files

- `blocks/gift-wrap.liquid` — Placeable theme block for product pages and quick view.
- `assets/gift-wrap.js` — Vanilla Web Component managing state, accessibility, and form bindings.
- `locales/en.default.json` — Translation strings for labels, placeholders, and character counts.
