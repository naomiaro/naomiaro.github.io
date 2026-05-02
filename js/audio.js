// js/audio.js
// Tone.js audio module: 128 BPM techno loop + clickable name letter synth.
// Single export: init(). Called once on DOMContentLoaded from index.html.

import * as Tone from 'https://cdn.jsdelivr.net/npm/tone@15.1.22/+esm';

// Note mapping for the clickable name letters — A-minor pentatonic ascending.
// Order matches data-note-index 0..7 on each .name-letter button.
const LETTER_NOTES = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5'];

// Module-scoped state
let started = false;
let initializing = false;
let analyser = null;
let nameSynth = null;
let onLetterPlayCallback = null;

/**
 * Lazily start the AudioContext on the first user gesture, build the
 * synth graph, and store handles for later use. Idempotent.
 */
async function ensureAudio() {
  if (started) return;
  if (initializing) return;
  initializing = true;
  await Tone.start();

  Tone.getTransport().bpm.value = 128;

  // Master FX bus — compressor → reverb → masterGain → destination,
  // with a side-tap from masterGain to the FFT analyser for visualization.
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
  initializing = false;
}

/**
 * Wire the PLAY button: toggle Transport between started and stopped,
 * update aria-pressed and label, and ensure audio is initialized first.
 */
function wirePlayButton(button) {
  let toggling = false;
  button.addEventListener('click', async () => {
    if (toggling) return;
    toggling = true;
    try {
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
    } finally {
      toggling = false;
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

  let wasPlaying = false;

  function tick() {
    const isPlaying = started && analyser && Tone.getTransport().state === 'started';
    if (isPlaying) {
      const values = analyser.getValue(); // Float32Array, dB scale (-100..0)
      eqBars.forEach((bar, i) => {
        const db = values[i] ?? -100;
        const norm = Math.max(0.1, Math.min(1, (db + 80) / 80));
        bar.style.animation = 'none';
        bar.style.transform = `scaleY(${norm.toFixed(3)})`;
      });
    } else if (wasPlaying) {
      // Playback just stopped: clear inline overrides so the CSS
      // pulse animation can resume from its idle state.
      eqBars.forEach((bar) => {
        bar.style.animation = '';
        bar.style.transform = '';
      });
    }
    wasPlaying = isPlaying;
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
      nameSynth.triggerAttackRelease(note, 0.5);

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
