---
title: Theme Blocks Development
description: Guidelines for building, nesting, and styling Shopify Theme Blocks in Better Horizon.
sidebar_position: 1
---

# Theme Blocks Development

Shopify Theme Blocks allow modular, drag-and-drop components inside sections.

---

## 🏗️ Structure of a Theme Block

Each theme block lives in `blocks/[block-name].liquid` and contains:
1. `{% doc %}` documentation comment.
2. Liquid markup and logic.
3. `{% stylesheet %}` scoped styles.
4. `{% schema %}` configuration definition.

```liquid
{% doc %}
  My Custom Theme Block
{% enddoc %}

<div class="my-block" {{ block.shopify_attributes }}>
  <h3>{{ block.settings.title }}</h3>
</div>

{% stylesheet %}
  .my-block {
    padding: var(--padding-md);
  }
{% endstylesheet %}

{% schema %}
{
  "name": "My custom block",
  "tag": null,
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Hello World"
    }
  ],
  "presets": [
    {
      "name": "My custom block"
    }
  ]
}
{% endschema %}
```

---

## ⚠️ Important Schema Rule
Always ensure schemas have valid setting types and default values. Run `shopify theme check` before committing.
