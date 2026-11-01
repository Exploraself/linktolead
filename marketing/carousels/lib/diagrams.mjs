// Diagrams for slides 4 and 5: every number on them is either the
// founder's own (a blank) or arithmetic anyone can redo by hand.
import { md, esc } from './markup.mjs';

export const DIAGRAM_CSS = `
.dg{width:100%}
/* equation */
.eq{display:flex;flex-direction:column;gap:22px}
.eq .r{display:flex;align-items:center;gap:14px}
.eq .tm{flex:1;min-width:0;text-align:center;padding:30px 10px;border:2px solid var(--line);border-radius:18px;background:var(--card);font:600 50px/1.1 Newsreader,serif;color:var(--ink)}
.eq .tm small{display:block;font:600 20px/1 Inter;letter-spacing:.16em;text-transform:uppercase;color:var(--mute);margin-top:10px}
.eq .op{flex:none;font:400 60px/1 Newsreader,serif;color:var(--gold);width:40px;text-align:center}
.eq .r.hl .tm{border-color:var(--gold);background:rgba(226,184,101,.12)}
.eq .r.hl .tm:last-child{background:var(--gold);color:#1A130A}
.eq .r.dim{opacity:.55}
.eq .r.head .tm{border:none;background:none;font:700 22px/1 Inter;letter-spacing:.16em;text-transform:uppercase;color:var(--mute);padding:0}
/* bars */
.bars{display:flex;flex-direction:column;gap:34px}
.bar .lb{display:flex;justify-content:space-between;align-items:baseline;gap:20px;font:500 33px/1.2 Inter;color:var(--ink);margin-bottom:12px}
.bar .lb b{font:700 38px/1 Inter;color:var(--ink);white-space:nowrap}
.bar .tr{height:60px;border-radius:10px;background:#231B12;overflow:hidden}
.bar .fl{height:100%;border-radius:10px;background:#6B5A3E;transform-origin:left;animation:grow 1.2s cubic-bezier(.3,.7,.2,1) both;animation-delay:calc(var(--k) * 180ms + .3s)}
.bar.hl .fl{background:var(--foil)}
.bar.hl .lb b{color:var(--gold)}
.bar .nt{font:400 24px/1.3 Inter;color:var(--mute);margin-top:8px}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
/* columns */
.cols{display:flex;align-items:flex-end;gap:26px;height:620px;padding-top:60px}
.col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:14px}
.col b{font:700 34px/1 Inter;color:var(--ink)}
.col .cb{width:100%;border-radius:12px 12px 4px 4px;background:#6B5A3E;transform-origin:bottom;animation:growy 1.2s cubic-bezier(.3,.7,.2,1) both;animation-delay:calc(var(--k) * 150ms + .3s)}
.col.hl .cb{background:var(--foil)}.col.hl b{color:var(--gold)}
.col span{font:500 24px/1.25 Inter;color:var(--soft);text-align:center;min-height:60px}
@keyframes growy{from{transform:scaleY(0)}to{transform:scaleY(1)}}
/* curve */
.curve svg{width:100%;height:auto;overflow:visible}
.curve .ax{stroke:#3A2E1F;stroke-width:2}
.curve .gl{stroke:#2A2016;stroke-width:1.5}
.curve .ln{fill:none;stroke:#7A684A;stroke-width:5;stroke-linecap:round;stroke-dasharray:1;animation:draw 1.8s ease both;animation-delay:.3s}
.curve .ln.hl{stroke:var(--gold);stroke-width:8}
.curve text{font:500 24px Inter;fill:var(--soft)}
.curve text.v{font:700 34px Inter;fill:var(--ink)}.curve text.v.hl{fill:var(--gold)}
.curve .dot{fill:var(--gold)}
/* dots */
.dots{display:flex;flex-direction:column;gap:30px}
.dots .grid{display:grid;gap:9px}
.dots .grid i{display:block;aspect-ratio:1;border-radius:50%;background:#2A2118}
.dots .lg{display:flex;flex-wrap:wrap;gap:18px 36px;font:500 31px/1.2 Inter;color:var(--soft)}
.dots .lg span{display:flex;align-items:center;gap:12px}.dots .lg i{width:24px;height:24px;border-radius:50%;display:block}
.dots .lg b{color:var(--ink)}
/* matrix */
.mx{display:grid;grid-template-columns:60px 1fr 1fr;grid-template-rows:1fr 1fr 60px;gap:16px;height:700px}
.mx .c{border:2px solid var(--line);border-radius:18px;background:var(--card);padding:26px;display:flex;flex-direction:column;justify-content:flex-end;gap:10px}
.mx .c h4{font:600 44px/1.05 Newsreader,serif;color:var(--ink)}.mx .c p{font:400 28px/1.35 Inter;color:var(--soft)}
.mx .c.hl{border-color:var(--gold);background:var(--gold)}.mx .c.hl h4,.mx .c.hl p{color:#1A130A}
.mx .yl{grid-row:1/3;writing-mode:vertical-rl;transform:rotate(180deg);display:flex;justify-content:space-between;font:600 21px/1 Inter;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
.mx .xl{grid-column:2/4;display:flex;justify-content:space-between;align-items:center;font:600 21px/1 Inter;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
/* flow */
.flow{display:flex;flex-direction:column;gap:0}
.flow .fs{display:grid;grid-template-columns:76px 1fr;gap:26px;align-items:center;padding:22px 26px;border:2px solid var(--line);border-radius:18px;background:var(--card)}
.flow .fs.hl{border-color:var(--gold)}
.flow .fs .n{width:76px;height:76px;border-radius:50%;border:2.5px solid var(--gold);display:grid;place-items:center;font:700 34px/1 Newsreader,serif;color:var(--gold)}
.flow .fs.hl .n{background:var(--gold);color:#1A130A}
.flow .fs h4{font:600 48px/1.05 Newsreader,serif;color:var(--ink)}.flow .fs p{font:400 30px/1.35 Inter;color:var(--soft);margin-top:6px}
.flow .ar{height:44px;display:grid;place-items:center;color:var(--gold);font:400 34px/1 Inter}
.flow .loop{margin-top:18px;text-align:center;font:600 22px/1 Inter;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
/* tiles */
.tiles{display:flex;flex-direction:column;gap:22px}
.tiles .lbl{font:500 26px/1.2 Inter;color:var(--soft);text-align:center}
.tiles .tg{display:grid;gap:22px}
.tiles .tl{display:flex;flex-direction:column;align-items:center;gap:12px}
.tiles .tb{width:100%;aspect-ratio:1/1.1;border-radius:16px;background:var(--gold);display:grid;place-items:center;font:800 76px/1 Newsreader,serif;color:#1A130A;padding:6px;text-align:center}
.tiles .tl.dim .tb{background:#2A2118;color:var(--soft)}
.tiles .tl span{font:500 23px/1.25 Inter;color:var(--soft);text-align:center}
/* split */
.split{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.split .sc{border:2px solid var(--line);border-radius:22px;background:var(--card);padding:38px 30px;display:flex;flex-direction:column;gap:28px}
.split .sc.hl{border-color:var(--gold)}
.split h4{font:700 25px/1.2 Inter;letter-spacing:.16em;text-transform:uppercase;color:var(--mute)}.split .sc.hl h4{color:var(--gold)}
.split ul{display:flex;flex-direction:column;gap:22px}.split li{list-style:none;display:grid;grid-template-columns:36px 1fr;gap:14px;font:400 34px/1.3 Inter;color:var(--soft)}
.split .sc.hl li{color:var(--ink)}
.split li::before{content:"✕";font:700 26px/1.3 Inter;color:#7A684A}
.split .sc.hl li::before{content:"✓";color:var(--gold)}
/* timeline */
.tline{display:flex;flex-direction:column;gap:0;border-left:3px solid var(--line);margin-left:20px}
.tline .ti{position:relative;padding:0 0 38px 52px}
.tline .ti::before{content:"";position:absolute;left:-13px;top:14px;width:22px;height:22px;border-radius:50%;background:var(--bg);border:3px solid var(--gold)}
.tline .ti.hl::before{background:var(--gold)}
.tline .y{font:700 58px/1 Newsreader,serif;color:var(--gold)}
.tline .tx{font:400 34px/1.38 Inter;color:var(--soft);margin-top:10px}.tline .tx b{color:var(--ink);font-weight:600}
/* stack */
.stack{display:flex;flex-direction:column-reverse;gap:14px}
.stack .sb{padding:24px 30px;border-radius:14px;border:2px solid var(--line);background:var(--card);display:flex;justify-content:space-between;align-items:center;gap:20px}
.stack .sb h4{font:600 42px/1.1 Newsreader,serif;color:var(--ink)}.stack .sb span{font:500 24px/1.3 Inter;color:var(--mute);text-align:right}
.stack .sb.hl{background:var(--gold);border-color:var(--gold)}.stack .sb.hl h4,.stack .sb.hl span{color:#1A130A}
/* big number */
.bigv{display:flex;flex-direction:column;align-items:center;gap:22px;text-align:center}
.bigv .v{font:800 250px/.9 Newsreader,serif;letter-spacing:-.03em;background:var(--foil);-webkit-background-clip:text;background-clip:text;color:transparent;white-space:nowrap}
.bigv .l{font:600 44px/1.15 Newsreader,serif;color:var(--ink);max-width:880px}
.bigv .n{font:400 30px/1.4 Inter;color:var(--soft);max-width:860px}
/* compare */
.cmp{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.cmp .cc{border:2px solid var(--line);border-radius:22px;background:var(--card);padding:40px 26px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px}
.cmp .cc.hl{border-color:var(--gold);background:rgba(226,184,101,.1)}
.cmp .k{font:700 22px/1.2 Inter;letter-spacing:.16em;text-transform:uppercase;color:var(--mute)}
.cmp .v{font:800 120px/1 Newsreader,serif;color:var(--soft);white-space:nowrap}
.cmp .cc.hl .v{background:var(--foil);-webkit-background-clip:text;background-clip:text;color:transparent}
.cmp .l{font:400 31px/1.35 Inter;color:var(--soft)}
.cmp .note{grid-column:1/3;text-align:center;font:400 28px/1.4 Inter;color:var(--mute)}
`;

const D = {
  equation: (d) => `<div class="dg eq">${d.rows.map((r, i) => {
    const cls = d.head === i ? 'head' : (d.hl || []).includes(i) ? 'hl' : (d.dim || []).includes(i) ? 'dim' : '';
    return `<div class="r ${cls}">${r.map((t) => (['×', '=', '+', '−', '÷', '→'].includes(t) ? `<span class="op">${t}</span>` : `<span class="tm">${md(t)}</span>`)).join('')}</div>`;
  }).join('')}</div>`,
  bars: (d) => {
    const max = d.max ?? Math.max(...d.items.map((x) => x.value));
    return `<div class="dg bars">${d.items.map((x, k) => `<div class="bar ${x.hl ? 'hl' : ''}">
      <div class="lb"><span>${md(x.label)}</span><b>${esc(x.display ?? x.value)}</b></div>
      <div class="tr"><div class="fl" style="--k:${k};width:${Math.max(1.5, (100 * x.value) / max)}%"></div></div>${x.note ? `<div class="nt">${md(x.note)}</div>` : ''}</div>`).join('')}</div>`;
  },
  columns: (d) => {
    const max = d.max ?? Math.max(...d.items.map((x) => x.value));
    return `<div class="dg cols">${d.items.map((x, k) => `<div class="col ${x.hl ? 'hl' : ''}"><b>${esc(x.display ?? x.value)}</b>
      <div class="cb" style="--k:${k};height:${Math.max(1.5, (78 * x.value) / max)}%"></div><span>${md(x.label)}</span></div>`).join('')}</div>`;
  },
  curve: (d) => {
    const Wd = 900, Hd = 560, pl = 20, pr = 150, pt = 40, pb = 70;
    const all = d.series.flatMap((s) => s.points);
    const xmin = Math.min(...all.map((p) => p[0])), xmax = Math.max(...all.map((p) => p[0]));
    const ymin = d.ymin ?? Math.min(0, ...all.map((p) => p[1])), ymax = d.ymax ?? Math.max(...all.map((p) => p[1]));
    const X = (x) => pl + ((x - xmin) / (xmax - xmin || 1)) * (Wd - pl - pr), Y = (y) => pt + (1 - (y - ymin) / (ymax - ymin || 1)) * (Hd - pt - pb);
    const grid = (d.grid || []).map((g) => `<line class="gl" x1="${pl}" x2="${Wd - pr}" y1="${Y(g)}" y2="${Y(g)}"/><text x="${Wd - pr + 14}" y="${Y(g) + 8}" style="font-size:20px;fill:#7A6E5A">${g}</text>`).join('');
    const lines = d.series.map((s) => {
      const pts = s.points.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ');
      const [lx, ly] = s.points[s.points.length - 1];
      return `<polyline class="ln ${s.hl ? 'hl' : ''}" pathLength="1" points="${pts}"/><circle class="dot" cx="${X(lx)}" cy="${Y(ly)}" r="${s.hl ? 10 : 7}" ${s.hl ? '' : 'style="fill:#7A684A"'}/>
        <text class="v ${s.hl ? 'hl' : ''}" x="${X(lx) + 18}" y="${Y(ly) - 4}">${esc(s.end ?? ly)}</text><text x="${X(lx) + 18}" y="${Y(ly) + 26}">${esc(s.label)}</text>`;
    }).join('');
    const xl = (d.xLabels || []).map(([x, l]) => `<text x="${X(x)}" y="${Hd - 22}" text-anchor="middle">${esc(l)}</text>`).join('');
    return `<div class="dg curve"><svg viewBox="0 0 ${Wd} ${Hd}" aria-hidden="true"><line class="ax" x1="${pl}" x2="${Wd - pr}" y1="${Hd - pb}" y2="${Hd - pb}"/>${grid}${lines}${xl}</svg></div>`;
  },
  dots: (d) => {
    const cols = d.cols || 14, tones = { gold: 'var(--gold)', dim: '#3A2E1F', soft: '#7A684A', ink: '#F3EBDD', paper: '#CFC3AE' };
    const cells = []; d.groups.forEach((g) => { for (let i = 0; i < g.n; i++) cells.push(tones[g.tone] || g.tone); });
    while (cells.length < d.total) cells.push('#2A2118');
    return `<div class="dg dots"><div class="grid" style="grid-template-columns:repeat(${cols},1fr)">${cells.map((c) => `<i style="background:${c}"></i>`).join('')}</div>
      <div class="lg">${d.groups.map((g) => `<span><i style="background:${tones[g.tone] || g.tone}"></i><b>${g.n}</b> ${md(g.label)}</span>`).join('')}${d.rest ? `<span><i style="background:#2A2118;border:1px solid #3A2E1F"></i><b>${d.total - d.groups.reduce((a, g) => a + g.n, 0)}</b> ${md(d.rest)}</span>` : ''}</div></div>`;
  },
  matrix: (d) => {
    const [hr, hc] = d.hl || [-1, -1];
    const cell = (r, c) => { const q = d.q[r][c]; const [h, p] = Array.isArray(q) ? q : [q]; return `<div class="c ${r === hr && c === hc ? 'hl' : ''}"><h4>${md(h)}</h4>${p ? `<p>${md(p)}</p>` : ''}</div>`; };
    return `<div class="dg mx"><div class="yl"><span>${esc(d.y[0])}</span><span>${esc(d.y[1])} →</span></div>${cell(0, 0)}${cell(0, 1)}${cell(1, 0)}${cell(1, 1)}<span></span><div class="xl"><span>${esc(d.x[0])}</span><span>${esc(d.x[1])} →</span></div></div>`;
  },
  flow: (d) => `<div class="dg flow">${d.steps.map((s, i) => `${i ? '<div class="ar">↓</div>' : ''}<div class="fs ${(d.hl || []).includes(i) ? 'hl' : ''}"><span class="n">${esc(s.n ?? i + 1)}</span><div><h4>${md(s.h)}</h4>${s.p ? `<p>${md(s.p)}</p>` : ''}</div></div>`).join('')}${d.loop ? `<div class="loop">↺ ${esc(d.loop)}</div>` : ''}</div>`,
  tiles: (d) => `<div class="dg tiles">${d.label ? `<div class="lbl">${md(d.label)}</div>` : ''}<div class="tg" style="grid-template-columns:repeat(${d.cols || 5},1fr)">${d.tiles.map((t) => `<div class="tl ${t.dim ? 'dim' : ''}"><div class="tb">${esc(t.big)}</div>${t.small ? `<span>${md(t.small)}</span>` : ''}</div>`).join('')}</div>${d.after ? `<div class="lbl">${md(d.after)}</div>` : ''}</div>`,
  split: (d) => `<div class="dg split">${[d.left, d.right].map((c, i) => `<div class="sc ${i ? 'hl' : ''}"><h4>${esc(c.h)}</h4><ul>${c.items.map((x) => `<li><span>${md(x)}</span></li>`).join('')}</ul></div>`).join('')}</div>`,
  timeline: (d) => `<div class="dg tline">${d.items.map((x) => `<div class="ti ${x.hl ? 'hl' : ''}"><div class="y">${esc(x.y)}</div><div class="tx">${md(x.t)}</div></div>`).join('')}</div>`,
  stack: (d) => `<div class="dg stack">${d.items.map((x, i) => { const [h, s] = Array.isArray(x) ? x : [x]; return `<div class="sb ${i === d.items.length - 1 && d.top !== false ? 'hl' : ''}" style="margin-right:${(d.items.length - 1 - i) * 26}px"><h4>${md(h)}</h4>${s ? `<span>${md(s)}</span>` : ''}</div>`; }).join('')}</div>`,
  big: (d) => `<div class="dg bigv"><div class="v fit" data-min="110">${esc(d.value)}</div><div class="l">${md(d.label)}</div>${d.note ? `<div class="n">${md(d.note)}</div>` : ''}</div>`,
  compare: (d) => `<div class="dg cmp">${d.items.map((x) => `<div class="cc ${x.hl ? 'hl' : ''}"><div class="k">${esc(x.k)}</div><div class="v fit" data-min="60">${esc(x.v)}</div><div class="l">${md(x.l)}</div></div>`).join('')}${d.note ? `<div class="note">${md(d.note)}</div>` : ''}</div>`,
};

export function diagram(d) {
  const f = D[d?.kind];
  if (!f) throw new Error(`unknown diagram "${d?.kind}"`);
  return f(d);
}
export const diagramKinds = Object.keys(D);
