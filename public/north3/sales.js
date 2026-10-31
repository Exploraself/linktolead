/* The Leader’s North Star sales page: three now-and-want sliders, the stage
 * finder, the life-first calculator and the account box.
 *
 * Every number shown is arithmetic on what the visitor slid; nothing is a
 * benchmark. The name, email and stage are kept in this browser and picked up
 * by the North Star (same site), so they are never asked twice. The account box
 * makes the free account (/api/signup, through /account.js, the same token the
 * North Star and /start use) and opens the founder's Base Camp. Nothing else is
 * sent from this page. */
'use strict';
/* The arithmetic and the sentences, with no page attached, so the tests can
 * run them at the edges (0 clients, 10,000 clients, 0 hours). */
const SalesMath = (() => {
  /* Big ranges move in growing steps, so a phone can still hit small numbers:
   * by 1 up to 10, by 5 up to 100, by 50 up to 1,000, by 500 up to 10,000,
   * by 5,000 up to 100,000, by 50,000 up to 1,000,000. A slider's position is
   * an index into this ladder of values. */
  const BANDS = [[10, 1], [100, 5], [1000, 50], [10000, 500], [100000, 5000], [Infinity, 50000]];
  function ladder(min, max) {
    const out = [];
    for (let v = min; v < max;) { out.push(v); v += BANDS.find(([top]) => v < top)[1]; }
    out.push(max);
    return out;
  }
  /** The position whose value is nearest to x. Above the top is the top. */
  function posOf(values, x) {
    if (!(x > values[0])) return 0;
    if (x >= values[values.length - 1]) return values.length - 1;
    let best = 0;
    for (let i = 1; i < values.length; i++) if (Math.abs(values[i] - x) < Math.abs(values[best] - x)) best = i;
    return best;
  }
  const n = (x) => Math.round(x).toLocaleString('en-US');

  /* Where you are, where you want to be. */
  function dream({ hNow, hWant, cNow, cWant, rNow, rWant }) {
    const o = {};
    const back = hNow - hWant;
    o.timeMsg = back > 0 ? `That is ${n(back * 52)} hours a year back in your life. What would you do with them?`
      : back === 0 ? 'Same hours. Fine — then the question is what those hours are for.'
      : `You would work ${n(-back)} more hours a week. Make sure they buy something you actually want.`;
    if (cNow === 0) o.clientMsg = cWant > 0 ? 'Start with your first client. Each one teaches you what the next one needs.' : 'No clients yet, and none planned. Then the first question is who the business is for.';
    else if (cWant > cNow) { const mult = Math.round((cWant / cNow) * 10) / 10; o.clientMsg = `${mult.toLocaleString('en-US')}× the clients. Done the way you work today, that is ${mult.toLocaleString('en-US')}× the hours.`; }
    else if (cWant === cNow) o.clientMsg = 'Same number of clients. Then growth means deeper work or a better price.';
    else o.clientMsg = cWant === 0 ? 'No clients at all? Then the business needs a different shape. Choose it on purpose.' : 'Fewer clients — higher value each? That is a real strategy. Choose it on purpose.';
    const gap = rWant - rNow;
    o.scaleMsg = gap > 0 ? `You would hand over ${gap}% of what you carry today. Someone has to be ready to carry it.`
      : gap === 0 ? 'You plan to stay at the centre. That is allowed — just choose it.'
      : 'You want to hold more yourself. Ask why before you take it back.';
    // Time per client, today and wanted. Without a client or an hour there is
    // nothing to divide, and the page says what to do instead.
    if (cNow === 0 || hNow === 0 || cWant === 0) {
      o.cutTxt = '—'; o.cutColor = '#6F93B8';
      if (cNow === 0) Object.assign(o, { cutCaption: 'time per client starts with your first client', verdictTitle: 'Start with your first client.', verdictText: 'Before time per client means anything, one person has to pay you. The North Star shows what to work on first at your stage.' });
      else if (hNow === 0) Object.assign(o, { cutCaption: 'add the hours you work today', verdictTitle: 'Count your hours first.', verdictText: 'Slide in the hours you really work in a week. Time per client is the number that says whether growth will cost you your life.' });
      else Object.assign(o, { cutCaption: 'add the clients you want', verdictTitle: 'Decide who you want to serve.', verdictText: 'Growth starts with a number of clients you actually want. Slide it in, and the road shows what it asks of you.' });
      return o;
    }
    const cut = Math.round((1 - (hWant / cWant) / (hNow / cNow)) * 100);
    if (cut >= 50) Object.assign(o, { cutTxt: cut + '%', cutColor: '#FF8A6B', cutCaption: 'less of your time per client',
      verdictTitle: 'This is not a sales problem. It is a leadership one.',
      verdictText: 'More clients with less of you only works when the business stops running through you: a clear offer, simple systems, people you trust with real decisions. That is the road the North Star maps, step by step, for your stage.' });
    else if (cut > 0) Object.assign(o, { cutTxt: cut + '%', cutColor: '#6F93B8', cutCaption: 'less of your time per client',
      verdictTitle: 'Doable — if you change how the work gets done, not how hard you work.',
      verdictText: 'Working harder will not close this gap. Better systems, a sharper offer and one or two decisions given away will. The North Star shows you which ones come first.' });
    else Object.assign(o, { cutTxt: 'On track', cutColor: '#7FD1A8', cutCaption: 'your time per client can stay the same',
      verdictTitle: 'The road is reaching the clients, not surviving them.',
      verdictText: 'Your hours can carry this. The question moves to the market: who exactly you serve, and how they find you. The North Star helps you get that clear.' });
    return o;
  }

  /* The life-first calculator: start with what you want to take home. */
  function plan({ goal, price, keep, hps, avail }) {
    const perSale = price * keep / 100;
    const sales = perSale > 0 ? Math.max(1, Math.ceil(goal / perSale)) : 0, need = sales * hps;
    const ratio = avail > 0 ? need / avail : need > 0 ? Infinity : 0;
    const o = { perSale, sales, need };
    if (!(perSale > 0)) Object.assign(o, { level: 'tight', title: 'Each sale needs to leave you something.', text: 'Set a price and what you keep after costs, and the plan appears.', ask: 'What does one sale really leave you?' });
    else if (!(avail > 0)) Object.assign(o, { level: 'red', title: 'This plan needs hours you have not given it.', text: `It needs ${n(need)} hours a month, and you want to work none. Someone else would have to do all of it.`, ask: 'Who would do the work, and what would you pay them?' });
    else if (ratio > 1) Object.assign(o, { level: 'red', title: 'This plan borrows from your life.', text: `It needs ${n(need)} hours a month. You want to work ${n(avail)}. The missing ${n(need - avail)} hours come from somewhere: evenings, rest, family.`, ask: 'What would you stop, change or delegate before selling more?' });
    else if (ratio > 0.85) Object.assign(o, { level: 'tight', title: 'It fits — just. No room for a bad week.', text: `The plan uses ${n(need)} of your ${n(avail)} hours. One sick day, one difficult client, and it spills into your life.`, ask: 'What happens to this plan when one week goes wrong?' });
    else Object.assign(o, { level: 'fits', title: 'It fits, with room to breathe.', text: `The plan needs ${n(need)} of the ${n(avail)} hours you want to work. Now the real question is not money.`, ask: 'Do you know what enough looks like — and why you want the next goal?' });
    o.ratio = ratio;
    // The badge. Over the hours you want is said as just that.
    o.badge = o.level === 'red' ? 'OVER YOUR HOURS' : o.level === 'tight' ? 'TIGHT' : 'IT FITS';
    // The bar: the hours you want are the whole track; anything over shows
    // beyond it, as "<N> h over".
    o.over = Math.max(0, need - avail);
    const salesFit = hps > 0 ? Math.floor(avail / hps) : 0;
    // Lever 1: what the plan pays if you keep to your hours. Whole sales only.
    o.paysAtHours = salesFit * perSale;
    o.priceFit = salesFit >= 1 && keep > 0 ? Math.ceil(goal / (salesFit * keep / 100) / 10) * 10 : null;
    o.hpsFit = sales > 0 ? Math.max(0.5, Math.floor((avail / sales) * 2) / 2) : null;
    return o;
  }
  return { ladder, posOf, dream, plan };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = SalesMath;

(function () {
  if (typeof document === 'undefined') return;
  const $ = (s) => document.querySelector(s);
  const out = (k, v) => document.querySelectorAll(`[data-out="${k}"]`).forEach((el) => { el.textContent = v; });
  const money = (x) => Math.round(x).toLocaleString('en-US');
  /* Every slider: its range, and a ladder when the range is big. A typed value
   * above the top is kept for the maths; the slider waits at its top. */
  const RANGES = {
    hNow: [0, 100], hWant: [0, 100], cNow: [0, 10000, true], cWant: [0, 10000, true], rNow: [0, 100], rWant: [0, 100],
    goal: [1000, 1000000, true], price: [1, 100000, true], keep: [10, 100], hps: [1, 200, true], avail: [20, 260],
  };
  const PERCENT = new Set(['rNow', 'rWant', 'keep']);
  const val = {}, LADDER = {};
  let labApi = null;
  document.querySelectorAll('[data-in]').forEach((el) => {
    const k = el.dataset.in, [min, max, stepped] = RANGES[k] || [Number(el.min), Number(el.max)], start = Number(el.value);
    if (stepped) {
      LADDER[k] = SalesMath.ladder(min, max);
      el.min = '0'; el.max = String(LADDER[k].length - 1); el.step = '1';
      el.value = String(SalesMath.posOf(LADDER[k], start));
    } else { el.min = String(min); el.max = String(max); }
    el.setAttribute('aria-valuetext', String(start));
    val[k] = start;
  });
  const fromSlider = (el) => (LADDER[el.dataset.in] ? LADDER[el.dataset.in][Number(el.value)] : Number(el.value));

  function dream() {
    const v = val, o = SalesMath.dream(v);
    out('hNow', v.hNow); out('hWant', v.hWant); out('cNow', money(v.cNow)); out('cWant', money(v.cWant)); out('rNow', v.rNow); out('rWant', v.rWant);
    for (const k of ['timeMsg', 'clientMsg', 'scaleMsg', 'cutTxt', 'cutCaption', 'verdictTitle', 'verdictText']) out(k, o[k]);
    const c = $('[data-out="cutTxt"]'); if (c) c.style.color = o.cutColor;
  }
  function plan() {
    const v = val, o = SalesMath.plan(v);
    out('goalTxt', money(v.goal)); out('priceTxt', money(v.price)); out('keep', v.keep); out('hps', v.hps); out('avail', money(v.avail));
    out('sales', money(o.sales)); out('perSaleTxt', money(o.perSale)); out('need', money(o.need));
    const look = { red: ['#C8432B', '#FFFFFF'], tight: ['#6F93B8', '#121C2D'], fits: ['#2F7D5B', '#FFFFFF'] }[o.level];
    out('fbTitle', o.title); out('fbText', o.text); out('fbAsk', o.ask);
    const st = $('#status'); st.textContent = o.badge; st.style.background = look[0]; st.style.color = look[1];
    $('#plan-card').style.borderTopColor = look[0];
    // The wanted hours are the whole track; what the plan needs beyond them
    // sits past its end, in red.
    const total = Math.max(o.need, v.avail) || 1;
    $('#hbar-track').style.width = (v.avail / total * 100) + '%';
    const bar = $('#needbar'); bar.style.width = (v.avail > 0 ? Math.min(100, o.need / v.avail * 100) : 0) + '%'; bar.style.background = o.over > 0 ? '#6F93B8' : look[0];
    const ov = $('#hbar-over'); ov.style.width = (o.over / total * 100) + '%'; ov.hidden = !(o.over > 0);
    out('overTxt', o.over > 0 ? `${money(o.over)} h over` : '');
    out('paysAtHours', money(o.paysAtHours));
    out('priceFit', o.priceFit === null ? '—' : money(o.priceFit));
    out('hpsFit', o.hpsFit === null ? '—' : o.hpsFit);
    $('#levers').hidden = !(o.ratio > 0.85);
    if (labApi) labApi.update();
  }
  const redraw = (k) => (['goal', 'price', 'keep', 'hps', 'avail'].includes(k) ? plan() : dream());

  document.querySelectorAll('[data-in]').forEach((el) => el.addEventListener('input', () => {
    const k = el.dataset.in;
    val[k] = fromSlider(el);
    el.setAttribute('aria-valuetext', String(val[k]));
    redraw(k);
  }));

  /* Tap a number to type it exactly (edit.js, loaded on the first tap). */
  const ctx = { val, RANGES, LADDER, PERCENT, posOf: SalesMath.posOf, redraw: (k) => redraw(k) };
  document.querySelectorAll('[data-edit]').forEach((span) => {
    span.setAttribute('role', 'button'); span.setAttribute('tabindex', '0'); span.title = 'Tap to type an exact number';
    const open = () => import('/north3/edit.js').then((m) => m.edit(span, ctx)).catch(() => {});
    span.addEventListener('click', open);
    span.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('input')) { e.preventDefault(); open(); } });
  });

  /* The stage finder: three yes / not-yet questions. */
  const STAGES = [
    { id: 'building', name: 'Building', focus: 'Find a reason and a useful promise.', next: 'Know why the business exists, name ten customers who paid you, and know what each sale really leaves you.' },
    { id: 'growing', name: 'Growing', focus: 'Give the work a human shape.', next: 'Protect your week, write down what “finished” means, and make the main work carry on without you for a while.' },
    { id: 'scaling', name: 'Scaling', focus: 'Build capacity you can trust.', next: 'Give real decisions away, read your numbers weekly, and help others learn to lead without you.' },
    { id: 'leading', name: 'Leading', focus: 'Steward what you have built.', next: 'Choose what deserves to grow and what should stay enough — and grow the people who will carry it on.' },
  ];
  const a = { 1: null, 2: null, 3: null };
  let stage = null;
  function finder() {
    stage = a[1] === 'no' ? 0 : a[1] === 'yes' && a[2] === 'no' ? 1 : a[1] === 'yes' && a[2] === 'yes' && a[3] === 'no' ? 2 : a[1] === 'yes' && a[2] === 'yes' && a[3] === 'yes' ? 3 : null;
    $('#sf2').hidden = a[1] !== 'yes'; $('#sf3').hidden = !(a[1] === 'yes' && a[2] === 'yes');
    document.querySelectorAll('.yn').forEach((b) => b.setAttribute('aria-pressed', String(a[b.dataset.q] === b.dataset.v)));
    $('#stages').innerHTML = STAGES.map((s, i) => {
      const here = stage === i, done = stage !== null && i < stage;
      return `<div role="listitem" style="background: ${here ? '#6F93B8' : done ? '#121C2D' : '#EEF2F7'}; color: ${done ? '#EEF2F7' : '#121C2D'}; border-radius: 6px; padding: 20px; display: flex; flex-direction: column; gap: 8px; transition: background .3s ease; border: 2px solid ${here ? '#121C2D' : 'transparent'}">
        <div style="display: flex; justify-content: space-between; align-items: center"><span style="font-weight: 900; font-size: 13px; letter-spacing: .12em">0${i + 1}</span><span style="font-weight: 900; font-size: 11px; letter-spacing: .14em">${here ? 'YOU ARE HERE' : done ? 'BEHIND YOU' : ''}</span></div>
        <span style="font-weight: 900; font-size: 22px; text-transform: uppercase">${s.name}</span>
        <span class="serif" style="font-size: 15px; line-height: 1.4">${s.focus}</span></div>`;
    }).join('');
    $('#stage-on').hidden = stage === null; $('#stage-off').hidden = stage !== null;
    if (stage !== null) { out('stageName', STAGES[stage].name); out('stageFocus', STAGES[stage].focus); out('stageNext', STAGES[stage].next); }
  }
  document.querySelectorAll('.yn').forEach((b) => b.addEventListener('click', () => {
    const q = Number(b.dataset.q);
    a[q] = b.dataset.v;
    for (let k = q + 1; k <= 3; k++) if (b.dataset.v === 'no') a[k] = null;
    finder();
  }));

  /* A win has four sides: the circles drift in once when the section is
   * seen, and each domain line lights its circle and changes the caption. */
  const W4 = { self: 'You, still standing at the end of it.', people: 'The people around you, better for it.', business: 'A business that pays its way.', market: 'Customers who would miss you.' };
  const w4box = $('.win4-box'), w4list = $('#win4-list');
  if (w4box && w4list) {
    const light = (d) => {
      if (d) w4box.dataset.active = d; else delete w4box.dataset.active;
      w4list.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.dom === d)));
      $('#win4-cap').textContent = d ? W4[d] : 'A win is where all four meet.';
    };
    w4list.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('mouseenter', () => light(b.dataset.dom));
      b.addEventListener('focus', () => light(b.dataset.dom));
      b.addEventListener('click', () => light(w4box.dataset.active === b.dataset.dom ? null : b.dataset.dom));
    });
    w4list.addEventListener('mouseleave', () => { if (!w4list.contains(document.activeElement)) light(null); });
    w4list.addEventListener('focusout', (e) => { if (!w4list.contains(e.relatedTarget)) light(null); });
    w4box.classList.add('wait');
    try {
      const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); w4box.classList.remove('wait'); w4box.classList.add('go'); } }, { threshold: 0.25 });
      io.observe(w4box);
    } catch { w4box.classList.remove('wait'); w4box.classList.add('go'); }
  }

  /* "A look inside": the North Star's What-if lab (lab.js, on the North Star's own
   * engine.js), live on the five numbers above. Loads as the visitor scrolls
   * near it, and follows the sliders from then on. */
  const vid = $('#vid');
  const engine = () => (window.CompassEngine ? Promise.resolve(window.CompassEngine) : new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = '/northstar/engine.js'; s.onload = () => ok(window.CompassEngine); s.onerror = no; document.head.appendChild(s);
  }));
  const fillVid = () => Promise.all([engine(), import('/north3/lab.js')])
    .then(([E, m]) => { labApi = m.fill(vid, { E, get: () => ({ ...val }), openGate }); }).catch(() => {});
  try {
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); fillVid(); } }, { rootMargin: '900px 0px' });
    io.observe(vid);
  } catch { fillVid(); }

  /* "What opens with your free account" (kit.js) loads the same way, with the
   * library's titles and page counts (/content.js) and the live number of plan
   * steps. Its buttons open the same account box. */
  const kit = $('#kit-body');
  const kitCss = () => new Promise((ok) => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/north3/kit.css';
    l.onload = l.onerror = ok; document.head.appendChild(l);
  });
  const fillKit = () => Promise.all([
    import('/north3/kit.js'), import('/content.js'), kitCss(),
    fetch('/api/plans?total').then((r) => r.json()).then((j) => j.total).catch(() => null),
  ]).then(([m, c, , steps]) => { m.fill(kit, c.LIBRARY, steps); kit.querySelectorAll('[data-gate]').forEach((b) => b.addEventListener('click', openGate)); }).catch(() => {});
  if (kit) {
    try {
      const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); fillKit(); } }, { rootMargin: '900px 0px' });
      io.observe(kit);
    } catch { fillKit(); }
  }

  /* The account box. Its markup and code (account-box.js) load the first time
   * it opens, so the page itself stays light. /north3/#join opens it
   * (where /start sends visitors without an account): they came for the
   * Blueprint, so they land on Your Base Camp. A founder who taps a button
   * on this page came for the North Star, and lands on it (31 Oct). */
  const gate = $('#gate');
  import('/forms.js').then((m) => m.rememberUtm()).catch(() => {});
  let box = null;
  const loadBox = () => box || (box = import('/account-box.js').catch(() => { box = null; }));
  function openGate(e) {
    const opener = e && e.currentTarget;
    gate.hidden = false;
    loadBox().then((m) => m && m.open({ gate, opener, stage: stage === null ? null : STAGES[stage], variant: 'full', landing: 'road2', next: opener ? '/northstar/' : '' }));
  }
  document.querySelectorAll('[data-gate]').forEach((b) => b.addEventListener('click', openGate));
  if (location.hash === '#join') {
    let has = false; try { has = !!localStorage.getItem('ftb-token'); } catch { /* private mode */ }
    if (has) location.replace('/ground-plan/#home'); else openGate();
  }

  /* Animations rest when their section is off screen or the tab is hidden. */
  try {
    const parts = [...document.querySelectorAll('.fc > section, .fc > header, .fc > div')], seen = new Map();
    const io = new IntersectionObserver((es) => es.forEach((e) => { seen.set(e.target, e.isIntersecting); e.target.toggleAttribute('data-off', !e.isIntersecting || document.hidden); }));
    parts.forEach((el) => io.observe(el));
    document.addEventListener('visibilitychange', () => parts.forEach((el) => el.toggleAttribute('data-off', document.hidden || seen.get(el) === false)));
  } catch { /* old browser: everything simply keeps running */ }

  dream(); plan(); finder();
})();
