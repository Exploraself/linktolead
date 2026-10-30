/* "A look inside": the What-if lab v2 from inside the Compass (Step 04), live
 * on the sales page and started from the five numbers the visitor just slid.
 * All the arithmetic is the Compass's own (CompassEngine.month in
 * /compass/engine.js); this file only lays it out. Four levers, four answers,
 * "Give me back time / more money". The plan for the change stays locked: it
 * opens with the free account (the full form).
 *
 * Nothing here is saved or sent. sales.js loads it as the visitor scrolls
 * near, and calls update() whenever the five sliders move. */

/** The lab's month, from the five sliders: the sales needed for the pay the
 *  visitor wants, at their price, what each sale leaves, and its hours. */
export function baseFrom({ goal, price, keep, hps, avail }, rate = null, hire = null) {
  const perSale = price * keep / 100;
  const n = perSale > 0 ? Math.max(1, Math.ceil(goal / perSale)) : 0;
  if (!n || !(price > 0)) return { ready: false };
  return { ready: true, plan: true, sales: n * price, deliv: n * (price - perSale), fixed: 0, acq: 0, acqMissing: false,
    hours: n * hps, limit: avail > 0 ? avail : null, clients: n, rate, hire, est: false };
}

const PAIRS = [
  { k: 'p', name: 'Raise your price', icon: 'M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5s2 2.8 5 3.5 5 1.7 5 3.8-2.2 3.2-5 3.2-5-1.2-5-3.2', out: { k: 'cash', name: 'Pay · left for you each month', dom: 'Lead your business', col: '#91B8D5' } },
  { k: 'm', name: 'Make your message clearer', icon: 'M4 5h16v10H9l-5 4z', out: { k: 'clients', name: 'Sales · each month', dom: 'Lead the market', col: '#DDBD69' } },
  { k: 'f', name: 'Each sale takes fewer hours', icon: 'M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5l3 2M9 2h6', out: { k: 'time', name: 'Time · your hours a month', dom: 'Lead yourself', col: '#E0A282', lower: true } },
  { k: 'd', name: 'Someone else does part of the work', icon: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M13 20c0-2.4 1.8-4.4 4-4.9 2.6.3 5 2.2 5 4.9', out: { k: 'people', name: 'People · help you can afford', dom: 'Lead your people', col: '#9BC0A1' } },
];
const SIGN = { p: '+', m: '+', f: '−', d: '' };

const CSS = `.wl{background:#15213B;color:#F3EFEA;border-radius:12px;padding:clamp(18px,3vw,30px);display:flex;flex-direction:column;gap:22px}
.wl *{box-sizing:border-box}
.wl .wl-switch{display:inline-flex;flex-wrap:wrap;gap:4px;border:1px solid #3B4A6B;border-radius:999px;padding:4px;align-self:flex-start}
.wl .wl-switch button{min-height:44px;padding:0 18px;border-radius:999px;border:0;background:transparent;color:#F3EFEA;font:600 14px 'Inter',Arial,sans-serif;cursor:pointer}
.wl .wl-switch button[aria-pressed="true"]{background:#C9A24A;color:#15213B}
.wl .wl-heads,.wl .wl-pair{display:grid;grid-template-columns:minmax(0,1fr) 34px minmax(0,1fr);gap:0 12px}
.wl .wl-heads{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#A9B2C4;font-weight:700}
.wl .wl-rows{display:flex;flex-direction:column;gap:14px}
.wl .wl-card{background:rgba(243,239,234,.05);border:1px solid #3B4A6B;border-radius:9px;padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}
.wl .wl-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.wl .wl-name{font-weight:700;font-size:15px;display:inline-flex;gap:10px;align-items:center}
.wl .wl-big{font:500 24px/1.1 Newsreader,Georgia,serif;color:#E3C47E;white-space:nowrap;font-variant-numeric:tabular-nums}
.wl .wl-note{font-size:13px;color:#C4CCDA}
.wl .wl-dom{font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:700}
.wl input[type=range]{width:100%;accent-color:#C9A24A;height:28px;margin:0;cursor:pointer}
.wl .wl-arrow{display:flex;align-items:center;justify-content:center;color:#C9A24A}
.wl .wl-track{position:relative;height:10px;border-radius:5px;background:#3B4A6B;margin:18px 0 22px}
.wl .wl-fill{position:absolute;left:0;top:0;bottom:0;border-radius:5px;transition:width .6s cubic-bezier(.2,.8,.2,1),background-color .4s}
.wl .wl-today{position:absolute;top:-6px;bottom:-6px;width:2px;background:#F3EFEA;opacity:.45}
.wl .wl-today span{position:absolute;top:-17px;left:50%;transform:translateX(-50%);font-size:10px;color:#A9B2C4;white-space:nowrap}
.wl .wl-limit{position:absolute;top:-6px;bottom:-6px;border-left:2px dashed #DDBD69}
.wl .wl-limit span{position:absolute;bottom:-17px;left:50%;transform:translateX(-50%);font-size:10px;color:#DDBD69;white-space:nowrap}
.wl .wl-verdict{background:rgba(201,162,74,.14);border-radius:9px;padding:14px 16px;font-weight:700;font-size:16px;line-height:1.45}
.wl .wl-plan{border:1.5px solid #C9A24A;border-radius:10px;padding:18px;display:flex;flex-wrap:wrap;gap:14px 20px;align-items:center;background:rgba(201,162,74,.08)}
.wl .wl-plan>div{flex:1 1 280px;min-width:0;display:flex;flex-direction:column;gap:6px}
.wl .wl-fine summary{cursor:pointer;font-weight:700;color:#E3C47E;min-height:32px}
.wl .wl-fine label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700}
.wl .wl-fine input{min-height:44px;border:1px solid #3B4A6B;border-radius:5px;background:#1E2C4C;color:#F3EFEA;padding:0 12px;font:15px 'Inter',Arial,sans-serif;width:100%}
@media(max-width:760px){.wl .wl-heads{display:none}.wl .wl-pair{grid-template-columns:1fr;gap:6px}.wl .wl-arrow{transform:rotate(90deg);height:26px}.wl .wl-rows{gap:22px}}
@media(prefers-reduced-motion:reduce){.wl .wl-fill{transition:none}}`;

const n0 = (x) => Math.round(x).toLocaleString('en-US');
const signed = (x) => (x > 0 ? '+' : x < 0 ? '−' : '') + n0(Math.abs(x));

/**
 * Fill the host and return { update }. `E` is CompassEngine; `get()` returns
 * the five slider values; `openGate` opens the full account form.
 */
export function fill(host, { E, get, openGate }) {
  const L = { p: 0, m: 0, f: 0, d: 0, mode: 'time', rate: '', hire: '' };
  host.removeAttribute('data-lazy'); host.removeAttribute('aria-label'); host.style.minHeight = '';
  host.innerHTML = `<style>${CSS}</style><div class="wl">
    <div class="wl-switch" role="group" aria-label="What should the gain go to?">
      <button type="button" data-mode="time" aria-pressed="true">Give me back time</button>
      <button type="button" data-mode="money" aria-pressed="false">Give me more money</button>
    </div>
    <div>
      <div class="wl-heads" aria-hidden="true"><span>You move</span><span></span><span>Moves by itself</span></div>
      <div class="wl-rows">${PAIRS.map((x) => `<div class="wl-pair">
        <div class="wl-card">
          <div class="wl-row"><label for="wl-${x.k}" class="wl-name"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex: none"><path d="${x.icon}" fill="none" stroke="#C9A24A" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>${x.name}</label><span class="wl-big" id="wl-v-${x.k}">0%</span></div>
          <input id="wl-${x.k}" type="range" min="0" max="${E.LEVER_RANGE[x.k]}" step="5" value="0" data-wl="${x.k}">
          <span class="wl-note" id="wl-n-${x.k}"></span>
        </div>
        <div class="wl-arrow" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="wl-card" role="meter" id="wl-o-${x.out.k}" aria-labelledby="wl-on-${x.out.k}" aria-valuemin="0">
          <span class="wl-dom" style="color: ${x.out.col}">${x.out.dom}</span>
          <div class="wl-row"><span class="wl-name" id="wl-on-${x.out.k}">${x.out.name}</span><span class="wl-big" id="wl-ov-${x.out.k}">—</span></div>
          <div class="wl-track"><div class="wl-fill" id="wl-f-${x.out.k}"></div><div class="wl-today" id="wl-t-${x.out.k}"><span>today</span></div>${x.out.k === 'time' ? '<div class="wl-limit" id="wl-limit" hidden><span>your limit</span></div>' : ''}</div>
          <span class="wl-note" id="wl-on2-${x.out.k}"></span>
        </div></div>`).join('')}</div>
    </div>
    <div class="wl-verdict" id="wl-verdict" aria-live="polite"></div>
    <details class="wl-fine"><summary>Fine-tune (optional)</summary>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding-top: 12px">
        <label>Helper rate per hour<input type="text" inputmode="decimal" data-wlf="rate" placeholder="What you would pay"></label>
        <label>Monthly cost of one more person<input type="text" inputmode="decimal" data-wlf="hire" placeholder="Your estimate"></label>
      </div>
    </details>
    <div class="wl-plan">
      <div><span style="font-size: 12px; font-weight: 700; letter-spacing: .14em; color: #E3C47E">YOUR PLAN FOR THIS CHANGE</span>
        <span id="wl-plan" style="font: 500 20px/1.3 Newsreader, Georgia, serif">Move a lever, and your four-step plan for it waits here.</span>
        <span style="font-size: 13px; color: #C4CCDA">Four steps, each with what to do, about how long, and what done looks like.</span></div>
      <button type="button" class="gold-btn" data-wlgate>Opens with your free account →</button>
    </div>
  </div>`;

  const $ = (id) => host.querySelector('#' + id);
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  const num = (v) => { const x = Number(String(v).replace(/[^\d.]/g, '')); return String(v).trim() !== '' && Number.isFinite(x) && x >= 0 ? x : null; };

  function update() {
    const v = get(), b = baseFrom(v, num(L.rate), num(L.hire));
    if (!b.ready) { set('wl-verdict', 'Give the plan above a price and what each sale leaves you, and the lab runs on it.'); return; }
    const t = E.month(b, {}, L.mode), s = E.month(b, L, L.mode);
    const scale = { cash: Math.max(t.cash * 3, 1), clients: Math.max(t.clients * 3, 1), time: Math.max(t.mine, b.limit || 0) * 1.5 || 1, people: b.hire ? Math.max(4, Math.ceil(Math.max(t.cash * 3, 1) / b.hire)) : 4 };
    const vals = { cash: [s.cash, t.cash], clients: [s.clients, t.clients], time: [s.mine, t.mine], people: [s.people, t.people] };
    for (const x of PAIRS) set('wl-v-' + x.k, SIGN[x.k] + L[x.k] + '%');
    set('wl-n-p', `Each sale: ${n0(v.price)} → ${n0(v.price * (1 + L.p / 100))}`);
    set('wl-n-m', `Ready to buy: ${n0(b.clients)} → ${n0(b.clients * s.demand)} a month, same marketing spend`);
    set('wl-n-f', `Hours per sale: ${v.hps} h → ${Math.round(v.hps * (1 - L.f / 100) * 10) / 10} h`);
    set('wl-n-d', !L.d ? 'You do all the work yourself.' : b.rate !== null ? `${L.d}% of the delivery hours go to a helper at ${n0(b.rate)} an hour.` : `${L.d}% of the delivery hours go to a helper. Set the rate in Fine-tune.`);
    let improved = 0;
    for (const x of PAIRS) {
      const o = x.out, [now, was] = vals[o.k], max = scale[o.k];
      const pct = (y) => Math.max(0, Math.min(100, y / max * 100));
      const good = now !== null && was !== null && (o.lower ? now < was - 0.5 : now > was + (o.k === 'cash' ? 1 : 0.05));
      const bad = now !== null && was !== null && (o.lower ? now > was + 0.5 : now < was - (o.k === 'cash' ? 1 : 0.05));
      if (good) improved++;
      const f = $('wl-f-' + o.k); f.style.width = (now === null ? 0 : pct(now)) + '%'; f.style.background = good ? '#9BC0A1' : bad ? '#E0A282' : '#8A93A8';
      const td = $('wl-t-' + o.k); td.hidden = was === null; if (was !== null) td.style.left = pct(was) + '%';
      const card = $('wl-o-' + o.k); card.setAttribute('aria-valuemax', String(Math.round(max))); if (now !== null) card.setAttribute('aria-valuenow', String(Math.round(now)));
    }
    const lim = $('wl-limit'); if (lim) { lim.hidden = !b.limit; if (b.limit) lim.style.left = Math.min(100, b.limit / scale.time * 100) + '%'; }
    set('wl-ov-cash', s.cash === null ? '—' : n0(s.cash)); set('wl-ov-clients', n0(s.clients)); set('wl-ov-time', n0(s.mine) + ' h');
    set('wl-ov-people', s.people === null ? '—' : (Math.round(s.people * 10) / 10).toFixed(1));
    const dc = s.cash === null ? null : s.cash - t.cash;
    set('wl-on2-cash', s.cash === null ? 'Set a helper rate in Fine-tune to see what the help costs.' : Math.abs(dc) < 1 ? 'The pay you asked for, as today.' : `${signed(dc)} a month compared with today.`);
    set('wl-on2-clients', s.clients < s.clientsWanted - 0.05 ? `You serve ${n0(s.clients)}. ${n0(s.clientsWanted)} want you, so you can choose the best fit.` : s.clients > t.clients + 0.05 ? `+${n0(s.clients - t.clients)} a month compared with today.` : 'Same as today.');
    const back = t.mine - s.mine;
    set('wl-on2-time', b.limit ? (s.mine > b.limit ? `${n0(s.mine - b.limit)} hours beyond the ${n0(b.limit)} you want.` : `Within the ${n0(b.limit)} hours you want.${back > 0.5 ? ` ${n0(back)} hours a month back.` : ''}`) : `${back > 0.5 ? n0(back) + ' hours a month back.' : 'Same hours as today.'}`);
    set('wl-on2-people', s.people === null ? (b.hire === null ? 'Set the monthly cost of one more person in Fine-tune to see this.' : 'Set a helper rate in Fine-tune first.') : s.people >= 0.1 ? `About ${(Math.round(s.people * 10) / 10).toFixed(1)} people at ${n0(b.hire)} a month each.` : 'No room to pay for help yet.');
    let verdict;
    if (!L.p && !L.m && !L.f && !L.d) verdict = `Today: ${n0(t.mine)} hours a month${b.limit ? (t.mine > b.limit ? `, beyond the ${n0(b.limit)} you want` : `, within the ${n0(b.limit)} you want`) : ''}. Move one lever and watch the four answer.`;
    else if (b.limit && s.mine > b.limit) verdict = 'Still beyond your hours. Try a fairer price, fewer hours for each sale, or hand part of the work to someone else.';
    else if (improved >= 3) verdict = 'This is leadership: one change, and most of the four answer at once.';
    else if (L.mode === 'time' && s.mine < t.mine - 0.5 && dc !== null && dc > -1) verdict = 'Same pay, fewer hours. Your price decides how much of your life the business needs.';
    else if (L.mode === 'money' && dc !== null && dc > 1) verdict = 'More money for the same work. Now ask what that money is for.';
    else verdict = 'Good. Now try a second lever and see which answer moves next.';
    set('wl-verdict', verdict);
    const dom = E.strongestLever(L.p, L.m, L.f, L.d);
    set('wl-plan', dom < 0 ? 'Move a lever, and your four-step plan for it waits here.' : `${E.LEVERS[dom].name}: step 1, ${E.LEVERS[dom].steps[0].toLowerCase()}, and three more.`);
  }

  host.addEventListener('input', (e) => {
    const k = e.target.dataset.wl, f = e.target.dataset.wlf;
    if (k) { L[k] = Number(e.target.value); update(); }
    if (f) { L[f] = e.target.value.slice(0, 12); update(); }
  });
  host.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    L.mode = b.dataset.mode; host.querySelectorAll('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); update();
  }));
  host.querySelector('[data-wlgate]').addEventListener('click', openGate);
  update();
  return { update };
}
