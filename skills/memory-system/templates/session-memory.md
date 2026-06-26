# Session Memory Template

Use this template when storing a session-scoped memory item. Remove all placeholder comments before submitting.

---

## Item Metadata

```json
{
  "tier": "short-term",
  "scope": "session",
  "key": "<!-- Unique key: domain:entity:attribute, e.g., 'image:style:active' (max 256 chars) -->",
  "sessionId": "<!-- Session identifier from the active session context -->",
  "source": "<!-- Skill writing this item, e.g., 'ai-image-director' -->",
  "ttlSeconds": 3600,
  "tags": [
    "<!-- lowercase-tag-one -->",
    "<!-- lowercase-tag-two -->"
  ],
  "metadata": {
    "setByUser": "<!-- true | false -->",
    "context": "<!-- Brief description of why this was stored -->"
  }
}
```

---

## Value

```json
<!-- The data to store. Any JSON-serializable value.
     Examples:
     - String: "neon cyberpunk"
     - Number: 1920
     - Object: { "width": 1920, "height": 1080, "format": "16:9" }
     - Array: ["tag1", "tag2"]

     Must not contain credentials, API keys, or personal data.
-->
```

---

## Purpose

<!-- One sentence describing why this value needs to be remembered for the duration of this session. -->

---

## Expiry Notes

<!-- Does this item need a TTL shorter or longer than the default 3600 s?
     - Work-in-progress: 900 s (15 min)
     - Active session preference: 3600 s (1 h)
     - Long session / multi-step workflow: 14400 s (4 h)
-->

---

## Handoff Target

<!-- Should this item be handed off to another Skill before the session ends?
     - Target Skill: <!-- skill-name or "none" -->
     - Keys to transfer: <!-- comma-separated key names -->
-->

---

## Checklist

Before submitting this item, confirm:

- [ ] `tier` is `short-term` (ephemeral session data)
- [ ] `scope` is `session` and `sessionId` is populated
- [ ] Key follows `domain:entity:attribute` format and is ≤256 characters
- [ ] Value contains no credentials, secrets, or personal data
- [ ] At least one tag is present; all tags are lowercase and hyphen-separated
- [ ] `ttlSeconds` is set and appropriate for the expected session length
- [ ] `source` identifies the writing Skill
