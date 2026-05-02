# Personal Website Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `naomiaro.github.io` with the Berlin Underground / Night Vision dark-mode aesthetic ported from waveform-playlist, plus interactive Tone.js audio and VexFlow staff notation.

**Architecture:** Single static homepage, no build step. Plain HTML + CSS + ES module JS, served as static files from GitHub Pages. External libraries (Tone.js v15.1.22, VexFlow v4) loaded as ES modules from jsdelivr `+esm`. Local development uses `python3 -m http.server 8000`. Verification is in-browser (manual or via Playwright MCP).

**Tech Stack:** HTML5, vanilla CSS (custom properties, no preprocessor), vanilla ES module JS, Tone.js v15.1.22, VexFlow v4, Google Fonts (Space Grotesk + JetBrains Mono).

**Spec:** `docs/superpowers/specs/2026-05-01-website-overhaul-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `index.html` | Rewrite | Page structure: nav, hero, four numbered sections, footer |
| `css/style.css` | Create | All styling: tokens, layout, components, motion |
| `js/audio.js` | Create | Tone.js: techno loop + name synth + FFT analyser |
| `js/notation.js` | Create | VexFlow: render staff, expose notehead highlight API |
| `mastering-tonejs-book.html` | Delete | Replaced by external link to `masteringtonejs.com` |
| `img/masteringtonejs.png` | Delete | No longer referenced |

Each JS file has one responsibility and exports a single `init()`-style function. The two modules are loosely coupled — `notation.js` exposes a callback hook so `audio.js` can flash noteheads when letters are played.

---

## Note Mapping (referenced throughout)

| Letter index | Letter | Note |
|---|---|---|
| 0 | N | A3 |
| 1 | A | C4 |
| 2 | O | D4 |
| 3 | M | E4 |
| 4 | I | G4 |
| 5 | A | A4 |
| 6 | R | C5 |
| 7 | O | D5 |

A-minor pentatonic ascending. Used in both `audio.js` (note triggers) and `notation.js` (staff rendering).

---

## Task 1: Visual shell — HTML scaffold + CSS tokens + fonts

**Files:**
- Create: `css/style.css`
- Modify: `index.html` (full rewrite — placeholder content for now)

- [ ] **Step 1.1: Replace `index.html` with a minimal scaffold**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Naomi Aro — building DAWs in the browser. Waveform Playlist, Mastering Tone.js, OpenDAW experiments." />
    <meta name="google-adsense-account" content="ca-pub-2823804660968229" />
    <title>Naomi Aro</title>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
    />
    <link rel="stylesheet" href="css/style.css" />
    <script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id="7a96e25f-13c5-4514-8f9b-71f74c8e3f5e"
    ></script>
  </head>
  <body>
    <main>
      <h1>Naomi Aro</h1>
      <p>Site under construction — Berlin Underground edition incoming.</p>
    </main>
  </body>
</html>
```

- [ ] **Step 1.2: Create `css/style.css` with design tokens, reset, and base typography**

```css
/* ============================================
   DESIGN TOKENS — Berlin Underground / Night Vision
   Ported from waveform-playlist's dark mode
   ============================================ */
:root {
  /* Backgrounds */
  --bg: #0a0a0f;
  --surface: #12121a;
  --navbar-bg: rgba(10, 10, 15, 0.95);

  /* Primary accent — Ampelmännchen green */
  --primary: #63c75f;
  --primary-dark: #52b84e;
  --primary-light: #78d074;

  /* Text — warm amber, night-vision preserving */
  --text: #d8c0a8;
  --text-secondary: #a89078;

  /* Headings — deep red with text-shadow glow */
  --heading-h1: #d08070;
  --heading-h2: #c87060;
  --heading-h4: #c8a888;
  --glow-strong: rgba(180, 60, 40, 0.5);
  --glow-medium: rgba(200, 80, 50, 0.3);
  --glow-subtle: rgba(180, 80, 60, 0.25);

  /* Borders */
  --border: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.2);

  /* Type */
  --font-base: 'Space Grotesk', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Layout */
  --container-width: 1100px;
  --gutter: 2rem;
}

/* ============================================
   RESET & BASE
   ============================================ */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-base);
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  overflow-x: hidden;
}

h1,
h2,
h3,
h4 {
  font-family: var(--font-base);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

h1 {
  color: var(--heading-h1);
  font-size: clamp(3rem, 8vw, 5rem);
  letter-spacing: -0.03em;
  text-shadow: 0 0 60px var(--glow-strong), 0 0 30px var(--glow-medium);
}

h2 {
  color: var(--heading-h2);
  font-size: 1.5rem;
  text-shadow: 0 0 25px var(--glow-medium);
}

h3 {
  color: var(--heading-h2);
  font-size: 1.2rem;
  text-shadow: 0 0 20px var(--glow-subtle);
}

a {
  color: var(--primary);
  text-decoration: none;
}

p {
  margin-bottom: 1rem;
}

button {
  font-family: inherit;
  cursor: pointer;
  background: none;
  border: none;
  color: inherit;
}

::selection {
  background: var(--primary);
  color: var(--bg);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bg);
}
::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 0;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Container helper */
.container {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 var(--gutter);
}
```

- [ ] **Step 1.3: Verify the scaffold loads**

Run from project root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/` in a browser. Expected:

- Page background is near-black (`#0a0a0f`)
- The "Naomi Aro" heading appears in muted red (`#d08070`) with a subtle red glow
- Body text is warm amber on the dark background
- Space Grotesk loads (heading is sans-serif, slightly geometric — confirm via browser inspector that `font-family: 'Space Grotesk'` is applied)

If Space Grotesk doesn't load, the Google Fonts `<link>` is the issue — check Network tab for the woff2 fetch.

- [ ] **Step 1.4: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add visual shell with night-vision design tokens

Drop Materialize CDN, add CSS custom properties for the Berlin Underground
palette, load Space Grotesk + JetBrains Mono from Google Fonts, basic reset
and typography. Homepage now renders as a placeholder under the new aesthetic."
```

---

## Task 2: Navbar + footer

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 2.1: Add navbar markup** at the top of `<body>` in `index.html`, before `<main>`:

```html
<nav class="navbar">
  <div class="container navbar-inner">
    <a href="/" class="navbar-brand">NAOMI ARO</a>
    <ul class="navbar-links">
      <li><a href="https://github.com/naomiaro" rel="noopener">github</a></li>
      <li><a href="https://twitter.com/naomiaro" rel="noopener">twitter</a></li>
      <li><a href="https://linkedin.com/in/naomiaro" rel="noopener">linkedin</a></li>
      <li><a href="https://naomiaro.hashnode.dev" rel="noopener">blog</a></li>
      <li><a href="mailto:naomiaro@gmail.com">email</a></li>
    </ul>
  </div>
</nav>
```

- [ ] **Step 2.2: Add footer markup** at the bottom of `<body>` in `index.html`, after `</main>`:

```html
<footer class="site-footer">
  <div class="container footer-inner">
    <span class="footer-copy">© <span class="footer-year"></span> Naomi Aro</span>
    <ul class="footer-links">
      <li><a href="https://github.com/naomiaro" rel="noopener">github</a></li>
      <li><a href="https://twitter.com/naomiaro" rel="noopener">twitter</a></li>
      <li><a href="https://linkedin.com/in/naomiaro" rel="noopener">linkedin</a></li>
      <li><a href="mailto:naomiaro@gmail.com">email</a></li>
    </ul>
  </div>
</footer>
<script>
  document.querySelector('.footer-year').textContent = new Date().getFullYear();
</script>
```

- [ ] **Step 2.3: Append navbar + footer styles to `css/style.css`**

```css
/* ============================================
   NAVBAR
   ============================================ */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--navbar-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
}

.navbar-brand {
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text);
  text-transform: uppercase;
  font-size: 0.95rem;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-links a {
  color: var(--text-secondary);
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  font-weight: 500;
  transition: color 0.2s ease;
}

.navbar-links a:hover {
  color: var(--primary);
}

/* ============================================
   FOOTER
   ============================================ */
.site-footer {
  margin-top: 6rem;
  padding: 2rem 0;
  border-top: 1px solid var(--border);
  background: var(--bg);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-copy {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-family: var(--font-mono);
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links a {
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-links a:hover {
  color: var(--primary);
}
```

- [ ] **Step 2.4: Verify in browser**

Reload `http://localhost:8000/`. Expected:

- Sticky navbar at top with "NAOMI ARO" left, 5 uppercase links right
- Hovering a navbar link turns it green (`#63C75F`)
- Scrolling: navbar stays at top with translucent dark background and a slight blur of content behind
- Footer appears at the bottom with copyright + 4 social links
- Current year is auto-rendered (`2026`)

- [ ] **Step 2.5: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add navbar and footer

Sticky translucent navbar with brutalist uppercase links and hover-green
accents. Matching footer with copyright and repeated social links."
```

---

## Task 3: Numbered section layout (About / Blog / Projects / Books)

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 3.1: Replace the placeholder `<main>` content** with the four numbered sections (hero comes in Task 4):

```html
<main>
  <!-- HERO placeholder — will be filled in Task 4 -->
  <section class="hero" id="hero">
    <div class="container">
      <h1>Naomi Aro</h1>
      <p class="hero-tagline">audio on the web</p>
    </div>
  </section>

  <section class="numbered-section" id="about">
    <div class="container">
      <header class="section-header">
        <span class="section-number">01</span>
        <h2 class="section-title">About</h2>
      </header>
      <p class="about-bio">
        The browser, but as a DAW —
        <a href="https://github.com/naomiaro/waveform-playlist" rel="noopener">Waveform Playlist</a>,
        <em><a href="https://masteringtonejs.com/" rel="noopener">Mastering Tone.js</a></em>,
        and a growing pile of OpenDAW experiments.
      </p>
    </div>
  </section>

  <section class="numbered-section" id="blog">
    <div class="container">
      <header class="section-header">
        <span class="section-number">02</span>
        <h2 class="section-title">Blog</h2>
        <span class="section-subtitle">long-form thoughts</span>
      </header>
      <p>
        <a href="https://naomiaro.hashnode.dev" rel="noopener">naomiaro.hashnode.dev</a>
      </p>
    </div>
  </section>

  <section class="numbered-section" id="projects">
    <div class="container">
      <header class="section-header">
        <span class="section-number">03</span>
        <h2 class="section-title">Projects</h2>
      </header>
      <div class="project-grid">
        <article class="project-card">
          <div class="project-image">
            <img src="img/stem.png" alt="Waveform Playlist multitrack editor screenshot" />
          </div>
          <div class="project-body">
            <h3>Waveform Playlist</h3>
            <a href="https://www.npmjs.com/package/waveform-playlist" rel="noopener" class="project-badge">
              <img src="https://img.shields.io/npm/dm/waveform-playlist.svg" alt="npm downloads" />
            </a>
            <p>
              Multitrack Web Audio editor and player with canvas waveform preview.
              Set cues, fades, and shift tracks in time. Record audio or provide
              annotations. Export to AudioBuffer or WAV. Inspired by Audacity.
            </p>
            <div class="project-links">
              <a href="https://naomiaro.github.io/waveform-playlist/" rel="noopener">Project site</a>
              <a href="https://github.com/naomiaro/waveform-playlist" rel="noopener">Github</a>
            </div>
          </div>
        </article>

        <article class="project-card">
          <div class="project-image project-image--placeholder" aria-hidden="true">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <rect x="10" y="40" width="6" height="20" fill="var(--primary)" opacity="0.6" />
              <rect x="22" y="30" width="6" height="40" fill="var(--primary)" opacity="0.6" />
              <rect x="34" y="20" width="6" height="60" fill="var(--primary)" opacity="0.6" />
              <rect x="46" y="35" width="6" height="30" fill="var(--primary)" opacity="0.6" />
              <rect x="58" y="25" width="6" height="50" fill="var(--primary)" opacity="0.6" />
              <rect x="70" y="40" width="6" height="20" fill="var(--primary)" opacity="0.6" />
              <rect x="82" y="30" width="6" height="40" fill="var(--primary)" opacity="0.6" />
            </svg>
          </div>
          <div class="project-body">
            <h3>OpenDAW Demos</h3>
            <p>
              Interactive demos of the OpenDAW SDK — multi-track mixing, recording,
              automation, scriptable effects. A growing collection of examples for
              building DAWs in the browser.
            </p>
            <div class="project-links">
              <a href="https://opendaw-test.pages.dev/" rel="noopener">Live demo</a>
              <a href="https://github.com/naomiaro/opendaw-test" rel="noopener">Github</a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="numbered-section" id="books">
    <div class="container">
      <header class="section-header">
        <span class="section-number">04</span>
        <h2 class="section-title">Books</h2>
      </header>
      <p>
        <a href="https://masteringtonejs.com/" rel="noopener">Mastering Tone.js</a>
        — a guide to interactive audio in the browser
      </p>
    </div>
  </section>
</main>
```

- [ ] **Step 3.2: Append section + project styles to `css/style.css`**

```css
/* ============================================
   HERO (placeholder styling — Task 4 fills it out)
   ============================================ */
.hero {
  padding: 8rem 0 6rem;
  text-align: center;
  border-bottom: 1px solid var(--border);
}

.hero-tagline {
  color: var(--text-secondary);
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-top: 1rem;
}

/* ============================================
   NUMBERED SECTION HEADERS
   ============================================ */
.numbered-section {
  padding: 4rem 0;
  border-bottom: 1px solid var(--border);
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-number {
  font-family: var(--font-mono);
  color: var(--primary);
  font-size: 0.95rem;
  letter-spacing: 0.05em;
}

.section-number::after {
  content: ' /';
  color: var(--text-secondary);
  margin-left: 0.25rem;
}

.section-title {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-subtitle {
  font-family: var(--font-mono);
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-left: auto;
}

/* ============================================
   ABOUT
   ============================================ */
.about-bio {
  font-size: 1.25rem;
  line-height: 1.5;
  max-width: 720px;
  color: var(--text);
}

.about-bio em {
  font-style: italic;
  color: var(--text);
}

/* ============================================
   PROJECTS
   ============================================ */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.project-card {
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.project-card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
}

.project-image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.project-image--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.project-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.project-badge img {
  display: block;
  height: 20px;
}

.project-body p {
  color: var(--text);
  font-size: 0.95rem;
  margin: 0;
}

.project-links {
  display: flex;
  gap: 1.5rem;
  margin-top: auto;
  padding-top: 0.5rem;
}

.project-links a {
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  font-weight: 500;
}

/* ============================================
   LINK UNDERLINE GROW (in body content only)
   ============================================ */
.numbered-section a:not(.project-badge):not(.project-links a) {
  background-image: linear-gradient(var(--primary), var(--primary));
  background-size: 0% 2px;
  background-repeat: no-repeat;
  background-position: left bottom;
  transition: background-size 0.3s ease;
  padding-bottom: 2px;
}

.numbered-section a:not(.project-badge):not(.project-links a):hover {
  background-size: 100% 2px;
}
```

- [ ] **Step 3.3: Verify in browser**

Reload `http://localhost:8000/`. Expected:

- Four numbered sections appear in order: ABOUT (01), BLOG (02), PROJECTS (03), BOOKS (04)
- Each section header shows the green number, slash, uppercase title
- About bio renders correctly with italicized "Mastering Tone.js"
- Hovering a body link grows a green underline left → right
- Two project cards render side-by-side on desktop, stack on narrow viewports (resize window to confirm)
- Waveform Playlist card shows the stem.png image
- OpenDAW Demos card shows the SVG bar placeholder
- Hovering a project card lifts it 4px and turns its border green

- [ ] **Step 3.4: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add numbered sections and project cards

Four editorial-style sections (About / Blog / Projects / Books) with
JetBrains Mono section numbers and uppercase titles. Project grid with
brutalist card hover lift, animated body-link underline, and an SVG
placeholder for the OpenDAW Demos card while a screenshot is pending."
```

---

## Task 4: Hero — clickable name letters + PLAY button (silent)

This task lays out all the interactive elements with no audio yet. The PLAY button toggles `aria-pressed` but does nothing audible. Letter buttons are present but silent. Audio and notation are wired up in Tasks 5–7.

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 4.1: Replace the hero `<section>` in `index.html`** with the full version:

```html
<section class="hero" id="hero">
  <!-- Decorative SVG layers (aria-hidden) -->
  <div class="hero-bg" aria-hidden="true">
    <svg class="hero-eq" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect class="eq-bar" x="4"  y="20" width="8" height="60" />
      <rect class="eq-bar" x="16" y="20" width="8" height="60" />
      <rect class="eq-bar" x="28" y="20" width="8" height="60" />
      <rect class="eq-bar" x="40" y="20" width="8" height="60" />
      <rect class="eq-bar" x="52" y="20" width="8" height="60" />
      <rect class="eq-bar" x="64" y="20" width="8" height="60" />
      <rect class="eq-bar" x="76" y="20" width="8" height="60" />
      <rect class="eq-bar" x="88" y="20" width="8" height="60" />
    </svg>
    <svg class="hero-circle" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="none" stroke="var(--primary)" stroke-width="0.5" opacity="0.2" />
      <circle cx="100" cy="100" r="60" fill="none" stroke="var(--primary)" stroke-width="0.5" opacity="0.3" class="pulse-ring" />
    </svg>
  </div>

  <div class="container hero-content">
    <!-- VexFlow staff target (rendered in Task 7) -->
    <div class="hero-staff" id="name-staff" aria-hidden="true"></div>

    <!-- Clickable name letters -->
    <h1 class="hero-name">
      <button type="button" class="name-letter" data-note-index="0" aria-label="Play A3">N</button>
      <button type="button" class="name-letter" data-note-index="1" aria-label="Play C4">A</button>
      <button type="button" class="name-letter" data-note-index="2" aria-label="Play D4">O</button>
      <button type="button" class="name-letter" data-note-index="3" aria-label="Play E4">M</button>
      <button type="button" class="name-letter" data-note-index="4" aria-label="Play G4">I</button>
      <span class="name-space" aria-hidden="true">&nbsp;</span>
      <button type="button" class="name-letter" data-note-index="5" aria-label="Play A4">A</button>
      <button type="button" class="name-letter" data-note-index="6" aria-label="Play C5">R</button>
      <button type="button" class="name-letter" data-note-index="7" aria-label="Play D5">O</button>
    </h1>

    <p class="hero-tagline">audio on the web</p>

    <button type="button" class="play-button" id="play-button" aria-pressed="false">
      <span class="play-button-icon" aria-hidden="true">▶</span>
      <span class="play-button-label">PLAY</span>
    </button>
  </div>
</section>
```

- [ ] **Step 4.2: Replace the placeholder hero CSS** in `css/style.css` with the full version:

```css
/* ============================================
   HERO
   ============================================ */
.hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6rem 0 4rem;
  border-bottom: 1px solid var(--border);
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 80%, rgba(99, 199, 95, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(208, 128, 112, 0.04) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0f 0%, #0f0f18 50%, #0a0a0f 100%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.45;
}

.hero-eq {
  position: absolute;
  bottom: 0;
  left: 5%;
  width: 25%;
  height: 30%;
  opacity: 0.35;
}

.eq-bar {
  fill: var(--primary);
  opacity: 0.4;
  transform-origin: center bottom;
  animation: eq-pulse 1.4s ease-in-out infinite;
}
.eq-bar:nth-child(1) { animation-delay: 0.0s; }
.eq-bar:nth-child(2) { animation-delay: 0.1s; }
.eq-bar:nth-child(3) { animation-delay: 0.2s; }
.eq-bar:nth-child(4) { animation-delay: 0.3s; }
.eq-bar:nth-child(5) { animation-delay: 0.4s; }
.eq-bar:nth-child(6) { animation-delay: 0.5s; }
.eq-bar:nth-child(7) { animation-delay: 0.6s; }
.eq-bar:nth-child(8) { animation-delay: 0.7s; }

@keyframes eq-pulse {
  0%, 100% { transform: scaleY(0.4); }
  50%      { transform: scaleY(1); }
}

.hero-circle {
  position: absolute;
  top: 10%;
  right: 5%;
  width: 18%;
  height: auto;
  opacity: 0.5;
}

.pulse-ring {
  transform-origin: center;
  animation: pulse-ring 4s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50%      { transform: scale(1.15); opacity: 0.1; }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-staff {
  margin: 0 auto 1.5rem;
  max-width: 520px;
  min-height: 100px;
}

.hero-name {
  display: flex;
  justify-content: center;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.15em;
  font-size: clamp(3rem, 9vw, 5.5rem);
  letter-spacing: 0.04em;
  margin-bottom: 1.5rem;
  line-height: 1;
}

.name-space {
  width: 0.6em;
}

.name-letter {
  background: none;
  border: none;
  padding: 0.05em 0.1em;
  color: var(--heading-h1);
  font-family: inherit;
  font-size: inherit;
  font-weight: 600;
  letter-spacing: inherit;
  text-shadow: 0 0 60px var(--glow-strong), 0 0 30px var(--glow-medium);
  cursor: pointer;
  transition: color 0.15s ease, transform 0.1s ease, text-shadow 0.2s ease;
  border-radius: 0;
}

.name-letter:hover,
.name-letter:focus-visible {
  color: var(--primary);
  outline: none;
}

.name-letter.active {
  color: var(--primary-light);
  transform: translateY(-4px);
  text-shadow: 0 0 40px var(--primary), 0 0 16px var(--primary);
}

.name-letter:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}

/* PLAY BUTTON — brutalist primary */
.play-button {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 2rem;
  border: 2px solid var(--primary);
  background: transparent;
  color: var(--primary);
  font-family: var(--font-base);
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.play-button:hover {
  background: var(--primary);
  color: var(--bg);
  transform: translateY(-2px);
}

.play-button[aria-pressed='true'] {
  background: var(--primary);
  color: var(--bg);
}

.play-button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}
```

- [ ] **Step 4.3: Add a tiny inline script** at the very bottom of `<body>` (before `</body>`) so the PLAY button toggles its state even before audio is wired:

```html
<script>
  (function () {
    var btn = document.getElementById('play-button');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      btn.querySelector('.play-button-icon').textContent = pressed ? '▶' : '■';
      btn.querySelector('.play-button-label').textContent = pressed ? 'PLAY' : 'STOP';
    });
  })();
</script>
```

(This script will be replaced by `js/audio.js`'s `init()` in Task 5.)

- [ ] **Step 4.4: Verify in browser**

Reload `http://localhost:8000/`. Expected:

- Hero takes ~80% of viewport, near-black background with very subtle radial green/red glow
- Equalizer bars in the bottom-left animate (CSS pulse) — bottom-anchored, scaling vertically
- Circular pulse on the right
- "NAOMI ARO" rendered as 8 separate clickable buttons (with a space between groups), each in muted red with the heading glow
- Hovering a letter turns it green and slightly lifts it
- Tab key cycles through letter buttons, focus ring is visible
- The PLAY button is below the name; clicking it toggles between `▶ PLAY` and `■ STOP`, and the green fill flips
- The `#name-staff` div is empty for now (Task 7 fills it)

- [ ] **Step 4.5: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: scaffold hero with clickable name letters and play button

Each letter of NAOMI ARO is a button with a data-note-index, ready for
audio wiring. PLAY button has aria-pressed toggle and brutalist styling.
Decorative equalizer bars and pulse circle animate via CSS until the
audio module replaces them with FFT-driven motion."
```

---

## Task 5: Tone.js audio module — techno loop with FFT analyser

**Files:**
- Create: `js/audio.js`
- Modify: `index.html` (load the module, remove the inline play-button stub)

- [ ] **Step 5.1: Create `js/audio.js`** with the techno-loop machinery:

```javascript
// js/audio.js
// Tone.js audio module: 128 BPM techno loop + clickable name letter synth.
// Single export: init(). Called once on DOMContentLoaded from index.html.

import * as Tone from 'https://cdn.jsdelivr.net/npm/tone@15.1.22/+esm';

// Note mapping for the clickable name letters — A-minor pentatonic ascending.
// Order matches data-note-index 0..7 on each .name-letter button.
const LETTER_NOTES = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5'];

// Module-scoped state
let started = false;
let analyser = null;
let nameSynth = null;
let onLetterPlayCallback = null;

/**
 * Lazily start the AudioContext on the first user gesture, build the
 * synth graph, and store handles for later use. Idempotent.
 */
async function ensureAudio() {
  if (started) return;
  await Tone.start();

  Tone.getTransport().bpm.value = 128;

  // Master FX bus — compressor → reverb → analyser → destination
  const reverb = new Tone.Reverb({ decay: 4, wet: 0.2 });
  await reverb.generate();
  const compressor = new Tone.Compressor(-18, 4);
  analyser = new Tone.Analyser('fft', 32);

  const masterGain = new Tone.Gain(Tone.dbToGain(-8));

  compressor.connect(reverb);
  reverb.connect(masterGain);
  masterGain.connect(analyser);
  masterGain.toDestination();

  // === TECHNO LOOP ===

  // Kick: punchy MembraneSynth, on every quarter
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 },
  }).connect(compressor);

  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease('C2', '8n', time);
  }, '4n');

  // Hi-hat: MetalSynth on offbeats (the "&" of every quarter)
  const hat = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.05, release: 0.05 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).connect(compressor);
  hat.volume.value = -22;

  const hatLoop = new Tone.Loop((time) => {
    hat.triggerAttackRelease('C5', '32n', time);
  }, '4n').start('8n'); // offset by 8th note → offbeats

  // Pad: PolySynth, slow chord every 2 bars
  const padFilter = new Tone.Filter({ frequency: 600, type: 'lowpass', Q: 1 });
  const padLfo = new Tone.LFO({ frequency: 0.05, min: 400, max: 1200 });
  padLfo.connect(padFilter.frequency);

  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 1.5, decay: 0.5, sustain: 0.6, release: 3 },
  });
  pad.volume.value = -14;
  pad.connect(padFilter);
  padFilter.connect(compressor);

  const padPart = new Tone.Loop((time) => {
    pad.triggerAttackRelease(['A2', 'C3', 'E3'], '2m', time);
  }, '2m');

  // Start LFO; loops scheduled but transport not started yet
  padLfo.start();
  kickLoop.start(0);
  padPart.start(0);

  // === NAME SYNTH (clickable letters) ===
  // Routes through the same reverb bus so it sounds coherent with the loop.
  nameSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 1 },
  });
  nameSynth.volume.value = -10;
  nameSynth.connect(reverb);

  started = true;
}

/**
 * Wire the PLAY button: toggle Transport between started and stopped,
 * update aria-pressed and label, and ensure audio is initialized first.
 */
function wirePlayButton(button) {
  button.addEventListener('click', async () => {
    await ensureAudio();
    const t = Tone.getTransport();
    if (t.state === 'started') {
      t.stop();
      button.setAttribute('aria-pressed', 'false');
      button.querySelector('.play-button-icon').textContent = '▶';
      button.querySelector('.play-button-label').textContent = 'PLAY';
    } else {
      t.start('+0.05');
      button.setAttribute('aria-pressed', 'true');
      button.querySelector('.play-button-icon').textContent = '■';
      button.querySelector('.play-button-label').textContent = 'STOP';
    }
  });
}

/**
 * Drive the .eq-bar SVG rects from the FFT analyser. Falls back gracefully
 * to the CSS pulse animation when audio hasn't started yet (started=false).
 */
function startFftLoop(eqBars) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  function tick() {
    if (started && analyser && Tone.getTransport().state === 'started') {
      const values = analyser.getValue(); // Float32Array, dB scale (-100..0)
      eqBars.forEach((bar, i) => {
        const db = values[i] ?? -100;
        const norm = Math.max(0.1, Math.min(1, (db + 80) / 80));
        bar.style.animation = 'none';
        bar.style.transform = `scaleY(${norm.toFixed(3)})`;
      });
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/**
 * Wire each .name-letter button: clicking triggers a note from LETTER_NOTES.
 * Adds a transient .active class for the lift animation, and notifies any
 * registered onLetterPlay callback (used by notation.js to glow the notehead).
 */
function wireNameLetters(buttons) {
  buttons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      await ensureAudio();
      const idx = parseInt(btn.dataset.noteIndex, 10);
      const note = LETTER_NOTES[idx];
      if (!note || !nameSynth) return;
      nameSynth.triggerAttackRelease(note, '0.5');

      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 350);

      if (onLetterPlayCallback) {
        onLetterPlayCallback(idx);
      }
    });
  });
}

/**
 * Public init. Idempotent — safe to call multiple times.
 *
 * @param {object} opts
 * @param {(letterIndex: number) => void} [opts.onLetterPlay]
 *   Called when a letter button is clicked, with the note index 0..7.
 */
export function init(opts = {}) {
  onLetterPlayCallback = opts.onLetterPlay || null;

  const playButton = document.getElementById('play-button');
  const letterButtons = document.querySelectorAll('.name-letter');
  const eqBars = document.querySelectorAll('.eq-bar');

  if (playButton) wirePlayButton(playButton);
  if (letterButtons.length) wireNameLetters(letterButtons);
  if (eqBars.length) startFftLoop(eqBars);
}
```

- [ ] **Step 5.2: In `index.html`, remove the inline play-button stub** (the `<script>` block at the bottom from Task 4) and replace it with a module loader:

```html
<script type="module">
  import { init as initAudio } from './js/audio.js';
  document.addEventListener('DOMContentLoaded', () => initAudio());
</script>
```

- [ ] **Step 5.3: Verify the techno loop in browser**

Reload `http://localhost:8000/`. With sound on:

- Click PLAY. After a brief warm-up (Tone.js loads + reverb generates), a 128 BPM loop should play: kick on the beat, hi-hat on the offbeat, slow A-minor pad swelling underneath.
- The equalizer bars in the hero should switch from CSS pulse to FFT-driven heights, jumping with the kick.
- Click PLAY again — playback stops. Bars freeze at their last height (acceptable; they'll re-animate on next play).
- Open DevTools console — no errors. Tone may log a warning about deprecated APIs if any; those are non-fatal.
- Reload, click PLAY again — should still work (idempotent).

- [ ] **Step 5.4: Verify in console that the AudioContext is running**

Open DevTools → console, paste:

```js
Tone.getContext().state
```

Expected: `'running'` after PLAY has been clicked.

- [ ] **Step 5.5: Commit**

```bash
git add js/audio.js index.html
git commit -m "feat: add Tone.js techno loop wired to PLAY button

128 BPM kick + hi-hat + filtered A-minor pad through compressor and
reverb. Master at -8 dB. FFT analyser drives the hero equalizer bars
during playback. Initialization is gated on first user gesture per the
browser autoplay policy. FFT loop is skipped under prefers-reduced-motion."
```

---

## Task 6: Tone.js audio module — clickable name letters

The letter-click wiring is already in `js/audio.js` from Task 5 (`wireNameLetters`). This task is a **verification-only** task to confirm letters work.

**Files:** No code changes — this task validates the existing implementation. Bug fixes (if any) go into focused commits.

- [ ] **Step 6.1: Verify each letter plays its mapped note**

Open the page, refresh, **without clicking PLAY first** click each letter from left to right:

| Letter | Expected pitch (relative) |
|--------|--------------------------|
| N | low A |
| A | minor third up (C) |
| O | one step up (D) |
| M | one step up (E) |
| I | minor third up (G) |
| A | one step up (A — same pitch class as N, octave higher) |
| R | minor third up (C, higher) |
| O | one step up (D, higher) |

Each click should trigger a clear triangle-wave note with reverb tail. The note should keep ringing for ~1 second after the click ends.

- [ ] **Step 6.2: Verify letters layer with the loop**

Click PLAY. While the techno loop is playing, click letters. The notes should layer cleanly over the loop without distortion.

- [ ] **Step 6.3: Verify letter visual feedback**

Each click should briefly add an `.active` class — letter shifts up 4px and goes green. After ~350ms it returns to muted red. This works whether the loop is playing or not.

- [ ] **Step 6.4: Verify keyboard accessibility**

Tab to a letter button, press Space or Enter. The note should play, and the visual `.active` state should briefly appear.

- [ ] **Step 6.5: No commit needed** (no code changed)

If any step 6.1–6.4 fails, fix in `js/audio.js` and commit with a `fix:` message. Otherwise move on.

---

## Task 7: VexFlow notation — staff above name, highlight on letter click

**Files:**
- Create: `js/notation.js`
- Modify: `index.html` (import `notation.js`, wire to audio)
- Modify: `css/style.css` (notehead highlight styles)

- [ ] **Step 7.1: Create `js/notation.js`** that renders the staff and exposes a highlight callback:

```javascript
// js/notation.js
// VexFlow staff renderer for the clickable name. Renders 8 noteheads
// matching the LETTER_NOTES sequence (A-minor pentatonic ascending).

import VF from 'https://cdn.jsdelivr.net/npm/vexflow@4/+esm';

// Pitch + octave encoded in VexFlow's `key` format ("a/3", "c/4", ...)
// Order matches data-note-index 0..7 in index.html.
const STAFF_KEYS = [
  'a/3', 'c/4', 'd/4', 'e/4',
  'g/4', 'a/4', 'c/5', 'd/5',
];

let renderedNotes = [];

/**
 * Render an 8-note treble-clef bar into the given container.
 * Returns nothing; call highlight(index) afterwards to flash a notehead.
 */
export function renderNameStaff(container) {
  if (!container) return;

  // Safely clear container without using innerHTML
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const { Renderer, Stave, StaveNote, Voice, Formatter } = VF;
  const width = container.clientWidth || 480;
  const height = 100;

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const ctx = renderer.getContext();
  ctx.setFont('Arial', 10);

  const stave = new Stave(0, 10, width - 4);
  stave.addClef('treble').addTimeSignature('4/4');
  stave.setContext(ctx).draw();

  const notes = STAFF_KEYS.map((key) =>
    new StaveNote({ keys: [key], duration: '8' })
  );

  const voice = new Voice({ num_beats: 4, beat_value: 4 });
  voice.addTickables(notes);

  new Formatter().joinVoices([voice]).format([voice], width - 80);
  voice.draw(ctx, stave);

  // Tag each notehead with its index for later highlight.
  // VexFlow attaches the rendered <g> via .getAttribute('el').
  renderedNotes = notes.map((note, i) => {
    const el = note.getAttribute('el');
    if (el) el.dataset.noteIndex = String(i);
    return el;
  });

  // Fallback: if VexFlow didn't expose `el`, grab .vf-stavenote groups in document order.
  if (renderedNotes.some((el) => !el)) {
    renderedNotes = Array.from(container.querySelectorAll('.vf-stavenote'));
  }
}

/**
 * Briefly add the `.active` class to the i-th notehead group, removing
 * it after ~400ms. CSS handles the visual transition.
 */
export function highlight(i) {
  const el = renderedNotes[i];
  if (!el) return;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 400);
}
```

- [ ] **Step 7.2: Append notehead-highlight CSS** to `css/style.css`:

```css
/* ============================================
   VEXFLOW STAFF
   ============================================ */
.hero-staff svg {
  display: block;
  margin: 0 auto;
}

/* Default note color: warm amber on dark */
.hero-staff path,
.hero-staff text {
  fill: var(--text-secondary);
  stroke: var(--text-secondary);
}

/* Stave lines a touch dimmer */
.hero-staff .vf-stave path {
  stroke: var(--border-strong);
}

/* Active notehead: glow green for 400ms */
.hero-staff g.active path,
.hero-staff g.active {
  fill: var(--primary);
  stroke: var(--primary);
  filter: drop-shadow(0 0 10px var(--primary));
  transition: fill 0.1s ease, stroke 0.1s ease, filter 0.1s ease;
}
```

- [ ] **Step 7.3: Wire the staff into the page** by updating the bottom-of-body `<script type="module">` in `index.html`:

```html
<script type="module">
  import { init as initAudio } from './js/audio.js';
  import { renderNameStaff, highlight } from './js/notation.js';

  document.addEventListener('DOMContentLoaded', () => {
    const staffContainer = document.getElementById('name-staff');
    renderNameStaff(staffContainer);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderNameStaff(staffContainer), 150);
    });

    initAudio({
      onLetterPlay: (letterIndex) => highlight(letterIndex),
    });
  });
</script>
```

- [ ] **Step 7.4: Verify the staff renders and reacts**

Reload `http://localhost:8000/`. Expected:

- A small treble-clef staff appears above the name letters, ~520px wide max
- Eight eighth-note noteheads ascending (A3 → D5)
- Noteheads render in muted amber by default
- Click any letter — the corresponding notehead glows green for ~400ms, then fades back
- Click letters in sequence (NAOMIARO) — each note glows in turn, like a melody
- Resize the window — the staff redraws to fit the new container width

- [ ] **Step 7.5: Verify there are no console errors**

DevTools console should be clean. Common pitfalls:

- VexFlow import path: `https://cdn.jsdelivr.net/npm/vexflow@4/+esm` should resolve. If it 404s, pin a version: `https://cdn.jsdelivr.net/npm/vexflow@4.2.6/+esm`.
- If the click→highlight mapping is off-by-one, check that the `.vf-stavenote` query order matches the `STAFF_KEYS` order (it should — VexFlow draws in tickable order).

- [ ] **Step 7.6: Commit**

```bash
git add js/notation.js index.html css/style.css
git commit -m "feat: add VexFlow staff above name letters

Renders an 8-note treble-clef bar matching the A-minor pentatonic letter
mapping. Clicking a letter glows the corresponding notehead green via
class swap. Staff redraws on window resize."
```

---

## Task 8: Reduced motion + mobile responsiveness

**Files:**
- Modify: `css/style.css`

- [ ] **Step 8.1: Append responsive + reduced-motion media queries** to `css/style.css`:

```css
/* ============================================
   MOBILE
   ============================================ */
@media (max-width: 768px) {
  :root {
    --gutter: 1.25rem;
  }

  .navbar-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem 0;
  }

  .navbar-links {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .hero {
    min-height: 70vh;
    padding: 4rem 0 3rem;
  }

  .hero-name {
    font-size: clamp(2.5rem, 12vw, 4rem);
    gap: 0.05em;
  }

  .hero-staff {
    max-width: 100%;
  }

  .hero-eq { width: 40%; }
  .hero-circle { width: 30%; }

  .section-header {
    flex-wrap: wrap;
  }

  .section-subtitle {
    margin-left: 0;
    width: 100%;
  }

  .project-grid {
    grid-template-columns: 1fr;
  }

  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ============================================
   REDUCED MOTION
   ============================================ */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .eq-bar,
  .pulse-ring,
  .name-letter,
  .play-button,
  .project-card,
  .hero-staff g.active path,
  .hero-staff g.active {
    animation: none !important;
    transition: none !important;
  }

  .name-letter.active {
    color: var(--primary-light);
    transform: none;
    text-shadow: none;
  }

  .hero-staff g.active {
    filter: none;
  }
}
```

- [ ] **Step 8.2: Verify mobile layout**

In DevTools, toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M). Set viewport to 375px wide (iPhone SE). Expected:

- Navbar wraps; links stack into a row
- Hero shrinks; name letters scale down (around 3rem)
- Section subtitle "long-form thoughts" wraps below the title
- Project cards stack into one column
- Footer items stack vertically
- No horizontal scrollbar at any width down to 320px

- [ ] **Step 8.3: Verify reduced-motion preference**

In DevTools → Rendering panel, set "Emulate CSS prefers-reduced-motion" to "reduce". Reload. Expected:

- Equalizer bars no longer animate (frozen at static height)
- Pulse circle no longer pulses
- Hovering letters or project cards no longer animates (color changes still apply)
- Click PLAY: audio still plays, but the FFT loop is skipped (the early return in `startFftLoop` from Task 5 ensures this)

- [ ] **Step 8.4: Commit**

```bash
git add css/style.css
git commit -m "feat: add mobile responsive layout and reduced-motion overrides

Stacks navbar/footer/projects on narrow viewports, shrinks hero name and
visualizers. prefers-reduced-motion: reduce disables animations and
transitions while preserving informative state colors."
```

---

## Task 9: Cleanup — delete book page and old assets

**Files:**
- Delete: `mastering-tonejs-book.html`
- Delete: `img/masteringtonejs.png`

- [ ] **Step 9.1: Delete the book page**

```bash
git rm mastering-tonejs-book.html
```

- [ ] **Step 9.2: Delete the old book cover image**

```bash
git rm img/masteringtonejs.png
```

- [ ] **Step 9.3: Confirm no dangling references**

```bash
grep -r "mastering-tonejs-book\|masteringtonejs.png" --exclude-dir=docs --exclude-dir=.git .
```

Expected: no matches (the references in `docs/superpowers/specs/...` are intentional historical records and excluded).

- [ ] **Step 9.4: Verify the homepage Books link still works**

Reload `http://localhost:8000/`, scroll to the BOOKS section, click "Mastering Tone.js". It should open `https://masteringtonejs.com/`.

- [ ] **Step 9.5: Commit**

```bash
git commit -m "chore: remove book page and old cover image

Mastering Tone.js is now linked externally to masteringtonejs.com from
the Books section. mastering-tonejs-book.html and img/masteringtonejs.png
are no longer referenced and are deleted."
```

---

## Task 10: Final QA pass

**Files:** None modified — verification only. Bug fixes go into focused follow-up commits.

- [ ] **Step 10.1: Lighthouse audit**

In Chrome DevTools → Lighthouse → "Mobile" + "Accessibility" + "Best Practices" + "Performance". Run.

Expected:

- **Accessibility ≥ 95** — if lower, address the surfaced issues (most likely contrast on green primary in some context, or missing labels)
- **Best Practices ≥ 90**
- **Performance: Mobile ≥ 70** (Tone.js + VexFlow are large; this is acceptable for a personal site)

- [ ] **Step 10.2: Cross-browser check**

Open the site in Safari, Firefox, and Chrome. Verify in each:

- Page renders (fonts load)
- PLAY starts/stops audio
- Letters trigger notes
- Staff renders and noteheads highlight
- No console errors

Known caveats:
- Safari may require a stronger user gesture for AudioContext; if PLAY doesn't trigger sound the first time, click it twice.
- Firefox's autoplay policy is stricter; same workaround.

- [ ] **Step 10.3: Verify all spec success criteria**

Walk through `docs/superpowers/specs/2026-05-01-website-overhaul-design.md` § "Success Criteria":

- [ ] Homepage loads, renders dark Berlin Underground aesthetic with custom fonts
- [ ] Clicking PLAY starts a 128 BPM techno loop; the equalizer SVG animates to FFT data
- [ ] Clicking PLAY again stops it
- [ ] Clicking a name letter plays a note from the A-minor pentatonic mapping; the corresponding notehead in the VexFlow staff glows for ~400ms
- [ ] Clicking letters works whether the loop is playing or not
- [ ] The Books section on the homepage links externally to `https://masteringtonejs.com/`
- [ ] Homepage passes Lighthouse Accessibility ≥ 95
- [ ] `prefers-reduced-motion: reduce` disables non-essential motion; audio still plays
- [ ] Mobile (375px wide): no horizontal scroll, all content readable, letters tappable

- [ ] **Step 10.4: Push to GitHub Pages**

```bash
git push origin master
```

Wait 30–60 seconds for Pages to redeploy. Verify the live site at `https://naomiaro.github.io/` matches local.

If GitHub Pages reports a build error, it's almost certainly because the Jekyll default tries to interpret folders. Add a `.nojekyll` file at the repo root if needed:

```bash
touch .nojekyll
git add .nojekyll
git commit -m "chore: add .nojekyll to skip Jekyll processing"
git push origin master
```

- [ ] **Step 10.5: No further commit if all checks pass.**

---

## Summary of Commits

After this plan completes, the branch will have these commits (one per task, with focused changes):

1. `feat: add visual shell with night-vision design tokens`
2. `feat: add navbar and footer`
3. `feat: add numbered sections and project cards`
4. `feat: scaffold hero with clickable name letters and play button`
5. `feat: add Tone.js techno loop wired to PLAY button`
6. (No commit — verification of letter wiring from Task 5)
7. `feat: add VexFlow staff above name letters`
8. `feat: add mobile responsive layout and reduced-motion overrides`
9. `chore: remove book page and old cover image`
10. (No commit unless QA finds issues)

Plus the spec commit already on master: `docs: add design spec for website overhaul`.
