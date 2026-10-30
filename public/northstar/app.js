/* ExploraSelf Leader’s North Star · v18. One continuous page; the menu scrolls
 * to each section.
 *
 * Everything a founder enters saves to this browser first (localStorage,
 * guarded). With a free account it is also copied to the account
 * (/api/compass), in batches: on a "Got it" tick, at the end of each section
 * and when the page is hidden, never on every tap. "Who is this North Star for?"
 * creates the account; a visitor who already gave their name and email on the
 * sales page gets one without being asked again. Answers given before the
 * account existed are moved into it, never discarded. Older North Star entries
 * (exploraself-compass-v1) are carried over on first load and left in place.
 *
 * The account calls live in /account.js, shared with the programme at /start,
 * loaded here with import() so this stays a plain script. Without it (opened
 * as a file, or offline) the North Star works exactly as before, on this browser.
 *
 * The page is drawn in parts. Each part is rebuilt from the state and only
 * written to the page when its markup changes, so an answer does not redraw
 * the sections around it. The logic lives in engine.js; the questions per
 * stage in model.js. */
'use strict';
(function () {
  const E = window.CompassEngine, M = window.Compass;
  const KEY = 'exploraself-compass-v2', OLD = 'exploraself-compass-v1', DEFAULT_PROFILE = 'exploraself-profile';
  /* The same places /content.js points to: the free 1:1 form, the LAB, the HUB. */
  const BOOKING = 'https://forms.gle/opnxfhFTJJg69Qy77';
  const LAB_URL = 'https://exploraself.com/lab', HUB_URL = 'https://exploraself.com/hub';
  const D = E.DOMAINS, LIGHT = D.map((d) => d.light), CSSV = D.map((d) => `var(--${d.id})`), TINT = D.map((d) => `var(--t${d.id})`);
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lockIcon = (c, s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="${c}" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

  /* ── State ──────────────────────────────────────────────────────────────── */
  const blank = () => ({ v: 2, theme: 'light', profile: { first: '', last: '', email: '', business: '', type: '', industry: '', currency: 'USD', consent: false },
    skipped: false, stage: 'building', goal: '', mode: 'yes', ans: {}, str: {}, pains: [], want: '', nums: {}, group: 0,
    got: {}, more: {}, lean: null, stop: 0, lab: { p: 0, m: 0, f: 0, d: 0, mode: 'time', rate: '', hire: '', plan: '' }, acct: { email: '', state: '' } });
  const read = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };

  /** Keep only what this version knows, in the shapes it expects. */
  function sanitize(raw) {
    const s = blank();
    if (!raw || typeof raw !== 'object') return s;
    const str = (v, n) => String(v ?? '').slice(0, n);
    const p = raw.profile || {};
    for (const k of ['first', 'last', 'email', 'business', 'type', 'industry']) s.profile[k] = str(p[k], 120);
    if (['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(p.currency)) s.profile.currency = p.currency;
    s.profile.consent = p.consent === true;
    s.theme = raw.theme === 'dark' ? 'dark' : 'light';
    s.skipped = raw.skipped === true;
    if (E.STAGES.some((x) => x.id === raw.stage)) s.stage = raw.stage;
    if (E.STAGES.some((x) => x.id === raw.goal)) s.goal = raw.goal;
    if (E.MODES.some((m) => m[0] === raw.mode)) s.mode = raw.mode;
    for (const q of M.Q) if (Number.isInteger(raw.ans?.[q.id]) && raw.ans[q.id] >= 0 && raw.ans[q.id] <= 3) s.ans[q.id] = raw.ans[q.id];
    for (let i = 0; i < 4; i++) { const v = raw.str?.[i]; if (Number.isInteger(v) && v >= 1 && v <= 5) s.str[i] = v; }
    s.pains = (Array.isArray(raw.pains) ? raw.pains : []).filter((x) => E.PAINS.some((p2) => p2[0] === x)).slice(0, 2);
    if (E.GOALS.some((g) => g[0] === raw.want)) s.want = raw.want;
    for (const [k, v] of Object.entries(raw.nums || {})) if (/^(yes|offer|idea)\.\w+$/.test(k) && v && typeof v === 'object') s.nums[k] = { pick: str(v.pick, 8), own: str(v.own, 80) };
    s.group = Number.isInteger(raw.group) && raw.group >= 0 && raw.group <= 4 ? raw.group : 0;
    for (let i = 0; i < 4; i++) { if (raw.got?.[i] === true) s.got[i] = true; if (raw.more?.[i] === true) s.more[i] = true; }
    s.lean = Number.isInteger(raw.lean) && raw.lean >= 0 && raw.lean < 4 ? raw.lean : null;
    s.stop = Number.isInteger(raw.stop) && raw.stop >= 0 && raw.stop < 5 ? raw.stop : 0;
    const lab = raw.lab || {};
    s.lab = { p: clampN(lab.p, 0, 200), m: clampN(lab.m, 0, 100), f: clampN(lab.f, 0, 50), d: clampN(lab.d, 0, 60), mode: lab.mode === 'money' ? 'money' : 'time', rate: str(lab.rate, 12), hire: str(lab.hire, 12), plan: str(lab.plan, 12) };
    // What happened when this browser last tried to make an account for this email.
    if (raw.acct && ['yes', 'existing'].includes(raw.acct.state)) s.acct = { email: str(raw.acct.email, 120), state: raw.acct.state };
    return s;
  }
  function clampN(v, lo, hi) { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : 0; }

  /** Carry a founder's entries over from the North Star before v18. Their old
   *  record stays where it is. */
  function migrate(old) {
    const s = blank();
    const p = old.profile || {};
    s.profile.first = String(p.name || '').slice(0, 60);
    s.profile.business = String(p.business || '').slice(0, 80);
    s.profile.type = p.type === 'small' ? 'Small business with a team' : p.type === 'solo' ? 'Solopreneur (just me)' : '';
    if (['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(p.currency)) s.profile.currency = p.currency;
    s.theme = p.theme === 'dark' ? 'dark' : 'light';
    if (E.STAGES.some((x) => x.id === old.stage)) s.stage = old.stage;
    if (E.STAGES.some((x) => x.id === old.goal)) s.goal = old.goal;
    for (const [k, v] of Object.entries(old.answers || {})) if (Number.isInteger(v)) s.ans[k] = v;
    const map = { revenue: 'sales', variable: 'deliv', fixed: 'run', hours: 'hrs', availableHours: 'want', unpaidHours: 'unpaid',
      cash: 'save', reserveMonths: 'months', cashOut: 'out', newCustomers: 'newc', acquisition: 'acq' };
    for (const [from, to] of Object.entries(map)) {
      const v = old.numbers && old.numbers[from];
      if (v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v))) s.nums['yes.' + to] = { pick: 'own', own: String(v) };
    }
    return sanitize(s);
  }

  let S = (() => {
    const cur = read(KEY);
    if (cur) return sanitize(cur);
    const old = read(OLD);
    return old && old.version === 1 ? migrate(old) : blank();
  })();
  /* Details given on the North Star sales page arrive here, never asked twice. */
  let fromSales = false;
  (() => {
    const pre = read(DEFAULT_PROFILE);
    if (!pre || S.profile.email) return;
    fromSales = !!pre.email;
    for (const k of ['first', 'last', 'email']) if (pre[k]) S.profile[k] = String(pre[k]).slice(0, 120);
    if (pre.consent === true) S.profile.consent = true;
    // The stage finder on the sales page, used only before any answer here.
    if (E.STAGES.some((x) => x.id === pre.stage) && !Object.keys(S.ans).length) S.stage = pre.stage;
  })();

  let stored = true, saveTimer;
  function save() {
    dirty = true;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(S)); stored = true; } catch { stored = false; }
      status();
    }, 150);
  }
  function status() {
    const el = $('#save-status');
    if (el) el.textContent = !stored ? '○ This session only · download a backup' : signedIn() ? '○ Saved to your account' : '○ Saved on this browser';
  }
  const UI = { page: 'overview', gate: false, after: null, how: false, ws: false, saved: false, mail: '', mailReady: false, mailWhy: '', sending: false,
    plans: null, note: '', signin: '', signinBusy: false, fine: false, glow: null, signinOpen: false, pwmsg: '', hasPw: null, signinFor: null };
  const SIGNIN_LINE = 'This email already has an account. Sign in to open your plans.';
  const identified = () => !!S.profile.email;

  /* ── The account ─────────────────────────────────────────────────────────── */
  let A = null, dirty = false, syncing = false, leverTimer;
  const signedIn = () => !!(A && A.joined());
  /** What the account keeps: this whole state (so another device can carry
   *  on), plus the scores and choices the Account Plans are ordered by. */
  function payload() {
    const sc = E.scores(M, S);
    return { stage: S.stage, answers: S,
      results: { scores: sc.map((x) => x.score), answered: sc.map((x) => x.answered), bands: sc.map((x) => (x.answered ? E.BANDS[x.band] : null)) },
      flags: { pains: S.pains, want: S.want, lab: { p: S.lab.p, m: S.lab.m, f: S.lab.f, d: S.lab.d } } };
  }
  /** Send the batch, if there is one. The device copy is already safe, so a
   *  failure only means it goes with the next batch. */
  async function sync(keepalive = false) {
    if (!signedIn() || !dirty || syncing) return;
    dirty = false; syncing = true;
    try { await A.saveCompass(payload(), keepalive); if (!keepalive) refreshPlans(); }
    catch { dirty = true; }
    finally { syncing = false; }
  }
  async function refreshPlans() {
    if (!signedIn()) return;
    const p = await A.plans();
    if (p && p.ok) { UI.plans = p; render(); }
  }
  /** Make the free account for the details in the profile. A new email is an
   *  account at once and this browser's answers go into it. An email that
   *  already has one is never handed its token: unless this is the silent
   *  carry-over, a sign-in link is sent instead. */
  async function createAccount(source, silent) {
    if (!A || signedIn() || !identified()) return signedIn();
    const P = S.profile;
    let out;
    let utm = {};
    try { utm = (await import('/forms.js')).utm(); } catch { /* no tags kept */ }
    try { out = await A.signup({ first: P.first, last: P.last, email: P.email, industry: P.industry, consent: P.consent, source, stage: S.stage, type: 'simple', landing: 'compass', utm }); }
    catch { return false; }
    S.acct = { email: P.email, state: out.token ? 'yes' : out.existing ? 'existing' : '' };
    save();
    if (out.token) { dirty = true; await sync(); status(); render(); return true; }
    if (out.existing && !silent) await askLink(P.email, 'note');
    return false;
  }
  /** Ask for a sign-in link. `where` is the place the reply is said. */
  async function askLink(email, where) {
    const say = (m) => { if (where === 'note') UI.note = m; else UI.signin = m; render(); };
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email || '')) return say('Type your email first, then tap this again.');
    if (!A) return say('Sign-in is not available here. Open linktolead.exploraself.com/northstar.');
    UI.signinBusy = true; render();
    try {
      const r = await A.signinLink(email, 'start', where !== 'note');
      say(where === 'note' ? 'This email already has an account. We have sent a sign-in link to it. Open it on this device and your answers here join your account. Until then they are saved on this browser.' : r.message);
    } catch (e) {
      say(e && e.message && !/fetch|network|load failed/i.test(e.message) ? e.message : 'We could not send a link just now. Try again in a minute.');
    }
    UI.signinBusy = false; render();
  }
  const hasWork = (s) => Object.keys(s.ans).length > 0 || Object.keys(s.str).length > 0 || Object.keys(s.nums).length > 0 || s.pains.length > 0 || !!s.want;
  /** Arriving from a sign-in link: spend the code, then bring the account's
   *  North Star here if this browser has none. If both have answers, this
   *  browser's copy comes first and goes up to the account. */
  async function signInFromLink(code) {
    try { history.replaceState(null, '', location.pathname + location.hash); } catch { /* old browser */ }
    let me;
    try { me = (await A.signinWith(code)).me || {}; }
    catch (e) { toast(e && e.message ? e.message : 'That sign-in link did not work. Ask for a new one.'); return; }
    await afterSignIn(me);
  }
  /* Signed in (by link or password): bring the account's North Star here if this
   * browser has none; otherwise this browser's copy goes up to the account. */
  async function afterSignIn(me) {
    const theirs = await A.loadCompass();
    if (!hasWork(S) && theirs && theirs.answers) {
      const keepTheme = S.theme;
      S = sanitize(theirs.answers); S.theme = keepTheme;
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { stored = false; }
      dirty = false;
    } else dirty = true;
    for (const k of ['first', 'last', 'email', 'industry']) if (!S.profile[k] && me[k]) S.profile[k] = String(me[k]).slice(0, 120);
    S.acct = { email: S.profile.email, state: 'yes' };
    save(); await sync(); status(); render();
    toast('You are signed in. Your North Star is saved to your account.');
  }
  async function pwSignIn(where) {
    const email = (($(where === 'gate' ? '#g-email' : '#ws-signin') || {}).value || '').trim(), pw = ($('#si-pw-' + where) || {}).value || '';
    if (!A) return;
    if (!pw) { UI.signin = 'Type your password, or use “Email me a sign-in link”.'; render(); return; }
    UI.signinBusy = true; render();
    try { const out = await A.login(email, pw); UI.gate = false; UI.signin = ''; UI.signinFor = null; await afterSignIn(out.me || {}); }
    catch (e) { UI.signin = e && e.message && !/fetch|network|load failed/i.test(e.message) ? e.message : 'We could not reach the account service just now.'; }
    UI.signinBusy = false; render();
  }
  async function savePassword() {
    const a = ($('#pw-1') || {}).value || '', c = ($('#pw-2') || {}).value || '';
    const say = (m) => { UI.pwmsg = m; render(); };
    if (a.length < 10) return say('At least 10 characters, please.');
    if (a !== c) return say('The two passwords are different.');
    try { const r = await A.setPassword(a, c); UI.hasPw = true; say(r.changed ? 'Your password is changed.' : 'Your password is set.'); }
    catch (e) { say(e && e.message ? e.message : 'It did not save. Try again in a minute.'); }
  }
  async function boot() {
    try { (await import('/forms.js')).rememberUtm(); } catch { /* old browser */ }
    try { A = await import('/account.js'); } catch { A = null; }
    if (!A) return;
    let code = '';
    try { code = new URLSearchParams(location.search).get('signin') || ''; } catch { /* no location */ }
    if (code) await signInFromLink(code);
    status();
    if (signedIn()) {
      // Signed up on any of our pages: the North Star knows who this is.
      if (!S.profile.email) {
        const r = await A.pull();
        if (r && r.me) {
          const [first, ...rest] = String(r.me.name || '').split(' ');
          Object.assign(S.profile, { first: S.profile.first || first || '', last: S.profile.last || rest.join(' '), email: r.me.email || '' });
          S.acct = { email: S.profile.email, state: 'yes' }; save();
        }
      }
      // Nothing answered on this browser: bring the account's North Star here
      // instead of saving an empty one over it. Answers here: save them.
      if (!hasWork(S)) {
        const theirs = await A.loadCompass();
        if (theirs && theirs.answers) {
          const keepTheme = S.theme, keepProfile = S.profile, keepAcct = S.acct;
          S = sanitize(theirs.answers); S.theme = keepTheme;
          for (const k of ['first', 'last', 'email']) if (!S.profile[k] && keepProfile[k]) S.profile[k] = keepProfile[k];
          S.acct = keepAcct; save();
        }
      } else { dirty = true; await sync(); }
    }
    render();
    if (signedIn()) import('/profile-menu.js').then((m) => m.mount(document.getElementById('top-tools'))).catch(() => {});
    // From outside, with answers already on this browser: the account first.
    if (!signedIn() && !code && hasWork(S)) fullAccount();
  }

  /** A first answer from a visitor without an account opens the full account
   *  form (name, surname, email, company, interest, industry, password). What
   *  they tapped is kept, and comes into the account. */
  function gated(change) {
    change();
    save(); render();
    if (!signedIn()) fullAccount();
  }
  /** The full free account, on this page. Done: the page reloads signed in and
   *  the whole North Star is open. An email that already has an account signs in
   *  right here instead. */
  let box = null;
  function fullAccount() {
    if (signedIn() || !A) return;
    const gate = document.getElementById('acct-gate');
    if (!gate) return;
    const opener = document.activeElement;
    (box || (box = import('/account-box.js'))).then((m) => m.open({ gate, opener, stage: null, variant: 'full', landing: 'compass', stay: true,
      onExisting: (email) => { S.profile.email = email; S.acct = { email, state: 'existing' }; save(); openSignin(); } }))
      .catch(() => { box = null; });
  }
  /** Open the gate, and remember where to put focus back when it closes. */
  function openGate(after) {
    const a = document.activeElement;
    UI.returnF = a && a.dataset ? a.dataset.f : null;
    UI.gate = true; UI.after = after || null;
    setTimeout(() => { const f = $('#g-first'); if (f) f.focus(); }, 0);
  }
  /** The sign-in box for an email that already has an account. */
  function openSignin() {
    UI.signinFor = 'plans'; UI.signin = ''; openGate('account'); render();
    setTimeout(() => { const f = $('#si-pw-gate'); if (f) f.focus(); }, 0);
  }
  function closeGate() {
    UI.gate = false; render();
    const back = UI.returnF && document.querySelector(`[data-f="${UI.returnF}"]`);
    if (back) back.focus({ preventScroll: true });
  }

  /* ── Money and numbers ──────────────────────────────────────────────────── */
  function money(x) {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: S.profile.currency, maximumFractionDigits: 0 }).format(Math.round(x)); }
    catch { return Math.round(x).toLocaleString('en-US'); }
  }
  const signed = (x) => (x > 0 ? '+' : x < 0 ? '−' : '') + money(Math.abs(x)).replace('-', '');
  const whole = (x) => Math.round(x).toLocaleString('en-US');

  /* ── What everything below is drawn from ────────────────────────────────── */
  function context() {
    const qs = E.questionsFor(M, S.stage), sc = E.scores(M, S), rd = E.reading(sc, S.str), pc = E.pieces(sc, S.str, S.got);
    const answered = sc.reduce((a, s) => a + s.answered, 0);
    return { qs, sc, rd, pc, answered, n: E.numbers(S), here: E.STAGES.findIndex((x) => x.id === S.stage), goal: E.STAGES.findIndex((x) => x.id === S.goal) };
  }

  /* ── The launchpad emblem: four quarters, four bands each, filling from the centre ── */
  function emblem(per, size, opts = {}) {
    const pt = (rr, a) => [60 + rr * Math.cos(a * Math.PI / 180), 60 + rr * Math.sin(a * Math.PI / 180)];
    const bandPath = (ri, ro, a0, a1) => { const [x0, y0] = pt(ro, a0), [x1, y1] = pt(ro, a1), [x2, y2] = pt(ri, a1), [x3, y3] = pt(ri, a0);
      return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${ro} ${ro} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} A${ri} ${ri} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z`; };
    const total = per.reduce((a, b) => a + b, 0);
    let segs = '';
    D.forEach((_, i) => { const a0 = -90 + i * 90 + 3, a1 = a0 + 84; for (let k = 0; k < 4; k++) { const ri = 14 + k * 11, ro = ri + 9, on = k < per[i];
      segs += `<path class="band" d="${bandPath(ri, ro, a0, a1)}" fill="${on ? LIGHT[i] : 'none'}" stroke="${on ? LIGHT[i] : '#8A7A5E'}" stroke-width="${opts.small ? 2 : 1}" stroke-dasharray="${on ? '0' : '2 3'}" style="opacity: ${on ? 1 : .55}; transition: fill .5s ease, opacity .5s ease"/>`; } });
    const coreR = (3 + total / 16 * 7).toFixed(1), coreOp = (0.3 + total / 16 * 0.7).toFixed(2);
    return `<svg class="${opts.cls || ''}" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="Your launchpad: ${total} of 16 pieces in place" style="flex: none">
      ${opts.small ? '' : '<g class="spin"><circle cx="60" cy="60" r="59" fill="none" stroke="#6F93B8" stroke-width=".8" stroke-dasharray="1.5 5" opacity=".7"/></g>'}
      ${segs}
      ${opts.small ? '' : '<line x1="60" y1="2" x2="60" y2="118" stroke="#0E1C2B" stroke-width="2"/><line x1="2" y1="60" x2="118" y2="60" stroke="#0E1C2B" stroke-width="2"/>'}
      <circle cx="60" cy="60" r="${coreR}" fill="#6F93B8" style="opacity: ${coreOp}; transition: r .6s ease, opacity .6s ease"/>
      ${opts.small ? '' : '<circle cx="60" cy="60" r="11" fill="none" stroke="#EEF2F7" stroke-width=".8" opacity=".5"/><g class="orbit2"><circle cx="60" cy="3" r="2.5" fill="#EEF2F7"/></g>'}
    </svg>`;
  }

  /* ── Parts ──────────────────────────────────────────────────────────────── */
  const NAV = [['overview', '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/><g><polygon points="12,4 14,12 12,13.5 10,12" fill="#6F93B8"/><polygon points="12,20 14,12 12,10.5 10,12" fill="currentColor" opacity=".5"/><animateTransform attributeName="transform" type="rotate" values="20 12 12;34 12 12;20 12 12" dur="7s" repeatCount="indefinite"/></g></svg>', 'Your North Star'],
    ['clear', '01', 'Get clear'], ['people', '02', 'Lead your people'], ['numbers', '03', 'Count what matters'], ['plan', '04', 'Choose your next steps'], ['method', '⌘', 'How it works']];
  const navOn = () => (typeof window !== 'undefined' && window.__nsSpy) || UI.page; // spy.js: the section on screen
  const pNav = (c) => NAV.map(([id, ni, t]) => `<button type="button" class="nl ${navOn() === id ? 'on' : ''}" data-go="${id}" data-f="nav-${id}"${navOn() === id ? ' aria-current="true"' : ''}><span class="ni">${ni}</span>${t}${id === 'clear' ? `<small style="margin-left: auto; font-size: 9px">${c.answered}/8</small>` : ''}</button>`).join('');

  const STEP_CARDS = [['01', 'Get clear', 'Know yourself', 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'clear'],
    ['02', 'Lead your people', 'Know your people', D[1].icon, 'people'], ['03', 'Count what matters', 'Know your numbers', 'M4 20V10M10 20V4M16 20v-7M22 20H2', 'numbers'],
    ['04', 'Choose your next steps', 'Know your market', 'M6 21V4M6 4h11l-3 4 3 4H6', 'plan']];
  const pStepcards = () => STEP_CARDS.map(([n, t, k, icon, go], i) => `<button type="button" data-go="${go}" data-f="card-${go}" class="card lift stepc rise" style="animation-delay: ${(i + 1) / 10}s; text-align: left; padding: 18px; cursor: pointer; color: var(--ink); display: flex; flex-direction: column; gap: 8px; min-height: 150px">
      <span style="display: flex; justify-content: space-between; align-items: center; width: 100%"><span style="font-size: 11px; letter-spacing: .14em; color: var(--goldink); font-weight: 600">STEP ${n}</span><svg class="sico" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="${icon}" fill="none" stroke="${CSSV[i]}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <span class="sf" style="font-size: 21px; display: flex; align-items: center; gap: 8px">${t} <span class="sarr" aria-hidden="true">→</span></span>
      <span style="font-size: 13px; color: var(--muted)">${k}</span></button>`).join('');

  const LINES = ['Every answer puts a piece in place. Watch your launchpad build from the centre out.', 'It is taking shape. Keep going: each domain has four pieces.',
    'More than half built. The weakest corner shows you where to look.', 'Almost complete. Tick “Got it” on your feedback to finish it.', 'Your launchpad is ready. The next step is inside.'];
  function pBanner(c) {
    const t = c.pc.total, ready = t >= 12;
    const line = t === 16 ? LINES[4] : t === 0 ? LINES[0] : t < 8 ? LINES[1] : t < 12 ? LINES[2] : LINES[3];
    return `${emblem(c.pc.per, 124, { cls: 'lp-emb' })}
      <div style="flex: 1 1 260px; display: flex; flex-direction: column; gap: 4px; min-width: 0">
        <span class="eb" style="color: #A9C0D9">Your launchpad · ${t} of 16 pieces in place</span>
        <span class="sf" style="font-size: 18px; line-height: 1.25">${line}</span>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; font-weight: 600">${D.map((d, i) => `<span style="display: inline-flex; align-items: center; gap: 6px; color: ${LIGHT[i]}"><span style="width: 9px; height: 9px; border-radius: 50%; background: ${LIGHT[i]}"></span>${d.name} ${c.pc.per[i]}/4</span>`).join('')}</div>
      </div>
      ${ready ? '<a class="pop cta" href="/ground-plan/#home" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 18px; border-radius: 5px; background: #6F93B8; color: #0E1C2B; font-weight: 600; text-decoration: none">You’re ready · Enter the Founder Launchpad →</a>' : ''}`;
  }

  const pRing = (c) => `<svg width="74" height="74" viewBox="0 0 74 74" role="img" aria-label="${c.answered} of 8 answered">
      <circle cx="37" cy="37" r="31" fill="none" stroke="var(--cream)" stroke-width="7"/>
      <circle class="ringp" cx="37" cy="37" r="31" fill="none" stroke="#6F93B8" stroke-width="7" stroke-linecap="round" stroke-dasharray="194.8" style="stroke-dashoffset: ${(194.8 * (1 - c.answered / 8)).toFixed(1)}" transform="rotate(-90 37 37)"/>
      <text x="37" y="43" text-anchor="middle" font-family="Newsreader" font-size="19" fill="currentColor">${c.answered}/8</text></svg>`;

  const pNotice = () => (UI.note ? `<div class="card pop" role="status" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-color: #6F93B8">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="#6F93B8" stroke-width="1.8"/><path d="M3 7l9 6 9-6" fill="none" stroke="#6F93B8" stroke-width="1.8"/></svg>
      <span style="flex: 1; font-size: 14px">${esc(UI.note)}</span>
      <button type="button" data-act="note-x" data-f="note-x" aria-label="Close" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line); background: var(--paper); color: var(--ink); cursor: pointer">×</button></div>` : '');
  const pSkip = () => pNotice() + (S.skipped && !identified() ? `<div class="card pop" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-color: #6F93B8">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#6F93B8" stroke-width="1.8"/><path d="M12 7v6M12 16.5v.5" stroke="#6F93B8" stroke-width="2" stroke-linecap="round"/></svg>
      <span style="flex: 1; font-size: 14px">You are exploring. Add your email when you want your results sent to you.</span>
      <button type="button" data-act="regate" data-f="regate" style="min-height: 40px; padding: 0 14px; border-radius: 4px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 600; cursor: pointer">Add my email</button></div>` : '');

  /* Journey: Step 1 where you are today, Step 2 the road to where you want to get. */
  function pJourney(c) {
    const S4 = E.STAGES, here = c.here, hasGoal = c.goal >= 0, goal = c.goal, top = here === 3;
    const pos = (i) => 12.5 + 25 * i;
    const stages = S4.map((s, i) => {
      const isHere = i === here, isGoal = hasGoal && i === goal && i !== here, isWay = hasGoal && i > here && i < goal;
      const behind = i < here, can = i > here || (top && isHere);
      return { s, i, isHere, isGoal, isWay, behind, can,
        dotSize: isHere ? 26 : isGoal ? 30 : isWay ? 18 : 20,
        dotBg: isHere || isGoal ? '#6F93B8' : isWay ? '#A9C0D9' : behind ? '#3A2F20' : '#0E1C2B',
        dotBorder: isHere || isGoal ? '#EEF2F7' : isWay ? '#6F93B8' : behind ? '#3A2F20' : '#8A7A5E',
        tag: isHere ? (top ? 'YOU ARE HERE · GO DEEPER' : 'YOU ARE HERE') : isGoal ? 'YOUR GOAL' : isWay ? 'ON THE WAY' : behind ? 'BEHIND YOU' : 'TAP TO AIM' };
    });
    const gi = hasGoal ? goal : here, gap = gi - here;
    const words = ['', 'one stage to go, the next one', 'two stages to go — one at a time', 'three stages to go — one at a time'];
    const path = S4.slice(here, gi + 1).map((s) => s.name);
    const roadText = gap === 0 ? 'deeper into ' + S4[here].name : 'first finish ' + S4[here].name + ', then ' + path.slice(1).join(', then ');
    const chips = (hasGoal ? path : [S4[here].name]).map((nm, k, arr) => `<span style="padding: 5px 9px; border-radius: 12px; background: ${k === 0 ? '#6F93B8' : k === arr.length - 1 ? '#0E1C2B' : '#E3EAF2'}; color: ${k === arr.length - 1 && k !== 0 ? '#EEF2F7' : '#0E1C2B'}">${nm}</span>`).join('');
    return `<section class="rise r1" style="display: flex; flex-direction: column; gap: 18px">
      <div style="display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap">
        <span style="background: #6F93B8; color: #0E1C2B; font-weight: 900; font-size: 13px; padding: 6px 10px; border-radius: 3px; letter-spacing: .08em">STEP 1</span>
        <h2 style="font-weight: 900; font-size: 28px">Where are you <span class="serif" style="color: var(--goldink); font-weight: 400">today?</span></h2>
      </div>
      <p style="color: var(--muted); font-size: 16px">Tap the stage that is true now, not the one that would look best on a business card.</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px" role="group" aria-label="Where are you today?">
        ${stages.map((x) => `<button type="button" data-act="here" data-i="${x.i}" data-f="here-${x.i}" aria-pressed="${x.isHere}" style="text-align: left; cursor: pointer; color: #0E1C2B; background: ${x.isHere ? '#E3EAF2' : '#FFFFFF'}; border: 2px solid ${x.isHere ? '#3E6A94' : '#CBD5E1'}; border-radius: 8px; padding: 18px; min-height: 120px; display: flex; flex-direction: column; gap: 8px; transition: background .3s ease, border-color .3s ease">
          <span style="display: flex; justify-content: space-between; align-items: center; width: 100%"><span style="font-weight: 900; font-size: 12px; letter-spacing: .14em; color: #3E6A94">0${x.i + 1}</span><span style="font-size: 11px; font-weight: 900; letter-spacing: .12em; color: #3E6A94">${x.isHere ? 'YOU ARE HERE' : ''}</span></span>
          <span class="stname" style="font-size: 23px">${x.s.name}</span>
          <span class="serif" style="font-size: 14px; line-height: 1.4; color: #56647A">${x.s.focus}</span></button>`).join('')}
      </div>
    </section>
    <section class="rise r2" style="display: flex; flex-direction: column; gap: 18px">
      <div style="display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap">
        <span style="background: #6F93B8; color: #0E1C2B; font-weight: 900; font-size: 13px; padding: 6px 10px; border-radius: 3px; letter-spacing: .08em">STEP 2</span>
        <h2 style="font-weight: 900; font-size: 28px">Where do you want <span class="serif" style="color: var(--goldink); font-weight: 400">to get?</span></h2>
      </div>
      <p style="color: var(--muted); font-size: 16px">Now tap the stage you want to reach on your road.</p>
      <div style="background: #0E1C2B; color: #EEF2F7; border-radius: 12px; padding: 34px 18px 22px; box-shadow: 0 30px 60px rgba(28,19,9,.18)">
        <div style="position: relative; height: 150px">
          <div style="position: absolute; left: 12.5%; right: 12.5%; top: 50%; height: 4px; margin-top: -2px; background: repeating-linear-gradient(90deg, #2A3A50 0 10px, transparent 10px 18px); border-radius: 2px"></div>
          <div class="fill" style="position: absolute; top: 50%; height: 6px; margin-top: -3px; border-radius: 3px; background: #6F93B8; box-shadow: 0 0 14px rgba(111,147,184,.7); left: ${pos(here)}%; width: ${hasGoal ? 25 * gap : 0}%"></div>
          ${hasGoal && gap > 0 ? `<span class="trav" style="--from: ${pos(here)}%; --to: ${pos(gi)}%"></span>` : ''}
          ${stages.map((x) => `<div style="position: absolute; top: 0; bottom: 0; left: ${pos(x.i)}%; width: 0">
            ${x.isGoal ? '<svg class="flag" width="28" height="34" viewBox="0 0 28 34" aria-hidden="true" style="position: absolute; left: 0; top: 8px"><path d="M6 32V3" stroke="#EEF2F7" stroke-width="2"/><path d="M6 4h18l-5 6 5 6H6z" fill="#6F93B8"/></svg>' : ''}
            ${x.isHere ? '<span class="jring"></span><span class="jring ring2"></span>' : ''}
            ${x.isWay ? `<span class="way" style="position: absolute; left: 0; top: 50%; width: 30px; height: 30px; border-radius: 50%; border: 2px solid #6F93B8; transform: translate(-50%,-50%); animation-delay: ${(0.35 * (x.i - here)).toFixed(2)}s"></span>` : ''}
            <button type="button" data-act="goal" data-i="${x.i}" data-f="goal-${x.i}" ${x.can ? '' : 'disabled'} aria-label="Set ${x.s.name} as my goal"${x.isGoal || (x.isHere && hasGoal && gap === 0) ? ' aria-pressed="true"' : ''} class="${x.isGoal ? 'beacon' : ''}" style="position: absolute; left: 0; top: 50%; transform: translate(-50%,-50%); width: ${x.dotSize}px; height: ${x.dotSize}px; border-radius: 50%; background: ${x.dotBg}; border: 3px solid ${x.dotBorder}; cursor: ${x.can ? 'pointer' : 'default'}; padding: 0; transition: background .3s ease, width .3s ease, height .3s ease"></button>
            <div style="position: absolute; left: 0; bottom: 0; transform: translateX(-50%); width: 140px; max-width: 24vw; text-align: center; display: flex; flex-direction: column; gap: 2px">
              <span style="font-weight: 900; font-size: 15px; text-transform: uppercase; color: ${x.behind ? '#8A7A5E' : '#EEF2F7'}">${x.s.name}</span>
              <span style="font-size: 11px; font-weight: 700; letter-spacing: .1em; color: ${x.isHere || x.isGoal ? '#6F93B8' : '#A9B6C6'}">${x.tag}</span>
            </div></div>`).join('')}
        </div>
        ${hasGoal ? `<div class="rise" style="margin-top: 26px; border-top: 1px solid #3A2F20; padding-top: 20px; display: flex; flex-direction: column; gap: 8px; align-items: center; text-align: center">
            <span style="font-size: 20px; line-height: 1.4"><b style="color: #6F93B8">You are here:</b> ${S4[here].name} <span style="color: #A9B6C6">→</span> <b style="color: #6F93B8">Your goal:</b> ${gap === 0 ? 'go deeper' : S4[gi].name} · ${gap === 0 ? 'we sharpen what you already do' : words[gap]}</span>
            <span class="serif" style="font-size: 16px; color: #E3EAF2; max-width: 680px; line-height: 1.45">Your questions stay about where you are today. Your goal shapes your road in Step 04 — ${roadText}.</span></div>`
        : '<p style="margin-top: 22px; text-align: center; color: #A9B6C6; font-size: 15px">Tap a stage ahead of you. Your road will draw itself.</p>'}
      </div>
    </section>
    <section class="rise r3" style="display: flex; flex-direction: column; gap: 16px">
      <span style="font-size: 12px; font-weight: 700; letter-spacing: .18em; color: var(--goldink)">WHAT HAPPENS NEXT</span>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px">
        <a href="#s-questions" class="next1" style="text-decoration: none; color: #0E1C2B; background: #6F93B8; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 8px; min-height: 140px">
          <span style="font-weight: 900; font-size: 13px; letter-spacing: .14em">01 · YOU ARE GOING HERE NOW</span>
          <span style="font-weight: 900; font-size: 20px">Answer 8 questions about today</span>
          <span style="font-size: 14px">About ${S4[here].name} — across all four domains. Start →</span></a>
        <div style="background: #0E1C2B; color: #EEF2F7; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 8px; min-height: 140px">
          <span style="font-weight: 900; font-size: 13px; letter-spacing: .14em; color: #A9B6C6">02 · THEN</span>
          <span style="font-weight: 900; font-size: 20px">Add your numbers</span>
          <span style="font-size: 14px; color: #B8C6D6">One month. A range is enough.</span></div>
        <div style="background: #FFFFFF; border: 1.5px solid #CBD5E1; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 10px; min-height: 140px; color: #0E1C2B">
          <span style="font-weight: 900; font-size: 13px; letter-spacing: .14em; color: #3E6A94">03 · AND YOU GET</span>
          <span style="font-weight: 900; font-size: 20px">Your road, step by step</span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 12px; font-weight: 900">${chips}</div></div>
      </div>
    </section>`;
  }

  const pHerebar = (c) => (c.goal >= 0 ? `<div id="s-questions" class="card" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="10" r="3" fill="none" stroke="var(--goldink)" stroke-width="1.8"/><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" fill="none" stroke="var(--goldink)" stroke-width="1.8"/></svg>
      <span><b>You are here:</b> ${E.STAGES[c.here].name}</span><span style="color: var(--muted)">→</span><span><b>Your goal:</b> ${c.goal === c.here ? 'go deeper' : E.STAGES[c.goal].name}</span>
      <button type="button" data-go="journey" data-f="change-road" style="margin-left: auto; font-size: 13px; font-weight: 600; padding: 8px 0; background: none; border: 0; color: var(--goldink); cursor: pointer; text-decoration: underline">Change</button></div>`
    : '<div id="s-questions"></div>');

  const pModes = () => `<div class="card" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
      <span style="font-weight: 600" id="modes-h">Do you have paying customers yet?</span>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 8px" role="group" aria-labelledby="modes-h">
        ${E.MODES.map(([id, label, sub]) => `<button type="button" data-act="mode" data-v="${id}" data-f="mode-${id}" aria-pressed="${S.mode === id}" style="text-align: left; min-height: 56px; padding: 10px 12px; border-radius: 5px; border: 1.5px solid ${S.mode === id ? 'var(--ink)' : 'var(--line)'}; background: ${S.mode === id ? 'var(--cream)' : 'var(--paper)'}; color: var(--ink); cursor: pointer; display: flex; flex-direction: column; gap: 1px"><span style="font-weight: 600">${label}</span><span style="font-size: 12px; color: var(--muted)">${sub}</span></button>`).join('')}
      </div>
      <span style="font-size: 12px; color: var(--muted)">This changes the numbers we ask for and the feedback you get. No customers yet? We will not turn this into a sales calculator.</span></div>`;

  const pDombars = (c) => `<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px" aria-hidden="true">${D.map((d, i) => `<div style="display: flex; flex-direction: column; gap: 6px">
      <div style="height: 5px; border-radius: 3px; background: var(--cream); overflow: hidden"><div class="bar" style="height: 5px; background: ${CSSV[i]}; width: ${c.sc[i].answered * 50}%"></div></div>
      <span style="font-size: 11px; font-weight: 600; letter-spacing: .08em; color: ${CSSV[i]}">${d.name} · ${c.sc[i].answered}/2</span></div>`).join('')}</div>`;

  function pQuestions(c) {
    const firstOpen = c.qs.findIndex((q) => !Number.isInteger(S.ans[q.id]));
    return c.qs.map((q, i) => {
      const di = D.findIndex((d) => d.id === q.domain), done = Number.isInteger(S.ans[q.id]);
      return `<div style="display: flex; flex-direction: column; gap: 12px">
        ${i % 2 === 0 ? `<div style="display: flex; align-items: center; gap: 10px; margin-top: 12px">
          <span style="width: 34px; height: 34px; border-radius: 50%; background: ${TINT[di]}; display: inline-flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="${D[di].icon}" fill="none" stroke="${CSSV[di]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <h3 class="sf" style="font-size: 20px; font-weight: 500">${D[di].name}</h3><span style="flex: 1; height: 1px; background: var(--line)"></span></div>` : ''}
        <div style="background: var(--paper); border: 1.5px solid ${i === firstOpen ? '#6F93B8' : done ? 'var(--line)' : 'var(--cream)'}; border-radius: 7px; padding: 18px; display: flex; flex-direction: column; gap: 12px; transition: border-color .3s ease">
          <div style="display: flex; gap: 12px; align-items: flex-start">
            <span style="font-family: Newsreader, serif; font-size: 15px; color: ${CSSV[di]}; flex: none; padding-top: 2px">0${i + 1}</span>
            <div style="display: flex; flex-direction: column; gap: 4px; flex: 1"><span style="font-weight: 600; font-size: 16px; line-height: 1.35" id="qt-${q.id}">${esc(q.text)}</span><span style="font-size: 13px; color: var(--muted)">${esc(q.prompt)}</span></div>
            ${done ? '<svg width="22" height="22" viewBox="0 0 24 24" role="img" aria-label="Answered" style="flex: none"><circle cx="12" cy="12" r="10" fill="#6F93B8"/><path d="M7 12.5l3.2 3L17 9" fill="none" stroke="#0E1C2B" stroke-width="2.2" stroke-linecap="round"/></svg>' : ''}
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px" role="group" aria-labelledby="qt-${q.id}">
            ${E.ANSWERS.map(([label, sub], k) => { const on = S.ans[q.id] === k; return `<button type="button" data-act="ans" data-q="${q.id}" data-v="${k}" data-f="ans-${q.id}-${k}" aria-pressed="${on}" style="text-align: left; min-height: 52px; padding: 9px 12px; border-radius: 5px; border: 1.5px solid ${on ? 'var(--ink)' : 'var(--line)'}; background: ${on ? 'var(--cream)' : 'var(--paper)'}; color: var(--ink); cursor: pointer; display: flex; flex-direction: column; gap: 1px"><span style="font-weight: 600; font-size: 14px">${label}</span><span style="font-size: 12px; color: var(--muted)">${sub}</span></button>`; }).join('')}
          </div></div></div>`;
    }).join('');
  }

  const pPains = () => `<div style="display: flex; flex-direction: column; gap: 6px">
      <span class="eb">Two more taps · they shape your feedback</span>
      <h2 class="sf" style="font-size: 26px; line-height: 1.2" id="pains-h">What hurts most right now? <span class="sfi" style="color: var(--goldink)">Pick up to two.</span></h2></div>
    <div style="display: flex; flex-wrap: wrap; gap: 8px" role="group" aria-labelledby="pains-h">
      ${E.PAINS.map(([id, t, di]) => { const on = S.pains.includes(id); return `<button type="button" data-act="pain" data-v="${id}" data-f="pain-${id}" aria-pressed="${on}" style="min-height: 44px; padding: 0 14px; border-radius: 22px; border: 1.5px solid ${on ? 'var(--ink)' : 'var(--line)'}; background: ${on ? 'var(--cream)' : 'var(--paper)'}; color: var(--ink); font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px"><span style="width: 9px; height: 9px; border-radius: 50%; background: ${D[di].hex}"></span>${t}</button>`; }).join('')}
    </div>
    <h2 class="sf" style="font-size: 22px; line-height: 1.2; margin-top: 4px" id="want-h">And what do you want most? <span class="sfi" style="color: var(--goldink)">Pick one.</span></h2>
    <div style="display: flex; flex-wrap: wrap; gap: 8px" role="group" aria-labelledby="want-h">
      ${E.GOALS.map(([id, t]) => { const on = S.want === id; return `<button type="button" data-act="want" data-v="${id}" data-f="want-${id}" aria-pressed="${on}" style="min-height: 44px; padding: 0 14px; border-radius: 22px; border: 1.5px solid ${on ? 'var(--ink)' : 'var(--line)'}; background: ${on ? 'var(--cream)' : 'var(--paper)'}; color: var(--ink); font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4M6 4h11l-3 4 3 4H6" fill="none" stroke="#6F93B8" stroke-width="2" stroke-linejoin="round"/></svg>${t}</button>`; }).join('')}
    </div>`;

  function pReading(c) {
    const R = 150, sc = c.sc.map((s) => s.score), str = c.rd.str;
    const rA = sc.map((v) => 14 + v / 6 * (R - 14)), rS = str.map((v) => 14 + v / 5 * (R - 14));
    const pts = (r) => `200,${200 - r[0]} ${200 + r[1]},200 200,${200 + r[2]} ${200 - r[3]},200`;
    const any = c.rd.any, hi = c.rd.hi, lo = c.rd.lo;
    return `<div style="display: flex; flex-direction: column; gap: 8px; max-width: 700px">
        <span class="eb">Your North Star reading</span>
        <h2 class="sf" style="font-size: clamp(28px, 3.6vw, 40px); line-height: 1.05">Where you are strong. <span class="sfi" style="color: var(--goldink)">Where you are low.</span></h2>
        <p style="color: var(--muted)">Rate four strengths honestly. Together with your answers, they draw your North Star.</p></div>
      <div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start">
        <div class="card" style="flex: 1 1 340px; min-width: 0; padding: 18px; display: flex; flex-direction: column; gap: 14px">
          <span style="font-weight: 600">How strong are you at…</span>
          ${E.STRENGTHS.map((s, i) => `<div style="display: flex; flex-direction: column; gap: 6px">
            <div style="display: flex; align-items: center; gap: 8px"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="${s.icon}" fill="none" stroke="${CSSV[s.d]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="font-weight: 600; font-size: 14px" id="st-${i}">${s.name}</span><span style="font-size: 12px; color: var(--muted)">· ${D[s.d].name}</span></div>
            <div style="display: flex; gap: 6px" role="group" aria-labelledby="st-${i}">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-act="str" data-i="${i}" data-v="${n}" data-f="str-${i}-${n}" aria-label="${s.name}: ${n} of 5" aria-pressed="${str[i] === n}" style="flex: 1; min-height: 44px; border-radius: 5px; border: 1.5px solid ${str[i] >= n ? '#6F93B8' : 'var(--line)'}; background: ${str[i] >= n ? '#6F93B8' : 'var(--paper)'}; color: ${str[i] >= n ? '#0E1C2B' : 'var(--ink)'}; cursor: pointer; font-weight: 600">${n}</button>`).join('')}</div></div>`).join('')}
          <span style="font-size: 12px; color: var(--muted)">1 = not yet · 5 = people come to me for this</span>
        </div>
        <div class="deep" style="flex: 1 1 420px; min-width: 0; border-radius: 9px; padding: 18px; display: flex; flex-wrap: wrap; gap: 18px; align-items: center">
          <svg viewBox="0 0 400 400" style="flex: 1 1 260px; max-width: 340px; height: auto" role="img" aria-label="Your North Star: Lead yourself ${sc[0]}, Lead your people ${sc[1]}, Lead your business ${sc[2]}, Lead the market ${sc[3]}, each out of 6">
            <g class="spin"><circle cx="200" cy="200" r="186" fill="none" stroke="#6F93B8" stroke-width="1" stroke-dasharray="2 8" opacity=".6"/></g>
            <circle cx="200" cy="200" r="150" fill="none" stroke="#3A2F20"/><circle cx="200" cy="200" r="100" fill="none" stroke="#3A2F20"/><circle cx="200" cy="200" r="50" fill="none" stroke="#3A2F20"/>
            <line x1="200" y1="44" x2="200" y2="356" stroke="#3A2F20"/><line x1="44" y1="200" x2="356" y2="200" stroke="#3A2F20"/>
            <polygon points="${pts(rS)}" fill="none" stroke="#EEF2F7" stroke-width="1.5" stroke-dasharray="5 4" opacity=".75"/>
            <polygon points="${pts(rA)}" fill="rgba(111,147,184,.35)" stroke="#6F93B8" stroke-width="2.5" stroke-linejoin="round"/>
            <circle cx="200" cy="${200 - rA[0]}" r="6" fill="#E0A282"/><circle cx="${200 + rA[1]}" cy="200" r="6" fill="#9BC0A1"/><circle cx="200" cy="${200 + rA[2]}" r="6" fill="#91B8D5"/><circle cx="${200 - rA[3]}" cy="200" r="6" fill="#DDBD69"/>
            <text x="200" y="30" fill="#E0A282" font-family="Inter" font-weight="800" font-size="11" text-anchor="middle" letter-spacing="1.2">LEAD YOURSELF · ${sc[0]}/6</text>
            <text x="372" y="196" fill="#9BC0A1" font-family="Inter" font-weight="800" font-size="11" text-anchor="end" letter-spacing="1.2">LEAD YOUR PEOPLE</text>
            <text x="372" y="214" fill="#9BC0A1" font-family="Inter" font-weight="700" font-size="12" text-anchor="end">${sc[1]}/6</text>
            <text x="200" y="384" fill="#91B8D5" font-family="Inter" font-weight="800" font-size="11" text-anchor="middle" letter-spacing="1.2">LEAD YOUR BUSINESS · ${sc[2]}/6</text>
            <text x="28" y="196" fill="#DDBD69" font-family="Inter" font-weight="800" font-size="11" letter-spacing="1.2">LEAD THE MARKET</text>
            <text x="28" y="214" fill="#DDBD69" font-family="Inter" font-weight="700" font-size="12">${sc[3]}/6</text>
            <circle cx="200" cy="200" r="7" fill="#0E1C2B" stroke="#6F93B8" stroke-width="2"/>
          </svg>
          <div style="flex: 1 1 200px; display: flex; flex-direction: column; gap: 10px">
            <div style="display: flex; gap: 14px; font-size: 12px; color: #A9B6C6; flex-wrap: wrap"><span style="display: inline-flex; align-items: center; gap: 6px"><span style="width: 14px; height: 10px; background: rgba(111,147,184,.5); border: 2px solid #6F93B8"></span>Your answers</span><span style="display: inline-flex; align-items: center; gap: 6px"><span style="width: 14px; height: 0; border-top: 2px dashed #EEF2F7"></span>Your strengths</span></div>
            <div style="display: flex; flex-direction: column; gap: 2px"><span class="eb" style="color: #9BC0A1">Your strength</span><span class="sf" style="font-size: 20px">${any ? D[hi].name : 'Answer and rate to see it'}</span></div>
            <div style="display: flex; flex-direction: column; gap: 2px"><span class="eb" style="color: #E0A282">Lowest right now</span><span class="sf" style="font-size: 20px">${any ? D[lo].name : '—'}</span></div>
            <div style="display: flex; flex-direction: column; gap: 2px"><span class="eb" style="color: #A9C0D9">Start here</span><span style="font-size: 14px">${any ? D[lo].step : 'Your first step appears here.'}</span></div>
          </div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px">
        ${D.map((d, i) => `<div class="card" style="padding: 14px; display: flex; gap: 10px; align-items: flex-start; border-top: 3px solid ${CSSV[i]}">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style="flex: none"><path d="${d.icon}" fill="none" stroke="${CSSV[i]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div style="display: flex; flex-direction: column; gap: 2px"><span style="font-weight: 600; font-size: 13px">${d.name} · next step</span><span style="font-size: 13px; color: var(--muted)">${i === lo && any ? 'Start here. ' : ''}${d.step}</span></div></div>`).join('')}
      </div>`;
  }

  /* Step 03 part 1: three numbers a group, one group open at a time. */
  function pNumbers(c) {
    const G = E.groupsFor(S.mode), has = S.mode === 'yes', gi = Math.min(S.group, G.length);
    const TINTG = { 0: 'var(--tself)', 1: 'var(--tpeople)', 2: 'var(--twork)', 3: 'var(--tmarket)' };
    const groups = G.map((g, i) => {
      const ins = E.insight(g.key, c.n, S.mode, money), active = gi === i;
      const status = i < gi ? (ins || 'Not enough yet to say anything. Open it to add a range.') : active ? 'Three quick answers · pick a range or type your own' : 'Next';
      const fields = g.fields.map(([key, label, choices]) => {
        const k = S.mode + '.' + key, cur = S.nums[k] || { pick: '', own: '' }, isText = typeof choices[0][1] === 'string';
        const opts = [['', 'Choose…'], ...choices.map((ch, j) => [String(j), ch[0]]), ['own', isText ? 'Somewhere else…' : 'Type my own…'], ['unsure', 'Not sure yet']];
        return `<div style="display: flex; flex-direction: column; gap: 6px">
          <label for="f-${k}" style="font-size: 13px; font-weight: 600">${label}</label>
          <select id="f-${k}" class="inp${UI.glow && UI.glow.keys.includes(k) && Date.now() < UI.glow.until ? ' glowbox' : ''}" data-num="${k}" data-f="num-${k}" style="border-color: ${cur.pick === 'own' ? '#6F93B8' : 'var(--line)'}">${opts.map(([v, t]) => `<option value="${v}"${cur.pick === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>
          ${cur.pick === 'own' ? `<input class="inp pop" type="text" ${isText ? '' : 'inputmode="decimal"'} data-own="${k}" data-f="own-${k}" value="${esc(cur.own)}" placeholder="${isText ? 'Where they gather' : 'Type the exact amount'}" aria-label="${esc(label)}, ${isText ? 'in your words' : 'exact amount'}" style="border-color: #6F93B8">` : ''}
        </div>`;
      }).join('');
      return `<div style="background: var(--paper); border: 1.5px solid ${active ? '#6F93B8' : 'var(--line)'}; border-radius: 7px; overflow: hidden; transition: border-color .3s ease">
        <button type="button" data-act="grp" data-i="${i}" data-f="grp-${i}" aria-expanded="${active}" style="width: 100%; background: none; border: 0; padding: 16px 18px; display: flex; align-items: center; gap: 14px; cursor: pointer; text-align: left; color: var(--ink)">
          <span style="width: 38px; height: 38px; border-radius: 50%; background: ${i < gi ? '#6F93B8' : TINTG[g.d]}; display: inline-flex; align-items: center; justify-content: center; flex: none"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="${g.icon}" fill="none" stroke="${i < gi ? '#0E1C2B' : CSSV[g.d]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span style="display: flex; flex-direction: column; flex: 1; min-width: 0"><span style="font-weight: 600; font-size: 16px">0${i + 1} · ${g.title}</span><span style="font-size: 13px; color: var(--muted)">${esc(status)}</span></span>
          <span style="font-size: 12px; font-weight: 600; color: var(--goldink)">${i < gi ? 'Done · edit' : active ? '' : 'Open'}</span></button>
        ${active ? `<div class="pop" style="padding: 0 18px 18px; display: flex; flex-direction: column; gap: 14px">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px">${fields}</div>
          <div class="pop deep" style="border-radius: 7px; padding: 16px 18px; display: flex; gap: 14px; align-items: center; animation-delay: .2s">
            <svg class="shim" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" style="flex: none"><path d="M12 3l2.2 5.6L20 9l-4.5 3.8L17 19l-5-3.2L7 19l1.5-6.2L4 9l5.8-.4z" fill="none" stroke="#6F93B8" stroke-width="1.6" stroke-linejoin="round"/></svg>
            <div style="display: flex; flex-direction: column; gap: 2px" aria-live="polite"><span class="eb" style="color: #A9C0D9">What this already tells you</span><span style="font-size: 16px; font-weight: 600">${esc(ins || 'Pick a range for each, or type your own. The answer appears here.')}</span></div></div>
          <button type="button" data-act="grp" data-i="${i + 1}" data-f="grp-next-${i}" style="align-self: flex-end; min-height: 46px; padding: 0 20px; border-radius: 5px; border: 0; background: var(--deep); color: #EEF2F7; font-weight: 600; cursor: pointer">${i === G.length - 1 ? 'See what it all means →' : 'Next group →'}</button>
        </div>` : ''}</div>`;
    }).join('');
    return `<div style="display: flex; flex-direction: column; gap: 8px; max-width: 720px">
        <span class="eb">Step 03 · Count what matters · Part 1 of 2</span>
        <h1 class="sf" style="font-size: clamp(30px, 4vw, 44px); line-height: 1.05">${has ? 'Four small groups.' : 'No sales yet? Good.'} <span class="sfi" style="color: var(--goldink)">${has ? 'An insight after each.' : 'Start with your offer, your runway and your market.'}</span></h1>
        <p style="color: var(--muted)">${has ? 'One month. Pick a range from the list, or type your own. Each group tells you something before you move on.' : 'We will not ask you for sales you do not have yet. Three small groups, and an insight after each.'}</p></div>
      <div style="display: flex; flex-direction: column; gap: 10px">${groups}</div>
      <p style="font-size: 12px; color: var(--muted)">A range is used at its middle, so what it tells you is said with “about”. Machines can do this arithmetic in seconds; what you do about it is the part only you can decide.</p>`;
  }

  /* ── The Account Plans, opened in place when signed in ─────────────────── */
  const BAND_LABEL = { now: 'Needs you now', shape: 'Taking shape', strength: 'A strength' };
  /* Fine-tune stays as the founder left it across redraws. */
  document.addEventListener('toggle', (e) => { if (e.target.dataset && 'fine' in e.target.dataset) { UI.fine = e.target.open; cache['lab-in'] = pLabIn(); } }, true);
  /* Which steps are open, so a redraw (after a tick) leaves them open. */
  const OPEN = new Set();
  document.addEventListener('toggle', (e) => { const d = e.target; if (d.dataset && d.dataset.step) { if (d.open) OPEN.add(d.dataset.step); else OPEN.delete(d.dataset.step); } }, true);
  function stepOpen(st, k) {
    const done = !!(UI.plans && UI.plans.done[st.id]);
    const row = (label, v) => (v ? `<p style="margin: 0; font-size: 14px; line-height: 1.55; color: #EEF2F7"><b style="color: #A9C0D9">${label}</b> ${esc(v)}</p>` : '');
    return `<details data-step="${esc(st.id)}"${OPEN.has(st.id) ? ' open' : ''} style="border-top: 1px solid #3A2F20; padding-top: 8px">
      <summary style="display: flex; gap: 12px; align-items: center; cursor: pointer; list-style: none; min-height: 40px"><span style="font-family: Newsreader, serif; color: #6F93B8; width: 22px">${done ? '✓' : k + 1}</span><span style="flex: 1; font-size: 14px; color: #EEF2F7${done ? '; text-decoration: line-through; text-decoration-color: #8A7A5E' : ''}">${esc(st.title)}${st.domainName ? ` <span style="color: #A9B6C6; font-size: 12px">· ${esc(st.domainName)}</span>` : ''}</span><span class="st-open" aria-hidden="true" style="color: #A9C0D9; font-size: 12px">Open</span></summary>
      <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px 0 6px 34px">
        ${row('Why it matters:', st.why)}${row('What to do:', st.what)}${row('About:', st.about)}${row('Done looks like:', st.done)}
        ${st.ask ? `<p class="sfi" style="margin: 0; font-size: 16px; color: #EEF2F7">“${esc(st.ask)}”</p>` : ''}
        ${st.note ? row(`${BAND_LABEL[UI.plans && UI.plans.domains.find((d) => d.id === st.domain)?.band] || ''}${st.noteFor ? ' (' + esc(st.noteFor) + ')' : ''}:`, st.note) : ''}
        <label style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid #2A3A50; border-radius: 6px; cursor: pointer; font-size: 14px; align-self: flex-start"><input type="checkbox" data-tick="${esc(st.id)}" data-f="tick-${esc(st.id)}"${done ? ' checked' : ''} style="width: 20px; height: 20px; accent-color: #6F93B8">Done</label>
      </div></details>`;
  }
  const planCount = () => (UI.plans ? `${UI.plans.count} of ${UI.plans.total} steps done` : '');
  /** The four steps for a domain card, or a What-if lever: open when signed
   *  in and loaded, the locked titles otherwise. */
  function planBlock(titles, steps, eyebrow, cta) {
    if (signedIn() && steps) return `<span class="eb" style="color: #A9C0D9">${eyebrow} · ${planCount()}</span>
      ${steps.map(stepOpen).join('')}
      <span style="font-size: 13px; color: #A9B6C6">Times are about, not promises. Tick a step when it is done; the count is your plans’ own.</span>`;
    if (signedIn()) return `<span class="eb" style="color: #A9C0D9">${eyebrow}</span>
      ${titles.map((t, k) => `<div style="display: flex; gap: 12px; align-items: center; border-top: 1px solid #3A2F20; padding-top: 8px"><span style="font-family: Newsreader, serif; color: #6F93B8; width: 22px">${k + 1}</span><span style="flex: 1; font-size: 14px; color: #EEF2F7">${t}</span></div>`).join('')}
      <span style="font-size: 13px; color: #A9B6C6">Opening in your account…</span>`;
    return `<span class="eb" style="color: #A9C0D9">${eyebrow} · in your free account</span>
      ${titles.map((t, k) => `<div style="display: flex; gap: 12px; align-items: center; border-top: 1px solid #3A2F20; padding-top: 8px"><span style="font-family: Newsreader, serif; color: #6F93B8; width: 22px">${k + 1}</span><span style="flex: 1; font-size: 14px; color: #EEF2F7">${t}</span><span class="blurline" style="flex: 0 0 70px; height: 8px; border-radius: 4px; background: #2A3A50"></span>${lockIcon('#A9B6C6')}</div>`).join('')}
      <span style="font-size: 13px; color: #A9B6C6">Each step opens with what to do, about how long it takes and what “done” looks like.</span>
      <button type="button" data-act="account" data-f="account-${eyebrow.length}" class="go" style="align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 18px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 600; cursor: pointer">${cta} <span class="arr" aria-hidden="true">→</span></button>`;
  }

  /* Step 03 part 2: one card per domain. "Got it" opens the next. */
  function pFeedback(c, i) {
    const s = c.sc[i], f = E.feedback(i, s, S.pains, S.want), locked = i > 0 && !S.got[i - 1];
    // Before either question is answered there is nothing to read back yet.
    if (!s.answered) Object.assign(f, { big: `Answer the two ${D[i].name.toLowerCase()} questions in Step 01, and this card fills in.`, why: 'Nothing here is said about you before you have said it yourself.', feel: [] });
    const nums = S.mode === 'yes' ? E.numberLines(c.n, money)[i] : '';
    const bg = ['#F4E1D6', '#F3EAD3', '#E3ECE4'], ink = ['#8A4524', '#3E6A94', '#35593D'];
    const open = !!S.more[i];
    return `<div style="display: flex; flex-direction: column; gap: 10px; opacity: ${locked ? '.45' : '1'}; transition: opacity .5s ease"${locked ? ' inert' : ''}>
      ${locked ? `<span style="font-size: 13px; color: var(--muted); display: inline-flex; align-items: center; gap: 8px">${lockIcon('currentColor')}Tick “Got it” on the domain above to open this one.</span>` : ''}
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap"><span style="width: 34px; height: 34px; border-radius: 50%; background: ${TINT[i]}; display: inline-flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="${D[i].icon}" fill="none" stroke="${CSSV[i]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><h3 class="sf" style="font-size: 20px; font-weight: 500">${D[i].name}</h3>
        <span style="font-size: 11px; font-weight: 600; letter-spacing: .12em; padding: 4px 10px; border-radius: 12px; background: ${f.bandIndex === null ? 'var(--cream)' : bg[f.bandIndex]}; color: ${f.bandIndex === null ? 'var(--muted)' : ink[f.bandIndex]}">${f.band}</span>
        <span style="display: inline-flex; gap: 3px" role="img" aria-label="${s.score} of 6">${[0, 1, 2, 3, 4, 5].map((k) => `<span style="width: 14px; height: 6px; border-radius: 3px; background: ${k < s.score ? CSSV[i] : 'var(--cream)'}"></span>`).join('')}</span>
        <span style="flex: 1; height: 1px; background: var(--line); min-width: 40px"></span></div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px">
        <div class="card lift" style="border-top: 4px solid ${CSSV[i]}; padding: 18px; display: flex; flex-direction: column; gap: 8px">
          <span class="eb" style="color: ${CSSV[i]}">What it means for you now</span>
          <span class="sf" style="font-size: 21px; line-height: 1.25">${f.big}</span>
          <span style="font-size: 14px; color: var(--muted)">${f.why}</span>
          ${f.goalLine ? `<span style="font-size: 13px; font-weight: 600; color: var(--goldink); display: inline-flex; gap: 6px; align-items: center"><svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4M6 4h11l-3 4 3 4H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>${f.goalLine}</span>` : ''}
          ${nums ? `<span style="font-size: 12px; color: var(--muted); border-top: 1px solid var(--line); padding-top: 8px">Your numbers: ${esc(nums)}</span>` : ''}
        </div>
        <div class="card lift" style="padding: 18px; display: flex; flex-direction: column; gap: 10px">
          <span class="eb">What you may be feeling</span>
          ${f.pains.length ? `<span style="font-size: 13px; font-weight: 600; padding: 6px 10px; border-radius: 6px; background: var(--cream); align-self: flex-start">You said: ${f.pains.join(' · ')}</span>` : ''}
          ${f.feel.map((t) => `<span style="display: flex; gap: 10px; align-items: flex-start; font-size: 14px"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; margin-top: 2px"><circle cx="12" cy="12" r="8" fill="none" stroke="${CSSV[i]}" stroke-width="2"/><circle cx="12" cy="12" r="2.5" fill="${CSSV[i]}"/></svg>${t}</span>`).join('')}
        </div>
        <div class="deep" style="border-radius: 7px; padding: 18px; display: flex; flex-direction: column; gap: 8px"><span class="eb" style="color: #A9C0D9">Ask yourself</span><span class="sfi" style="font-size: 19px; line-height: 1.35">“${f.ask}”</span>
          <label style="display: flex; align-items: center; gap: 10px; margin-top: 6px; padding: 10px 12px; border: 1px solid #2A3A50; border-radius: 6px; cursor: pointer; font-size: 14px"><input type="checkbox" data-act="got" data-i="${i}" data-f="got-${i}"${S.got[i] ? ' checked' : ''} style="width: 20px; height: 20px; accent-color: #6F93B8">Got it, I’ve read this</label>
          <button type="button" data-act="more" data-i="${i}" data-f="more-${i}" aria-expanded="${open}" class="no-print" style="align-self: flex-start; margin-top: 4px; background: none; border: 1px solid #2A3A50; color: #A9C0D9; border-radius: 5px; min-height: 40px; padding: 0 14px; font-weight: 600; cursor: pointer">${open ? 'Show less' : 'Show more'}</button>
        </div>
      </div>
      ${open ? `<div class="pop" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px">
        <div class="card" style="padding: 18px; display: flex; flex-direction: column; gap: 8px"><span class="eb" style="color: ${CSSV[i]}">Going deeper</span><span style="font-size: 15px; line-height: 1.6">${f.deep}</span>
          <span style="font-size: 14px; font-weight: 600; margin-top: 4px">This week: ${f.week}</span></div>
        <div class="deep" style="border-radius: 7px; padding: 20px; display: flex; flex-direction: column; gap: 10px; border: 1px solid #6F93B8">
          ${planBlock(f.steps, UI.plans && (UI.plans.domains.find((x) => x.id === D[i].id) || {}).steps, 'Your step-by-step plan', 'Create my free account')}
        </div></div>` : ''}
    </div>`;
  }

  /* Sharing: their reading, or an invitation to take it. WhatsApp and LinkedIn
   * open with the words already written; the founder still presses send. */
  const SHARE_URL = 'https://linktolead.exploraself.com/northstar';
  const shareLink = (src, what) => `${SHARE_URL}?utm_source=${src}&utm_medium=share&utm_content=${what}`;
  function shareText(c, what, src) {
    const url = shareLink(src, what);
    if (what === 'reading' && c && c.rd && c.rd.any) return `I just took The Leader’s North Star. My strongest side: ${D[c.rd.hi].name}. The one that needs me first: ${D[c.rd.lo].name}. Eight honest questions, free. Take yours: ${url}`;
    return `Eight honest questions about how you lead yourself, your people, your business and the market. Free, about 10 minutes. Take The Leader’s North Star: ${url}`;
  }
  const WA = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.8 8.2c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.2.1.4.3.4.6v.5c0 .3-.1.6-.4.8-.6.4-1.4.5-2.2.2-2.3-.9-4.1-2.7-5-5-.3-.8-.2-1.6.2-2.2z" fill="currentColor"/></svg>';
  const LI = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const shareRow = (c, what, label) => `<div style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: .06em">${label}</span>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px">
        <a href="https://wa.me/?text=${encodeURIComponent(shareText(c, what, 'whatsapp'))}" target="_blank" rel="noopener" data-f="share-${what}-wa" style="min-height: 44px; border-radius: 5px; border: 1px solid #25D366; color: var(--ink); background: var(--paper); font-weight: 600; font-size: 14px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px"><span style="color: #1DA851; display: inline-flex">${WA}</span>WhatsApp</a>
        <a href="https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText(c, what, 'linkedin'))}" target="_blank" rel="noopener" data-f="share-${what}-li" style="min-height: 44px; border-radius: 5px; border: 1px solid #0A66C2; color: var(--ink); background: var(--paper); font-weight: 600; font-size: 14px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px"><span style="color: #0A66C2; display: inline-flex">${LI}</span>LinkedIn</a>
      </div></div>`;

  const pSave = (c) => `<div style="flex: 1 1 320px; display: flex; flex-direction: column; gap: 10px">
      <span class="eb">Save your results</span>
      <h2 class="sf" style="font-size: 26px; line-height: 1.2">Keep what you found. <span class="sfi" style="color: var(--goldink)">Print it, send it, share it.</span></h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px 14px; font-size: 14px">
        ${['Your first insight', 'Your North Star reading', 'Your feedback in all four domains', 'A next step for each domain', 'Your twelve weeks'].map((t) => `<span style="display: inline-flex; align-items: center; gap: 8px"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#6F93B8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>${t}</span>`).join('')}
      </div>
      <span style="font-size: 12px; color: var(--muted); display: inline-flex; align-items: center; gap: 6px">${lockIcon('currentColor', 13)}The deeper “Show more” insights stay inside your account.</span>
    </div>
    <div style="flex: 0 1 280px; display: flex; flex-direction: column; gap: 8px; min-width: 240px">
      <button type="button" data-act="email" data-f="email" ${UI.sending ? 'disabled' : ''} style="min-height: 50px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 600; font-size: 15px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 10px"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="#0E1C2B" stroke-width="1.8"/><path d="M3 7l9 6 9-6" fill="none" stroke="#0E1C2B" stroke-width="1.8"/></svg>${UI.sending ? 'Sending…' : 'Email me my results'}</button>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px">
        <button type="button" data-act="print" data-f="print" style="min-height: 46px; border-radius: 5px; border: 1px solid var(--line); background: var(--paper); color: var(--ink); font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M6 14h12v7H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>Print</button>
        <button type="button" data-act="print" data-f="pdf" style="min-height: 46px; border-radius: 5px; border: 1px solid var(--line); background: var(--paper); color: var(--ink); font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>Save as PDF</button>
      </div>
      <div class="no-print" style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px; padding-top: 12px; border-top: 1px solid var(--line)">
        ${c && c.rd && c.rd.any ? shareRow(c, 'reading', 'SHARE YOUR READING') : ''}
        ${shareRow(c, 'invite', 'INVITE SOMEONE TO TAKE IT')}
      </div>
      <span role="status" style="font-size: 13px; color: ${UI.mail.startsWith('Sent') ? 'var(--people)' : 'var(--muted)'}; font-weight: 600">${esc(UI.mail)}</span>
    </div>`;

  function pWeeks(c) {
    const WC = D.map((d) => d.hex), f = S.lean !== null ? S.lean : (c.rd.any ? c.rd.lo : null);
    const row = (d, i) => `<div style="display: grid; grid-template-columns: 170px repeat(12, minmax(0, 1fr)); gap: 6px; align-items: center; padding: 4px 0; border-radius: 6px; outline: ${f === i ? '1px solid rgba(111,147,184,.55)' : '1px solid transparent'}; outline-offset: 3px; transition: outline-color .4s ease">
        <span style="font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: ${f === i ? '#EEF2F7' : '#B8C6D6'}; display: inline-flex; align-items: center; gap: 8px">${d.name}${f === i ? '<span style="font-size: 10px; color: #0E1C2B; background: #6F93B8; border-radius: 3px; padding: 1px 5px">LEAN</span>' : ''}</span>
        ${Array.from({ length: 12 }, (_, k) => `<span class="cellin" style="height: 34px; border-radius: 3px; background: ${WC[i]}; opacity: ${Math.min(1, (0.28 + k * 0.055) * (f === null ? 1 : f === i ? 1.25 : 0.8)).toFixed(2)}; animation-delay: ${(k * 0.06 + i * 0.04).toFixed(2)}s; transition: opacity .5s ease"></span>`).join('')}</div>`;
    const band = (span, text, on, br) => `<span style="grid-column: span ${span}; border-top: 2px solid ${br ? '#B4703F' : on ? '#6F93B8' : '#2A3A50'}; padding-top: 8px; text-align: center; font-size: 11px; font-weight: 600; letter-spacing: .1em; color: ${br ? '#D6BF8F' : on ? '#A9C0D9' : '#B8C6D6'}">${text}</span>`;
    return `<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px">
        <div style="display: flex; flex-direction: column; gap: 8px; max-width: 680px">
          <span class="eb" style="color: #A9C0D9">How twelve weeks run · your version</span>
          <h2 class="sf" style="font-size: clamp(28px, 3.4vw, 40px); line-height: 1.1; color: #EEF2F7">All four, every week. <span class="sfi" style="color: #A9C0D9">${f === null ? 'Leaning where you need it.' : 'Leaning on ' + D[f].name.toLowerCase() + '.'}</span></h2>
          <p style="color: #B8C6D6; font-size: 15px; line-height: 1.7">Not a module on mindset, then a module on sales. Every week works all four and leans on the one you are thinnest in.</p>
        </div>
        <div class="no-print" style="display: flex; flex-direction: column; gap: 6px">
          <span style="font-size: 11px; letter-spacing: .14em; color: #B8C6D6" id="lean-h">PREVIEW A DIFFERENT LEAN</span>
          <div style="display: flex; gap: 6px; flex-wrap: wrap" role="group" aria-labelledby="lean-h">${D.map((d, i) => `<button type="button" data-act="lean" data-i="${i}" data-f="lean-${i}" aria-pressed="${f === i}" style="min-height: 40px; padding: 0 12px; border-radius: 4px; border: 1px solid ${f === i ? '#6F93B8' : '#2A3A50'}; background: ${f === i ? 'rgba(111,147,184,.18)' : 'transparent'}; color: #EEF2F7; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px"><span style="width: 9px; height: 9px; border-radius: 2px; background: ${WC[i]}"></span>${d.name}</button>`).join('')}</div>
        </div>
      </div>
      <div style="overflow-x: auto" role="img" aria-label="Twelve weeks across, the four domains down. Every week works all four${f === null ? '' : ', with more weight on ' + D[f].name}.">
        <div style="min-width: 760px; display: flex; flex-direction: column; gap: 8px">
          <div style="display: grid; grid-template-columns: 170px repeat(12, minmax(0, 1fr)); gap: 6px; align-items: end"><span></span>
            ${Array.from({ length: 12 }, (_, k) => `<span style="text-align: center; font-size: 12px; font-weight: 600; color: ${k < 3 ? '#A9C0D9' : '#8A7A5E'}; display: flex; flex-direction: column; align-items: center; gap: 4px">${k + 1}${k === 0 ? '<span class="pinp" style="width: 8px; height: 8px; border-radius: 50%; background: #6F93B8"></span>' : ''}</span>`).join('')}</div>
          ${D.map(row).join('')}
          <div style="display: grid; grid-template-columns: 170px repeat(12, minmax(0, 1fr)); gap: 6px; margin-top: 8px"><span></span>
            ${band(3, 'FOUNDER LAUNCHPAD · FREE', true)}${band(2, 'BOOK THE BOARDROOM · UNLOCKS 04–05', false, true)}${band(4, 'PERSONAL LEADERSHIP LAB · $97 · 2 SESSIONS')}${band(3, 'BUSINESS HUB · $397 · 3 SESSIONS IN TOTAL')}</div>
        </div>
      </div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px; border-top: 1px solid #3A2F20; padding-top: 16px">
        <p style="flex: 1 1 360px; font-size: 14px; color: #B8C6D6; line-height: 1.7">Every column is one week, and every week works all four. The weight shifts toward ${f === null ? 'the domain that needs you most' : D[f].name}. The coverage never drops. You are at week 1. The Summit ($1,989): the whole incubator, with Alexandru every week.</p>
        <a href="/ground-plan/#home" class="go no-print" style="display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 20px; border-radius: 4px; background: #6F93B8; color: #0E1C2B; font-weight: 600; text-decoration: none">Start week 1 free · The Founder Launchpad <span class="arr" aria-hidden="true">→</span></a>
      </div>`;
  }

  const STOPS = [
    { n: '1', short: 'Founder Launchpad', unlock: 'Free. Modules 01–03 open the moment you sign up.', name: 'The Founder Launchpad', tag: 'Step 1 · start here', line: 'Know yourself before you build.', modules: '01–03', sessions: '—', price: 'Free', cta: 'Start free', href: '/ground-plan/', x: 150, y: 360, lx: 136, ly: 364, anchor: 'end' },
    { n: '2', short: 'The Boardroom', unlock: 'Book one session with Alexandru. It unlocks modules 04–05 and the full North Star.', name: 'The Boardroom', tag: 'Step 2 · you and Alexandru', line: 'Sit at the table with Alexandru.', modules: '04–05', sessions: '1 session', price: '[YOUR PRICE]', cta: 'Book the Boardroom · unlock 04–05', href: BOOKING, ext: true, x: 290, y: 300, lx: 306, ly: 304, anchor: 'start' },
    { n: '3', short: 'Leadership LAB', unlock: 'Joining unlocks modules 06–09.', name: 'The Personal Leadership LAB', tag: 'Step 3', line: 'Lead yourself first.', modules: '06–09', sessions: '2 sessions', price: '$97', cta: 'Join the LAB', href: LAB_URL, ext: true, x: 175, y: 235, lx: 161, ly: 239, anchor: 'end' },
    { n: '4', short: 'Business HUB', unlock: 'Joining unlocks modules 10–12.', name: 'The Business HUB', tag: 'Step 4', line: 'Build the business that carries it.', modules: '10–12', sessions: '3 in total (incl. 1 from the LAB)', price: '$397', cta: 'Join the HUB', href: HUB_URL, ext: true, x: 285, y: 160, lx: 301, ly: 164, anchor: 'start' },
    { n: '5', short: 'The Summit', unlock: 'Every module, with Alexandru every week.', name: 'The Summit', tag: 'The top', line: 'The whole incubator, with Alexandru every week.', modules: 'All', sessions: 'Every week', price: '$1,989', cta: 'Talk about The Summit', href: '/northstar/summit', x: 230, y: 58, lx: 258, ly: 62, anchor: 'start' },
  ];
  function pClimb() {
    const si = S.stop, sv = STOPS[si];
    return `<div style="display: flex; flex-direction: column; gap: 8px; max-width: 720px">
        <span class="eb" style="color: #A9C0D9">Link to Lead · the incubator</span>
        <h2 class="sf" style="font-size: clamp(28px, 3.4vw, 40px); line-height: 1.1; color: #EEF2F7">Your climb. <span class="sfi" style="color: #A9C0D9">One step at a time.</span></h2>
        <p style="color: #B8C6D6; font-size: 15px; line-height: 1.7">Tap a stop on the trail to see what opens there.</p></div>
      <div style="display: flex; flex-wrap: wrap; gap: 26px; align-items: center">
        <svg viewBox="0 0 460 420" style="flex: 1 1 340px; max-width: 520px; height: auto" role="img" aria-label="A mountain trail from The Founder Launchpad at the bottom to The Summit at the top">
          <circle cx="60" cy="60" r="1.5" fill="#A9C0D9" opacity=".7"/><circle cx="400" cy="90" r="1.2" fill="#A9C0D9" opacity=".6"/><circle cx="350" cy="40" r="1" fill="#EEF2F7" opacity=".5"/><circle cx="110" cy="130" r="1" fill="#EEF2F7" opacity=".4"/>
          <polygon points="20,395 230,40 440,395" fill="rgba(111,147,184,.08)" stroke="#8A7A5E" stroke-width="1.2"/>
          <polyline points="140,395 230,40 320,395" fill="none" stroke="#2A3A50" stroke-width="1"/>
          <polyline points="200,96 230,40 262,96" fill="none" stroke="#EEF2F7" stroke-width="1.6" opacity=".6"/>
          <polyline class="trail" points="190,395 150,360 290,300 175,235 285,160 230,58" fill="none" stroke="#6F93B8" stroke-width="2.2" stroke-dasharray="6 6" stroke-linecap="round"/>
          <g class="flagw"><path d="M230 58V26" stroke="#EEF2F7" stroke-width="1.6"/><path d="M230 27h20l-6 6 6 6h-20z" fill="#6F93B8"/></g>
          ${STOPS.map((t, i) => `<g>${i === si ? `<circle class="halo" cx="${t.x}" cy="${t.y}" r="20" fill="none" stroke="#D6BF8F" stroke-width="1.5"/>` : ''}
            <circle class="stopc" cx="${t.x}" cy="${t.y}" r="${i === si ? 11 : 8}" fill="${i === si ? '#B4703F' : i === 4 ? '#A9C0D9' : '#0E1C2B'}" stroke="${i === si ? '#F6EEDD' : '#EEF2F7'}" stroke-width="1.5" style="animation-delay: ${(0.2 + i * 0.15).toFixed(2)}s"/>
            <text x="${t.lx}" y="${t.ly}" text-anchor="${t.anchor}" fill="${i === si ? '#D6BF8F' : '#B8C6D6'}" font-family="Inter" font-weight="600" font-size="12.5">${t.short}</text>${i === 1 ? `<g transform="translate(${t.lx + 101} ${t.ly - 11})" aria-hidden="true"><rect x="1" y="5" width="10" height="8" rx="1.5" fill="#B4703F"/><path d="M3.5 5V3.5a2.5 2.5 0 0 1 5 0" fill="none" stroke="#D6BF8F" stroke-width="1.3"/></g>` : ''}</g>`).join('')}
        </svg>
        <div style="flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 10px">
          <div class="no-print" style="display: flex; flex-wrap: wrap; gap: 6px" role="group" aria-label="Stops on the climb">${STOPS.map((t, i) => `<button type="button" data-act="stop" data-i="${i}" data-f="stop-${i}" aria-pressed="${i === si}" style="min-height: 40px; padding: 0 12px; border-radius: 4px; border: 1px solid ${i === si ? '#D6BF8F' : '#2A3A50'}; background: ${i === si ? 'linear-gradient(120deg,#2B1B12,#1C1309)' : 'transparent'}; color: ${i === si ? '#F6EEDD' : '#EEF2F7'}; font-size: 12px; font-weight: 600; cursor: pointer">${t.n} · ${t.short}${i === 1 ? ' <span aria-hidden="true" style="color: #D6BF8F">· unlocks 04–05</span>' : ''}</button>`).join('')}</div>
          <div class="pop" style="background: linear-gradient(120deg, rgba(43,27,18,.85), rgba(28,19,9,.85)); border: 1px solid rgba(214,191,143,.5); border-radius: 9px; padding: 20px; display: flex; flex-direction: column; gap: 10px" aria-live="polite">
            <span class="eb" style="color: #D6BF8F">${sv.tag}</span>
            <span class="sf" style="font-size: 28px; color: #EEF2F7; line-height: 1.15">${sv.name}</span>
            <span class="sfi" style="font-size: 18px; color: #D6BF8F; line-height: 1.35">${sv.line}</span>
            <div style="display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 6px; background: ${si === 1 ? 'rgba(214,191,143,.16)' : 'rgba(214,191,143,.07)'}; border: 1px solid ${si === 1 ? '#D6BF8F' : 'rgba(214,191,143,.3)'}"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; margin-top: 2px" fill="none" stroke="#D6BF8F" stroke-width="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="${si === 0 || si === 4 ? 'M8 11V8a4 4 0 0 1 7.5-2' : 'M8 11V8a4 4 0 0 1 8 0v3'}"/></svg><span style="font-size: 14.5px; font-weight: ${si === 1 ? 600 : 500}; color: #F6EEDD; line-height: 1.5">${sv.unlock}</span></div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-top: 4px">
              ${[['MODULES', sv.modules], ['WITH ALEXANDRU', sv.sessions], ['PRICE', sv.price]].map(([k, v]) => `<div style="border: 1px solid rgba(214,191,143,.28); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 11px; color: #CDBB97; letter-spacing: .1em">${k}</span><span style="font-weight: 600; color: #EEF2F7">${v}</span></div>`).join('')}
            </div>
            <a href="${sv.href}" class="go no-print"${sv.ext ? ' target="_blank" rel="noopener"' : ''} style="align-self: flex-start; margin-top: 6px; display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 18px; border-radius: 4px; background: #D6BF8F; color: #1C1309; font-weight: 600; text-decoration: none">${sv.cta} <span class="arr" aria-hidden="true">${sv.ext ? '↗' : '→'}</span></a>
          </div>
        </div>
      </div>`;
  }

  /* ── The What-if lab v2 ──────────────────────────────────────────────────
   * Four levers on the left, each in one row with the answer it moves most on
   * the right. The answers are read-only sliders that glide to their new value.
   * The lab runs only on the founder's own Step 03 numbers; until they are
   * there it shows itself locked and says which boxes to fill. */
  const PAIRS = [
    { k: 'p', name: 'Raise your price', icon: 'M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5s2 2.8 5 3.5 5 1.7 5 3.8-2.2 3.2-5 3.2-5-1.2-5-3.2',
      out: { k: 'cash', name: 'Cash · left each month', d: 2 } },
    { k: 'm', name: 'Make your message clearer', icon: 'M4 5h16v10H9l-5 4z',
      out: { k: 'clients', name: 'Clients · each month', plan: 'Customers · each month', d: 3 } },
    { k: 'f', name: 'Each sale takes fewer hours', icon: 'M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5l3 2M9 2h6',
      out: { k: 'time', name: 'Time · your hours a month', d: 0, lower: true } },
    { k: 'd', name: 'Someone else does part of the work', icon: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M13 20c0-2.4 1.8-4.4 4-4.9 2.6.3 5 2.2 5 4.9',
      out: { k: 'people', name: 'People · help you can afford', d: 1 } },
  ];
  const WHATIF_IDS = ['price', 'message', 'hours', 'handover'];
  const labMode = () => (S.lab.mode === 'money' ? 'money' : 'time');
  const NUMW = ['no', 'this', 'these two', 'these three', 'these four'];

  /** Everything the lab shows, from the state. */
  function labCalc() {
    const b = E.labBase(S);
    if (!b.ready) {
      const names = Object.fromEntries(E.fieldsFor(S.mode).map(([k, l]) => [k, l]));
      return { locked: true, b, need: (b.need || []).map((k) => ({ k, label: names[k] })), planned: !!b.planned };
    }
    const mode = labMode(), t = E.month(b, {}, mode), s = E.month(b, S.lab, mode);
    const scale = {
      cash: t.cash > 0 ? t.cash * 4 : Math.max(b.sales * 0.5, 1),
      clients: t.clients ? t.clients * 3 : 1,
      time: Math.max(t.mine, b.limit || 0) * 1.5 || 1,
    };
    scale.people = b.hire ? Math.max(4, Math.ceil(scale.cash / b.hire)) : 4;
    const vals = { cash: [s.cash, t.cash], clients: [s.clients, t.clients], time: [s.mine, t.mine], people: [s.people, t.people] };
    const better = (o) => { const [v, w] = vals[o.k]; if (v === null || w === null) return false; return o.lower ? v < w - 0.5 : o.k === 'people' ? v > w + 0.05 : v > w + (o.k === 'cash' ? 1 : 0.05); };
    const worse = (o) => { const [v, w] = vals[o.k]; if (v === null || w === null) return false; return o.lower ? v > w + 0.5 : v < w - (o.k === 'cash' ? 1 : 0.05); };
    const improved = PAIRS.map((x) => better(x.out));
    return { locked: false, b, mode, t, s, scale, vals, improved, worsened: PAIRS.map((x) => worse(x.out)), count: improved.filter(Boolean).length };
  }

  /** The parts of the lab that only change with its shape (locked or not, the
   *  plan box, Fine-tune). Values are set by updateLab, so the answers glide. */
  function pLabIn() {
    const L = labCalc(), plan = S.mode !== 'yes', cur = S.profile.currency;
    const input = (key, label, hint) => `<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: #EEF2F7">${label}
        <input class="inp" type="text" inputmode="decimal" data-lab="${key}" data-f="lab-${key}" value="${esc(S.lab[key])}" placeholder="${hint}" style="background: #121E2D; color: #EEF2F7; border-color: #2A3A50"></label>`;
    const missing = L.locked ? L.need : [];
    const chips = [...missing.map((x) => x.label), ...(L.locked && L.planned ? ['Customers a month you plan for (below)'] : [])];
    const lock = L.locked ? `<div class="wlock" role="status">
        <div class="wlock-msg">
          <strong>See your real situation, from left to right.</strong>
          <span>Fill ${NUMW[Math.min(4, chips.length)]} ${chips.length === 1 ? 'box' : 'boxes'} ${missing.length ? 'in Step 03 · Count what matters' : 'below'}. A range is enough. Then come back and every slider moves on your own month.</span>
          <div class="wchips">${chips.map((c) => `<span class="wchip"><i aria-hidden="true"></i>${esc(c)}</span>`).join('')}</div>
        </div>
        ${missing.length ? '<button type="button" class="go" data-act="lab-take" data-f="lab-take" style="min-height: 48px; padding: 0 20px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 600; font-size: 15px; cursor: pointer">Take me there ↑</button>' : ''}
      </div>` : '';
    const dis = L.locked ? ' disabled' : '';
    const rows = PAIRS.map((x) => `<div class="wpair">
        <div class="wcard">
          <div class="wrow"><label for="w-${x.k}" class="wname"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex: none"><path d="${x.icon}" fill="none" stroke="#6F93B8" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>${x.name}</label><span class="wbig" id="lv-val-${x.k}">—</span></div>
          <input id="w-${x.k}" type="range" min="0" max="${E.LEVER_RANGE[x.k]}" step="5" value="${L.locked ? 0 : S.lab[x.k] || 0}" data-lever="${x.k}" data-f="w-${x.k}"${dis}>
          <span class="wnote" id="lv-note-${x.k}"></span>
        </div>
        <div class="warrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="wcard" role="meter" id="out-${x.out.k}" aria-labelledby="out-name-${x.out.k}" aria-valuemin="0">
          <span class="wdom" style="color: ${LIGHT[x.out.d]}">${D[x.out.d].name}</span>
          <div class="wrow"><span class="wname" id="out-name-${x.out.k}">${plan && x.out.plan ? x.out.plan : x.out.name}</span><span class="wbig" id="out-val-${x.out.k}">—</span></div>
          <div class="wtrack"><div class="wfill" id="fill-${x.out.k}"></div><div class="wtoday" id="today-${x.out.k}"><span>today</span></div>${x.out.k === 'time' ? '<div class="wlimit" id="limit-time" hidden><span>your limit</span></div>' : ''}<div class="wthumb" id="thumb-${x.out.k}"></div></div>
          <span class="wnote" id="out-note-${x.out.k}"></span>
        </div></div>`).join('');
    return `${lock}
      ${plan ? `<div style="max-width: 320px">${input('plan', 'Customers a month you plan for', 'Your plan, a number')}</div>` : ''}
      <div class="wswitch" role="group" aria-label="What should the gain go to?">
        <button type="button" data-act="lab-mode" data-v="time" data-f="lab-mode-time"${dis}>Give me back time</button>
        <button type="button" data-act="lab-mode" data-v="money" data-f="lab-mode-money"${dis}>Give me more money</button>
      </div>
      <div class="wlab${L.locked ? ' locked' : ''}">
        <div class="wheads" aria-hidden="true"><span>You move</span><span></span><span>Moves by itself</span></div>
        <div class="wrows">${rows}</div>
      </div>
      <details class="wfine" data-fine${UI.fine ? ' open' : ''}><summary>Fine-tune (optional)</summary>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding-top: 12px">
          ${input('rate', `Helper rate per hour (${cur})`, 'What you would pay')}
          ${input('hire', `Monthly cost of one more person (${cur})`, 'Your estimate')}
        </div>
      </details>`;
  }

  /* The answers count to their new value; with reduced motion they jump. */
  const shown = {};
  function tween(k, to, fmt) {
    const el = document.getElementById('out-val-' + k);
    if (!el) return;
    if (to === null) { el.textContent = '—'; delete shown[k]; return; }
    const from = shown[k] ?? to, t0 = performance.now(), dur = reduced() ? 0 : 500;
    shown[k] = to;
    cancelAnimationFrame(tween[k]);
    const step = (now) => { const a = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - a, 3); el.textContent = fmt(from + (to - from) * e); if (a < 1) tween[k] = requestAnimationFrame(step); };
    tween[k] = requestAnimationFrame(step);
  }
  function hubSVG(improved) {
    const NP = [['Cash', 160, 23, 160, 12, 'middle'], ['Clients', 222, 85, 244, 89, 'start'], ['Time', 160, 147, 160, 168, 'middle'], ['People', 98, 85, 76, 89, 'end']];
    const all = improved.filter(Boolean).length;
    return `<circle cx="160" cy="85" r="62" fill="none" stroke="${all >= 3 ? '#6F93B8' : '#3A2F20'}" stroke-width="2" stroke-dasharray="4 5"/>
      <circle cx="160" cy="85" r="22" fill="#0E1C2B" stroke="#6F93B8" stroke-width="1.5"/><text x="160" y="90" text-anchor="middle" fill="#EEF2F7" font-family="Newsreader, Georgia, serif" font-size="13">You</text>
      ${NP.map((n, i) => `<line x1="160" y1="85" x2="${n[1]}" y2="${n[2]}" stroke="#3A2F20" stroke-width="1"/><circle class="node" cx="${n[1]}" cy="${n[2]}" r="14" fill="${improved[i] ? '#6F93B8' : '#0E1C2B'}" stroke="#6F93B8" stroke-width="1.5"/><text x="${n[3]}" y="${n[4]}" text-anchor="${n[5]}" fill="#EEF2F7" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="600">${n[0]}</text>`).join('')}`;
  }

  /** Set every value in the lab without redrawing it, so handles glide. */
  function updateLab() {
    const L = labCalc(), set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const hub = $('#lab-hub'), hk = L.locked ? 'x' : L.improved.join();
    if (hub && hub.dataset.k !== hk) { hub.innerHTML = hubSVG(L.locked ? [false, false, false, false] : L.improved); hub.dataset.k = hk; }
    document.querySelectorAll('[data-act="lab-mode"]').forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.v === labMode())));
    const head = $('#lab-head');
    if (L.locked) {
      for (const x of PAIRS) {
        set('lv-val-' + x.k, '—'); set('lv-note-' + x.k, 'Opens when Step 03 is filled.');
        tween(x.out.k, null); set('out-note-' + x.out.k, 'Waiting for your numbers.');
        const f = document.getElementById('fill-' + x.out.k), th = document.getElementById('thumb-' + x.out.k), td = document.getElementById('today-' + x.out.k);
        if (f) { f.style.width = '0%'; f.style.background = '#8A7A5E'; }
        if (th) { th.style.left = '50%'; th.style.color = '#8A7A5E'; }
        if (td) td.style.left = '50%';
      }
      if (head) head.textContent = 'Fill the boxes above and this lab runs on your own month.';
      return;
    }
    const { b, s, t, scale, vals, mode } = L, plan = S.mode !== 'yes', { p = 0, m = 0, f = 0, d = 0 } = S.lab;
    const ab = (v) => (b.est || Math.abs(v - Math.round(v)) > 0.05 ? 'about ' : '');
    set('lv-val-p', '+' + p + '%'); set('lv-val-m', '+' + m + '%'); set('lv-val-f', '−' + f + '%'); set('lv-val-d', d + '%');
    set('lv-note-p', plan ? `Each customer: ${money(b.sales / b.clients)} → ${money(b.sales / b.clients * (1 + p / 100))}` : `Your sales for the same work: ${money(b.sales)} → ${money(b.sales * (1 + p / 100))}`);
    set('lv-note-m', b.clients ? `Ready to buy: ${whole(b.clients)} → ${ab(b.clients * s.demand)}${whole(b.clients * s.demand)} a month, same marketing spend` : `${m ? '+' + m + '% more people say yes' : 'As many say yes as today'}, for the same marketing spend`);
    set('lv-note-f', plan ? `Hours to serve one customer: ${Math.round(b.hours / b.clients * 10) / 10} h → ${Math.round(b.hours / b.clients * (1 - f / 100) * 10) / 10} h` : `Hours for today's work: ${whole(b.hours)} h → ${ab(b.hours * (1 - f / 100))}${whole(b.hours * (1 - f / 100))} h`);
    set('lv-note-d', !d ? 'You do all the work yourself.' : b.rate !== null ? `${d}% of delivery hours go to a helper at ${money(b.rate)} an hour.` : `${d}% of delivery hours go to a helper. Set the rate in Fine-tune.`);

    PAIRS.forEach((x, i) => {
      const o = x.out, [v, w] = vals[o.k], max = scale[o.k];
      const pct = (y) => Math.max(0, Math.min(100, y / max * 100));
      const good = L.improved[i], bad = L.worsened[i], col = good ? '#9BC0A1' : bad ? '#E0A282' : null;
      const fl = document.getElementById('fill-' + o.k), th = document.getElementById('thumb-' + o.k), td = document.getElementById('today-' + o.k), card = document.getElementById('out-' + o.k);
      if (fl) { fl.style.width = (v === null ? 0 : pct(v)) + '%'; fl.style.background = col || '#8A7A5E'; }
      if (th) { th.style.left = (v === null ? 50 : pct(v)) + '%'; th.style.color = col || '#EEF2F7'; }
      if (td) { td.style.left = (w === null ? 50 : pct(w)) + '%'; td.hidden = w === null; }
      if (card) { card.setAttribute('aria-valuemax', String(Math.round(max))); if (v !== null) card.setAttribute('aria-valuenow', String(Math.round(v))); }
    });
    const lim = document.getElementById('limit-time');
    if (lim) { lim.hidden = !b.limit; if (b.limit) lim.style.left = Math.min(100, b.limit / scale.time * 100) + '%'; }
    tween('cash', s.cash, money); tween('clients', s.clients, whole); tween('time', s.mine, (y) => whole(y) + ' h'); tween('people', s.people, (y) => (Math.round(y * 10) / 10).toFixed(1));

    const dc = s.cash === null ? null : s.cash - t.cash;
    set('out-note-cash', s.cash === null ? 'Set a helper rate in Fine-tune to see what the help costs.' : Math.abs(dc) < 1 ? 'Same money as today.' : `${signed(dc)} a month compared with today.`);
    set('out-note-clients', s.clients === null ? 'Add your new paying customers in Step 03 to see this.'
      : s.clients < s.clientsWanted - 0.05 ? `You serve ${ab(s.clients)}${whole(s.clients)}. ${whole(s.clientsWanted)} want you, so you can choose the best fit.`
      : s.clients > t.clients + 0.05 ? `+${whole(s.clients - t.clients)} a month compared with today.` : 'Same as today.');
    const back = t.mine - s.mine;
    set('out-note-time', b.limit ? (s.mine > b.limit ? `${whole(s.mine - b.limit)} hours beyond the ${whole(b.limit)} you chose.` : `Within the ${whole(b.limit)} hours you chose.${back > 0.5 ? ` ${whole(back)} hours a month back.` : ''}`)
      : `${back > 0.5 ? whole(back) + ' hours a month back.' : back < -0.5 ? whole(-back) + ' more hours a month.' : 'Same hours as today.'} Add the hours you want to work in Step 03 to see your limit.`);
    set('out-note-people', s.people === null ? (b.hire === null ? 'Set the monthly cost of one more person in Fine-tune to see this.' : 'Set a helper rate in Fine-tune first.')
      : s.people >= 0.1 ? `About ${(Math.round(s.people * 10) / 10).toFixed(1)} people at ${money(b.hire)} a month each.` : 'No room to pay for help yet.');

    let v;
    if (!p && !m && !f && !d) v = `Today: ${whole(t.mine)} hours a month${b.limit ? (t.mine > b.limit ? `, beyond the ${whole(b.limit)} you chose` : `, within the ${whole(b.limit)} you chose`) : ''}. Move one lever and watch the four answer.`;
    else if (b.limit && s.mine > b.limit) v = 'Still beyond your limit. Try a fairer price, fewer hours for each sale, or hand part of the work to someone else.';
    else if (L.count >= 3) v = 'This is leadership: one change, and most of the four answer at once.';
    else if (mode === 'time' && s.mine < t.mine - 0.5 && dc !== null && dc > -1) v = 'Same money, fewer hours. Your price decides how much of your life the business needs.';
    else if (mode === 'money' && dc !== null && dc > 1) v = 'More money for the same work. Now ask what that money is for.';
    else v = 'Good. Now try a second lever and see which answer moves next.';
    if (head) head.textContent = v;
  }

  function pLabDeep() {
    const L = labCalc();
    if (L.locked) return '';
    const { p = 0, m = 0, f = 0, d = 0 } = S.lab, dom = E.strongestLever(p, m, f, d);
    if (dom < 0) return '';
    const { b, s, t } = L, LV = E.LEVERS[dom], plan = S.mode !== 'yes', lim = b.limit;
    const delta = s.cash === null ? null : s.cash - t.cash;
    const fmtS = (x) => (x > 0 ? '+' : x < 0 ? '−' : '') + whole(Math.abs(x));
    const chain = [
      ['Cash, each month', delta === null ? '?' : delta >= 0 ? '↑' : '↓', delta === null ? 'set a helper rate' : signed(delta), delta === null || delta >= 0 ? '#9BC0A1' : '#E0A282'],
      [plan ? 'Customers, each month' : 'Clients, each month', s.clients !== null && s.clients > t.clients + 0.05 ? '↑' : s.clients !== null && s.clients < t.clients - 0.05 ? '↓' : '→', s.clients === null ? '—' : fmtS(s.clients - t.clients), s.clients !== null && s.clients > t.clients ? '#9BC0A1' : '#B8C6D6'],
      ['Your hours, each month', s.mine < t.mine - 0.5 ? '↓' : s.mine > t.mine + 0.5 ? '↑' : '→', fmtS(s.mine - t.mine) + ' h', s.mine <= t.mine + 0.5 ? '#9BC0A1' : lim && s.mine > lim ? '#E0A282' : '#DDBD69'],
      ['People you could afford', s.people ? '↑' : '→', s.people === null ? '—' : (Math.round(s.people * 10) / 10).toFixed(1), s.people ? '#9BC0A1' : '#B8C6D6'],
    ];
    const meaning = [
      labMode() === 'time' ? 'A fairer price keeps your money with fewer hours. That is the quietest lever you have.' : 'A fairer price gives you money without taking more of your life.',
      lim && s.mine > lim ? 'Clarity brings people in. Without help, they arrive faster than you can serve them.' : 'More people understand you, so more say yes. Your market starts to work for you.',
      'Each sale asks less of you. Those hours are yours to choose: rest, better work, or more customers.',
      delta === null ? 'You buy back your time. Set a helper rate to see what the trade costs.' : delta >= 0 ? 'You buy back your time and the business still grows. This is where leading starts.' : 'You buy back your time, and it costs money at first. Decide whether that trade is worth it to you.',
    ][dom];
    const g = E.GOALS.find((x) => x[0] === S.want);
    const goalLine = g ? 'Your goal, ' + g[1].toLowerCase() + ': ' + (E.goalHelped(g[0], t, s, d) ? 'this change moves you toward it.' : 'this change alone does not get you there. Try another lever with it.') : '';
    return `<div class="pop" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px">
      <div style="background: rgba(247,242,231,.05); border: 1px solid #3A2F20; border-radius: 9px; padding: 18px; display: flex; flex-direction: column; gap: 10px">
        <span class="eb" style="color: #A9C0D9">The chain reaction</span>
        <span style="display: inline-flex; align-self: flex-start; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 16px; background: #6F93B8; color: #0E1C2B; font-weight: 600; font-size: 13px">${LV.name}</span>
        ${chain.map(([nm, ar, v, col], k) => `<div class="itemin" style="display: flex; align-items: center; gap: 10px; font-size: 14px; animation-delay: ${(0.1 + k * 0.15).toFixed(2)}s"><svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true"><path d="M1 7h16M13 2l5 5-5 5" fill="none" stroke="#8A7A5E" stroke-width="1.6" stroke-linecap="round"/></svg><span style="flex: 1; color: #EEF2F7">${nm}</span><span style="font-weight: 600; color: ${col}">${ar} ${esc(v)}</span></div>`).join('')}
      </div>
      <div style="background: rgba(247,242,231,.05); border: 1px solid #3A2F20; border-radius: 9px; padding: 18px; display: flex; flex-direction: column; gap: 10px">
        <span class="eb" style="color: #A9C0D9">What this means for you</span>
        <span class="sf" style="font-size: 20px; line-height: 1.3; color: #EEF2F7">${meaning}</span>
        ${goalLine ? `<span style="font-size: 14px; color: #A9C0D9">${goalLine}</span>` : ''}
        <div style="display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: #B8C6D6; border-top: 1px solid #3A2F20; padding-top: 10px"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; margin-top: 2px"><path d="M12 3l9 16H3z" fill="none" stroke="#DDBD69" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4M12 16.5v.5" stroke="#DDBD69" stroke-width="2" stroke-linecap="round"/></svg><span><b style="color: #EEF2F7">Watch out:</b> ${LV.watch}</span></div>
        <div style="display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: #B8C6D6"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; margin-top: 2px"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#9BC0A1" stroke-width="2.2" stroke-linecap="round"/></svg><span><b style="color: #EEF2F7">First step this week:</b> ${LV.first}</span></div>
      </div>
      <div style="border: 1px solid #6F93B8; border-radius: 9px; padding: 18px; display: flex; flex-direction: column; gap: 10px; background: rgba(111,147,184,.08)">
        ${planBlock(LV.steps, UI.plans && UI.plans.whatif && UI.plans.whatif.id === WHATIF_IDS[dom] ? UI.plans.whatif.steps : null, 'Your plan for this change', 'Open my step-by-step plan')}
      </div></div>`;
  }
  function labFoot() {
    const b = E.labBase(S);
    const parts = [];
    if (b.ready) parts.push(b.plan ? 'Built from your offer in Step 03 and the customers a month you plan for.' : 'Built from your month in Step 03.');
    if (b.ready && b.est) parts.push('Some of it comes from ranges, so read every figure as “about”.');
    if (b.ready && b.acqMissing) parts.push('Spending to win customers was not entered, so it counts as nothing here.');
    parts.push(labMode() === 'time' ? '“Give me back time” serves only the work needed to keep today’s money.' : '“Give me more money” serves everyone who wants to buy.');
    parts.push('A higher price may change demand, and help costs money before it saves time. Check both before acting.');
    return parts.join(' ');
  }

  /** "Take me there": up to Step 03, the right group open, the missing boxes
   *  glowing for about four seconds. */
  function takeToNumbers() {
    const L = labCalc();
    if (!L.locked || !L.need.length) return;
    const G = E.groupsFor(S.mode), first = L.need[0].k;
    const gi = G.findIndex((g) => g.fields.some(([k]) => k === first));
    if (gi >= 0) S.group = gi;
    UI.glow = { keys: L.need.map((x) => S.mode + '.' + x.k), until: Date.now() + 4000 };
    save(); UI.page = 'numbers'; render();
    requestAnimationFrame(() => {
      const el = document.querySelector('.glowbox') || document.getElementById('s-numbers');
      if (!el) return;
      // Below the sticky launchpad banner, with the box's label in view.
      const bar = document.getElementById('banner'), top = el.getBoundingClientRect().top + window.scrollY - (bar ? bar.offsetHeight : 0) - 60;
      window.scrollTo({ top: Math.max(0, top), behavior: reduced() ? 'auto' : 'smooth' });
      el.focus({ preventScroll: true });
    });
    clearTimeout(takeToNumbers.t); takeToNumbers.t = setTimeout(() => { UI.glow = null; render(); }, 4100);
  }

  const pMbar = (c) => `${emblem(c.pc.per, 40, { small: true })}
    <span style="flex: 1; font-size: 12px; color: #B8C6D6; line-height: 1.3"><b style="color: #EEF2F7">${c.pc.total}/16</b> pieces in place</span>
    <button type="button" data-act="print" data-f="m-print" aria-label="Print or save as PDF" style="width: 44px; height: 44px; border-radius: 50%; border: 1px solid #2A3A50; background: transparent; color: #EEF2F7; cursor: pointer; display: inline-flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M6 14h12v7H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></button>
    <button type="button" data-act="email" data-f="m-email" style="min-height: 44px; padding: 0 14px; border-radius: 22px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 600; cursor: pointer">Email me</button>`;

  const INDUSTRIES = ['Coaching & consulting', 'Creative & design', 'E-commerce & retail', 'Food & hospitality', 'Health & wellness', 'Beauty & personal care', 'Education & training', 'Professional services', 'Trades & construction', 'Technology & software', 'Real estate', 'Manufacturing', 'Nonprofit & social impact', 'Other'];
  const industrySelect = (id, extra = '') => `<select class="inp" id="${id}" ${extra}><option value="">Choose your industry…</option>${INDUSTRIES.map((x) => `<option${S.profile.industry === x ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`;
  function pGate() {
    if (!UI.gate) return '';
    const P = S.profile, lab = 'display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600';
    if (UI.signinFor === 'plans') return `<div style="position: fixed; inset: 0; z-index: 50; background: rgba(16,13,9,.6); display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto">
      <form class="card pop" id="signin-form" role="dialog" aria-modal="true" aria-labelledby="si-h" novalidate style="position: relative; width: 100%; max-width: 440px; padding: 26px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 30px 70px rgba(0,0,0,.35); margin: auto">
        <button type="button" data-act="si-x" data-f="si-x" aria-label="Close" style="position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); background: var(--paper); color: var(--ink); cursor: pointer">×</button>
        <h2 id="si-h" class="sf" style="font-size: 24px; font-weight: 500; padding-right: 44px">Sign in to open your plans</h2>
        <span id="si-line" style="font-size: 14px; color: var(--muted)">${SIGNIN_LINE}</span>
        <label style="${lab}">Email<input class="inp" id="g-email" type="email" autocomplete="email" value="${esc(P.email)}"></label>
        ${pSignin('gate')}
      </form></div>`;
    return `<div style="position: fixed; inset: 0; z-index: 50; background: rgba(16,13,9,.6); display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto">
      <form class="card pop" id="gate-form" role="dialog" aria-modal="true" aria-labelledby="gate-h" novalidate style="position: relative; width: 100%; max-width: 480px; padding: 26px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 30px 70px rgba(0,0,0,.35); margin: auto">
        <button type="button" data-act="gate-skip" data-f="gate-x" aria-label="Close" style="position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); background: var(--paper); color: var(--ink); cursor: pointer; display: inline-flex; align-items: center; justify-content: center"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        <div style="display: flex; align-items: center; gap: 12px; padding-right: 44px"><svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true" style="flex: none"><circle cx="12" cy="12" r="10" fill="none" stroke="#6F93B8" stroke-width="1.4"/><polygon points="12,4 14,12 12,13.5 10,12" fill="#6F93B8"/></svg><div style="display: flex; flex-direction: column"><span class="eb">Before your first answer</span><span class="sf" style="font-size: 22px" id="gate-h">Who is this North Star for?</span></div></div>
        <span style="font-size: 14px; color: var(--muted)">We keep your answers with your name, so your feedback and your launchpad are yours.</span>
        <div class="gate-two" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
          <label style="${lab}">First name<input class="inp" id="g-first" type="text" autocomplete="given-name" value="${esc(P.first)}" data-f="g-first"></label>
          <label style="${lab}">Surname<input class="inp" id="g-last" type="text" autocomplete="family-name" value="${esc(P.last)}"></label>
        </div>
        <label style="${lab}">Email<input class="inp" id="g-email" type="email" autocomplete="email" value="${esc(P.email)}"></label>
        <label style="display: flex; gap: 10px; align-items: flex-start; font-size: 12px; color: var(--muted)"><input type="checkbox" id="g-consent"${P.consent ? ' checked' : ''} style="width: 18px; height: 18px; margin-top: 1px; accent-color: #6F93B8; flex: none">I agree that ExploraSelf may email me my results and occasional guidance. I can unsubscribe any time.</label>
        <span id="gate-err" role="alert" style="font-size: 13px; color: var(--self); font-weight: 600"></span>
        <button type="submit" data-f="gate-go" style="min-height: 50px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 600; font-size: 15px; cursor: pointer">Start my North Star →</button>
        <button type="button" data-act="gate-skip" data-f="gate-skip" style="min-height: 44px; border-radius: 5px; border: 1px solid var(--line); background: transparent; color: var(--ink); font-weight: 600; cursor: pointer">Skip for now · keep exploring</button>
        ${UI.signinOpen ? `<div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); padding-top: 12px"><span style="font-size: 13px; font-weight: 600">Already have an account? Sign in with the email above.</span>${pSignin('gate')}</div>`
          : '<button type="button" data-act="signin-open" data-f="signin-open" style="border: 0; background: none; padding: 6px 0; color: var(--goldink); font-size: 13px; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; cursor: pointer">Already have an account? Sign in</button>'}
        <span style="font-size: 12px; color: var(--muted); text-align: center">Until you add your email, your answers stay only in this browser. Came from our page? You will not see this box.</span>
      </form></div>`;
  }
  /* Password boxes, each with a show / hide button. */
  const pwInput = (id, label, auto) => `<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600">${label}<span style="display: flex; gap: 6px"><input class="inp" id="${id}" type="password" autocomplete="${auto}" style="flex: 1; min-width: 0"><button type="button" data-act="eye" data-v="${id}" data-f="eye-${id}" aria-label="Show ${label.toLowerCase()}" aria-pressed="false" style="width: 46px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); cursor: pointer"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></button></span></label>`;
  const linkBtn = (where, t) => `<button type="button" data-act="signin-${where}" data-f="signin-${where}-${t.length}" ${UI.signinBusy ? 'disabled' : ''} style="border: 0; background: none; padding: 6px 0; color: var(--goldink); font-size: 13px; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; cursor: pointer">${t}</button>`;
  /** Sign in: email and password; "Forgot your password? Email me a sign-in link" sends a one-time link. */
  const pSignin = (where) => `${pwInput('si-pw-' + where, 'Password', 'current-password')}
    <button type="button" data-act="pw-in" data-v="${where}" data-f="pw-in-${where}" ${UI.signinBusy ? 'disabled' : ''} style="min-height: 46px; border-radius: 5px; border: 0; background: var(--deep); color: #EEF2F7; font-weight: 600; cursor: pointer">Sign in</button>
    <span style="display: flex; gap: 14px; flex-wrap: wrap">${linkBtn(where, 'Forgot your password? Email me a sign-in link')}</span>
    ${UI.signin ? `<span role="status" style="font-size: 13px; color: var(--ink)">${esc(UI.signin)}</span>` : ''}`;
  const pPassword = () => `<details${UI.pwmsg ? ' open' : ''}><summary style="cursor: pointer; font-weight: 600; color: var(--goldink); min-height: 32px">${UI.hasPw ? 'Change your password' : 'Set a password (optional)'}</summary>
    <div style="display: flex; flex-direction: column; gap: 10px; padding-top: 8px; max-width: 420px">${pwInput('pw-1', 'Password', 'new-password')}${pwInput('pw-2', 'Confirm password', 'new-password')}
    <button type="button" data-act="pw-save" data-f="pw-save" style="align-self: flex-start; min-height: 44px; padding: 0 16px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 600; cursor: pointer">Save my password</button>
    ${UI.pwmsg ? `<span role="status" style="font-size: 13px; color: var(--ink)">${esc(UI.pwmsg)}</span>` : ''}</div></details>`;
  const pHow = () => (UI.how ? `<div class="card pop" style="padding: 18px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 13px">
      <span style="display: flex; gap: 8px"><b style="color: var(--goldink)">1</b>Say where you are and where you want to get.</span>
      <span style="display: flex; gap: 8px"><b style="color: var(--goldink)">2</b>Answer 8 questions from real life.</span>
      <span style="display: flex; gap: 8px"><b style="color: var(--goldink)">3</b>Add rough numbers. A range is enough.</span>
      <span style="display: flex; gap: 8px"><b style="color: var(--goldink)">4</b>Read your North Star, ask “what if?”, tick “Got it”, choose your next steps.</span></div>` : '');
  function pWs() {
    if (!UI.ws) return '';
    const P = S.profile, lab = 'display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600';
    const TYPES = ['Solopreneur (just me)', 'Small business with a team', 'Growing company with managers', 'Not started yet (an idea)'];
    const CUR = [['USD', 'USD $'], ['EUR', 'EUR €'], ['GBP', 'GBP £'], ['CAD', 'CAD $'], ['AUD', 'AUD $']];
    return `<div class="card pop" style="padding: 22px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 24px 50px rgba(28,19,9,.14)">
      <div style="display: flex; flex-direction: column; gap: 4px"><span class="eb">Your workspace</span><span class="sf" style="font-size: 24px">Make this yours.</span><span style="font-size: 13px; color: var(--muted)">${signedIn() ? 'Your answers and numbers are kept with your account.' : 'Your answers and numbers are kept on this browser. With a free account they follow you to any device.'}</span></div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px">
        <label style="${lab}">First name<input class="inp" id="ws-first" type="text" autocomplete="given-name" value="${esc(P.first)}" data-f="ws-first"></label>
        <label style="${lab}">Surname<input class="inp" id="ws-last" type="text" autocomplete="family-name" value="${esc(P.last)}"></label>
        <label style="${lab}">Business name<input class="inp" id="ws-business" type="text" value="${esc(P.business)}" placeholder="Your business"></label>
        <label style="${lab}">Business type<select class="inp" id="ws-type"><option value="">Choose…</option>${TYPES.map((t) => `<option${P.type === t ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
        <label style="${lab}">Industry <span style="color: var(--self); font-weight: 400">required</span>${industrySelect('ws-industry', 'required')}</label>
        <label style="${lab}">Currency<select class="inp" id="ws-currency">${CUR.map(([v, t]) => `<option value="${v}"${P.currency === v ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
      </div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
        <span style="font-size: 13px; font-weight: 600">Theme</span>
        ${['light', 'dark'].map((t) => `<button type="button" data-act="theme" data-v="${t}" data-f="theme-${t}" aria-pressed="${siteTheme() === t}" style="min-height: 44px; padding: 0 16px; border-radius: 5px; border: 1.5px solid ${siteTheme() === t ? '#6F93B8' : 'var(--line)'}; background: var(--paper); color: var(--ink); cursor: pointer; font-weight: 600">${t === 'light' ? 'Light' : 'Dark'}</button>`).join('')}
        <button type="button" data-act="ws-save" data-f="ws-save" style="margin-left: auto; min-height: 46px; padding: 0 20px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px">${lockIcon('#0E1C2B', 16)}Save &amp; lock my workspace</button>
      </div>
      ${UI.saved ? `<span class="pop" role="status" style="font-size: 13px; color: ${UI.saved === true ? 'var(--people)' : 'var(--self)'}; font-weight: 600">${UI.saved === true ? (signedIn() ? 'Saved to your account. Your preferences and numbers are locked to this workspace.' : 'Saved. Your preferences and numbers are kept with this workspace on this browser.') : esc(UI.saved)}</span>` : ''}
      <div style="border-top: 1px solid var(--line); padding-top: 14px; display: flex; flex-direction: column; gap: 8px">
        ${signedIn() ? `<span style="font-size: 13px; color: var(--muted)">Signed in${P.email ? ' as <b style="color: var(--ink)">' + esc(P.email) + '</b>' : ''}. On another device, sign in with this address.</span>${pPassword()}`
          : `<span style="font-size: 13px; font-weight: 600">Already have an account? Sign in</span><label style="${lab}">Email<input class="inp" id="ws-signin" type="email" autocomplete="email" value="${esc(P.email)}"></label>${pSignin('ws')}`}
      </div>
    </div>`;
  }

  /* ── Drawing ─────────────────────────────────────────────────────────────── */
  const cache = {};
  /* When a part is replaced, the parts inside it start again from nothing. */
  const INSIDE = {};
  function put(id, html) {
    if (cache[id] === html) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = html;
    cache[id] = html;
    for (const child of INSIDE[id] || []) delete cache[child];
  }
  function siteTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    return t === 'dark' || t === 'light' ? t : S.theme;
  }
  window.addEventListener('es-theme', () => { const cf = $('#cf'); if (!cf) return; const th = siteTheme(); cf.dataset.theme = th; document.body.classList.toggle('dark', th === 'dark'); });
  function render() {
    const keep = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.f : null;
    const c = context(), L = labCalc();
    const cf = $('#cf');
    // The site's light (public/theme.js) decides: the device until the
    // founder picks, kept on this browser.
    const th = siteTheme();
    cf.dataset.theme = th;
    document.body.classList.toggle('dark', th === 'dark');
    put('nav', pNav(c));
    put('stepcards', pStepcards());
    const cont = $('#continue'); if (cont) cont.innerHTML = `${c.answered > 0 ? 'Continue my assessment' : 'Show me my road'} <span class="arr" aria-hidden="true">↓</span>`;
    put('banner', pBanner(c));
    put('ring', pRing(c));
    put('skipnote', pSkip());
    put('s-journey', pJourney(c));
    put('herebar', pHerebar(c));
    put('modes', pModes());
    put('dombars', pDombars(c));
    put('questions', pQuestions(c));
    put('s-pains', pPains());
    put('s-reading', pReading(c));
    put('s-numbers', pNumbers(c));
    for (let i = 0; i < 4; i++) put('fb-' + i, pFeedback(c, i));
    put('s-save', pSave(c));
    put('s-weeks', pWeeks(c));
    put('s-climb', pClimb());
    put('lab-in', pLabIn());
    updateLab();
    put('lab-deep', pLabDeep());
    $('#labtag').textContent = S.mode === 'yes' ? 'Step 04 · The what-if lab · your real month' : 'Step 04 · The what-if lab · your first customers (plan)';
    $('#labfoot').textContent = labFoot();
    put('mbar', pMbar(c));
    put('gate', pGate());
    put('how', pHow());
    put('ws', pWs());
    $('#how-btn').setAttribute('aria-expanded', String(UI.how));
    $('#ws-btn').setAttribute('aria-expanded', String(UI.ws));
    if (keep && (!document.activeElement || document.activeElement === document.body || !document.activeElement.isConnected)) {
      const el = document.querySelector(`[data-f="${keep}"]`);
      if (el) el.focus({ preventScroll: true });
    }
  }
  /* Slider moves redraw only what answers them, so the slider never jumps. */
  function renderLab() {
    cache['lab-in'] = pLabIn();
    updateLab();
    put('lab-deep', pLabDeep());
    $('#labfoot').textContent = labFoot();
  }

  const SECTION = { overview: 's-overview', clear: 's-clear', people: 's-people', numbers: 's-numbers', plan: 's-whatif', method: 's-method', journey: 's-journey', weeks: 's-weeks' };
  function go(page) {
    sync(); // the end of a section
    UI.page = page in SECTION && page !== 'journey' ? page : page === 'journey' ? 'clear' : UI.page;
    render();
    const el = document.getElementById(SECTION[page]);
    if (el) el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  }
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.style.display = 'block';
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.style.display = 'none'; }, 4000);
  }

  /* ── Email: sent once through /api/send-plan, only when asked ─────────────── */
  function planForEmail() {
    const c = context(), n = c.n;
    const domains = D.map((d, i) => { const f = E.feedback(i, c.sc[i], S.pains, S.want);
      return c.sc[i].answered ? { know: d.name, lead: f.band, label: f.big, strengthen: [f.ask], steps: [f.week], level: '' }
        : { know: d.name, lead: f.band, label: 'Not answered yet', strengthen: [], steps: [], level: '' }; });
    const rows = [];
    const add = (k, v) => { if (v) rows.push([k, v]); };
    const ab = (...k) => (k.some((x) => n[x] && n[x].est) ? '≈ ' : '');
    if (S.mode === 'yes') {
      if (n.sales && n.deliv && n.run) add('Left this month', ab('sales', 'deliv', 'run') + money(n.sales.v - n.deliv.v - n.run.v));
      if (n.hrs && n.want && n.want.v > 0) add('Hours against the hours you chose', ab('hrs', 'want') + Math.round(n.hrs.v / n.want.v * 100) + '%');
      if (n.unpaid) add('Unpaid hours a month', ab('unpaid') + whole(n.unpaid.v));
      if (n.save && n.out && n.out.v > 0) add('Months your savings cover', ab('save', 'out') + (Math.round(n.save.v / n.out.v * 10) / 10));
      if (n.newc && n.newc.v > 0 && n.acq) add('Cost to win one customer', ab('newc', 'acq') + money(n.acq.v / n.newc.v));
    } else {
      if (n.price && n.cpc) add('Each customer leaves you', ab('price', 'cpc') + money(n.price.v - n.cpc.v));
      if (n.wait) add('Months you can wait for income', ab('wait') + n.wait.v);
      if (n.talked) add('People you talked to', ab('talked') + whole(n.talked.v));
    }
    const order = c.rd.any ? c.rd.combo.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]) : [0, 1, 2, 3];
    const next = order.slice(0, 3).map((i) => ({ title: D[i].name, text: E.feedback(i, c.sc[i], S.pains, S.want).week }));
    const st = E.STAGES[c.here];
    return { name: S.profile.first, business: S.profile.business, stage: st.name, focus: st.focus, domains, numbers: rows.slice(0, 6), next, strategy: [] };
  }
  /* Signed in: straight to the account's email. Otherwise name and email
   * first (which makes the free account), then send. It only ever says "Sent"
   * when the email service said yes. */
  async function sendEmail() {
    if (!signedIn()) { fullAccount(); return; }
    if (!UI.mailReady) { UI.mail = 'Email is not switched on yet. Use Print or Save as PDF for now.'; render(); return; }
    UI.sending = true; UI.mail = ''; render();
    try {
      if (!signedIn()) await createAccount('compass', true);
      const body = signedIn() ? { token: A.token(), plan: planForEmail() } : { email: S.profile.email, plan: planForEmail() };
      const r = await fetch('/api/send-plan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'It did not send. Try again in a minute.');
      UI.mail = 'Sent to ' + (j.to || S.profile.email) + '. Check your inbox: your results and your Founder Launchpad link.';
    } catch (e) {
      UI.mail = (e && e.message && !/fetch|network|load failed/i.test(e.message)) ? e.message : 'We could not reach the email service just now. Use Print or Save as PDF.';
    }
    UI.sending = false; render();
    if (window.innerWidth <= 860) toast(UI.mail);
  }

  /* ── Events ──────────────────────────────────────────────────────────────── */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go],[data-act]');
    if (!t || t.tagName === 'INPUT') return;
    if (t.dataset.go) { e.preventDefault(); go(t.dataset.go); return; }
    const a = t.dataset.act, i = Number(t.dataset.i), v = t.dataset.v;
    switch (a) {
      case 'how': UI.how = !UI.how; render(); return;
      case 'ws':
        UI.ws = !UI.ws; UI.saved = false; render();
        if (UI.ws && signedIn() && UI.hasPw === null) A.loadCompass().then((c) => { UI.hasPw = !!(c && c.hasPassword); render(); });
        return;
      case 'download': {
        try {
          const url = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
          const link = document.createElement('a'); link.href = url; link.download = 'leaders-north-star.json'; link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch { toast('Your browser would not save the file.'); }
        return;
      }
      case 'here': S.stage = E.STAGES[i].id; S.goal = ''; save(); render(); return;
      case 'goal': {
        const here = E.STAGES.findIndex((x) => x.id === S.stage);
        if (i > here || (here === 3 && i === here)) { S.goal = E.STAGES[i].id; save(); render(); }
        return;
      }
      case 'mode': S.mode = v; S.group = 0; S.lab.p = 0; S.lab.m = 0; S.lab.f = 0; S.lab.d = 0; save(); render(); return;
      case 'lab-mode': S.lab.mode = v === 'money' ? 'money' : 'time'; save(); renderLab(); return;
      case 'lab-take': takeToNumbers(); return;
      case 'ans': gated(() => { S.ans[t.dataset.q] = Number(v); }); return;
      case 'str': gated(() => { S.str[i] = Number(v); }); return;
      case 'pain': gated(() => { const cur = S.pains.slice(), ix = cur.indexOf(v); if (ix >= 0) cur.splice(ix, 1); else { cur.push(v); if (cur.length > 2) cur.shift(); } S.pains = cur; }); return;
      case 'want': gated(() => { S.want = S.want === v ? '' : v; }); return;
      case 'grp': S.group = i; save(); render(); sync(); return;
      case 'more': S.more[i] = !S.more[i]; save(); render(); return;
      case 'lean': S.lean = i; save(); render(); return;
      case 'stop': S.stop = i; save(); render(); return;
      case 'print': try { window.print(); } catch { /* no print dialog here */ } return;
      case 'email': sendEmail(); return;
      case 'regate': fullAccount(); return;
      case 'account': {
        // Locked plans: make the free account, or sign in to the one there is.
        if (signedIn()) return;
        // An email that already has an account signs in right here: password,
        // or "Email me a sign-in link". Everyone else makes the full account.
        if (S.acct.email && S.acct.email === S.profile.email && S.acct.state === 'existing') { openSignin(); return; }
        fullAccount();
        return;
      }
      case 'si-x': UI.signinFor = null; UI.signin = ''; closeGate(); return;
      case 'note-x': UI.note = ''; render(); return;
      case 'signin-gate': { const el = $('#g-email'); askLink(el ? el.value.trim() : '', 'gate'); return; }
      case 'signin-ws': { const el = $('#ws-signin'); askLink(el ? el.value.trim() : '', 'ws'); return; }
      case 'signin-open': UI.signinOpen = true; render(); return;
      case 'pw-in': pwSignIn(v); return;
      case 'pw-save': savePassword(); return;
      case 'eye': { const el = $('#' + v), show = el && el.type === 'password'; if (el) el.type = show ? 'text' : 'password'; t.setAttribute('aria-pressed', String(!!show)); return; }
      case 'gate-skip': UI.after = null; S.skipped = true; save(); closeGate(); return;
      case 'theme': if (window.ESTheme) window.ESTheme.set(v); else S.theme = v; save(); render(); return;
      case 'ws-save': {
        const val = (id) => { const el = $('#' + id); return el ? el.value.trim() : ''; };
        const ind = val('ws-industry');
        if (!ind) { UI.saved = 'Choose your industry, so the feedback can speak to your business.'; render(); return; }
        Object.assign(S.profile, { first: val('ws-first').slice(0, 60), last: val('ws-last').slice(0, 60), business: val('ws-business').slice(0, 80), type: val('ws-type'), industry: ind, currency: val('ws-currency') || 'USD' });
        UI.saved = true; save(); render(); return;
      }
      default:
    }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.act === 'got') { S.got[Number(t.dataset.i)] = t.checked; save(); render(); sync(); return; }
    if (t.dataset.tick && signedIn() && UI.plans) {
      const id = t.dataset.tick, on = t.checked, was = UI.plans.done[id];
      if (on) UI.plans.done[id] = new Date().toISOString(); else delete UI.plans.done[id];
      UI.plans.count = Object.keys(UI.plans.done).length; render();
      A.tick(id, on).then((r) => { if (r && Number.isInteger(r.count)) { UI.plans.count = r.count; render(); } })
        .catch(() => { if (was) UI.plans.done[id] = was; else delete UI.plans.done[id]; UI.plans.count = Object.keys(UI.plans.done).length; render(); toast('That tick did not save. Try again.'); });
      return;
    }
    // A lever let go of: send the move with the next quiet moment, not per step.
    if (t.dataset.lever) { clearTimeout(leverTimer); leverTimer = setTimeout(sync, 4000); return; }
    if (t.dataset.num) { const k = t.dataset.num, cur = S.nums[k] || { pick: '', own: '' }; S.nums[k] = { pick: t.value, own: cur.own }; save(); render(); if (t.value === 'own') { const o = document.querySelector(`[data-own="${k}"]`); if (o) o.focus(); } return; }
    // Wait for focus to settle on the next field, then redraw and keep it there.
    if (t.dataset.own || t.dataset.lab) setTimeout(render, 0);
  });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.lever) { S.lab[t.dataset.lever] = Number(t.value); save(); renderLab(); return; }
    if (t.dataset.own) { S.nums[t.dataset.own] = { pick: 'own', own: t.value.slice(0, 80) }; save(); return; }
    if (t.dataset.lab) { S.lab[t.dataset.lab] = t.value.replace(/[^\d.]/g, '').slice(0, 12); save(); }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'gate-form') return;
    e.preventDefault();
    const val = (id) => { const el = $('#' + id); return el ? el.value.trim() : ''; };
    const first = val('g-first'), email = val('g-email'), consent = !!($('#g-consent') || {}).checked;
    // Errors are said in place, so nothing typed is lost.
    const err = (m) => { const el = $('#gate-err'); if (el) el.textContent = m; };
    if (!first) return err('Your first name, so the feedback is yours.');
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return err('That email does not look complete.');
    if (!val('g-last')) return err('Your surname, please.');
    // The simple form: consent is the founder's choice. Without it the account
    // is still made, and nothing is emailed but what they ask for.
    Object.assign(S.profile, { first: first.slice(0, 60), last: val('g-last').slice(0, 60), email: email.slice(0, 120), consent });
    save(); closeGate();
    const after = UI.after; UI.after = null;
    // The account follows the box. The answers already here go into it.
    createAccount('compass', after === 'email').then(() => { if (after === 'email') sendEmail(); });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && UI.gate) { S.skipped = true; save(); closeGate(); } });

  render();
  setTimeout(() => $('#cf').classList.add('settled'), 1500);
  /* Email works only once the site has its email key and postal address. */
  try { if (location.protocol !== 'file:') fetch('/api/send-plan').then((r) => (r.ok ? r.json() : {})).then((j) => { UI.mailReady = !!j.ready; UI.mailWhy = j.reason || ''; }).catch(() => {}); } catch { /* offline */ }
  /* The last batch goes as the page is hidden or closed. */
  document.addEventListener('visibilitychange', () => { if (document.hidden) sync(true); });
  window.addEventListener('pagehide', () => sync(true));
  if (location.protocol !== 'file:') boot();
  /* Animations rest when their section is off screen or the tab is hidden.
   * With reduced motion, SVG animations show their settled frame and stop. */
  (function calm() {
    const rest = (el, off) => {
      el.toggleAttribute('data-off', off);
      el.querySelectorAll('svg').forEach((g) => { try { if (off || reduced()) g.pauseAnimations(); else g.unpauseAnimations(); } catch { /* no SMIL */ } });
    };
    if (reduced()) document.querySelectorAll('svg').forEach((g) => { try { g.setCurrentTime(3.4); g.pauseAnimations(); } catch { /* no SMIL */ } });
    const parts = [...document.querySelectorAll('#main > section, #main > div, .side')];
    const seen = new Map();
    try {
      const io = new IntersectionObserver((es) => es.forEach((e) => { seen.set(e.target, e.isIntersecting); rest(e.target, !e.isIntersecting || document.hidden); }));
      parts.forEach((el) => io.observe(el));
      document.addEventListener('visibilitychange', () => parts.forEach((el) => rest(el, document.hidden || seen.get(el) === false)));
    } catch { /* old browser: everything simply keeps running */ }
  })();
})();
