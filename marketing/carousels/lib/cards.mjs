// The "example" objects on slides 2 and 3: real things a founder opens
// (a calendar, a message, an invoice, a note), drawn as paper on the
// dark page. Every name and number on them is an illustration, never a
// claim about a real person.
import { md, esc, drawable } from './markup.mjs';
import { ART } from './art.mjs';

export const CARD_CSS = `
.cd{width:100%}
.cd .hd{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:26px 30px 18px;border-bottom:2px solid var(--pline)}
.cd .hd b{font:700 33px/1.1 Inter;color:var(--pink)}.cd .hd span{font:500 24px/1.1 Inter;color:var(--pmute)}
/* calendar */
.cal .days{display:grid;grid-template-columns:50px repeat(var(--n),1fr);padding:14px 18px 0;font:700 19px/1 Inter;letter-spacing:.1em;text-transform:uppercase;color:var(--pmute);text-align:center}
.cal .gridc{position:relative;margin:10px 18px 22px 68px;height:var(--h);border-top:1px solid var(--pline)}
.cal .hr{position:absolute;left:-50px;right:0;border-top:1px solid var(--pline);font:500 16px/1 Inter;color:var(--pmute)}
.cal .hr span{position:absolute;left:0;top:4px}
.cal .ev{position:absolute;border-radius:10px;padding:8px 10px;font:600 18px/1.2 Inter;background:#E6DCC9;color:var(--pink);overflow:hidden}
.cal .ev.hl{background:#D9A441;color:#1A130A}.cal.one .ev{font:600 22px/1.15 Inter;padding:4px 16px;display:flex;align-items:center}.cal.one .hr{font-size:18px}.cal .ev.dk{background:var(--pink);color:var(--paper)}
/* chat */
.msg{padding:24px 26px 30px;display:flex;flex-direction:column;gap:16px}
.msg .m{max-width:86%;padding:20px 24px;border-radius:24px;font:400 31px/1.36 Inter}
.msg .m.them{align-self:flex-start;background:#E6DCC9;color:var(--pink);border-bottom-left-radius:6px}
.msg .m.me{align-self:flex-end;background:#D9A441;color:#1A130A;border-bottom-right-radius:6px}
.msg .m small{display:block;font:500 17px/1 Inter;opacity:.65;margin-top:8px;text-align:right}
.msg .typing{align-self:flex-start;font:500 24px/1.3 Inter;color:var(--pmute);letter-spacing:.06em}
/* doc */
.doc .rows{padding:12px 30px 10px}
.doc .rw{display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-bottom:1px dashed var(--pline);font:400 30px/1.3 Inter;color:var(--pink)}
.doc .rw b{font-weight:700}
.doc .rw.tot{border-bottom:none;font-weight:700;font-size:34px}
.doc .stamp{margin:4px 30px 30px auto;width:max-content;transform:rotate(-6deg);border:4px solid var(--pgold);color:var(--pgold);border-radius:10px;padding:10px 20px;font:800 30px/1 Inter;letter-spacing:.12em;text-transform:uppercase}
/* note */
.nt{padding:40px 40px 44px;background:repeating-linear-gradient(180deg,transparent 0 59px,var(--pline) 59px 61px);background-position:0 30px}
.nt p{font:400 44px/64px Newsreader,serif;font-style:italic;color:var(--pink)}
.nt .sg{font:600 22px/1 Inter;letter-spacing:.14em;text-transform:uppercase;color:var(--pmute);margin-top:22px}
/* list and form */
.lst{padding:10px 30px 26px}
.lst .it{display:grid;grid-template-columns:42px 1fr auto;gap:18px;align-items:center;padding:18px 0;border-bottom:1px solid var(--pline);font:400 31px/1.3 Inter;color:var(--pink)}
.lst .it:last-child{border-bottom:none}
.lst .bx{width:38px;height:38px;border:3px solid var(--pmute);border-radius:8px;display:grid;place-items:center;font:800 22px/1 Inter;color:var(--pgold)}
.lst .it.done .bx{border-color:var(--pgold);background:rgba(217,164,65,.18)}
.lst .it.done .tx{text-decoration:line-through;text-decoration-color:rgba(28,23,18,.35);color:var(--pmute)}
.lst .it b{font:700 26px/1 Inter;color:var(--pink)}
.lst .it .bl{display:inline-block;width:120px;border-bottom:3px solid var(--pgold);height:28px}
/* quote */
.qt{padding:46px 44px;background:var(--card);border:2px solid var(--line);border-radius:22px}
.qt .qm{font:800 150px/.6 Newsreader,serif;color:var(--gold);height:70px}
.qt p{font:500 48px/1.25 Newsreader,serif;font-style:italic;color:var(--ink)}
.qt .sg{font:600 22px/1 Inter;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);margin-top:26px}
/* framed drawing */
.fr{background:var(--card);border:2px solid var(--line);border-radius:22px;padding:24px}
.fr svg{width:100%;height:auto;display:block}
.fr .cap{font:600 20px/1.3 Inter;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);text-align:center;margin-top:8px}
/* receipt of hours */
.rc .big{padding:24px 30px 6px;font:800 92px/1 Newsreader,serif;color:var(--pink)}
.rc .big small{font:600 24px/1.2 Inter;color:var(--pmute);display:block;margin-top:8px}
`;

const C = {
  calendar: (c) => {
    const [h0, h1] = c.hours || [8, 18], n = (c.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).length, per = c.rowH || 44, h = (h1 - h0) * per;
    const hrs = Array.from({ length: h1 - h0 + 1 }, (_, i) => `<div class="hr" style="top:${i * per}px"><span>${String(h0 + i).padStart(2, '0')}</span></div>`).join('');
    const ev = (c.blocks || []).map((b) => `<div class="ev ${b.hl ? 'hl' : ''} ${b.dark ? 'dk' : ''}" style="left:calc(${(100 * b.d) / n}% + 3px);width:calc(${(100 * (b.span || 1)) / n}% - 6px);top:${(b.from - h0) * per + 2}px;height:${(b.to - b.from) * per - 4}px">${esc(b.label)}</div>`).join('');
    return `<div class="paper cd cal ${n === 1 ? 'one' : ''}" style="--n:${n};--h:${h}px"><div class="hd"><b>${esc(c.head || 'Last week')}</b><span>${esc(c.meta || '')}</span></div>
      <div class="days"><span></span>${(c.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map((d) => `<span>${esc(d)}</span>`).join('')}</div><div class="gridc">${hrs}${ev}</div></div>`;
  },
  chat: (c) => `<div class="paper cd"><div class="hd"><b>${esc(c.head || 'Messages')}</b><span>${esc(c.meta || '')}</span></div><div class="msg">${c.msgs.map((m) => m.typing ? `<div class="typing">${esc(m.text || 'typing…')}</div>` : `<div class="m ${m.me ? 'me' : 'them'}">${md(m.text)}${m.at ? `<small>${esc(m.at)}</small>` : ''}</div>`).join('')}</div></div>`,
  doc: (c) => `<div class="paper cd doc"><div class="hd"><b>${esc(c.head)}</b><span>${esc(c.meta || '')}</span></div><div class="rows">${c.rows.map((r) => `<div class="rw ${r[2] === 'total' ? 'tot' : ''}"><span>${md(r[0])}</span><b>${md(r[1] ?? '')}</b></div>`).join('')}</div>${c.stamp ? `<div class="stamp">${esc(c.stamp)}</div>` : ''}</div>`,
  note: (c) => `<div class="paper cd nt"><p>${md(c.text)}</p>${c.sign ? `<div class="sg">${esc(c.sign)}</div>` : ''}</div>`,
  list: (c) => `<div class="paper cd"><div class="hd"><b>${esc(c.head)}</b><span>${esc(c.meta || '')}</span></div><div class="lst">${c.items.map((it) => {
    const o = typeof it === 'string' ? { t: it } : it;
    return `<div class="it ${o.done ? 'done' : ''}"><span class="bx">${o.done ? '✓' : ''}</span><span class="tx">${md(o.t)}</span>${o.v != null ? (o.v === '' ? '<span class="bl"></span>' : `<b>${esc(o.v)}</b>`) : '<span></span>'}</div>`;
  }).join('')}</div></div>`,
  quote: (c) => `<div class="cd qt"><div class="qm">“</div><p>${md(c.text)}</p><div class="sg">— ${esc(c.who || 'Alexandru Cojocari')}</div></div>`,
  art: (c) => `<div class="cd fr art"><svg viewBox="0 0 800 640" aria-hidden="true">${drawable(ART[c.art](c.fig))}</svg>${c.caption ? `<div class="cap">${esc(c.caption)}</div>` : ''}</div>`,
  receipt: (c) => `<div class="paper cd rc"><div class="hd"><b>${esc(c.head)}</b><span>${esc(c.meta || '')}</span></div><div class="big">${esc(c.value)}<small>${esc(c.unit || '')}</small></div><div class="lst">${(c.rows || []).map((r) => `<div class="it"><span class="bx"></span><span class="tx">${md(r[0])}</span><b>${esc(r[1] ?? '')}</b></div>`).join('')}</div></div>`,
};

export function card(c) {
  const f = C[c?.kind];
  if (!f) throw new Error(`unknown card "${c?.kind}"`);
  return f(c);
}
export const cardKinds = Object.keys(C);
