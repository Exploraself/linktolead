// Base Camp, the first visit after a sales page (1 Nov). What the founder
// found on /road1/, /road3/ or /road4/ (the mirror's part of the business, or
// the hours they counted) was kept on this device by /road-kit.js; here it is
// said back once, in their own numbers, then kept quiet. Nothing is sent and
// nothing is invented: no note when there is nothing of theirs to say back.
import { DOMAINS } from './content.js';

const KEY = 'ftb-arrival';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
const signedIn = () => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The note's words for what was found, or '' when there is nothing to say back. */
export function noteFor(a) {
  if (!a || typeof a !== 'object') return '';
  if (a.landing === 'road4' && a.worst) {
    const d = DOMAINS.find((x) => x.k === a.worst);
    if (!d) return '';
    return a.leaking
      ? `Your mirror said the business leaks most through <b>${esc(d.n)}</b>. Level 01 starts you there: <b>${esc(a.word || 'SEED')}</b>, the ${esc(a.letter || '')} for <b>${esc(a.part || '')}</b>.`
      : 'Your mirror held on all eight questions. Level 01 checks that against your calendar, not your memory.';
  }
  const h = Number(a.extraYear);
  if (Number.isFinite(h) && h > 0) return `You counted <b>${h.toLocaleString('en-US')} hours a year</b> beyond the week you want. Keep that number in sight while you work through level 01.`;
  return '';
}

function show() {
  const a = read();
  if (!a || a.shown || !signedIn() || Date.now() - (a.at || 0) > 14 * 864e5) return;
  const words = noteFor(a);
  if (!words) return;
  try { localStorage.setItem(KEY, JSON.stringify({ ...a, shown: Date.now() })); } catch { /* private mode */ }
  const css = document.createElement('style');
  css.textContent = `.arr{position:fixed;z-index:80;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));width:min(380px,calc(100% - 32px));
background:#1C1309;color:#F3EBDA;border:1px solid #B4975F;border-radius:8px;padding:18px 18px 16px;box-shadow:0 24px 50px -20px rgba(0,0,0,.6);font:15px/1.55 Inter,system-ui,Arial,sans-serif;animation:arrIn .5s ease both}
.arr small{display:block;font:700 11px/1.4 Inter,system-ui,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#D6BF8F;margin-bottom:6px}
.arr p{margin:0}.arr b{color:#E3C47E;font-weight:600}
.arr button{margin-top:12px;min-height:40px;padding:0 16px;border:0;border-radius:3px;background:#B4975F;color:#14100B;font:700 14px/1 Inter,system-ui,Arial,sans-serif;cursor:pointer}
.arr button:focus-visible{outline:2px solid #F3EBDA;outline-offset:2px}
@keyframes arrIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.arr{animation:none}}`;
  document.head.appendChild(css);
  const box = document.createElement('aside');
  box.className = 'arr';
  box.setAttribute('role', 'status');
  box.innerHTML = `<small>From the page you came from</small><p>${words}</p><button type="button">Got it</button>`;
  document.body.appendChild(box);
  box.querySelector('button').addEventListener('click', () => box.remove());
}

if (typeof document !== 'undefined') {
  const go = () => { if (!location.hash || location.hash === '#home') setTimeout(show, 900); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
}
