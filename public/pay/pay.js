// /pay/?step=session|lab|hub|premium (Alexandru, 2 Nov 2026): one step, its
// price, what opens and the sessions that come with it, and one button to
// Stripe's own payment page. Back from Stripe (?cs=…), the page asks the site,
// which asks Stripe; the step opens only when Stripe says "paid"
// (functions/_stripe.js; AGENTS.md rule 6: never claim a payment we have not
// seen). Icons tell before the words do (rule 13); the words carry the meaning.

import { token } from '/account.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
const ICON = {
  open: svg('<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.8"/>'),
  levels: svg('<path d="M4 19h4v-4h4v-4h4V7h4"/>'),
  people: svg('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5c.6-3.3 2.8-5.2 5.5-5.2s4.9 1.9 5.5 5.2"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.6c1.6.8 2.6 2.4 3 4.9"/>'),
  lock: svg('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7"/>'),
  check: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>'),
};
const ORDER = ['free', 'session', 'lab', 'hub', 'premium'];
const pad = (n) => String(n).padStart(2, '0');
const q = new URLSearchParams(location.search);
const want = q.get('step');
const H = () => ({ 'x-account-token': token(), 'content-type': 'application/json' });

function draw(html) { $('#pay').innerHTML = html; }

function card(S, step, test) {
  return `<p class="eb">${ICON.open}Unlock your next step</p>
    <h1>${esc(S.name)}</h1>
    <p class="price">${esc(S.price)}<small>one payment</small></p>
    <div class="card">
      <div class="row">${ICON.levels}<p><b>What opens</b>${esc(S.opens.charAt(0).toUpperCase() + S.opens.slice(1))}.</p></div>
      <div class="row">${ICON.people}<p><b>With it</b>${esc(S.sessions.charAt(0).toUpperCase() + S.sessions.slice(1))}.</p></div>
    </div>
    ${test ? '<p class="test"><b>Test mode.</b> No real money moves. On Stripe’s page use the card 4242 4242 4242 4242, any future date and any three numbers.</p>' : ''}
    <button class="go" type="button" id="go" data-step="${esc(step)}">${ICON.lock}Pay ${esc(S.price)} securely</button>
    <p class="note">You pay on Stripe’s own secure page. Your step opens the moment the payment goes through, and we email you what opened and how to book your session.</p>
    <p class="err" id="err" role="alert" hidden></p>`;
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
  if (!info.signedIn) {
    return draw(`<p class="eb">${ICON.open}Unlock your next step</p><h1>${esc(S.name)} · ${esc(S.price)}</h1>
      <p>First, sign in to your free account, so we open the step in the right place. Then tap Unlock again.</p>
      <a class="go" href="/ground-plan/#signin">Sign in</a>
      <a class="ghost" href="/road1/">No account yet? Make your free account</a>`);
  }
  if (ORDER.indexOf(step) <= ORDER.indexOf(info.tier || 'free')) {
    return draw(`<p class="eb">${ICON.check}Already yours</p><h1>${esc(S.name)} is open for you</h1>
      <p class="muted">Nothing to pay. It is waiting in your Base Camp.</p>
      <a class="go" href="/ground-plan/#programme-${S.first}">Open Level ${pad(S.first)}</a>`);
  }
  draw((q.get('cancelled') ? '<p class="err">No payment was made. When you are ready, it is one tap away.</p>' : '') + card(S, step, info.test));
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
        <a class="go" href="/ground-plan/#programme-${S.first || 4}">Open Level ${pad(S.first || 4)}</a>
        <a class="ghost" href="/ground-plan/#home">My Base Camp</a>`);
    }
    if (d && d.error && !/reach|Stripe said/i.test(d.error)) return draw(`<h1>We could not check this payment</h1><p class="err">${esc(d.error)}</p><a class="ghost" href="/ground-plan/#home">Back to my Base Camp</a>`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  draw(`<h1>Almost there</h1><p class="muted">Stripe has not confirmed the payment yet. It usually takes a few seconds. The step opens on its own when it does, and we email you. If you were charged and nothing opens within the hour, reply to any of our emails and Alexandru and the team will sort it out.</p>
    <a class="ghost" href="/ground-plan/#home">Back to my Base Camp</a>`);
}

start();
