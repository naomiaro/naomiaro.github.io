// js/notation.js
// VexFlow staff renderer for the clickable name. Renders 8 quarter
// noteheads (two 4/4 bars) matching the LETTER_NOTES sequence
// (A-minor pentatonic ascending). Single barline in the middle, double
// (final) barline at the end.

import VF from 'https://cdn.jsdelivr.net/npm/vexflow@4.2.5/+esm';

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

  const { Renderer, Stave, StaveNote, Voice, Formatter, BarNote, Barline } = VF;
  const width = container.clientWidth || 480;
  // 140px gives the lowest notes (A3, C4) room to render below the staff
  // without clipping at the SVG's bottom edge.
  const height = 140;

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const ctx = renderer.getContext();
  ctx.setFont('Arial', 10);

  const stave = new Stave(0, 20, width - 4);
  stave.addClef('treble').addTimeSignature('4/4');
  // Final (double-thick) barline at the end of the staff.
  stave.setEndBarType(Barline.type.END);
  stave.setContext(ctx).draw();

  const notes = STAFF_KEYS.map((key, i) => {
    const opts = { keys: [key], duration: 'q' };
    // Force the top two noteheads (C5, D5) stem-down so the staff
    // doesn't crowd above the top line. -1 = down in VexFlow.
    if (i >= 6) opts.stem_direction = -1;
    return new StaveNote(opts);
  });

  // Eight quarter notes = two 4/4 bars. Insert a single barline after
  // the first four to split them visually.
  const tickables = [
    notes[0], notes[1], notes[2], notes[3],
    new BarNote(),
    notes[4], notes[5], notes[6], notes[7],
  ];

  const voice = new Voice({ num_beats: 8, beat_value: 4 });
  voice.addTickables(tickables);

  new Formatter().joinVoices([voice]).format([voice], width - 80);
  voice.draw(ctx, stave);

  // Tag each notehead with its index for later highlight.
  // VexFlow v4 exposes the rendered <g> via getSVGElement().
  renderedNotes = notes.map((note, i) => {
    const el = note.getSVGElement();
    if (el) el.dataset.noteIndex = String(i);
    return el;
  });

  // Fallback: if getSVGElement() ever returns null, grab .vf-stavenote groups
  // in document order. VexFlow 4.2.5 emits lowercase class names.
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
