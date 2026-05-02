# Personal Website Overhaul — Design Spec

**Date:** 2026-05-01
**Author:** Naomi Aro (with Claude)
**Status:** Draft, awaiting user review

## Goal

Total visual + structural overhaul of `naomiaro.github.io` (the personal landing site) to adopt the "Berlin Underground / Night Vision" dark-mode aesthetic established by `waveform-playlist`'s Docusaurus site. Add interactive Tone.js audio and VexFlow notation that turn the site itself into a small instrument — fitting for a developer who builds web audio tools.

## Non-goals

- Light mode (intentionally dropped — dark-only commitment to the aesthetic).
- Build pipeline (no bundler, no SSG — stays as static HTML on GitHub Pages).
- Content management (no blog/posts on this site — Hashnode handles long-form).
- Service Worker / PWA features.

## Scope

One page only:

1. `index.html` — homepage, structurally rebuilt.

`mastering-tonejs-book.html` is **deleted** — the book is linked externally to `https://masteringtonejs.com/` from the Books section, so we no longer need an internal book page. This also drops the need to migrate Tone.js version mentions, copy the new cover image, etc.

The `Mural` project is dropped from the projects list. The `OpenDAW Demos` project (`github.com/naomiaro/opendaw-test`, live at `opendaw-test.pages.dev`) is added.

## Architecture

```
naomiaro.github.io/
├── index.html                   (rewritten)
├── css/
│   └── style.css                (NEW — single shared stylesheet, ~250 lines)
├── js/
│   ├── audio.js                 (NEW — Tone.js: techno loop + name synth)
│   └── notation.js              (NEW — VexFlow: name staff)
├── img/
│   └── stem.png                 (existing — keep)
├── favicon.ico                  (existing — keep)
└── .gitignore, .gitattributes, README.md, CLAUDE.md  (existing)
```

**Removed:** Materialize CSS CDN reference, `mastering-tonejs-book.html`, `img/masteringtonejs.png`.

### Static-only constraints

- No build step. Plain HTML + CSS + ES module JS, served by GitHub Pages.
- External deps loaded via ES module imports from jsdelivr `+esm`:
  - `https://cdn.jsdelivr.net/npm/tone@15.1.22/+esm`
  - `https://cdn.jsdelivr.net/npm/vexflow@4/+esm`
- Fonts via Google Fonts `<link>` (Space Grotesk + JetBrains Mono).
- Both JS modules are loaded only on `index.html` (the only page).

## Visual Design System

Ported verbatim from `waveform-playlist/website/src/css/custom.css` dark-mode block.

### Color tokens (CSS custom properties on `:root`)

```css
:root {
  /* Backgrounds */
  --bg: #0a0a0f;
  --surface: #12121a;
  --navbar-bg: rgba(10, 10, 15, 0.95);

  /* Primary accent — Ampelmännchen green */
  --primary: #63C75F;
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
}
```

### Typography rules

- Body: Space Grotesk 400, line-height 1.6.
- Headings: Space Grotesk 600, tight line-height 1.2, large negative letter-spacing on h1 (`-0.03em`).
- Numerals/code/section numbers: JetBrains Mono.
- Navbar links: uppercase, `letter-spacing: 0.05em`, font-size 0.9rem.
- All headings get a glow text-shadow on dark (per the night-vision style).

### Brutalist details

- `border-radius: 0` everywhere (cards, buttons, code blocks, scrollbar).
- Buttons: 2px border, uppercase label, 0.9rem padding × 2rem, no fill on secondary, lift on hover (`translateY(-2px)`).
- Selection color: green primary on near-black text.
- Scrollbar: 8px, dark transparent thumb.

### Motion

- **Glitch hover on h1/h2** — 5-frame translate jitter, ~300ms. Disabled under `prefers-reduced-motion`.
- **Link underline grow** — `background-image` linear-gradient with `background-size: 0% 2px` → `100% 2px` on hover, 0.3s ease.
- **Card hover** — `translateY(-4px)` + green border replacing default border.
- **Equalizer pulse** — idle CSS animation on hero SVG bars; replaced by FFT-driven heights when audio plays.
- All non-essential motion is disabled under `prefers-reduced-motion: reduce`.

## Homepage Layout (`index.html`)

```
┌────────────────────────────────────────────────────────────┐
│ NAVBAR                                                     │
│   NAOMI ARO              github · twitter · linkedin · blog│
├────────────────────────────────────────────────────────────┤
│                                                            │
│ HERO — full-width, ~80vh, subtle radial gradient bg        │
│                                                            │
│   ┌───────────────────────────────────┐                    │
│   │  ♪ VexFlow staff — 8 noteheads ♪  │                    │
│   │  treble clef, 4/4, A minor pent.  │                    │
│   └───────────────────────────────────┘                    │
│                                                            │
│         N   A   O   M   I     A   R   O                    │
│         ↑ each letter = button, plays the note above       │
│                                                            │
│         full stack developer · audio on the web            │
│                                                            │
│         [ ▶ PLAY ]    ← toggles techno loop                │
│                                                            │
│   (background SVGs: equalizer bars + circular visualizer,  │
│    animated by Tone.Analyser FFT when loop plays;          │
│    idle CSS animation when silent)                         │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  01 / ABOUT                                                │
│      [3-sentence bio]                                      │
├────────────────────────────────────────────────────────────┤
│  02 / BLOG               long-form thoughts                │
│      → naomiaro.hashnode.dev                               │
├────────────────────────────────────────────────────────────┤
│  03 / PROJECTS                                             │
│      ┌────────────────┐ ┌────────────────┐                 │
│      │ Waveform       │ │ OpenDAW        │                 │
│      │ Playlist       │ │ Demos          │                 │
│      │ [stem.png]     │ │                │                 │
│      │ npm dl badge   │ │ live demo ·    │                 │
│      │ description    │ │ description    │                 │
│      │ Project · GH   │ │ Demo · GH      │                 │
│      └────────────────┘ └────────────────┘                 │
├────────────────────────────────────────────────────────────┤
│  04 / BOOKS                                                │
│      → Mastering Tone.js  (masteringtonejs.com, external)  │
├────────────────────────────────────────────────────────────┤
│  FOOTER                                                    │
│      © 2026 Naomi Aro · github · twitter · linkedin · email│
└────────────────────────────────────────────────────────────┘
```

### Section header pattern

Each numbered section uses the waveform-playlist editorial style:

```
01 / SECTION NAME
─── short subtitle in mono ───
```

- Number: JetBrains Mono, primary green, 0.9rem.
- Slash separator + title: Space Grotesk 600 uppercase, letter-spacing.
- Optional subtitle: text-secondary, mono, smaller.

### Hero details

- Background: `linear-gradient(135deg, #0a0a0f, #0f0f18, #0a0a0f)` plus two low-opacity radial gradients (green at 20%/80%, red at 80%/20%) — copied from waveform-playlist's hero pseudo-element.
- Decorative SVGs: 8-bar equalizer (positioned absolutely, low opacity), circular visualizer (positioned absolutely, low opacity). Both pull `var(--primary)` for stroke. Both ported from `waveform-playlist/website/src/pages/index.tsx`.
- Name letters: each `<button>` element with `aria-label="Play [note name]"`, font-size ~5rem on desktop, ~3rem on mobile, generous letter-spacing. Letters wrap to two lines on narrow viewports.
- VexFlow staff: rendered into a fixed-height `<div>` above the letters; centered; max-width matches the letter row.
- PLAY button: brutalist primary style, 2px green border, uppercase label, has `aria-pressed`. Toggles between "▶ PLAY" and "■ STOP".

### Project card content

**Card 1 — Waveform Playlist** (highest priority, top-left):
- Image: `img/stem.png`
- Title: "Waveform Playlist"
- npm downloads badge: `https://img.shields.io/npm/dm/waveform-playlist.svg`
- Description: existing copy preserved ("Multitrack Web Audio editor and player with canvas waveform preview…").
- Links: `https://naomiaro.github.io/waveform-playlist/` (Project Site), `https://github.com/naomiaro/waveform-playlist` (GitHub).

**Card 2 — OpenDAW Demos** (new):
- No image yet (placeholder: a small SVG marker, or omit until a screenshot exists).
- Title: "OpenDAW Demos"
- Description: "Interactive demos of the OpenDAW SDK — multi-track mixing, recording, automation, scriptable effects. A growing collection of examples for building DAWs in the browser."
- Links: `https://opendaw-test.pages.dev/` (Live Demo), `https://github.com/naomiaro/opendaw-test` (GitHub).

### About Me

> The browser, but as a DAW — [Waveform Playlist](https://github.com/naomiaro/waveform-playlist), *[Mastering Tone.js](https://masteringtonejs.com/)*, and a growing pile of OpenDAW experiments.

## Audio Module (`js/audio.js`)

ES module. Single export: `init()`. Called once from `index.html` on `DOMContentLoaded`.

### Interactions

#### (a) Techno loop — toggled by PLAY button

- Tempo: 128 BPM (Berghain).
- **Kick**: `Tone.MembraneSynth`, triggered on every quarter note via a `Tone.Loop` or `Tone.Sequence`. Punchy octave-down pitch envelope from C2.
- **Hi-hat**: short percussive synthesis (e.g. `Tone.MetalSynth` or `Tone.NoiseSynth` through a high-pass filter — implementation choice), triggered on offbeats (the `&` of every quarter — i.e. eighth-note positions 2, 4, 6, 8 of each bar).
- **Pad**: `Tone.PolySynth` (sawtooth oscillator, slow ADSR) playing an A-minor triad (A2 + C3 + E3) every two bars, sustained. Routed through `Tone.Filter` (lowpass, base cutoff 600 Hz) modulated by a `Tone.LFO` (rate 0.05 Hz, depth 400–1200 Hz) for slow movement.
- **Master chain**: kick + hat + pad → shared `Tone.Compressor` → `Tone.Reverb` (decay 4s, wet 0.2) → `Tone.Destination`.
- **Default volume**: master at -8 dB (polite for a portfolio site).
- **Analyser**: `Tone.Analyser('fft', 32)` on the master, read by the equalizer SVG via `requestAnimationFrame`.

#### (b) Clickable name letters

- Letters: `N A O M I A R O` → 8 buttons.
- Note mapping (A minor pentatonic, ascending):

  | Letter | Note |
  |--------|------|
  | N | A3 |
  | A | C4 |
  | O | D4 |
  | M | E4 |
  | I | G4 |
  | A | A4 |
  | R | C5 |
  | O | D5 |

- Synth: shared `Tone.PolySynth` (triangle oscillator, soft attack/release).
- Each click triggers a 0.5s note. Multiple letters can layer (chord-like).
- Routed through the same reverb bus as the techno loop, so it sounds coherent whether the loop is playing or not.
- On click: also toggle a CSS `.active` class on the corresponding VexFlow notehead for ~400ms (handled in `notation.js`, see below).

### Lifecycle

- `Tone.start()` runs **lazily** on the first user gesture (PLAY click or any letter click). Required by browser autoplay policy.
- `audio.js` exports `init({ playButton, letterButtons, fftAnalyserCallback, onLetterPlay })`:
  - Wires DOM listeners.
  - Returns nothing.
  - The `fftAnalyserCallback` lets the equalizer SVG subscribe to FFT updates.
  - The `onLetterPlay(letterIndex)` callback fires when a letter is played, so `notation.js` can flash the corresponding notehead.

### Volume / safety

- Master volume defaults to -8 dB.
- A small mute icon could appear next to the PLAY button — out of scope for v1; user can toggle via system volume.
- All Tone instances are created at `init()` time but Transport remains stopped until PLAY.

## Notation Module (`js/notation.js`)

ES module. Single export.

### `renderNameStaff({ container, onNoteheadReady })`

- Renders a single 4/4 treble-clef bar with the 8 notes from the name mapping.
- Uses VexFlow 4 SVG renderer.
- Width: scales to container. Height: ~100px.
- Notes are eighth notes (8 × 8th = one bar).
- After render, calls `onNoteheadReady(index, svgElement)` for each notehead. The audio module's `onLetterPlay(index)` adds an `.active` class to the corresponding notehead. CSS handles a brief glow + scale animation.

### Highlight CSS (in `style.css`)

```css
.vf-stavenote.active path {
  fill: var(--primary);
  filter: drop-shadow(0 0 8px var(--primary));
  transition: fill 0.1s ease;
}

@media (prefers-reduced-motion: reduce) {
  .vf-stavenote.active path {
    filter: none;
  }
}
```

## Performance & Accessibility

### Performance budget

| Resource | Size (gzipped, approx) |
|----------|------------------------|
| `style.css` | ~5 KB |
| `audio.js` (our code) | ~3 KB |
| `notation.js` (our code) | ~2 KB |
| Tone.js v15 | ~140 KB |
| VexFlow v4 | ~80 KB |
| Google Fonts (Space Grotesk + JetBrains Mono) | ~50 KB |
| **Homepage total** | **~280 KB JS + ~5 KB CSS + ~50 KB fonts** |

This is acceptable for a personal portfolio. If perf becomes a concern later, lazy-import VexFlow only when the staff scrolls into view, or self-host the fonts.

### Accessibility

- Letter buttons: `<button>` elements with `aria-label="Play [note]"`, full keyboard support (Enter/Space).
- PLAY button: `<button aria-pressed="false">`. Pressed state when loop is running.
- Color contrast: amber `#d8c0a8` on near-black `#0a0a0f` exceeds WCAG AA at body sizes (≈ 11:1).
- Heading glows are `text-shadow` only — they do not affect contrast calculations.
- All decorative SVGs have `aria-hidden="true"`.
- `prefers-reduced-motion: reduce`:
  - Disables glitch heading hover animation.
  - Freezes the equalizer / circular visualizer at static frame.
  - Disables notehead glow filter (color change still applies, since color is informative).
  - Audio still plays normally.
- Keyboard focus rings preserved (don't `outline: none` without replacement).
- All external links: `rel="noopener"` where opening in new tab.

### Mobile

- Hero name title: 5rem desktop → 3rem mobile.
- Letters wrap to two lines on narrow viewports.
- Project cards: 2-column desktop → 1-column < 768px.
- VexFlow staff scales (re-renders on resize via `ResizeObserver`).
- Tap targets ≥ 44px on touch devices.

## Open Questions / Decisions Deferred

1. **OpenDAW project image** — no screenshot exists yet in our hands. Card will render without an image (or use a small SVG placeholder that fits the aesthetic). User can drop a screenshot into `img/` later.
2. **Hero scroll behavior** — waveform-playlist hero has parallax on the bg layers. We're skipping that for v1 (simpler) but it's a small addition if the user wants it later.

## File-Level Change Summary

| File | Action |
|------|--------|
| `index.html` | Rewrite |
| `mastering-tonejs-book.html` | Delete |
| `css/style.css` | Create |
| `js/audio.js` | Create |
| `js/notation.js` | Create |
| `img/masteringtonejs.png` | Delete |
| `favicon.ico`, `img/stem.png`, `.gitignore`, `.gitattributes`, `README.md`, `CLAUDE.md` | Untouched |

## Success Criteria

- Homepage loads, renders dark Berlin Underground aesthetic with custom fonts.
- Clicking PLAY starts a 128 BPM techno loop; the equalizer SVG animates to FFT data.
- Clicking PLAY again stops it.
- Clicking a name letter plays a note from the A-minor pentatonic mapping; the corresponding notehead in the VexFlow staff glows for ~400ms.
- Clicking letters works whether the loop is playing or not.
- The Books section on the homepage links externally to `https://masteringtonejs.com/`.
- Homepage passes Lighthouse Accessibility ≥ 95.
- `prefers-reduced-motion: reduce` disables non-essential motion; audio still plays.
- Mobile (375px wide): no horizontal scroll, all content readable, letters tappable.
