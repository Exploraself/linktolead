// One carousel = ten slides of 1080 × 1350 (Instagram 4:5).
// Two fonts (Newsreader for headlines, Inter for body), three colours
// (warm black, ivory, gold), one image style (gold line drawings on a
// blueprint grid). Every slide type below is plain HTML and CSS.
import { md, esc, drawable } from './markup.mjs';
import { ART } from './art.mjs';
import { diagram } from './diagrams.mjs';
import { card } from './cards.mjs';

export const BRAND = { name: 'Alexandru Cojocari', role: 'Leadership mentor · ExploraSelf' };

export const CTAS = {
  unshakeable: { action: 'Take the Unshakeable assessment', url: 'exploraself.com/unshakeable', line: 'See how steady you stay when the pressure comes, and where to start building.' },
  northstar: { action: 'Take the free North Star', url: 'linktolead.exploraself.com/north1', line: 'See which of the four domains needs you first.' },
};

export const W = 1080, H = 1350;

export const CSS = `
:root{--bg:#0C0906;--ink:#F3EBDD;--soft:#CFC3AE;--mute:#9C8F78;--gold:#E2B865;--gold2:#C9973F;--line:#3A2E1F;--card:#16110B;
  --paper:#F6F0E4;--pink:#1C1712;--pmute:#5E5244;--pgold:#8A6420;--pline:#E2D7C3;
  --foil:linear-gradient(180deg,#F8DE96 0%,#E8BD5F 46%,#C38E36 100%)}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#000;font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;color:var(--ink);background:var(--bg)}
.slide::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:
   radial-gradient(1100px 760px at 12% -6%,rgba(226,184,101,.10),transparent 62%),
   radial-gradient(900px 700px at 100% 108%,rgba(226,184,101,.07),transparent 60%),
   repeating-linear-gradient(0deg,rgba(226,184,101,.045) 0 1px,transparent 1px 60px),
   repeating-linear-gradient(90deg,rgba(226,184,101,.045) 0 1px,transparent 1px 60px)}
.slide>*{position:relative}
.top{position:absolute;left:64px;right:64px;top:52px;display:flex;justify-content:space-between;align-items:center;z-index:3}
.pill{font:600 22px/1 Inter;letter-spacing:.16em;text-transform:uppercase;color:var(--soft)}
.count{font:600 24px/1 Inter;color:var(--soft);padding:12px 18px;border:1.5px solid var(--line);border-radius:999px;background:rgba(12,9,6,.6)}
.bot{position:absolute;left:64px;right:64px;bottom:44px;display:flex;justify-content:space-between;align-items:center;z-index:3}
.who{font:600 26px/1 Inter;color:var(--soft);display:flex;align-items:center;gap:14px}
.who svg{width:34px;height:34px;color:var(--gold)}
.swipe{display:flex;gap:10px}.swipe span{width:44px;height:44px;border-radius:50%;border:2px solid var(--gold);display:grid;place-items:center;color:var(--gold);font:700 22px/1 Inter}
.swipe span:nth-child(1){opacity:.35}.swipe span:nth-child(2){opacity:.65}
.body{position:absolute;left:64px;right:64px;top:132px;bottom:118px;display:flex;flex-direction:column;gap:30px}
h2.t{font:600 80px/1.04 Newsreader,serif;letter-spacing:-.012em;color:var(--ink)}
h2.t.sm{font-size:68px}
.acc{font-style:italic;color:var(--gold);font-weight:inherit}
.p{font:400 38px/1.42 Inter;color:var(--soft)}.p b{color:var(--ink);font-weight:600}
.p .acc{font-style:normal;color:var(--gold);font-weight:600}
.kick{font:700 24px/1 Inter;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
.blank{display:inline-flex;flex-direction:column;align-items:center;vertical-align:baseline;margin:0 6px;min-width:150px}
.blank .bl{display:block;width:100%;height:1.05em;border-bottom:3px solid currentColor;opacity:.75}
.blank i{font:500 19px/1.1 Inter;font-style:normal;letter-spacing:.06em;text-transform:uppercase;opacity:.7;margin-top:6px;white-space:nowrap}
/* foot line with the gold arrow box, like a page turn */
.foot{margin-top:auto;align-self:flex-end;display:flex;align-items:center;gap:22px;max-width:820px;text-align:right}
.foot p{font:400 46px/1.12 Newsreader,serif;color:var(--ink)}
.foot p .acc{font-style:italic}
.arrowbox{flex:none;width:76px;height:76px;border-radius:12px;background:var(--gold);display:grid;place-items:center}
.arrowbox svg{width:44px;height:44px}
/* hook */
.hook .art{position:absolute;left:90px;right:90px;top:110px;height:700px;display:grid;place-items:center}
.hook .art svg{width:100%;height:100%}
.hook .bignum{font:800 330px/0.9 Newsreader,serif;letter-spacing:-.03em;background:var(--foil);-webkit-background-clip:text;background-clip:text;color:transparent;text-align:center;white-space:nowrap}
.hook .bignum sup{font-size:.45em;vertical-align:.95em;letter-spacing:0}
.hook .txt{position:absolute;left:56px;right:56px;bottom:120px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px}
.hook .pre{font:800 46px/1.1 Inter;letter-spacing:.2em;text-transform:uppercase;color:var(--ink);white-space:nowrap}
.hook .ttl{font:800 190px/.92 Newsreader,serif;letter-spacing:-.025em;text-transform:uppercase;background:var(--foil);-webkit-background-clip:text;background-clip:text;color:transparent;white-space:nowrap;padding:0 8px}
.hook .post{font:800 130px/.95 Newsreader,serif;font-style:italic;letter-spacing:-.02em;white-space:nowrap;background:linear-gradient(180deg,#F3EBDD 30%,rgba(243,235,221,.18) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;padding:0 10px}
.hook .sub{font:500 32px/1.3 Inter;color:var(--soft);margin-top:18px}
.hook .shade{position:absolute;left:0;right:0;bottom:0;height:700px;background:linear-gradient(180deg,transparent,rgba(12,9,6,.86) 46%,var(--bg))}
.fit{display:block;max-width:100%}
/* art */
.art svg{color:var(--gold);overflow:visible}
.art svg *{fill:none;stroke:currentColor;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
.art svg [fill="currentColor"]{fill:currentColor}
.art svg text{stroke:none;fill:var(--mute);font:600 17px Inter;letter-spacing:.14em}
.art svg text.fig{fill:var(--mute);font:600 15px Inter;letter-spacing:.2em}
.art svg text.big{fill:var(--gold);font:600 40px Newsreader,serif;letter-spacing:.02em}
.art svg text.huge{fill:var(--gold);font:700 92px Newsreader,serif}
.art .s{stroke-dasharray:1;stroke-dashoffset:0;animation:draw 1.1s cubic-bezier(.5,0,.2,1) both;animation-delay:calc(var(--i) * 70ms + 150ms)}
@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.art svg text,.art svg [fill="currentColor"]{animation:fade .8s ease both;animation-delay:1.2s}
@keyframes fade{from{opacity:0}to{opacity:1}}
.rise{animation:rise .9s cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--d,0s)}
@keyframes rise{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
/* story */
.row{display:flex;gap:40px;align-items:center;flex:1;min-height:0}
.row .cardwrap{flex:0 0 580px;display:flex;align-items:center}
.row .note{flex:1;display:flex;flex-direction:column;gap:18px}
.row .note svg{width:170px;height:110px;color:var(--soft)}
.row .note p{font:400 42px/1.16 Newsreader,serif;color:var(--ink)}
.wide{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}
/* steps */
.steps{display:flex;flex-direction:column;gap:54px;flex:1;justify-content:center}
.step{display:grid;grid-template-columns:92px 1fr;gap:28px;align-items:start}
.badge{width:92px;height:92px;border-radius:18px;background:var(--gold);color:#1A130A;font:800 40px/92px Inter;text-align:center}
.step h3{font:600 62px/1.04 Newsreader,serif;color:var(--ink);margin-top:2px}
.step p{font:400 37px/1.36 Inter;color:var(--soft);margin-top:10px}
.step p b{color:var(--ink);font-weight:600}
.steps.many{gap:34px}.steps.many .step h3{font-size:52px}.steps.many .step p{font-size:32px;margin-top:6px}.steps.many .badge{width:70px;height:70px;line-height:70px;font-size:32px}.steps.many .step{grid-template-columns:70px 1fr}
/* paper */
.paper{background:var(--paper);color:var(--pink);border-radius:22px;box-shadow:0 30px 70px rgba(0,0,0,.45)}
.paper .acc{color:var(--pgold)}
.tpl{padding:60px 56px 54px;display:flex;flex-direction:column;gap:38px;font:400 50px/1.65 Newsreader,serif}
.tpl .line{color:var(--pink)}
.tpl .lab{font:700 20px/1 Inter;letter-spacing:.2em;text-transform:uppercase;color:var(--pmute)}
.tpl .blank{color:var(--pgold)}
.tpl .hint{font:400 27px/1.4 Inter;color:var(--pmute);border-top:2px dashed var(--pline);padding-top:24px}
/* script */
.chat{display:flex;flex-direction:column;gap:22px;flex:1;justify-content:center}
.bub{max-width:84%;padding:28px 34px;border-radius:30px;font:400 37px/1.38 Inter}
.bub small{display:block;font:700 19px/1 Inter;letter-spacing:.18em;text-transform:uppercase;margin-bottom:12px;opacity:.75}
.bub.me{align-self:flex-end;background:var(--gold);color:#1A130A;border-bottom-right-radius:8px}
.bub.them{align-self:flex-start;background:#2A2118;color:var(--ink);border-bottom-left-radius:8px}
.bub.aside{align-self:center;background:none;border:2px dashed var(--line);color:var(--soft);font-size:28px;text-align:center;max-width:92%}
/* checklist */
.checks{display:flex;flex-direction:column;gap:40px;flex:1;justify-content:center}
.chk{display:grid;grid-template-columns:68px 1fr;gap:28px;align-items:start;font:400 42px/1.3 Inter;color:var(--ink)}
.chk .box{width:64px;height:64px;border:3px solid var(--gold);border-radius:12px;margin-top:-2px}
.chk small{display:block;font:400 33px/1.35 Inter;color:var(--soft);margin-top:6px}
/* rule */
.rulebox{flex:1;display:flex;flex-direction:column;justify-content:center;gap:40px}
.rulebox .big{font:600 98px/1.02 Newsreader,serif;letter-spacing:-.015em}
.rulebox .rp{font:400 39px/1.45 Inter;color:var(--soft);max-width:900px}
.rulebox .rp b{color:var(--ink);font-weight:600}
.rulebox .qm{font:800 220px/0.6 Newsreader,serif;color:var(--gold);height:110px}
/* cta */
.cta .q{font:500 70px/1.1 Newsreader,serif;font-style:italic;color:var(--ink)}
.cta .q .acc{color:var(--gold)}
.mecard{display:grid;grid-template-columns:330px 1fr;gap:40px;align-items:center;padding:34px;border:2px solid var(--line);border-radius:28px;background:var(--card)}
.mecard img{width:330px;height:380px;object-fit:cover;object-position:52% 18%;border-radius:18px;display:block}
.mecard h4{font:700 50px/1.05 Newsreader,serif}
.mecard .role{font:500 25px/1.3 Inter;color:var(--mute);margin-top:10px;letter-spacing:.02em}
.mecard .act{margin-top:30px;display:inline-block;background:var(--gold);color:#1A130A;font:700 30px/1.25 Inter;padding:22px 28px;border-radius:16px}
.mecard .url{font:600 27px/1.2 Inter;color:var(--gold);margin-top:18px}
.mecard .why{font:400 26px/1.4 Inter;color:var(--soft);margin-top:14px}
.save{display:flex;align-items:center;gap:26px;margin-top:auto}
.save svg{width:84px;height:100px;color:var(--gold);flex:none}
.save p{font:500 46px/1.15 Newsreader,serif;font-style:italic}
.save p .acc{color:var(--gold)}
`;

const arrowSE = '<svg viewBox="0 0 44 44" fill="none" stroke="#1A130A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12 L32 32 M32 14 V32 H14"/></svg>';
const loopArrow = '<svg viewBox="0 0 170 110" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 9"><path d="M165 60 C130 20 70 10 60 50 C52 85 100 92 104 60 C108 30 60 30 12 62"/><path d="M12 62 L34 50 M12 62 L28 80" stroke-dasharray="none"/></svg>';
const treeMark = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="20" cy="14" r="8"/><circle cx="12" cy="19" r="6"/><circle cx="28" cy="19" r="6"/><path d="M20 22 V36 M14 36 H26"/></svg>';
const bookmark = '<svg viewBox="0 0 84 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"><path d="M8 6 H76 V94 L42 66 L8 94 Z"/></svg>';

const chrome = (c, i, total) => `
  <div class="top"><span class="pill">${esc(c.pillar)}</span><span class="count">${i + 1}/${total}</span></div>
  <div class="bot"><span class="who">${treeMark}${esc(BRAND.name)}</span>${i < total - 1 ? '<span class="swipe"><span>›</span><span>›</span><span>›</span></span>' : ''}</div>`;

const title = (s, cls = '') => s ? `<h2 class="t ${cls} fit-h" data-min="44">${md(s)}</h2>` : '';
const sub = (s) => s ? `<p class="p">${md(s)}</p>` : '';
const foot = (s) => s ? `<div class="foot"><p>${md(s)}</p><span class="arrowbox">${arrowSE}</span></div>` : '';

const T = {
  hook(s) {
    const art = s.big
      ? `<div class="bignum fit" data-min="140">${s.big}</div>`
      : `<svg viewBox="0 0 800 640" aria-hidden="true">${drawable(ART[s.art](s.fig))}</svg>`;
    return `<div class="art">${art}</div><div class="shade"></div>
      <div class="txt">
        ${s.pre ? `<div class="pre fit rise" data-min="26" style="--d:.2s">${esc(s.pre)}</div>` : ''}
        <div class="ttl fit rise" data-min="70" style="--d:.45s">${esc(s.title)}</div>
        ${s.post ? `<div class="post fit rise" data-min="50" style="--d:.75s">${esc(s.post)}</div>` : ''}
        ${s.sub ? `<div class="sub rise" style="--d:1.1s">${md(s.sub)}</div>` : ''}
      </div>`;
  },
  story(s) {
    const c = card(s.card);
    const mid = s.note
      ? `<div class="row"><div class="cardwrap">${c}</div><div class="note">${loopArrow}<p>${md(s.note)}</p></div></div>`
      : `<div class="wide">${c}</div>`;
    return `<div class="body">${title(s.title)}${sub(s.text)}${mid}${foot(s.foot)}</div>`;
  },
  diagram(s) {
    return `<div class="body">${title(s.title)}${sub(s.text)}<div class="wide">${diagram(s.d)}</div>${foot(s.foot)}</div>`;
  },
  steps(s) {
    const many = s.items.length > 4;
    return `<div class="body">${title(s.title, many ? 'sm' : '')}<div class="steps ${many ? 'many' : ''}">${s.items.map((it, i) => `
      <div class="step"><span class="badge">${String(i + 1).padStart(2, '0')}</span><div><h3>${md(it.h)}</h3>${it.p ? `<p>${md(it.p)}</p>` : ''}</div></div>`).join('')}
      </div>${foot(s.foot)}</div>`;
  },
  template(s) {
    return `<div class="body">${title(s.title, 'sm')}<div class="wide"><div class="paper tpl" style="width:100%">
      ${s.label ? `<div class="lab">${esc(s.label)}</div>` : ''}
      ${s.lines.map((l) => `<div class="line">${md(l)}</div>`).join('')}
      ${s.hint ? `<div class="hint">${md(s.hint)}</div>` : ''}</div></div>${foot(s.foot)}</div>`;
  },
  script(s) {
    return `<div class="body">${title(s.title, 'sm')}<div class="chat">${s.lines.map((l) => `
      <div class="bub ${l.who === 'aside' ? 'aside' : l.who === 'them' ? 'them' : 'me'}">${l.label ? `<small>${esc(l.label)}</small>` : ''}${md(l.text)}</div>`).join('')}</div>${foot(s.foot)}</div>`;
  },
  checklist(s) {
    return `<div class="body">${title(s.title, 'sm')}<div class="checks">${s.items.map((it) => {
      const [h, p] = Array.isArray(it) ? it : [it];
      return `<div class="chk"><span class="box"></span><div>${md(h)}${p ? `<small>${md(p)}</small>` : ''}</div></div>`;
    }).join('')}</div>${foot(s.foot)}</div>`;
  },
  rule(s) {
    return `<div class="body"><div class="rulebox">${s.kicker ? `<div class="kick">${esc(s.kicker)}</div>` : ''}${s.quote ? '<div class="qm">“</div>' : ''}
      <div class="big fit-h" data-min="54">${md(s.text)}</div>${s.p ? `<div class="rp">${md(s.p)}</div>` : ''}</div>${foot(s.foot)}</div>`;
  },
  cta(s, c, photo) {
    const C = CTAS[c.cta];
    return `<div class="body cta"><div class="kick">${esc(s.kicker || 'Before you scroll on')}</div>
      <div class="q fit-h" data-min="48">${md(s.question)}</div>
      <div class="mecard"><img src="${photo}" alt="${esc(BRAND.name)}"><div>
        <h4>${esc(BRAND.name)}</h4><div class="role">${esc(BRAND.role)}</div>
        <div class="act">${esc(C.action)} →</div><div class="url">${esc(C.url)}</div><div class="why">${esc(C.line)}</div></div></div>
      <div class="save">${bookmark}<p>${md(s.save || 'Save it for *Monday*. Send it to one founder who needs it.')}</p></div></div>`;
  },
};

export function slideHTML(c, s, i, total, photo) {
  const fn = T[s.type];
  if (!fn) throw new Error(`${c.id} slide ${i + 1}: unknown type "${s.type}"`);
  return `<section class="slide ${s.type}" data-n="${i + 1}">${fn(s, c, photo)}${chrome(c, i, total)}</section>`;
}

// Shrinks each .fit line until it fits its width, and each .fit-h block
// until the slide's body no longer overflows. Records what it shrank.
export const FIT_JS = `
window.__fit = () => {
  for (const el of document.querySelectorAll('.fit')) {
    let s = parseFloat(getComputedStyle(el).fontSize), min = +el.dataset.min || 30, start = s;
    const box = el.parentElement.getBoundingClientRect().width;
    while (el.scrollWidth > box && s > min) { s -= 2; el.style.fontSize = s + 'px'; }
    if (s < start * 0.7) el.dataset.shrunk = Math.round(100 * s / start) + '%';
  }
  for (const body of document.querySelectorAll('.body')) {
    const over = () => body.scrollHeight > body.clientHeight + 1;
    const els = [...body.querySelectorAll('.fit-h')];
    let guard = 0;
    while (over() && guard++ < 60) {
      let changed = false;
      for (const el of els) {
        const s = parseFloat(getComputedStyle(el).fontSize), min = +el.dataset.min || 40;
        if (s > min) { el.style.fontSize = (s - 2) + 'px'; changed = true; el.dataset.shrunk = '1'; }
      }
      if (!changed) break;
    }
  }
};
window.__check = () => {
  const out = [];
  for (const sl of document.querySelectorAll('.slide')) {
    const n = sl.dataset.n, r = sl.getBoundingClientRect();
    const body = sl.querySelector('.body');
    if (body && body.scrollHeight > body.clientHeight + 2) out.push(n + ': content taller than the slide by ' + (body.scrollHeight - body.clientHeight) + 'px');
    for (const el of sl.querySelectorAll('.fit[data-shrunk]')) out.push(n + ': a line shrank to ' + el.dataset.shrunk + ' (' + el.textContent.slice(0, 40) + ')');
    for (const el of sl.querySelectorAll('.fit-h[data-shrunk]')) out.push(n + ': text shrank to fit (' + el.textContent.slice(0, 40) + '…)');
    for (const el of sl.querySelectorAll('.p,.foot,.step,.chk,.bub,.paper,.dg')) {
      const b = el.getBoundingClientRect();
      if (b.right > r.right - 40 || b.left < r.left + 40 || b.bottom > r.bottom - 110) out.push(n + ': ' + el.className + ' runs into the edge');
    }
  }
  return out;
};`;
