# Template — Portfolio

Multi-page showcase site. Best for designers, developers, photographers, and other creative professionals.

---

## Default pages

| Page | Purpose |
|---|---|
| `index.html` | Work grid — thumbnail gallery of all projects |
| `about.html` | Bio, skills, experience, and a photo |
| `contact.html` | Contact form or email link |
| `project.html` | Single project detail page (reused per project) |

---

## Section order per page

### Home (`index.html`)
1. **Nav** — Name/logo + links to About and Contact
2. **Intro** — One-line role title and optional tagline
3. **Work grid** — Responsive thumbnail grid; each card links to a project detail page
4. **Footer** — Social links, email, copyright

### About (`about.html`)
1. **Nav**
2. **Bio** — Photo + 2–3 paragraph professional story
3. **Skills** — Tag cloud or icon list of tools and disciplines
4. **Experience** — Timeline or list of roles (company, title, years)
5. **Footer**

### Contact (`contact.html`)
1. **Nav**
2. **Heading + intro** — Invite message, response time expectation
3. **Form** — Name, email, project type (select), message, submit
4. **Footer**

### Project detail (`project.html`)
1. **Nav**
2. **Hero image** — Full-width project cover
3. **Project meta** — Client, role, year, tools used
4. **Overview** — Problem and goal (2–4 sentences)
5. **Process** — 2–4 images with captions
6. **Outcome** — Result, impact, or key learnings
7. **Next / Prev project** — Navigation to adjacent projects
8. **Footer**

---

## HTML scaffold — Home

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[YOUR NAME] — [ROLE / DISCIPLINE]</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <header class="site-header">
    <nav class="nav" aria-label="Main navigation">
      <a href="/" class="nav__name">[YOUR NAME]</a>
      <ul class="nav__links" role="list">
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="intro">
      <h1>[YOUR ROLE] based in [CITY].</h1>
      <p>[OPTIONAL ONE-LINE TAGLINE]</p>
    </section>

    <section class="work" aria-label="Selected work">
      <ul class="work-grid" role="list">
        <li class="work-card">
          <a href="/projects/[project-slug].html">
            <img
              src="img/[project-thumb].webp"
              alt="[Project name — brief description]"
              loading="lazy"
            >
            <div class="work-card__info">
              <h2>[Project name]</h2>
              <p>[Category] · [Year]</p>
            </div>
          </a>
        </li>
        <!-- repeat per project -->
      </ul>
    </section>
  </main>

  <footer class="site-footer">
    <nav aria-label="Social links">
      <a href="[LINKEDIN_URL]" rel="noopener noreferrer">LinkedIn</a>
      <a href="[DRIBBBLE_URL]" rel="noopener noreferrer">Dribbble</a>
      <a href="mailto:[EMAIL]">[EMAIL]</a>
    </nav>
    <p>&copy; [YEAR] [YOUR NAME]</p>
  </footer>

</body>
</html>
```

---

## CSS layout for work grid

```css
.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
  list-style: none;
  padding: 0;
  margin: 0;
}

.work-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}
```

---

## CSS custom properties to define

```css
:root {
  --color-bg: [HEX];
  --color-text: [HEX];
  --color-muted: [HEX];
  --color-accent: [HEX];
  --font-heading: [FONT], sans-serif;
  --font-body: [FONT], sans-serif;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  --max-width: 1100px;
}
```
