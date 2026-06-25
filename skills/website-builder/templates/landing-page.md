# Template — Landing Page

Single-page layout optimized for conversions. Best for product launches, campaigns, and lead capture.

---

## Default section order

1. **Nav bar** — Logo + single CTA button (no full menu)
2. **Hero** — Headline, sub-headline, primary CTA, optional hero image or video
3. **Social proof** — Logos, user count, or a short pull quote
4. **Features / Benefits** — 3-column icon grid (or 2-column for 4 features)
5. **How it works** — 3-step numbered sequence
6. **Testimonials** — 2–3 quote cards with avatar and name
7. **Pricing** — 2 or 3 tier cards; highlight the recommended tier
8. **FAQ** — 4–6 accordion items addressing top objections
9. **Final CTA banner** — Repeated primary CTA with urgency or value statement
10. **Footer** — Minimal: legal links, social icons, copyright

---

## HTML scaffold

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[PRODUCT NAME] — [ONE-LINE VALUE PROP]</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- NAV -->
  <header class="site-header">
    <nav class="nav" aria-label="Main navigation">
      <a href="/" class="nav__logo"><img src="img/logo.svg" alt="[BRAND NAME]"></a>
      <a href="#pricing" class="btn btn--primary">Get started</a>
    </nav>
  </header>

  <!-- HERO -->
  <section class="hero" id="hero">
    <h1>[MAIN HEADLINE — problem solved or outcome delivered]</h1>
    <p class="hero__sub">[SUPPORTING SENTENCE — who it's for and how it helps]</p>
    <a href="#pricing" class="btn btn--primary btn--large">Get started free</a>
    <p class="hero__note">[TRUST NOTE — e.g. "No credit card required"]</p>
  </section>

  <!-- SOCIAL PROOF -->
  <section class="social-proof" aria-label="Trusted by">
    <p class="social-proof__label">Trusted by teams at</p>
    <ul class="logo-strip" role="list">
      <li><img src="img/logo-company-a.svg" alt="[Company A]"></li>
      <li><img src="img/logo-company-b.svg" alt="[Company B]"></li>
      <li><img src="img/logo-company-c.svg" alt="[Company C]"></li>
    </ul>
  </section>

  <!-- FEATURES -->
  <section class="features" id="features">
    <h2>[FEATURES SECTION HEADLINE]</h2>
    <ul class="feature-grid" role="list">
      <li class="feature-card">
        <img src="img/icon-feature-1.svg" alt="">
        <h3>[Feature 1 name]</h3>
        <p>[One or two sentences describing the benefit, not the feature.]</p>
      </li>
      <li class="feature-card">
        <img src="img/icon-feature-2.svg" alt="">
        <h3>[Feature 2 name]</h3>
        <p>[Benefit description]</p>
      </li>
      <li class="feature-card">
        <img src="img/icon-feature-3.svg" alt="">
        <h3>[Feature 3 name]</h3>
        <p>[Benefit description]</p>
      </li>
    </ul>
  </section>

  <!-- HOW IT WORKS -->
  <section class="how-it-works" id="how-it-works">
    <h2>How it works</h2>
    <ol class="steps">
      <li class="step"><span class="step__number">1</span><h3>[Step 1]</h3><p>[Description]</p></li>
      <li class="step"><span class="step__number">2</span><h3>[Step 2]</h3><p>[Description]</p></li>
      <li class="step"><span class="step__number">3</span><h3>[Step 3]</h3><p>[Description]</p></li>
    </ol>
  </section>

  <!-- TESTIMONIALS -->
  <section class="testimonials" id="testimonials">
    <h2>[TESTIMONIALS HEADLINE]</h2>
    <ul class="testimonial-grid" role="list">
      <li class="testimonial-card">
        <blockquote>"[Quote text]"</blockquote>
        <cite>
          <img src="img/avatar-1.webp" alt="[Person name]">
          <span>[Person name], [Role] at [Company]</span>
        </cite>
      </li>
      <!-- repeat -->
    </ul>
  </section>

  <!-- PRICING -->
  <section class="pricing" id="pricing">
    <h2>Simple, transparent pricing</h2>
    <ul class="pricing-grid" role="list">
      <li class="pricing-card">
        <h3>[Tier 1 name]</h3>
        <p class="price">[Price]<span>/mo</span></p>
        <ul class="features-list" role="list">
          <li>[Feature]</li>
        </ul>
        <a href="#" class="btn btn--secondary">Get started</a>
      </li>
      <li class="pricing-card pricing-card--featured">
        <span class="badge">Most popular</span>
        <h3>[Tier 2 name]</h3>
        <p class="price">[Price]<span>/mo</span></p>
        <ul class="features-list" role="list">
          <li>[Feature]</li>
        </ul>
        <a href="#" class="btn btn--primary">Get started</a>
      </li>
    </ul>
  </section>

  <!-- FAQ -->
  <section class="faq" id="faq">
    <h2>Frequently asked questions</h2>
    <dl class="faq-list">
      <dt>[Question 1?]</dt>
      <dd>[Answer]</dd>
      <dt>[Question 2?]</dt>
      <dd>[Answer]</dd>
    </dl>
  </section>

  <!-- FINAL CTA -->
  <section class="cta-banner">
    <h2>[CLOSING HEADLINE]</h2>
    <a href="#pricing" class="btn btn--primary btn--large">Get started free</a>
  </section>

  <!-- FOOTER -->
  <footer class="site-footer">
    <p>&copy; [YEAR] [BRAND NAME]. All rights reserved.</p>
    <nav aria-label="Footer navigation">
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
    </nav>
  </footer>

</body>
</html>
```

---

## CSS custom properties to define

```css
:root {
  --color-primary: [HEX];
  --color-accent: [HEX];
  --color-bg: [HEX];
  --color-text: [HEX];
  --font-heading: [FONT], sans-serif;
  --font-body: [FONT], sans-serif;
  --radius: 8px;
  --max-width: 1200px;
}
```
