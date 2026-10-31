/* The North Star Action Plan as a real PDF (31 Oct 2026), written in the
 * browser with no library: A4 pages, the standard PDF fonts (Helvetica and
 * Times, nothing to download), the ExploraSelf logo as a JPEG, gold rules.
 *
 *   makePlanPDF(plan) -> Blob ('application/pdf')
 *
 * plan = { name, date, logo (JPEG data: URL or ''), recap: [[label, value]],
 *   title, subtitle, intro, actions: [{ domain, title, why, lines: [..],
 *   done, start }], closing: { title, lines: [..], url, mentor } }
 *
 * Text is set in WinAnsi; curly quotes, dashes and the middle dot are kept,
 * anything outside it is replaced. Line breaks are measured with the fonts'
 * own character widths, so nothing runs off the page. */

const W = 595.28, H = 841.89, M = 54, CW = W - 2 * M;
const GOLD = [0.706, 0.592, 0.373], INK = [0.07, 0.11, 0.18], SOFT = [0.35, 0.40, 0.50], NAVY = [0.055, 0.11, 0.17], CREAM = [0.984, 0.965, 0.925];

// Helvetica widths (1/1000 em) for ASCII 32–126.
const HV = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const FONTS = { H: 'Helvetica', HB: 'Helvetica-Bold', T: 'Times-Roman', TI: 'Times-Italic' };
const SCALE = { H: 1, HB: 1.07, T: 0.9, TI: 0.88 };
const WIN = { '’': 0x92, '‘': 0x91, '“': 0x93, '”': 0x94, '–': 0x96, '—': 0x97, '·': 0xB7, '…': 0x85, '€': 0x80, '•': 0x95 };
function win(s) {
  let out = '';
  for (const ch of String(s ?? '').replace(/→/g, '->').replace(/←/g, '<-')) {
    const c = ch.codePointAt(0);
    if (WIN[ch]) out += String.fromCharCode(WIN[ch]);
    else if (c >= 32 && c <= 126) out += ch;
    else if (c >= 160 && c <= 255) out += ch;
    else out += '?';
  }
  return out;
}
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
function width(s, size, f) {
  let w = 0;
  for (const ch of s) { const c = ch.charCodeAt(0); w += c >= 32 && c <= 126 ? HV[c - 32] : 556; }
  return w / 1000 * size * SCALE[f];
}
function wrap(text, size, f, max) {
  const out = [];
  for (const para of win(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (width(t, size, f) <= max || !line) line = t; else { out.push(line); line = word; }
    }
    out.push(line);
  }
  return out;
}

class Doc {
  constructor() { this.pages = []; this.newPage(); }
  newPage() { this.ops = []; this.pages.push(this.ops); this.y = H - M; }
  need(h) { if (this.y - h < M + 20) { this.footer(); this.newPage(); } }
  color(c, stroke) { this.ops.push(`${c.map((v) => v.toFixed(3)).join(' ')} ${stroke ? 'RG' : 'rg'}`); }
  text(x, y, s, size, f = 'H', c = INK) { this.color(c); this.ops.push(`BT /${f} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${esc(s)}) Tj ET`); }
  rect(x, y, w, h, c, fill = true, lw = 1) { this.color(c, !fill); if (!fill) this.ops.push(`${lw} w`); this.ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill ? 'f' : 'S'}`); }
  line(x1, y1, x2, y2, c = GOLD, lw = 1) { this.color(c, true); this.ops.push(`${lw} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`); }
  image(x, y, w, h) { this.ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Logo Do Q`); }
  /** A wrapped paragraph from the cursor down. */
  para(s, { size = 11, f = 'H', c = INK, x = M, w = CW, lead = 1.45, after = 6 } = {}) {
    const lines = wrap(s, size, f, w);
    for (const l of lines) { this.need(size * lead); this.y -= size * lead; this.text(x, this.y + size * 0.25, l, size, f, c); }
    this.y -= after;
  }
  footer() {
    const n = this.pages.length;
    this.line(M, M - 4, W - M, M - 4, GOLD, 0.6);
    this.text(M, M - 18, win(this.foot || ''), 8.5, 'H', SOFT);
    this.text(W - M - 40, M - 18, win(`Page ${n}`), 8.5, 'H', SOFT);
  }
}

/** The logo data: URL -> raw JPEG bytes and its size. */
async function jpeg(dataUrl) {
  if (!dataUrl) return null;
  const img = new Image();
  await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = dataUrl; });
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d'); g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0);
  const b64 = c.toDataURL('image/jpeg', 0.92).split(',')[1], bin = atob(b64);
  return { bytes: bin, w: c.width, h: c.height };
}

export async function makePlanPDF(plan) {
  const d = new Doc();
  d.foot = `${plan.name ? plan.name + ' · ' : ''}The Leader’s North Star Action Plan · ExploraSelf · ${plan.date}`;
  const logo = await jpeg(plan.logo).catch(() => null);

  // ── Cover block ──
  if (logo) d.image(M, H - M - 40, 40, 40 * logo.h / logo.w);
  d.text(M + (logo ? 52 : 0), H - M - 16, 'EXPLORASELF', 11, 'HB', NAVY);
  d.text(M + (logo ? 52 : 0), H - M - 31, win(`The Leader’s North Star · ${plan.date}`), 9.5, 'H', SOFT);
  d.y = H - M - 70;
  d.para(plan.title, { size: 28, f: 'T', c: NAVY, lead: 1.15, after: 2 });
  d.para(plan.subtitle, { size: 14, f: 'TI', c: GOLD, lead: 1.3, after: 10 });
  d.line(M, d.y, W - M, d.y, GOLD, 1.2); d.y -= 14;
  // Recap, two columns.
  const half = (CW - 16) / 2, rows = plan.recap;
  const startY = d.y;
  let colY = [startY, startY];
  rows.forEach(([k, v], i) => {
    const col = i % 2, x = M + col * (half + 16);
    let y = colY[col];
    d.text(x, y - 9, win(k.toUpperCase()), 7.5, 'HB', SOFT);
    const lines = wrap(v, 12, 'T', half);
    lines.forEach((l, j) => d.text(x, y - 24 - j * 15, l, 12, 'T', INK));
    colY[col] = y - 30 - (lines.length - 1) * 15 - 8;
  });
  d.y = Math.min(...colY) - 6;
  // Intro.
  d.para(plan.intro, { size: 11.5, f: 'T', c: INK, lead: 1.45, after: 14 });

  // ── The five actions ──
  plan.actions.forEach((a, i) => {
    const est = 120 + a.lines.length * 30;
    d.need(Math.min(est, 360));
    // Number and title band.
    d.rect(M, d.y - 30, 30, 30, GOLD);
    d.text(M + 10.5, d.y - 21, String(i + 1), 15, 'HB', [1, 1, 1]);
    d.text(M + 42, d.y - 11, win(a.domain.toUpperCase() + (a.start ? '  ·  START HERE' : '')), 8, 'HB', a.start ? [0.71, 0.32, 0.18] : SOFT);
    d.text(M + 42, d.y - 27, win(a.title), 16, 'T', NAVY);
    d.y -= 40;
    d.para(a.why, { size: 10.5, f: 'TI', c: SOFT, x: M + 42, w: CW - 42, after: 6 });
    // The fill-in lines, on a soft ground.
    const lines = a.lines.flatMap((l) => wrap(l, 11, 'H', CW - 42 - 20).map((t, j) => ({ t, gap: j === 0 })));
    const boxH = lines.length * 22 + 14;
    d.need(boxH + 30);
    d.rect(M + 42, d.y - boxH, CW - 42, boxH, CREAM);
    let y = d.y - 10;
    lines.forEach(({ t, gap }) => { y -= 22; if (gap && y < d.y - 30) y -= 0; d.text(M + 52, y + 6, t, 11, 'H', INK); });
    d.y -= boxH + 8;
    d.para(`Done when: ${a.done}`, { size: 10, f: 'HB', c: GOLD, x: M + 42, w: CW - 42, after: 18 });
  });

  // ── The road ahead ──
  d.need(220);
  d.line(M, d.y, W - M, d.y, GOLD, 1.2); d.y -= 10;
  d.para(plan.closing.title, { size: 20, f: 'T', c: NAVY, lead: 1.25, after: 8 });
  plan.closing.lines.forEach((l) => d.para(l, { size: 11.5, f: 'T', c: INK, after: 6 }));
  d.need(80);
  d.y -= 6;
  d.rect(M, d.y - 62, CW, 62, NAVY);
  d.text(M + 18, d.y - 24, win('START TONIGHT, AT NO COST'), 8.5, 'HB', GOLD);
  d.text(M + 18, d.y - 46, win(plan.closing.url), 18, 'HB', [1, 1, 1]);
  d.y -= 78;
  d.para(plan.closing.mentor, { size: 10, f: 'H', c: SOFT });
  d.footer();

  // ── Assemble the file ──
  const objs = [];
  const add = (s) => { objs.push(s); return objs.length; };
  const fontIds = Object.fromEntries(Object.entries(FONTS).map(([k, name]) => [k, add(`<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`)]));
  const logoId = logo ? add({ img: logo }) : 0;
  const pagesId = add(null), pageIds = [];
  const res = `<< /Font << ${Object.entries(fontIds).map(([k, id]) => `/${k} ${id} 0 R`).join(' ')} >>${logo ? ` /XObject << /Logo ${logoId} 0 R >>` : ''} >>`;
  for (const ops of d.pages) {
    const body = ops.join('\n');
    const cid = add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
    pageIds.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] /Resources ${res} /Contents ${cid} 0 R >>`));
  }
  objs[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((i) => `${i} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  const catId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  const infoId = add(`<< /Title (${esc(win(plan.title).replace(/[\x91\x92]/g, "'"))}) /Author (ExploraSelf) /Creator (The Leader's North Star) >>`);

  // Everything is a byte string (each char < 256).
  let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    if (o && o.img) out += `${i + 1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${o.img.w} /Height ${o.img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${o.img.bytes.length} >>\nstream\n${o.img.bytes}\nendstream\nendobj\n`;
    else out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
  return new Blob([bytes], { type: 'application/pdf' });
}
