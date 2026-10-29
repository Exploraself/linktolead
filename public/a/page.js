// "/a", sales page A (the 12 Scrolls design): the twelve levels for the stage
// picked in the tabs (names from content.js), the ladder's bars, the bar for
// founders who are already signed in, and every "Join" opening the simple
// account form (landing "a").
import { weekTitle, loadStage } from '../content.js';
import { rememberUtm } from '../forms.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const signedIn = () => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } };

/** Which band a level sits in: open the day you join (01–03), with
 *  Alexandru (04–05), the LAB and HUB (06–11), and the closing level. */
export const band = (n) => (n <= 3 ? 'free' : n <= 5 ? 'with' : n === 12 ? 'last' : '');

/** The twelve levels of one stage, as list items. */
export function levelsHTML(stage) {
  return Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    return `<li class="${band(n)}"><b>${String(n).padStart(2, '0')}</b><p>${esc(weekTitle(stage, n))}</p></li>`;
  }).join('');
}

function showStage(stage) {
  document.querySelectorAll('[role="tab"][data-stage]').forEach((t) => {
    const on = t.dataset.stage === stage;
    t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
  });
  const list = $('#levels');
  list.setAttribute('aria-labelledby', 'tab-' + stage);
  list.innerHTML = levelsHTML(stage);
  // Names not in the short list come from the stage's own file.
  loadStage(stage).then(() => { if ($('#tab-' + stage).getAttribute('aria-selected') === 'true') list.innerHTML = levelsHTML(stage); }).catch(() => {});
}

if (typeof document !== 'undefined' && $('#levels')) {
  rememberUtm();
  showStage('build');
  const tabs = [...document.querySelectorAll('[role="tab"][data-stage]')];
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => showStage(t.dataset.stage));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus(); showStage(next.dataset.stage);
    });
  });

  // The ladder: twelve bars a row, the ones that step opens in gold.
  document.querySelectorAll('#ladder .bars').forEach((b) => {
    const on = Number(b.dataset.on) || 0;
    b.innerHTML = Array.from({ length: 12 }, (_, i) => `<i${i < on ? ' class="on"' : ''}></i>`).join('');
  });

  // Already signed in on this device: a slim bar back to the Ground Plan.
  if (signedIn()) $('#backbar').hidden = false;

  // Every "Join" opens the simple form; /#join opens it straight away.
  const gate = $('#gate');
  let box = null;
  const loadBox = () => box || (box = import('/compass/welcome/account-box.js').catch(() => { box = null; }));
  const join = (e) => {
    const opener = e && e.currentTarget;
    gate.hidden = false;
    loadBox().then((m) => m && m.open({ gate, opener, stage: null, variant: 'simple', landing: 'a' }));
  };
  document.querySelectorAll('[data-join]').forEach((b) => b.addEventListener('click', join));
  if (location.hash === '#join') join();
}
