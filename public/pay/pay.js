// /pay/?step=session|lab|hub|premium (Alexandru, 2 Nov 2026): one step, its
// price, what opens and the sessions that come with it, and one button to
// Stripe's own payment page. Back from Stripe (?cs=…), the page asks the site,
// which asks Stripe; the step opens only when Stripe says "paid"
// (functions/_stripe.js; AGENTS.md rule 6: never claim a payment we have not
// seen). Icons tell before the words do (rule 13); the words carry the meaning.

import { token } from '/account.js';
import { CONSENT, utm, detailFields, readDetails } from '/forms.js';
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
 *  ?from=… (/northstar/summit/ → summit, /road5/ → road5, exploraself.com →
 *  exploraself, since 3 Nov 2026); anything else is
 *  /road1/'s, as before. */
const FROM = { summit: 'summit', road5: 'road5', exploraself: 'exploraself' };
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

/** A one-off product from exploraself.com (3 Nov 2026): no levels, no step.
 *  Stripe brings the buyer straight back to it on exploraself.com. */
const PITCH = { unshakeable: 'The full Personal Leadership Audit, with your results and a printable certificate, on exploraself.com.' };
function productCard(S, step, test) {
  return `<p class="eb">${ICON.open}From exploraself.com</p>
    <h1>${esc(S.name)}</h1>
    ${PITCH[step] ? `<p class="pitch">${esc(PITCH[step])}</p>` : ''}
    <p class="price">${esc(S.price)}<small>one payment</small></p>
    ${test ? '<p class="test"><b>Test mode.</b> No real money moves. On Stripe’s page use the card 4242 4242 4242 4242, any future date and any three numbers.</p>' : ''}
    <button class="go" type="button" id="go" data-step="${esc(step)}">${ICON.lock}Pay ${esc(S.price)} securely</button>
    <ul class="trust">
      <li>${ICON.lock}Paid on Stripe’s own secure page</li>
      <li>${ICON.invoice}An invoice comes with every payment</li>
      <li>${ICON.refund}Ask for a refund from your Base Camp</li>
    </ul>
    <p class="note">After paying, you complete your account here (a minute), and it opens at once. We also email you your own access link, so it opens on any device.</p>
    <p class="err" id="err" role="alert" hidden></p>`;
}

/** Pay first, then the account (Alexandru, 3 Nov 2026: "name or email,
 *  payment, boom, let's go. And then account."). Not signed in: a first name
 *  and an email above the button; Stripe fills the email in on its page; the
 *  account is made when Stripe says paid, and the password comes after. */
function guestForm() {
  return `<div class="gf">
      <label for="g-first">Your first name</label>
      <input id="g-first" type="text" autocomplete="given-name" maxlength="60" required>
      <label for="g-email">Your email</label>
      <input id="g-email" type="email" autocomplete="email" inputmode="email" maxlength="200" required>
      <p class="gf-why">Your receipt and your Base Camp go to this address.</p>
      <label class="gf-yes"><input id="g-consent" type="checkbox"> <span>${esc(CONSENT)}</span></label>
    </div>`;
}
const signinLink = () => `<a class="ghost gf-in" href="/ground-plan/?next=${encodeURIComponent(location.pathname + location.search)}#signin">Already have an account? Sign in</a>`;

// The eye and copy icons of the password boxes (the same as public/account-box.js).
const PW_EYE = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const PW_COPY = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

/** The button that opens what was bought: a product's own page (with its
 *  access), or the first level the step opened. */
const OPEN_LABEL = { unshakeable: 'Open my Unshakeable Audit' };
const openOf = (d, S) => d.access
  ? { href: d.access, label: OPEN_LABEL[d.step] || `Open ${S.name || 'it'}` }
  : { href: `/ground-plan/#programme-${d.first || S.first || 4}`, label: 'Open my Base Camp' };

/** The full account right after payment (Alexandru, 6 Nov 2026: "After
 *  payment: full account"; for the Unshakeable Assessment: "first name and
 *  email or Google, then payment, then full account, then immediate access").
 *  What the account still lacks (d.missing: password, company or "No company
 *  yet", what they want most, industry), with their name and email already
 *  there; one button saves it (api/complete.js) and opens what they bought.
 *  A new founder (back from Stripe with the token this payment made) and a
 *  signed-in founder whose account is not full yet see the same form. On a
 *  phone the password shows as it is typed (Alexandru, 3 Nov 2026). */
function finishAccount(d, S) {
  if (d.token) { try { localStorage.setItem('ftb-token', d.token); } catch { /* private mode */ } }
  const need = Array.isArray(d.missing) ? d.missing : ['company', 'interest', 'industry', 'password'];
  const O = openOf(d, S);
  if (!need.length) return paidDone(d, S);
  const pw = need.includes('password');
  const shown = matchMedia('(max-width: 600px)').matches;
  // The same password boxes as every other full account form (public/account-box.js
  // pwInput; Alexandru, 6 Nov 2026: "the same style … copy button when asking to
  // confirm the password"): each box has its eye and its copy beside it.
  const pwBox = (id) => `<span class="pw-row"><input id="${id}" type="${shown ? 'text' : 'password'}" autocomplete="new-password" autocapitalize="off" spellcheck="false" minlength="10" maxlength="200" required><button type="button" class="pw-ic" data-eye="${id}" aria-pressed="${shown}" aria-label="${shown ? 'Hide password' : 'Show password'}">${PW_EYE}</button><button type="button" class="pw-ic" data-copy="${id}" aria-label="Copy password">${PW_COPY}</button></span>`;
  draw(`<p class="eb">${ICON.check}Thank you</p><h1>${esc(S.name || 'Your step')} is yours</h1>
    <p class="ok">Your payment went through. One last step: complete your account, and ${d.access ? 'it opens at once' : 'your Base Camp opens'}.</p>
    <form class="card gf" id="fin" novalidate>
      <p class="gf-who"><b>${esc(d.name || '')}</b>${esc(d.email || '')}</p>
      ${detailFields('f', 'display:grid;gap:6px', need)}
      ${pw ? `<label for="f-pw">Password</label>${pwBox('f-pw')}
      <label for="f-pw2">Confirm password</label>${pwBox('f-pw2')}
      <p class="gf-why">At least 10 characters. You sign in with your email and this password.</p>` : ''}
      <button class="go" type="submit">${ICON.open}${esc(O.label)}</button>
      <p class="err" id="err" role="alert" hidden></p>
    </form>`);
  const nc = $('#f-nocompany'), co = $('#f-company');
  if (nc && co) nc.onchange = () => { co.disabled = nc.checked; if (nc.checked) co.value = ''; };
  // The eye shows or hides what was typed; copy keeps the password, to paste
  // into the second box or somewhere safe (as in public/account-box.js).
  for (const btn of document.querySelectorAll('#fin [data-eye]')) btn.onclick = () => {
    const f = $('#' + btn.dataset.eye), on = f.type === 'password';
    f.type = on ? 'text' : 'password';
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Hide password' : 'Show password');
  };
  for (const btn of document.querySelectorAll('#fin [data-copy]')) btn.onclick = async () => {
    const f = $('#' + btn.dataset.copy); if (!f || !f.value) return;
    let ok = true; try { await navigator.clipboard.writeText(f.value); } catch { ok = false; }
    btn.textContent = ok ? '✓' : '—'; setTimeout(() => { btn.innerHTML = PW_COPY; }, 1400);
  };
  $('#fin').onsubmit = async (e) => {
    e.preventDefault();
    const err = $('#err'), b = e.currentTarget.querySelector('.go');
    const say = (m) => { err.textContent = m; err.hidden = false; b.disabled = false; };
    err.hidden = true;
    const det = readDetails('f', need);
    if (det.problem) return say(det.problem);
    if (pw && $('#f-pw').value.length < 10) return say('At least 10 characters, please.');
    if (pw && $('#f-pw').value !== $('#f-pw2').value) return say('The two passwords are not the same.');
    const body = { token: d.token || token(), full: true };
    if (need.includes('company')) Object.assign(body, { company: det.company, noCompany: det.noCompany });
    if (need.includes('interest')) body.interest = det.interest;
    if (need.includes('industry')) body.industry = det.industry;
    if (pw) Object.assign(body, { password: $('#f-pw').value, confirm: $('#f-pw2').value });
    b.disabled = true;
    try {
      const r = await fetch('/api/complete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const x = await r.json().catch(() => ({}));
      if (x.ok) { location.href = O.href; return; }
      say(x.error || 'That did not work. Try again.');
    } catch { say('We could not reach the site. Check your connection and try again.'); }
  };
}

/** Paid, and the account is full: what opened, and the way in. */
function paidDone(d, S) {
  const O = openOf(d, S);
  try { history.replaceState(null, '', `/pay/?step=${encodeURIComponent(d.step || '')}&paid=1`); } catch { /* old browser */ }
  return draw(`<p class="eb">${ICON.check}Thank you</p><h1>${esc(S.name || 'Your step')} is ${d.access ? 'yours' : 'open'}</h1>
    <p class="ok">Your payment went through. ${d.access ? 'We have emailed you your own access link too, so it opens on any device.' : 'We have emailed you what opened and how to book your session.'}</p>
    <a class="go" href="${esc(O.href)}">${ICON.open}${esc(O.label)}</a>
    <a class="ghost" href="/ground-plan/#home">My Base Camp</a>`);
}

/** From exploraself.com's "Get access" window (6 Nov 2026): the first name,
 *  email and yes it took come in the address's #part (never sent to a
 *  server), fill the form here and go straight on to Stripe. */
function fromWindow() {
  const h = new URLSearchParams(String(location.hash || '').replace(/^#/, ''));
  const first = (h.get('first') || '').trim().slice(0, 60), email = (h.get('email') || '').trim().slice(0, 200);
  if (!first && !email) return null;
  try { history.replaceState(null, '', location.pathname + location.search); } catch { /* old browser */ }
  return { first, email, yes: h.get('yes') === '1' };
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
  const guest = !info.signedIn;
  // "Already bought? Sign in" (exploraself.com, 6 Nov 2026): signed in, it
  // opens what this account bought; not signed in, the sign-in comes first.
  if (q.get('open') && S.product) {
    if (guest) { location.replace(`/ground-plan/?next=${encodeURIComponent(`/pay/?step=${step}&open=1`)}#signin`); return; }
    if (info.owned && info.owned[step]) { location.replace(info.owned[step]); return; }
  }
  if (!guest && !S.product && ORDER.indexOf(step) <= ORDER.indexOf(info.tier || 'free')) {
    return draw(`<p class="eb">${ICON.check}Already yours</p><h1>${esc(S.name)} is open for you</h1>
      <p class="muted">Nothing to pay. It is waiting in your Base Camp.</p>
      <a class="go" href="/ground-plan/#programme-${S.first}">Open Level ${pad(S.first)}</a>`);
  }
  let html = S.product ? productCard(S, step, info.test) : card(S, step, info.test, info.tier || 'free');
  if (guest) html = html.replace('<button class="go"', () => guestForm() + '<button class="go"') + signinLink();
  const none = q.get('open') && S.product && !guest
    ? `<p class="err">We found no payment for ${esc(S.name)} on ${esc(info.email || 'this account')}. If you paid with another email, sign in with that one, or open the link in your “It’s yours” email.</p>` : '';
  draw((q.get('cancelled') ? '<p class="err">No payment was made. When you are ready, it is one tap away.</p>' : '') + none + html);
  $('#go').onclick = async (e) => {
    const b = e.currentTarget, err = $('#err');
    b.disabled = true; err.hidden = true;
    try {
      const body = { step };
      if (guest) {
        Object.assign(body, { first: $('#g-first').value.trim(), email: $('#g-email').value.trim(), consent: $('#g-consent').checked, landing, utm: utm() });
        if (!body.first) { err.textContent = 'Your first name, please.'; err.hidden = false; b.disabled = false; $('#g-first').focus(); return; }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) { err.textContent = 'That email does not look complete.'; err.hidden = false; b.disabled = false; $('#g-email').focus(); return; }
      }
      const r = await fetch('/api/checkout', { method: 'POST', headers: H(), body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (d.ok && d.url) { location.href = d.url; return; }
      // Already theirs: no second payment, the way in instead.
      if (d.signin) {
        err.innerHTML = `${esc(d.error)} <a href="/ground-plan/?next=${encodeURIComponent('/ground-plan/#home')}#signin">Sign in to my Base Camp →</a>`;
        err.hidden = false; b.disabled = false; return;
      }
      err.textContent = d.error || 'Stripe did not answer. Try again in a minute.';
    } catch { err.textContent = 'We could not reach Stripe. Check your connection and try again.'; }
    err.hidden = false; b.disabled = false;
  };
  const w = guest ? fromWindow() : null;
  if (w) {
    $('#g-first').value = w.first; $('#g-email').value = w.email; $('#g-consent').checked = w.yes;
    if (w.first && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(w.email)) $('#go').click();
  }
}

/** Back from Stripe: ask until Stripe says paid (a few seconds at most). */
async function confirm(cs, steps) {
  draw('<div class="wait"><span class="spin" aria-hidden="true"></span><p>Checking your payment with Stripe…</p></div>');
  for (let i = 0; i < 8; i++) {
    let d = null;
    try { d = await (await fetch(`/api/checkout?cs=${encodeURIComponent(cs)}`, { headers: H() })).json(); } catch { d = null; }
    if (d && d.paid && d.fresh && d.token) return finishAccount(d, steps[d.step] || {});
    if (d && d.paid && d.existing) {
      const S = steps[d.step] || {};
      // A product opens from its link at once; the account is theirs to sign in to.
      if (d.access) {
        return draw(`<p class="eb">${ICON.check}Thank you</p><h1>${esc(S.name || 'It')} is yours</h1>
          <p class="ok">Your payment went through. It is on your account (${esc(d.email || '')}), and we have emailed you your own access link too.</p>
          <a class="go" href="${esc(d.access)}">${ICON.open}${esc(OPEN_LABEL[d.step] || 'Open it')}</a>
          <a class="ghost" href="/ground-plan/?next=${encodeURIComponent('/ground-plan/#home')}#signin">Sign in to my Base Camp</a>`);
      }
      return draw(`<p class="eb">${ICON.check}Thank you</p><h1>${esc(S.name || 'Your step')} is open</h1>
        <p class="ok">Your payment went through. It is open on your account (${esc(d.email || '')}). Sign in and it is waiting for you.</p>
        <a class="go" href="/ground-plan/?next=${encodeURIComponent('/ground-plan/#programme-' + (d.first || 4))}#signin">Sign in to my Base Camp</a>`);
    }
    // Signed in: the account made full here if it is not yet, then the way in.
    if (d && d.paid) return finishAccount(d, steps[d.step] || {});
    if (d && d.error && !/reach|Stripe said/i.test(d.error)) return draw(`<h1>We could not check this payment</h1><p class="err">${esc(d.error)}</p><a class="ghost" href="/ground-plan/#home">Back to my Base Camp</a>`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  draw(`<h1>Almost there</h1><p class="muted">Stripe has not confirmed the payment yet. It usually takes a few seconds. The step opens on its own when it does, and we email you. If you were charged and nothing opens within the hour, reply to any of our emails and Alexandru and the team will sort it out.</p>
    <a class="ghost" href="/ground-plan/#home">Back to my Base Camp</a>`);
}

start();
