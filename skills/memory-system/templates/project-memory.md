# Project Memory Template

Use this template when storing a project-scoped memory item. Remove all placeholder comments before submitting.

---

## Item Metadata

```json
{
  "tier": "<!-- long-term | project -->",
  "scope": "project",
  "key": "<!-- Unique key within the project scope, e.g., 'brand:palette:approved-v2' -->",
  "projectId": "<!-- Project identifier, e.g., 'proj-nata-brand-film' -->",
  "source": "<!-- Skill or person writing this item, e.g., 'creative-director' -->",
  "tags": [
    "<!-- lowercase-tag-one -->",
    "<!-- lowercase-tag-two -->"
  ],
  "metadata": {
    "approvedBy": "<!-- Who approved or owns this decision -->",
    "approvedAt": "<!-- YYYY-MM-DD -->",
    "version": "<!-- Optional version string, e.g., 'v2' -->",
    "replacesKey": "<!-- Key of the previous version, if any -->"
  }
}
```

---

## Value

```json
<!-- The project data to store.
     This item persists for the life of the project. Be specific and complete.
     Examples:
     - Brand palette: { "primary": "#0a0a0a", "accent": "#ff4d00" }
     - Creative brief summary: { "mood": "cinematic noir", "audience": "18-35" }
     - Equipment list: ["Blackmagic Cinema 6K", "Sigma 35mm Art"]
     - Approved script excerpt: "Scene 1: Fade in on a rain-soaked street..."

     Must not contain credentials, API keys, or personal data.
-->
```

---

## Purpose

<!-- One or two sentences describing what this item represents in the project context
     and why it needs to be remembered across sessions. -->

---

## Relationships

<!-- Does this item supersede or relate to another project memory item?
     - Supersedes: <!-- key of the replaced item, or "none" -->
     - Related to: <!-- comma-separated related keys, or "none" -->
-->

---

## Review Schedule

<!-- When should this item be reviewed for accuracy and relevance?
     Examples:
     - After each major production milestone
     - When the creative brief is updated
     - Never (stable brand asset)
-->

---

## Checklist

Before submitting this item, confirm:

- [ ] `scope` is `project` and `projectId` is populated
- [ ] Key is unique within the project and follows a consistent naming convention
- [ ] Value is the final, approved version (not a draft or work-in-progress)
- [ ] Value contains no credentials, secrets, or personal data
- [ ] At least one tag is present; all tags are lowercase and hyphen-separated
- [ ] `metadata.approvedBy` and `metadata.approvedAt` are set for decision-type items
- [ ] If this replaces a previous item, the previous key is noted in `metadata.replacesKey`
- [ ] `source` identifies the writing Skill or person
