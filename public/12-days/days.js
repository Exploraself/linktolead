/* /12-days/: start "12 Days to Start Winning" with a full free account
 * (public/tools/gate.js), see which day you are on, or stop the letters.
 * The letters themselves are sent by the site (functions/_course.js). */
import { byKey, coverHTML } from '/tools/catalog.js';
import * as G from '/tools/gate.js';
import * as A from '/account.js';

/** The twelve subjects, as the letters carry them (functions/_course-letters.js;
 *  a test holds them equal). */
export const DAYS12 = ['What is the money for?', 'Needed is not the same as reliable', 'Praise is not a purchase', '“Only me” is a question',
  'What does “finished” mean?', 'The talk you keep rehearsing', 'Why the work comes back to you', 'Profit on paper, less in the bank',
  'What breaks when you forget?', 'Bigger, or enough?', 'Ask before you answer', 'Look back, honestly'];

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (id) => document.getElementById(id);
const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } };
const cover = byKey('12-days');
$('cover').innerHTML = coverHTML(cover);
$('days').innerHTML = DAYS12.map((s, i) => `<li><b>Day ${i + 1}</b>${esc(s)}</li>`).join('');

let me = null, sub = null;
const go = $('go'), state = $('state');

function paint() {
  if (!sub) { go.hidden = false; go.innerHTML = 'Start my 12 days <span aria-hidden="true">→</span>'; state.textContent = ''; return; }
  if (sub.stopped) {
    go.hidden = false; go.innerHTML = 'Start my letters again <span aria-hidden="true">→</span>';
    state.innerHTML = `Your letters are stopped${sub.day > 0 ? ` after day ${Math.min(sub.day, 12)}` : ''}. Starting again carries on from there.`;
    return;
  }
  go.hidden = true;
  const where = sub.day >= 13 ? 'All 12 days are done. Thank you for walking them.' : sub.day >= 1 ? `You are on day ${sub.day} of 12. The next letter comes tomorrow from 8:00, your time.` : `You’re in. Your welcome letter goes to ${esc(me && me.email || 'your email')} now, and Day 1 comes tomorrow from 8:00, your time. Nothing within the hour? Check your spam folder.`;
  state.innerHTML = `${where}${sub.day < 13 ? ' <button type="button" class="linkbtn" id="stop">Stop the letters</button>' : ''}`;
}

async function call(action) {
  const r = await fetch('/api/course', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: A.token(), action, tz: tz() }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'That did not go through.');
  return d;
}

async function begin(who) {
  me = who || me;
  $('panel').hidden = true;
  go.disabled = true;
  try { sub = (await call('start')).sub; paint(); }
  catch (ex) { state.textContent = ex.message || 'We could not reach the letters just now. Try again in a minute.'; }
  go.disabled = false;
}

go.addEventListener('click', async () => {
  const st = await G.state();
  if (st.kind === 'full') return begin(st.me);
  if (st.kind === 'offline') { state.textContent = 'We could not reach your account just now. Try again in a minute.'; return; }
  const panel = $('panel'); panel.hidden = false;
  G.open($('gate'), { name: '12 Days to Start Winning', path: '/12-days/', st, ready: begin, cancel: () => { panel.hidden = true; go.focus(); } });
  panel.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});
state.addEventListener('click', async (e) => {
  if (!e.target.closest('#stop')) return;
  try { sub = (await call('stop')).sub; paint(); } catch (ex) { state.textContent = ex.message; }
});

if (A.joined()) {
  G.state().then((s) => { if (s.me) me = s.me; });
  fetch(`/api/course?t=${encodeURIComponent(A.token())}`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && d.ok) { sub = d.sub; paint(); } }).catch(() => {});
}
import('/profile-menu.js').then((m) => m.mount($('pmhost'), { guest: true })).catch(() => {});
