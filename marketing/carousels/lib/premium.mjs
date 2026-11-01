// The premium slides: objects a founder recognises in one glance (an AI
// chat, a receipt, a job ad, a child's drawing, a lock screen, sticky
// notes) and full-bleed photographs, in the same two fonts and three
// colours as every other slide. Mock objects may carry a hand or a
// typewriter face, the way a photo would.
import { readFileSync, existsSync } from 'node:fs';
import { md, esc, drawable } from './markup.mjs';
import { ART } from './art.mjs';

const IMG_DIR = new URL('../images/', import.meta.url);
const cache = {};
export function img(name) {
  if (cache[name]) return cache[name];
  const f = new URL(`${name}.jpg`, IMG_DIR);
  if (!existsSync(f)) throw new Error(`missing image images/${name}.jpg`);
  return (cache[name] = `data:image/jpeg;base64,${readFileSync(f).toString('base64')}`);
}

const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export const PREMIUM_FONTS = '&family=Courier+Prime:wght@400;700&family=Caveat:wght@500;700&family=Gochi+Hand';

export const PREMIUM_CSS = `
.grain::after{content:"";position:absolute;inset:0;pointer-events:none;background-image:${GRAIN};opacity:.07;mix-blend-mode:overlay;z-index:2}
/* photo */
.ph{position:absolute;inset:0;overflow:hidden;background:#000}
.ph img{width:100%;height:100%;object-fit:cover;display:block;animation:kb 7s cubic-bezier(.2,.6,.2,1) both}
@keyframes kb{from{transform:scale(1.1)}to{transform:scale(1)}}
.phshade{position:absolute;inset:0}
.phshade.bottom{background:linear-gradient(180deg,rgba(12,9,6,.38) 0%,rgba(12,9,6,0) 22%,rgba(12,9,6,0) 38%,rgba(12,9,6,.82) 64%,#0C0906 100%)}
.phshade.top{background:linear-gradient(0deg,rgba(12,9,6,.30) 0%,rgba(12,9,6,0) 30%,rgba(12,9,6,.0) 45%,rgba(12,9,6,.85) 75%,#0C0906 100%)}
.phshade.full{background:rgba(12,9,6,.62)}
.phtxt{position:absolute;left:64px;right:64px;display:flex;flex-direction:column;gap:22px;z-index:3}
.phtxt.bottom{bottom:132px}.phtxt.top{top:140px}.phtxt.mid{top:50%;transform:translateY(-50%)}
.phtxt .pt{font:600 96px/1.0 Newsreader,serif;letter-spacing:-.02em;color:var(--ink);text-shadow:0 2px 30px rgba(0,0,0,.4)}
.phtxt .pt.xl{font-size:150px;line-height:.92}
.phtxt .pt .acc{font-style:italic;color:var(--gold)}
.phtxt .pp{font:400 38px/1.4 Inter;color:#E9DFCC;max-width:900px;text-shadow:0 1px 18px rgba(0,0,0,.5)}
.phtxt .pp b{color:var(--ink);font-weight:600}
.phtxt .num{font:800 300px/.85 Newsreader,serif;letter-spacing:-.04em;background:var(--foil);-webkit-background-clip:text;background-clip:text;color:transparent}
.photo .top .pill,.photo .who{color:#EFE6D6;text-shadow:0 1px 8px rgba(0,0,0,.6)}
/* poster */
.poster .pbox{position:absolute;left:72px;right:72px;top:150px;bottom:140px;display:flex;flex-direction:column;justify-content:center;gap:34px;z-index:3}
.poster.center .pbox{align-items:center;text-align:center}
.poster .pbig{font:600 104px/1.02 Newsreader,serif;letter-spacing:-.02em;color:var(--ink);text-wrap:balance}
.poster .pbig.xl{font-size:132px;line-height:.96}
.poster .pbig .acc{font-style:italic;color:var(--gold)}
.poster .psmall{font:400 38px/1.45 Inter;color:var(--soft);max-width:880px}
.poster .psmall b{color:var(--ink);font-weight:600}
.poster .rule{width:120px;height:4px;background:var(--gold);border-radius:2px}
.stampx{display:inline-block;align-self:flex-start;transform:rotate(-7deg);border:7px solid #B5452F;color:#B5452F;border-radius:14px;padding:16px 30px 12px;font:800 54px/1 Inter;letter-spacing:.08em;text-transform:uppercase;mix-blend-mode:screen;opacity:.92}
.poster.center .stampx{align-self:center}
/* prompts */
.pr .month{font:500 176px/.9 Newsreader,serif;font-style:italic;color:var(--gold);letter-spacing:-.02em}
.pr .mlab{font:700 23px/1 Inter;letter-spacing:.2em;text-transform:uppercase;color:var(--mute);margin-top:18px}
.pr .thread{margin-top:44px;background:#14100B;border:2px solid var(--line);border-radius:30px;padding:34px 30px;display:flex;flex-direction:column;gap:24px}
.pr .q{align-self:flex-end;max-width:90%;background:#2B2219;color:var(--ink);font:400 40px/1.3 Inter;padding:24px 30px;border-radius:26px 26px 8px 26px}
.pr .q small{display:block;font:500 19px/1 Inter;color:var(--mute);margin-top:10px;text-align:right}
.pr .a{align-self:flex-start;display:flex;gap:14px;align-items:center;color:var(--mute);font:400 27px/1.3 Inter;padding:4px 6px}
.pr .a i{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7A684A,#3A2E1F);display:block;flex:none}
.pr .q.typing::after{content:"";display:inline-block;width:3px;height:1em;background:var(--gold);margin-left:6px;vertical-align:-4px;animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.pr .say{margin-top:auto;font:400 58px/1.12 Newsreader,serif;color:var(--ink)}
.pr .say .acc{font-style:italic;color:var(--gold)}
/* receipt */
.rcpt{width:800px;margin:0 auto;background:#FBF8F1;color:#211C16;font:400 33px/1.45 'Courier Prime',ui-monospace,monospace;padding:52px 54px 74px;position:relative;box-shadow:0 40px 80px rgba(0,0,0,.55);
  -webkit-mask:linear-gradient(#000,#000) top/100% calc(100% - 22px) no-repeat,conic-gradient(from 135deg at top,#0000,#000 1deg 89deg,#0000 90deg) bottom/36px 22px repeat-x;
  mask:linear-gradient(#000,#000) top/100% calc(100% - 22px) no-repeat,conic-gradient(from 135deg at top,#0000,#000 1deg 89deg,#0000 90deg) bottom/36px 22px repeat-x}
.rcpt .c{text-align:center}.rcpt .hd{font-weight:700;font-size:38px;letter-spacing:.06em;text-transform:uppercase}
.rcpt .sm{font-size:26px;color:#5A5246}
.rcpt .dash{border-top:3px dashed #9A9080;margin:20px 0}
.rcpt .r{display:flex;justify-content:space-between;gap:20px}.rcpt .r b{font-weight:700;white-space:nowrap}
.rcpt .r .bl{display:inline-block;flex:none;min-width:120px;border-bottom:3px solid #211C16;height:1.05em}
.rcpt .tot{font-weight:700;font-size:40px}
.rcpt .bar{height:70px;margin:26px auto 0;width:78%;background:repeating-linear-gradient(90deg,#211C16 0 3px,transparent 3px 6px,#211C16 6px 7px,transparent 7px 11px,#211C16 11px 15px,transparent 15px 17px)}
/* job ad */
.jad{width:880px;margin:0 auto;background:#EFE7D6;color:#1E1A15;padding:42px 48px 50px;transform:rotate(-1.4deg);box-shadow:0 30px 70px rgba(0,0,0,.5);position:relative;
  clip-path:polygon(0 1%,4% 0,9% 1.2%,15% .2%,22% 1%,30% 0,38% 1.1%,47% .3%,55% 1%,63% 0,72% 1.2%,80% .2%,88% 1%,95% 0,100% 1%,100% 99%,94% 100%,86% 98.9%,77% 100%,68% 99%,59% 100%,50% 98.8%,41% 100%,32% 99%,23% 100%,14% 98.9%,6% 100%,0 99%)}
.jad .mast{display:flex;justify-content:space-between;border-bottom:3px double #1E1A15;padding-bottom:12px;font:700 20px/1 Inter;letter-spacing:.24em;text-transform:uppercase}
.jad h3{font:800 92px/.95 Newsreader,serif;letter-spacing:-.02em;margin:26px 0 8px}
.jad .sub{font:italic 500 32px/1.3 Newsreader,serif;margin-bottom:18px}
.jad ul{list-style:none;display:flex;flex-direction:column;gap:10px;font:400 30px/1.35 Newsreader,serif;padding:0;margin:0}
.jad li::before{content:"■ ";font-size:18px;vertical-align:4px}
.jad .meta{margin-top:22px;border-top:2px solid #1E1A15;padding-top:16px;display:grid;grid-template-columns:auto 1fr;gap:6px 18px;font:400 29px/1.35 Newsreader,serif}
.jad .meta b{font:700 22px/1.6 Inter;letter-spacing:.14em;text-transform:uppercase}
/* crayon */
.cray{width:960px;margin:0 auto;background:#FFFDF6;border-radius:6px;padding:56px 58px;box-shadow:0 30px 70px rgba(0,0,0,.5);transform:rotate(1.2deg);position:relative;
  background-image:repeating-linear-gradient(180deg,transparent 0 86px,#D8E6F2 86px 88px);background-position:0 48px}
.cray .t{font:400 80px/1.1 'Gochi Hand',cursive;color:#2453A8;text-wrap:balance}
.cray .t.red{color:#C2372B}.cray .t.grn{color:#2E7D46}
.cray svg{display:block;width:100%;height:auto;margin-top:18px}
.cray svg *{fill:none;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;filter:url(#wob)}
/* sticky notes */
.stickies{display:grid;grid-template-columns:repeat(2,1fr);gap:34px;padding:10px 18px}
.stk{min-height:300px;padding:34px 30px;font:700 46px/1.15 Caveat,cursive;color:#2A2218;box-shadow:0 18px 40px rgba(0,0,0,.45);display:flex;flex-direction:column;justify-content:space-between}
.stk small{font:600 21px/1.2 Inter;letter-spacing:.14em;text-transform:uppercase;color:rgba(42,34,24,.55)}
.stk:nth-child(4n+1){background:#F6E27A;transform:rotate(-2deg)}.stk:nth-child(4n+2){background:#F3C9A5;transform:rotate(1.6deg)}
.stk:nth-child(4n+3){background:#E9D9A6;transform:rotate(1.2deg)}.stk:nth-child(4n+4){background:#F7E9B8;transform:rotate(-1.4deg)}
.stk .ln{border-bottom:3px solid rgba(42,34,24,.35);height:46px;margin-top:10px}
/* phone lock screen */
.lock{width:520px;height:1000px;border-radius:64px;border:10px solid #2A2219;background:linear-gradient(170deg,#3B2F22,#120D08 70%);position:relative;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.6);flex:none}
.lock .lt{position:absolute;top:120px;left:0;right:0;text-align:center;color:#F3EBDD}
.lock .lt .d{font:500 26px/1 Inter;opacity:.85}.lock .lt .tm{font:300 140px/1 Inter;letter-spacing:-.03em;margin-top:6px}
.lock .ns{position:absolute;left:22px;right:22px;top:390px;display:flex;flex-direction:column;gap:14px}
.lock .n{background:rgba(255,248,235,.16);backdrop-filter:blur(8px);border-radius:26px;padding:18px 20px;color:#F3EBDD;font:400 23px/1.3 Inter}
.lock .n .ap{display:flex;justify-content:space-between;font:600 17px/1 Inter;letter-spacing:.06em;text-transform:uppercase;opacity:.8;margin-bottom:8px}
.lock .n b{display:block;font:600 24px/1.25 Inter;margin-bottom:3px}
.phrow{display:flex;gap:44px;align-items:center;flex:1;min-height:0}
.phrow .side{display:flex;flex-direction:column;gap:22px}
.phrow .side p{font:400 48px/1.14 Newsreader,serif;color:var(--ink)}
.phrow .side p .acc{font-style:italic;color:var(--gold)}
`;

const shade = (pos) => `<div class="phshade ${pos}"></div>`;

export const PT = {
  photo(s) {
    return `<div class="ph"><img src="${img(s.img)}" alt=""></div>${shade(s.pos || 'bottom')}
      <div class="phtxt ${s.pos || 'bottom'}">
        ${s.kicker ? `<div class="kick rise" style="--d:.3s">${esc(s.kicker)}</div>` : ''}
        ${s.num ? `<div class="num rise" style="--d:.4s">${esc(s.num)}</div>` : ''}
        <h2 class="pt ${s.xl ? 'xl' : ''} rise fit-h" data-min="56" style="--d:.55s">${md(s.title)}</h2>
        ${s.text ? `<p class="pp rise" style="--d:.9s">${md(s.text)}</p>` : ''}
      </div>`;
  },
  poster(s) {
    const bg = s.img ? `<div class="ph"><img src="${img(s.img)}" alt=""></div><div class="phshade full"></div>` : '';
    return `${bg}<div class="pbox">
      ${s.stamp ? `<div class="stampx rise" style="--d:.2s">${esc(s.stamp)}</div>` : ''}
      ${s.kicker ? `<div class="kick rise" style="--d:.2s">${esc(s.kicker)}</div>` : ''}
      ${s.art ? `<div class="art rise" style="width:${s.artW || 520}px;--d:.1s"><svg viewBox="0 0 800 640" style="width:100%;height:auto" aria-hidden="true">${drawable(ART[s.art](s.fig || ''))}</svg></div>` : ''}
      <div class="pbig ${s.xl ? 'xl' : ''} rise fit-h" data-min="58" style="--d:.4s">${md(s.text)}</div>
      ${s.rule ? '<div class="rule"></div>' : ''}
      ${s.p ? `<div class="psmall rise" style="--d:.8s">${md(s.p)}</div>` : ''}
    </div>`;
  },
  prompts(s) {
    return `<div class="body pr">
      <div><div class="month">${esc(s.month)}</div><div class="mlab">${esc(s.label || '')}</div></div>
      <div class="thread">${s.prompts.map((q, i) => `<div class="q ${i === s.prompts.length - 1 && s.typing ? 'typing' : ''}">${md(q)}${s.times?.[i] ? `<small>${esc(s.times[i])}</small>` : ''}</div>`).join('')}
        ${s.reply ? `<div class="a"><i></i><span>${md(s.reply)}</span></div>` : ''}</div>
      ${s.say ? `<div class="say">${md(s.say)}</div>` : ''}</div>`;
  },
  receipt(s) {
    const row = (r) => {
      if (r === '-') return '<div class="dash"></div>';
      const [l, v, cls] = r;
      return `<div class="r ${cls || ''}"><span>${md(l)}</span>${v === '' ? '<span class="bl"></span>' : `<b>${md(v ?? '')}</b>`}</div>`;
    };
    return `<div class="body">${s.title ? `<h2 class="t sm fit-h" data-min="44">${md(s.title)}</h2>` : ''}
      <div class="wide"><div class="rcpt">
        <div class="c hd">${esc(s.head || 'Your business, Inc.')}</div>
        <div class="c sm">${esc(s.sub || '')}</div>
        <div class="dash"></div>${s.rows.map(row).join('')}
        ${s.foot ? `<div class="dash"></div><div class="c sm">${md(s.foot)}</div>` : ''}
        ${s.barcode !== false ? '<div class="bar"></div>' : ''}
      </div></div>${s.note ? `<div class="foot"><p>${md(s.note)}</p></div>` : ''}</div>`;
  },
  jobad(s) {
    return `<div class="body">${s.title ? `<h2 class="t sm fit-h" data-min="44">${md(s.title)}</h2>` : ''}
      <div class="wide"><div class="jad">
        <div class="mast"><span>${esc(s.mast || 'Classifieds')}</span><span>${esc(s.mastR || 'Help wanted')}</span></div>
        <h3>${md(s.head)}</h3>${s.sub ? `<div class="sub">${md(s.sub)}</div>` : ''}
        <ul>${s.items.map((x) => `<li>${md(x)}</li>`).join('')}</ul>
        <div class="meta">${(s.meta || []).map(([k, v]) => `<b>${esc(k)}</b><span>${md(v)}</span>`).join('')}</div>
      </div></div></div>`;
  },
  crayon(s) {
    const draw = s.draw ? `<svg viewBox="0 0 800 330" aria-hidden="true"><defs><filter id="wob"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter></defs>${s.draw}</svg>` : '';
    return `<div class="body">${s.title ? `<h2 class="t sm fit-h" data-min="44">${md(s.title)}</h2>` : ''}
      <div class="wide"><div class="cray">${s.lines.map((l) => `<div class="t ${l.c || ''}">${esc(l.t)}</div>`).join('')}${draw}</div></div>
      ${s.foot ? `<div class="foot"><p>${md(s.foot)}</p></div>` : ''}</div>`;
  },
  notes(s) {
    return `<div class="body">${s.title ? `<h2 class="t sm fit-h" data-min="44">${md(s.title)}</h2>` : ''}${s.text ? `<p class="p">${md(s.text)}</p>` : ''}
      <div class="wide"><div class="stickies" style="width:100%">${s.notes.map((n) => `<div class="stk"><span>${esc(n.t)}</span>${n.lines ? Array.from({ length: n.lines }, () => '<div class="ln"></div>').join('') : ''}${n.s ? `<small>${esc(n.s)}</small>` : ''}</div>`).join('')}</div></div>
      ${s.foot ? `<div class="foot"><p>${md(s.foot)}</p></div>` : ''}</div>`;
  },
  phone(s) {
    return `<div class="body">${s.title ? `<h2 class="t sm fit-h" data-min="44">${md(s.title)}</h2>` : ''}
      <div class="phrow"><div class="lock"><div class="lt"><div class="d">${esc(s.day)}</div><div class="tm">${esc(s.time)}</div></div>
        <div class="ns">${s.notifs.map((n) => `<div class="n"><div class="ap"><span>${esc(n.app)}</span><span>${esc(n.ago || 'now')}</span></div><b>${esc(n.from)}</b>${esc(n.text)}</div>`).join('')}</div></div>
        <div class="side">${(s.side || []).map((p) => `<p>${md(p)}</p>`).join('')}</div></div></div>`;
  },
};

// The child's drawing: a house, a sun, a stick figure looking at a phone.
export const DRAWINGS = {
  phoneParent: `<path d="M60 300 H740" stroke="#3E8E4F"/>
    <path d="M90 300 V170 L190 100 L290 170 V300 Z" stroke="#C2372B"/><path d="M165 300 V235 H215 V300" stroke="#8A5A2B"/>
    <circle cx="690" cy="70" r="40" stroke="#E8A317"/><path d="M690 10 V0 M750 70 H760 M732 28 L740 20 M648 28 L640 20" stroke="#E8A317"/>
    <circle cx="470" cy="120" r="30" stroke="#2453A8"/><path d="M470 150 V230 M470 230 L440 295 M470 230 L500 295 M470 170 L425 205 M470 170 L515 150" stroke="#2453A8"/>
    <rect x="512" y="122" width="26" height="40" rx="5" stroke="#222"/>
    <circle cx="610" cy="200" r="20" stroke="#C2372B"/><path d="M610 220 V265 M610 265 L590 300 M610 265 L630 300 M610 235 L585 250 M610 235 L640 215" stroke="#C2372B"/>
    <path d="M645 205 C660 190 670 186 680 190" stroke="#C2372B"/>`,
};
