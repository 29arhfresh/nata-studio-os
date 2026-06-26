# Template — Business Site

Multi-page site for companies, agencies, and service providers. Includes home, services, about, and contact pages.

---

## Default pages

| Page | Purpose |
|---|---|
| `index.html` | Overview — hero, services summary, trust signals, CTA |
| `services.html` | Full breakdown of offerings |
| `about.html` | Company story, team, values |
| `contact.html` | Contact form, address, map embed |

Optional additions: `blog/`, `case-studies/`, `careers.html`, `privacy.html`, `terms.html`

---

## Section order per page

### Home (`index.html`)
1. **Nav** — Logo + full page links + primary CTA button
2. **Hero** — Headline, sub-headline, CTA, optional background image
3. **Services overview** — 3-column card grid linking to `services.html`
4. **About teaser** — 2-column: short company paragraph + team photo
5. **Trust signals** — Client logos, accreditations, or stats
6. **Testimonial** — 1–2 highlighted quotes
7. **CTA banner** — "Get in touch" with a button to `contact.html`
8. **Footer** — Full nav, address, social links, legal

### Services (`services.html`)
1. **Nav**
2. **Page hero** — Title + brief intro
3. **Service sections** — One `<section>` per service with heading, description, bullet list of deliverables, and optional image
4. **CTA** — "Ready to get started?" → `contact.html`
5. **Footer**

### About (`about.html`)
1. **Nav**
2. **Page hero** — Title + one-line mission statement
3. **Story** — Founding narrative, 2–3 paragraphs
4. **Values** — 3–4 value cards with icon and description
5. **Team** — Photo grid with name, role, optional short bio
6. **Footer**

### Contact (`contact.html`)
1. **Nav**
2. **Page hero** — Title + approachable intro
3. **Two-column layout**
   - Left: contact form (name, company, email, phone, message, submit)
   - Right: address, phone, email, business hours
4. **Map embed** — `<iframe>` Google Maps (user supplies embed URL)
5. **Footer**

---

## HTML scaffold — Home

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[COMPANY NAME] — [SERVICES / TAGLINE]</title>
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "[COMPANY NAME]",
    "url": "[SITE URL]",
    "telephone": "[PHONE]",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "[STREET]",
      "addressLocality": "[CITY]",
      "addressRegion": "[STATE]",
      "postalCode": "[ZIP]",
      "addressCountry": "[COUNTRY CODE]"
    }
  }
  </script>
</head>
<body>

  <header class="site-header">
    <nav class="nav" aria-label="Main navigation">
      <a href="/" class="nav__logo">
        <img src="img/logo.svg" alt="[COMPANY NAME]">
      </a>
      <ul class="nav__links" role="list">
        <li><a href="/services.html">Services</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
      <a href="/contact.html" class="btn btn--primary">Get a quote</a>
    </nav>
  </header>

  <main>

    <!-- HERO -->
    <section class="hero">
      <div class="hero__content">
        <h1>[HEADLINE — main benefit or promise]</h1>
        <p>[SUB-HEADLINE — who you serve and how]</p>
        <a href="/contact.html" class="btn btn--primary btn--large">Get a free quote</a>
      </div>
      <div class="hero__image">
        <img src="img/hero.webp" alt="[Descriptive alt text for hero image]">
      </div>
    </section>

    <!-- SERVICES OVERVIEW -->
    <section class="services-overview" id="services">
      <h2>What we do</h2>
      <ul class="service-grid" role="list">
        <li class="service-card">
          <img src="img/icon-service-1.svg" alt="">
          <h3>[Service 1]</h3>
          <p>[One-sentence description]</p>
          <a href="/services.html#service-1">Learn more</a>
        </li>
        <li class="service-card">
          <img src="img/icon-service-2.svg" alt="">
          <h3>[Service 2]</h3>
          <p>[One-sentence description]</p>
          <a href="/services.html#service-2">Learn more</a>
        </li>
        <li class="service-card">
          <img src="img/icon-service-3.svg" alt="">
          <h3>[Service 3]</h3>
          <p>[One-sentence description]</p>
          <a href="/services.html#service-3">Learn more</a>
        </li>
      </ul>
    </section>

    <!-- ABOUT TEASER -->
    <section class="about-teaser">
      <div class="about-teaser__text">
        <h2>About [COMPANY NAME]</h2>
        <p>[2–3 sentences: founding story, location, what makes you different.]</p>
        <a href="/about.html" class="btn btn--secondary">Meet the team</a>
      </div>
      <div class="about-teaser__image">
        <img src="img/team.webp" alt="The [COMPANY NAME] team">
      </div>
    </section>

    <!-- TRUST SIGNALS -->
    <section class="trust-signals" aria-label="Clients and accreditations">
      <ul class="logo-strip" role="list">
        <li><img src="img/client-logo-a.svg" alt="[Client A]"></li>
        <li><img src="img/client-logo-b.svg" alt="[Client B]"></li>
        <li><img src="img/client-logo-c.svg" alt="[Client C]"></li>
      </ul>
    </section>

    <!-- CTA BANNER -->
    <section class="cta-banner">
      <h2>Ready to work together?</h2>
      <a href="/contact.html" class="btn btn--primary btn--large">Get in touch</a>
    </section>

  </main>

  <footer class="site-footer">
    <div class="footer__nav">
      <nav aria-label="Footer navigation">
        <a href="/services.html">Services</a>
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
        <a href="/privacy.html">Privacy</a>
      </nav>
    </div>
    <address class="footer__address">
      [STREET ADDRESS], [CITY], [STATE] [ZIP]<br>
      <a href="tel:[PHONE]">[PHONE]</a> ·
      <a href="mailto:[EMAIL]">[EMAIL]</a>
    </address>
    <p class="footer__copy">&copy; [YEAR] [COMPANY NAME]. All rights reserved.</p>
  </footer>

</body>
</html>
```

---

## CSS custom properties to define

```css
:root {
  --color-primary: [HEX];
  --color-secondary: [HEX];
  --color-accent: [HEX];
  --color-bg: [HEX];
  --color-text: [HEX];
  --color-muted: [HEX];
  --font-heading: [FONT], sans-serif;
  --font-body: [FONT], sans-serif;
  --radius: 6px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --max-width: 1200px;
}
```
