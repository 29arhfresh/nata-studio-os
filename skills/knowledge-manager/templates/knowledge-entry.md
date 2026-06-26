# Knowledge Entry Template

Use this template when creating a new knowledge entry. Remove all placeholder comments before submitting.

---

## Entry Metadata

```json
{
  "title": "<!-- Short, unique, searchable title (max 200 chars) -->",
  "type": "<!-- concept | procedure | reference | example | decision | glossary | faq | standard -->",
  "status": "<!-- draft (needs review) | active (production-ready) -->",
  "author": "<!-- GitHub handle or skill name of the creator -->",
  "version": "0.1.0",
  "tags": [
    "<!-- lowercase-tag-one -->",
    "<!-- lowercase-tag-two -->"
  ]
}
```

---

## Content

<!-- Write the full knowledge content here.
     - Be complete and self-contained: a reader unfamiliar with context must understand this.
     - Use plain Markdown: headings, lists, code blocks as needed.
     - Minimum ~50 characters; no upper limit, but prefer focused entries over monolithic ones.
-->

---

## Relationships

<!-- List related entries. Remove this section if none apply.

| Target Entry ID | Relationship Type | Weight (0–1) | Notes |
|---|---|---|---|
| km-xxxxxxx | related-to | 0.7 | Brief note on why they are related |
| km-xxxxxxx | depends-on | 1.0 | This entry requires the target to be read first |

Allowed types: related-to, depends-on, extends, contradicts, supersedes, example-of
-->

---

## Citations

<!-- List sources that support this entry. Remove this section if none apply.
     Required for type=reference. Strongly recommended for type=standard and type=decision.

| Source | URL | Accessed | Excerpt |
|---|---|---|---|
| Book or article title | https://... | YYYY-MM-DD | Key quote or passage |
-->

---

## Quality Notes

<!-- Optional. Note any known gaps, uncertainties, or planned updates.
     These become warnings in the validation pass.
-->

---

## Checklist

Before submitting this entry, confirm:

- [ ] Title is unique — searched the index and found no near-duplicate
- [ ] All tags are lowercase and hyphen-separated
- [ ] Content is complete and accurate
- [ ] Type is correctly chosen
- [ ] Citations added (required for `reference` type)
- [ ] Relationships added for any known connections
- [ ] Status is `draft` if not yet reviewed, `active` if ready
