/* The Leadership Compass sales page: three now-and-want sliders, the stage
 * finder, the life-first calculator and the name + email step.
 *
 * Every number shown is arithmetic on what the visitor slid; nothing is a
 * benchmark. The name, email and stage are kept in this browser and picked up
 * by the Compass (same site), so they are never asked twice. "Open my Compass"
 * also makes the free account (/api/signup, through /account.js, the same
 * token the Compass uses). If that cannot be reached, the Compass makes it
 * when it opens. Nothing else is sent from this page. */
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
      o.cutTxt = '—'; o.cutColor = '#C9A24A';
      if (cNow === 0) Object.assign(o, { cutCaption: 'time per client starts with your first client', verdictTitle: 'Start with your first client.', verdictText: 'Before time per client means anything, one person has to pay you. The Compass shows what to work on first at your stage.' });
      else if (hNow === 0) Object.assign(o, { cutCaption: 'add the hours you work today', verdictTitle: 'Count your hours first.', verdictText: 'Slide in the hours you really work in a week. Time per client is the number that says whether growth will cost you your life.' });
      else Object.assign(o, { cutCaption: 'add the clients you want', verdictTitle: 'Decide who you want to serve.', verdictText: 'Growth starts with a number of clients you actually want. Slide it in, and the road shows what it asks of you.' });
      return o;
    }
    const cut = Math.round((1 - (hWant / cWant) / (hNow / cNow)) * 100);
    if (cut >= 50) Object.assign(o, { cutTxt: cut + '%', cutColor: '#FF8A6B', cutCaption: 'less of your time per client',
      verdictTitle: 'This is not a sales problem. It is a leadership one.',
      verdictText: 'More clients with less of you only works when the business stops running through you: a clear offer, simple systems, people you trust with real decisions. That is the road the Compass maps, step by step, for your stage.' });
    else if (cut > 0) Object.assign(o, { cutTxt: cut + '%', cutColor: '#C9A24A', cutCaption: 'less of your time per client',
      verdictTitle: 'Doable — if you change how the work gets done, not how hard you work.',
      verdictText: 'Working harder will not close this gap. Better systems, a sharper offer and one or two decisions given away will. The Compass shows you which ones come first.' });
    else Object.assign(o, { cutTxt: 'On track', cutColor: '#7FD1A8', cutCaption: 'your time per client can stay the same',
      verdictTitle: 'The road is reaching the clients, not surviving them.',
      verdictText: 'Your hours can carry this. The question moves to the market: who exactly you serve, and how they find you. The Compass helps you get that clear.' });
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
    const salesFit = hps > 0 ? Math.floor(avail / hps) : 0;
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
    const look = { red: ['#C8432B', '#FFFFFF', 'IN THE RED'], tight: ['#C9A24A', '#15213B', 'TIGHT'], fits: ['#2F7D5B', '#FFFFFF', 'IT FITS'] }[o.level];
    out('fbTitle', o.title); out('fbText', o.text); out('fbAsk', o.ask);
    const st = $('#status'); st.textContent = look[2]; st.style.background = look[0]; st.style.color = look[1];
    $('#plan-card').style.borderTopColor = look[0];
    const bar = $('#needbar'); bar.style.width = (Number.isFinite(o.ratio) ? Math.min(100, Math.round(o.ratio * 100)) : 100) + '%'; bar.style.background = look[0];
    out('priceFit', o.priceFit === null ? '—' : money(o.priceFit));
    out('hpsFit', o.hpsFit === null ? '—' : o.hpsFit);
    $('#levers').hidden = !(o.ratio > 0.85);
  }
  const redraw = (k) => (['goal', 'price', 'keep', 'hps', 'avail'].includes(k) ? plan() : dream());

  document.querySelectorAll('[data-in]').forEach((el) => el.addEventListener('input', () => {
    const k = el.dataset.in;
    val[k] = fromSlider(el);
    el.setAttribute('aria-valuetext', String(val[k]));
    redraw(k);
  }));

  /* Tap a number to type it exactly. The slider jumps to the nearest place;
   * the maths keeps the typed value, even above the slider's top. */
  function edit(span) {
    const k = span.dataset.edit, slider = document.querySelector(`[data-in="${k}"]`);
    if (!slider || span.querySelector('input')) return;
    const [min, max] = RANGES[k] || [0, Infinity];
    const box = document.createElement('input');
    box.type = 'text'; box.inputMode = 'numeric'; box.className = 'numbox'; box.value = String(val[k]);
    box.setAttribute('aria-label', (slider.labels && slider.labels[0] ? slider.labels[0].textContent : k) + ', exact number');
    const keepText = span.textContent; span.textContent = ''; span.appendChild(box); box.focus(); box.select();
    let done = false;
    const commit = (save) => {
      if (done) return; done = true;
      const typed = Number(String(box.value).replace(/[^\d.]/g, ''));
      span.textContent = keepText;
      if (save && box.value.trim() !== '' && Number.isFinite(typed)) {
        val[k] = Math.max(min, PERCENT.has(k) ? Math.min(100, typed) : typed);
        slider.value = String(LADDER[k] ? SalesMath.posOf(LADDER[k], val[k]) : Math.min(max, val[k]));
        slider.setAttribute('aria-valuetext', String(val[k]));
      }
      redraw(k);
      span.focus();
    };
    box.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(true); } if (e.key === 'Escape') { e.preventDefault(); commit(false); } });
    box.addEventListener('blur', () => commit(true));
  }
  document.querySelectorAll('[data-edit]').forEach((span) => {
    span.setAttribute('role', 'button'); span.setAttribute('tabindex', '0'); span.title = 'Tap to type an exact number';
    span.addEventListener('click', () => edit(span));
    span.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('input')) { e.preventDefault(); edit(span); } });
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
      return `<div role="listitem" style="background: ${here ? '#C9A24A' : done ? '#15213B' : '#F3EFEA'}; color: ${done ? '#F3EFEA' : '#15213B'}; border-radius: 6px; padding: 20px; display: flex; flex-direction: column; gap: 8px; transition: background .3s ease; border: 2px solid ${here ? '#15213B' : 'transparent'}">
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

  /* The look inside: pause and play. */
  const play = $('#play');
  play.addEventListener('click', () => {
    const paused = play.getAttribute('aria-pressed') !== 'true';
    play.setAttribute('aria-pressed', String(paused));
    play.textContent = paused ? '▶ Play' : '❚❚ Pause';
    $('#vid').style.setProperty('--ps', paused ? 'paused' : 'running');
  });

  /* Name + email, kept in this browser for the Compass to pick up. */
  const KEY = 'exploraself-profile';
  const gate = $('#gate');
  let opener = null;
  const known = () => { try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); return p && p.email ? p : null; } catch { return null; } };
  function showJoined(p) {
    $('#gate-form').hidden = true;
    const j = $('#joined'); j.hidden = false; j.style.display = 'flex';
    $('#joined-line').textContent = (p && p.stage ? `We carried your stage over: ${STAGES.find((s) => s.id === p.stage).name}. ` : '') + 'Start with your road, then the eight questions.';
    $('#joined-h').focus();
  }
  function openGate(e) {
    opener = e && e.currentTarget;
    gate.hidden = false;
    const p = known();
    if (p) { if (stage !== null) { p.stage = STAGES[stage].id; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ } } showJoined(p); }
    else $('#j-first').focus();
  }
  function closeGate() { gate.hidden = true; if (opener) opener.focus(); }
  document.querySelectorAll('[data-gate]').forEach((b) => b.addEventListener('click', openGate));
  gate.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeGate));
  gate.addEventListener('click', (e) => { if (e.target === gate) closeGate(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !gate.hidden) closeGate(); });
  $('#gate-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const first = $('#j-first').value.trim(), last = $('#j-last').value.trim(), email = $('#j-email').value.trim();
    const err = (m) => { $('#gate-err').textContent = m; };
    if (!first) return err('Your first name, so the Compass is yours.');
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return err('That email does not look complete.');
    const p = { first, last, email, consent: true, stage: stage === null ? '' : STAGES[stage].id };
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode: the Compass will simply ask again */ }
    showJoined(p);
    // The free account, quietly. An address that already has one is left for
    // the Compass, which offers a sign-in link there.
    import('/account.js').then((A) => (A.joined() ? null : A.signup({ first, last, email, consent: true, source: 'sales-page', stage: p.stage })))
      .catch(() => { /* the Compass tries again when it opens */ });
  });

  dream(); plan(); finder();
})();
