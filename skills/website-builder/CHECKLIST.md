# Pre-Delivery Checklist — Website Builder

Run this checklist before presenting the final output to the user.

---

## Structure

- [ ] All pages in the approved site map have been created
- [ ] Navigation links to every page (and back to Home)
- [ ] No broken internal links or `href="#"` placeholders left unresolved
- [ ] Consistent header and footer across all pages

## HTML

- [ ] `<!DOCTYPE html>` and `<html lang="...">` present on every page
- [ ] `<meta charset>` and `<meta name="viewport">` set correctly
- [ ] `<title>` is unique and descriptive on every page
- [ ] Heading hierarchy is logical (`h1` → `h2` → `h3`, no skipped levels)
- [ ] All images have non-empty `alt` attributes
- [ ] Forms have associated `<label>` elements for every input
- [ ] Interactive elements are keyboard-accessible

## CSS

- [ ] Mobile-first breakpoints in place
- [ ] Brand colors and fonts applied via CSS custom properties
- [ ] Sufficient color contrast (WCAG AA minimum: 4.5:1 for body text)
- [ ] Focus styles visible on all interactive elements
- [ ] No inline styles for presentational rules (use classes)

## Copy

- [ ] All `[PLACEHOLDER]` tokens replaced or flagged for the user
- [ ] No lorem ipsum left in user-facing sections
- [ ] CTA buttons have clear, action-oriented labels
- [ ] Legal / compliance copy (privacy, cookie notice) noted if required

## Performance

- [ ] Images reference optimized formats (WebP preferred, with fallback)
- [ ] No unused CSS blocks or JS scripts included
- [ ] External fonts loaded with `font-display: swap`

## Delivery

- [ ] Code is readable and consistently indented
- [ ] File and folder names are lowercase with hyphens (no spaces)
- [ ] A short summary of what was built and what the user still needs to supply is included
