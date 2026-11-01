// Line illustrations in one style: a technical drawing in gold on dark
// paper, with dimension lines and a figure label, like a page from a
// blueprint. Every drawing sits in a 800 × 640 box. Stroked shapes draw
// themselves in (markup.drawable); shapes marked data-still only fade.

const dimH = (x1, x2, y, label) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke-width="1.4" opacity=".55"/><line x1="${x1}" y1="${y - 9}" x2="${x1}" y2="${y + 9}" stroke-width="1.4" opacity=".55"/><line x1="${x2}" y1="${y - 9}" x2="${x2}" y2="${y + 9}" stroke-width="1.4" opacity=".55"/><text x="${(x1 + x2) / 2}" y="${y - 14}" text-anchor="middle">${label}</text>`;
const dimV = (x, y1, y2, label) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke-width="1.4" opacity=".55"/><line x1="${x - 9}" y1="${y1}" x2="${x + 9}" y2="${y1}" stroke-width="1.4" opacity=".55"/><line x1="${x - 9}" y1="${y2}" x2="${x + 9}" y2="${y2}" stroke-width="1.4" opacity=".55"/><text x="${x + 16}" y="${(y1 + y2) / 2 + 6}">${label}</text>`;
const fig = (label) => `<text x="24" y="626" class="fig">${label}</text>`;
const arc = (cx, cy, r, a0, a1) => {
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};
const ticks = (cx, cy, r1, r2, n, every = 1) => Array.from({ length: n }, (_, i) => {
  const a = (i * 360) / n, rad = (a * Math.PI) / 180, rr = i % every ? r2 + (r1 - r2) / 2 : r2;
  return `<line x1="${(cx + r1 * Math.cos(rad)).toFixed(1)}" y1="${(cy + r1 * Math.sin(rad)).toFixed(1)}" x2="${(cx + rr * Math.cos(rad)).toFixed(1)}" y2="${(cy + rr * Math.sin(rad)).toFixed(1)}" stroke-width="${i % every ? 1.4 : 2.6}"/>`;
}).join('');

export const ART = {
  compass: (f = 'FIG. 01 — DIRECTION') => `
    <circle cx="400" cy="300" r="236"/><circle cx="400" cy="300" r="204" stroke-dasharray="4 10" stroke-width="1.6"/>
    ${ticks(400, 300, 236, 214, 72, 6)}
    <path d="M400 300 L452 120 L400 270 Z" fill="currentColor" fill-opacity=".9"/><path d="M400 300 L348 480 L400 330 Z"/>
    <path d="M400 300 L452 120 L348 480 Z" stroke-width="1.6"/>
    <circle cx="400" cy="300" r="14"/>
    <text x="400" y="52" text-anchor="middle" class="big">N</text><text x="672" y="310" text-anchor="middle" class="big">E</text>
    <text x="400" y="580" text-anchor="middle" class="big">S</text><text x="128" y="310" text-anchor="middle" class="big">W</text>
    ${fig(f)}`,
  vectors: (f = 'FIG. 02 — SAME SPEED, TWO DIRECTIONS') => `
    <circle cx="110" cy="320" r="12"/>
    <line x1="110" y1="320" x2="720" y2="320" stroke-dasharray="3 12" stroke-width="1.4" opacity=".6"/>
    <path d="M110 320 L690 110"/><path d="M690 110 L650 108 M690 110 L668 143" stroke-width="4"/>
    <path d="M110 320 L690 530" opacity=".5"/><path d="M690 530 L650 532 M690 530 L668 497" opacity=".5" stroke-width="4"/>
    <text x="700" y="96" class="big">+</text><text x="700" y="572" class="big" opacity=".6">−</text>
    ${dimH(110, 690, 600, 'AI × 10')}
    ${fig(f)}`,
  hourglass: (f = 'FIG. 03 — TIME, SPENT ONCE') => `
    <path d="M250 70 H550 M250 570 H550"/><path d="M270 70 C270 230 390 260 390 320 C390 380 270 410 270 570"/>
    <path d="M530 70 C530 230 410 260 410 320 C410 380 530 410 530 570"/>
    <path d="M300 150 C330 220 380 250 400 300 C420 250 470 220 500 150 Z" fill="currentColor" fill-opacity=".18"/>
    <path d="M290 560 Q400 440 510 560 Z" fill="currentColor" fill-opacity=".55"/>
    <line x1="400" y1="320" x2="400" y2="470" stroke-dasharray="2 9"/>
    ${dimV(640, 70, 570, '168 h')}${fig(f)}`,
  tree: (f = 'FIG. 04 — OUTGROW THYSELF') => `
    <path d="M384 560 C388 470 380 400 392 330 M416 560 C412 470 420 400 408 330"/>
    <path d="M392 380 C350 350 300 330 260 300 M408 360 C450 330 500 310 540 280 M400 330 L400 230"/>
    <circle cx="400" cy="200" r="110"/><circle cx="270" cy="270" r="86"/><circle cx="530" cy="260" r="92"/>
    <circle cx="330" cy="150" r="70" stroke-width="1.8"/><circle cx="470" cy="140" r="74" stroke-width="1.8"/>
    <path d="M384 560 C340 580 300 590 250 600 M416 560 C460 580 500 590 560 598 M400 560 L400 610" stroke-width="2"/>
    <line x1="160" y1="560" x2="640" y2="560" stroke-width="1.4" opacity=".6"/>
    ${dimV(690, 90, 560, 'growth')}${fig(f)}`,
  chair: (f = 'FIG. 05 — THE CRAFT WAS NEVER THE PROBLEM') => `
    <path d="M300 330 H520 L540 360 H320 Z"/>
    <path d="M320 360 L310 560 M540 360 L550 560 M340 360 L350 520 M500 360 L492 520"/>
    <path d="M300 330 L280 90 M330 330 L312 100"/><path d="M280 90 L312 100"/>
    <path d="M290 160 L320 166 M294 220 L324 226 M297 280 L327 284"/>
    <path d="M310 470 L550 470" stroke-width="2"/>
    ${dimV(620, 90, 560, '900 mm')}${dimH(300, 540, 610, '450 mm')}${fig(f)}`,
  camera: (f = 'FIG. 06 — 1975') => `
    <rect x="160" y="190" width="480" height="300" rx="26"/><path d="M290 190 L320 140 H480 L510 190"/>
    <circle cx="400" cy="345" r="110"/><circle cx="400" cy="345" r="76" stroke-width="2"/><circle cx="400" cy="345" r="38" fill="currentColor" fill-opacity=".25"/>
    <rect x="540" y="220" width="64" height="40" rx="6"/><circle cx="210" cy="225" r="14"/>
    <path d="M160 280 H260 M540 420 H640" stroke-width="1.6" opacity=".6"/>
    ${dimH(160, 640, 560, '0.01 MP')}${fig(f)}`,
  route: (f = 'FIG. 07 — A BIGGER LIFE') => `
    <circle cx="610" cy="160" r="16" fill="currentColor"/><circle cx="210" cy="430" r="16" fill="currentColor"/>
    <circle cx="610" cy="160" r="34" stroke-width="1.6"/><circle cx="210" cy="430" r="34" stroke-width="1.6"/>
    <path d="M594 176 C520 320 330 230 236 412" stroke-dasharray="10 12" stroke-width="3"/>
    <path d="M236 412 L232 378 M236 412 L262 392" stroke-width="3.4"/>
    <text x="650" y="150" class="big">Moldova</text><text x="250" y="500" class="big">Italy</text>
    <circle cx="660" cy="500" r="60" stroke-width="1.6"/><path d="M660 446 L670 500 L660 554 L650 500 Z" fill="currentColor" fill-opacity=".5"/>
    ${fig(f)}`,
  seesaw: (f = 'FIG. 08 — UNBALANCE FOR THE BALANCE') => `
    <path d="M400 420 L340 540 H460 Z"/><line x1="160" y1="540" x2="640" y2="540" stroke-width="1.6" opacity=".6"/>
    <path d="M130 470 L670 360"/>
    <rect x="160" y="340" width="150" height="118" rx="8" fill="currentColor" fill-opacity=".3" transform="rotate(-11.5 235 400)"/>
    <rect x="560" y="320" width="60" height="50" rx="6" transform="rotate(-11.5 590 345)"/>
    <text x="235" y="300" text-anchor="middle">THIS SEASON</text><text x="590" y="290" text-anchor="middle">THE REST</text>
    ${fig(f)}`,
  signpost: (f = 'FIG. 09 — CHOOSE') => `
    <line x1="400" y1="80" x2="400" y2="580"/><line x1="320" y1="580" x2="480" y2="580"/>
    <path d="M400 130 H620 L660 165 L620 200 H400 Z" fill="currentColor" fill-opacity=".25"/>
    <path d="M400 240 H190 L150 275 L190 310 H400 Z"/>
    <path d="M400 350 H580 L620 385 L580 420 H400 Z" opacity=".55"/>
    <text x="520" y="174" text-anchor="middle" class="big">YES</text><text x="270" y="284" text-anchor="middle" class="big">NO</text><text x="500" y="394" text-anchor="middle" class="big" opacity=".6">LATER</text>
    ${fig(f)}`,
  tag: (f = 'FIG. 10 — THE PRICE OF A DISCOUNT') => `
    <path d="M250 150 H520 L640 320 L520 490 H250 Z"/><circle cx="545" cy="320" r="22"/>
    <path d="M567 320 C640 300 700 230 730 160" stroke-width="2"/>
    <text x="372" y="350" text-anchor="middle" class="huge" style="font-size:84px">−10%</text>
    ${dimH(250, 520, 560, 'margin')}${fig(f)}`,
  dumbbell: (f = 'FIG. 11 — 2019') => `
    <line x1="210" y1="320" x2="590" y2="320" stroke-width="5"/>
    <rect x="150" y="210" width="40" height="220" rx="8"/><rect x="200" y="240" width="30" height="160" rx="6"/>
    <rect x="610" y="210" width="40" height="220" rx="8"/><rect x="570" y="240" width="30" height="160" rx="6"/>
    <path d="M400 120 L412 150 L444 152 L419 172 L428 204 L400 186 L372 204 L381 172 L356 152 L388 150 Z" fill="currentColor" fill-opacity=".5"/>
    ${dimH(150, 650, 520, 'unseen hours')}${fig(f)}`,
  lamp: (f = 'FIG. 12 — 1858') => `
    <path d="M230 440 C230 360 330 340 420 350 C500 358 560 380 600 330 L630 345 C600 410 540 440 470 446 Z"/>
    <path d="M230 440 C250 480 320 500 420 490 C470 486 500 470 500 452"/>
    <path d="M300 352 C280 300 300 270 330 260 C350 300 360 320 340 350"/>
    <path d="M330 255 C300 200 330 150 340 110 C370 160 380 210 345 255 Z" fill="currentColor" fill-opacity=".45"/>
    <path d="M210 470 C150 470 140 400 190 380" stroke-width="2.4"/>
    <circle cx="340" cy="190" r="90" stroke-dasharray="2 10" stroke-width="1.4" opacity=".6"/>
    ${fig(f)}`,
  drop: (f = 'FIG. 13 — 1847') => `
    <path d="M400 90 C450 190 520 260 520 340 C520 410 466 460 400 460 C334 460 280 410 280 340 C280 260 350 190 400 90 Z"/>
    <path d="M340 350 C340 390 365 415 400 420" stroke-width="2"/>
    <path d="M170 500 C230 590 570 590 630 500" /><line x1="150" y1="500" x2="650" y2="500"/>
    ${dimV(690, 90, 460, 'one habit')}${fig(f)}`,
  stopwatch: (f = 'FIG. 14 — A TIME TO PUSH') => `
    <circle cx="400" cy="350" r="220"/><rect x="370" y="88" width="60" height="44" rx="8"/><line x1="400" y1="132" x2="400" y2="128"/>
    <path d="M560 170 L600 130" stroke-width="5"/>
    ${ticks(400, 350, 220, 198, 60, 5)}
    <path d="M400 350 L400 190" stroke-width="5"/><path d="M400 350 L520 420" stroke-width="3"/><circle cx="400" cy="350" r="12" fill="currentColor"/>
    <path d="${arc(400, 350, 160, -90, 30)}" stroke-width="12" opacity=".35"/>
    ${fig(f)}`,
  cord: (f = 'FIG. 15 — ANYONE MAY STOP THE LINE') => `
    <line x1="60" y1="480" x2="740" y2="480"/><line x1="60" y1="520" x2="740" y2="520"/>
    ${[90, 230, 370, 510, 650].map((x) => `<rect x="${x}" y="400" width="80" height="80" rx="6"/>`).join('')}
    <rect x="510" y="400" width="80" height="80" rx="6" fill="currentColor" fill-opacity=".45" data-still/>
    <line x1="40" y1="90" x2="760" y2="90" stroke-width="2"/>
    <path d="M550 90 V260" stroke-dasharray="6 8"/><rect x="530" y="260" width="40" height="70" rx="12" fill="currentColor" fill-opacity=".5"/>
    <text x="590" y="300">PULL</text>
    ${fig(f)}`,
  bridge: (f = 'FIG. 16 — TRUST, ONE PLANK AT A TIME') => `
    <path d="M60 420 Q400 180 740 420"/><line x1="60" y1="420" x2="740" y2="420"/>
    ${Array.from({ length: 13 }, (_, i) => { const x = 110 + i * 48; const y = 420 - (240 * (1 - ((x - 400) / 340) ** 2)) * 0.98; return `<line x1="${x}" y1="${y.toFixed(1)}" x2="${x}" y2="420" stroke-width="1.8"/>`; }).join('')}
    ${Array.from({ length: 13 }, (_, i) => `<rect x="${86 + i * 50}" y="420" width="42" height="16" rx="3" ${i < 9 ? 'fill="currentColor" fill-opacity=".45"' : 'opacity=".35"'}/>`).join('')}
    <path d="M40 420 V560 M760 420 V560" stroke-width="4"/>
    ${dimH(86, 536, 520, 'promises kept')}${fig(f)}`,
  bubbles: (f = 'FIG. 17 — THE CONVERSATION') => `
    <path d="M120 120 H470 Q500 120 500 150 V300 Q500 330 470 330 H230 L170 390 L180 330 H150 Q120 330 120 300 V150 Q120 120 150 120 Z"/>
    <path d="M330 300 H650 Q680 300 680 330 V450 Q680 480 650 480 H620 L630 540 L560 480 H360 Q330 480 330 450 V330 Q330 300 360 300 Z" fill="currentColor" fill-opacity=".14"/>
    <circle cx="430" cy="392" r="10" fill="currentColor"/><circle cx="505" cy="392" r="10" fill="currentColor"/><circle cx="580" cy="392" r="10" fill="currentColor"/>
    <path d="M170 190 H450 M170 240 H400" stroke-width="2" opacity=".6"/>
    ${fig(f)}`,
  clipboard: (f = 'FIG. 18 — 30 OCT 1935') => `
    <rect x="220" y="110" width="360" height="470" rx="18"/><rect x="330" y="84" width="140" height="56" rx="12" fill="currentColor" fill-opacity=".3"/>
    ${[200, 280, 360, 440].map((y, i) => `<rect x="268" y="${y}" width="40" height="40" rx="6"/><line x1="340" y1="${y + 20}" x2="${530 - i * 26}" y2="${y + 20}" stroke-width="2.4"/>${i < 3 ? `<path d="M276 ${y + 20} L286 ${y + 31} L304 ${y + 8}" stroke-width="4"/>` : ''}`).join('')}
    <path d="M640 150 L700 150 M670 120 L670 200 M640 190 L700 190" stroke-width="2.4"/>
    ${fig(f)}`,
  invoice: (f = 'FIG. 19 — A LOAN YOU NEVER AGREED TO') => `
    <path d="M210 70 H520 L590 140 V570 H210 Z"/><path d="M520 70 V140 H590"/>
    <path d="M260 180 H440 M260 240 H540 M260 290 H540 M260 340 H500 M260 430 H540" stroke-width="2.2" opacity=".7"/>
    <g transform="rotate(-14 470 470)"><rect x="350" y="430" width="250" height="84" rx="10" stroke-width="4"/><text x="475" y="486" text-anchor="middle" class="big">UNPAID</text></g>
    ${fig(f)}`,
  network: (f = 'FIG. 20 — WHERE CLIENTS COME FROM') => {
    const pts = [[400, 320], [220, 170], [600, 160], [170, 420], [640, 450], [400, 120], [400, 540], [280, 520], [540, 560], [700, 300], [110, 280]];
    const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [3, 7], [6, 8], [2, 9], [1, 10], [4, 8], [1, 5]];
    return `${edges.map(([a, b]) => `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke-width="2" opacity=".7"/>`).join('')}
      ${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i ? 20 : 42}" ${i ? '' : 'fill="currentColor" fill-opacity=".5"'}/>`).join('')}
      <text x="400" y="400" text-anchor="middle">YOU</text>${fig(f)}`;
  },
  sameness: (f = 'FIG. 21 — IF YOU LOOK THE SAME, PRICE DECIDES') => `
    ${Array.from({ length: 15 }, (_, i) => { const x = 130 + (i % 5) * 112, y = 120 + Math.floor(i / 5) * 130; return i === 8 ? `<circle cx="${x + 40}" cy="${y + 40}" r="44" fill="currentColor" fill-opacity=".6"/>` : `<rect x="${x}" y="${y}" width="80" height="80" rx="6" opacity=".6"/>`; }).join('')}
    ${dimH(130, 658, 540, 'one difference, with proof')}${fig(f)}`,
  megaphone: (f = 'FIG. 22 — ONE LINE') => `
    <path d="M200 270 L470 150 V490 L200 370 Z"/><rect x="140" y="270" width="60" height="100" rx="8"/>
    <path d="M230 380 L260 500 H310 L290 390"/>
    <path d="M540 230 Q600 320 540 410 M600 190 Q690 320 600 450 M660 150 Q780 320 660 490" stroke-width="2.4"/>
    ${fig(f)}`,
  coins: (f = 'FIG. 23 — ENOUGH, AS A NUMBER') => `
    ${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="330" cy="${470 - i * 52}" rx="130" ry="36"/><path d="M200 ${470 - i * 52} V${500 - i * 52} M460 ${470 - i * 52} V${500 - i * 52}" stroke-width="2"/>`).join('')}
    <ellipse cx="560" cy="500" rx="100" ry="28" opacity=".55"/><ellipse cx="560" cy="460" rx="100" ry="28" opacity=".55"/>
    <line x1="120" y1="200" x2="700" y2="200" stroke-dasharray="10 10"/><text x="600" y="185">ENOUGH</text>
    ${fig(f)}`,
  weeks: (f = 'FIG. 24 — TWELVE WEEKS') => `
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${90 + i * 52}" y="${430 - i * 22}" width="40" height="${80 + i * 22}" rx="5" ${i === 3 || i === 7 ? 'fill="currentColor" fill-opacity=".45"' : ''}/>`).join('')}
    <line x1="710" y1="100" x2="710" y2="200"/><path d="M710 100 L770 122 L710 144 Z" fill="currentColor" fill-opacity=".6"/>
    <text x="114" y="550" text-anchor="middle">W1</text><text x="270" y="550" text-anchor="middle">W4</text><text x="478" y="550" text-anchor="middle">W8</text><text x="686" y="550" text-anchor="middle">W12</text>
    ${fig(f)}`,
  mountain: (f = 'FIG. 25 — THE NEXT LEVEL') => `
    <path d="M60 540 L270 230 L360 340 L470 150 L740 540 Z"/><path d="M470 150 L430 210 L470 200 L500 230 Z" fill="currentColor" fill-opacity=".35"/>
    <path d="M200 540 C260 500 330 500 360 460 C390 420 330 400 380 360 C420 320 460 300 440 250 C430 220 460 190 470 160" stroke-dasharray="8 10" stroke-width="2.6"/>
    <line x1="470" y1="150" x2="470" y2="70"/><path d="M470 70 L530 88 L470 106 Z" fill="currentColor" fill-opacity=".6"/>
    ${fig(f)}`,
  key: (f = 'FIG. 26 — THE KEY') => `
    <circle cx="250" cy="320" r="120"/><circle cx="250" cy="320" r="50"/>
    <path d="M370 320 H700 V380 M630 320 V400 M560 320 V370"/>
    ${dimH(370, 700, 250, 'one decision')}${fig(f)}`,
  lighthouse: (f = 'FIG. 27 — DECIDE IN A STORM') => `
    <path d="M360 560 L380 230 H420 L440 560 Z"/><rect x="368" y="180" width="64" height="50" rx="4" fill="currentColor" fill-opacity=".45"/><path d="M360 180 L400 140 L440 180"/>
    <path d="M432 200 L760 120 M432 210 L760 300" stroke-width="2" opacity=".7"/><path d="M432 200 L760 120 L760 300 L432 210" fill="currentColor" fill-opacity=".12" data-still/>
    <path d="M40 560 Q120 520 200 560 T360 560 M440 560 Q520 520 600 560 T760 560" stroke-width="2.4"/>
    <path d="M378 300 H422 M374 380 H426 M370 460 H430" stroke-width="2" opacity=".7"/>
    ${fig(f)}`,
  moon: (f = 'FIG. 28 — 1969 · ABOUT 4 KB OF MEMORY') => `
    <path d="M560 90 A170 170 0 1 0 560 430 A130 130 0 1 1 560 90 Z" fill="currentColor" fill-opacity=".15"/>
    <circle cx="140" cy="540" r="60"/><path d="M190 510 C330 360 420 300 590 270" stroke-dasharray="6 10" stroke-width="2.4"/>
    <path d="M590 270 L560 262 M590 270 L572 292" stroke-width="3"/>
    <circle cx="420" cy="170" r="3" fill="currentColor"/><circle cx="700" cy="560" r="3" fill="currentColor"/><circle cx="90" cy="120" r="3" fill="currentColor"/>
    ${fig(f)}`,
  biplane: (f = 'FIG. 29 — 17 DEC 1903 · 12 SECONDS') => `
    <rect x="140" y="230" width="520" height="22" rx="6"/><rect x="140" y="350" width="520" height="22" rx="6"/>
    ${[200, 320, 480, 600].map((x) => `<line x1="${x}" y1="252" x2="${x}" y2="350" stroke-width="2.4"/>`).join('')}
    <path d="M200 252 L320 350 M320 252 L200 350 M480 252 L600 350 M600 252 L480 350" stroke-width="1.4" opacity=".6"/>
    <rect x="60" y="275" width="60" height="50" rx="4"/><line x1="120" y1="300" x2="140" y2="300"/>
    <line x1="660" y1="300" x2="740" y2="300"/><rect x="730" y="260" width="22" height="80" rx="4"/>
    ${dimH(140, 660, 460, '120 ft')}${fig(f)}`,
  book: (f = 'FIG. 30 — ONE PAGE A WEEK') => `
    <path d="M400 150 C330 110 220 110 120 140 V540 C220 510 330 510 400 550 Z"/><path d="M400 150 C470 110 580 110 680 140 V540 C580 510 470 510 400 550 Z"/>
    ${Array.from({ length: 7 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<circle cx="${450 + c * 34}" cy="${200 + r * 44}" r="${(r * 6 + c) % 5 === 0 ? 7 : 3}" fill="currentColor" fill-opacity="${(r * 6 + c) % 5 === 0 ? .9 : .4}" data-still/>`).join('')).join('')}
    <path d="M160 210 H350 M160 260 H350 M160 310 H330 M160 360 H350" stroke-width="2" opacity=".6"/>
    ${fig(f)}`,
  plane: (f = 'FIG. 31 — THE PLANES THAT CAME BACK') => {
    const holes = [[250, 260], [290, 300], [520, 250], [560, 310], [480, 290], [610, 280], [200, 290], [395, 470], [380, 500], [420, 520], [330, 280], [455, 260]];
    return `<path d="M400 80 C420 80 430 120 430 160 V420 C430 470 420 520 400 540 C380 520 370 470 370 420 V160 C370 120 380 80 400 80 Z"/>
      <path d="M370 230 L110 310 V340 L370 300 Z M430 230 L690 310 V340 L430 300 Z"/><path d="M380 470 L290 520 V540 L385 520 Z M420 470 L510 520 V540 L415 520 Z"/>
      ${holes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="currentColor" data-still/>`).join('')}
      <text x="400" y="600" text-anchor="middle">ARMOUR GOES WHERE THERE ARE NO HOLES</text>${fig(f)}`;
  },
  scale: (f = 'FIG. 32 — WEIGH IT') => `
    <line x1="400" y1="120" x2="400" y2="540"/><path d="M330 540 H470"/><path d="M170 180 H630"/><circle cx="400" cy="120" r="14"/>
    <path d="M170 180 L110 340 H230 Z M630 180 L570 300 H690 Z"/><path d="M110 340 Q170 380 230 340 M570 300 Q630 340 690 300"/>
    <rect x="140" y="300" width="60" height="40" rx="4" fill="currentColor" fill-opacity=".5" data-still/>
    ${fig(f)}`,
  door: (f = 'FIG. 33 — THE DOOR YOU KEEP CLOSED') => `
    <rect x="250" y="90" width="300" height="470"/><path d="M250 90 L430 140 V600 L250 560 Z" fill="currentColor" fill-opacity=".14"/>
    <circle cx="405" cy="350" r="9" fill="currentColor"/><path d="M550 560 L700 600" stroke-width="2" opacity=".5"/>
    <path d="M450 160 L540 130 M450 300 L540 300 M450 450 L540 480" stroke-dasharray="4 8" stroke-width="1.6" opacity=".6"/>
    ${fig(f)}`,
};

ART.officechair = (f = 'FIG. 34 — MONDAY, 9:00') => `
    <path d="M300 120 Q300 80 340 80 H460 Q500 80 500 120 V330 Q500 350 480 350 H320 Q300 350 300 330 Z"/>
    <path d="M250 380 Q250 360 270 360 H530 Q550 360 550 380 V400 Q550 420 530 420 H270 Q250 420 250 400 Z" fill="currentColor" fill-opacity=".18"/>
    <path d="M250 330 H220 V400 M550 330 H580 V400"/><path d="M400 350 V360 M400 420 V500"/><rect x="385" y="440" width="30" height="40" rx="4"/>
    <path d="M400 500 L250 540 M400 500 L550 540 M400 500 L320 575 M400 500 L480 575 M400 500 L400 560"/>
    <circle cx="250" cy="552" r="12"/><circle cx="550" cy="552" r="12"/><circle cx="320" cy="587" r="12"/><circle cx="480" cy="587" r="12"/><circle cx="400" cy="572" r="12"/>
    <path d="M610 160 V120 M640 175 L668 147 M655 210 H695" stroke-width="2.4" opacity=".7"/>
    ${dimH(250, 550, 470, 'empty')}${fig(f)}`;

export const artNames = Object.keys(ART);
