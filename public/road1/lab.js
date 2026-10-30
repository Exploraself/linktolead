/* The What-if Lab v1 on "/", just before the close. It starts on an
 * example founder, labelled as one, and the visitor can type their own price,
 * clients and hours. Four levers on the left; cash, clients, time and the help
 * they can afford answer on the right, one row each, so on a phone each lever
 * sits right above the answer it moves most.
 *
 * All the arithmetic is the North Star's own (CompassEngine.month in
 * /northstar/engine.js); this file only lays it out. Nothing typed here is saved
 * or sent. "Create my free account →" opens the FULL account form (page.js). */

/** The example founder: 20 clients a month at $250, 8 hours each. Delivery
 *  takes a fifth of each price; running costs, the hours they want to work and
 *  the two help figures can be changed under "Fine-tune". */
export const EXAMPLE = { price: 250, clients: 20, hours: 8, limit: 120, run: 1500, rate: 25, hire: 2000 };
export const DELIVERY = 0.2;

/** The engine's month from what the visitor typed. Not ready without a price,
 *  a client and the hours each one takes. */
export function baseOf(v) {
  const { price, clients, hours } = v;
  if (!(price > 0) || !(clients > 0) || !(hours > 0)) return { ready: false };
  return { ready: true, plan: true, sales: clients * price, deliv: clients * price * DELIVERY, fixed: v.run || 0, acq: 0, acqMissing: false,
    hours: clients * hours, limit: v.limit > 0 ? v.limit : null, clients, rate: v.rate, hire: v.hire > 0 ? v.hire : null, est: false };
}

const PAIRS = [
  { k: 'p', name: 'Raise your price', icon: 'M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5s2 2.8 5 3.5 5 1.7 5 3.8-2.2 3.2-5 3.2-5-1.2-5-3.2', out: { k: 'cash', name: 'Cash · left each month', dom: 'Lead your business', col: '#8FB0C9' } },
  { k: 'm', name: 'Make your message clearer', icon: 'M4 5h16v10H9l-5 4z', out: { k: 'clients', name: 'Clients · each month', dom: 'Lead the market', col: '#DDBD69' } },
  { k: 'f', name: 'Each client takes fewer hours', icon: 'M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5l3 2M9 2h6', out: { k: 'time', name: 'Time · your hours a month', dom: 'Lead yourself', col: '#E0A282', lower: true } },
  { k: 'd', name: 'Someone else does part of the work', icon: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M13 20c0-2.4 1.8-4.4 4-4.9 2.6.3 5 2.2 5 4.9', out: { k: 'people', name: 'People · help you can afford', dom: 'Lead your people', col: '#9BC0A1' } },
];
const SIGN = { p: '+', m: '+', f: '−', d: '' };

const CSS = `.hl{--hl-ink:#F7F2E7;--hl-muted:#C4B69D;--hl-line:#3A2F20;--hl-gold:#B4975F;--hl-gold-hi:#D6BF8F;color:var(--hl-ink);display:flex;flex-direction:column;gap:22px;margin-top:26px}
.hl *{box-sizing:border-box}
.hl .hl-ex{border:1px dashed #594A32;border-radius:9px;padding:14px 16px;display:flex;flex-direction:column;gap:12px}
.hl .hl-tag{align-self:flex-start;font-size:11px;letter-spacing:.12em;font-weight:700;color:#1C1309;background:var(--hl-gold-hi);border-radius:4px;padding:4px 8px;text-transform:uppercase}
.hl .hl-own{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.hl label.hl-in{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700;color:var(--hl-ink)}
.hl .hl-in input{min-height:46px;border:1px solid #594A32;border-radius:5px;background:#231D15;color:var(--hl-ink);padding:0 12px;font:16px var(--body);width:100%}
.hl .hl-small{font-size:13px;color:var(--hl-muted);margin:0}
.hl .hl-link{background:none;border:0;color:var(--hl-gold-hi);font:700 13px var(--body);cursor:pointer;min-height:44px;padding:0;text-align:left;align-self:flex-start}
.hl .hl-switch{display:inline-flex;flex-wrap:wrap;gap:4px;border:1px solid var(--hl-line);border-radius:999px;padding:4px;align-self:flex-start}
.hl .hl-switch button{min-height:44px;padding:0 18px;border-radius:999px;border:0;background:transparent;color:var(--hl-ink);font:600 14px var(--body);cursor:pointer}
.hl .hl-switch button[aria-pressed="true"]{background:var(--hl-gold);color:#1C1309}
.hl button:focus-visible,.hl input:focus-visible,.hl summary:focus-visible{outline:2px solid var(--hl-gold-hi);outline-offset:2px}
.hl .hl-heads,.hl .hl-pair{display:grid;grid-template-columns:minmax(0,1fr) 34px minmax(0,1fr);gap:0 12px}
.hl .hl-heads{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--hl-muted);font-weight:700;margin-bottom:10px}
.hl .hl-rows{display:flex;flex-direction:column;gap:14px}
.hl .hl-card{background:rgba(247,242,231,.05);border:1px solid var(--hl-line);border-radius:9px;padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}
.hl .hl-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.hl .hl-name{font-weight:700;font-size:15px;display:inline-flex;gap:10px;align-items:center}
.hl .hl-big{font:500 24px/1.1 var(--display);color:var(--hl-gold-hi);white-space:nowrap;font-variant-numeric:tabular-nums}
.hl .hl-note{font-size:13px;color:var(--hl-muted)}
.hl .hl-dom{font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:700}
.hl input[type=range]{width:100%;accent-color:var(--hl-gold);height:28px;margin:0;cursor:pointer}
.hl .hl-arrow{display:flex;align-items:center;justify-content:center;color:var(--hl-gold)}
.hl .hl-track{position:relative;height:10px;border-radius:5px;background:var(--hl-line);margin:18px 0 22px}
.hl .hl-fill{position:absolute;left:0;top:0;bottom:0;border-radius:5px;transition:width .6s cubic-bezier(.2,.8,.2,1),background-color .4s}
.hl .hl-today{position:absolute;top:-6px;bottom:-6px;width:2px;background:var(--hl-ink);opacity:.45}
.hl .hl-today span{position:absolute;top:-17px;left:50%;transform:translateX(-50%);font-size:10px;color:var(--hl-muted);white-space:nowrap}
.hl .hl-limit{position:absolute;top:-6px;bottom:-6px;border-left:2px dashed #DDBD69}
.hl .hl-limit span{position:absolute;bottom:-17px;left:50%;transform:translateX(-50%);font-size:10px;color:#DDBD69;white-space:nowrap}
.hl .hl-verdict{background:rgba(180,151,95,.14);border-radius:9px;padding:14px 16px;font-weight:700;font-size:16px;line-height:1.45}
.hl details{border:1px solid var(--hl-line);border-radius:9px;padding:12px 16px}
.hl summary{cursor:pointer;font-weight:700;color:var(--hl-gold-hi);min-height:32px;display:flex;align-items:center}
.hl .hl-fine{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;padding-top:12px}
.hl .hl-go{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center}
.hl .hl-go .cta{margin-top:0;border:0;cursor:pointer}
@media(max-width:760px){.hl .hl-own{grid-template-columns:1fr}.hl .hl-heads{display:none}.hl .hl-pair{grid-template-columns:1fr;gap:6px}.hl .hl-arrow{transform:rotate(90deg);height:26px}.hl .hl-rows{gap:22px}}
@media(prefers-reduced-motion:reduce){.hl .hl-fill{transition:none}}`;

const n0 = (x) => Math.round(x).toLocaleString('en-US');
const usd = (x) => (x < -0.5 ? '−' : '') + '$' + n0(Math.abs(x));
const hrs = (x) => String(Math.round(x * 10) / 10);
/** A typed number: blank or nonsense is null, never NaN. */
export const num = (v) => { const s = String(v ?? '').trim(); const x = Number(s.replace(/[^\d.]/g, '')); return s !== '' && Number.isFinite(x) && x >= 0 ? x : null; };

const box = (id, label, value, extra = '') => `<label class="hl-in" for="hl-${id}">${label}<input id="hl-${id}" data-hl="${id}" type="text" inputmode="decimal" autocomplete="off" maxlength="9" value="${value}"${extra}></label>`;

/** Fill the host and return { update }. `E` is CompassEngine; `openGate`
 *  opens the full account form. */
export function fill(host, { E, openGate }) {
  const L = { p: 0, m: 0, f: 0, d: 0, mode: 'time' };
  const V = { ...EXAMPLE };
  host.removeAttribute('aria-label'); host.style.minHeight = '';
  host.innerHTML = `<style>${CSS}</style><div class="hl">
    <div class="hl-ex">
      <span class="hl-tag">An example founder</span>
      <p class="hl-small" id="hl-exline">${EXAMPLE.clients} clients a month at $${EXAMPLE.price}, ${EXAMPLE.hours} hours each. Type your own numbers over theirs.</p>
      <div class="hl-own">
        ${box('price', 'Price per client ($)', EXAMPLE.price)}
        ${box('clients', 'Clients a month', EXAMPLE.clients)}
        ${box('hours', 'Hours per client', EXAMPLE.hours)}
      </div>
      <p class="hl-small" id="hl-rest"></p>
      <button type="button" class="hl-link" id="hl-reset" hidden>Back to the example founder</button>
    </div>
    <div class="hl-switch" role="group" aria-label="What should the gain go to?">
      <button type="button" data-mode="time" aria-pressed="true">Give me back time</button>
      <button type="button" data-mode="money" aria-pressed="false">Give me more money</button>
    </div>
    <div>
      <div class="hl-heads" aria-hidden="true"><span>You move</span><span></span><span>Moves by itself</span></div>
      <div class="hl-rows">${PAIRS.map((x) => `<div class="hl-pair">
        <div class="hl-card">
          <div class="hl-row"><label for="hl-lv-${x.k}" class="hl-name"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex: none"><path d="${x.icon}" fill="none" stroke="#B4975F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>${x.name}</label><span class="hl-big" id="hl-v-${x.k}">0%</span></div>
          <input id="hl-lv-${x.k}" type="range" min="0" max="${E.LEVER_RANGE[x.k]}" step="5" value="0" data-lv="${x.k}">
          <span class="hl-note" id="hl-n-${x.k}"></span>
        </div>
        <div class="hl-arrow" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="hl-card" role="meter" id="hl-o-${x.out.k}" aria-labelledby="hl-on-${x.out.k}" aria-valuemin="0">
          <span class="hl-dom" style="color: ${x.out.col}">${x.out.dom}</span>
          <div class="hl-row"><span class="hl-name" id="hl-on-${x.out.k}">${x.out.name}</span><span class="hl-big" id="hl-ov-${x.out.k}">—</span></div>
          <div class="hl-track"><div class="hl-fill" id="hl-f-${x.out.k}"></div><div class="hl-today" id="hl-t-${x.out.k}"><span>today</span></div>${x.out.k === 'time' ? '<div class="hl-limit" id="hl-limit" hidden><span id="hl-limit-l">limit</span></div>' : ''}</div>
          <span class="hl-note" id="hl-on2-${x.out.k}"></span>
        </div></div>`).join('')}</div>
    </div>
    <div class="hl-verdict" id="hl-verdict" aria-live="polite"></div>
    <details><summary>Fine-tune (optional)</summary>
      <div class="hl-fine">
        ${box('limit', 'Hours you want to work a month', EXAMPLE.limit)}
        ${box('run', 'Running costs a month ($)', EXAMPLE.run)}
        ${box('rate', 'Helper rate per hour ($)', EXAMPLE.rate)}
        ${box('hire', 'Monthly cost of one more person ($)', EXAMPLE.hire)}
      </div>
    </details>
    <p class="hl-small">The sums are the easy part: a machine does them in a second. Which lever you pull, and what you tell your customers when you do, is the part only you can decide. Nothing you type here is saved or sent.</p>
    <div class="hl-go"><button type="button" class="cta" data-hlgate>Create my free account →</button></div>
  </div>`;

  const $ = (id) => host.querySelector('#' + id);
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };

  function update() {
    const b = baseOf(V);
    const own = ['price', 'clients', 'hours', 'limit', 'run', 'rate', 'hire'].some((k) => V[k] !== EXAMPLE[k]);
    $('hl-reset').hidden = !own;
    set('hl-rest', `Also in the sums: a fifth of each price goes on delivering the work, ${usd(V.run)} running costs a month${V.limit > 0 ? `, and a limit of ${n0(V.limit)} hours a month` : ''}. Change them under Fine-tune.`);
    if (!b.ready) {
      set('hl-verdict', 'Type a price, at least one client and the hours each one takes, and the lab runs on your numbers.');
      for (const x of PAIRS) {
        set('hl-ov-' + x.out.k, '—'); set('hl-on2-' + x.out.k, ''); set('hl-n-' + x.k, '');
        $('hl-f-' + x.out.k).style.width = '0%'; $('hl-t-' + x.out.k).hidden = true; $('hl-o-' + x.out.k).removeAttribute('aria-valuenow');
      }
      $('hl-limit').hidden = true;
      return;
    }
    const t = E.month(b, {}, L.mode), s = E.month(b, L, L.mode);
    const scale = { cash: Math.max(Math.abs(t.cash) * 3, 1000), clients: Math.max(t.clients * 3, 1), time: Math.max(t.mine, b.limit || 0) * 1.5 || 1,
      people: b.hire ? Math.max(4, Math.ceil(Math.max(Math.abs(t.cash) * 3, 1000) / b.hire)) : 4 };
    const vals = { cash: [s.cash, t.cash], clients: [s.clients, t.clients], time: [s.mine, t.mine], people: [s.people, t.people] };
    for (const x of PAIRS) set('hl-v-' + x.k, SIGN[x.k] + L[x.k] + '%');
    set('hl-n-p', `Each client: ${usd(V.price)} → ${usd(V.price * (1 + L.p / 100))}`);
    set('hl-n-m', `Ready to buy: ${n0(V.clients)} → ${n0(s.clientsWanted)} a month, same marketing spend`);
    set('hl-n-f', `Hours per client: ${hrs(V.hours)} h → ${hrs(V.hours * (1 - L.f / 100))} h`);
    set('hl-n-d', !L.d ? 'You do all the work yourself.' : b.rate !== null ? `${L.d}% of the delivery hours go to a helper at ${usd(b.rate)} an hour.` : `${L.d}% of the delivery hours go to a helper. Set the rate in Fine-tune.`);
    let improved = 0;
    for (const x of PAIRS) {
      const o = x.out, [now, was] = vals[o.k], max = scale[o.k];
      const pct = (y) => Math.max(0, Math.min(100, y / max * 100));
      const good = now !== null && was !== null && (o.lower ? now < was - 0.5 : now > was + (o.k === 'cash' ? 1 : 0.05));
      const bad = now !== null && was !== null && (o.lower ? now > was + 0.5 : now < was - (o.k === 'cash' ? 1 : 0.05));
      if (good) improved++;
      const f = $('hl-f-' + o.k); f.style.width = (now === null ? 0 : pct(now)) + '%'; f.style.background = good ? '#9BC0A1' : bad ? '#E0A282' : '#8A7A5E';
      const td = $('hl-t-' + o.k); td.hidden = was === null; if (was !== null) td.style.left = pct(was) + '%';
      const card = $('hl-o-' + o.k); card.setAttribute('aria-valuemax', String(Math.round(max))); if (now !== null) card.setAttribute('aria-valuenow', String(Math.round(now)));
    }
    const lim = $('hl-limit');
    lim.hidden = !b.limit; if (b.limit) { lim.style.left = Math.min(100, b.limit / scale.time * 100) + '%'; set('hl-limit-l', `limit ${n0(b.limit)} h a month`); }
    set('hl-ov-cash', s.cash === null ? '—' : usd(s.cash)); set('hl-ov-clients', n0(s.clients)); set('hl-ov-time', n0(s.mine) + ' h');
    set('hl-ov-people', s.people === null ? '—' : (Math.round(s.people * 10) / 10).toFixed(1));
    const dc = s.cash === null ? null : s.cash - t.cash;
    set('hl-on2-cash', s.cash === null ? 'Set a helper rate in Fine-tune to see what the help costs.' : Math.abs(dc) < 1 ? 'Same money as today.' : `${dc > 0 ? '+' : '−'}${usd(Math.abs(dc))} a month compared with today.`);
    set('hl-on2-clients', s.clients < s.clientsWanted - 0.05 ? `You serve ${n0(s.clients)}. ${n0(s.clientsWanted)} want you, so you can choose the best fit.` : s.clients > t.clients + 0.05 ? `+${n0(s.clients - t.clients)} a month compared with today.` : 'Same as today.');
    const back = t.mine - s.mine;
    set('hl-on2-time', b.limit ? (s.mine > b.limit + 0.5 ? `${n0(s.mine - b.limit)} hours beyond the limit of ${n0(b.limit)} a month.` : `Within the limit of ${n0(b.limit)} hours a month.${back > 0.5 ? ` ${n0(back)} hours a month back.` : ''}`) : (back > 0.5 ? `${n0(back)} hours a month back.` : 'Same hours as today.'));
    set('hl-on2-people', s.people === null ? 'Set the monthly cost of one more person in Fine-tune to see this.' : s.people >= 0.1 ? `About ${(Math.round(s.people * 10) / 10).toFixed(1)} people at ${usd(b.hire)} a month each.` : 'No room to pay for help yet.');
    let verdict;
    if (!L.p && !L.m && !L.f && !L.d) verdict = `Today: ${n0(t.mine)} hours a month${b.limit ? (t.mine > b.limit + 0.5 ? `, beyond the limit of ${n0(b.limit)} a month` : `, within the limit of ${n0(b.limit)} a month`) : ''}. Move one lever and watch the four answer.`;
    else if (b.limit && s.mine > b.limit + 0.5) verdict = `Still beyond the limit of ${n0(b.limit)} hours a month. Try a fairer price, fewer hours for each client, or hand part of the work to someone else.`;
    else if (improved >= 3) verdict = 'This is leadership: one change, and most of the four answer at once.';
    else if (L.mode === 'time' && back > 0.5 && dc !== null && dc > -1) verdict = 'Same money, fewer hours. The price you charge decides how much of your life the business needs.';
    else if (L.mode === 'money' && dc !== null && dc > 1) verdict = 'More money for the same work. Now ask what that money is for.';
    else verdict = 'Now try a second lever and see which answer moves next.';
    set('hl-verdict', verdict);
  }

  host.addEventListener('input', (e) => {
    const k = e.target.dataset.lv, f = e.target.dataset.hl;
    if (k) { L[k] = Number(e.target.value); update(); }
    if (f) { V[f] = num(e.target.value); update(); }
  });
  host.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    L.mode = b.dataset.mode; host.querySelectorAll('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); update();
  }));
  $('hl-reset').addEventListener('click', () => {
    Object.assign(V, EXAMPLE);
    host.querySelectorAll('[data-hl]').forEach((el) => { el.value = EXAMPLE[el.dataset.hl]; });
    update();
  });
  host.querySelector('[data-hlgate]').addEventListener('click', openGate);
  update();
  return { update };
}
