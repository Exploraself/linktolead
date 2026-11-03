/* /12-days/: "Take care of your neighbor" (Alexandru, 3 Nov 2026). A signed-in
 * founder sends one friend one invitation to the 12 days, one field at a time
 * as on every ExploraSelf form: their first name, their email, a line from
 * you (optional), then a look at the letter and Send. The site sends it
 * (POST /api/course, action "invite"; functions/_course.js inviteLetter).
 * "Sent" shows only when the server says the email service took it.
 * Not signed in: the free account first (public/tools/gate.js), so the friend
 * knows the invitation is really from them. */
import * as G from '/tools/gate.js';
import * as A from '/account.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } };
const NOTE_MAX = 200; // INVITE_NOTE_MAX in functions/_course.js (a test holds them equal)
const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
/** A house with a heart in it: the neighbor, looked after. */
export const HOUSE = svg('<path d="M3.5 11 12 4l8.5 7v8.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1Z"/><path d="M12 17.6s-3.3-1.9-3.3-4.1a1.8 1.8 0 0 1 3.3-1 1.8 1.8 0 0 1 3.3 1c0 2.2-3.3 4.1-3.3 4.1Z" fill="currentColor" stroke="none"/>');
const PERSON = svg('<circle cx="12" cy="8.2" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.8 7-5.8s6.2 2.2 7 5.8"/>');
const MAIL = svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>');
const PEN = svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>');
const SEND = svg('<path d="M21 3.5 10.5 14"/><path d="M21 3.5 14.5 20.5l-4-6.5-6.5-4z"/>');

const host = document.getElementById('nbbody');
const v = { first: '', email: '', note: '' };
let me = null, step = 'intro', busy = false, note = '', left = 3;

const first = () => (me && String(me.name || '').trim().split(/\s+/)[0]) || '';
const friend = () => v.first || 'your friend';

/** The four screens, and the closing one. */
const Q = {
  first: { q: 'Who is your neighbor?', hint: 'Their first name. The letter starts with it.', ic: PERSON, type: 'text', ac: 'off', max: 60, n: 1 },
  email: { q: () => `Where does ${friend()} read email?`, hint: 'One letter from Alexandru, with a button to start. No list, nothing after it.', ic: MAIL, type: 'email', ac: 'off', max: 200, n: 2 },
  note: { q: () => `A line from you to ${friend()}?`, hint: () => `Optional. ${friend()} sees your name and email, so they know it is you. Words only, no links.`, ic: PEN, type: 'note', max: NOTE_MAX, n: 3 },
};
const ORDER = ['first', 'email', 'note', 'look'];

function intro() {
  return `<p class="nb-lede">Know someone who would love these mornings? Send them one personal invitation from you. They start only if they want to.</p>
    <div class="okrow"><button type="button" class="btn gold" data-n="begin">Invite a friend <span aria-hidden="true">→</span></button></div>`;
}

function look() {
  const who = first() || 'You';
  return `<div class="nb-mail" aria-label="The letter ${esc(friend())} gets">
      <p class="nb-k">To</p><p>${esc(v.first)} · ${esc(v.email)}</p>
      <p class="nb-k">Subject</p><p><b>${esc(who)} thought of you: 12 Days to Start Winning</b></p>
      <p class="nb-k">Inside</p><p>${esc(who)} (${esc(me && me.email || '')}) thought of you and asked me to send you this.${v.note ? ` A note from ${esc(who)}: “${esc(v.note)}”` : ''} Then what the 12 days are, and a button: <b>Start my 12 days</b>. Signed by Alexandru.</p>
    </div>`;
}

function draw(focus = true) {
  if (step === 'intro') { host.innerHTML = intro(); return; }
  if (step === 'done') {
    host.innerHTML = `<div class="scr${RM.matches ? '' : ' enter'}"><div class="qic nb-qic" aria-hidden="true">${HOUSE}</div>
      <h3 class="qh" id="nb-q" tabindex="-1">Sent. Your invitation is on its way to ${esc(v.first)}.</h3>
      <p class="hint">Thank you for taking care of your neighbor. If ${esc(v.first)} taps Start, their first letter comes at once.</p>
      ${left > 0 ? '<div class="okrow"><button type="button" class="btn" data-n="again">Invite another friend <span aria-hidden="true">→</span></button></div>' : '<p class="fine">That is three today, the most for one day. More tomorrow.</p>'}</div>`;
    if (focus) host.querySelector('#nb-q').focus?.();
    return;
  }
  const d = Q[step] || {}, at = ORDER.indexOf(step) + 1;
  const q = step === 'look' ? `Ready to send to ${v.first}?` : typeof d.q === 'function' ? d.q() : d.q;
  const hint = step === 'look' ? 'This is what lands in their inbox.' : typeof d.hint === 'function' ? d.hint() : d.hint;
  let ctl = '';
  if (d.type === 'text' || d.type === 'email') {
    ctl = `<input class="txt" id="nb-in" type="${d.type}" autocomplete="${d.ac}" maxlength="${d.max}" value="${esc(v[step])}" ${d.type === 'email' ? 'inputmode="email" autocapitalize="off" spellcheck="false"' : 'autocapitalize="words"'} aria-labelledby="nb-q" aria-describedby="nb-h">`;
  } else if (d.type === 'note') {
    ctl = `<textarea class="txt nb-note" id="nb-in" rows="3" maxlength="${d.max}" placeholder="This made me think of you." aria-labelledby="nb-q" aria-describedby="nb-h">${esc(v.note)}</textarea>
      <div class="nb-count" aria-live="polite"><span id="nb-left">${NOTE_MAX - v.note.length}</span> characters left</div>`;
  } else ctl = look();
  const label = step === 'look' ? (busy ? 'Sending…' : 'Send the invitation <span aria-hidden="true">→</span>') : step === 'note' ? (v.note ? 'OK <span aria-hidden="true">✓</span>' : 'Skip <span aria-hidden="true">→</span>') : 'OK <span aria-hidden="true">✓</span>';
  host.innerHTML = `<div class="scr${RM.matches ? '' : ' enter'}">
    <div class="qtop"><button type="button" class="back" data-n="back">← Back</button><span class="count">Your invitation · ${at} of ${ORDER.length}</span></div>
    <div class="qic nb-qic" aria-hidden="true">${step === 'look' ? SEND : d.ic}</div>
    <h3 class="qh" id="nb-q">${esc(q)}</h3>
    <p class="hint" id="nb-h">${esc(hint)}</p>
    <div class="ctl">${ctl}<div class="okrow"><button type="button" class="btn${step === 'look' ? ' big gold' : ''}" data-n="ok" ${busy ? 'disabled' : ''}>${label}</button>${step === 'look' ? '' : '<span class="kbd">or press Enter ↵</span>'}</div>
      <p class="nudge" role="status">${esc(note)}</p></div>
  </div>`;
  note = '';
  if (focus) { const el = host.querySelector('#nb-in') || host.querySelector('[data-n="ok"]'); if (el) { try { el.focus({ preventScroll: true }); } catch { el.focus(); } } }
}
const say = (m) => { note = m; const n = host.querySelector('.nudge'); if (n) n.textContent = m; };

async function send() {
  busy = true; draw(false);
  try {
    const r = await fetch('/api/course', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: A.token(), action: 'invite', first: v.first, email: v.email, note: v.note, tz: tz() }) });
    const d = await r.json().catch(() => ({}));
    busy = false;
    if (!r.ok || !d.sent) { draw(false); return say(d.error || 'The invitation did not go out. Try again in a minute.'); }
    left = typeof d.left === 'number' ? d.left : left - 1;
    step = 'done'; draw();
  } catch {
    busy = false; draw(false); say('We could not reach the letters just now. Try again in a minute.');
  }
}

function next() {
  const inp = host.querySelector('#nb-in');
  if (inp) v[step] = inp.value.trim();
  if (step === 'first' && !v.first) return say('Their first name, please.');
  if (step === 'email') {
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v.email)) return say(v.email ? 'That email does not look complete. Check the part after the @.' : 'Their email, please.');
    if (me && v.email.toLowerCase() === String(me.email || '').toLowerCase()) return say('That is your own address. Who is the neighbor? :)');
  }
  if (step === 'note' && /https?:|www\.|@/i.test(v.note)) return say('Leave links and addresses out of the note, please. The letter has the button.');
  if (step === 'look') return send();
  step = ORDER[ORDER.indexOf(step) + 1]; draw();
}

async function begin() {
  const st = await G.state();
  if (st.kind === 'full') { me = st.me; step = 'first'; return draw(); }
  if (st.kind === 'offline') { host.innerHTML = intro(); return say2('We could not reach your account just now. Try again in a minute.'); }
  // The free account first: the invitation carries your name and email.
  host.innerHTML = '<p class="nb-lede">First, your free account, so your friend knows the invitation is really from you.</p><div id="nbgate"></div>';
  G.open(host.querySelector('#nbgate'), { name: 'the invitation', path: '/12-days/', st, needAccount: true,
    ready: (who) => { me = who; step = 'first'; draw(); },
    cancel: () => { step = 'intro'; draw(); } });
}
const say2 = (m) => { const p = document.createElement('p'); p.className = 'nudge'; p.setAttribute('role', 'status'); p.textContent = m; host.appendChild(p); };

host.addEventListener('click', (e) => {
  const b = e.target.closest('[data-n]'); if (!b || busy) return;
  const k = b.dataset.n;
  if (k === 'begin') return begin();
  if (k === 'ok') return next();
  if (k === 'again') { v.first = ''; v.email = ''; v.note = ''; step = 'first'; return draw(); }
  if (k === 'back') { const at = ORDER.indexOf(step); step = at > 0 ? ORDER[at - 1] : 'intro'; return draw(); }
});
host.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'nb-in' && !busy) { e.preventDefault(); next(); }
});
host.addEventListener('input', (e) => {
  if (e.target.id !== 'nb-in' || step !== 'note') return;
  v.note = e.target.value;
  const n = host.querySelector('#nb-left'); if (n) n.textContent = String(NOTE_MAX - v.note.length);
  const ok = host.querySelector('[data-n="ok"]'); if (ok) ok.innerHTML = v.note.trim() ? 'OK <span aria-hidden="true">✓</span>' : 'Skip <span aria-hidden="true">→</span>';
});

draw();
