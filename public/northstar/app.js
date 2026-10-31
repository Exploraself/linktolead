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
    skipped: false, stage: 'building', goal: '', mode: 'yes', ans: {}, str: {}, pains: [], want: '', want2: '', values: [], nums: {}, group: 0,
    p2: { team: '', ans: {} }, pgot: {}, pmore: {}, fromBP: false, history: [],
    got: {}, more: {}, lean: null, stop: 0, lab: { v: 2, p: 0, m: 0, f: 0, d: 0, mode: 'both', rate: '', hire: '', plan: '' }, acct: { email: '', state: '' } });
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
    if (E.GOALS.some((g) => g[0] === raw.want2) && raw.want2 !== s.want) s.want2 = raw.want2;
    s.values = (Array.isArray(raw.values) ? raw.values : []).filter((x) => M.VALUES.some((v) => v[0] === x)).slice(0, 2);
    const p2 = raw.p2 || {};
    if (M.P2.team.some((t) => t[0] === p2.team)) s.p2.team = p2.team;
    for (const id of M.P2.ids()) { const v = p2.ans && p2.ans[id]; if (Number.isInteger(v) && v >= 0 && v <= 3) s.p2.ans[id] = v; }
    for (let i = 1; i <= 4; i++) { if (raw.pgot?.[i] === true) s.pgot[i] = true; if (raw.pmore?.[i] === true) s.pmore[i] = true; }
    s.fromBP = raw.fromBP === true;
    // Earlier North Stars, each with its date (round 6).
    const n4 = (a, hi) => (Array.isArray(a) ? a.slice(0, 4).map((v) => clampN(v, 0, hi)) : [0, 0, 0, 0]);
    s.history = (Array.isArray(raw.history) ? raw.history : []).filter((h) => h && typeof h.at === 'string').slice(-12)
      .map((h) => ({ at: str(h.at, 40), stage: E.STAGES.some((x) => x.id === h.stage) ? h.stage : 'building', sc: n4(h.sc, 6), n: n4(h.n, 2), str: n4(h.str, 5), pct: clampN(h.pct, 0, 100), values: (Array.isArray(h.values) ? h.values : []).filter((x) => M.VALUES.some((v) => v[0] === x)).slice(0, 2) }));
    for (const [k, v] of Object.entries(raw.nums || {})) if (/^(yes|offer|idea)\.\w+$/.test(k) && v && typeof v === 'object') s.nums[k] = { pick: str(v.pick, 8), own: str(v.own, 80) };
    s.group = Number.isInteger(raw.group) && raw.group >= 0 && raw.group <= 4 ? raw.group : 0;
    for (let i = 0; i < 4; i++) { if (raw.got?.[i] === true) s.got[i] = true; if (raw.more?.[i] === true) s.more[i] = true; }
    s.lean = Number.isInteger(raw.lean) && raw.lean >= 0 && raw.lean < 4 ? raw.lean : null;
    s.stop = Number.isInteger(raw.stop) && raw.stop >= 0 && raw.stop < 5 ? raw.stop : 0;
    const lab = raw.lab || {};
    // Since 31 Oct the lab opens on "Both" (half time, half money), so every lever moves all four.
    s.lab = { v: 2, p: clampN(lab.p, 0, 200), m: clampN(lab.m, 0, 100), f: clampN(lab.f, 0, 50), d: clampN(lab.d, 0, 60), mode: lab.v === 2 && ['time', 'money', 'both'].includes(lab.mode) ? lab.mode : 'both', rate: str(lab.rate, 12), hire: str(lab.hire, 12), plan: str(lab.plan, 12) };
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

  /* Came here from the Blueprint (Your Base Camp on this site): the ending
   * then speaks to someone already on the road. */
  try { const r = document.referrer ? new URL(document.referrer) : null; if (r && r.host === location.host && /^\/ground-plan/.test(r.pathname)) S.fromBP = true; } catch { /* no referrer */ }
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
  /* The Massive Growth Plan's ticks (31 Oct): { step id: date ticked }, from
   * the account. Signed in only; kept apart from the Account Plans. */
  let GP_DONE = {};
  async function loadGrowth() {
    if (!signedIn() || !A.growthPlan) return;
    const r = await A.growthPlan();
    if (r && r.done) { GP_DONE = r.done; render(); }
  }
  /** The North Star's own sign-in box ("Sign in to your account"). */
  function menuSignin() {
    UI.signinFor = 'menu'; UI.signin = ''; openGate('account'); render();
    setTimeout(() => { const f = $('#g-email'); if (f && !f.value) f.focus(); else { const p = $('#si-pw-gate'); if (p) p.focus(); } }, 0);
  }
  /** Tick or untick one step. Signed out: the sign-in box opens instead. */
  async function growthTick(id) {
    if (!signedIn()) { menuSignin(); return; }
    const was = GP_DONE[id], on = !was;
    GP_DONE = { ...GP_DONE };
    if (on) GP_DONE[id] = new Date().toISOString(); else delete GP_DONE[id];
    render();
    try {
      const r = await A.growthTick(id, on);
      if (r && r.done) { GP_DONE = r.done; render(); }
    } catch (e) {
      GP_DONE = { ...GP_DONE };
      if (was) GP_DONE[id] = was; else delete GP_DONE[id];
      render();
      toast(e && e.message ? e.message : 'That tick did not save. Try again in a minute.');
    }
  }
  /* Its two PDFs (the plan, mgp; the planner, lgp) are study material: every
   * download goes through /api/library with the founder's token (the same
   * link as the Library, A.libraryHref), never the PDF itself. */
  const pGrowth = () => (window.GrowthPlan && window.GrowthView
    ? window.GrowthView.html(window.GrowthPlan, { done: GP_DONE, lib: signedIn() && A.libraryHref ? (k) => A.libraryHref(k) : null }) : '');
  /** What the account keeps: this whole state (so another device can carry
   *  on), plus the scores and choices the Account Plans are ordered by. */
  function payload() {
    const sc = E.scores(M, S);
    return { stage: S.stage, answers: S,
      results: { scores: sc.map((x) => x.score), answered: sc.map((x) => x.answered), bands: sc.map((x) => (x.answered ? E.BANDS[x.band] : null)) },
      flags: { pains: S.pains, want: S.want, want2: S.want2, values: S.values, team: S.p2.team, lab: { p: S.lab.p, m: S.lab.m, f: S.lab.f, d: S.lab.d } } };
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
  const hasWork = (s) => Object.keys(s.ans).length > 0 || Object.keys(s.str).length > 0 || Object.keys(s.nums).length > 0 || s.pains.length > 0 || !!s.want || Object.keys(s.p2.ans).length > 0 || (Array.isArray(s.history) && s.history.length > 0);
  /* The two things they want most (31 Oct: pick two), first pick first. */
  const wants = () => [S.want, S.want2].filter(Boolean);
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
    try { window.dispatchEvent(new Event('ftb:signedin')); } catch { /* old browser */ }
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
      if (!S.profile.email || !S.profile.industry) {
        const r = await A.pull();
        if (r && r.me) {
          const [first, ...rest] = String(r.me.name || '').split(' ');
          // The industry given at sign-up comes too (31 Oct), so the workspace never asks again.
          Object.assign(S.profile, { first: S.profile.first || first || '', last: S.profile.last || rest.join(' '), email: S.profile.email || r.me.email || '', industry: S.profile.industry || r.me.industry || '' });
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
    loadGrowth();
    window.addEventListener('ftb:signedin', loadGrowth);
    if (UI.cmp) { const r = document.getElementById('s-reading'); if (r) r.scrollIntoView({ block: 'start' }); }
    // The menu is always there (31 Oct): signed in it shows the initials or
    // photo; signed out a plain person icon, with "Sign in" first.
    import('/profile-menu.js').then((m) => m.mount(document.getElementById('top-tools'), { guest: true })).catch(() => {});
    // Came in through the Blueprint and opening the North Star for the first
    // time: confirm name and email once (tag linktolead-crossed-northstar).
    if (signedIn()) A.pull().then((r) => {
      if (!r || !r.me || r.me.origin !== 'blueprint' || (r.me.crossed || []).includes('northstar')) return;
      const [first, ...rest] = String(r.me.name || '').split(' ');
      import('/reset-box.js').then((m) => m.openConfirm({ to: 'northstar', first, last: rest.join(' '), email: r.me.email,
        done: ({ first: f, last: l }) => { S.profile.first = f; S.profile.last = l; save(); render(); } }));
    }).catch(() => {});
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

  /* ── Your constellation (31 Oct, round 4): sixteen stars, four per domain,
   * each lit by a piece in place, with the North Star in the middle growing as
   * they light. One picture for the whole North Star: the night sky. ── */
  const starPath = (x, y, r) => { const q = r * 0.32, f = (v) => v.toFixed(1); return `M${f(x)} ${f(y - r)}L${f(x + q)} ${f(y - q)}L${f(x + r)} ${f(y)}L${f(x + q)} ${f(y + q)}L${f(x)} ${f(y + r)}L${f(x - q)} ${f(y + q)}L${f(x - r)} ${f(y)}L${f(x - q)} ${f(y - q)}Z`; };
  function emblem(per, size, opts = {}) {
    const total = per.reduce((a, b) => a + b, 0), TW = [-16, 13, -9, 18], sm = !!opts.small;
    let lines = '', stars = '';
    D.forEach((_, i) => {
      const mid = -45 + i * 90; let prev = [60, 60];
      for (let k = 0; k < 4; k++) {
        const a = (mid + TW[k]) * Math.PI / 180, r = 19 + k * 12, x = 60 + r * Math.cos(a), y = 60 + r * Math.sin(a), on = k < per[i];
        if (on) lines += `<line x1="${prev[0].toFixed(1)}" y1="${prev[1].toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${LIGHT[i]}" stroke-width="${sm ? 1.4 : 0.9}" opacity=".7"/>`;
        stars += on ? `${sm ? '' : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" fill="${LIGHT[i]}" opacity=".22"/>`}<path class="lit" d="${starPath(x, y, sm ? 5 : 3.8)}" fill="${LIGHT[i]}"/>`
          : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sm ? 2 : 1.4}" fill="#8A97A8" opacity=".55"/>`;
        if (on) prev = [x, y];
      }
    });
    const cr = (sm ? 7 : 5) + total / 16 * 6;
    return `<svg class="${opts.cls || ''}" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="Your constellation: ${total} of 16 stars lit" style="flex: none">
      ${sm ? '' : '<circle cx="60" cy="60" r="58" fill="#0B1522"/><g class="spin"><circle cx="60" cy="60" r="58" fill="none" stroke="#6F93B8" stroke-width=".7" stroke-dasharray="1.2 5" opacity=".6"/></g>'}
      ${lines}${stars}
      <circle cx="60" cy="60" r="${(cr + 4).toFixed(1)}" fill="#A9C0D9" opacity="${(0.08 + total / 16 * 0.22).toFixed(2)}"/>
      <path d="${starPath(60, 60, cr)}" fill="#EEF2F7"/>
      <path d="${starPath(60, 60, cr * 0.5)}" fill="#6F93B8" transform="rotate(45 60 60)"/>
    </svg>`;
  }

  /* ── Parts ──────────────────────────────────────────────────────────────── */
  const NAV = [['overview', '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/><g><polygon points="12,4 14,12 12,13.5 10,12" fill="#6F93B8"/><polygon points="12,20 14,12 12,10.5 10,12" fill="currentColor" opacity=".5"/><animateTransform attributeName="transform" type="rotate" values="20 12 12;34 12 12;20 12 12" dur="7s" repeatCount="indefinite"/></g></svg>', 'Your North Star'],
    ['clear', '1', 'Yourself'], ['people', '2', 'Your people'], ['numbers', '3', 'Your numbers'], ['plan', '4', 'Your next steps'], ['method', '⌘', 'How it works']];
  const navOn = () => (typeof window !== 'undefined' && window.__nsSpy) || UI.page; // spy.js: the section on screen
  const pNav = (c) => NAV.map(([id, ni, t]) => `<button type="button" class="nl ${navOn() === id ? 'on' : ''}" data-go="${id}" data-f="nav-${id}"${navOn() === id ? ' aria-current="true"' : ''}><span class="ni">${ni}</span>${t}${id === 'clear' ? `<small style="margin-left: auto; font-size: 9px">${p1Count(c).done}/${p1Count(c).total}</small>` : ''}</button>`).join('');

  const STEP_CARDS = [['1', 'Yourself', 'Eleven quick questions', 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'clear'],
    ['2', 'Your people', 'Customers and team', D[1].icon, 'people'], ['3', 'Your numbers', 'One month, roughly', 'M4 20V10M10 20V4M16 20v-7M22 20H2', 'numbers'],
    ['4', 'Your next steps', 'Your road and the what-if lab', 'M6 21V4M6 4h11l-3 4 3 4H6', 'plan']];
  const pStepcards = () => STEP_CARDS.map(([n, t, k, icon, go], i) => `<button type="button" data-go="${go}" data-f="card-${go}" class="card lift stepc rise" style="animation-delay: ${(i + 1) / 10}s; text-align: left; padding: 18px; cursor: pointer; color: var(--ink); display: flex; flex-direction: column; gap: 8px; min-height: 150px">
      <span style="display: flex; justify-content: space-between; align-items: center; width: 100%"><span style="font-size: 11px; letter-spacing: .14em; color: var(--goldink); font-weight: 520">PART ${n}</span><svg class="sico" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="${icon}" fill="none" stroke="${CSSV[i]}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <span class="sf" style="font-size: 21px; display: flex; align-items: center; gap: 8px">${t} <span class="sarr" aria-hidden="true">→</span></span>
      <span style="font-size: 13px; color: var(--muted)">${k}</span></button>`).join('');

  const LINES = ['Every answer lights a star. Watch your constellation appear.', 'It is taking shape. Keep going: each domain has four stars.',
    'More than half lit. The darkest corner shows you where to look.', 'Almost complete. Tick “Got it” on your feedback to light the last stars.', 'Your constellation is complete. The next step is inside.'];
  function pBanner(c) {
    const t = c.pc.total, ready = t >= 12;
    const line = t === 16 ? LINES[4] : t === 0 ? LINES[0] : t < 8 ? LINES[1] : t < 12 ? LINES[2] : LINES[3];
    return `${emblem(c.pc.per, 124, { cls: 'lp-emb' })}
      <div style="flex: 1 1 260px; display: flex; flex-direction: column; gap: 4px; min-width: 0">
        <span class="eb" style="color: #A9C0D9">Your constellation · ${t} of 16 stars lit</span>
        <span class="sf" style="font-size: 18px; line-height: 1.25">${line}</span>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; font-weight: 520">${D.map((d, i) => `<span style="display: inline-flex; align-items: center; gap: 6px; color: ${LIGHT[i]}"><span style="width: 9px; height: 9px; border-radius: 50%; background: ${LIGHT[i]}"></span>${d.name} ${c.pc.per[i]}/4</span>`).join('')}</div>
      </div>
      ${ready ? '<a class="pop cta" href="/ground-plan/#home" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 18px; border-radius: 5px; background: #6F93B8; color: #0E1C2B; font-weight: 520; text-decoration: none">You’re ready · Enter the Founder Launchpad →</a>' : ''}`;
  }

  /* Part 1's questions: the eight, then three pages of taps (31 Oct: eleven in all). */
  function p1Count(c) {
    const qs = c.qs, done = qs.filter((q) => Number.isInteger(S.ans[q.id])).length + (S.pains.length ? 1 : 0) + (S.want ? 1 : 0) + (S.values.length ? 1 : 0);
    return { done, total: qs.length + TAPS.length };
  }
  const pRing = (c) => { const k = p1Count(c); return `<svg width="74" height="74" viewBox="0 0 74 74" role="img" aria-label="${k.done} of ${k.total} answered">
      <circle cx="37" cy="37" r="31" fill="none" stroke="var(--cream)" stroke-width="7"/>
      <circle class="ringp" cx="37" cy="37" r="31" fill="none" stroke="#6F93B8" stroke-width="7" stroke-linecap="round" stroke-dasharray="194.8" style="stroke-dashoffset: ${(194.8 * (1 - k.done / k.total)).toFixed(1)}" transform="rotate(-90 37 37)"/>
      <text x="37" y="43" text-anchor="middle" font-family="Newsreader" font-size="19" fill="currentColor">${k.done}/${k.total}</text></svg>`; };

  const pNotice = () => (UI.note ? `<div class="card pop" role="status" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-color: #6F93B8">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="#6F93B8" stroke-width="1.8"/><path d="M3 7l9 6 9-6" fill="none" stroke="#6F93B8" stroke-width="1.8"/></svg>
      <span style="flex: 1; font-size: 14px">${esc(UI.note)}</span>
      <button type="button" data-act="note-x" data-f="note-x" aria-label="Close" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line); background: var(--paper); color: var(--ink); cursor: pointer">×</button></div>` : '');
  const pSkip = () => pNotice() + (S.skipped && !identified() ? `<div class="card pop" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-color: #6F93B8">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#6F93B8" stroke-width="1.8"/><path d="M12 7v6M12 16.5v.5" stroke="#6F93B8" stroke-width="2" stroke-linecap="round"/></svg>
      <span style="flex: 1; font-size: 14px">You are exploring. Add your email when you want your results sent to you.</span>
      <button type="button" data-act="regate" data-f="regate" style="min-height: 40px; padding: 0 14px; border-radius: 4px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 520; cursor: pointer">Add my email</button></div>` : '');

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
        <h2 style="font-weight: 900; font-size: 28px">Where do you want <span class="serif" style="color: var(--goldink); font-weight: 400">to get?</span></h2>
      </div>
      <p style="color: var(--muted); font-size: 16px">Now tap the stage you want to reach on your road.</p>
      <div class="j-road" style="background: #0E1C2B; color: #EEF2F7; border-radius: 12px; padding: 34px 18px 22px; box-shadow: 0 30px 60px rgba(28,19,9,.18)">
        <div style="position: relative; height: 150px">
          <div style="position: absolute; left: 12.5%; right: 12.5%; top: 50%; height: 4px; margin-top: -2px; background: repeating-linear-gradient(90deg, #2A3A50 0 10px, transparent 10px 18px); border-radius: 2px"></div>
          <div class="fill" style="position: absolute; top: 50%; height: 6px; margin-top: -3px; border-radius: 3px; background: #6F93B8; box-shadow: 0 0 14px rgba(111,147,184,.7); left: ${pos(here)}%; width: ${hasGoal ? 25 * gap : 0}%"></div>
          ${hasGoal && gap > 0 ? `<span class="trav" style="--from: ${pos(here)}%; --to: ${pos(gi)}%"></span>` : ''}
          ${hasGoal ? '' : `<span class="nshand" aria-hidden="true" style="--from: ${pos(Math.min(3, here + 1))}%; --to: ${pos(3)}%"><svg width="34" height="40" viewBox="0 0 24 28"><path d="M9 13V4.5a1.6 1.6 0 0 1 3.2 0V12m0-1.5a1.6 1.6 0 0 1 3.2 0V13m0-1a1.6 1.6 0 0 1 3.2 0v5c0 4.5-3 8-7 8h-1c-2.6 0-4-1.3-5.4-3.4L2.6 17a1.6 1.6 0 0 1 2.6-1.8L9 18.5" fill="#EEF2F7" stroke="#0E1C2B" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/></svg></span>`}
          ${stages.map((x) => `<div style="position: absolute; top: 0; bottom: 0; left: ${pos(x.i)}%; width: 0">
            ${x.isGoal ? '<svg class="flag" width="28" height="34" viewBox="0 0 28 34" aria-hidden="true" style="position: absolute; left: 0; top: 8px"><path d="M6 32V3" stroke="#EEF2F7" stroke-width="2"/><path d="M6 4h18l-5 6 5 6H6z" fill="#6F93B8"/></svg>' : ''}
            ${x.isHere ? '<span class="jring"></span><span class="jring ring2"></span>' : ''}
            ${x.isWay ? `<span class="way" style="position: absolute; left: 0; top: 50%; width: 30px; height: 30px; border-radius: 50%; border: 2px solid #6F93B8; transform: translate(-50%,-50%); animation-delay: ${(0.35 * (x.i - here)).toFixed(2)}s"></span>` : ''}
            <button type="button" data-act="goal" data-i="${x.i}" data-f="goal-${x.i}" ${x.can ? '' : 'disabled'} aria-label="Set ${x.s.name} as my goal"${x.isGoal || (x.isHere && hasGoal && gap === 0) ? ' aria-pressed="true"' : ''} class="${x.isGoal ? 'beacon' : ''}" style="position: absolute; left: 0; top: 50%; transform: translate(-50%,-50%); width: ${x.dotSize}px; height: ${x.dotSize}px; border-radius: 50%; background: ${x.dotBg}; border: 3px solid ${x.dotBorder}; cursor: ${x.can ? 'pointer' : 'default'}; padding: 0; transition: background .3s ease, width .3s ease, height .3s ease"></button>
            <div style="position: absolute; left: 0; bottom: 0; transform: translateX(-50%); width: 140px; max-width: 24vw; text-align: center; display: flex; flex-direction: column; gap: 2px">
              <span style="font-weight: 900; font-size: 15px; text-transform: uppercase; color: ${x.behind ? '#8A7A5E' : '#EEF2F7'}">${x.s.name}</span>
              <span style="font-size: 11px; font-weight: 600; letter-spacing: .1em; color: ${x.isHere || x.isGoal ? '#6F93B8' : '#A9B6C6'}">${x.tag}</span>
            </div></div>`).join('')}
        </div>
        ${hasGoal ? `<div class="rise" style="margin-top: 26px; border-top: 1px solid #3A2F20; padding-top: 20px; display: flex; flex-direction: column; gap: 8px; align-items: center; text-align: center">
            <span style="font-size: 20px; line-height: 1.4"><b style="color: #6F93B8">You are here:</b> ${S4[here].name} <span style="color: #A9B6C6">→</span> <b style="color: #6F93B8">Your goal:</b> ${gap === 0 ? 'go deeper' : S4[gi].name} · ${gap === 0 ? 'we sharpen what you already do' : words[gap]}</span>
            <span class="serif" style="font-size: 16px; color: #E3EAF2; max-width: 680px; line-height: 1.45">Your questions stay about where you are today. Your goal shapes your road in Part 4 — ${roadText}.</span></div>`
        : '<p style="margin-top: 22px; text-align: center; color: #A9B6C6; font-size: 15px">Tap a stage ahead of you. Your road will draw itself.</p>'}
      </div>
    </section>
`;
  }

  const pHerebar = (c) => (c.goal >= 0 ? `<div id="s-questions" class="card" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="10" r="3" fill="none" stroke="var(--goldink)" stroke-width="1.8"/><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" fill="none" stroke="var(--goldink)" stroke-width="1.8"/></svg>
      <span><b>You are here:</b> ${E.STAGES[c.here].name}</span><span style="color: var(--muted)">→</span><span><b>Your goal:</b> ${c.goal === c.here ? 'go deeper' : E.STAGES[c.goal].name}</span>
      <button type="button" data-go="journey" data-f="change-road" style="margin-left: auto; font-size: 13px; font-weight: 520; padding: 8px 0; background: none; border: 0; color: var(--goldink); cursor: pointer; text-decoration: underline">Change</button></div>`
    : '<div id="s-questions"></div>');

  const pModes = () => `<div class="card" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
      <span style="font-weight: 520" id="modes-h">Do you have paying customers yet?</span>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 8px" role="group" aria-labelledby="modes-h">
        ${E.MODES.map(([id, label, sub]) => `<button type="button" data-act="mode" data-v="${id}" data-f="mode-${id}" aria-pressed="${S.mode === id}" style="text-align: left; min-height: 56px; padding: 10px 12px; border-radius: 5px; border: 1.5px solid ${S.mode === id ? 'var(--ink)' : 'var(--line)'}; background: ${S.mode === id ? 'var(--cream)' : 'var(--paper)'}; color: var(--ink); cursor: pointer; display: flex; flex-direction: column; gap: 1px"><span style="font-weight: 520">${label}</span><span style="font-size: 12px; color: var(--muted)">${sub}</span></button>`).join('')}
      </div>
      <span style="font-size: 12px; color: var(--muted)">This changes the numbers we ask for and the feedback you get. No customers yet? We will not turn this into a sales calculator.</span></div>`;

  const pDombars = (c) => `<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px" aria-hidden="true">${D.map((d, i) => `<div style="display: flex; flex-direction: column; gap: 6px">
      <div style="height: 5px; border-radius: 3px; background: var(--cream); overflow: hidden"><div class="bar" style="height: 5px; background: ${CSSV[i]}; width: ${c.sc[i].answered * 50}%"></div></div>
      <span style="font-size: 11px; font-weight: 520; letter-spacing: .08em; color: ${CSSV[i]}">${d.name} · ${c.sc[i].answered}/2</span></div>`).join('')}</div>`;

  /* ── The Crown: the eight questions as a notebook (chosen 30 Oct 2026) ──
   * The step and its eight questions on the left page, one question on the
   * right. Keys 1–4 choose, Enter moves on, and the tools wait in the Crown
   * at the bottom while the questions are on screen. */
  /* The feedback the moment a question is answered: the question's own line,
   * for Not yet / I think so (lo) or Mostly / Yes, I’ve checked (hi). */
  const noteFor = (q, a) => (a < 2 ? q.lo : q.hi);
  let qi = null;
  const firstOpenQ = (qs) => { const i = qs.findIndex((q) => !Number.isInteger(S.ans[q.id])); return i < 0 ? qs.length - 1 : i; };
  /* After the eight questions, three pages of taps: what hurts most (up to
   * two), what they want most (two) and what they care about most (two). They
   * shape the feedback, and tell Alexandru who he is talking to. */
  const TAPS = [['What hurts most right now', 'Pick up to two'], ['What you want most', 'Pick two'], ['What you care about most', 'Pick two']];
  const tapOf = (k) => [
    { act: 'pain', list: E.PAINS, q: 'What hurts most right now?', pick: 'Pick up to two.', on: (id) => S.pains.includes(id), n: S.pains.length, note: 'Named. Your feedback starts here.' },
    { act: 'want', list: E.GOALS, q: 'And what do you want most?', pick: 'Pick two.', on: (id) => wants().includes(id), n: wants().length, note: wants().length === 2 ? 'Two goals. Your plan will point at both.' : 'One more, if there is one.' },
    { act: 'val', list: M.VALUES.map(([id, t]) => [id, t, -1]), q: 'Last one. What do you care about most?', pick: 'Pick two.', on: (id) => S.values.includes(id), n: S.values.length, note: 'Every step we suggest must protect these.' },
  ][k];
  /* A word between questions (model.js SPARKS), once the page is answered. */
  const spark = (i) => { const all = M.SPARKS && M.SPARKS[i], list = all ? [].concat(all) : [], x = list.length ? list[(Math.max(0, E.STAGES.findIndex((st) => st.id === S.stage)) + i) % list.length] : null; return x ? `<div class="nsspark"><small>${x.by ? 'A word from ' + esc(x.by) : 'A small note'}</small><p class="sf">${esc(x.t)}</p>${x.sub ? `<span>${esc(x.sub)}</span>` : ''}</div>` : ''; };
  function tapsPage(k, qn, total) {
    const T = tapOf(k);
    return `<span class="eb nsb-lab">${String(qn).padStart(2, '0')} · ${k === 2 ? 'The last tap' : 'Taps that shape your feedback'}</span>
      <div class="nsb-body">
        <div class="nsb-col">
          <h3 class="sf nsb-q" id="taps-h">${T.q} <span class="sfi" style="color: var(--acc)">${T.pick}</span></h3>
          <div class="nsb-opts" role="group" aria-labelledby="taps-h">
            ${T.list.map(([id, t, di], i) => `<button type="button" class="nsb-o" data-act="${T.act}" data-v="${id}" data-f="${T.act}-${id}" aria-pressed="${T.on(id)}">
              <kbd aria-hidden="true">${i + 1}</kbd><span class="nsb-dot" style="background: ${di >= 0 ? D[di].hex : '#B4975F'}"></span><span><b>${esc(t)}</b></span></button>`).join('')}
          </div>
          <p class="nsb-keys"><kbd>1–${T.list.length}</kbd> choose · <kbd>Enter ↵</kbd> ${qn === total ? 'see my North Star' : 'next'}</p>
        </div>
        ${T.n ? `<div><p class="nsb-note">${T.note}</p>${spark(qn - 1)}</div>` : ''}
      </div>`;
  }
  function pQuestions(c) {
    const qs = c.qs, total = qs.length + TAPS.length;
    if (qi === null || qi >= total) qi = firstOpenQ(qs);
    const stg = (E.STAGES.find((x) => x.id === S.stage) || {}).name || '';
    const done = qs.filter((q) => Number.isInteger(S.ans[q.id])).length;
    const rows = qs.map((q, i) => {
      const di = D.findIndex((d) => d.id === q.domain), a = S.ans[q.id], now = i === qi;
      const missed = !now && !Number.isInteger(a) && i < qi;
      return `<li><button type="button" class="nsb-s${Number.isInteger(a) ? ' done' : ''}${missed ? ' missed' : ''}${now ? ' now' : ''}" data-act="nsq" data-i="${i}" data-f="nsq-${i}"${now ? ' aria-current="step"' : ''}>
        <span class="nsb-n">${Number.isInteger(a) ? '✓' : i + 1}</span>
        <span class="nsb-st"><b>${esc(q.short || q.text)}</b><i>${now ? 'Answering now' : Number.isInteger(a) ? `Answered · ${esc(E.ANSWERS[a][0])}` : missed ? 'Not answered yet' : ''}</i></span></button></li>`;
    }).join('') + TAPS.map(([t], k) => {
      const i = qs.length + k, now = i === qi, picked = tapOf(k).n, missed = !now && !picked && i < qi && k > 0;
      return `<li><button type="button" class="nsb-s${picked ? ' done' : ''}${missed ? ' missed' : ''}${now ? ' now' : ''}" data-act="nsq" data-i="${i}" data-f="nsq-${i}"${now ? ' aria-current="step"' : ''}>
        <span class="nsb-n">${picked ? '✓' : i + 1}</span>
        <span class="nsb-st"><b>${t}</b><i>${now ? 'Choosing now' : picked ? `${picked} chosen` : missed ? 'Not chosen yet' : k === 0 ? 'Optional' : 'One tap'}</i></span></button></li>`;
    }).join('');
    const tap = qi >= qs.length ? qi - qs.length : -1;
    const q = qs[Math.min(qi, qs.length - 1)], di = D.findIndex((d) => d.id === q.domain), a = S.ans[q.id];
    const last = qi === total - 1;
    const seg = qs.map((x, i) => `<i class="${Number.isInteger(S.ans[x.id]) ? 'done' : ''}${i === qi ? ' now' : ''}"></i>`).join('')
      + TAPS.map((_, k) => `<i class="${tapOf(k).n ? 'done' : ''}${qs.length + k === qi ? ' now' : ''}"></i>`).join('');
    const k1 = p1Count(c);
    return `<div class="nsq-start" role="group" aria-label="Part 1, Yourself">
      <span class="eb">Part 1 · Yourself</span>
      <b class="sf">${k1.done ? `${k1.done} of ${k1.total} answered.` : `${k1.total} quick questions.`} <span class="sfi">One per screen.</span></b>
      <span>${k1.done ? 'Pick up where you left off.' : 'Tap an answer, then Next. A few minutes, and your North Star appears.'}</span>
      <button type="button" class="go" data-act="nsq-full" data-f="nsq-full">${k1.done ? 'Continue' : 'Start'} <span class="arr" aria-hidden="true">→</span></button>
    </div>
    <div class="nsb" id="nsb">
      <aside class="nsb-l" aria-label="Part 1, Yourself, and its questions">
        <button type="button" class="nsb-x" data-act="nsb-steps" aria-label="Close the questions">×</button>
        <span class="eb">Your questions · ${esc(stg)}</span>
        <p class="nsb-c">${p1Count(c).done} of ${total} answered</p>
        <ol class="nsb-list" style="--fill: ${Math.round(p1Count(c).done / total * 100)}%">${rows}</ol>
      </aside>
      <section class="nsb-r" id="nsb-r" tabindex="-1" aria-label="The question" aria-keyshortcuts="1 2 3 4 Enter">
        <button type="button" class="nsq-x" data-act="nsq-exit" aria-label="Close the questions">×</button>
        <div class="nsmini" title="Your shape grows with every answer">${miniShape(c)}<span>Your shape</span></div>
        <button type="button" class="nsb-phone" data-act="nsb-steps" aria-label="Show all the questions"><span><i aria-hidden="true"></i>Part 1 · Question ${qi + 1} of ${total}</span><span aria-hidden="true">Questions ▾</span></button>
        <div class="nsb-seg" aria-hidden="true">${seg}</div>
        ${tap >= 0 ? tapsPage(tap, qi + 1, total) : `<span class="eb nsb-lab">0${qi + 1} · ${esc(D[di].name)}</span>
        <div class="nsb-body">
          <div class="nsb-col">
            <h3 class="sf nsb-q" id="qt-${q.id}">${esc(q.text)}</h3>
            <p class="nsb-p">${esc(q.prompt)}</p>
            <div class="nsb-opts" role="group" aria-labelledby="qt-${q.id}">
              ${E.ANSWERS.map(([label, sub], k) => `<button type="button" class="nsb-o" data-act="ans" data-q="${q.id}" data-v="${k}" data-f="ans-${q.id}-${k}" aria-pressed="${a === k}">
                <kbd aria-hidden="true">${k + 1}</kbd><span><b>${label}</b> <span>· ${sub}</span></span></button>`).join('')}
            </div>
            <p class="nsb-keys"><kbd>1–4</kbd> choose · <kbd>Enter ↵</kbd> next</p>
          </div>
          ${Number.isInteger(a) ? `<div><p class="nsb-note" role="status"><small>${a < 2 ? 'Your next step' : 'Keep going'}</small>${esc(noteFor(q, a))}</p>${spark(qi)}</div>` : ''}
        </div>`}
        <footer class="nsb-foot">
          <button type="button" class="nsb-back" data-act="nsmove" data-v="-1" data-f="ns-back"${qi === 0 ? ' disabled' : ''}>← Back</button>
          <button type="button" class="nsb-next" data-act="nsmove" data-v="1" data-f="ns-next">${last ? 'See my North Star' : 'Next ↵'}</button>
        </footer>
      </section>
    </div>`;
  }
  /* Your shape, growing live while you answer (31 Oct, round 4). */
  function miniShape(c) {
    const R = 40, cx = 50, cy = 50, r = c.sc.map((x) => 5 + x.score / 6 * (R - 5));
    const pts = `${cx},${cy - r[0]} ${cx + r[1]},${cy} ${cx},${cy + r[2]} ${cx - r[3]},${cy}`;
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${R}" fill="none" stroke="currentColor" opacity=".18"/><circle cx="50" cy="50" r="${R / 2}" fill="none" stroke="currentColor" opacity=".12"/>
      <line x1="50" y1="6" x2="50" y2="94" stroke="currentColor" opacity=".18"/><line x1="6" y1="50" x2="94" y2="50" stroke="currentColor" opacity=".18"/>
      <polygon class="nsmini-p" points="${pts}" fill="rgba(111,147,184,.35)" stroke="#6F93B8" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="50" cy="${cy - r[0]}" r="3.2" fill="#E0A282"/><circle cx="${cx + r[1]}" cy="50" r="3.2" fill="#9BC0A1"/><circle cx="50" cy="${cy + r[2]}" r="3.2" fill="#91B8D5"/><circle cx="${cx - r[3]}" cy="50" r="3.2" fill="#DDBD69"/></svg>`;
  }
  /* Turn the page: the next question, or after the eighth, the North Star. */
  function nsMove(d) {
    const qs = context().qs, total = qs.length + TAPS.length;
    if (qi === null) qi = firstOpenQ(qs);
    if (d > 0 && qi === total - 1) {
      // The last page: on to the North Star reading, once nothing is open.
      document.body.classList.remove('nsb-open');
      if (!firstOpenItem(context(), 2)) exitFull();
      if (guide(context(), 2)) return;
      const el = document.getElementById('s-reading');
      if (el) { el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
      return;
    }
    const to = Math.max(0, Math.min(total - 1, qi + d));
    if (to === qi) return;
    qi = to; put('questions', pQuestions(context())); placeCrown();
    const r = document.getElementById('nsb-r'); if (r) r.focus({ preventScroll: true });
    toQuestionTop();
  }
  /* The phone (31 Oct, round 4): the questions take the whole screen, one per
   * screen, like the Blueprint. A start card sits where they are on the page,
   * so nobody scrolls past them without seeing them. */
  const isPhone = () => { try { return matchMedia('(max-width: 760px)').matches; } catch { return false; } };
  let fsByUs = false;
  function enterFull(user) {
    if (!isPhone()) { const r = document.getElementById('nsb-r'); if (r) { r.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); r.focus({ preventScroll: true }); } return; }
    document.body.classList.add('nsq-full', 'ns-qview');
    if (user && !document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().then(() => { fsByUs = true; }).catch(() => {});
    const n = document.getElementById('nsb'); if (n) n.scrollTop = 0;
    placeCrown(); const r = document.getElementById('nsb-r'); if (r) r.focus({ preventScroll: true });
  }
  function exitFull() {
    if (!document.body.classList.contains('nsq-full')) return;
    document.body.classList.remove('nsq-full', 'nsb-open'); crownOpen(false);
    if (fsByUs && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    fsByUs = false;
    const q = document.getElementById('questions'); if (q) q.scrollIntoView({ block: 'start' });
  }
  /* After a page turn the question starts at the top of the screen. */
  function toQuestionTop() {
    if (document.body.classList.contains('nsq-full')) { const n = document.getElementById('nsb'); if (n) n.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); return; }
    const r = document.getElementById('nsb-r'), top = (($('.topwrap') || {}).offsetHeight || 0) + 8;
    if (r && r.getBoundingClientRect().top < top) window.scrollTo({ top: r.getBoundingClientRect().top + scrollY - top, behavior: reduced() ? 'auto' : 'smooth' });
  }
  /* A few minutes into the questions, the full-screen button flashes once. */
  let fsTip = null;
  function fullscreenTip() {
    if (fsTip) return;
    fsTip = setTimeout(() => {
      const b = document.querySelector('[data-fs]');
      if (!b || b.hidden || !b.offsetParent || document.fullscreenElement || document.body.classList.contains('nsq-full')) return;
      b.classList.remove('fsflash'); void b.offsetWidth; b.classList.add('fsflash');
      toast('Tip: full screen makes this calmer. Tap the square at the top.');
      setTimeout(() => b.classList.remove('fsflash'), 4000);
    }, 150000);
  }
  const crownMark = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="m12 4 2 8-2 8-2-8z" fill="currentColor" stroke="none"/></svg>';
  const crownClose = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const JEWELS = [
    ['steps', 'Steps', '<path d="M4 7h16M4 12h16M4 17h10"/>'],
    ['download', 'Download', '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'],
    ['music', 'Music', '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'],
    ['focus', 'Focus', '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'],
    ['light', 'Light', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>'],
    ['blueprint', 'Blueprint', '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/>'],
    ['book', 'Book 1:1', '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'],
  ];
  function crownHTML() {
    const jewel = ([k, n, svg], i) => {
      const ang = Math.PI - (i * Math.PI) / 6;
      const pos = `style="--cx:${Math.cos(ang).toFixed(3)};--cy:${(-Math.sin(ang)).toFixed(3)}"`;
      const ico = `<span class="jw-i"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${svg}</svg></span>${n}`;
      if (k === 'book') return `<a class="jw" ${pos} href="${BOOKING}" target="_blank" rel="noopener">${ico}</a>`;
      if (k === 'blueprint') return `<a class="jw" ${pos} href="/ground-plan/">${ico}</a>`;
      return `<button type="button" class="jw" ${pos} data-crown="${k}"${k === 'focus' ? ' aria-pressed="false"' : ''}>${ico}</button>`;
    };
    return `<button type="button" class="crown-veil" data-crown="close" tabindex="-1" aria-label="Close the Crown"></button>
      <p class="crown-hint">Turn the Crown: swipe it left or right to move between questions. Hold it for Focus.</p>
      <nav class="crown-arc" id="crown-arc" aria-label="The Crown">${JEWELS.map(jewel).join('')}</nav>
      <div class="crown-row">
        <button type="button" class="cw-pb" data-act="nsmove" data-v="-1" aria-label="Previous question"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>
        <button type="button" class="crown" id="crownb" aria-expanded="false" aria-controls="crown-arc" aria-label="The Crown: steps, download, music, focus, light, the Founder’s Blueprint, book a 1:1">${crownMark}</button>
        <button type="button" class="cw-pb nx" data-act="nsmove" data-v="1" aria-label="Next question"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
      </div>`;
  }
  /* The Crown sits over the middle of the question page. */
  function placeCrown() {
    const w = document.getElementById('crown'), r = document.getElementById('nsb-r');
    if (!w || !r) return;
    const phone = matchMedia('(max-width: 760px)').matches, b = r.getBoundingClientRect();
    w.style.setProperty('--crx', phone ? '50%' : `${Math.round(b.left + b.width / 2)}px`);
    // On a wide screen it rests between Back and Next while they are in view.
    const f = !phone && r.querySelector('.nsb-foot'), fb = f && f.getBoundingClientRect();
    if (fb && fb.bottom > 0 && fb.top < innerHeight) w.style.setProperty('--cb', `${Math.max(22, Math.round(innerHeight - (fb.top + 20 + (fb.height - 20) / 2) - 32))}px`);
    else w.style.removeProperty('--cb');
  }
  const music = () => { const Mu = window.ESMusic; if (Mu) Mu.enter({ quiet: true }); return Mu; };
  function crownOpen(on) {
    const b = document.getElementById('crownb'); if (!b) return;
    document.body.classList.toggle('crownopen', on);
    b.setAttribute('aria-expanded', String(on));
    b.setAttribute('aria-label', on ? 'Close the Crown' : 'The Crown: steps, download, music, focus, light, the Founder’s Blueprint, book a 1:1');
    b.innerHTML = on ? crownClose : crownMark;
    const f = document.querySelector('.jw[data-crown="focus"]');
    if (f) f.setAttribute('aria-pressed', String(!!(window.ESMusic && window.ESMusic.current().mode === 'focus')));
    if (on) { const j = document.querySelector('.jw'); if (j) j.focus({ preventScroll: true }); }
  }
  function crownAct(k) {
    crownOpen(false);
    if (k === 'steps') { document.body.classList.add('nsb-open'); const n = document.querySelector('.nsb-s.now'); if (n) n.focus({ preventScroll: true }); return; }
    if (k === 'download') { const d = document.querySelector('[data-act="download"]'); if (d) d.click(); return; }
    const Mu = music(); if (!Mu) return;
    if (k === 'music') Mu.openPlayer();
    else if (k === 'light') Mu.openPlayer('mp-light');
    else if (k === 'focus') Mu.mode('focus');
  }
  function mountCrown() {
    if (document.getElementById('crown')) return;
    const w = document.createElement('div');
    w.id = 'crown'; w.className = 'crown-wrap no-print';
    w.innerHTML = crownHTML();
    document.body.appendChild(w);
    w.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.id === 'crownb') { if (swallowed) { swallowed = false; return; } crownOpen(!document.body.classList.contains('crownopen')); return; }
      if (b.dataset.crown === 'close') { crownOpen(false); const c = document.getElementById('crownb'); if (c) c.focus(); return; }
      if (b.dataset.crown) crownAct(b.dataset.crown);
    });
    // Swipe the Crown to turn the page; hold it for Focus.
    let down = null;
    const swallow = () => { swallowed = true; setTimeout(() => { swallowed = false; }, 400); };
    w.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('#crownb') || document.body.classList.contains('crownopen')) return;
      down = { x: e.clientX, y: e.clientY, held: false, t: setTimeout(() => { if (!down) return; down.held = true; swallow(); const Mu = music(); if (Mu) Mu.mode('focus'); }, 650) };
    });
    w.addEventListener('pointermove', (e) => { if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12) clearTimeout(down.t); });
    const up = (e) => {
      if (!down) return; const d = down; down = null; clearTimeout(d.t);
      if (d.held || e.type === 'pointercancel') return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swallow(); nsMove(dx < 0 ? 1 : -1); }
    };
    w.addEventListener('pointerup', up); w.addEventListener('pointercancel', up);
    // Shown while the questions are on screen.
    const q = document.getElementById('questions');
    if (q && 'IntersectionObserver' in window) {
      new IntersectionObserver((es) => es.forEach((x) => { const on = x.isIntersecting || document.body.classList.contains('nsq-full'); document.body.classList.toggle('ns-qview', on); if (!on) crownOpen(false); placeCrown(); }), { rootMargin: '-25% 0px -25% 0px' }).observe(q);
    } else document.body.classList.add('ns-qview');
    window.addEventListener('resize', placeCrown);
    let rq = 0; window.addEventListener('scroll', () => { if (!rq) rq = requestAnimationFrame(() => { rq = 0; placeCrown(); }); }, { passive: true });
  }
  let swallowed = false;

  /* The compass (31 Oct): the four domains with their names outside the
   * circle, in readable type. Solid: your answers to the questions; dashed:
   * your strengths as you rated them. The gap between the two is the point. */
  function pCompass(c, withAnswers, prev = null) {
    const R = 150, cx = 280, cy = 250, sc = c.sc.map((s) => s.score), str = c.rd.str;
    const rA = sc.map((v) => 14 + v / 6 * (R - 14)), rS = str.map((v) => 14 + v / 5 * (R - 14));
    const pts = (r) => `${cx},${cy - r[0]} ${cx + r[1]},${cy} ${cx},${cy + r[2]} ${cx - r[3]},${cy}`;
    const anyS = str.some((v) => v > 0);
    return `<svg class="nscompass" viewBox="0 0 560 500" role="img" aria-label="Your North Star. Your answers: Lead yourself ${sc[0]}, Lead your people ${sc[1]}, Lead your business ${sc[2]}, Lead the market ${sc[3]}, each out of 6. Your strengths: ${str.join(', ')}, each out of 5.">
      <circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="#2A3A50"/><circle cx="${cx}" cy="${cy}" r="100" fill="none" stroke="#2A3A50"/><circle cx="${cx}" cy="${cy}" r="50" fill="none" stroke="#2A3A50"/>
      <line x1="${cx}" y1="${cy - 160}" x2="${cx}" y2="${cy + 160}" stroke="#2A3A50"/><line x1="${cx - 160}" y1="${cy}" x2="${cx + 160}" y2="${cy}" stroke="#2A3A50"/>
      ${withAnswers && anyS ? `<polygon class="nsgap" points="${pts(rS)}" fill="#D6BF8F" stroke="#D6BF8F" stroke-width="2" stroke-linejoin="round"/>` : ''}
      ${anyS ? `<polygon points="${pts(rS)}" fill="none" stroke="#EEF2F7" stroke-width="2" stroke-dasharray="7 5"/>` : ''}
      ${withAnswers ? `<polygon points="${pts(rA)}" fill="${anyS ? '#22405F' : 'rgba(111,147,184,.35)'}" stroke="#6F93B8" stroke-width="3" stroke-linejoin="round"/>

      <circle cx="${cx}" cy="${cy - rA[0]}" r="7" fill="#E0A282"/><circle cx="${cx + rA[1]}" cy="${cy}" r="7" fill="#9BC0A1"/><circle cx="${cx}" cy="${cy + rA[2]}" r="7" fill="#91B8D5"/><circle cx="${cx - rA[3]}" cy="${cy}" r="7" fill="#DDBD69"/>` : ''}
      ${withAnswers ? '' : `<g class="nsseal" aria-hidden="true"><polygon points="${pts([96, 96, 96, 96])}" fill="rgba(111,147,184,.10)" stroke="#6F93B8" stroke-width="2" stroke-dasharray="3 7"/>
        <rect x="${cx - 92}" y="${cy + 30}" width="184" height="46" rx="23" fill="#0E1C2B" stroke="#6F93B8" stroke-width="1.2"/>
        <g transform="translate(${cx - 76} ${cy + 42})" fill="none" stroke="#A9C0D9" stroke-width="1.6"><rect x="0" y="9" width="16" height="12" rx="2"/><path d="M3.5 9V6a4.5 4.5 0 0 1 9 0v3"/></g>
        <text x="${cx + 10}" y="${cy + 51}" text-anchor="middle" fill="#EEF2F7" font-size="12" font-weight="600" letter-spacing="1.6">YOUR ANSWERS</text>
        <text x="${cx + 10}" y="${cy + 67}" text-anchor="middle" fill="#A9C0D9" font-size="11.5">sealed until Part 1</text></g>`}
      ${prev ? `<polygon points="${pts(prev.map((v) => 14 + v / 6 * (R - 14)))}" fill="none" class="nsprev" stroke="#C9D3DE" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>` : ''}
      <circle cx="${cx}" cy="${cy}" r="7" fill="#0E1C2B" stroke="#6F93B8" stroke-width="2"/>
      <text x="${cx}" y="62" fill="#E0A282" class="cl" text-anchor="middle">LEAD YOURSELF</text>
      <text x="${cx + 166}" y="${cy - 8}" fill="#9BC0A1" class="cl">LEAD YOUR</text><text x="${cx + 166}" y="${cy + 16}" fill="#9BC0A1" class="cl">PEOPLE</text>
      <text x="${cx}" y="${cy + 190}" fill="#91B8D5" class="cl" text-anchor="middle">LEAD YOUR BUSINESS</text>
      <text x="${cx - 166}" y="${cy - 8}" fill="#DDBD69" class="cl" text-anchor="end">LEAD THE</text><text x="${cx - 166}" y="${cy + 16}" fill="#DDBD69" class="cl" text-anchor="end">MARKET</text>
    </svg>`;
  }
  const compassKey = (withAnswers) => `<div class="nskey">
      <span><i class="k-str"></i><b>Your strengths</b><small>as you rate yourself, now</small></span>
      <span><i class="k-ans${withAnswers ? '' : ' sealed'}"></i><b>Your answers</b><small>${withAnswers ? 'from the questions in Part 1' : 'sealed: they appear after Part 1'}</small></span>
      ${withAnswers ? '<span><i class="k-gap"></i><b>Unused potential</b><small>where your strengths reach further than your answers</small></span>' : ''}
      ${withAnswers ? '<p>Where the gold shows, you can do more than you do today.</p>' : '<p class="nsdare"><b>A small dare.</b> Rate yourself now, honestly. After the questions we open the seal and lay your answers over your rating. Will the two shapes agree?</p>'}
    </div>`;

  /* Before you start: your four strengths, and the compass drawing them. */
  function pStrengths(c) {
    const str = c.rd.str;
    return `<div style="display: flex; flex-direction: column; gap: 6px"><h2 class="sf" style="font-size: 26px; line-height: 1.15">Your four strengths, <span class="sfi" style="color: var(--goldink)">as you see them.</span></h2>
        <p style="color: var(--muted)">1 = not yet · 5 = people come to me for this.</p></div>
      <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch">
        <div class="card" style="flex: 1 1 320px; min-width: 0; padding: 18px; display: flex; flex-direction: column; gap: 14px">
          ${E.STRENGTHS.map((st, i) => `<div class="nsstr" data-sti="${i}" style="display: flex; flex-direction: column; gap: 6px">
            <span style="font-weight: 520; font-size: 14px" id="st-${i}">${st.name}</span>
            <div style="display: flex; gap: 6px" role="group" aria-labelledby="st-${i}">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-act="str" data-i="${i}" data-v="${n}" data-f="str-${i}-${n}" aria-label="${st.name}: ${n} of 5" aria-pressed="${str[i] === n}" style="flex: 1; min-height: 44px; border-radius: 5px; border: 1.5px solid ${str[i] >= n ? '#6F93B8' : 'var(--line)'}; background: ${str[i] >= n ? '#6F93B8' : 'var(--paper)'}; color: ${str[i] >= n ? '#0E1C2B' : 'var(--ink)'}; cursor: pointer; font-weight: 520">${n}</button>`).join('')}</div></div>`).join('')}
        </div>
        <div class="deep nscompbox" style="flex: 1 1 380px">${pCompass(c, false)}${compassKey(false)}</div>
      </div>`;
  }

  /* The end of Part 1: your answers beside your strengths, and where to start. */
  function pReading(c) {
    const any = c.rd.any, hi = c.rd.hi, lo = c.rd.lo, done = partState(c).p1.done === partState(c).p1.total;
    return `<div style="display: flex; flex-direction: column; gap: 8px; max-width: 700px">
        <span class="eb">${done ? 'Part 1 done · your North Star' : 'Your North Star · fills in as you answer'}</span>
        <h2 class="sf" style="font-size: clamp(28px, 3.6vw, 40px); line-height: 1.05">Your answers <span class="sfi" style="color: var(--goldink)">beside your strengths.</span></h2></div>
      ${done ? pGap(c) : ''}
      ${done ? pCompare(c) : ''}
      <div class="deep nscompbox nsreading">
        ${pCompass(c, true, UI.cmp && S.history.length ? S.history[S.history.length - 1].sc : null)}
        <div style="display: flex; flex-direction: column; gap: 14px">
          ${compassKey(true)}
          <div class="nsread"><span class="eb" style="color: #9BC0A1">Strongest</span><b class="sf">${any ? D[hi].name : 'Answer to see it'}</b></div>
          <div class="nsread"><span class="eb" style="color: #E0A282">Needs you first</span><b class="sf">${any ? D[lo].name : '—'}</b></div>
          <div class="nsread"><span class="eb" style="color: #A9C0D9">Start here</span><span>${any ? D[lo].step : 'Your first move appears here.'}</span></div>
        </div>
      </div>`;
  }

  /* The message of Part 1 (31 Oct, rounds 4 and 6): you have more in you than
   * you are using. Built only from their own rating and their own answers:
   * the share of the strength they see in themselves that their answers do
   * not show at work yet. Then "Find out why": what they are probably feeling,
   * so they feel understood, and the Blueprint as the way to close it. */
  const GAP_WHY = [
    { why: 'You know what matters, but your week is run by what is urgent.', feel: ['You start the week with a plan and end it with someone else’s', 'You say yes before you check what it costs you', 'Rest feels like falling behind', 'You are busy all day and still not sure you moved forward'], cost: 'Every week your strength stays unused, the business decides your life instead of you.' },
    { why: 'You are good with people, but you still carry what others could hold.', feel: ['You redo work rather than explain it again', 'You put off the honest conversation until it becomes a problem', 'People wait for you before they decide anything', 'You feel alone with the hard calls'], cost: 'Your people, or your first helper, cannot grow while you hold everything.' },
    { why: 'You can handle numbers and systems, but they are not steering your decisions yet.', feel: ['You look at the numbers only when you are worried', 'A busy month still leaves less than you expected', 'Your price was set by fear, not by your time', 'The system lives in your head, so it breaks when you are away'], cost: 'Without the numbers leading, every decision is a guess, and guesses cost money.' },
    { why: 'You can speak and sell, but the right people do not hear you often enough.', feel: ['Some months are full, others empty, and you are not sure why', 'You explain your offer differently every time', 'You wait for referrals instead of asking', 'You compete on price because the value is not clear'], cost: 'The right customers cannot choose you if they never hear you clearly.' },
  ];
  function gapOf(c) {
    const str = c.rd.str, sc = c.sc.map((x) => x.score);
    const gap = D.map((_, i) => (str[i] ? str[i] / 5 - sc[i] / 6 : 0));
    const order = [0, 1, 2, 3].filter((i) => gap[i] > 0.08).sort((a, b) => gap[b] - gap[a]);
    const seen = str.reduce((a, v) => a + v / 5, 0), unused = D.reduce((a, _, i) => a + Math.max(0, gap[i]), 0);
    return { order, pct: seen > 0 ? Math.round(unused / seen * 100) : 0, strong: [0, 1, 2, 3].filter((i) => str[i] >= 4).map((i) => D[i].name) };
  }
  function pGap(c) {
    const G = gapOf(c), list = (a) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0] || '');
    if (!G.order.length) return `<div class="nsgapmsg calm"><span class="eb">What your North Star says</span><b class="sf">You use what you have. <span class="sfi">Now aim higher.</span></b>
      <p>Your answers keep up with how you rate yourself. That is a strength in itself. The next step is to raise both: more of what you are good at, in more of your week.</p></div>`;
    const open = !!UI.why, top = G.order.slice(0, 2);
    return `<div class="nsgapmsg alarm" role="region" aria-label="Your unused potential">
      <span class="eb">What your North Star says</span>
      <div class="gapbig"><b class="gappct">${G.pct}%</b><b class="sf">of the strength you see in yourself <span class="sfi">is not at work yet.</span></b></div>
      <p>${G.strong.length ? `You see real strength in ${list(G.strong)}. ` : 'The strengths you rated are real. '}Your answers show they are not all at work, most of all in <b>${D[G.order[0]].name}</b>. The gold in your North Star is that gap. It is not a weakness: the strengths are already yours. You can do much more with what you have.</p>
      <button type="button" class="gapwhy no-print" data-act="why" data-f="why" aria-expanded="${open}">${open ? 'Hide this ↑' : 'Find out why, and what you are probably feeling →'}</button>
      ${open ? `<div class="gapfeel pop">${top.map((i) => `<div class="gapdom"><span class="eb" style="color: ${LIGHT[i]}">${D[i].name}</span>
          <b class="sf">${esc(GAP_WHY[i].why)}</b>
          <p class="gapq">Does this sound like you?</p>
          <ul>${GAP_WHY[i].feel.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <p class="gapcost">${esc(GAP_WHY[i].cost)}</p></div>`).join('')}
        <div class="gapnext"><p class="sf">This is exactly the work of The Founder’s Blueprint: week by week, from knowing it to doing it, with Alexandru and the team beside you.</p>
          <a class="go" href="/ground-plan/#home">Start closing the gap · the Launchpad is free <span class="arr" aria-hidden="true">→</span></a></div></div>` : ''}
    </div>`;
  }

  /* ── Check your North Star again (31 Oct, round 6) ─────────────────────────
   * Each finished North Star is kept with its date (S.history, saved with the
   * account), so a founder can take it again and see how things changed. */
  function snapshot(c) {
    return { at: new Date().toISOString(), stage: S.stage, sc: c.sc.map((x) => x.score), n: c.sc.map((x) => x.answered), str: c.rd.str.slice(), pct: c.rd.any ? gapOf(c).pct : 0, values: S.values.slice() };
  }
  const dateOf = (iso) => { try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; } };
  function retake() {
    const c = context();
    if (partState(c).fin[0]) { S.history = [...S.history, snapshot(c)].slice(-12); }
    Object.assign(S, { ans: {}, str: {}, pains: [], want: '', want2: '', values: [], p2: { team: '', ans: {} }, got: {}, more: {}, pgot: {}, pmore: {}, group: 0, lean: null });
    S.lab = { ...S.lab, p: 0, m: 0, f: 0, d: 0 };
    UI.again = false; UI.cmp = false; UI.why = false; qi = null; p2i = null; dirty = true;
    save(); render(); sync();
    toast('A fresh North Star. Your last one is kept, so you can compare when you finish.');
    go('clear');
  }
  const pAgain = () => (UI.again ? `<div class="card pop nsagain" role="dialog" aria-labelledby="ag-h">
      <span class="eb">Check your North Star again</span>
      <b class="sf" id="ag-h">Start a fresh North Star?</b>
      <p>${partState(context()).fin[0] ? 'Your current one is kept with today’s date. When you finish the new one, you can lay the two side by side and see what changed.' : 'You have not finished this one yet. Starting fresh clears these answers.'}</p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap"><button type="button" class="go" data-act="again-go" data-f="again-go">Start fresh</button><button type="button" class="nslink" data-act="again-no">Not now</button></div></div>` : '');
  /* Side by side with the last one: the shape on the compass, and each domain's change. */
  function pCompare(c) {
    const H = S.history, last = H[H.length - 1];
    if (!last || !partState(c).fin[0]) return '';
    const now = c.sc.map((x) => x.score), was = last.sc, pct = c.rd.any ? gapOf(c).pct : 0;
    const arrow = (d) => (d > 0 ? `<b class="up">+${d}</b>` : d < 0 ? `<b class="down">${d}</b>` : '<b class="same">same</b>');
    return `<div class="nscmp">
      <div class="nscmp-head"><span class="eb">Your North Stars · ${H.length + 1} taken</span>
        <button type="button" class="nslink" data-act="cmp" data-f="cmp" aria-expanded="${!!UI.cmp}">${UI.cmp ? 'Hide the comparison' : `Compare with ${dateOf(last.at)}`}</button>
        <button type="button" class="nslink" data-act="again" data-f="again-2">Check your North Star again</button></div>
      ${UI.cmp ? `<div class="nscmp-body pop"><table><thead><tr><th></th><th>${dateOf(last.at)}</th><th>Now</th><th>Change</th></tr></thead><tbody>
        ${D.map((d, i) => `<tr><td style="color: ${CSSV[i]}">${d.name}</td><td>${was[i]} of 6</td><td>${now[i]} of 6</td><td>${arrow(now[i] - was[i])}</td></tr>`).join('')}
        <tr><td>Unused potential</td><td>${last.pct}%</td><td>${pct}%</td><td>${pct < last.pct ? `<b class="up">${pct - last.pct} points</b>` : pct > last.pct ? `<b class="down">+${pct - last.pct} points</b>` : '<b class="same">same</b>'}</td></tr></tbody></table>
        <p class="tiny">The dotted grey shape on your North Star is ${dateOf(last.at)}. ${H.length > 1 ? `Earlier: ${H.slice(0, -1).map((h) => dateOf(h.at)).join(', ')}.` : ''}</p></div>` : ''}
    </div>`;
  }

  /* ── The feedback window after every part (31 Oct) ───────────────────────
   * One shape for all four parts, in its own warm colour: the founder's road
   * in five steps, in the order every business walks them, with where their
   * answers put them; two or three short cards; "Got it"; more feedback for
   * whoever wants it; then a push on to the next part. */
  const ROAD = [['The idea', 'Something you care about, and the talent to build it.'],
    ['The problem it solves', 'You understand the problem well enough to solve it.'],
    ['The people who need it', 'You reach the people who have that problem, in their words.'],
    ['The first yes', 'People start to pay. Interest turns into customers.'],
    ['More, and better', 'You multiply what works, and improve the rest.']];
  const roadPos = () => (S.mode === 'idea' ? 0 : S.mode === 'offer' ? 2 : S.stage === 'building' ? 3 : 4);
  const BAND_INK = ['#B4703F', '#9A7418', '#4C7355'];
  const chip = (bi, t) => `<span class="fbchip" style="--c: ${bi === null ? '#8A7A5E' : BAND_INK[bi]}">${esc(t)}</span>`;
  /** notes: one line per step from the founder's answers ('' = nothing yet);
   *  bands: the band behind each line, or null. */
  /* Part 4 says the same five steps as promises (31 Oct, round 4). */
  const ROAD_PROMISE = [['A reason worth building for', 'You know why you do this, and what it must protect.'],
    ['A problem you solve well', 'Customers get the result, the same good way every time.'],
    ['The right people find you fast', 'Your message is so clear they recognise themselves in it.'],
    ['Your first clients say yes', 'They pay, they come back, and they send others.'],
    ['Your first people help you', 'Others carry part of the work, and your hours come back.']];
  function roadHTML(notes, bands, road = ROAD) {
    const pos = roadPos();
    return `<ol class="fbroad" aria-label="Your road in five steps">${road.map(([t, l], i) => {
      const st = i < pos ? 'done' : i === pos ? 'here' : 'next';
      return `<li class="${st}"><span class="fbn" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="${starPath(20, 20, st === 'here' ? 18 : 15)}"/></svg><i>${i + 1}</i></span>
        <div><span class="fbst">${st === 'here' ? 'You are here' : st === 'done' ? 'Behind you' : 'Ahead'}</span><b class="sf">${t}</b><span class="fbl">${l}</span>
        ${notes[i] ? `<span class="fbnote">${bands && bands[i] !== null && bands[i] !== undefined ? chip(bands[i], E.BANDS[bands[i]]) : ''}${esc(notes[i])}</span>` : ''}</div></li>`;
    }).join('')}</ol>`;
  }
  /** The window itself (round 4): a short letter from Alexandru first, with
   *  "Got it"; the road under it; the detail behind "More feedback"; then a
   *  push on to the next part.
   *  o = { n, eyebrow, title, letter: [3 lines], ask, road, roadTitle, cards, more, next } */
  function fbWindow(o) {
    const open = !!S.pmore[o.n], first = (S.profile.first || '').trim().split(' ')[0];
    return `<div class="nsfbw pop${o.inner ? ' inner' : ''}" id="fbw-in-${o.n}">
      <div class="fbhead"><span class="eb fbeb">${o.eyebrow}</span><h2 class="sf">${o.title}</h2></div>
      <div class="fbletter">
        <p class="fbl-hi">Dear ${first ? esc(first) : 'founder'},</p>
        ${o.letter.filter(Boolean).map((l) => `<p>${esc(l)}</p>`).join('')}
        <p class="fbl-ps"><b>P.S.</b> Ask yourself: “${esc(o.ask)}”</p>
        <div class="fbl-sign"><img src="/mail/signature.png" alt="Alexandru" loading="lazy"><span>Alexandru and the team · ExploraSelf</span></div>
        <label class="fbgot"><input type="checkbox" data-act="pgot" data-i="${o.n}" data-f="pgot-${o.n}"${S.pgot[o.n] ? ' checked' : ''}>Got it, I’ve read this</label>
      </div>
      ${o.road ? `<div class="fbroadwrap"><span class="eb fbeb">${o.roadTitle || 'Your road, in five steps'}</span>${o.road}</div>` : ''}
      <button type="button" class="fbmore no-print" data-act="pmore" data-i="${o.n}" data-f="pmore-${o.n}" aria-expanded="${open}">${open ? 'Less feedback ↑' : 'More feedback ↓'}</button>
      ${open ? `<div class="fbdeep pop">${o.cards ? `<div class="fbcards">${o.cards}</div>` : ''}${o.more || ''}</div>` : ''}
      ${o.next ? `<div class="fbnext">${o.next}</div>` : ''}
    </div>`;
  }
  const fbList = (rows) => `<ol class="fblist">${rows.map(([k, a, note]) => `<li><b>${esc(k)}</b><span>${esc(a)}</span><i>${esc(note)}</i></li>`).join('')}</ol>`;
  const nextBtn = (line, label, go) => `<p class="sf">${line}</p><button type="button" class="go fbgo" data-go="${go}" data-f="fbgo-${go}">${label} <span class="arr" aria-hidden="true">→</span></button>`;
  const named = (list, ids) => list.filter((x) => ids.includes(x[0])).map((x) => x[1]);

  /* Part 1 · Yourself: the window, once Part 1 is done. */
  function pFb1(c) {
    if (!partState(c).fin[0]) return '';
    const rd = c.rd, sc = c.sc, f = (i) => E.feedback(i, sc[i], S.pains, wants());
    const bi = (i) => (sc[i].answered ? sc[i].band : null);
    const notes = [`Lead yourself: ${f(0).big}`, `Lead your business: ${f(2).big}`, `Lead the market: ${f(3).big}`,
      S.mode === 'yes' ? 'People already pay you. That is your proof.' : S.mode === 'offer' ? 'Your offer is ready. The first yes is your next milestone.' : 'Not yet. First the problem, then the people, then the yes.',
      `Lead your people: ${f(1).big}`];
    const bands = [bi(0), bi(2), bi(3), null, bi(1)];
    const said = [['It hurts', named(E.PAINS, S.pains)], ['You want', named(E.GOALS, wants())], ['You care about', named(M.VALUES, S.values)]].filter((x) => x[1].length);
    // Where their rating and their answers part by more than a third.
    const gaps = D.map((d, i) => [d.name, rd.str[i] / 5 - sc[i].score / 6]).filter(([, g]) => Math.abs(g) > 0.33);
    const more = `<div class="fbcols"><div><span class="eb fbeb">Your ${c.qs.length} answers</span>${fbList(c.qs.filter((q) => Number.isInteger(S.ans[q.id])).map((q) => [q.short, E.ANSWERS[S.ans[q.id]][0], noteFor(q, S.ans[q.id])]))}</div>
      <div><span class="eb fbeb">Your rating against your answers</span>${gaps.length ? gaps.map(([n, g]) => `<p>${g > 0 ? `You rate yourself higher in <b>${n}</b> than your answers do. Look twice: a strength you feel is not yet a strength you can show.` : `Your answers in <b>${n}</b> are stronger than your rating. You do better than you give yourself credit for.`}</p>`).join('') : '<p>Your rating and your answers agree. You see yourself clearly, and that is a strength in itself.</p>'}
        <span class="eb fbeb" style="margin-top: 10px">This week</span><p>${esc(f(rd.lo).week)}</p></div></div>`;
    const wl = named(E.GOALS, wants()).map((x) => x.toLowerCase()), vl = named(M.VALUES, S.values).map((x) => x.toLowerCase());
    const letter = [`Your strongest side is ${D[rd.hi].name}. ${f(rd.hi).big}`,
      `What needs you first is ${D[rd.lo].name}. Start here: ${D[rd.lo].step}`,
      wl.length || vl.length ? `You told me ${wl.length ? 'you want ' + wl.join(' and ') : ''}${wl.length && vl.length ? ', and ' : ''}${vl.length ? 'you care most about ' + vl.join(' and ') : ''}. Every step from here must protect that.` : ''];
    return fbWindow({ n: 1, eyebrow: 'Part 1 done · your feedback', title: 'Your road so far.', letter,
      road: roadHTML(notes, bands), roadTitle: 'Your road, in five steps · where your answers put you',
      cards: `<div class="fbcard"><span class="eb fbeb">What your answers say</span>
          <p><small>Strongest</small><b class="sf">${D[rd.hi].name}</b></p><p><small>Needs you first</small><b class="sf">${D[rd.lo].name}</b></p><p><small>Start here</small>${esc(D[rd.lo].step)}</p></div>
        <div class="fbcard"><span class="eb fbeb">What you told us</span>${said.map(([k, v]) => `<p><small>${k}</small>${esc(v.join(' · '))}</p>`).join('')}
          ${S.values.length ? '<p class="fbsoft">Every step we suggest from here must protect what you care about.</p>' : ''}</div>`,
      ask: f(rd.lo).ask, more,
      next: nextBtn('You looked at yourself honestly. That is the hardest part, and it is done. Now the people around you: your customers and your team.', 'Go to Part 2 · Your people', 'people') });
  }

  /* Part 2 · Your people: who works with you, then six questions, then the window. */
  const P2FB = {
    yes: [{ big: 'Your customers are still a crowd, not names.', ask: 'Who are the five customers you most want more of?' },
      { big: 'You know your customers. Now let their words lead.', ask: 'What did your best customer say the last time they thanked you?' },
      { big: 'Your customers are clear. Grow toward them.', ask: 'Which of them would introduce you to someone just like them?' }],
    plan: [{ big: 'The people who need you have no names yet.', ask: 'Who are five real people with this problem?' },
      { big: 'You have met the problem. Now ask for the first yes.', ask: 'Who will you ask for a small yes this month?' },
      { big: 'You have evidence. Keep asking, the same way.', ask: 'Who are the next five people to ask?' }],
    solo: [{ big: 'You are the whole team, and your week shows it.', ask: 'What is the first task you would give away?' },
      { big: 'Your first helper is closer than it feels.', ask: 'Which page could you write this week, so someone else can do the task?' },
      { big: 'You are ready for help. Set the date.', ask: 'In which month does your first helper start?' }],
    team: [{ big: 'People help, but the decisions still come back to you.', ask: 'What does a good week look like for each person?' },
      { big: 'Your team is taking shape. Now give them room.', ask: 'Which decision could someone make without you next week?' },
      { big: 'Your people can lead. Let them.', ask: 'Who is ready to own something you still hold?' }],
  };
  function p2Read() {
    const qs = M.P2.questions(S.mode, S.p2.team), cq = qs.slice(0, 3), tq = qs.slice(3);
    const sum = (l) => l.reduce((a, q) => a + (S.p2.ans[q.id] || 0), 0), bandOf = (v) => (v <= 3 ? 0 : v <= 6 ? 1 : 2);
    const cb = bandOf(sum(cq)), tb = bandOf(sum(tq));
    return { qs, cq, tq, cb, tb, cust: P2FB[S.mode === 'yes' ? 'yes' : 'plan'][cb], team: P2FB[S.p2.team === 'solo' ? 'solo' : 'team'][tb] };
  }
  function pPeople(c) {
    const T = S.p2.team, R = T ? p2Read() : null;
    const card = (q, k) => { const a = S.p2.ans[q.id];
      return `<div class="p2q card${p2At() === k + 1 ? ' cur' : ''}" id="p2-${q.id}">
        <span class="eb">${String(k + 1).padStart(2, '0')} · ${esc(q.short)}</span>
        <h3 class="sf" id="p2t-${q.id}">${esc(q.text)}</h3><p class="p2p">${esc(q.prompt)}</p>
        <div class="p2opts" role="group" aria-labelledby="p2t-${q.id}">${E.ANSWERS.map(([label, sub], v) => `<button type="button" class="nsb-o" data-act="p2ans" data-q="${q.id}" data-v="${v}" data-f="p2-${q.id}-${v}" aria-pressed="${a === v}"><span><b>${label}</b> <span>· ${sub}</span></span></button>`).join('')}</div>
        ${Number.isInteger(a) ? `<p class="p2note pop"><small>${a < 2 ? 'Your next step' : 'Keep going'}</small>${esc(a < 2 ? q.lo : q.hi)}</p>` : ''}</div>`; };
    const n2 = T ? 1 + R.qs.length : 7, d2 = (T ? 1 : 0) + (T ? R.qs.filter((q) => Number.isInteger(S.p2.ans[q.id])).length : 0), at = p2At();
    return `<div class="nsq-start p2-start" role="group" aria-label="Part 2, Your people">
      <span class="eb">Part 2 · Your people</span>
      <b class="sf">${d2 ? `${d2} of ${n2} answered.` : `${n2} quick questions.`} <span class="sfi">One per screen.</span></b>
      <span>${d2 ? 'Pick up where you left off.' : 'Your customers, and the people who do the work with you.'}</span>
      <button type="button" class="go" data-act="p2-full" data-f="p2-full">${d2 ? 'Continue' : 'Start'} <span class="arr" aria-hidden="true">→</span></button></div>
    <div class="p2nav" aria-live="polite"><span>Part 2 · Question ${Math.min(at + 1, n2)} of ${n2}</span><button type="button" class="nsq-x" data-act="p2-exit" aria-label="Close the questions">×</button>
      <i class="p2seg">${Array.from({ length: n2 }, (_, k) => `<b class="${k < at ? 'done' : k === at ? 'now' : ''}"></b>`).join('')}</i></div>
    <div class="card p2team${at === 0 ? ' cur' : ''}" id="p2-team"><h3 class="sf" id="p2team-h">First: who does the work with you today?</h3>
        <div class="p2opts" role="group" aria-labelledby="p2team-h">${M.P2.team.map(([id, t, sub]) => `<button type="button" class="nsb-o" data-act="p2team" data-v="${id}" data-f="p2team-${id}" aria-pressed="${T === id}"><span><b>${t}</b> <span>· ${sub}</span></span></button>`).join('')}</div></div>
      ${T ? `<span class="eb p2grp">${S.mode === 'yes' ? 'Your customers' : 'Your first customers'}</span>${R.cq.map((q, k) => card(q, k)).join('')}
        <span class="eb p2grp">${T === 'solo' ? 'Your first team, before you have one' : 'Your team'}</span>${R.tq.map((q, k) => card(q, k + 3)).join('')}` : ''}
      <div class="p2foot"><button type="button" class="nsb-back" data-act="p2move" data-v="-1"${at === 0 ? ' disabled' : ''}>← Back</button><button type="button" class="nsb-next" data-act="p2move" data-v="1">${at >= n2 - 1 ? 'See my feedback' : 'Next ↵'}</button></div>`;
  }
  /* Part 2 on the phone (31 Oct, round 5): one question per full screen, like
   * Part 1. p2i is the card on screen: 0 = who works with you, 1–6 the questions. */
  let p2i = null;
  const p2At = () => { if (p2i !== null) return p2i; if (!S.p2.team) return 0; const qs = M.P2.questions(S.mode, S.p2.team), k = qs.findIndex((q) => !Number.isInteger(S.p2.ans[q.id])); return k < 0 ? qs.length : k + 1; };
  function p2Full(on) {
    document.body.classList.toggle('p2-full', on);
    if (on) { p2i = Math.min(p2At(), 6); put('p2', pPeople(context())); const el = document.getElementById('p2'); if (el) el.scrollTop = 0; }
    else { p2i = null; const d = document.getElementById('nsdiv-2'); if (d) d.scrollIntoView({ block: 'start' }); }
  }
  function p2Move(d) {
    const n = S.p2.team ? 1 + M.P2.questions(S.mode, S.p2.team).length : 1, at = p2At();
    if (d > 0 && at >= n - 1) { p2Full(false); render(); const w = document.getElementById('fbw-2'); if (w && w.innerHTML) setTimeout(() => w.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }), 60); return; }
    p2i = Math.max(0, Math.min(n - 1, at + d)); put('p2', pPeople(context()));
    const el = document.getElementById('p2'); if (el) el.scrollTop = 0;
  }
  function pFb2(c) {
    if (!partState(c).fin[1]) return '';
    const R = p2Read(), last = S.p2.ans[R.cq[2].id];
    const notes = ['', '', R.cust.big, S.mode === 'yes' ? (last >= 2 ? 'You listen, and you change. That keeps the yes coming.' : 'The yes is there. Listening keeps it.') : (last >= 2 ? 'Someone said yes with money. That is evidence.' : 'The first yes is the next thing to ask for.'), R.team.big];
    const bands = [null, null, R.cb, null, R.tb];
    const low = R.qs.slice().sort((x, y) => S.p2.ans[x.id] - S.p2.ans[y.id])[0];
    return fbWindow({ n: 2, eyebrow: 'Part 2 done · your feedback', title: 'Your people, on your road.',
      letter: [`Your customers: ${R.cust.big}`, `${S.p2.team === 'solo' ? 'Your first team' : 'Your team'}: ${R.team.big}`, `One thing for this week: ${S.p2.ans[low.id] < 2 ? low.lo : low.hi}`],
      road: roadHTML(notes, bands), roadTitle: 'Customers carry steps 3 and 4. Your team carries step 5.',
      cards: `<div class="fbcard"><span class="eb fbeb">Your customers</span>${chip(R.cb, E.BANDS[R.cb])}<b class="sf">${esc(R.cust.big)}</b><span class="fbsoft">${esc(R.cust.ask)}</span></div>
        <div class="fbcard"><span class="eb fbeb">${S.p2.team === 'solo' ? 'Your first team' : 'Your team'}</span>${chip(R.tb, E.BANDS[R.tb])}<b class="sf">${esc(R.team.big)}</b><span class="fbsoft">${esc(R.team.ask)}</span></div>`,
      ask: (R.cb <= R.tb ? R.cust : R.team).ask,
      more: `<span class="eb fbeb">Your six answers</span>${fbList(R.qs.map((q) => [q.short, E.ANSWERS[S.p2.ans[q.id]][0], S.p2.ans[q.id] < 2 ? q.lo : q.hi]))}`,
      next: nextBtn('You know who you serve, and who serves with you. Next: the numbers that hold it all together. Rough is fine.', 'Go to Part 3 · Your numbers', 'numbers') });
  }

  /* Part 3 · Your numbers: the road, read through the numbers, under the four domain cards. */
  function pFb3(c) {
    if (!partState(c).fin[2]) return '';
    const n = c.n;
    const nl = S.mode === 'yes' ? E.numberLines(n, money) : ['', '', '', ''];
    const ins = (k) => E.insight(k, n, S.mode, money) || '';
    const notes = S.mode === 'yes'
      ? [nl[0] ? 'Your hours: ' + nl[0] + '.' : '', nl[2] ? 'Your month: ' + nl[2] + '.' : '', nl[3] ? 'Your customers: ' + nl[3] + '.' : '', n.newc ? `${n.newc.est ? 'About ' : ''}${whole(n.newc.v)} new paying customers this month.` : '', nl[1] ? 'Your time: ' + nl[1] + '.' : '']
      : [ins('road'), ins('offer'), ins('market'), '', ''];
    const said = notes.filter(Boolean);
    return fbWindow({ n: 3, inner: true, eyebrow: 'Part 3 done · your feedback', title: 'Your numbers, on your road.',
      letter: said.length ? said.slice(0, 3) : ['Your numbers are on paper now, not in your head. That alone changes how you decide.'],
      ask: 'Which one number will you check every Monday, and what will you do when it moves?',
      road: roadHTML(notes, null), roadTitle: 'Your road, read through your numbers',
      more: `<span class="eb fbeb">Everything your numbers said</span>${fbList(E.groupsFor(S.mode).map((g) => [g.title, '', E.insight(g.key, n, S.mode, money) || 'Not enough yet to say anything.']))}`,
      next: nextBtn('Now the fun part: move four levers on your own month and watch the answer change.', 'Go to Part 4 · Your next steps', 'plan') });
  }

  /* Part 4 · Your next steps: once a lever has moved. */
  function pFb4(c) {
    const { p = 0, m = 0, f = 0, d = 0 } = S.lab, dom = E.strongestLever(p, m, f, d);
    if (dom < 0 || labCalc().locked) return '';
    const LV = E.LEVERS[dom];
    const notes = ['', '', '', '', `You tried: ${LV.name.toLowerCase()}.`];
    return fbWindow({ n: 4, eyebrow: 'Part 4 · your feedback', title: 'One lever, and the whole road moves.',
      letter: [`You tried it: ${LV.name.toLowerCase()}. Look how it answered in all four.`, `Watch out: ${LV.watch}`, `Your first step this week: ${LV.first}`],
      ask: 'Which one lever will you move this month, and on which day will you start?',
      road: roadHTML(notes, null, ROAD_PROMISE), roadTitle: 'Where one good lever takes you, step by step',
      more: `<span class="eb fbeb">This change, in four steps</span>${fbList(LV.steps.map((t, k) => [`${k + 1}. ${t}`, '', '']))}`,
      next: nextBtn('Your North Star is complete. Keep it, share it, then take your next step.', 'Get my North Star card', 'save') });
  }

  /* ── The path through the North Star (31 Oct) ───────────────────────────
   * Before you start, then four parts. What is done, what is open, and the
   * first thing still open, so the founder never has to remember. */
  const PARTS = [['Yourself', 'clear'], ['Your people', 'people'], ['Your numbers', 'numbers'], ['Your next steps', 'plan']];
  function partState(c) {
    const qs = c.qs, G = E.groupsFor(S.mode);
    const strDone = [0, 1, 2, 3].filter((i) => (Number(S.str[i]) || 0) > 0).length;
    const ansDone = qs.filter((q) => Number.isInteger(S.ans[q.id])).length;
    const p1 = { done: (S.goal ? 1 : 0) + strDone + ansDone + (S.want ? 1 : 0) + (S.values.length ? 1 : 0), total: 1 + 4 + qs.length + 2 };
    const p2qs = M.P2.questions(S.mode, S.p2.team);
    const p2 = { done: (S.p2.team ? 1 : 0) + (S.p2.team ? p2qs.filter((q) => Number.isInteger(S.p2.ans[q.id])).length : 0), total: 1 + p2qs.length };
    const p3 = { done: Math.min(S.group, G.length) + [0, 1, 2, 3].filter((i) => S.got[i]).length, total: G.length + 4 };
    const p4 = { done: S.lab && (S.lab.p || S.lab.m || S.lab.f || S.lab.d) ? 1 : 0, total: 1 };
    const all = p1.done + p2.done + p3.done + p4.done, tot = p1.total + p2.total + p3.total + p4.total;
    const fin = [p1, p2, p3, p4].map((x) => x.done >= x.total);
    const part = fin.indexOf(false) < 0 ? 3 : fin.indexOf(false);
    return { p1, p2, p3, p4, fin, pct: Math.round(all / tot * 100), part, open: fin.map((f) => !f) };
  }
  /* The first thing still open in a part, and where it is on the page. */
  function firstOpenItem(c, upTo) {
    const qs = c.qs;
    if (!S.goal) return { el: '#s-journey .j-road', label: 'where you want to get' };
    for (let i = 0; i < 4; i++) if (!((Number(S.str[i]) || 0) > 0)) return { el: `.nsstr[data-sti="${i}"]`, label: 'your four strengths' };
    const qi0 = qs.findIndex((q) => !Number.isInteger(S.ans[q.id]));
    if (qi0 >= 0) return { el: '#nsb-r', label: `question ${qi0 + 1}`, q: qi0 };
    if (!S.want) return { el: '#nsb-r', label: 'what you want most', q: qs.length + 1 };
    if (!S.values.length) return { el: '#nsb-r', label: 'what you care about most', q: qs.length + 2 };
    if (upTo <= 2) return null;
    if (!S.p2.team) return { el: '#p2-team', label: 'who works with you' };
    const p2q = M.P2.questions(S.mode, S.p2.team).find((q) => !Number.isInteger(S.p2.ans[q.id]));
    if (p2q) return { el: `#p2-${p2q.id}`, label: 'Part 2 · ' + p2q.short.toLowerCase() };
    if (upTo <= 3) return null;
    const G = E.groupsFor(S.mode);
    if (S.group < G.length) return { el: `[data-f="grp-${Math.min(S.group, G.length - 1)}"]`, label: 'your numbers' };
    return null;
  }
  const pProg = (c) => {
    const P = partState(c), done = P.fin;
    const cur = done.indexOf(false);
    return `<div class="nsprog-in">
      <ol class="nsprog-parts" aria-label="Your path through the North Star">${PARTS.map(([n, go], i) => {
        const st = done[i] ? 'done' : i === cur ? 'now' : 'wait';
        return `<li class="${st}"><button type="button" data-go="${go}" aria-label="Part ${i + 1}, ${n}${st === 'done' ? ', done' : st === 'now' ? ', you are here' : ''}"><i aria-hidden="true">${st === 'done' ? '✓' : i + 1}</i><span>${n}</span></button></li>`;
      }).join('<li class="arr" aria-hidden="true"></li>')}</ol>
      <div class="nsprog-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${P.pct}" aria-label="Your North Star, ${P.pct}% done"><i style="width: ${P.pct}%"></i></div>
      <span class="nsprog-pct">${P.pct}%</span></div>`;
  };

  /* Something above is still open: say so, then take the founder there, slow,
   * faster, then easing to a stop, and let the open thing pulse three times. */
  let guiding = false;
  function guide(c, upTo = 4) {
    const it = firstOpenItem(c, upTo);
    if (!it || guiding) return false;
    guiding = true;
    toast(`One thing above is still open: ${it.label}. Taking you there.`);
    if (it.q != null) { qi = it.q; put('questions', pQuestions(context())); placeCrown(); }
    if (it.q != null && isPhone()) {
      setTimeout(() => { enterFull(); const el = document.getElementById('nsb-r'); if (el) { el.classList.remove('nsflash'); void el.offsetWidth; el.classList.add('nsflash'); setTimeout(() => el.classList.remove('nsflash'), 2200); } guiding = false; }, 1200);
      return true;
    }
    setTimeout(() => {
      const el = document.querySelector(it.el);
      if (!el) { guiding = false; return; }
      const top = Math.max(0, el.getBoundingClientRect().top + scrollY - (($('.topwrap') || {}).offsetHeight || 120) - 24);
      const done = () => {
        el.classList.remove('nsflash'); void el.offsetWidth; el.classList.add('nsflash');
        setTimeout(() => el.classList.remove('nsflash'), 2200);
        const f = el.querySelector('button, [tabindex]') || el; try { f.focus({ preventScroll: true }); } catch { /* fine */ }
        guiding = false;
      };
      if (reduced()) { window.scrollTo({ top, behavior: 'instant' }); done(); return; }
      const from = scrollY, dist = top - from, dur = Math.min(2200, Math.max(900, Math.abs(dist) * 0.45)), t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now) => { const t = Math.min(1, (now - t0) / dur); window.scrollTo({ top: from + dist * ease(t), behavior: 'instant' }); if (t < 1) requestAnimationFrame(step); else done(); };
      requestAnimationFrame(step);
    }, 1500);
    return true;
  }
  /* A part finished: say so, warmly, once. */
  let lastDone = null;
  function celebrate(c) {
    const P = partState(c), now = P.fin;
    if (lastDone) {
      if (now[0] && !lastDone[0]) toast(`Part 1 · Yourself done. ${P.pct}% of your North Star. Your feedback is just below.`);
      else if (now[1] && !lastDone[1]) toast(`Part 2 · Your people done. ${P.pct}%. Your feedback is just below.`);
      else if (now[2] && !lastDone[2]) toast(`Part 3 · Your numbers done. ${P.pct}%. Next: Part 4 · Your next steps.`);
      else if (now[3] && !lastDone[3]) toast(`Your North Star is complete. ${P.pct}%.`);
    }
    lastDone = now;
  }
  /* Later parts wait, visibly, until the one before is done. */
  function lockParts(c) {
    const P = partState(c), [p1, p2, p3] = P.fin;
    // Part 4 is open to everyone (31 Oct, round 4): the lab itself says what it needs.
    const locked = { 2: !p1, 3: !p1 || !p2, 4: false };
    const NAMES = ['', 'Part 1 · Yourself', 'Part 2 · Your people', 'Part 3 · Your numbers'];
    document.querySelectorAll('.nspart').forEach((el) => {
      const n = +el.dataset.part, on = !!locked[n];
      el.classList.toggle('nslocked', on);
      let note = el.querySelector(':scope > .nslocknote');
      if (on && !note) { note = document.createElement('p'); note.className = 'nslocknote'; el.prepend(note); }
      // The first part still open, and how far it is.
      const w = !p1 ? 1 : !p2 ? 2 : 3, x = [null, P.p1, P.p2, P.p3][w];
      if (note) note.textContent = on ? `Opens after ${NAMES[w]} (${x.done} of ${x.total} done)` : '';
      if (!on && note) note.remove();
    });
    document.body.classList.toggle('ns-p1done', p1);
  }

  /* Part 3, your numbers: three numbers a group, one group open at a time. */
  function pNumbers(c) {
    const G = E.groupsFor(S.mode), has = S.mode === 'yes', gi = Math.min(S.group, G.length);
    const TINTG = { 0: 'var(--tself)', 1: 'var(--tpeople)', 2: 'var(--twork)', 3: 'var(--tmarket)' };
    const groups = G.map((g, i) => {
      const ins = E.insight(g.key, c.n, S.mode, money), active = gi === i;
      const status = i < gi ? (ins || 'Not enough yet to say anything. Open it to add a range.') : active ? 'Three quick answers · slide to a range, or type your own' : 'Next';
      const fields = g.fields.map(([key, label, choices]) => {
        const k = S.mode + '.' + key, cur = S.nums[k] || { pick: '', own: '' }, isText = typeof choices[0][1] === 'string';
        const glow = UI.glow && UI.glow.keys.includes(k) && Date.now() < UI.glow.until ? ' glowbox' : '';
        const picked = /^\d+$/.test(cur.pick) ? Number(cur.pick) : -1;
        const big = cur.pick === 'own' ? (cur.own ? esc(cur.own) : 'Type it below') : cur.pick === 'unsure' ? 'Not sure yet' : picked >= 0 ? esc(choices[picked][0]) : (isText ? 'Tap one' : 'Slide to choose');
        const alt = `<div class="nsl-alt"><button type="button" data-act="num-own" data-k="${k}" data-f="nown-${k}" aria-pressed="${cur.pick === 'own'}">${isText ? 'Somewhere else' : 'Type the exact amount'}</button><button type="button" data-act="num-unsure" data-k="${k}" data-f="nuns-${k}" aria-pressed="${cur.pick === 'unsure'}">Not sure yet</button></div>`;
        // Numbers slide (31 Oct, round 4): a big value that follows the thumb.
        // Places are tapped. Exact amounts and "not sure" stay one tap away.
        const input = isText
          ? `<div class="nsl-chips" role="group" aria-label="${esc(label)}">${choices.map((ch, j) => `<button type="button" data-act="num-chip" data-k="${k}" data-v="${j}" data-f="nchip-${k}-${j}" aria-pressed="${picked === j}">${esc(ch[0])}</button>`).join('')}</div>`
          : `<input type="range" class="nsl-range${picked < 0 ? ' unset' : ''}" id="f-${k}" min="0" max="${choices.length - 1}" step="1" value="${picked < 0 ? 0 : picked}" data-numr="${k}" data-f="num-${k}" aria-label="${esc(label)}" aria-valuetext="${big}">
            <div class="nsl-ends" aria-hidden="true"><span>${esc(choices[0][0])}</span><span>${esc(choices[choices.length - 1][0])}</span></div>`;
        return `<div class="nslide${glow}${picked >= 0 || cur.pick === 'own' ? ' set' : ''}">
          <div class="nsl-top"><label for="f-${k}">${label}</label><b class="nsl-val sf" id="nv-${k}">${big}</b></div>
          ${input}${alt}
          ${cur.pick === 'own' ? `<input class="inp pop" type="text" ${isText ? '' : 'inputmode="decimal"'} data-own="${k}" data-f="own-${k}" value="${esc(cur.own)}" placeholder="${isText ? 'Where they gather' : 'Type the exact amount'}" aria-label="${esc(label)}, ${isText ? 'in your words' : 'exact amount'}" style="border-color: #6F93B8">` : ''}
        </div>`;
      }).join('');
      return `<div style="background: var(--paper); border: 1.5px solid ${active ? '#6F93B8' : 'var(--line)'}; border-radius: 7px; overflow: hidden; transition: border-color .3s ease">
        <button type="button" data-act="grp" data-i="${i}" data-f="grp-${i}" aria-expanded="${active}" style="width: 100%; background: none; border: 0; padding: 16px 18px; display: flex; align-items: center; gap: 14px; cursor: pointer; text-align: left; color: var(--ink)">
          <span style="width: 38px; height: 38px; border-radius: 50%; background: ${i < gi ? '#6F93B8' : TINTG[g.d]}; display: inline-flex; align-items: center; justify-content: center; flex: none"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="${g.icon}" fill="none" stroke="${i < gi ? '#0E1C2B' : CSSV[g.d]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span style="display: flex; flex-direction: column; flex: 1; min-width: 0"><span style="font-weight: 520; font-size: 16px">${g.title}</span><span style="font-size: 13px; color: var(--muted)">${esc(status)}</span></span>
          <span style="font-size: 12px; font-weight: 520; color: var(--goldink)">${i < gi ? 'Done · edit' : active ? '' : 'Open'}</span></button>
        ${active ? `<div class="pop" style="padding: 0 18px 18px; display: flex; flex-direction: column; gap: 14px">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px">${fields}</div>
          <div class="pop deep" style="border-radius: 7px; padding: 16px 18px; display: flex; gap: 14px; align-items: center; animation-delay: .2s">
            <svg class="shim" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" style="flex: none"><path d="M12 3l2.2 5.6L20 9l-4.5 3.8L17 19l-5-3.2L7 19l1.5-6.2L4 9l5.8-.4z" fill="none" stroke="#6F93B8" stroke-width="1.6" stroke-linejoin="round"/></svg>
            <div style="display: flex; flex-direction: column; gap: 2px" aria-live="polite"><span class="eb" style="color: #A9C0D9">What this already tells you</span><span style="font-size: 16px; font-weight: 520">${esc(ins || 'Slide each one to a range, or type your own. The answer appears here.')}</span></div></div>
          <button type="button" data-act="grp" data-i="${i + 1}" data-f="grp-next-${i}" style="align-self: flex-end; min-height: 46px; padding: 0 20px; border-radius: 5px; border: 0; background: var(--deep); color: #EEF2F7; font-weight: 520; cursor: pointer">${i === G.length - 1 ? 'See what it all means →' : 'Next group →'}</button>
        </div>` : ''}</div>`;
    }).join('');
    return `<div style="display: flex; flex-direction: column; gap: 8px; max-width: 720px">
        <span class="eb">Part 3 · Your numbers</span>
        <h1 class="sf" style="font-size: clamp(30px, 4vw, 44px); line-height: 1.05">${has ? 'Four small groups.' : 'No sales yet? Good.'} <span class="sfi" style="color: var(--goldink)">${has ? 'An insight after each.' : 'Start with your offer, your runway and your market.'}</span></h1>
        <p style="color: var(--muted)">${has ? 'One month. Slide to a range, or type your own. Each group tells you something before you move on.' : 'We will not ask you for sales you do not have yet. Three small groups, and an insight after each.'}</p></div>
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
        <label style="display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; font-size: 14px; align-self: flex-start"><input type="checkbox" data-tick="${esc(st.id)}" data-f="tick-${esc(st.id)}"${done ? ' checked' : ''} style="width: 20px; height: 20px; accent-color: #6F93B8">Done</label>
      </div></details>`;
  }
  /* The count is this plan's own steps (31 Oct: never all 32 at once). */
  const planCount = (steps) => (UI.plans && steps ? `${steps.filter((st) => UI.plans.done[st.id]).length} of ${steps.length} done` : '');
  /** The four steps for a domain card, or a What-if lever: open when signed
   *  in and loaded, the locked titles otherwise. */
  function planBlock(titles, steps, eyebrow, cta) {
    if (signedIn() && steps) return `<span class="eb" style="color: #A9C0D9">${eyebrow} · ${planCount(steps)}</span>
      ${steps.map(stepOpen).join('')}
      <span style="font-size: 13px; color: #A9B6C6">Times are about, not promises. Tick a step when it is done; the count is your plans’ own.</span>`;
    if (signedIn()) return `<span class="eb" style="color: #A9C0D9">${eyebrow}</span>
      ${titles.map((t, k) => `<div style="display: flex; gap: 12px; align-items: center; border-top: 1px solid #3A2F20; padding-top: 8px"><span style="font-family: Newsreader, serif; color: #6F93B8; width: 22px">${k + 1}</span><span style="flex: 1; font-size: 14px; color: #EEF2F7">${t}</span></div>`).join('')}
      <span style="font-size: 13px; color: #A9B6C6">Opening in your account…</span>`;
    return `<span class="eb" style="color: #A9C0D9">${eyebrow} · in your free account</span>
      ${titles.map((t, k) => `<div style="display: flex; gap: 12px; align-items: center; border-top: 1px solid #3A2F20; padding-top: 8px"><span style="font-family: Newsreader, serif; color: #6F93B8; width: 22px">${k + 1}</span><span style="flex: 1; font-size: 14px; color: #EEF2F7">${t}</span><span class="blurline" style="flex: 0 0 70px; height: 8px; border-radius: 4px; background: #2A3A50"></span>${lockIcon('#A9B6C6')}</div>`).join('')}
      <span style="font-size: 13px; color: #A9B6C6">Each step opens with what to do, about how long it takes and what “done” looks like.</span>
      <button type="button" data-act="account" data-f="account-${eyebrow.length}" class="go" style="align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 18px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 520; cursor: pointer">${cta} <span class="arr" aria-hidden="true">→</span></button>`;
  }

  /* Part 3, what they mean: one card per domain. "Got it" opens the next. */
  function pFeedback(c, i) {
    const s = c.sc[i], f = E.feedback(i, s, S.pains, wants()), locked = i > 0 && !S.got[i - 1];
    // Before either question is answered there is nothing to read back yet.
    if (!s.answered) Object.assign(f, { big: `Answer the two ${D[i].name.toLowerCase()} questions in Part 1, and this card fills in.`, why: 'Nothing here is said about you before you have said it yourself.', feel: [] });
    const nums = S.mode === 'yes' ? E.numberLines(c.n, money)[i] : '';
    const bg = ['#F4E1D6', '#F3EAD3', '#E3ECE4'], ink = ['#8A4524', '#3E6A94', '#35593D'];
    const open = !!S.more[i];
    return `<div style="display: flex; flex-direction: column; gap: 10px; opacity: ${locked ? '.45' : '1'}; transition: opacity .5s ease"${locked ? ' inert' : ''}>
      ${locked ? `<span style="font-size: 13px; color: var(--muted); display: inline-flex; align-items: center; gap: 8px">${lockIcon('currentColor')}Tick “Got it” on the domain above to open this one.</span>` : ''}
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap"><span style="width: 34px; height: 34px; border-radius: 50%; background: ${TINT[i]}; display: inline-flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="${D[i].icon}" fill="none" stroke="${CSSV[i]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><h3 class="sf" style="font-size: 20px; font-weight: 440">${D[i].name}</h3>
        <span style="font-size: 11px; font-weight: 520; letter-spacing: .12em; padding: 4px 10px; border-radius: 12px; background: ${f.bandIndex === null ? 'var(--cream)' : bg[f.bandIndex]}; color: ${f.bandIndex === null ? 'var(--muted)' : ink[f.bandIndex]}">${f.band}</span>
        <span class="nslevel" style="--c: ${CSSV[i]}"><b>${s.score}</b> of 6 · your level</span>
        <span style="flex: 1; height: 1px; background: var(--line); min-width: 40px"></span></div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px">
        <div class="card lift" style="border-top: 4px solid ${CSSV[i]}; padding: 18px; display: flex; flex-direction: column; gap: 8px">
          <span class="eb" style="color: ${CSSV[i]}">What it means for you now</span>
          <span class="sf" style="font-size: 21px; line-height: 1.25">${f.big}</span>
          <span style="font-size: 14px; color: var(--muted)">${f.why}</span>
          ${f.goalLine ? `<span style="font-size: 13px; font-weight: 520; color: var(--goldink); display: inline-flex; gap: 6px; align-items: center"><svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4M6 4h11l-3 4 3 4H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>${f.goalLine}</span>` : ''}
          ${nums ? `<span style="font-size: 12px; color: var(--muted); border-top: 1px solid var(--line); padding-top: 8px">Your numbers: ${esc(nums)}</span>` : ''}
        </div>
        <div class="card lift" style="padding: 18px; display: flex; flex-direction: column; gap: 10px">
          <span class="eb">What you may be feeling</span>
          ${f.pains.length ? `<span style="font-size: 13px; font-weight: 520; padding: 6px 10px; border-radius: 6px; background: var(--cream); align-self: flex-start">You said: ${f.pains.join(' · ')}</span>` : ''}
          ${f.feel.map((t) => `<span style="display: flex; gap: 10px; align-items: flex-start; font-size: 14px"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; margin-top: 2px"><circle cx="12" cy="12" r="8" fill="none" stroke="${CSSV[i]}" stroke-width="2"/><circle cx="12" cy="12" r="2.5" fill="${CSSV[i]}"/></svg>${t}</span>`).join('')}
        </div>
        <div class="deep" style="border-radius: 7px; padding: 18px; display: flex; flex-direction: column; gap: 8px"><span class="eb" style="color: #A9C0D9">Ask yourself</span><span class="sfi" style="font-size: 19px; line-height: 1.35">“${f.ask}”</span>
          <label style="display: flex; align-items: center; gap: 10px; margin-top: 6px; padding: 8px 0; cursor: pointer; font-size: 14px"><input type="checkbox" data-act="got" data-i="${i}" data-f="got-${i}"${S.got[i] ? ' checked' : ''} style="width: 20px; height: 20px; accent-color: #6F93B8">Got it, I’ve read this</label>
          <button type="button" data-act="more" data-i="${i}" data-f="more-${i}" aria-expanded="${open}" class="no-print" style="align-self: flex-start; margin-top: 4px; background: none; border: 1px solid #2A3A50; color: #A9C0D9; border-radius: 5px; min-height: 40px; padding: 0 14px; font-weight: 520; cursor: pointer">${open ? 'Show less' : 'Show more'}</button>
        </div>
      </div>
      ${open ? `<div class="pop" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px">
        <div class="card" style="padding: 18px; display: flex; flex-direction: column; gap: 8px"><span class="eb" style="color: ${CSSV[i]}">Going deeper</span><span style="font-size: 15px; line-height: 1.6">${f.deep}</span>
          <span style="font-size: 14px; font-weight: 520; margin-top: 4px">This week: ${f.week}</span></div>
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
    if (what === 'reading' && c && c.rd && c.rd.any) return `My Leader’s North Star says I am ${ARCH[c.rd.hi][0]}: ${ARCH[c.rd.hi][1].toLowerCase()} Strongest: ${D[c.rd.hi].name}. Next summit: ${D[c.rd.lo].name}. A few honest questions, free. Find yours: ${url}`;
    return `A few honest questions about how you lead yourself, your people, your business and the market. Free, about 10 minutes. Take The Leader’s North Star: ${url}`;
  }
  const WA = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.8 8.2c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.2.1.4.3.4.6v.5c0 .3-.1.6-.4.8-.6.4-1.4.5-2.2.2-2.3-.9-4.1-2.7-5-5-.3-.8-.2-1.6.2-2.2z" fill="currentColor"/></svg>';
  const LI = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const shareRow = (c, what, label) => `<div style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 12px; font-weight: 520; color: var(--muted); letter-spacing: .06em">${label}</span>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px">
        <a href="https://wa.me/?text=${encodeURIComponent(shareText(c, what, 'whatsapp'))}" target="_blank" rel="noopener" data-f="share-${what}-wa" style="min-height: 44px; border-radius: 5px; border: 1px solid #25D366; color: var(--ink); background: var(--paper); font-weight: 520; font-size: 14px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px"><span style="color: #1DA851; display: inline-flex">${WA}</span>WhatsApp</a>
        <a href="https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText(c, what, 'linkedin'))}" target="_blank" rel="noopener" data-f="share-${what}-li" style="min-height: 44px; border-radius: 5px; border: 1px solid #0A66C2; color: var(--ink); background: var(--paper); font-weight: 520; font-size: 14px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px"><span style="color: #0A66C2; display: inline-flex">${LI}</span>LinkedIn</a>
      </div></div>`;

  /* ── Your North Star card (31 Oct, round 4): something to be proud of and
   * to pass on. Their name, a leader title drawn from their strongest side,
   * their shape as a constellation, what they lead for, the next summit, and
   * at the bottom the link and their mentor. Downloads as an image, or opens
   * the phone's share sheet. ── */
  const ARCH = [['The Steady Compass', 'Knows why, and keeps going when it gets hard.'],
    ['The Trusted Captain', 'People follow, because they are trusted to lead.'],
    ['The Quiet Builder', 'Builds what lasts, one honest number at a time.'],
    ['The Voice People Find', 'Speaks so clearly the right people come looking.']];
  let LOGO = '';
  try { fetch('/northstar/assets/logo.webp').then((r) => (r.ok ? r.blob() : null)).then((b) => b && new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b); }))
    .then((d) => { if (d) { LOGO = d; cache['s-save'] = null; if (typeof render === 'function') render(); } }).catch(() => {}); } catch { /* no logo: the card still works */ }
  function cardSVG(c) {
    const W = 1080, H = 1350, cx = 540, cy = 715, R = 205, sc = c.sc.map((x) => x.score), str = c.rd.str;
    const rA = sc.map((v) => 34 + v / 6 * (R - 34)), rS = str.map((v) => 34 + v / 5 * (R - 34));
    const P = (r) => [[cx, cy - r[0]], [cx + r[1], cy], [cx, cy + r[2]], [cx - r[3], cy]];
    const pts = (r) => P(r).map((p) => p.join(',')).join(' ');
    const first = (S.profile.first || '').trim().split(' ')[0], A = ARCH[c.rd.hi];
    const vals = named(M.VALUES, S.values);
    const stars = Array.from({ length: 70 }, (_, k) => { const x = (k * 233 + 71) % W, y = (k * 151 + 37) % H; return `<circle cx="${x}" cy="${y}" r="${(0.8 + (k % 3) * 0.7).toFixed(1)}" fill="${k % 5 ? '#A9C0D9' : '#D6BF8F'}" opacity="${(0.2 + (k % 4) * 0.12).toFixed(2)}"/>`; }).join('');
    const hex = ['#E0A282', '#9BC0A1', '#91B8D5', '#DDBD69'];
    const vtx = P(rA).map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="26" fill="${hex[i]}" opacity=".18"/><path d="${starPath(x, y, 17)}" fill="${hex[i]}"/>`).join('');
    const lab = [[cx, cy - R - 26, 'middle', 'YOURSELF'], [cx + R + 26, cy + 8, 'start', 'PEOPLE'], [cx, cy + R + 44, 'middle', 'BUSINESS'], [cx - R - 26, cy + 8, 'end', 'MARKET']]
      .map(([x, y, a, t], i) => `<text x="${x}" y="${y}" text-anchor="${a}" fill="${hex[i]}" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="700" letter-spacing="4">${t}</text>`).join('');
    const col = (x, k, v, color) => `<text x="${x}" y="1052" text-anchor="middle" fill="${color}" font-family="Inter, Arial, sans-serif" font-size="19" letter-spacing="4" font-weight="700">${k}</text><text x="${x}" y="1094" text-anchor="middle" fill="#EEF2F7" font-family="Newsreader, Georgia, serif" font-size="${v.length > 18 ? 30 : 36}">${esc(v)}</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${first ? esc(first) + '’s' : 'My'} North Star card: ${esc(A[0])}">
      <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1522"/><stop offset=".55" stop-color="#132338"/><stop offset="1" stop-color="#1E2F45"/></linearGradient>
        <radialGradient id="cgl"><stop offset="0" stop-color="#D6BF8F" stop-opacity=".22"/><stop offset=".5" stop-color="#6F93B8" stop-opacity=".16"/><stop offset="1" stop-color="#6F93B8" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#cg)"/>${stars}
      <rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="30" fill="none" stroke="#D6BF8F" stroke-opacity=".5" stroke-width="2"/>
      ${LOGO ? `<image href="${LOGO}" xlink:href="${LOGO}" x="${cx - 160}" y="76" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>` : ''}
      <text x="${LOGO ? cx - 82 : cx}" y="118" text-anchor="${LOGO ? 'start' : 'middle'}" fill="#EEF2F7" font-family="Inter, Arial, sans-serif" font-size="26" letter-spacing="7" font-weight="600">EXPLORASELF</text>
      <text x="${cx}" y="200" text-anchor="middle" fill="#D6BF8F" font-family="Inter, Arial, sans-serif" font-size="22" letter-spacing="8" font-weight="600">${first ? esc(first.toUpperCase()) + ' · ' : ''}THE LEADER’S NORTH STAR</text>
      <text x="${cx}" y="300" text-anchor="middle" fill="#F6EEDD" font-family="Newsreader, Georgia, serif" font-style="italic" font-size="78">${esc(A[0])}</text>
      <text x="${cx}" y="352" text-anchor="middle" fill="#A9C0D9" font-family="Newsreader, Georgia, serif" font-size="31">${esc(A[1])}</text>
      ${vals.length ? `<text x="${cx}" y="410" text-anchor="middle" fill="#D6BF8F" font-family="Inter, Arial, sans-serif" font-size="22" letter-spacing="5" font-weight="600">LEADING FOR ${esc(vals.join(' & ').toUpperCase())}</text>` : ''}
      <circle cx="${cx}" cy="${cy}" r="${R + 90}" fill="url(#cgl)"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#2A3A50" stroke-width="1.5" stroke-dasharray="3 9"/>
      <polygon points="${pts(rS)}" fill="none" stroke="#EEF2F7" stroke-width="2.5" stroke-dasharray="10 9" opacity=".55"/>
      <polygon points="${pts(rA)}" fill="rgba(214,191,143,.12)" stroke="#D6BF8F" stroke-width="3" stroke-linejoin="round" opacity=".9"/>
      ${vtx}
      <path d="${starPath(cx, cy, 34)}" fill="#F6EEDD"/><path d="${starPath(cx, cy, 15)}" fill="#6F93B8" transform="rotate(45 ${cx} ${cy})"/>
      ${lab}
      ${col(270, 'STRONGEST', D[c.rd.hi].name, '#9BC0A1')}${col(810, 'NEXT SUMMIT', D[c.rd.lo].name, '#E0A282')}
      <text x="${cx}" y="1180" text-anchor="middle" fill="#EEF2F7" font-family="Newsreader, Georgia, serif" font-size="28">Find your own North Star · at no cost</text>
      <text x="${cx}" y="1224" text-anchor="middle" fill="#A9C0D9" font-family="Inter, Arial, sans-serif" font-size="25" letter-spacing="1">linktolead.exploraself.com/northstar</text>
      <text x="${cx}" y="1276" text-anchor="middle" fill="#D6BF8F" font-family="Inter, Arial, sans-serif" font-size="19" letter-spacing="5" font-weight="600">MENTOR · ALEXANDRU COJOCARI</text>
    </svg>`;
  }
  /** The card as a PNG: shared through the phone's share sheet when it can
   *  take files, downloaded otherwise. */
  async function cardImage() {
    const svg = document.querySelector('#nscard svg');
    if (!svg) return null;
    const url = URL.createObjectURL(new Blob([svg.outerHTML], { type: 'image/svg+xml' }));
    try {
      const img = new Image(); img.decoding = 'async';
      await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = url; });
      const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
      cv.getContext('2d').drawImage(img, 0, 0, 1080, 1350);
      return await new Promise((ok) => cv.toBlob(ok, 'image/png'));
    } finally { URL.revokeObjectURL(url); }
  }
  async function cardOut(share) {
    let png = null;
    try { png = await cardImage(); } catch { png = null; }
    if (!png) { toast('Your browser would not make the image. Try Print → Save as PDF.'); return; }
    const file = new File([png], 'my-north-star.png', { type: 'image/png' });
    if (share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text: shareText(context(), 'reading', 'card') }); return; } catch { /* closed: fine */ return; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(png); a.download = 'my-north-star.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    toast(share ? 'Saved as an image. Send it with the link below.' : 'Saved as an image: my-north-star.png');
  }

  const pSave = (c) => `<div class="nscard-wrap">${c && c.rd && c.rd.any ? `<div class="nscard" id="nscard">${cardSVG(c)}</div>` : '<div class="nscard empty"><span>Your card appears once you have answered Part 1.</span></div>'}</div>
    <div class="nscard-side">
      <span class="eb">Your North Star card</span>
      <h2 class="sf" style="font-size: clamp(28px, 3.4vw, 38px); line-height: 1.1">Keep it. <span class="sfi" style="color: var(--goldink)">Share it.</span></h2>
      <p style="color: var(--muted); font-size: 15px">One picture of where you stand today. Send it to someone who should see it, or keep it for the day you look back and see how far you came.</p>
      ${c && c.rd && c.rd.any ? `<div class="no-print" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px">
        <button type="button" class="go" data-act="card-share" data-f="card-share" style="min-height: 50px; border-radius: 5px; border: 0; background: #D6BF8F; color: #1C1309; font-weight: 600; font-size: 15px; cursor: pointer">Share my card</button>
        <button type="button" data-act="card-dl" data-f="card-dl" style="min-height: 50px; border-radius: 5px; border: 1px solid var(--line); background: var(--paper); color: var(--ink); font-weight: 520; cursor: pointer">Download image</button></div>` : ''}
      <div class="no-print" style="display: flex; flex-direction: column; gap: 10px; padding-top: 10px; border-top: 1px solid var(--line)">
        ${c && c.rd && c.rd.any ? shareRow(c, 'reading', 'SEND THE LINK WITH IT') : ''}
        ${shareRow(c, 'invite', 'INVITE SOMEONE TO TAKE IT')}
      </div>
      <div class="no-print" style="display: flex; flex-wrap: wrap; gap: 14px; font-size: 13px">
        <button type="button" data-act="email" data-f="email" ${UI.sending ? 'disabled' : ''} class="nslink">${UI.sending ? 'Sending…' : 'Email me my results'}</button>
        <button type="button" data-act="print" data-f="print" class="nslink">Print</button>
        <button type="button" data-act="print" data-f="pdf" class="nslink">Save as PDF</button>
      </div>
      <span role="status" style="font-size: 13px; color: ${UI.mail.startsWith('Sent') ? 'var(--people)' : 'var(--muted)'}; font-weight: 520">${esc(UI.mail)}</span>
    </div>`;

  /* ── The North Star Action Plan (31 Oct, round 6) ─────────────────────────
   * Five actions for one week, one in each domain and a fifth that ties them,
   * in an order where each one feeds the next: what the business must give
   * you → what one sale leaves you → who buys, in their words → the hours you
   * get back to talk to them → the Sunday review that makes it stick. Mostly
   * fill in the blanks. Downloaded as a real PDF (plan-pdf.js), with their
   * name, the date and the logo, and the Blueprint at the end. */
  function planData(c) {
    const rd = c.rd, n = c.n, first = (S.profile.first || '').trim(), full = [S.profile.first, S.profile.last].filter(Boolean).join(' ').trim();
    const date = (() => { try { return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return ''; } })();
    const vals = named(M.VALUES, S.values), wl = named(E.GOALS, wants()), G = rd.any ? gapOf(c) : { pct: 0 };
    const ab = (k) => (n[k] && n[k].est ? 'about ' : '');
    const leftLine = S.mode === 'yes' && n.sales && n.deliv && n.run ? ` (Your North Star: ${ab('sales')}${money(n.sales.v - n.deliv.v - n.run.v)} left last month.)` : '';
    const hoursLine = S.mode === 'yes' && n.hrs && n.want ? ` (You told us: ${ab('hrs')}${whole(n.hrs.v)} hours worked last month, ${whole(n.want.v)} wanted.)` : '';
    const start = rd.any ? ({ 0: 0, 1: 3, 2: 1, 3: 2 })[rd.lo] : -1;
    const solo = S.p2.team === 'solo' || !S.p2.team;
    const actions = [
      { domain: 'Lead yourself', title: 'Name your enough', why: 'Everything else is measured against it. Without it, the business decides for you.',
        lines: [`This business must give me $________ a month, ________ free evenings a week, and time for ________.${vals.length ? ` (You said you care most about ${vals.join(' and ').toLowerCase()}.)` : ''}`,
          `I will work at most ________ hours a week.${hoursLine}`,
          'If by ________ (date) it does not give me this, I will change ________.'],
        done: 'three lines written, and read out loud to someone close to you.' },
      { domain: 'Lead your business', title: 'Know your number', why: 'Your enough becomes a target only when you know what one sale leaves you.',
        lines: ['One sale brings in $________. It costs me $________ and ________ hours of my time.',
          `So one sale leaves me $________, which is $________ for each hour of mine.${leftLine}`,
          'To reach my enough I need ________ sales a month. Last month I had ________.'],
        done: 'one number you will check every Monday, written where you see it.' },
      { domain: 'Lead the market', title: 'Hear it in their words', why: 'The sales you need come from people who already have the problem. Their words sell better than yours.',
        lines: [`This week I will ask ________, ________ and ________: “${S.mode === 'yes' ? 'What made you choose me?' : 'What is hardest about this for you, and what have you tried?'}”`,
          'The words they used: “________________________________”',
          'My offer, in their words: I help ________ with ________, so they ________.'],
        done: 'three conversations had, and one sentence you can say the same way every time.' },
      { domain: 'Lead your people', title: 'Give one thing away', why: 'Those conversations need hours. You get them back by handing over one task.',
        lines: ['The task that takes my time but not my talent: ________.',
          `________ will do it starting ________.${solo ? ' (No team yet? A tool, a template, or a freelancer for two hours.)' : ''}`,
          'Done looks like ________. I step in only if ________.'],
        done: 'that task done once without you.' },
      { domain: 'All four domains', title: 'Your Sunday review', why: 'Five minutes that turn this week into the next one. This is how change sticks.',
        lines: ['Lead yourself: this week I protected ________ hours for what matters.',
          'Lead your business: my number moved from ________ to ________.',
          'Lead the market: a customer said “________________”.',
          'Lead your people: ________ did ________ without me.',
          'My one move for next week: ________.'],
        done: 'every Sunday for four weeks. By then you will know what twelve weeks could do.' },
    ].map((a, i) => ({ ...a, start: i === start }));
    const recap = [];
    if (rd.any) recap.push(['Your leader title', `${ARCH[rd.hi][0]}: ${ARCH[rd.hi][1]}`]);
    recap.push(['Where you are', `${E.STAGES[c.here].name}${c.goal >= 0 && c.goal !== c.here ? ', heading to ' + E.STAGES[c.goal].name : ''}`]);
    if (rd.any) { recap.push(['Strongest', D[rd.hi].name]); recap.push(['Needs you first', D[rd.lo].name]); }
    if (G.pct) recap.push(['Unused potential', `${G.pct}% of the strength you see in yourself is not at work yet`]);
    if (wl.length) recap.push(['What you want most', wl.join(' · ')]);
    if (vals.length) recap.push(['What you care about most', vals.join(' · ')]);
    return { name: full, date, logo: LOGO,
      title: `${first ? first + '’s' : 'Your'} North Star Action Plan`,
      subtitle: 'Five actions for this week. One in each domain, and one that ties them together.',
      recap,
      intro: `Do them in this order: each one feeds the next. Fill in the blanks with a pen, not in your head.${start >= 0 ? ` Start where it says START HERE: that is ${D[rd.lo].name}, the side that needs you first.` : ''} Give it one week.`,
      actions,
      closing: { title: 'If the free North Star gave you this, imagine twelve weeks with Alexandru beside you.',
        lines: ['The Founder’s Blueprint takes these five actions and turns them into a road: twelve weeks, the same four domains, one step at a time, with the manuals beside you and Alexandru and the team when it gets hard.',
          'Weeks 1–3, the Founder Launchpad, are free and open tonight, with the full action plan: five actions in every domain. Your account is already made: sign in with your email.'],
        url: 'linktolead.exploraself.com', mentor: 'ExploraSelf · exploraself.com · Mentor: Alexandru Cojocari' } };
  }
  async function downloadPlan(btn) {
    const c = context();
    if (btn) { btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = 'Making your plan…'; }
    try {
      const m = await import('./plan-pdf.js');
      const blob = await m.makePlanPDF(planData(c));
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `${(S.profile.first || 'my').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-north-star-action-plan.pdf`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast('Your North Star Action Plan is downloaded.');
    } catch { toast('Your browser would not make the PDF. Try again, or use Print → Save as PDF.'); }
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t || 'Download my North Star Action Plan'; }
  }
  const pPlan = (c) => `<div class="plan-l">
      <span class="eb" style="color: #D6BF8F">Your North Star Action Plan · PDF</span>
      <h2 class="sf">Five actions for this week. <span class="sfi">Fill in the blanks.</span></h2>
      <p>One in each domain, in an order where each feeds the next, and a Sunday review that makes it stick. With your name, your reading and today’s date. Yours to keep, at no cost.</p>
      <ol class="plan-steps">${['Name your enough', 'Know your number', 'Hear it in their words', 'Give one thing away', 'Your Sunday review'].map((t, i) => `<li><b>${i + 1}</b>${t}</li>`).join('')}</ol>
      <button type="button" class="go plan-go no-print" data-act="plan-pdf" data-f="plan-pdf"${c.rd.any ? '' : ' disabled'}>Download my North Star Action Plan <span class="arr" aria-hidden="true">↓</span></button>
      ${c.rd.any ? '' : '<span class="plan-wait">Answer Part 1 first: the plan is built from your answers.</span>'}
    </div>
    <div class="plan-r" aria-hidden="true"><div class="plan-paper"><i></i><b>${esc((S.profile.first || 'Your').trim())}’s North Star Action Plan</b><span></span><span></span><span class="s"></span><em>1</em><span></span><span class="s"></span><em>2</em><span></span><span class="s"></span></div></div>`;

  /* ── Your next step (31 Oct, round 4): one ending, one button, said for who
   * is here. From the Blueprint: unlock more. New and mostly "Not yet": you
   * need a guided road, and the Launchpad is where the work is done. Others:
   * the Launchpad, free. ── */
  function pNext(c) {
    const a = c.qs.map((q) => S.ans[q.id]).filter((v) => Number.isInteger(v));
    const early = S.mode === 'idea' || (a.length >= 4 && a.filter((v) => v < 2).length / a.length >= 0.6);
    const head = (eb, h, em, p) => `<span class="eb" style="color: #D6BF8F">${eb}</span><h2 class="sf">${h} <span class="sfi">${em}</span></h2><p>${p}</p>`;
    const all = `<button type="button" class="nsnext-all no-print" data-act="alloptions" aria-expanded="${!!UI.opts}" aria-controls="s-options">${UI.opts ? 'Hide the options ↑' : 'See all options ↓'}</button>`;
    if (S.fromBP) return head('Your next step · you are already on the road', 'You have done the free part.', 'Now unlock the next stretch.',
      'Your North Star shows where to push next. One session with Alexandru, The Boardroom, opens modules 04–05 and the full North Star, so the work you started keeps going.')
      + `<a class="go nsnext-go no-print" href="${BOOKING}" target="_blank" rel="noopener">Book the Boardroom · unlock 04–05 <span class="arr" aria-hidden="true">↗</span></a>`
      + '<a class="nsnext-all no-print" href="/ground-plan/#home">Back to my Base Camp</a>' + all;
    if (early) return head('Your next step · what your answers ask for', 'You do not need more information.', 'You need a guided road.',
      'Many of your answers are still “not yet”. That is exactly what the Founder Launchpad is for. Week by week: tap what sounds like you, slide to the honest number, write one sentence with the blanks filled in, and read back exactly what to do. The manuals sit beside you. Free.')
      + '<a class="go nsnext-go no-print" href="/ground-plan/#home">Start the Founder Launchpad · free <span class="arr" aria-hidden="true">→</span></a>' + all;
    return head('Your next step', 'The Founder Launchpad.', 'Free, and open tonight.',
      'The first three weeks of The Founder’s Blueprint: settle what you believe about your business, learn to read it clearly, and stay steady when it pushes back.')
      + '<a class="go nsnext-go no-print" href="/ground-plan/#home">Open the Founder Launchpad · free <span class="arr" aria-hidden="true">→</span></a>' + all;
  }

  function pWeeks(c) {
    const WC = D.map((d) => d.hex), f = S.lean !== null ? S.lean : (c.rd.any ? c.rd.lo : null);
    const row = (d, i) => `<div style="display: grid; grid-template-columns: 170px repeat(12, minmax(0, 1fr)); gap: 6px; align-items: center; padding: 4px 0; border-radius: 6px; outline: ${f === i ? '1px solid rgba(111,147,184,.55)' : '1px solid transparent'}; outline-offset: 3px; transition: outline-color .4s ease">
        <span style="font-size: 12px; font-weight: 520; letter-spacing: .1em; text-transform: uppercase; color: ${f === i ? '#EEF2F7' : '#B8C6D6'}; display: inline-flex; align-items: center; gap: 8px">${d.name}${f === i ? '<span style="font-size: 10px; color: #0E1C2B; background: #6F93B8; border-radius: 3px; padding: 1px 5px">LEAN</span>' : ''}</span>
        ${Array.from({ length: 12 }, (_, k) => (k < 3 ? `<span class="cellin wfree" style="--wc: ${WC[i]}; animation-delay: ${(k * 0.06 + i * 0.04).toFixed(2)}s, ${(k * 0.25 + i * 0.12).toFixed(2)}s"><b>FREE</b></span>`
          : `<span class="cellin" style="height: 34px; border-radius: 3px; background: ${WC[i]}; opacity: ${Math.min(1, (0.28 + k * 0.055) * (f === null ? 1 : f === i ? 1.25 : 0.8)).toFixed(2)}; animation-delay: ${(k * 0.06 + i * 0.04).toFixed(2)}s; transition: opacity .5s ease"></span>`)).join('')}</div>`;
    const band = (span, text, on, br) => `<span style="grid-column: span ${span}; border-top: 2px solid ${br ? '#B4703F' : on ? '#6F93B8' : '#2A3A50'}; padding-top: 8px; text-align: center; font-size: 11px; font-weight: 520; letter-spacing: .1em; color: ${br ? '#D6BF8F' : on ? '#A9C0D9' : '#B8C6D6'}">${text}</span>`;
    return `<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px">
        <div style="display: flex; flex-direction: column; gap: 8px; max-width: 700px">
          <span class="eb" style="color: #D6BF8F">What comes after your North Star</span>
          <h2 class="sf" style="font-size: clamp(28px, 3.4vw, 40px); line-height: 1.1; color: #EEF2F7">You know where you stand. <span class="sfi" style="color: #D6BF8F">Here is the road from here.</span></h2>
          <p style="color: #D9E2EC; font-size: 16px; line-height: 1.7">It is called <b style="color: #F6EEDD">The Founder’s Blueprint</b>: twelve weeks, built on the same four domains you just looked at. Every week works all four, and leans on the one you are thinnest in${f === null ? '' : ': for you, ' + D[f].name.toLowerCase()}.</p>
          <p class="wfree-line"><span class="wfree-dot" aria-hidden="true"></span><span><b>The weeks framed in gold are free.</b> Weeks 1 to 3, the Founder Launchpad, open the moment you start. No card.</span></p>
        </div>
        <div class="no-print" style="display: flex; flex-direction: column; gap: 6px">
          <span style="font-size: 11px; letter-spacing: .14em; color: #B8C6D6" id="lean-h">PREVIEW A DIFFERENT LEAN</span>
          <div style="display: flex; gap: 6px; flex-wrap: wrap" role="group" aria-labelledby="lean-h">${D.map((d, i) => `<button type="button" data-act="lean" data-i="${i}" data-f="lean-${i}" aria-pressed="${f === i}" style="min-height: 40px; padding: 0 12px; border-radius: 4px; border: 1px solid ${f === i ? '#6F93B8' : '#2A3A50'}; background: ${f === i ? 'rgba(111,147,184,.18)' : 'transparent'}; color: #EEF2F7; font-size: 12px; font-weight: 520; cursor: pointer; display: inline-flex; align-items: center; gap: 6px"><span style="width: 9px; height: 9px; border-radius: 2px; background: ${WC[i]}"></span>${d.name}</button>`).join('')}</div>
        </div>
      </div>
      <div style="overflow-x: auto" role="img" aria-label="Twelve weeks across, the four domains down. Every week works all four${f === null ? '' : ', with more weight on ' + D[f].name}.">
        <div style="min-width: 760px; display: flex; flex-direction: column; gap: 8px">
          <div style="display: grid; grid-template-columns: 170px repeat(12, minmax(0, 1fr)); gap: 6px; align-items: end"><span></span>
            ${Array.from({ length: 12 }, (_, k) => `<span style="text-align: center; font-size: 12px; font-weight: 520; color: ${k < 3 ? '#D6BF8F' : '#8A7A5E'}; display: flex; flex-direction: column; align-items: center; gap: 4px">${k < 3 ? 'Week ' : ''}${k + 1}${k === 0 ? '<span class="pinp" style="width: 8px; height: 8px; border-radius: 50%; background: #D6BF8F"></span>' : ''}</span>`).join('')}</div>
          ${D.map(row).join('')}
          <div style="display: grid; grid-template-columns: 170px repeat(12, minmax(0, 1fr)); gap: 6px; margin-top: 8px"><span></span>
            ${band(3, 'FOUNDER LAUNCHPAD · FREE · OPEN NOW', false, true)}${band(2, 'BOOK THE BOARDROOM · UNLOCKS 04–05', false, true)}${band(4, 'PERSONAL LEADERSHIP LAB · $97 · 2 SESSIONS')}${band(3, 'BUSINESS HUB · $397 · 3 SESSIONS IN TOTAL')}</div>
        </div>
      </div>
      <div class="wfree-cta">
        <div style="flex: 1 1 380px; display: flex; flex-direction: column; gap: 6px">
          <span class="sf" style="font-size: 22px; line-height: 1.3; color: #F6EEDD">Right now you are one click from three of the twelve weeks. Free.</span>
          <span style="font-size: 15px; color: #D9E2EC; line-height: 1.6">You will settle what you believe about your business, learn to read it clearly, and stay steady when it pushes back. Then build on that, instead of starting over every Monday.</span>
        </div>
        <a href="/ground-plan/#home" class="go no-print" style="display: inline-flex; align-items: center; gap: 8px; min-height: 52px; padding: 0 22px; border-radius: 4px; background: #D6BF8F; color: #1C1309; font-weight: 600; text-decoration: none">Open my 3 free weeks <span class="arr" aria-hidden="true">→</span></a>
      </div>`;
  }

  const STOPS = [
    { n: '1', short: 'Founder Launchpad', unlock: 'You are one click from 3 of the 12 modules, free. You will know what you believe, read your business clearly and stay steady under pressure.', name: 'The Founder Launchpad', tag: 'Start here · free', line: 'Stop circling yourself. Settle who you are, then build.', modules: '01–03', sessions: '—', price: 'Free', cta: 'Start free', href: '/ground-plan/', x: 150, y: 360, lx: 136, ly: 364, anchor: 'end' },
    { n: '2', short: 'The Boardroom', unlock: 'Book one session with Alexandru. It unlocks modules 04–05 and the full North Star.', name: 'The Boardroom', tag: 'You and Alexandru', line: 'Sit at the table with Alexandru.', modules: '04–05', sessions: '1 session', price: '[YOUR PRICE]', cta: 'Book the Boardroom · unlock 04–05', href: BOOKING, ext: true, x: 290, y: 300, lx: 306, ly: 304, anchor: 'start' },
    { n: '3', short: 'Leadership LAB', unlock: 'Joining unlocks modules 06–09.', name: 'The Personal Leadership LAB', tag: 'Go deeper', line: 'Lead yourself first.', modules: '06–09', sessions: '2 sessions', price: '$97', cta: 'Join the LAB', href: LAB_URL, ext: true, x: 175, y: 235, lx: 161, ly: 239, anchor: 'end' },
    { n: '4', short: 'Business HUB', unlock: 'Joining unlocks modules 10–12.', name: 'The Business HUB', tag: 'Build the business', line: 'Build the business that carries it.', modules: '10–12', sessions: '3 in total (incl. 1 from the LAB)', price: '$397', cta: 'Join the HUB', href: HUB_URL, ext: true, x: 285, y: 160, lx: 301, ly: 164, anchor: 'start' },
    { n: '5', short: 'The Summit', unlock: 'Every module, with Alexandru every week.', name: 'The Summit', tag: 'The top', line: 'The whole Blueprint, with Alexandru every week.', modules: 'All', sessions: 'Every week', price: '$1,989', cta: 'Talk about The Summit', href: '/northstar/summit', x: 230, y: 58, lx: 258, ly: 62, anchor: 'start' },
  ];
  /* The chosen stop opens right under it (31 Oct, round 4): no scrolling on a phone. */
  const climbCard = (sv, si) => `<div class="pop climbcard" style="background: linear-gradient(120deg, rgba(43,27,18,.85), rgba(28,19,9,.85)); border: 1px solid rgba(214,191,143,.5); border-radius: 9px; padding: 20px; display: flex; flex-direction: column; gap: 10px" aria-live="polite">
            <span class="eb" style="color: #D6BF8F">${sv.tag}</span>
            <span class="sf" style="font-size: 28px; color: #EEF2F7; line-height: 1.15">${sv.name}</span>
            <span class="sfi" style="font-size: 18px; color: #D6BF8F; line-height: 1.35">${sv.line}</span>
            <div style="display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 6px; background: ${si === 1 ? 'rgba(214,191,143,.16)' : 'rgba(214,191,143,.07)'}; border: 1px solid ${si === 1 ? '#D6BF8F' : 'rgba(214,191,143,.3)'}"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; margin-top: 2px" fill="none" stroke="#D6BF8F" stroke-width="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="${si === 0 || si === 4 ? 'M8 11V8a4 4 0 0 1 7.5-2' : 'M8 11V8a4 4 0 0 1 8 0v3'}"/></svg><span style="font-size: 14.5px; font-weight: ${si === 1 ? 600 : 500}; color: #F6EEDD; line-height: 1.5">${sv.unlock}</span></div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-top: 4px">
              ${[['MODULES', sv.modules], ['WITH ALEXANDRU', sv.sessions], ['PRICE', sv.price]].map(([k, v]) => `<div style="border: 1px solid rgba(214,191,143,.28); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 11px; color: #CDBB97; letter-spacing: .1em">${k}</span><span style="font-weight: 520; color: #EEF2F7">${v}</span></div>`).join('')}
            </div>
            <a href="${sv.href}" class="go no-print"${sv.ext ? ' target="_blank" rel="noopener"' : ''} style="align-self: flex-start; margin-top: 6px; display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 18px; border-radius: 4px; background: #D6BF8F; color: #1C1309; font-weight: 520; text-decoration: none">${sv.cta} <span class="arr" aria-hidden="true">${sv.ext ? '↗' : '→'}</span></a>
          </div>`;
  function pClimb() {
    const si = S.stop, sv = STOPS[si];
    return `<div style="display: flex; flex-direction: column; gap: 8px; max-width: 720px">
        <span class="eb" style="color: #A9C0D9">Link to Lead · The Founder’s Blueprint</span>
        <h2 class="sf" style="font-size: clamp(28px, 3.4vw, 40px); line-height: 1.1; color: #EEF2F7">Your climb. <span class="sfi" style="color: #A9C0D9">One step at a time.</span></h2>
        <p style="color: #B8C6D6; font-size: 15px; line-height: 1.7">Five stops, one at a time. The first one is free. Tap a stop to see what opens there.</p></div>
      <div style="display: flex; flex-wrap: wrap; gap: 26px; align-items: center">
        <svg viewBox="0 0 460 420" style="flex: 1 1 340px; max-width: 520px; height: auto" role="img" aria-label="A constellation from The Founder Launchpad at the bottom to The Summit, the North Star, at the top">
          ${[[40, 40], [120, 110], [400, 70], [350, 30], [70, 200], [420, 220], [30, 330], [410, 360], [210, 140], [330, 260], [100, 280], [260, 380]].map(([x, y], k) => `<circle class="twinkle${k % 3 ? ' t' + (k % 3 + 1) : ''}" cx="${x}" cy="${y}" r="${(0.8 + (k % 3) * 0.4).toFixed(1)}" fill="${k % 4 ? '#A9C0D9' : '#D6BF8F'}" opacity=".7"/>`).join('')}
          <polyline class="trail" points="${STOPS.map((t) => t.x + ',' + t.y).join(' ')}" fill="none" stroke="#A9C0D9" stroke-width="1.2" opacity=".55"/>
          <polyline points="${STOPS.slice(0, si + 1).map((t) => t.x + ',' + t.y).join(' ')}" fill="none" stroke="#D6BF8F" stroke-width="1.8" style="filter: drop-shadow(0 0 4px rgba(214,191,143,.8))"/>
          ${STOPS.map((t, i) => `<g>${i === si ? `<circle class="halo" cx="${t.x}" cy="${t.y}" r="20" fill="none" stroke="#D6BF8F" stroke-width="1.5"/>` : ''}
            <path class="stopc" d="${starPath(t.x, t.y, i === 4 ? 16 : i === si ? 12 : 9)}" fill="${i <= si ? '#D6BF8F' : '#A9C0D9'}" style="animation-delay: ${(0.2 + i * 0.15).toFixed(2)}s"/>
            <text x="${t.lx}" y="${t.ly}" text-anchor="${t.anchor}" fill="${i === si ? '#D6BF8F' : '#B8C6D6'}" font-family="Inter" font-weight="520" font-size="12.5">${t.short}</text>${i === 1 ? `<g transform="translate(${t.lx + 101} ${t.ly - 11})" aria-hidden="true"><rect x="1" y="5" width="10" height="8" rx="1.5" fill="#B4703F"/><path d="M3.5 5V3.5a2.5 2.5 0 0 1 5 0" fill="none" stroke="#D6BF8F" stroke-width="1.3"/></g>` : ''}</g>`).join('')}
        </svg>
        <div style="flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 10px">
          <div class="climbstops no-print" role="group" aria-label="Stops on the climb">${STOPS.map((t, i) => `<button type="button" data-act="stop" data-i="${i}" data-f="stop-${i}" aria-pressed="${i === si}" class="${i === 0 ? 'cfree' : ''}"><span class="cn">${t.n}</span><span><b>${t.name}${i === 0 ? ' <em>Free</em>' : i === 1 ? ' <em class="cg">Unlocks 04–05</em>' : ''}</b><i>${t.line}</i></span></button>${i === si ? climbCard(sv, si) : ''}`).join('')}</div>

        </div>
      </div>`;
  }

  /* ── The What-if lab v2 ──────────────────────────────────────────────────
   * Four levers on the left, each in one row with the answer it moves most on
   * the right. The answers are read-only sliders that glide to their new value.
   * The lab runs only on the founder's own Part 3 numbers; until they are
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
  const labMode = () => (['money', 'both'].includes(S.lab.mode) ? S.lab.mode : 'time');
  const NUMW = ['no', 'this', 'these two', 'these three', 'these four'];

  /** Everything the lab shows, from the state. */
  function labCalc() {
    const b = E.labBase(S);
    if (!b.ready) {
      const names = Object.fromEntries(E.fieldsFor(S.mode).map(([k, l]) => [k, l]));
      return { locked: true, b, need: (b.need || []).map((k) => ({ k, label: names[k] })), planned: !!b.planned };
    }
    // Without a helper rate or the cost of one more person, the lab assumes
    // what one hour of the founder's own work earns today, and says so. The
    // founder can change both in Fine-tune.
    const own = b.hours > 0 ? (b.sales - b.deliv) / b.hours : 0;
    if (b.rate === null && own > 0) { b.rate = Math.round(own); b.rateAssumed = true; }
    if (b.hire === null && b.rate) { b.hire = Math.round(b.rate * 160); b.hireAssumed = true; }
    const mode = labMode(), t = E.month(b, {}, mode), s = E.month(b, S.lab, mode);
    // What each lever does on its own, to all four answers.
    const alone = PAIRS.map((x) => E.month(b, { [x.k]: S.lab[x.k] || 0 }, mode));
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
    return { locked: false, b, mode, t, s, scale, vals, alone, improved, worsened: PAIRS.map((x) => worse(x.out)), count: improved.filter(Boolean).length };
  }

  /** The parts of the lab that only change with its shape (locked or not, the
   *  plan box, Fine-tune). Values are set by updateLab, so the answers glide. */
  function pLabIn() {
    const L = labCalc(), plan = S.mode !== 'yes', cur = S.profile.currency;
    const input = (key, label, hint) => `<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 520; color: #EEF2F7">${label}
        <input class="inp" type="text" inputmode="decimal" data-lab="${key}" data-f="lab-${key}" value="${esc(S.lab[key])}" placeholder="${hint}" style="background: #121E2D; color: #EEF2F7; border-color: #2A3A50"></label>`;
    const missing = L.locked ? L.need : [];
    const chips = [...missing.map((x) => x.label), ...(L.locked && L.planned ? ['Customers a month you plan for (below)'] : [])];
    const lock = L.locked ? `<div class="wlock open" id="wlock" role="status">
        <div class="wlock-msg">
          <strong>Go on, move a lever. Then make it yours.</strong>
          <span>It answers only with your own month. Fill ${NUMW[Math.min(4, chips.length)]} ${chips.length === 1 ? 'box' : 'boxes'} ${missing.length ? 'in Part 3 · Your numbers' : 'below'} (a range is enough), and every slider moves your cash, clients, time and people.</span>
          <div class="wchips">${chips.map((c) => `<span class="wchip"><i aria-hidden="true"></i>${esc(c)}</span>`).join('')}</div>
        </div>
        ${missing.length ? '<button type="button" class="go" data-act="lab-take" data-f="lab-take" style="min-height: 48px; padding: 0 20px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 520; font-size: 15px; cursor: pointer">Take me there ↑</button>' : ''}
      </div>` : '';
    // Open to everyone (31 Oct, round 4): before the numbers, the levers move
    // but nothing answers; everything flashes red and points up to Part 3.
    const dis = '';
    const rows = PAIRS.map((x) => `<div class="wpair">
        <div class="wcard">
          <div class="wrow"><label for="w-${x.k}" class="wname"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex: none"><path d="${x.icon}" fill="none" stroke="#6F93B8" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>${x.name}</label><span class="wbig" id="lv-val-${x.k}">—</span></div>
          <input id="w-${x.k}" type="range" min="0" max="${E.LEVER_RANGE[x.k]}" step="5" value="${L.locked ? 0 : S.lab[x.k] || 0}" data-lever="${x.k}" data-f="w-${x.k}"${dis}>
          <span class="wnote" id="lv-note-${x.k}"></span>
          <div class="wmoves" id="lv-moves-${x.k}" aria-live="polite"></div>
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
        <button type="button" data-act="lab-mode" data-v="both" data-f="lab-mode-both"${dis}>A bit of both</button>
        <button type="button" data-act="lab-mode" data-v="money" data-f="lab-mode-money"${dis}>Give me more money</button>
      </div>
      <div class="wlab${L.locked ? ' locked' : ''}">
        <div class="wheads" aria-hidden="true"><span>You move</span><span></span><span>Moves by itself</span></div>
        <div class="wrows">${rows}</div>
      </div>
      <details class="wfine" data-fine${UI.fine ? ' open' : ''}><summary>Fine-tune (optional)</summary>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding-top: 12px">
          ${input('rate', `Helper rate per hour (${cur})`, L.b && L.b.rateAssumed ? `Now assumed: ${money(L.b.rate)}` : 'What you would pay')}
          ${input('hire', `Monthly cost of one more person (${cur})`, L.b && L.b.hireAssumed ? `Now assumed: ${money(L.b.hire)}` : 'Your estimate')}
        </div>
        ${L.b && (L.b.rateAssumed || L.b.hireAssumed) ? '<p style="font-size: 13px; color: #A9B6C6; margin-top: 8px">Until you type your own, help is assumed to cost what one hour of your work earns today, and one more person 160 of those hours a month.</p>' : ''}
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
      ${NP.map((n, i) => `<line x1="160" y1="85" x2="${n[1]}" y2="${n[2]}" stroke="#3A2F20" stroke-width="1"/><circle class="node" cx="${n[1]}" cy="${n[2]}" r="14" fill="${improved[i] ? '#6F93B8' : '#0E1C2B'}" stroke="#6F93B8" stroke-width="1.5"/><text x="${n[3]}" y="${n[4]}" text-anchor="${n[5]}" fill="#EEF2F7" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="520">${n[0]}</text>`).join('')}`;
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
        set('lv-val-' + x.k, '—'); set('lv-note-' + x.k, 'Try it. It answers once your numbers are in Part 3.');
        tween(x.out.k, null); set('out-note-' + x.out.k, 'Waiting for your numbers.');
        const f = document.getElementById('fill-' + x.out.k), th = document.getElementById('thumb-' + x.out.k), td = document.getElementById('today-' + x.out.k);
        if (f) { f.style.width = '0%'; f.style.background = '#8A7A5E'; }
        if (th) { th.style.left = '50%'; th.style.color = '#8A7A5E'; }
        if (td) td.style.left = '50%';
      }
      if (head) head.textContent = 'Put your numbers in Part 3 and this lab runs on your own month.';
      return;
    }
    const { b, s, t, scale, vals, mode } = L, plan = S.mode !== 'yes', { p = 0, m = 0, f = 0, d = 0 } = S.lab;
    const ab = (v) => (b.est || Math.abs(v - Math.round(v)) > 0.05 ? 'about ' : '');
    set('lv-val-p', p ? '+' + p + '% price' : 'Today'); set('lv-val-m', m ? '+' + m + '% say yes' : 'Today'); set('lv-val-f', f ? '−' + f + '% hours' : 'Today'); set('lv-val-d', d ? d + '% handed over' : 'Today');
    set('lv-note-p', plan ? `Each customer: ${money(b.sales / b.clients)} → ${money(b.sales / b.clients * (1 + p / 100))}` : `Your sales for the same work: ${money(b.sales)} → ${money(b.sales * (1 + p / 100))}`);
    set('lv-note-m', b.clients ? `Ready to buy: ${whole(b.clients)} → ${ab(b.clients * s.demand)}${whole(b.clients * s.demand)} a month, same marketing spend` : `${m ? '+' + m + '% more people say yes' : 'As many say yes as today'}, for the same marketing spend`);
    set('lv-note-f', plan ? `One customer takes ${Math.round(b.hours / b.clients * (1 - f / 100) * 10) / 10} hours of your time instead of ${Math.round(b.hours / b.clients * 10) / 10}.` : `Today’s work in ${ab(b.hours * (1 - f / 100))}${whole(b.hours * (1 - f / 100))} hours instead of ${whole(b.hours)}.`);
    set('lv-note-d', !d ? 'You do all the work yourself.' : b.rate !== null ? `${d}% of the work goes to a helper at ${money(b.rate)} an hour${b.rateAssumed ? ' (assumed: what your own hour earns; change it in Fine-tune)' : ''}.` : `${d}% of the work goes to a helper. Set the rate in Fine-tune.`);
    // Under each lever: what it alone does to all four answers.
    const dl = (a, z, fmt, unit, lowerGood) => { if (a === null || z === null) return ['—', '']; const x = a - z; if (Math.abs(x) < (unit === 'cash' ? 1 : 0.05)) return ['same', ''];
      return [(x > 0 ? '+' : '−') + fmt(Math.abs(x)), (lowerGood ? x < 0 : x > 0) ? 'up' : 'down']; };
    PAIRS.forEach((x, i) => {
      const el = document.getElementById('lv-moves-' + x.k); if (!el) return;
      if (!S.lab[x.k]) { el.innerHTML = ''; return; }
      const a = L.alone[i], cells = [['Cash', dl(a.cash, t.cash, money, 'cash')], ['Clients', dl(a.clients, t.clients, (v) => (Math.round(v * 10) / 10).toString())],
        ['Time', dl(a.mine, t.mine, (v) => whole(v) + ' h', 'time', true)], ['People', dl(a.people, t.people, (v) => (Math.round(v * 10) / 10).toFixed(1))]];
      const html = `<span class="wm-k">On its own:</span>${cells.map(([n, [v, cl]]) => `<span class="wm ${cl}">${n} <b>${v}</b></span>`).join('')}`;
      if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; }
    });

    PAIRS.forEach((x, i) => {
      const o = x.out, [v, w] = vals[o.k], max = scale[o.k];
      const pct = (y) => Math.max(0, Math.min(100, y / max * 100));
      const good = L.improved[i], bad = L.worsened[i], col = good ? '#9BC0A1' : bad ? '#E0A282' : null;
      const fl = document.getElementById('fill-' + o.k), th = document.getElementById('thumb-' + o.k), td = document.getElementById('today-' + o.k), card = document.getElementById('out-' + o.k);
      if (fl) { fl.style.width = (v === null ? 0 : pct(v)) + '%'; fl.style.background = col || '#8A7A5E'; }
      if (th) { th.style.left = (v === null ? 50 : pct(v)) + '%'; th.style.color = col || '#EEF2F7'; }
      if (td) { td.style.left = (w === null ? 50 : pct(w)) + '%'; td.hidden = w === null; }
      if (card) { card.setAttribute('aria-valuemax', String(Math.round(max))); if (v !== null) card.setAttribute('aria-valuenow', String(Math.round(v)));
        // A visible pulse on every answer that moved.
        const key = v === null ? 'x' : (Math.round(v * 10) / 10).toString();
        if (card.dataset.last !== undefined && card.dataset.last !== key && !reduced()) { card.classList.remove('wbump'); void card.offsetWidth; card.classList.add('wbump'); }
        card.dataset.last = key; }
    });
    const lim = document.getElementById('limit-time');
    if (lim) { lim.hidden = !b.limit; if (b.limit) lim.style.left = Math.min(100, b.limit / scale.time * 100) + '%'; }
    tween('cash', s.cash, money); tween('clients', s.clients, whole); tween('time', s.mine, (y) => whole(y) + ' h'); tween('people', s.people, (y) => (Math.round(y * 10) / 10).toFixed(1));

    const dc = s.cash === null ? null : s.cash - t.cash;
    set('out-note-cash', s.cash === null ? 'Set a helper rate in Fine-tune to see what the help costs.' : Math.abs(dc) < 1 ? 'Same money as today.' : `${signed(dc)} a month compared with today.`);
    set('out-note-clients', s.clients === null ? 'Add your new paying customers in Part 3 to see this.'
      : s.clients < s.clientsWanted - 0.05 ? `You serve ${ab(s.clients)}${whole(s.clients)}. ${whole(s.clientsWanted)} want you, so you can choose the best fit.`
      : s.clients > t.clients + 0.05 ? `+${whole(s.clients - t.clients)} a month compared with today.` : 'Same as today.');
    const back = t.mine - s.mine;
    set('out-note-time', b.limit ? (s.mine > b.limit ? `${whole(s.mine - b.limit)} hours beyond the ${whole(b.limit)} you chose.` : `Within the ${whole(b.limit)} hours you chose.${back > 0.5 ? ` ${whole(back)} hours a month back.` : ''}`)
      : `${back > 0.5 ? whole(back) + ' hours a month back.' : back < -0.5 ? whole(-back) + ' more hours a month.' : 'Same hours as today.'} Add the hours you want to work in Part 3 to see your limit.`);
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
    const goalLine = wants().map((w) => E.GOALS.find((x) => x[0] === w)).filter(Boolean).map((g) => 'Your goal, ' + g[1].toLowerCase() + ': ' + (E.goalHelped(g[0], t, s, d) ? 'this change moves you toward it.' : 'this change alone does not get you there. Try another lever with it.')).join(' ');
    return `<div class="pop labdeep"><div class="labdeep-2">
      <div style="background: rgba(247,242,231,.05); border: 1px solid #3A2F20; border-radius: 9px; padding: 18px; display: flex; flex-direction: column; gap: 10px">
        <span class="eb" style="color: #A9C0D9">The chain reaction</span>
        <span style="display: inline-flex; align-self: flex-start; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 16px; background: #6F93B8; color: #0E1C2B; font-weight: 520; font-size: 13px">${LV.name}</span>
        ${chain.map(([nm, ar, v, col], k) => `<div class="itemin" style="display: flex; align-items: center; gap: 10px; font-size: 14px; animation-delay: ${(0.1 + k * 0.15).toFixed(2)}s"><svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true"><path d="M1 7h16M13 2l5 5-5 5" fill="none" stroke="#8A7A5E" stroke-width="1.6" stroke-linecap="round"/></svg><span style="flex: 1; color: #EEF2F7">${nm}</span><span style="font-weight: 520; color: ${col}">${ar} ${esc(v)}</span></div>`).join('')}
      </div>
      <div style="background: rgba(247,242,231,.05); border: 1px solid #3A2F20; border-radius: 9px; padding: 18px; display: flex; flex-direction: column; gap: 10px">
        <span class="eb" style="color: #A9C0D9">What this means for you</span>
        <span class="sf" style="font-size: 20px; line-height: 1.3; color: #EEF2F7">${meaning}</span>
        ${goalLine ? `<span style="font-size: 14px; color: #A9C0D9">${goalLine}</span>` : ''}
        <div style="display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: #B8C6D6; border-top: 1px solid #3A2F20; padding-top: 10px"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; margin-top: 2px"><path d="M12 3l9 16H3z" fill="none" stroke="#DDBD69" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4M12 16.5v.5" stroke="#DDBD69" stroke-width="2" stroke-linecap="round"/></svg><span><b style="color: #EEF2F7">Watch out:</b> ${LV.watch}</span></div>
        <div style="display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: #B8C6D6"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex: none; margin-top: 2px"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#9BC0A1" stroke-width="2.2" stroke-linecap="round"/></svg><span><b style="color: #EEF2F7">First step this week:</b> ${LV.first}</span></div>
      </div>
      </div>
      <div class="jnywrap">
        ${signedIn() && UI.plans && UI.plans.whatif && UI.plans.whatif.id === WHATIF_IDS[dom] ? journey(UI.plans.whatif.steps, LV)
          : planBlock(LV.steps, null, 'Your plan for this change', 'Open my step-by-step plan')}
      </div></div>`;
  }
  /* The plan for a change, as one journey across the screen (31 Oct): four
   * stops in a row, what to do at each and what you have once it is done.
   * The trail lights up as stops are ticked. */
  function journey(steps, LV) {
    const done = steps.map((st) => !!UI.plans.done[st.id]), n = done.filter(Boolean).length, next = done.indexOf(false);
    const end = n === steps.length ? 'Road walked. Run the lab again with your new numbers, and pick the next lever.'
      : n >= 2 ? 'Halfway. The last stops are where the change sticks.' : n === 1 ? 'One stop behind you. Keep the pace: one stop a week.' : 'Start at stop 1, this week.';
    return `<div class="jny">
      <div class="jny-head"><span class="eb" style="color: #A9C0D9">Your journey · ${esc(LV.name.toLowerCase())}</span><span class="sf">From where you are to where this change takes you. <b>${n} of ${steps.length}</b> stops done.</span></div>
      <ol class="jny-road" style="--p: ${steps.length > 1 ? Math.min(1, n / (steps.length - 1)) : 1}">${steps.map((st, k) => `<li class="${done[k] ? 'done' : ''}${k === next ? ' next' : ''}">
        <span class="jn" aria-hidden="true">${done[k] ? '✓' : k + 1}</span>
        <span class="jstop">Stop ${k + 1}${st.domainName ? ` · <i>${esc(st.domainName)}</i>` : ''}</span>
        <b>${esc(st.title)}</b>
        ${st.why ? `<p><em>Why it matters:</em> ${esc(st.why)}</p>` : ''}
        ${st.what ? `<p><em>What to do:</em> ${esc(st.what)}</p>` : ''}
        ${st.about ? `<p class="jt"><em>About:</em> ${esc(st.about)}</p>` : ''}
        ${st.ask ? `<p class="sfi jask">“${esc(st.ask)}”</p>` : ''}
        ${st.done ? `<p class="jd"><small>Done looks like</small>${esc(st.done)}</p>` : ''}
        <label class="jtick"><input type="checkbox" data-tick="${esc(st.id)}" data-f="tick-${esc(st.id)}"${done[k] ? ' checked' : ''}>Done</label></li>`).join('')}</ol>
      <p class="jny-end">${end}</p></div>`;
  }
  function labFoot() {
    const b = E.labBase(S);
    const parts = [];
    if (b.ready) parts.push(b.plan ? 'Built from your offer in Part 3 and the customers a month you plan for.' : 'Built from your month in Part 3.');
    if (b.ready && b.est) parts.push('Some of it comes from ranges, so read every figure as “about”.');
    if (b.ready && b.acqMissing) parts.push('Spending to win customers was not entered, so it counts as nothing here.');
    parts.push(labMode() === 'time' ? '“Give me back time” serves only the work needed to keep today’s money.' : labMode() === 'both' ? '“A bit of both” splits every gain: half goes to your time, half to your money.' : '“Give me more money” serves everyone who wants to buy.');
    if (b.ready && (S.lab.rate === '' || S.lab.hire === '')) parts.push('Help is assumed to cost what one hour of your work earns today, until you set your own figures in Fine-tune.');
    parts.push('A higher price may change demand, and help costs money before it saves time. Check both before acting.');
    return parts.join(' ');
  }

  /** A lever moved before the numbers: everything flashes red three times and
   *  says where to go. Once per gesture, not on every step of the slider. */
  let nudging = 0;
  function labNudge() {
    if (Date.now() - nudging < 2400) return;
    nudging = Date.now();
    const w = document.querySelector('.wlab'), l = document.getElementById('wlock');
    [w, l].forEach((el) => { if (el) { el.classList.remove('wred'); void el.offsetWidth; el.classList.add('wred'); } });
    setTimeout(() => { [w, l].forEach((el) => el && el.classList.remove('wred')); document.querySelectorAll('[data-lever]').forEach((x) => { x.value = 0; }); }, 2300);
    toast('Nice try! Go up and put your numbers in Part 3 first, then this runs on your own month.');
  }
  /** "Take me there": up to Part 3, the right group open, the missing boxes
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
    <span style="flex: 1; font-size: 12px; color: #B8C6D6; line-height: 1.3"><b style="color: #EEF2F7">${c.pc.total}/16</b> stars lit</span>
    <button type="button" data-act="print" data-f="m-print" aria-label="Print or save as PDF" style="width: 44px; height: 44px; border-radius: 50%; border: 1px solid #2A3A50; background: transparent; color: #EEF2F7; cursor: pointer; display: inline-flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M6 14h12v7H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></button>
    <button type="button" data-act="email" data-f="m-email" style="min-height: 44px; padding: 0 14px; border-radius: 22px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 520; cursor: pointer">Email me</button>`;

  const INDUSTRIES = ['Coaching & consulting', 'Creative & design', 'E-commerce & retail', 'Food & hospitality', 'Health & wellness', 'Beauty & personal care', 'Education & training', 'Professional services', 'Trades & construction', 'Technology & software', 'Real estate', 'Manufacturing', 'Nonprofit & social impact', 'Other'];
  // A value from the account that is not in this list still shows as chosen (31 Oct).
  const industrySelect = (id, extra = '') => { const cur = S.profile.industry || '', list = cur && !INDUSTRIES.includes(cur) ? [cur, ...INDUSTRIES] : INDUSTRIES; return `<select class="inp" id="${id}" ${extra}><option value="">Choose your industry…</option>${list.map((x) => `<option${cur === x ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`; };
  function pGate() {
    if (!UI.gate) return '';
    const P = S.profile, lab = 'display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 520';
    const siTitle = UI.signinFor === 'menu' ? 'Sign in to your account' : 'Sign in to open your plans';
    if (UI.signinFor === 'plans' || UI.signinFor === 'menu') return `<div style="position: fixed; inset: 0; z-index: 50; background: rgba(16,13,9,.6); display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto">
      <form class="card pop" id="signin-form" role="dialog" aria-modal="true" aria-labelledby="si-h" novalidate style="position: relative; width: 100%; max-width: 440px; padding: 26px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 30px 70px rgba(0,0,0,.35); margin: auto">
        <button type="button" data-act="si-x" data-f="si-x" aria-label="Close" style="position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); background: var(--paper); color: var(--ink); cursor: pointer">×</button>
        <h2 id="si-h" class="sf" style="font-size: 24px; font-weight: 440; padding-right: 44px">${siTitle}</h2>
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
        <span id="gate-err" role="alert" style="font-size: 13px; color: var(--self); font-weight: 520"></span>
        <button type="submit" data-f="gate-go" style="min-height: 50px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 520; font-size: 15px; cursor: pointer">Start my North Star →</button>
        <button type="button" data-act="gate-skip" data-f="gate-skip" style="min-height: 44px; border-radius: 5px; border: 1px solid var(--line); background: transparent; color: var(--ink); font-weight: 520; cursor: pointer">Skip for now · keep exploring</button>
        ${UI.signinOpen ? `<div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); padding-top: 12px"><span style="font-size: 13px; font-weight: 520">Already have an account? Sign in with the email above.</span>${pSignin('gate')}</div>`
          : '<button type="button" data-act="signin-open" data-f="signin-open" style="border: 0; background: none; padding: 6px 0; color: var(--goldink); font-size: 13px; font-weight: 520; text-decoration: underline; text-underline-offset: 4px; cursor: pointer">Already have an account? Sign in</button>'}
        <span style="font-size: 12px; color: var(--muted); text-align: center">Until you add your email, your answers stay only in this browser. Came from our page? You will not see this box.</span>
      </form></div>`;
  }
  /* Password boxes, each with a show / hide button. */
  const pwInput = (id, label, auto) => `<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 520">${label}<span style="display: flex; gap: 6px"><input class="inp" id="${id}" type="password" autocomplete="${auto}" style="flex: 1; min-width: 0"><button type="button" data-act="eye" data-v="${id}" data-f="eye-${id}" aria-label="Show ${label.toLowerCase()}" aria-pressed="false" style="width: 46px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); cursor: pointer"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></button></span></label>`;
  const linkBtn = (where, t) => `<button type="button" data-act="signin-${where}" data-f="signin-${where}-${t.length}" ${UI.signinBusy ? 'disabled' : ''} style="border: 0; background: none; padding: 6px 0; color: var(--goldink); font-size: 13px; font-weight: 520; text-decoration: underline; text-underline-offset: 4px; cursor: pointer">${t}</button>`;
  /** Sign in: email and password; "Forgot your password? Email me a sign-in link" sends a one-time link. */
  const pSignin = (where) => `${pwInput('si-pw-' + where, 'Password', 'current-password')}
    <button type="button" data-act="pw-in" data-v="${where}" data-f="pw-in-${where}" ${UI.signinBusy ? 'disabled' : ''} style="min-height: 46px; border-radius: 5px; border: 0; background: var(--deep); color: #EEF2F7; font-weight: 520; cursor: pointer">Sign in</button>
    <span style="display: flex; gap: 14px; flex-wrap: wrap"><button type="button" data-act="reset-open" data-v="${where}" data-f="reset-${where}" style="border: 0; background: none; padding: 6px 0; color: var(--goldink); font-size: 13px; font-weight: 520; text-decoration: underline; text-underline-offset: 4px; cursor: pointer">Forgot your password?</button></span>
    ${UI.signin ? `<span role="status" style="font-size: 13px; color: var(--ink)">${esc(UI.signin)}</span>` : ''}`;
  const pPassword = () => `<details${UI.pwmsg ? ' open' : ''}><summary style="cursor: pointer; font-weight: 520; color: var(--goldink); min-height: 32px">${UI.hasPw ? 'Change your password' : 'Set a password (optional)'}</summary>
    <div style="display: flex; flex-direction: column; gap: 10px; padding-top: 8px; max-width: 420px">${pwInput('pw-1', 'Password', 'new-password')}${pwInput('pw-2', 'Confirm password', 'new-password')}
    <button type="button" data-act="pw-save" data-f="pw-save" style="align-self: flex-start; min-height: 44px; padding: 0 16px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 520; cursor: pointer">Save my password</button>
    ${UI.pwmsg ? `<span role="status" style="font-size: 13px; color: var(--ink)">${esc(UI.pwmsg)}</span>` : ''}</div></details>`;
  const pHow = () => (UI.how ? `<div class="card pop" style="padding: 18px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 13px">
      <span style="display: flex; gap: 8px"><b style="color: var(--goldink)">1</b>Say where you are and where you want to get.</span>
      <span style="display: flex; gap: 8px"><b style="color: var(--goldink)">2</b>Answer 8 questions from real life.</span>
      <span style="display: flex; gap: 8px"><b style="color: var(--goldink)">3</b>Add rough numbers. A range is enough.</span>
      <span style="display: flex; gap: 8px"><b style="color: var(--goldink)">4</b>Read your North Star, ask “what if?”, tick “Got it”, choose your next steps.</span></div>` : '');
  function pWs() {
    if (!UI.ws) return '';
    const P = S.profile, lab = 'display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 520';
    const TYPES = ['Solopreneur (just me)', 'Small business with a team', 'Growing company with managers', 'Not started yet (an idea)'];
    const CUR = [['USD', 'USD $'], ['EUR', 'EUR €'], ['GBP', 'GBP £'], ['CAD', 'CAD $'], ['AUD', 'AUD $']];
    return `<div class="card pop" style="padding: 22px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 24px 50px rgba(28,19,9,.14)">
      <div style="position: relative; display: flex; flex-direction: column; gap: 4px; padding-right: 52px"><span class="eb">Your workspace</span><span class="sf" style="font-size: 24px">Make this yours.</span>
        <button type="button" data-act="ws" data-f="ws-close" aria-label="Close your workspace" title="Close" style="position: absolute; top: -6px; right: -6px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); background: var(--paper); color: var(--ink); cursor: pointer; display: inline-flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><span style="font-size: 13px; color: var(--muted)">${signedIn() ? 'Your answers and numbers are kept with your account.' : 'Your answers and numbers are kept on this browser. With a free account they follow you to any device.'}</span></div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px">
        <label style="${lab}">First name<input class="inp" id="ws-first" type="text" autocomplete="given-name" value="${esc(P.first)}" data-f="ws-first"></label>
        <label style="${lab}">Surname<input class="inp" id="ws-last" type="text" autocomplete="family-name" value="${esc(P.last)}"></label>
        <label style="${lab}">Business name<input class="inp" id="ws-business" type="text" value="${esc(P.business)}" placeholder="Your business"></label>
        <label style="${lab}">Business type<select class="inp" id="ws-type"><option value="">Choose…</option>${TYPES.map((t) => `<option${P.type === t ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
        <label style="${lab}">Industry <span id="ws-ind-req" style="color: var(--self); font-weight: 400"${P.industry ? ' hidden' : ''}>required</span>${industrySelect('ws-industry', 'required')}</label>
        <label style="${lab}">Currency<select class="inp" id="ws-currency">${CUR.map(([v, t]) => `<option value="${v}"${P.currency === v ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
      </div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
        <span style="font-size: 13px; font-weight: 520">Theme</span>
        ${['light', 'dark'].map((t) => `<button type="button" data-act="theme" data-v="${t}" data-f="theme-${t}" aria-pressed="${siteTheme() === t}" style="min-height: 44px; padding: 0 16px; border-radius: 5px; border: 1.5px solid ${siteTheme() === t ? '#6F93B8' : 'var(--line)'}; background: var(--paper); color: var(--ink); cursor: pointer; font-weight: 520">${t === 'light' ? 'Light' : 'Dark'}</button>`).join('')}
        <button type="button" data-act="ws-save" data-f="ws-save" style="margin-left: auto; min-height: 46px; padding: 0 20px; border-radius: 5px; border: 0; background: #6F93B8; color: #0E1C2B; font-weight: 520; cursor: pointer; display: inline-flex; align-items: center; gap: 8px">${lockIcon('#0E1C2B', 16)}Save &amp; lock my workspace</button>
      </div>
      ${UI.saved ? `<span class="pop" role="status" style="font-size: 13px; color: ${UI.saved === true ? 'var(--people)' : 'var(--self)'}; font-weight: 520">${UI.saved === true ? (signedIn() ? 'Saved to your account. Your preferences and numbers are locked to this workspace.' : 'Saved. Your preferences and numbers are kept with this workspace on this browser.') : esc(UI.saved)}</span>` : ''}
      <div style="border-top: 1px solid var(--line); padding-top: 14px; display: flex; flex-direction: column; gap: 8px">
        ${signedIn() ? `<span style="font-size: 13px; color: var(--muted)">Signed in${P.email ? ' as <b style="color: var(--ink)">' + esc(P.email) + '</b>' : ''}. On another device, sign in with this address.</span>${pPassword()}`
          : `<span style="font-size: 13px; font-weight: 520">Already have an account? Sign in</span><label style="${lab}">Email<input class="inp" id="ws-signin" type="email" autocomplete="email" value="${esc(P.email)}"></label>${pSignin('ws')}`}
      </div>
    </div>`;
  }

  /* ── The printed North Star (31 Oct, round 5): its own clean pages, in black
   * and white, built from the founder's answers when they print (the Print
   * and Save as PDF buttons, or the browser's own print). Page 1 their
   * reading, then each part, and on the last page the road ahead: The
   * Founder's Blueprint. The screen page itself never prints. ── */
  function printHTML() {
    const c = context(), rd = c.rd, sc = c.sc, first = (S.profile.first || '').trim();
    const f = (i) => E.feedback(i, sc[i], S.pains, wants());
    const date = (() => { try { return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return ''; } })();
    const R = 120, cx = 160, cy = 150, rA = sc.map((x) => 10 + x.score / 6 * (R - 10)), rS = rd.str.map((v) => 10 + v / 5 * (R - 10));
    const pts = (r) => `${cx},${cy - r[0]} ${cx + r[1]},${cy} ${cx},${cy + r[2]} ${cx - r[3]},${cy}`;
    const shape = `<svg viewBox="-50 0 420 300" width="300" height="214" aria-hidden="true"><defs><pattern id="pg" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-width="1.2"/></pattern></defs>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#999"/><circle cx="${cx}" cy="${cy}" r="${R / 2}" fill="none" stroke="#ccc"/><line x1="${cx}" y1="${cy - R - 8}" x2="${cx}" y2="${cy + R + 8}" stroke="#ccc"/><line x1="${cx - R - 8}" y1="${cy}" x2="${cx + R + 8}" y2="${cy}" stroke="#ccc"/>
      ${rd.str.some((v) => v) ? `<polygon points="${pts(rS)}" fill="url(#pg)" stroke="#000" stroke-width="1.5" stroke-dasharray="5 4"/>` : ''}
      ${rd.any ? `<polygon points="${pts(rA)}" fill="#fff" stroke="#000" stroke-width="2.5"/><polygon points="${pts(rA)}" fill="#ddd" opacity=".6"/>` : ''}
      <g font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#000" letter-spacing="1"><text x="${cx}" y="${cy - R - 14}" text-anchor="middle">LEAD YOURSELF</text><text x="${cx}" y="${cy + R + 22}" text-anchor="middle">LEAD YOUR BUSINESS</text><text x="${cx + R + 10}" y="${cy + 4}">PEOPLE</text><text x="${cx - R - 10}" y="${cy + 4}" text-anchor="end">MARKET</text></g></svg>`;
    const sec = (eb, h, body, br = true) => `<section class="pp${br ? ' br' : ''}"><p class="pp-eb">${eb}</p><h2>${h}</h2>${body}</section>`;
    const rows = (list) => `<table class="pp-t">${list.map(([a, b, n]) => `<tr><th>${esc(a)}</th><td><b>${esc(b)}</b>${n ? `<br><span>${esc(n)}</span>` : ''}</td></tr>`).join('')}</table>`;
    const P = partState(c);
    let out = `<header class="pp-head"><p class="pp-eb">ExploraSelf · The Leader’s North Star${date ? ' · ' + date : ''}</p>
      <h1>${first ? esc(first) + '’s North Star' : 'My North Star'}</h1>
      ${rd.any ? `<p class="pp-arch">${esc(ARCH[rd.hi][0])} <span>· ${esc(ARCH[rd.hi][1])}</span></p>` : ''}
      <p>${esc(E.STAGES[c.here].name)}${c.goal >= 0 && c.goal !== c.here ? ' → ' + esc(E.STAGES[c.goal].name) : ''}${S.values.length ? ' · Leading for ' + esc(named(M.VALUES, S.values).join(' & ')) : ''}</p></header>`;
    out += `<section class="pp"><div class="pp-row"><div>${shape}<p class="pp-key"><span class="k1"></span> Your answers <span class="k2"></span> Your strengths, as you rated them (the hatched space between is unused potential)</p></div>
      <div>${rd.any ? `<p class="pp-k">Strongest</p><p class="pp-v">${D[rd.hi].name}</p><p class="pp-k">Needs you first</p><p class="pp-v">${D[rd.lo].name}</p><p class="pp-k">Start here</p><p>${esc(D[rd.lo].step)}</p>` : '<p>Answer the questions in Part 1 to see your reading.</p>'}</div></div>
      ${P.fin[0] ? pGap(c).replace(/<span class="eb">[^<]*<\/span>/, '').replace('The gold in your North Star is that gap', 'The hatched space in the picture is that gap') : ''}</section>`;
    // Part 1: the answers and their next steps.
    const qa = c.qs.filter((q) => Number.isInteger(S.ans[q.id])).map((q) => [q.short, E.ANSWERS[S.ans[q.id]][0], noteFor(q, S.ans[q.id])]);
    const told = [['What hurts most', named(E.PAINS, S.pains).join(' · ')], ['What you want most', named(E.GOALS, wants()).join(' · ')], ['What you care about most', named(M.VALUES, S.values).join(' · ')]].filter((x) => x[1]);
    if (qa.length) out += sec('Part 1 · Yourself', 'Your answers, and the next step for each', rows(qa) + (told.length ? rows(told.map(([a, b]) => [a, b, ''])) : '')
      + (rd.any ? `<div class="pp-box"><p class="pp-k">Ask yourself</p><p class="pp-q">“${esc(f(rd.lo).ask)}”</p></div>` : ''));
    // Part 2.
    if (S.p2.team) {
      const R2 = p2Read(), a2 = R2.qs.filter((q) => Number.isInteger(S.p2.ans[q.id])).map((q) => [q.short, E.ANSWERS[S.p2.ans[q.id]][0], S.p2.ans[q.id] < 2 ? q.lo : q.hi]);
      if (a2.length) out += sec('Part 2 · Your people', 'Who you serve, and who serves with you', `<p><b>Your customers:</b> ${esc(R2.cust.big)} <b>${S.p2.team === 'solo' ? 'Your first team' : 'Your team'}:</b> ${esc(R2.team.big)}</p>` + rows(a2));
    }
    // Part 3: the four domains, with the numbers.
    const anyNum = E.groupsFor(S.mode).some((g) => E.insight(g.key, c.n, S.mode, money));
    out += sec('Part 3 · Your numbers', 'What it means, in all four domains',
      (anyNum ? `<ul class="pp-l">${E.groupsFor(S.mode).map((g) => [g.title, E.insight(g.key, c.n, S.mode, money)]).filter((x) => x[1]).map(([t, v]) => `<li><b>${esc(t)}:</b> ${esc(v)}</li>`).join('')}</ul>` : '')
      + D.map((d, i) => { const fb = f(i); return `<div class="pp-dom"><p class="pp-k">${d.name} · ${sc[i].answered ? esc(fb.band) + ` · ${sc[i].score} of 6` : 'not answered yet'}</p><p class="pp-v">${esc(fb.big)}</p><p>${esc(fb.why)} <b>This week:</b> ${esc(fb.week)}</p></div>`; }).join(''));
    // Part 4: the lever, if one moved.
    const dom = E.strongestLever(S.lab.p || 0, S.lab.m || 0, S.lab.f || 0, S.lab.d || 0);
    if (dom >= 0 && !labCalc().locked) { const LV = E.LEVERS[dom];
      out += sec('Part 4 · Your next steps', `The lever you tried: ${esc(LV.name.toLowerCase())}`, `<p><b>Watch out:</b> ${esc(LV.watch)}</p><p><b>Your first step this week:</b> ${esc(LV.first)}</p><ol class="pp-l">${LV.steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>`, false); }
    // The last page: the road ahead.
    out += `<section class="pp br pp-promo"><p class="pp-eb">Your next step</p>
      <h2>The Founder’s Blueprint</h2>
      <p class="pp-big">Twelve weeks that take your business out of your head and onto paper, built on the same four domains you just read: lead yourself, lead your people, lead your business, lead the market.</p>
      <table class="pp-t pp-ladder">
        <tr><th>Weeks 1–3</th><td><b>The Founder Launchpad · free</b><br><span>Settle what you believe about your business, learn to read it clearly, and stay steady when it pushes back.</span></td></tr>
        <tr><th>Weeks 4–5</th><td><b>The Boardroom</b><br><span>One session with Alexandru. It opens the next two weeks and the full North Star.</span></td></tr>
        <tr><th>Weeks 6–9</th><td><b>The Personal Leadership LAB · $97</b><br><span>Lead yourself first.</span></td></tr>
        <tr><th>Weeks 10–12</th><td><b>The Business HUB · $397</b><br><span>Build the business that carries it.</span></td></tr>
        <tr><th>All twelve</th><td><b>The Summit · $1,989</b><br><span>The whole Blueprint, with Alexandru beside you every week.</span></td></tr>
      </table>
      <div class="pp-cta"><p class="pp-k">Start tonight, at no cost</p><p class="pp-url">linktolead.exploraself.com</p><p>Your account is already open: sign in with ${S.profile.email ? '<b>' + esc(S.profile.email) + '</b>' : 'your email'} and the Founder Launchpad is waiting.</p></div>
      <p class="pp-foot">ExploraSelf · exploraself.com · Mentor: Alexandru Cojocari<br>Every figure here comes from what you entered. A planning aid, not financial, tax or legal advice.</p></section>`;
    return out;
  }
  function preparePrint() {
    let el = document.getElementById('nsprint');
    if (!el) { el = document.createElement('div'); el.id = 'nsprint'; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); }
    try { el.innerHTML = printHTML(); } catch { el.innerHTML = ''; }
  }
  window.addEventListener('beforeprint', preparePrint);

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
    put('skipnote', pAgain() + pSkip());
    put('s-journey', pJourney(c));
    put('herebar', pHerebar(c));
    put('modes', pModes());
    put('dombars', pDombars(c));
    put('questions', pQuestions(c));
    put('s-strengths', pStrengths(c));
    put('s-reading', pReading(c));
    put('fbw-1', pFb1(c));
    put('p2', pPeople(c));
    put('fbw-2', pFb2(c));
    put('fbw-3', pFb3(c));
    put('nsprog', pProg(c));
    put('s-numbers', pNumbers(c));
    for (let i = 0; i < 4; i++) put('fb-' + i, pFeedback(c, i));
    put('s-save', pSave(c));
    put('s-plan', pPlan(c));
    put('s-growth', pGrowth());
    put('s-next', pNext(c));
    put('s-weeks', pWeeks(c));
    put('s-climb', pClimb());
    put('lab-in', pLabIn());
    updateLab();
    put('lab-deep', pLabDeep());
    put('fbw-4', pFb4(c));
    $('#labtag').textContent = S.mode === 'yes' ? 'Part 4 · Your next steps · the what-if lab' : 'Part 4 · Your next steps · the what-if lab';
    $('#labfoot').textContent = labFoot();
    put('mbar', pMbar(c));
    put('gate', pGate());
    put('how', pHow());
    put('ws', pWs());
    $('#how-btn').setAttribute('aria-expanded', String(UI.how));
    $('#ws-btn').setAttribute('aria-expanded', String(UI.ws));
    mountCrown(); placeCrown(); lockParts(c); celebrate(c);
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
    put('fbw-4', pFb4(context()));
    $('#labfoot').textContent = labFoot();
  }

  const SECTION = { overview: 's-overview', clear: 's-clear', people: 's-people', numbers: 's-numbers', plan: 's-whatif', method: 's-method', journey: 's-journey', weeks: 's-weeks', save: 's-save' };
  function go(page) {
    sync(); // the end of a section
    UI.page = page in SECTION && page !== 'journey' ? page : page === 'journey' ? 'clear' : UI.page;
    render();
    // A part opens at its dividing line, with its title, just under the top bar (31 Oct).
    const el = document.getElementById({ people: 'nsdiv-2', numbers: 'nsdiv-3', plan: 'nsdiv-4' }[page] || SECTION[page]);
    if (!el) return;
    const ban = document.getElementById('banner'), banH = ban && ban.classList.contains('stuck') ? ban.offsetHeight : ban && !document.body.classList.contains('ns-qview') ? Math.min(ban.offsetHeight, 64) : 0;
    const top = el.getBoundingClientRect().top + scrollY - ((($('.topwrap') || {}).offsetHeight) || 0) - banH - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced() ? 'auto' : 'smooth' });
  }
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.style.display = 'block';
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.style.display = 'none'; }, 4000);
  }

  /* ── Email: sent once through /api/send-plan, only when asked ─────────────── */
  function planForEmail() {
    const c = context(), n = c.n;
    const domains = D.map((d, i) => { const f = E.feedback(i, c.sc[i], S.pains, wants());
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
    const next = order.slice(0, 3).map((i) => ({ title: D[i].name, text: E.feedback(i, c.sc[i], S.pains, wants()).week }));
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
  /* A locked part, or a jump to one: guide back to what is still open. */
  document.addEventListener('click', (e) => {
    const c = context(), P = partState(c);
    const go = e.target.closest && e.target.closest('[data-go]');
    const want = go ? { people: 2, numbers: 3 }[go.dataset.go] : 0;
    const inLocked = e.target.closest && e.target.closest('.nslocked');
    const need = want ? want : inLocked ? +inLocked.dataset.part : 0;
    if (!need) return;
    const [p1, p2, p3] = P.fin;
    if ((need >= 2 && !p1) || (need >= 3 && !p2) || (need === 4 && !p3)) { e.preventDefault(); e.stopPropagation(); guide(c, need); }
  }, true);
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
      case 'ans': gated(() => { S.ans[t.dataset.q] = Number(v); }); fullscreenTip(); return;
      case 'nsq-full': enterFull(true); return;
      case 'nsq-exit': exitFull(); return;
      case 'nsq': qi = i; document.body.classList.remove('nsb-open'); put('questions', pQuestions(context())); placeCrown(); { const r = document.getElementById('nsb-r'); if (r) r.focus({ preventScroll: true }); } return;
      case 'nsmove': nsMove(Number(v)); return;
      case 'nsb-steps': document.body.classList.toggle('nsb-open'); if (document.body.classList.contains('nsb-open')) { const n = document.querySelector('.nsb-s.now'); if (n) n.focus({ preventScroll: true }); } return;
      case 'str': gated(() => { S.str[i] = Number(v); }); return;
      case 'pain': gated(() => { const cur = S.pains.slice(), ix = cur.indexOf(v); if (ix >= 0) cur.splice(ix, 1); else { cur.push(v); if (cur.length > 2) cur.shift(); } S.pains = cur; }); return;
      case 'want': gated(() => { const cur = wants(), ix = cur.indexOf(v); if (ix >= 0) cur.splice(ix, 1); else { cur.push(v); if (cur.length > 2) cur.shift(); } S.want = cur[0] || ''; S.want2 = cur[1] || ''; }); return;
      case 'val': gated(() => { const cur = S.values.slice(), ix = cur.indexOf(v); if (ix >= 0) cur.splice(ix, 1); else { cur.push(v); if (cur.length > 2) cur.shift(); } S.values = cur; }); return;
      case 'p2team': gated(() => { S.p2.team = v; }); return;
      case 'p2-full': p2Full(true); return;
      case 'p2-exit': p2Full(false); render(); return;
      case 'p2move': p2Move(Number(v)); return;
      case 'p2ans': gated(() => { S.p2.ans[t.dataset.q] = Number(v); }); return;
      case 'pmore': S.pmore[i] = !S.pmore[i]; save(); render(); return;
      case 'again': UI.again = true; render(); go('clear'); return;
      case 'again-go': retake(); return;
      case 'again-no': UI.again = false; try { history.replaceState(null, '', location.pathname); } catch { /* old browser */ } render(); return;
      case 'cmp': UI.cmp = !UI.cmp; render(); return;
      case 'why': UI.why = !UI.why; render(); if (UI.why) { const g = document.querySelector('.gapfeel'); if (g) g.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' }); } return;
      case 'num-chip': S.nums[t.dataset.k] = { pick: v, own: '' }; save(); render(); return;
      case 'num-unsure': S.nums[t.dataset.k] = { pick: 'unsure', own: '' }; save(); render(); return;
      case 'num-own': { const k = t.dataset.k, cur = S.nums[k] || {}; S.nums[k] = { pick: 'own', own: cur.pick === 'own' ? cur.own : '' }; save(); render(); const o = document.querySelector(`[data-own="${k}"]`); if (o) o.focus(); return; }
      case 'grp': S.group = i; save(); render(); sync(); return;
      case 'more': S.more[i] = !S.more[i]; save(); render(); return;
      case 'lean': S.lean = i; save(); render(); return;
      case 'stop': S.stop = i; save(); render(); return;
      case 'print': preparePrint(); try { window.print(); } catch { /* no print dialog here */ } return;
      case 'email': sendEmail(); return;
      case 'card-share': cardOut(true); return;
      case 'card-dl': cardOut(false); return;
      case 'plan-pdf': downloadPlan(t); return;
      case 'gp-tick': growthTick(v); return;
      // Signed in, the link downloads; signed out, the sign-in opens instead.
      case 'gp-dl': if (!signedIn()) { e.preventDefault(); menuSignin(); } return;
      case 'alloptions': { UI.opts = !UI.opts; const o = document.getElementById('s-options'); if (o) o.hidden = !UI.opts; render(); if (UI.opts && o) o.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); return; }
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
      case 'reset-open': { const el = $(v === 'gate' ? '#g-email' : '#ws-signin'); const email = el ? el.value.trim() : S.profile.email; import('/reset-box.js').then((m) => m.openReset({ email })).catch(() => askLink(email, v)); return; }
      case 'signin-ws': { const el = $('#ws-signin'); askLink(el ? el.value.trim() : '', 'ws'); return; }
      case 'signin-open': UI.signinOpen = true; render(); return;
      // From the menu when signed out (31 Oct): the same sign-in box as the plans.
      case 'signin-menu':
        if (signedIn()) return;
        UI.signinFor = 'menu'; UI.signin = ''; openGate('account'); render();
        setTimeout(() => { const f = $('#g-email'); if (f && !f.value) f.focus(); else { const p = $('#si-pw-gate'); if (p) p.focus(); } }, 0);
        return;
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
        UI.saved = false; UI.ws = false; save(); render(); toast(signedIn() ? 'Saved to your account. Your workspace is locked.' : 'Saved on this browser. Your workspace is locked.'); return;
      }
      default:
    }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.act === 'got') { S.got[Number(t.dataset.i)] = t.checked; save(); render(); sync(); return; }
    if (t.dataset.act === 'pgot') { S.pgot[Number(t.dataset.i)] = t.checked; save(); render(); sync(); return; }
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
    if (t.dataset.numr) { render(); return; }
    if (t.dataset.num) { const k = t.dataset.num, cur = S.nums[k] || { pick: '', own: '' }; S.nums[k] = { pick: t.value, own: cur.own }; save(); render(); if (t.value === 'own') { const o = document.querySelector(`[data-own="${k}"]`); if (o) o.focus(); } return; }
    // Wait for focus to settle on the next field, then redraw and keep it there.
    if (t.dataset.own || t.dataset.lab) setTimeout(render, 0);
  });
  document.addEventListener('input', (e) => {
    const t = e.target;
    // A number slider: the big value follows the thumb; the page redraws on release.
    if (t.dataset.numr) {
      const k = t.dataset.numr, ch = (E.fieldsFor(S.mode).find(([key]) => S.mode + '.' + key === k) || [])[2] || [], lab = ch[Number(t.value)] ? ch[Number(t.value)][0] : '';
      S.nums[k] = { pick: String(t.value), own: '' }; save();
      const v = document.getElementById('nv-' + k); if (v) v.textContent = lab;
      t.classList.remove('unset'); t.setAttribute('aria-valuetext', lab); t.closest('.nslide')?.classList.add('set');
      return;
    }
    if (t.dataset.lever) {
      if (labCalc().locked) { labNudge(); return; }
      S.lab[t.dataset.lever] = Number(t.value); save(); renderLab(); return;
    }
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
  // The workspace closes with Escape too (31 Oct: with the profile circle on, its round button is hidden).
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && UI.ws && !UI.gate) { UI.ws = false; render(); const b = document.querySelector('.pm-b') || $('#ws-btn'); if (b) b.focus(); } });
  // Choosing an industry hides "required" at once, before Save.
  document.addEventListener('change', (e) => { if (e.target && e.target.id === 'ws-industry') { const r = $('#ws-ind-req'); if (r) r.hidden = !!e.target.value; } });
  /* The notebook's keys, inside the questions only: 1–4 choose, Enter moves
   * on, Escape closes the Crown or the list of questions. */
  document.addEventListener('keydown', (e) => {
    if (UI.gate) return;
    const body = document.body;
    if (e.key === 'Escape') {
      if (body.classList.contains('crownopen')) { crownOpen(false); const c = document.getElementById('crownb'); if (c) c.focus(); }
      else if (body.classList.contains('nsb-open')) body.classList.remove('nsb-open');
      else if (body.classList.contains('nsq-full')) exitFull();
      else if (body.classList.contains('p2-full')) { p2Full(false); render(); }
      return;
    }
    const t = e.target;
    if (!t || !t.closest || !t.closest('#nsb-r') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/^[1-9]$/.test(e.key)) {
      const b = document.querySelectorAll('#nsb-r .nsb-o')[Number(e.key) - 1];
      if (!b) return;
      e.preventDefault();
      if (b) { b.click(); const f = document.querySelector(`[data-f="${b.dataset.f}"]`); if (f && !UI.gate) f.focus({ preventScroll: true }); }
    } else if (e.key === 'Enter' && !e.shiftKey && (t.id === 'nsb-r' || t.classList.contains('nsb-o'))) {
      // Enter on an answer chooses it and moves on; on the page, it moves on.
      e.preventDefault();
      if (t.classList.contains('nsb-o') && t.getAttribute('aria-pressed') !== 'true') t.click();
      if (!UI.gate) nsMove(1);
    }
  });

  try { if (location.hash === '#again') UI.again = true; if (location.hash === '#compare') UI.cmp = true; } catch { /* no location */ }
  render();
  if (UI.again) setTimeout(() => go('clear'), 300);
  if (UI.cmp) setTimeout(() => { const r = document.getElementById('s-reading'); if (r) r.scrollIntoView({ block: 'start' }); }, 300);
  /* From the profile menu while already on this page: only the address changes. */
  window.addEventListener('hashchange', () => {
    if (location.hash === '#again') { UI.again = true; render(); go('clear'); }
    else if (location.hash === '#compare') { UI.cmp = true; render(); const r = document.getElementById('s-reading'); if (r) r.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' }); }
  });
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

/* The launchpad banner sticks just under the top bar, never under it, and
 * shrinks to one slim line while it is stuck, so it covers as little of the
 * page as possible. */
(() => {
  try {
    const bar = document.querySelector('.topwrap') || document.querySelector('.topbar');
    const ban = document.getElementById('banner');
    if (!bar || !ban) return;
    const place = () => {
      const h = Math.max(0, Math.round(bar.getBoundingClientRect().bottom));
      ban.style.top = h + 'px';
      ban.classList.toggle('stuck', Math.round(ban.getBoundingClientRect().top) <= h + 1 && window.scrollY > 0);
    };
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    if (window.ResizeObserver) new ResizeObserver(place).observe(bar);
    place();
  } catch { /* old browser: the banner simply sticks at the top */ }
})();

/* The Blueprint button in the menu starts to glow once the founder reaches
 * the twelve weeks, and keeps glowing: there it is (31 Oct). */
(() => {
  try {
    const sec = document.getElementById('s-next'), link = document.querySelector('.incub-link');
    if (!sec || !link || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { link.classList.add('nsbeckon'); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(sec);
  } catch { /* old browser: no glow */ }
})();
