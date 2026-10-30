/* The study room: music, light and Focus mode for Your Ground Plan, the
 * Library and Ask Alexandru (the dashboard). One engine for the whole
 * dashboard; the Cabinet's record player and the mini player both drive it.
 *
 * The music is played live by the browser (Web Audio, no file), so nothing
 * is downloaded and nothing is licensed. Clean sound, no vinyl crackle.
 * Six pieces:
 *   trio    Late-night trio: piano, double bass, brushes
 *   piano   Quiet piano: slow chords, a few high notes
 *   ambient Warm room: long pads and soft bells
 *   road    Open road: driving guitar, bass and drums (rock)
 *   burn    Slow burn: half-time drums, heavy chords (rock)
 *   riff    Steady riff: one riff, bass and drums (rock)
 * Energy (calmer ↔ more energy) moves the tempo and which instruments play:
 * calm drops the brushes and walks the bass less; more energy adds them back.
 *
 * Light (dimmer ↔ brighter) lays a warm shade over the whole page. The Lamp
 * (Focus mode's third part) turns that shade into a pool of lamplight that
 * follows the question the founder is writing, and the room answers the
 * work: each finished answer plays a soft chord in the music's key and lights
 * one of seven candles for the domain. Study mode and Focus mode are the two
 * presets of music, energy, light and the Lamp together.
 *
 * Never plays before a click: the browser forbids it and so do we. Two
 * minutes on the dashboard (Your Ground Plan, the programme, the Library,
 * Ask Alexandru) brings one quiet invitation (once a day at most).
 * Under prefers-reduced-motion nothing spins or slides. Settings are kept on
 * this browser only (localStorage 'es-music'). */

const KEY = 'es-music';
const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };

export const TRACKS = {
  trio: { n: 'Late-night trio', d: 'Piano, double bass, brushes' },
  piano: { n: 'Quiet piano', d: 'Slow chords, room to think' },
  ambient: { n: 'Warm room', d: 'Long pads, soft bells' },
  road: { n: 'Open road', d: 'Driving guitar, bass and drums' },
  burn: { n: 'Slow burn', d: 'Half-time drums, heavy chords' },
  riff: { n: 'Steady riff', d: 'One riff, bass and drums' },
};
export const MODES = {
  study: { n: 'Study mode', d: 'Quiet piano, calm, the light softened', track: 'piano', energy: 30, light: 82, lamp: false },
  focus: { n: 'Focus mode', d: 'Dimmed room, steady music, and the Lamp', track: 'trio', energy: 55, light: 48, lamp: true },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
/** The founder's settings, with safe defaults. */
export function settings() {
  let s = {};
  try { s = JSON.parse(get(KEY) || '{}') || {}; } catch { s = {}; }
  return {
    track: TRACKS[s.track] ? s.track : 'trio',
    vol: clamp(num(s.vol, num(get('cab-vol'), 55)), 0, 100),
    energy: clamp(num(s.energy, 45), 0, 100),
    light: clamp(num(s.light, 100), 0, 100),
    mode: MODES[s.mode] ? s.mode : '',
    lamp: s.lamp === true,
  };
}
let S = settings();
const keep = () => put(KEY, JSON.stringify(S));

/** How dark the shade is for a light setting: 100 = none, 0 = deep dusk. */
export const shade = (light) => Math.round((1 - clamp(light, 0, 100) / 100) * 0.62 * 100) / 100;
/** Beats per minute for a piece at an energy (0–100). */
export const tempo = (track, energy) => Math.round(({ trio: 62, piano: 54, ambient: 48, road: 92, burn: 58, riff: 80 }[track] || 62) + clamp(energy, 0, 100) * 0.36);

/* ── The engine ──────────────────────────────────────────────────────────── */
let E = null;
function engine() {
  if (E) return E;
  E = (function () {
    var ctx, master, out, verb, ep, gtr, noise, timer = null, playing = false, nextT = 0, beatN = 0, vol = .55, stopTok = 0;
    var track = 'trio', energy = .45;
    function bpm() { return tempo(track, energy * 100); }
    function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    var CH = [{ r: 38, t: 3, v: [53, 57, 60, 64] }, { r: 43, t: 4, v: [53, 59, 64, 69] }, { r: 36, t: 4, v: [52, 55, 59, 62] }, { r: 45, t: 4, v: [55, 61, 65, 70] },
      { r: 38, t: 3, v: [53, 57, 60, 65] }, { r: 43, t: 4, v: [53, 59, 62, 69] }, { r: 40, t: 3, v: [50, 55, 59, 62] }, { r: 45, t: 4, v: [55, 61, 64, 70] }];
    function impulse(sec) { var r = ctx.sampleRate, n = Math.floor(r * sec), b = ctx.createBuffer(2, n, r); for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2); } return b; }
    function init() {
      var AC = window.AudioContext || window.webkitAudioContext; ctx = new AC();
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3;
      master = ctx.createGain(); master.gain.value = 0; comp.connect(master); master.connect(ctx.destination);
      out = ctx.createGain(); out.connect(comp);
      verb = ctx.createConvolver(); verb.buffer = impulse(2.6); var vg = ctx.createGain(); vg.gain.value = .3; out.connect(verb); verb.connect(vg); vg.connect(comp);
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000;
      ep = ctx.createGain(); ep.gain.value = .85; var lfo = ctx.createOscillator(), ld = ctx.createGain(); lfo.frequency.value = 4.2; ld.gain.value = .18; lfo.connect(ld); ld.connect(ep.gain); lfo.start();
      ep.connect(lp); lp.connect(out);
      var n = ctx.sampleRate * 2; noise = ctx.createBuffer(1, n, ctx.sampleRate); var d = noise.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      // The guitar: two detuned saws into a soft clip and a speaker-like low pass.
      var sh = ctx.createWaveShaper(), cv = new Float32Array(1024); for (var q = 0; q < 1024; q++) { var x = q / 511.5 - 1; cv[q] = Math.tanh(x * 6) / Math.tanh(6); }
      sh.curve = cv; sh.oversample = '2x'; gtr = ctx.createGain(); gtr.gain.value = 1; var cab = ctx.createBiquadFilter(); cab.type = 'lowpass'; cab.frequency.value = 2600; cab.Q.value = .7;
      var gOut = ctx.createGain(); gOut.gain.value = .085; gtr.connect(sh); sh.connect(cab); cab.connect(gOut); gOut.connect(out);
    }
    function key(m, t, dur, vel, dest) {
      var f = mtof(m), g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.1 * vel, t + .006); g.gain.exponentialRampToValueAtTime(.035 * vel, t + .55); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
      var o1 = ctx.createOscillator(); o1.frequency.value = f; var o2 = ctx.createOscillator(); o2.frequency.value = f * 2.003; var g2 = ctx.createGain(); g2.gain.value = .22;
      var o3 = ctx.createOscillator(); o3.frequency.value = f * 7.1; var g3 = ctx.createGain(); g3.gain.setValueAtTime(.05 * vel, t); g3.gain.exponentialRampToValueAtTime(.0001, t + .1);
      o1.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g); g.connect(dest || ep);
      [o1, o2, o3].forEach(function (o) { o.start(t); o.stop(t + dur + .05); });
    }
    function chord(c, t, dur, vel, spread) { c.v.forEach(function (m, i) { key(m, t + i * (spread || .014) + Math.random() * .008, dur, vel * (.85 + Math.random() * .25)); }); }
    function bass(m, t, dur, gain) {
      var f = mtof(m), o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f; var o2 = ctx.createOscillator(); o2.frequency.value = f;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1000, t); lp.frequency.exponentialRampToValueAtTime(320, t + .25);
      var g = ctx.createGain(), pk = .34 * (gain || 1); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + .012); g.gain.exponentialRampToValueAtTime(pk * .35, t + .16); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(out); o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
    }
    function hiss(t, len, gain, freq, type) {
      var s = ctx.createBufferSource(); s.buffer = noise; var f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = .8;
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(.02, len * .3)); g.gain.exponentialRampToValueAtTime(.0001, t + len);
      s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 1.5); s.stop(t + len + .03);
    }
    function pad(c, t, dur) {
      c.v.forEach(function (m) {
        [-5, 5].forEach(function (cent) {
          var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m - 12) * Math.pow(2, cent / 1200);
          var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.02, t + 1.6); g.gain.setValueAtTime(.02, t + Math.max(1.7, dur - 1.4)); g.gain.linearRampToValueAtTime(0, t + dur);
          o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .05);
        });
      });
    }
    function kick(t, g) {
      var o = ctx.createOscillator(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .12);
      var v = ctx.createGain(); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(.55 * g, t + .004); v.gain.exponentialRampToValueAtTime(.001, t + .32);
      o.connect(v); v.connect(out); o.start(t); o.stop(t + .35);
    }
    function snareHit(t, g) {
      hiss(t, .2, .07 * g, 1900);
      var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 185; var v = ctx.createGain(); v.gain.setValueAtTime(.12 * g, t); v.gain.exponentialRampToValueAtTime(.001, t + .09);
      o.connect(v); v.connect(out); o.start(t); o.stop(t + .1);
    }
    function hat(t, g) { hiss(t, .045, .02 * g, 8200, 'highpass'); }
    /** A power chord (or one note): root, fifth, octave. `mute` = palm-muted chug. */
    function power(r, t, dur, vel, mute, single) {
      (single ? [r] : [r, r + 7, r + 12]).forEach(function (m) {
        [-6, 6].forEach(function (cent) {
          var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m) * Math.pow(2, cent / 1200);
          var v = ctx.createGain(), pk = .5 * vel, len = mute ? Math.min(dur, .16) : dur;
          v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(pk, t + .005); v.gain.exponentialRampToValueAtTime(pk * (mute ? .15 : .55), t + (mute ? .08 : .4)); v.gain.exponentialRampToValueAtTime(.0005, t + len);
          if (mute) { var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; o.connect(lp); lp.connect(v); } else o.connect(v);
          v.connect(gtr); o.start(t); o.stop(t + len + .05);
        });
      });
    }
    var RK = { road: [40, 36, 43, 38], burn: [45, 41, 36, 43], riff: [40, 40, 43, 38] };
    var RIFF = [0, 0, 3, 0, 5, 0, 3, -2];
    function rock(n, t) {
      var BEAT = 60 / bpm(), H = BEAT / 2, bar = Math.floor(n / 4) % 4, b = n % 4, r = RK[track][bar];
      if (track === 'road') {
        for (var e = 0; e < 2; e++) { var te = t + e * H;
          if (b === 0 && e === 0 && energy >= .4) power(r, te, BEAT * 1.9, .9); else power(r, te, H, .55, true);
          bass(r - 12, te, H * .9, .5);
          if (energy >= .3 || e === 0) hat(te, e ? .7 : 1); }
        if (b === 0 || b === 2) kick(t, 1); if (b === 2 && energy >= .55) kick(t + H, .8);
        if (b === 1 || b === 3) snareHit(t, 1);
        return;
      }
      if (track === 'burn') {
        if (b === 0) { power(r, t, BEAT * 3.8, .85); bass(r - 12, t, BEAT * 3.6, .7); kick(t, 1); }
        if (b === 2) snareHit(t, 1.1);
        if (b === 3 && energy >= .5) kick(t + H, .7);
        hat(t, .8); if (energy >= .45) hat(t + H, .5);
        if (b === 2 && Math.random() < .25 + energy * .3) power(r + 24 + [0, 3, 5, 7][Math.floor(Math.random() * 4)], t + H, BEAT * 1.4, .45, false, true);
        return;
      }
      // riff: the same eight notes over the bar's root, bass doubling, a plain backbeat.
      for (var k = 0; k < 2; k++) { var tk = t + k * H, m = r + RIFF[b * 2 + k];
        if (b === 0 && k === 0) power(m, tk, H * 1.6, .8); else power(m, tk, H * .9, .6, energy < .6, true);
        bass(m - 12, tk, H * .85, .45);
        if (energy >= .35 || k === 0) hat(tk, k ? .6 : .9); }
      if (b === 0 || (b === 2 && energy >= .4)) kick(t, 1); if (b === 1 && energy >= .6) kick(t + H, .7);
      if (b === 1 || b === 3) snareHit(t, .9);
    }
    function beat(n, t) {
      if (RK[track]) { rock(n, t); return; }
      var BEAT = 60 / bpm(), bar = Math.floor(n / 4) % CH.length, b = n % 4, c = CH[bar], nx = CH[(bar + 1) % CH.length], sw = BEAT * .66;
      if (track === 'ambient') {
        if (b === 0 && bar % 2 === 0) { pad(c, t, BEAT * 8.4); bass(c.r, t, BEAT * 7.5, .45); }
        if (Math.random() < .08 + energy * .22) { var bl = c.v[Math.floor(Math.random() * c.v.length)] + 24; key(bl, t + (Math.random() < .5 ? 0 : sw), 2.4, .3); }
        if (energy > .6 && b % 2 === 0) hiss(t, .1, .006 + (energy - .6) * .02, 6500, 'highpass');
        return;
      }
      if (track === 'piano') {
        if (b === 0) { chord(c, t, BEAT * 3.6, .7, .11); bass(c.r, t, BEAT * 3.4, .5); }
        if (b === 2 && Math.random() < .2 + energy * .5) chord(c, t, BEAT * 1.6, .38, .05);
        if (Math.random() < .1 + energy * .25) { var pool = c.v.map(function (m) { return m + 12; }); key(pool[Math.floor(Math.random() * pool.length)] + (Math.random() < .3 ? 12 : 0), t + (b % 2 ? sw : 0), 1.8, .45); }
        if (energy > .7 && (b === 1 || b === 3)) hiss(t, .18, .012, 7000, 'highpass');
        return;
      }
      // The trio. Below a third of the energy the bass holds the root; the
      // brushes come in a little after that.
      var walk = energy >= .35, brushes = energy >= .3, snare = energy >= .45;
      if (walk) {
        var r = c.r, line = [r, r + c.t, r + 7, (Math.random() < .5 ? nx.r - 1 : nx.r + 1)]; if (Math.random() < .3) line[2] = r + (c.t === 3 ? 10 : 9);
        bass(line[b], t, BEAT * .92);
      } else if (b === 0) bass(c.r, t, BEAT * 3.5, .8);
      else if (b === 2 && Math.random() < .4) bass(c.r + 7, t, BEAT * 1.6, .55);
      if (brushes) hiss(t, .22, .016, 7000, 'highpass');
      if (b === 1 || b === 3) { if (brushes) hiss(t + sw, .12, .012, 7000, 'highpass'); if (snare) hiss(t, .26, .05, 3200); } else if (brushes) hiss(t, .08, .018, 2600);
      if (energy > .72 && b % 2 === 0) hiss(t + sw, .09, .01, 7500, 'highpass');
      if (b === 0) chord(c, t, BEAT * 2.6, .9);
      if (b === 1 && Math.random() < .3 + energy * .3) chord(c, t + sw, BEAT * .45, .55);
      if (b === 2 && Math.random() < .2 + energy * .25) chord(c, t, BEAT * 1.1, .45);
      if (b === 3 && Math.random() < .3) chord(nx, t + sw, BEAT * .5, .5);
      for (var e = 0; e < 2; e++) { if (Math.random() < .06 + energy * .16) { var p = c.v.concat(c.v.map(function (m) { return m + 12; })).filter(function (m) { return m >= 64 && m <= 82; }); key(p[Math.floor(Math.random() * p.length)] + 12, t + (e ? sw : 0), 1.6, .55); } }
    }
    function tick() { while (nextT < ctx.currentTime + .25) { beat(beatN, nextT); nextT += 60 / bpm(); beatN++; } }
    function start() {
      if (!ctx) init(); stopTok++; ctx.resume();
      if (!timer) { nextT = ctx.currentTime + .12; timer = setInterval(tick, 40); }
      var g = master.gain; g.cancelScheduledValues(ctx.currentTime); g.setValueAtTime(g.value, ctx.currentTime); g.linearRampToValueAtTime(vol * .6, ctx.currentTime + 2.4);
      playing = true;
    }
    function stop() {
      if (!ctx || !playing) return; playing = false; var tok = ++stopTok, g = master.gain;
      g.cancelScheduledValues(ctx.currentTime); g.setValueAtTime(g.value, ctx.currentTime); g.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      setTimeout(function () { if (tok !== stopTok) return; clearInterval(timer); timer = null; ctx.suspend(); }, 1300);
    }
    function setVol(v) { vol = v; if (ctx && playing) { var g = master.gain; g.cancelScheduledValues(ctx.currentTime); g.setTargetAtTime(vol * .6, ctx.currentTime, .1); } }
    function setEnergy(e) { energy = Math.min(1, Math.max(0, e)); }
    /** The room answers the work: the bar's chord, rising, soft. */
    function chime() {
      if (!ctx || !playing) return;
      var c = CH[Math.floor(beatN / 4) % CH.length], t = ctx.currentTime + .05;
      c.v.forEach(function (m, i) { key(m + 12, t + i * .09, 2.6, .5); });
      key(c.v[c.v.length - 1] + 24, t + c.v.length * .09 + .05, 2.2, .35);
    }
    function setTrack(t) { if (TRACKS[t]) { track = t; beatN = 0; } }
    return { start: start, stop: stop, setVol: setVol, setEnergy: setEnergy, setTrack: setTrack, chime: chime, isPlaying: function () { return playing; } };
  })();
  return E;
}

/* ── Playing ─────────────────────────────────────────────────────────────── */
const subs = new Set();
/** Called with no arguments whenever anything changes (playing, settings). */
export const onChange = (fn) => { subs.add(fn); return () => subs.delete(fn); };
const tell = () => subs.forEach((fn) => { try { fn(); } catch { /* a painter failed */ } });
export const isOn = () => !!(E && E.isPlaying());
export let failed = false;

export function play() {
  try { const J = engine(); J.setTrack(S.track); J.setEnergy(S.energy / 100); J.setVol(S.vol / 100); J.start(); }
  catch { failed = true; }
  tell();
}
export function pause() { if (E) E.stop(); tell(); }
let userPaused = false;
export function toggle() { if (isOn()) { userPaused = true; pause(); } else { userPaused = false; play(); } }
export const pausedByFounder = () => userPaused;

export function set(patch) {
  S = { ...S, ...patch };
  S.vol = clamp(num(S.vol, 55), 0, 100); S.energy = clamp(num(S.energy, 45), 0, 100); S.light = clamp(num(S.light, 100), 0, 100);
  keep();
  if (E) { E.setTrack(S.track); E.setEnergy(S.energy / 100); E.setVol(S.vol / 100); }
  dim();
  tell();
}
export const current = () => ({ ...S });

/** Study or Focus: music, energy and light together. The same mode again
 *  turns it off and lets the light back up. Starts the music (a click). */
export function mode(k) {
  if (S.mode === k || !MODES[k]) { set({ mode: '', light: 100, lamp: false }); return; }
  const m = MODES[k];
  set({ mode: k, track: m.track, energy: m.energy, light: m.light, lamp: m.lamp });
  userPaused = false;
  if (!isOn()) play();
}

/* ── The light ───────────────────────────────────────────────────────────── */
let here = false;
function dim() {
  if (typeof document === 'undefined') return;
  let d = document.getElementById('mp-dim');
  const lampOn = here && S.lamp;
  const a = here ? (lampOn ? Math.max(.55, shade(S.light) + .3) : shade(S.light)) : 0;
  if (!d) {
    if (!a) return;
    d = document.createElement('div'); d.id = 'mp-dim'; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d);
  }
  d.style.opacity = String(Math.min(.92, a));
  d.classList.toggle('focus', here && S.mode === 'focus' && !lampOn);
  d.classList.toggle('lamp', lampOn);
  if (lampOn) aim(); else d.classList.remove('aimed');
  candles();
}

/* ── The Lamp ────────────────────────────────────────────────────────────── */
/** The pool of light: around the question being written, else the middle. */
let target = null, aimQueued = false;
function aim() {
  const d = document.getElementById('mp-dim'); if (!d) return;
  const el = target && document.body.contains(target) ? target : null;
  if (!el) { d.classList.remove('aimed'); return; }
  const r = el.getBoundingClientRect();
  d.style.setProperty('--lx', `${Math.round(r.left + r.width / 2)}px`);
  d.style.setProperty('--ly', `${Math.round(r.top + r.height / 2)}px`);
  d.style.setProperty('--lw', `${Math.round(Math.max(260, r.width * .75))}px`);
  d.style.setProperty('--lh', `${Math.round(Math.max(180, r.height * .9))}px`);
  d.classList.add('aimed');
}
const reAim = () => { if (aimQueued || !S.lamp) return; aimQueued = true; requestAnimationFrame(() => { aimQueued = false; aim(); }); };

/** The seven candles for the domain on screen: lit = answers written. */
let lit = -1;
export function setCandles(n) { lit = Number.isFinite(n) ? Math.max(0, Math.min(7, n)) : -1; candles(); }
function candles() {
  if (typeof document === 'undefined') return;
  let c = document.getElementById('mp-candles');
  const show = here && S.lamp && lit >= 0;
  if (!show) { if (c) c.hidden = true; return; }
  if (!c) { c = document.createElement('div'); c.id = 'mp-candles'; c.className = 'mp-candles'; c.setAttribute('role', 'status'); document.body.appendChild(c); }
  c.hidden = false;
  c.setAttribute('aria-label', `${lit} of 7 answers written in this domain`);
  c.innerHTML = Array.from({ length: 7 }, (_, i) => `<i class="${i < lit ? 'on' : ''}"></i>`).join('');
}
/** A finished answer: one more candle, and the room plays it back. */
export function answered(n) {
  setCandles(n);
  if (E && S.lamp) E.chime();
  const c = document.getElementById('mp-candles');
  if (c) { const last = c.querySelectorAll('i.on'); const i = last[last.length - 1]; if (i) i.classList.add('new'); }
}

/* ── The mini player ─────────────────────────────────────────────────────── */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
const DISC = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#0B0907"/><g fill="none" stroke="#2E2822" stroke-width=".7"><circle cx="20" cy="20" r="16"/><circle cx="20" cy="20" r="13"/><circle cx="20" cy="20" r="10"/></g><path d="M8 13A14 14 0 0 1 22 6" fill="none" stroke="#F3EBD2" stroke-opacity=".18" stroke-width="3"/><circle cx="20" cy="20" r="6.5" fill="#C9A24A"/><circle cx="20" cy="20" r="1.2" fill="#1C1309"/></svg>';

/** The player's markup, from the settings. */
export function playerHTML(s = S, playing = false, open = false) {
  const t = TRACKS[s.track];
  return `<button type="button" class="mp-pill" data-mp="open" aria-expanded="${open}" aria-controls="mp-win">
    <span class="mp-disc">${DISC}</span>
    <span class="mp-pt"><b>${esc(t.n)}</b><small>${playing ? (s.mode ? esc(MODES[s.mode].n) : 'Playing') : 'Study music'}</small></span>
    <span class="mp-eq" aria-hidden="true"><i></i><i></i><i></i></span>
  </button>
  <div class="mp-win" id="mp-win" role="dialog" aria-label="Study music, light and focus"${open ? '' : ' hidden'}>
    <div class="mp-head"><div><p class="mp-k">Your study room</p><h2>Music &amp; light</h2></div>
      <button type="button" class="mp-x" data-mp="close" aria-label="Close the player"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    <div class="mp-now"><button type="button" class="mp-play" data-mp="play" aria-label="${playing ? 'Pause the music' : 'Play the music'}">${playing ? PAUSE : PLAY}</button>
      <div><b>${esc(t.n)}</b><span>${failed ? 'Music is not available in this browser' : esc(t.d)}</span></div></div>
    <fieldset class="mp-tracks"><legend>Choose the music</legend>
      ${Object.entries(TRACKS).map(([k, v]) => `<label><input type="radio" name="mp-track" value="${k}"${k === s.track ? ' checked' : ''}><span>${esc(v.n)}</span></label>`).join('')}
    </fieldset>
    <label class="mp-sl"><span class="mp-sk">Light</span><span class="mp-ends"><em>Dimmer</em><input type="range" id="mp-light" min="0" max="100" step="1" value="${s.light}" aria-label="Light: dimmer to brighter"><em>Brighter</em></span></label>
    <label class="mp-sl"><span class="mp-sk">Energy</span><span class="mp-ends"><em>Calmer</em><input type="range" id="mp-energy" min="0" max="100" step="1" value="${s.energy}" aria-label="Energy: calmer to more energy"><em>More energy</em></span></label>
    <label class="mp-sl mp-vol"><span class="mp-sk">Volume</span><span class="mp-ends"><em></em><input type="range" id="mp-vol" min="0" max="100" step="1" value="${s.vol}" aria-label="Volume"><em></em></span></label>
    <label class="mp-lamp"><input type="checkbox" id="mp-lamp"${s.lamp ? ' checked' : ''}><span><b>The Lamp</b><small>A pool of light on the question you’re writing. Each answer you finish plays a chord and lights a candle.</small></span></label>
    <div class="mp-modes" role="group" aria-label="Modes">
      ${Object.entries(MODES).map(([k, v]) => `<button type="button" class="mp-mode" data-mp-mode="${k}" aria-pressed="${s.mode === k}"><b>${esc(v.n)}</b><small>${esc(v.d)}</small></button>`).join('')}
    </div>
    <p class="mp-fine">Played live in your browser. It pauses when you leave this tab.</p>
  </div>`;
}

let mounted = false, open = false;
function paintPlayer() {
  const root = document.getElementById('mp');
  if (!root) return;
  const focusIn = root.contains(document.activeElement) ? document.activeElement.id || document.activeElement.dataset.mp || document.activeElement.dataset.mpMode : '';
  root.classList.toggle('playing', isOn());
  root.hidden = !here;
  root.innerHTML = playerHTML(S, isOn(), open);
  if (focusIn) { const f = root.querySelector(`#${CSS.escape(focusIn)}, [data-mp="${focusIn}"], [data-mp-mode="${focusIn}"]`); if (f) f.focus({ preventScroll: true }); }
}
function mount() {
  if (mounted || typeof document === 'undefined') return;
  mounted = true;
  const root = document.createElement('div');
  root.id = 'mp'; root.className = 'mp'; root.hidden = true;
  document.body.appendChild(root);
  onChange(paintPlayer);
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.mp === 'open') { open = !open; paintPlayer(); if (open) { const p = root.querySelector('.mp-play'); if (p) p.focus({ preventScroll: true }); } return; }
    if (b.dataset.mp === 'close') { open = false; paintPlayer(); const p = root.querySelector('.mp-pill'); if (p) p.focus({ preventScroll: true }); return; }
    if (b.dataset.mp === 'play') { toggle(); return; }
    if (b.dataset.mpMode) { mode(b.dataset.mpMode); return; }
  });
  // Sliders change the sound and light as they move, and redraw only on release.
  root.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'mp-light') { S.light = +t.value; keep(); dim(); }
    else if (t.id === 'mp-energy') { S.energy = +t.value; keep(); if (E) E.setEnergy(S.energy / 100); }
    else if (t.id === 'mp-vol') { S.vol = +t.value; keep(); if (E) E.setVol(S.vol / 100); }
  });
  root.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'mp-track') set({ track: t.value });
    else if (t.id === 'mp-lamp') set({ lamp: t.checked });
    else if (/^mp-(light|energy|vol)$/.test(t.id)) tell();
  });
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { open = false; paintPlayer(); const p = root.querySelector('.mp-pill'); if (p) p.focus(); } });
  // The Lamp follows the question being written.
  document.addEventListener('focusin', (e) => { const f = e.target.closest && e.target.closest('textarea, input.wcell'); if (f) { target = f.closest('.step') || f; reAim(); } });
  window.addEventListener('scroll', reAim, { passive: true });
  window.addEventListener('resize', reAim);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (isOn()) { resume = true; pause(); } } else if (here && resume) { resume = false; play(); }
  });
  // The first click on the dashboard starts the music, if the founder allows it.
  const first = (e) => {
    if (!here || e.target.closest('#mp, [data-cab="play"], #cab-auto, .mp-ask')) return;
    if (get('cab-music') !== 'off' && !userPaused && !isOn()) play();
    document.removeEventListener('pointerdown', first); document.removeEventListener('keydown', first);
  };
  document.addEventListener('pointerdown', first); document.addEventListener('keydown', first);
}
let resume = false;

/* ── The invitation ──────────────────────────────────────────────────────── */
const ASK_KEY = 'es-focus-ask', ASK_AFTER = 120;
let seconds = 0, clock = null;
const today = () => new Date().toISOString().slice(0, 10);
/** Whether the two-minute invitation may still show today. */
export function mayAsk(now = today()) { return get(ASK_KEY) !== now && S.mode !== 'focus'; }
function ask() {
  if (!here || isOn() || !mayAsk() || document.getElementById('mp-ask')) return;
  put(ASK_KEY, today());
  const d = document.createElement('div');
  d.id = 'mp-ask'; d.className = 'mp-ask'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-labelledby', 'mp-ask-h');
  d.innerHTML = `<span class="mp-disc big">${DISC}</span>
    <div><p class="mp-k">Two minutes in</p><p class="mp-ask-h" id="mp-ask-h">Start the music here, dim the light and turn on Focus mode.</p>
    <div class="mp-ask-b"><button type="button" class="mp-yes" data-ask="yes">Turn on Focus mode</button><button type="button" class="mp-no" data-ask="no">Not now</button></div></div>`;
  document.body.appendChild(d);
  const close = () => { d.remove(); };
  d.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.ask === 'yes') mode('focus');
    close();
  });
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const y = d.querySelector('.mp-yes'); if (y) y.focus({ preventScroll: true });
}
function startClock() {
  if (clock || typeof window === 'undefined') return;
  clock = setInterval(() => {
    if (!here || document.hidden) return;
    seconds++;
    if (seconds >= ASK_AFTER) { clearInterval(clock); clock = null; ask(); }
  }, 1000);
}

/* ── Entering and leaving the dashboard ──────────────────────────────────── */
/** The founder is on a dashboard view (Your Ground Plan, Library, Ask). */
export function enter() {
  mount();
  here = true;
  if (resume) { resume = false; play(); }
  dim(); paintPlayer(); startClock();
}
/** The founder left the dashboard (the programme): music fades, light lifts. */
export function leave() {
  here = false;
  if (isOn()) { resume = true; pause(); }
  open = false;
  dim(); paintPlayer();
  const a = document.getElementById('mp-ask'); if (a) a.remove();
}
