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
(function () {
  const $ = (s) => document.querySelector(s);
  const out = (k, v) => document.querySelectorAll(`[data-out="${k}"]`).forEach((el) => { el.textContent = v; });
  const money = (n) => Math.round(n).toLocaleString('en-US');
  const val = {};
  document.querySelectorAll('[data-in]').forEach((el) => { val[el.dataset.in] = Number(el.value); });

  /* Where you are, where you want to be. */
  function dream() {
    const { hNow, hWant, cNow, cWant, rNow, rWant } = val;
    out('hNow', hNow); out('hWant', hWant); out('cNow', cNow); out('cWant', cWant); out('rNow', rNow); out('rWant', rWant);
    const back = hNow - hWant;
    out('timeMsg', back > 0 ? `That is ${(back * 52).toLocaleString('en-US')} hours a year back in your life. What would you do with them?`
      : back === 0 ? 'Same hours. Fine — then the question is what those hours are for.'
      : `You would work ${-back} more hours a week. Make sure they buy something you actually want.`);
    const mult = Math.round((cWant / cNow) * 10) / 10;
    out('clientMsg', cWant > cNow ? `${mult}× the clients. Done the way you work today, that is ${mult}× the hours.`
      : cWant === cNow ? 'Same number of clients. Then growth means deeper work or a better price.'
      : 'Fewer clients — higher value each? That is a real strategy. Choose it on purpose.');
    const gap = rWant - rNow;
    out('scaleMsg', gap > 0 ? `You would hand over ${gap}% of what you carry today. Someone has to be ready to carry it.`
      : gap === 0 ? 'You plan to stay at the centre. That is allowed — just choose it.'
      : 'You want to hold more yourself. Ask why before you take it back.');
    const cut = Math.round((1 - (hWant / cWant) / (hNow / cNow)) * 100);
    const c = $('[data-out="cutTxt"]');
    if (cut >= 50) {
      out('cutTxt', cut + '%'); c.style.color = '#FF8A6B'; out('cutCaption', 'less of your time per client');
      out('verdictTitle', 'This is not a sales problem. It is a leadership one.');
      out('verdictText', 'More clients with less of you only works when the business stops running through you: a clear offer, simple systems, people you trust with real decisions. That is the road the Compass maps, step by step, for your stage.');
    } else if (cut > 0) {
      out('cutTxt', cut + '%'); c.style.color = '#C9A24A'; out('cutCaption', 'less of your time per client');
      out('verdictTitle', 'Doable — if you change how the work gets done, not how hard you work.');
      out('verdictText', 'Working harder will not close this gap. Better systems, a sharper offer and one or two decisions given away will. The Compass shows you which ones come first.');
    } else {
      out('cutTxt', 'On track'); c.style.color = '#7FD1A8'; out('cutCaption', 'your time per client can stay the same');
      out('verdictTitle', 'The road is reaching the clients, not surviving them.');
      out('verdictText', 'Your hours can carry this. The question moves to the market: who exactly you serve, and how they find you. The Compass helps you get that clear.');
    }
  }

  /* The life-first calculator: start with what you want to take home. */
  function plan() {
    const { goal, price, keep, hps, avail } = val;
    const perSale = price * keep / 100, sales = Math.max(1, Math.ceil(goal / perSale)), need = sales * hps, ratio = need / avail;
    out('goalTxt', money(goal)); out('priceTxt', money(price)); out('keep', keep); out('hps', hps); out('avail', avail);
    out('sales', sales); out('perSaleTxt', money(perSale)); out('need', need);
    let color, ink, label, title, text, ask;
    if (ratio > 1) {
      color = '#C8432B'; ink = '#FFFFFF'; label = 'IN THE RED'; title = 'This plan borrows from your life.';
      text = `It needs ${need} hours a month. You want to work ${avail}. The missing ${need - avail} hours come from somewhere: evenings, rest, family.`;
      ask = 'What would you stop, change or delegate before selling more?';
    } else if (ratio > 0.85) {
      color = '#C9A24A'; ink = '#15213B'; label = 'TIGHT'; title = 'It fits — just. No room for a bad week.';
      text = `The plan uses ${need} of your ${avail} hours. One sick day, one difficult client, and it spills into your life.`;
      ask = 'What happens to this plan when one week goes wrong?';
    } else {
      color = '#2F7D5B'; ink = '#FFFFFF'; label = 'IT FITS'; title = 'It fits, with room to breathe.';
      text = `The plan needs ${need} of the ${avail} hours you want to work. Now the real question is not money.`;
      ask = 'Do you know what enough looks like — and why you want the next goal?';
    }
    out('fbTitle', title); out('fbText', text); out('fbAsk', ask);
    const st = $('#status'); st.textContent = label; st.style.background = color; st.style.color = ink;
    $('#plan-card').style.borderTopColor = color;
    const bar = $('#needbar'); bar.style.width = Math.min(100, Math.round(ratio * 100)) + '%'; bar.style.background = color;
    const salesFit = Math.floor(avail / hps);
    out('priceFit', salesFit >= 1 ? money(Math.ceil(goal / (salesFit * keep / 100) / 10) * 10) : '—');
    out('hpsFit', Math.max(0.5, Math.floor((avail / sales) * 2) / 2));
    $('#levers').hidden = ratio <= 0.85;
  }

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

  document.querySelectorAll('[data-in]').forEach((el) => el.addEventListener('input', () => {
    val[el.dataset.in] = Number(el.value);
    if (['goal', 'price', 'keep', 'hps', 'avail'].includes(el.dataset.in)) plan(); else dream();
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
