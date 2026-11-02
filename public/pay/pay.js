// /pay/?step=session|lab|hub|premium (Alexandru, 2 Nov 2026): one step, its
// price, what opens and the sessions that come with it, and one button to
// Stripe's own payment page. Back from Stripe (?cs=…), the page asks the site,
// which asks Stripe; the step opens only when Stripe says "paid"
// (functions/_stripe.js; AGENTS.md rule 6: never claim a payment we have not
// seen). Icons tell before the words do (rule 13); the words carry the meaning.

import { token } from '/account.js';
import { LEVELS4 } from '/levels-v4.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
const ICON = {
  open: svg('<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.8"/>'),
  levels: svg('<path d="M4 19h4v-4h4v-4h4V7h4"/>'),
  people: svg('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5c.6-3.3 2.8-5.2 5.5-5.2s4.9 1.9 5.5 5.2"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.6c1.6.8 2.6 2.4 3 4.9"/>'),
  lock: svg('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7"/>'),
  check: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>'),
  invoice: svg('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 11h7M9 14.5h7M9 18h4"/>'),
  refund: svg('<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/>'),
};
/** What a step is, in one line, and the highest level it opens (Alexandru,
 *  2 Nov 2026: "make it salable and professional"). The levels listed are
 *  the ones the founder does not have yet, each named in plain words with
 *  its own promise (AGENTS.md rules 3 and 10). Only what the step really
 *  opens (rule 19). */
const SELL = {
  session: { top: 5, pitch: 'One hour with Alexandru, and the next two levels of your Blueprint.',
    with: ['One hour with Alexandru, one to one, online', 'Before you meet, Alexandru and the team read your North Star and your first three levels, so the hour starts on your business, not on introductions. You leave with one road, chosen together.'] },
  lab: { top: 9, pitch: 'Four levels on running the business itself, and your second 1:1 with Alexandru.' },
  hub: { top: 12, also: 'The LAB is included.', pitch: 'Every level up to Level 12, and three 1:1s with Alexandru in all.' },
  premium: { top: 12, also: 'The LAB, the HUB and every resource are included.', pitch: 'All twelve levels, and Alexandru with you every week.',
    with: ['Alexandru with you every week', 'One session for each level: 45 minutes, on Google Meet.'] },
};
/** The highest level each step already has open. */
const HAS = { free: 3, session: 5, lab: 9, hub: 12, premium: 12 };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const ORDER = ['free', 'session', 'lab', 'hub', 'premium'];
const pad = (n) => String(n).padStart(2, '0');
const q = new URLSearchParams(location.search);
const want = q.get('step');
/** Where the founder came from, for the free account's landing (and so its
 *  Mailchimp tag): a sales page that sends to /pay/ names itself with
 *  ?from=… (/northstar/summit/ → summit, /road5/ → road5); anything else is
 *  /road1/'s, as before. */
const FROM = { summit: 'summit', road5: 'road5' };
const landing = FROM[q.get('from')] || 'road1';
const H = () => ({ 'x-account-token': token(), 'content-type': 'application/json' });

function draw(html) { $('#pay').innerHTML = html; }

function card(S, step, test, tier) {
  const X = SELL[step] || {};
  const from = (HAS[tier] ?? 3) + 1, to = X.top || from;
  const lv = LEVELS4.filter((L) => L.n >= from && L.n <= to);
  const full = lv.length <= 4; // a short list carries each level's promise
  const levels = lv.length ? `<ol class="lv${full ? '' : ' short'}">${lv.map((L) => `<li><span class="n">${pad(L.n)}</span><p><b>${esc(L.title)}</b>${full ? `<small>You come out with: ${esc(L.promise.charAt(0).toLowerCase() + L.promise.slice(1))}</small>` : ''}</p></li>`).join('')}</ol>`
    : `<p>${esc(cap(S.opens))}.</p>`;
  const [wh, wt] = X.with || [cap(S.sessions), ''];
  return `<p class="eb">${ICON.open}Unlock your next step</p>
    <h1>${esc(S.name)}</h1>
    ${X.pitch ? `<p class="pitch">${esc(X.pitch)}</p>` : ''}
    <p class="price">${esc(S.price)}<small>one payment</small></p>
    <section class="card">
      <h2>${ICON.people}With it</h2>
      <p class="with"><b>${esc(wh)}</b>${wt ? esc(wt) : ''}</p>
    </section>
    <section class="card">
      <h2>${ICON.levels}What opens${lv.length ? ` · ${lv.length === 1 ? 'one level' : `${lv.length} levels`}` : ''}</h2>
      ${levels}
      ${X.also ? `<p class="also">${esc(X.also)}</p>` : ''}
    </section>
    ${test ? '<p class="test"><b>Test mode.</b> No real money moves. On Stripe’s page use the card 4242 4242 4242 4242, any future date and any three numbers.</p>' : ''}
    <button class="go" type="button" id="go" data-step="${esc(step)}">${ICON.lock}Pay ${esc(S.price)} securely</button>
    <ul class="trust">
      <li>${ICON.lock}Paid on Stripe’s own secure page</li>
      <li>${ICON.invoice}An invoice comes with every payment</li>
      <li>${ICON.refund}Ask for a refund from your Base Camp</li>
    </ul>
    <p class="note">Your step opens the moment the payment goes through, and we email you what opened and how to book your session. Buying for your business? Tick “I’m purchasing as a business” on Stripe’s page to add the business name and VAT number.</p>
    <p class="err" id="err" role="alert" hidden></p>`;
}

/** Not signed in (Alexandru, 2 Nov 2026): the free account is made right
 *  here, with the same form as /road1/ (landing "road1"), and the founder
 *  comes straight back to this page, signed in, to pay. Never sent away. */
function makeAccount(S) {
  const back = location.pathname + location.search;
  draw(`<p class="eb">${ICON.open}Unlock your next step</p><h1>${esc(S.name)} · ${esc(S.price)}</h1>
    <p>First, your free account. It takes a minute, and then you come straight back here to pay.</p>
    <button class="go" type="button" id="make">Make my free account</button>
    <a class="ghost" href="/ground-plan/?next=${encodeURIComponent(back)}#signin">Already have an account? Sign in</a>`);
  let gate = document.getElementById('gate');
  if (!gate) { gate = document.createElement('div'); gate.id = 'gate'; gate.hidden = true; document.body.appendChild(gate); }
  const open = () => import('/account-box.js').then((m) => m.open({ gate, opener: $('#make'), stage: null, variant: 'full', landing, next: back,
    head: ['ONE STEP BEFORE YOU PAY', 'Your free account', `Then you come straight back here to unlock ${S.name}. You sign in with your email and a password.`],
    label: 'CONTINUE TO PAYMENT →', notNow: 'Not now' })).catch(() => { location.href = `/road1/?next=${encodeURIComponent(back)}#join`; });
  $('#make').onclick = open;
  open();
}

async function start() {
  let info;
  try { info = await (await fetch('/api/checkout', { headers: H() })).json(); } catch { info = null; }
  if (!info || !info.ok) return draw('<h1>We could not reach the payment page</h1><p class="muted">Try again in a minute. If it keeps happening, reply to any of our emails and Alexandru and the team will help.</p>');
  const steps = info.steps || {};
  // Back from Stripe.
  const cs = q.get('cs');
  if (cs) return confirm(cs, steps);
  // No step, or an unknown one: the next step above theirs.
  const step = steps[want] ? want : ORDER.find((k) => steps[k] && ORDER.indexOf(k) > ORDER.indexOf(info.tier || 'free')) || 'session';
  const S = steps[step];
  if (!info.on) {
    return draw(`<p class="eb">${ICON.open}Unlock your next step</p><h1>${esc(S.name)}</h1><p class="price">${esc(S.price)}</p>
      <p class="muted">Payments open here very soon. Until then, reply to any of our emails and Alexandru and the team will open it for you.</p>
      <a class="ghost" href="/ground-plan/#home">Back to my Base Camp</a>`);
  }
  if (!info.signedIn) return makeAccount(S);
  if (ORDER.indexOf(step) <= ORDER.indexOf(info.tier || 'free')) {
    return draw(`<p class="eb">${ICON.check}Already yours</p><h1>${esc(S.name)} is open for you</h1>
      <p class="muted">Nothing to pay. It is waiting in your Base Camp.</p>
      <a class="go" href="/ground-plan/#programme-${S.first}">Open Level ${pad(S.first)}</a>`);
  }
  draw((q.get('cancelled') ? '<p class="err">No payment was made. When you are ready, it is one tap away.</p>' : '') + card(S, step, info.test, info.tier || 'free'));
  $('#go').onclick = async (e) => {
    const b = e.currentTarget, err = $('#err');
    b.disabled = true; err.hidden = true;
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: H(), body: JSON.stringify({ step }) });
      const d = await r.json().catch(() => ({}));
      if (d.ok && d.url) { location.href = d.url; return; }
      err.textContent = d.error || 'Stripe did not answer. Try again in a minute.';
    } catch { err.textContent = 'We could not reach Stripe. Check your connection and try again.'; }
    err.hidden = false; b.disabled = false;
  };
}

/** Back from Stripe: ask until Stripe says paid (a few seconds at most). */
async function confirm(cs, steps) {
  draw('<div class="wait"><span class="spin" aria-hidden="true"></span><p>Checking your payment with Stripe…</p></div>');
  for (let i = 0; i < 8; i++) {
    let d = null;
    try { d = await (await fetch(`/api/checkout?cs=${encodeURIComponent(cs)}`, { headers: H() })).json(); } catch { d = null; }
    if (d && d.paid) {
      const S = steps[d.step] || {};
      try { history.replaceState(null, '', `/pay/?step=${encodeURIComponent(d.step || '')}&paid=1`); } catch { /* old browser */ }
      return draw(`<p class="eb">${ICON.check}Thank you</p><h1>${esc(S.name || 'Your step')} is open</h1>
        <p class="ok">Your payment went through. We have emailed you what opened and how to book your session.</p>
        <a class="go" href="/ground-plan/#programme-${d.first || S.first || 4}">Open Level ${pad(d.first || S.first || 4)}</a>
        <a class="ghost" href="/ground-plan/#home">My Base Camp</a>`);
    }
    if (d && d.error && !/reach|Stripe said/i.test(d.error)) return draw(`<h1>We could not check this payment</h1><p class="err">${esc(d.error)}</p><a class="ghost" href="/ground-plan/#home">Back to my Base Camp</a>`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  draw(`<h1>Almost there</h1><p class="muted">Stripe has not confirmed the payment yet. It usually takes a few seconds. The step opens on its own when it does, and we email you. If you were charged and nothing opens within the hour, reply to any of our emails and Alexandru and the team will sort it out.</p>
    <a class="ghost" href="/ground-plan/#home">Back to my Base Camp</a>`);
}

start();
