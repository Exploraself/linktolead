// The two booking pages (Alexandru, 2 Nov 2026): "like a Google Form but
// without Google", one question per screen.
//
//   /book/discovery/  a free 30-minute discovery call, for anyone
//   /book/boardroom/  the 60-minute 1:1, for founders who hold The Boardroom
//
// The questions and the times come from ./slots.js (the server checks the
// same rules again in functions/_booking.js). The answers stay on this device
// until Send (AGENTS.md rule 8); Send posts them once to /api/book, and the
// page says "sent" only when the server says so (rule 6).

import { FORMS, CHOICES, RULES, KINDS, GIFTS, NAME_MAX, PHONE_MAX, phoneOf, codeFor, slotsFor, byDay, oneTime, myZone, cityOf, giftHref } from './slots.js';
import * as A from '/account.js';

const root = document.querySelector('[data-book]');
const KIND = root.dataset.book === 'boardroom' ? 'boardroom' : 'discovery';
const KEY = `ftb-book-${KIND}`;
const TZ = myZone();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const words = (list, key) => (CHOICES[list].find(([k]) => k === key) || [])[1] || '';

// ── Icons (rule 13): drawn in the text colour, hidden from screen readers ──
const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  call: I('<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>'),
  table: I('<rect x="6" y="9" width="12" height="7" rx="1"/><circle cx="3.5" cy="12.5" r="1.5"/><circle cx="20.5" cy="12.5" r="1.5"/>'),
  clock: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  person: I('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5"/>'),
  mail: I('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  lock: I('<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
  meet: I('<rect x="3" y="6.5" width="12" height="11" rx="2"/><path d="m15 10.5 6-3.5v10l-6-3.5"/>'),
  note: I('<path d="M6 3.5h9l3 3V20.5H6z"/><path d="M9 10h6M9 13.5h6M9 17h4"/>'),
  gift: I('<rect x="3.5" y="8.5" width="17" height="4.5" rx="1"/><path d="M5 13v7.5h14V13M12 8.5v12"/><path d="M12 8.5C10.4 4.8 6.4 4.3 6.4 6.8c0 1.7 3.2 1.7 5.6 1.7Zm0 0c1.6-3.7 5.6-4.2 5.6-1.7 0 1.7-3.2 1.7-5.6 1.7Z"/>'),
  star: I('<path d="M12 2.8 21.2 12 12 21.2 2.8 12Z"/><path d="m12 7 1.5 3.5L17 12l-3.5 1.5L12 17l-1.5-3.5L7 12l3.5-1.5Z"/>'),
  hourglass: I('<path d="M7 3.5h10M7 20.5h10"/><path d="M8 3.5c0 4.5 8 5 8 8.5s-8 4-8 8.5M16 3.5c0 4.5-8 5-8 8.5s8 4 8 8.5"/>'),
  people: I('<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.9-3.2 3.1-4.6 5.5-4.6s4.6 1.4 5.5 4.6"/><circle cx="17" cy="9.5" r="2.4"/><path d="M15.8 14.6c2.2.1 3.9 1.4 4.7 4.4"/>'),
  rise: I('<path d="M3.5 19.5 9 13l4 3.5 7.5-9"/><path d="M15 7.5h5.5V13"/>'),
  pulse: I('<path d="M3 12.5h4l2-5 4 10 2.5-5H21"/>'),
  shield: I('<path d="M12 3.5 19 6v5.5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
  whatsapp: I('<path d="M4.2 19.8l1.1-3.9A8.3 8.3 0 1 1 8.3 18.8z"/><path d="M9.3 8.6c-.4 2.5 2.6 5.8 5.3 5.6l.9-1.3-1.7-.9-.8.8c-1-.5-1.8-1.3-2.2-2.3l.7-.8-.8-1.8z"/>'),
};

// ── Where to go next (Alexandru, 2 Nov 2026: "something sweet" after the
// form, never a dry "back to exploraself.com"). The free tests, with the
// words, counts and minutes their own pages use (exploraself
// src/data/assessments.ts; the North Star's own page). Discovery picks by the
// first struggle, the 1:1 by the side costing most; the North Star is always
// offered (again, with its date, when it was taken).
const EXP = 'https://exploraself.com';
const PICKS = {
  northstar: { href: '/northstar/', icon: 'star', name: 'The Leader’s North Star', q: 'Where do you stand on all four sides: yourself, your people, your business and the market?', meta: 'Free · 8 questions · about ten minutes', get: 'Feedback on all four sides, and your road from here.' },
  twoweek: { href: `${EXP}/two-week-test`, icon: 'hourglass', name: 'The Two-Week Test', q: 'If you stepped away for two weeks, what would break first?', meta: 'Free · 20 questions · about 6 minutes', get: 'What breaks first, and a 7-day handover plan.' },
  first100: { href: `${EXP}/first-100-clients`, icon: 'people', name: 'First 100 Perfect Clients', q: 'What is really standing between you and your first 100 perfect clients?', meta: 'Free · 16 questions · about 6 minutes', get: 'The gap costing you clients, a 7-day plan and the free e-book.' },
  unbound: { href: `${EXP}/unbound`, icon: 'table', name: 'The Inner Boardroom', q: 'Who really makes the decisions inside your head?', meta: 'Free · 16 questions · about 5 minutes', get: 'Which voice rules your decisions, a 7-day plan and the free e-book.' },
  rise: { href: `${EXP}/rise`, icon: 'rise', name: 'Allow Yourself to Rise', q: 'Which of your five forces is the lid on your potential?', meta: 'Free · 15 questions · about 4 minutes', get: 'The force holding you down, a 7-day plan and the free e-book.' },
  eq: { href: `${EXP}/eq`, icon: 'pulse', name: 'The EQ Dividend', q: 'Is your emotional intelligence paying you back, or leaking?', meta: 'Free · 20 questions · about 5 minutes', get: 'The dividend that is leaking, a 7-day plan and the free e-book.' },
};
const BY_STRUGGLE = { clients: 'first100', price: 'first100', time: 'twoweek', direction: 'northstar', cash: 'northstar', team: 'rise', switch: 'eq', alone: 'unbound' };
const BY_SIDE = { self: 'rise', people: 'eq', work: 'twoweek', market: 'first100' };
const pickHref = (id) => `${PICKS[id].href}?utm_source=linktolead&utm_medium=booking&utm_campaign=${KIND}&utm_content=${id}`;

// ── The welcome (Alexandru, 2 Nov 2026: "no hello, no nothing, not good …
// premium service, make them feel cared for and important"). His own words
// only: the Level 04 welcome (public/levels-v4.js), as on /boardroom/.
const HELLO = {
  discovery: {
    eb: 'A free call with Alexandru · 30 minutes', face: 'Your call is with Alexandru Cojocari',
    lede: 'Thank you for taking this step. These thirty minutes are yours: where you are, what weighs on you, and what you want next. Free, online, one to one.',
    quote: 'For a decade and a half I have built teams, developed leaders and helped each person grow into the best version of themselves.',
    steps: [['note', 'Four short questions', 'Where you are, two struggles, two goals, and anything else. Mostly taps. Then your name, email and phone, for your gift.'],
      ['clock', 'A time that suits you', 'One is enough. Tuesday to Thursday afternoons, shown in your own time; add up to two more if you like.'],
      ['meet', 'Alexandru confirms it', 'Within 24 hours, by email, with the Google Meet link. Your answers reach Alexandru before the call.']],
    go: 'Let’s begin',
    under: 'Private. Your answers stay on this device until you press Send.',
  },
  boardroom: {
    eb: 'Your 1:1 with Alexandru · 60 minutes', face: 'Your hour is with Alexandru Cojocari',
    lede: 'You hold The Boardroom, and one hour one to one with Alexandru comes with it. A few questions first, so the whole hour is spent on you, not on catching up.',
    quote: 'The person who decides calmly, asks plainly and keeps their word is not someone else. It is you, a few weeks of practice from here.',
    steps: [['note', 'Twenty questions, in six parts', 'Where you are, the four sides of your business, and the hour itself. Most take one sentence. Then your phone, for your gift.'],
      ['clock', 'A time that suits you', 'One is enough. Tuesday to Thursday afternoons, shown in your own time; add up to two more if you like.'],
      ['meet', 'Alexandru confirms it', 'Within 24 hours, by email, with the Google Meet link. Your answers reach Alexandru before the hour.']],
    go: 'Let’s prepare my hour',
    under: 'Take your time. It saves on this device as you go, and you can change any answer before you send.',
  },
};
const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || '';

// ── State, kept on this device ─────────────────────────────────────────────
let S = { answers: {}, name: '', email: '', phone: '', times: [], step: 0 };
try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && typeof saved === 'object') S = { ...S, ...saved, step: 0 }; } catch { /* private mode */ }
const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode */ } };
const forget = () => { try { localStorage.removeItem(KEY); } catch { /* private mode */ } };
/** Where they came from in Base Camp (?back=/ground-plan/#programme-4): the
 *  way out goes back there, to the exact place they were studying
 *  (Alexandru, 3 Nov 2026). Only Base Camp addresses are kept. */
const BACK = (() => { const b = new URLSearchParams(location.search).get('back') || ''; return /^\/ground-plan\/[\w#\-./?=&]*$/.test(b) ? b : ''; })();
const backLabel = () => (/#programme-\d+/.test(BACK) ? '← Back to my level' : '← Back to my Base Camp');

let me = null; // the signed-in founder, if any
let starAt = ''; // when they last took The Leader’s North Star, if they did
let STEPS = [];
let slots = [];
let busy = false;
let waTo = ''; // the business WhatsApp number (digits), when it is set in /mentor

/** The screens, in order: the welcome, the form's questions, then
 *  (discovery) name and email, then the phone (both), the time (one, or up
 *  to three), then check and send. */
function buildSteps() {
  STEPS = [{ id: 'hello', kind: 'hello' }, ...FORMS[KIND].map((f) => ({ id: f.k, kind: 'q', f }))];
  if (KIND === 'discovery') STEPS.push({ id: 'name', kind: 'name' }, { id: 'email', kind: 'email' });
  STEPS.push({ id: 'phone', kind: 'phone' }, { id: 'times', kind: 'times' }, { id: 'check', kind: 'check' });
}

// ── Drawing ─────────────────────────────────────────────────────────────────
function top() {
  const n = STEPS.length - 1, i = S.step, st = STEPS[i];
  if (st.kind === 'hello') return '';
  const label = st.kind === 'check' ? 'Check and send' : `${st.kind === 'q' && st.f.part ? `${esc(st.f.part)} · ` : ''}${i} of ${n - 1}`;
  return `<div class="top"><div class="pbar" aria-hidden="true"><i style="width:${Math.round((i / n) * 100)}%"></i></div>
    <div class="row"><button type="button" class="back" data-back>← Back</button><span class="where">${label}</span><span></span></div></div>`;
}
const eyebrow = (part = '') => (KIND === 'boardroom'
  ? `<p class="eb">${ICON.table}Your 1:1 with Alexandru${part ? ` · ${esc(part)}` : ' · 60 minutes'}</p>`
  : `<p class="eb">${ICON.call}A free call with Alexandru · 30 minutes</p>`);
const goBtn = (label = 'Next', dis = false) => `<div class="act"><button type="button" class="go" data-next ${dis ? 'disabled' : ''}>${esc(label)} ${ICON.arrow}</button><span class="key">or press Enter ↵</span></div>`;

function screen() {
  const st = STEPS[S.step];
  if (st.kind === 'hello') return hello();
  if (st.kind === 'q') return question(st.f);
  if (st.kind === 'name') return `<section class="q">${eyebrow()}<h1 tabindex="-1">${me ? 'Your name, as Alexandru should say it' : 'Your name'}</h1>
    <label class="vh" for="f-name">Your name</label><input id="f-name" class="field" data-field="name" autocomplete="name" maxlength="${NAME_MAX}" value="${esc(S.name)}">
    ${goBtn('Next', !S.name.trim())}</section>`;
  if (st.kind === 'email') return `<section class="q">${eyebrow()}<h1 tabindex="-1">Your email</h1>
    <p class="hint">Alexandru writes back here to confirm a time.</p>
    <label class="vh" for="f-email">Your email</label><input id="f-email" class="field" data-field="email" type="email" inputmode="email" autocomplete="email" maxlength="200" value="${esc(S.email)}">
    ${goBtn('Next', !looksLikeEmail(S.email))}</section>`;
  if (st.kind === 'phone') return phoneScreen();
  if (st.kind === 'times') return timesScreen();
  return checkScreen();
}
/** The first screen: who they will talk to, how it works, one button. */
function hello() {
  const H = HELLO[KIND];
  const name = firstName(me ? me.name : S.name);
  const started = Object.keys(S.answers).length > 0 || S.times.length > 0;
  const steps = H.steps.map(([ic, b, p], i) => `<li><span class="n" aria-hidden="true">${ICON[ic]}</span><div><b>${i + 1}. ${esc(b)}</b><p>${esc(p)}</p></div></li>`).join('');
  return `<section class="hello">
    <figure class="face"><img src="/cabinet/alexandru.jpg" alt="Alexandru Cojocari" width="640" height="512" decoding="async"><figcaption><b>${esc(H.face)}</b><span>Founder, ExploraSelf · online, from Rome</span></figcaption></figure>
    <p class="eb">${KIND === 'boardroom' ? ICON.table : ICON.call}${esc(H.eb)}</p>
    <h1 tabindex="-1" class="serif">${name ? `Hello, ${esc(name)}.` : 'Hello, and welcome.'}${KIND === 'boardroom' ? ' <em>This hour is yours.</em>' : ''}</h1>
    <p class="lede">${esc(H.lede)}</p>
    <blockquote class="word"><p>“${esc(H.quote)}”</p><footer><img src="/mail/signature.png" alt="Alexandru Cojocari" width="190" height="53" loading="lazy"></footer></blockquote>
    <h2 class="how">How it works</h2>
    <ol class="steps">${steps}</ol>
    <div class="act"><button type="button" class="go" data-start>${started ? (KIND === 'boardroom' ? 'Continue my 1:1 booking' : 'Continue my booking') : esc(H.go)} ${ICON.arrow}</button><span class="key">or press Enter ↵</span></div>
    ${started ? '<p class="under"><button type="button" class="linkish" data-restart>Start the booking again</button></p>' : ''}
    <p class="under">${ICON.shield}${esc(H.under)}</p></section>`;
}
const looksLikeEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());

function question(f) {
  const a = S.answers[f.k];
  if (f.type === 'one') {
    const opts = CHOICES[f.of].map(([k, w], i) => `<button type="button" class="slot opt" data-one="${k}" aria-pressed="${a === k}"><b>${esc(w)}</b><small>${i + 1}</small></button>`).join('');
    return `<section class="q">${eyebrow(f.part)}<h1 tabindex="-1">${esc(f.q)}</h1><div class="opts" role="group" aria-label="${esc(f.q)}">${opts}</div>
      <p class="under">${ICON.check}Tap one. It moves on by itself.</p></section>`;
  }
  if (f.type === 'two') {
    const picked = Array.isArray(a) ? a : [];
    const opts = CHOICES[f.of].map(([k, w]) => `<button type="button" class="slot opt" data-two="${k}" aria-pressed="${picked.includes(k)}" ${picked.length >= 2 && !picked.includes(k) ? 'aria-disabled="true"' : ''}><b>${esc(w)}</b></button>`).join('');
    return `<section class="q">${eyebrow(f.part)}<h1 tabindex="-1">${esc(f.q.replace(/ Choose two\.$/, ''))}</h1><p class="hint">Choose two. <b>${picked.length} of 2</b> chosen.</p>
      <div class="opts" role="group" aria-label="${esc(f.q)}">${opts}</div>${goBtn('Next', picked.length !== 2)}</section>`;
  }
  const v = typeof a === 'string' ? a : '';
  return `<section class="q">${eyebrow(f.part)}<h1 tabindex="-1">${esc(f.q)}</h1>${f.optional ? '<p class="hint">If you like. You can also leave it empty.</p>' : ''}
    <label class="vh" for="f-${f.k}">${esc(f.q)}</label><textarea id="f-${f.k}" class="field" data-text="${f.k}" maxlength="${f.max}" rows="4">${esc(v)}</textarea>
    <p class="count" data-count>${v.length} / ${f.max}</p>${goBtn(f.optional && !v.trim() ? 'Skip' : 'Next', !f.optional && !v.trim())}</section>`;
}

/** The gift that comes with the call (Alexandru, 3 Nov 2026: the phone is
 *  asked for because of a gift, "make the experience premium"): its name and
 *  his approved words, the same on this page, the last screen and the email. */
const giftInner = (eb) => `<p class="eb">${ICON.gift}${esc(eb)}</p><h2 class="serif">${esc(GIFTS[KIND].name)}</h2><p>${esc(GIFTS[KIND].line)}</p>`;
const giftCard = () => `<div class="gift">${giftInner(KIND === 'boardroom' ? 'A gift, with your hour' : 'A gift, with your call')}</div>`;
/** Their phone, for both calls (3 Nov 2026): with the country code, started
 *  from their time zone's when the field is empty. It says WhatsApp only when
 *  the business number is set, so the button will be there (rule 6). */
const phoneSay = (v) => (phoneOf(v) ? 'Thank you.' : String(v || '').replace(/[^\d]/g, '').length >= 4 ? 'Start with + and your country code, then your number.' : '');
function phoneScreen() {
  if (!String(S.phone || '').trim()) { const c = codeFor(TZ); S.phone = c === '+' ? '' : c + ' '; }
  return `<section class="q">${eyebrow()}${giftCard()}<h1 tabindex="-1">Your phone number, for your gift</h1>
    <p class="hint">${waTo ? 'Your WhatsApp number, with your country code. After you send, one tap brings your gift to WhatsApp. It is in your email copy too.'
      : `With your country code. Your gift comes in your email copy, and Alexandru can reach you here about this ${KIND === 'boardroom' ? 'hour' : 'call'}.`}</p>
    <label class="vh" for="f-phone">Your phone number, with your country code</label><input id="f-phone" class="field" data-field="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="${PHONE_MAX}" value="${esc(S.phone)}">
    <p class="count" data-phone-say aria-live="polite">${esc(phoneSay(S.phone))}</p>
    ${goBtn('Next', !phoneOf(S.phone))}</section>`;
}

function timesScreen() {
  slots = slotsFor(KIND);
  S.times = S.times.filter((t) => slots.includes(t));
  const days = byDay(slots, TZ).map((d) => `<div class="day"><h2>${esc(d.day)}</h2><div class="slots">${d.slots.map((s) => {
    const on = S.times.includes(s.iso), full = S.times.length >= RULES.pick && !on;
    return `<button type="button" class="slot" data-slot="${s.iso}" aria-pressed="${on}" ${full ? 'aria-disabled="true"' : ''} aria-label="${esc(s.label)}"><b>${esc(s.time)}</b>${s.rome ? `<small>${esc(s.rome)} Rome</small>` : ''}</button>`;
  }).join('')}</div></div>`).join('');
  const n = S.times.length;
  const zone = TZ === RULES.zone ? 'Rome time.' : `Your time (${esc(cityOf(TZ))}), with Rome’s beside it.`;
  return `<section class="q">${eyebrow()}<h1 tabindex="-1">Pick a time that suits you</h1>
    <p class="hint"><b>One is enough.</b> Add one or two more if you like: it helps Alexandru find a time faster.</p>
    <p class="hint">Tuesday to Thursday afternoons · ${KINDS[KIND].minutes} minutes on ${RULES.where} · ${zone} Confirmed within 24 hours.</p>
    <div class="days">${days}</div>
    <div class="dock"><p class="picked">${n ? `${n} picked${n > 1 ? ', thank you' : ''}` : 'Pick a time'}<span>${!n ? 'One is enough.' : n < RULES.pick ? `Ready. You can add ${RULES.pick - n === 1 ? 'one more' : 'up to two more'}, if you like.` : 'Ready. That is the most you can pick.'}</span></p><button type="button" class="go" data-next ${n < RULES.min ? 'disabled' : ''}>Next ${ICON.arrow}</button></div></section>`;
}

function checkScreen() {
  const items = FORMS[KIND].map((f, i) => {
    const a = S.answers[f.k];
    const said = f.type === 'one' ? words(f.of, a) : f.type === 'two' ? (a || []).map((k) => words(f.of, k)).join(' · ') : (a || '—');
    return `<div class="it"><div class="ih">${ICON.note}<b>${esc(f.label)}</b><button type="button" class="chg" data-goto="${i}">Change</button></div><p class="said">${esc(said)}</p></div>`;
  });
  const who = me ? `${esc(me.name || '')} · ${esc(me.email || '')}` : `${esc(S.name)} · ${esc(S.email)}`;
  const whoStep = KIND === 'discovery' ? STEPS.findIndex((s) => s.kind === 'name') : -1;
  items.push(`<div class="it"><div class="ih">${ICON.person}<b>You</b>${whoStep >= 0 ? `<button type="button" class="chg" data-goto="${whoStep}">Change</button>` : ''}</div><p class="said">${who}</p></div>`);
  const phoneStep = STEPS.findIndex((s) => s.kind === 'phone');
  items.push(`<div class="it"><div class="ih">${ICON.call}<b>Your phone</b><button type="button" class="chg" data-goto="${phoneStep}">Change</button></div><p class="said">${esc(String(S.phone || "").trim())}</p></div>`);
  const tl = [...S.times].sort().map((t) => { const o = oneTime(t, TZ); return `<li><span>${esc(o.day)}, <b>${esc(o.time)}</b></span>${o.rome ? `<small>${esc(o.rome)}</small>` : ''}</li>`; }).join('');
  items.push(`<div class="it"><div class="ih">${ICON.clock}<b>${S.times.length === 1 ? 'Your time' : 'Your times'}</b><button type="button" class="chg" data-goto="${STEPS.findIndex((s) => s.kind === 'times')}">Change</button></div><ul class="tl">${tl}</ul></div>`);
  return `<section class="q">${eyebrow()}<h1 tabindex="-1">Check, then send</h1><div class="sum">${items.join('')}</div>
    <p class="note">${ICON.meet}<span>Online, on Google Meet. Alexandru writes back within 24 hours to confirm ${S.times.length > 1 ? 'one of your times' : 'your time'}, with the link to the call.</span></p>
    <div class="hp" aria-hidden="true"><label for="f-hp">Leave this empty</label><input id="f-hp" data-hp tabindex="-1" autocomplete="off"></div>
    <div data-err></div>
    <div class="act"><button type="button" class="go" data-send>${KIND === 'boardroom' ? 'Send my request' : 'Send my request'} ${ICON.arrow}</button></div></section>`;
}

/** Where the founder goes next: one picked for them, the North Star (or
 *  another), then the rest in a quiet list. */
function nextPicks(sent) {
  const a = sent.answers || {};
  if (KIND === 'boardroom') {
    const side = BY_SIDE[a.side];
    return [['northstar', starAt ? 'Read it again before your hour' : 'Start here'],
      side ? [side, `Because you said “${words('side', a.side)}” costs you most`] : ['unbound', 'For the decision you bring']];
  }
  // The North Star is their gift, in its own card above: these are two others.
  const s = Array.isArray(a.struggles) ? a.struggles : [];
  const cards = [];
  s.forEach((k, i) => { const id = BY_STRUGGLE[k]; if (id && id !== 'northstar' && !cards.some(([c]) => c === id)) cards.push([id, i === 0 || !cards.length ? `Picked for you · you chose “${words('struggles', k)}”` : `And for “${words('struggles', k)}”`]); });
  for (const [id, why] of [['twoweek', 'Can it run without you?'], ['first100', 'Where your next clients come from']]) if (cards.length < 2 && !cards.some(([c]) => c === id)) cards.push([id, why]);
  return cards.slice(0, 2);
}

function pickCard([id, why], i) {
  const P = PICKS[id];
  const again = id === 'northstar' && starAt;
  const when = again ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' }).format(new Date(starAt)) : '';
  return `<article class="pick${i === 0 ? ' main' : ''}">
    <p class="why">${esc(why)}</p>
    <div class="ph"><span class="pi" aria-hidden="true">${ICON[P.icon]}</span><div><h3>${again ? 'Your North Star, again' : esc(P.name)}</h3><p class="meta">${again ? `You took it on ${esc(when)} · about ten minutes` : esc(P.meta)}</p></div></div>
    <p class="pq">${again ? 'Take it again and see what has moved since. Both readings stay in your account.' : esc(P.q)}</p>
    ${again ? '' : `<p class="get"><b>You get</b> ${esc(P.get)}</p>`}
    <a class="${i === 0 ? 'go' : 'ghost'}" href="${pickHref(id)}">${again ? 'Open my North Star' : i === 0 ? 'Start it now' : 'Start it'} ${ICON.arrow}</a></article>`;
}

/** "Get my gift on WhatsApp" (Alexandru, 3 Nov 2026: the free way, no
 *  paid service): one tap opens the business WhatsApp with their request and
 *  "Please send me my gift" written in; they send it, and the WhatsApp
 *  Business app's greeting message (or the team's /gift quick reply) answers
 *  with the gift's link. Without the number (set in /mentor → Settings →
 *  Booking links), the card opens the gift here instead. */
function waText(sent) {
  const a = sent.answers || {};
  const t = (sent.iso || []).map((iso) => { const o = oneTime(iso, TZ); return `${o.day}, ${o.time}${o.rome ? ` (${o.rome})` : ''}`; });
  const lines = [KIND === 'boardroom' ? 'Hi Alexandru, I just booked my Boardroom 1:1.' : 'Hi Alexandru, I just asked for a free discovery call.',
    `Please send me my gift: ${GIFTS[KIND].name}.`,
    `${t.length > 1 ? 'My times' : 'My time'}: ${t.join(' · ')}`, `Name: ${sent.name || ''}`, `Email: ${sent.email || ''}`];
  if (KIND === 'discovery' && Array.isArray(a.struggles) && a.struggles.length) lines.push(`What I struggle with: ${a.struggles.map((k) => words('struggles', k)).join(' · ')}`);
  return lines.join('\n');
}
function giftDone(sent, copy) {
  const also = copy ? 'It is in your email copy too.' : '';
  if (sent.waTo) {
    return `<div class="gift done-gift">${giftInner('Your gift')}
    <a class="go wago" href="https://wa.me/${esc(sent.waTo)}?text=${encodeURIComponent(waText(sent))}" target="_blank" rel="noopener">${ICON.whatsapp}Get my gift on WhatsApp</a>
    <p class="tiny">One tap opens WhatsApp with your message written. Send it, and your gift comes back to you there. ${also}</p></div>`;
  }
  return `<div class="gift done-gift">${giftInner('Your gift')}
    <a class="go" href="${giftHref(KIND, 'linktolead')}">Open my gift ${ICON.arrow}</a>${also ? `<p class="tiny">${also}</p>` : ''}</div>`;
}

function doneScreen(email, copy, sent = {}) {
  const one = KIND === 'boardroom';
  const name = firstName(me ? me.name : sent.name);
  const a = sent.answers || {};
  const told = !one && Array.isArray(a.struggles) && a.struggles.length ? a.struggles.map((k) => words('struggles', k)).join(' · ') : '';
  const cards = nextPicks(sent);
  const shown = new Set([...cards.map(([id]) => id), ...(one ? [] : ['northstar'])]);
  const more = Object.keys(PICKS).filter((id) => !shown.has(id)).map((id) => `<li><a href="${pickHref(id)}"><span class="pi" aria-hidden="true">${ICON[PICKS[id].icon]}</span><span><b>${esc(PICKS[id].name)}</b><small>${esc(PICKS[id].meta)}</small></span>${ICON.arrow}</a></li>`).join('');
  return `<section class="q done"><div class="tick">${ICON.check}</div>
    <h1 tabindex="-1" class="serif">Sent. Thank you${name ? `, ${esc(name)}` : ''}.</h1>
    <p class="lede">${one ? 'Your request is with Alexandru, with all twenty of your answers.' : 'Your request is with Alexandru. We look forward to meeting you.'}</p>
    ${giftDone(sent, copy)}
    <div class="wait"><p class="wh">What happens now</p><ol class="tl2">
      <li><span class="dot" aria-hidden="true">${ICON.mail}</span><div><b>Now</b><p>${copy ? `A copy of your request is on its way to <b>${esc(email)}</b>, with your gift.` : 'Keep an eye on your inbox.'}</p></div></li>
      <li><span class="dot" aria-hidden="true">${ICON.clock}</span><div><b>Within 24 hours</b><p>Alexandru confirms ${sent.times > 1 ? 'one of your times' : 'your time'}, by email, with the Google Meet link.</p></div></li>
      <li><span class="dot" aria-hidden="true">${ICON.meet}</span><div><b>${one ? 'Your hour' : 'The call'}</b><p>${one ? '60 minutes, one to one. Your answers reach Alexandru before it, and you bring the decision you named.' : `30 minutes, one to one${told ? `, about what you told us: ${esc(told)}` : ''}.`}</p></div></li>
    </ol></div>
    <div class="gifts"><p class="eb">${ICON.gift}${one ? 'Before your hour' : 'While you wait'}</p>
      <h2 class="serif">${one ? 'Two things that make the hour go further' : 'Two more things, before the call'}</h2>
      <p class="hint">${one ? 'Take one, and bring what you find to the table.' : 'Take one before the call and bring your result: your thirty minutes go further.'}</p>
      <div class="picks">${cards.map(pickCard).join('')}</div>
      <p class="mh">Or another free test</p><ul class="more">${more}</ul>
      <p class="all"><a href="${EXP}/assessments?utm_source=linktolead&utm_medium=booking&utm_campaign=${KIND}">See every assessment</a></p></div>
    <p class="leave">${me ? `<a href="${esc(BACK || '/ground-plan/#home')}">${BACK ? backLabel().slice(2) : 'Back to my Base Camp'}</a>` : `<a href="${EXP}/">Back to exploraself.com</a>`}</p></section>`;
}

/** The calm door for anyone who may not book the 1:1 yet. */
function door(signedIn) {
  root.innerHTML = `<section class="door"><div class="lock">${ICON.lock}</div><p class="eb">${ICON.table}Your 1:1 with Alexandru</p>
    <h1 tabindex="-1">Your 1:1 comes with The Boardroom</h1>
    <p class="lede">The Boardroom opens Levels 04 and 05 and one hour with Alexandru, after Alexandru and the team have read your first three levels.</p>
    <a class="go" href="/boardroom/">See what The Boardroom holds ${ICON.arrow}</a>
    ${signedIn ? '' : `<p class="muted">Already in The Boardroom? <a href="/ground-plan/?next=${encodeURIComponent('/book/boardroom/')}#signin">Sign in</a> and come back here.</p>`}
    <p class="muted">Want a first conversation instead? <a href="/book/discovery/">Book a free discovery call</a>.</p></section>`;
  root.querySelector('h1').focus();
}

function render(focus = true) {
  root.innerHTML = top() + screen();
  if (!focus) return;
  const f = root.querySelector('input.field, textarea.field');
  if (f && matchMedia('(hover:hover) and (pointer:fine)').matches) { f.focus(); try { f.setSelectionRange(f.value.length, f.value.length); } catch { /* email fields have no caret range */ } } else root.querySelector('h1')?.focus();
}
/** The first screen still waiting for an answer (the check screen when all are given). */
function firstOpen() {
  const at = S.step;
  for (let i = 1; i < STEPS.length; i++) { S.step = i; if (STEPS[i].kind === 'check' || !canNext()) { S.step = at; return i; } }
  S.step = at; return STEPS.length - 1;
}
const go = (i) => { S.step = Math.max(0, Math.min(STEPS.length - 1, i)); keep(); render(); window.scrollTo(0, 0); };
const next = () => { if (canNext()) go(S.step + 1); };

function canNext() {
  const st = STEPS[S.step];
  if (st.kind === 'q') {
    const a = S.answers[st.f.k];
    if (st.f.type === 'one') return !!a;
    if (st.f.type === 'two') return Array.isArray(a) && a.length === 2;
    return st.f.optional || !!String(a || '').trim();
  }
  if (st.kind === 'name') return !!S.name.trim();
  if (st.kind === 'email') return looksLikeEmail(S.email);
  if (st.kind === 'phone') return !!phoneOf(S.phone);
  if (st.kind === 'times') return S.times.length >= RULES.min && S.times.length <= RULES.pick;
  return false;
}

// ── Taps, typing and keys ───────────────────────────────────────────────────
root.addEventListener('click', (e) => {
  const t = e.target.closest('button, a');
  if (!t || busy) return;
  if (t.matches('[data-back]')) return go(S.step - 1);
  if (t.matches('[data-start]')) return go(firstOpen());
  if (t.matches('[data-restart]')) { S.answers = {}; S.times = []; keep(); return go(firstOpen()); }
  if (t.matches('[data-next]')) return next();
  if (t.matches('[data-goto]')) return go(Number(t.dataset.goto));
  if (t.matches('[data-send]')) return send();
  const st = STEPS[S.step];
  if (t.dataset.one) {
    S.answers[st.f.k] = t.dataset.one; keep();
    root.querySelectorAll('[data-one]').forEach((b) => b.setAttribute('aria-pressed', String(b === t)));
    setTimeout(() => { if (STEPS[S.step] === st) next(); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280);
    return;
  }
  if (t.dataset.two) {
    const cur = Array.isArray(S.answers[st.f.k]) ? [...S.answers[st.f.k]] : [];
    const k = t.dataset.two;
    if (cur.includes(k)) cur.splice(cur.indexOf(k), 1); else if (cur.length < 2) cur.push(k); else return;
    S.answers[st.f.k] = cur; keep(); render(false);
    root.querySelector(`[data-two="${k}"]`)?.focus();
    return;
  }
  if (t.dataset.slot) {
    const iso = t.dataset.slot;
    if (S.times.includes(iso)) S.times = S.times.filter((x) => x !== iso);
    else if (S.times.length < RULES.pick) S.times = [...S.times, iso];
    else return;
    keep(); const y = window.scrollY; render(false); window.scrollTo(0, y);
    root.querySelector(`[data-slot="${iso}"]`)?.focus();
  }
});
root.addEventListener('input', (e) => {
  const el = e.target, st = STEPS[S.step];
  if (el.dataset.text) {
    S.answers[el.dataset.text] = el.value; keep();
    const c = root.querySelector('[data-count]'); if (c) c.textContent = `${el.value.length} / ${st.f.max}`;
  } else if (el.dataset.field === 'name') S.name = el.value.slice(0, NAME_MAX);
  else if (el.dataset.field === 'email') S.email = el.value.trim();
  else if (el.dataset.field === 'phone') { S.phone = el.value.slice(0, PHONE_MAX); const say = root.querySelector('[data-phone-say]'); if (say) say.textContent = phoneSay(S.phone); }
  else return;
  keep();
  const b = root.querySelector('[data-next]');
  if (b) {
    b.disabled = !canNext();
    if (st.kind === 'q' && st.f.optional) b.firstChild.textContent = String(el.value).trim() ? 'Next ' : 'Skip ';
  }
});
root.addEventListener('keydown', (e) => {
  const st = STEPS[S.step];
  if (!st) return;
  if (st.kind === 'hello' && e.key === 'Enter' && !e.target.matches('a, button')) { e.preventDefault(); go(firstOpen()); return; }
  if (e.key === 'Enter' && !e.shiftKey && (e.target.matches('input.field') || (e.target.matches('textarea') && (e.metaKey || e.ctrlKey)))) { e.preventDefault(); next(); return; }
  if (st.kind === 'q' && st.f.type === 'one' && /^[1-9]$/.test(e.key) && !e.target.matches('input, textarea')) {
    root.querySelectorAll('[data-one]')[Number(e.key) - 1]?.click();
  }
});

// ── Send ────────────────────────────────────────────────────────────────────
async function send() {
  const err = root.querySelector('[data-err]');
  const btn = root.querySelector('[data-send]');
  busy = true; btn.disabled = true; btn.firstChild.textContent = 'Sending… ';
  err.innerHTML = '';
  const body = { kind: KIND, answers: S.answers, times: S.times, tz: TZ, hp: root.querySelector('[data-hp]')?.value || '', token: A.token() || undefined };
  body.phone = phoneOf(S.phone);
  if (KIND === 'discovery') { body.name = S.name.trim(); body.email = S.email.trim(); }
  let d = null;
  try {
    const r = await fetch('/api/book', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    d = await r.json().catch(() => null);
  } catch { d = null; }
  busy = false;
  if (d && d.ok) {
    const sent = { answers: { ...S.answers }, name: me ? me.name : S.name, email: d.email || body.email || (me && me.email) || '', times: S.times.length, iso: [...(d.times || S.times)], waTo: /^\d{7,15}$/.test(String(d.waTo || '')) ? String(d.waTo) : '' };
    forget();
    root.innerHTML = doneScreen(d.email || body.email || (me && me.email) || '', !!d.copy, sent);
    root.querySelector('h1').focus(); window.scrollTo(0, 0);
    return;
  }
  btn.disabled = false; btn.firstChild.textContent = 'Send my request ';
  if (d && d.pay) return door(true);
  const msg = d && d.error ? d.error : 'That did not go through. Check your connection and try again, or write to support@exploraself.com.';
  err.innerHTML = `<p class="err" role="alert">${esc(msg)}${d && d.signin ? ` <a href="/ground-plan/?next=${encodeURIComponent(location.pathname)}#signin">Sign in</a>` : ''}</p>`;
}

// ── Start ───────────────────────────────────────────────────────────────────
(async () => {
  root.innerHTML = '<p class="muted loading">Opening your booking…</p>';
  // The way out goes back to where they were (see BACK).
  if (BACK) document.querySelectorAll('a.home, a.brand').forEach((a) => { a.href = BACK; if (a.classList.contains('home')) a.textContent = backLabel(); });
  const [st, wa] = await Promise.all([A.joined() ? A.pull() : null, fetch('/api/book').then((r) => (r.ok ? r.json() : null)).catch(() => null)]);
  waTo = wa && /^\d{7,15}$/.test(String(wa.waTo || '')) ? String(wa.waTo) : '';
  me = st && st.ok && st.me ? st.me : null;
  const taken = st && st.ok && st.compass && Array.isArray(st.compass.taken) ? st.compass.taken : [];
  starAt = taken.length && !Number.isNaN(Date.parse(taken[taken.length - 1])) ? taken[taken.length - 1] : '';
  if (KIND === 'boardroom') {
    const ORDER = ['free', 'session', 'lab', 'hub', 'premium'];
    const holds = me && (me.openAll || ORDER.indexOf(me.tier || 'free') >= 1);
    if (!holds) return door(!!me);
  }
  if (me && KIND === 'discovery') { if (!S.name) S.name = me.name || ''; if (!S.email) S.email = me.email || ''; }
  if (me && !phoneOf(S.phone) && phoneOf(me.phone)) S.phone = phoneOf(me.phone);
  buildSteps();
  render();
})();
