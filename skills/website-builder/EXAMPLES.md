# Examples — Website Builder

Real-world usage examples showing inputs, decisions made, and sample outputs.

---

## Example 1 — SaaS Landing Page

**User request:**
> "Build a landing page for my project management tool called Taskly. Audience is freelancers. I have a logo. Colors: #1A1A2E (dark navy) and #E94560 (red accent). No framework, just HTML/CSS."

**Template chosen:** `landing-page.md`

**Site map:**
```
Single page
  ├── Hero (headline + CTA)
  ├── Social proof (3 logos)
  ├── Features (3-column grid)
  ├── How it works (numbered steps)
  ├── Pricing (2 tiers)
  └── Footer
```

**Key decisions:**
- Mobile-first single-column layout that becomes 3-column on `min-width: 768px`
- CSS custom properties for brand tokens (`--color-primary`, `--color-accent`)
- CTA button uses `--color-accent` with `color: #fff` (contrast: 4.8:1 ✓)

**Sample hero output:**
```html
<section class="hero">
  <h1>Manage every project. Miss nothing.</h1>
  <p>Taskly gives freelancers one place to track clients, deadlines, and deliverables — without the spreadsheet chaos.</p>
  <a href="#pricing" class="btn btn--primary">Start free</a>
</section>
```

---

## Example 2 — Designer Portfolio

**User request:**
> "I need a portfolio site. I'm a brand designer. Minimal, lots of whitespace. Just HTML/CSS, no CMS."

**Template chosen:** `portfolio.md`

**Site map:**
```
Home (work grid)
About
Contact
```

**Key decisions:**
- CSS Grid for the work thumbnail layout (auto-fill, `minmax(300px, 1fr)`)
- Lazy loading on all project images (`loading="lazy"`)
- Contact page uses a `mailto:` link rather than a backend form

**Sample work grid output:**
```html
<main class="work-grid">
  <article class="work-card">
    <a href="/projects/rebrand-acme.html">
      <img src="img/acme-thumb.webp" alt="Acme Co rebrand — identity system" loading="lazy">
      <h2>Acme Co Rebrand</h2>
      <p>Brand identity · 2025</p>
    </a>
  </article>
  <!-- repeat for each project -->
</main>
```

---

## Example 3 — Local Business Site

**User request:**
> "Build a 4-page site for my plumbing company. Pages: Home, Services, About, Contact. Colors: blue and white. Stack: plain HTML."

**Template chosen:** `business-site.md`

**Site map:**
```
Home
Services
  └── Emergency Repairs
  └── Installations
  └── Maintenance
About
Contact
```

**Key decisions:**
- Shared `nav.html` snippet included via server-side include comment (user on shared hosting)
- Contact page includes a simple HTML form with `action` left as `[YOUR_FORM_ENDPOINT]`
- Schema.org `LocalBusiness` JSON-LD added to `<head>` for SEO

**Sample nav output:**
```html
<nav class="site-nav" aria-label="Main navigation">
  <a href="/" class="nav__logo">
    <img src="img/logo.svg" alt="Apex Plumbing">
  </a>
  <ul class="nav__links" role="list">
    <li><a href="/">Home</a></li>
    <li><a href="/services.html">Services</a></li>
    <li><a href="/about.html">About</a></li>
    <li><a href="/contact.html">Contact</a></li>
  </ul>
</nav>
```
