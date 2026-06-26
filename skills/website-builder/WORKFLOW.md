# Workflow — Website Builder

Follow these steps in order for every website build request.

---

## Step 1 — Discovery

Run through the discovery questions in `SYSTEM_PROMPT.md`. Do not skip this step, even for simple sites. Record:

- Site purpose and primary goal
- Target audience
- Required pages / sections
- Brand assets (colors, fonts, logo)
- Tech stack preference
- Timeline

---

## Step 2 — Template selection

Pick the closest template from `templates/`:

| User goal | Template |
|---|---|
| Launch a product or campaign | `landing-page.md` |
| Showcase work or self | `portfolio.md` |
| Represent a business or service | `business-site.md` |

If no template fits, build from scratch using the site map from Step 1.

---

## Step 3 — Site map

Present a one-level site map for user approval before writing any code.

Example:
```
Home
About
Services
  └── Service A
  └── Service B
Contact
```

Wait for confirmation or adjustments before proceeding.

---

## Step 4 — Wireframe outline

For each page, describe the section order in plain text:

```
[Hero] Headline + CTA button
[Features] 3-column icon grid
[Testimonials] 2-up quote cards
[CTA banner] Email capture form
[Footer] Nav links + social icons
```

Get sign-off before generating code.

---

## Step 5 — Code generation

Generate files in this order:
1. `index.html` (or root component) with full semantic structure
2. `styles.css` (or equivalent) — mobile-first, custom properties for brand tokens
3. Additional pages in the agreed site map
4. Any reusable components (nav, footer, cards)

---

## Step 6 — Copy pass

Replace all `[PLACEHOLDER]` tokens with draft copy that matches the brand voice. Flag any sections where the user must supply real content (legal text, pricing, product specs).

---

## Step 7 — Review and iteration

Present the output. Ask:
- Does the layout match your vision?
- Does the copy feel right?
- Any sections to add, remove, or reorder?

Repeat Steps 5–7 until the user approves.

---

## Step 8 — Final checklist

Run through `CHECKLIST.md` before marking the deliverable as complete.
