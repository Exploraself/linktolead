/* The Cabinet: the top of Your Base Camp. A small, quiet study: greeting
 * and brass plate, the climb as a gold watch dial, a record player, a desk
 * with the founder's four working objects, and the library shelf.
 *
 * Everything shown is the founder's own (name, stage, North Star bands, plan
 * count, programme level). A value that is not known is left out, never
 * filled with an example. Morning (light) and Evening (dark) are the site's
 * light and dark (public/theme.js): they follow the device until the founder
 * picks one, and the pick is kept on this browser.
 *
 * FULL accounts also get the incubator band under the wall: The Founder's
 * Blueprint, their current level and its answers, the twelve levels as dots
 * (done, here, open, or behind a gate they do not hold yet) and Continue.
 * Static, always there, real data only.
 *
 * The music (music.js) plays live in the browser, only on the dashboard (Your
 * Base Camp, the Library, Ask Alexandru), starts on the first click if the
 * founder allows it, and fades out when the tab is hidden or the founder
 * moves to the programme. */
import * as M from './music.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };

export const STEP_ORDER = ['free', 'session', 'lab', 'hub', 'premium'];
export const STEP_NAMES = { free: 'The Founder Launchpad', session: 'The Boardroom', lab: 'The LAB', hub: 'The HUB', premium: 'The Summit' };
const DOMAINS = [['Lead yourself', '#A8623A'], ['Lead your people', '#4C7355'], ['Lead your business', '#36607F'], ['Lead the market', '#9A7418']];
const BAND_CLASS = { 'Needs you now': 'low', 'Taking shape': 'mid', 'A strength': 'high' };

/** Morning or Evening: the site's light (theme.js), else the founder's
 *  pick on this browser, else the device. */
export function theme() {
  try { const t = document.documentElement.getAttribute('data-theme'); if (t === 'light' || t === 'dark') return t; } catch { /* no page */ }
  const t = get('es-theme') || get('cab-theme');
  if (t === 'light' || t === 'dark') return t;
  try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
}

/** The twelve levels as the band shows them: 'done', 'here', 'open' or
 *  'gate' (behind a step the founder does not hold yet). `doneOf(n)` is the
 *  answers written in level n; `held(n)` whether the founder's step opens it. */
export function levelDots(here, doneOf, held) {
  return Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    if (!held(n)) return 'gate';
    if (doneOf(n) >= 28) return 'done';
    return n === here ? 'here' : 'open';
  });
}
const DOT_NAMES = { done: 'finished', here: 'you are here', open: 'open', gate: 'opens with a later step' };

/** The Leader’s North Star, in its own small place under the Cabinet: one
 *  slim strip, always there. `read`: the founder has a reading. */
export function compassStripHTML(read) {
  return `<a class="cstrip" href="/northstar/" aria-label="${read ? 'Open your Leader’s North Star reading' : 'Take your Leader’s North Star'}">
    <span class="cstrip-dial" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="none" stroke="#B4975F" stroke-width="1.4"/><circle cx="20" cy="7" r="2" fill="#A8623A"/><circle cx="33" cy="20" r="2" fill="#4C7355"/><circle cx="20" cy="33" r="2" fill="#36607F"/><circle cx="7" cy="20" r="2" fill="#9A7418"/><path d="M20 9l3 11-3 2-3-2z" fill="#D6BF8F"/><path d="M20 31l3-11-3-2-3 2z" fill="#6E5A36"/><circle cx="20" cy="20" r="2.2" fill="#B4975F"/></svg></span>
    <span class="cstrip-t"><span class="cstrip-k">Leader’s North Star</span><b>${read ? 'Your direction in all four domains, any time you need it.' : 'Find where you stand in all four domains. Eight plain questions.'}</b></span>
    <span class="cstrip-go">${read ? 'Open my North Star →' : 'Take my North Star →'}</span>
  </a>`;
}

/** The incubator band (FULL accounts). `b`: { level, title, done, dots }. */
export function bandHTML(b) {
  if (!b) return '';
  const lv = String(b.level).padStart(2, '0');
  return `<section class="incub" aria-label="The incubator: The Founder's Blueprint">
    <div class="incub-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="none" stroke="#D6BF8F" stroke-width="1.2"/><path d="m12 5.7 2 4.3 4.3 2-4.3 2-2 4.3-2-4.3-4.3-2 4.3-2Z" fill="#D6BF8F"/></svg></div>
    <div class="incub-copy">
      <p class="incub-eb">The incubator · Link to Lead · your full account</p>
      <h2>The Founder’s Blueprint</h2>
      <p class="incub-now">Level ${lv} of 12${b.title ? ` · <b>${esc(b.title)}</b>` : ''} · ${b.done || 0} of 28 answers</p>
      <ol class="incub-levels" aria-label="Twelve levels">${b.dots.map((d, i) => `<li class="lv-${d}"><span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="vh">Level ${String(i + 1).padStart(2, '0')}, ${DOT_NAMES[d]}</span></li>`).join('')}</ol>
      <p class="incub-key"><span><i class="k-free"></i>01–03 free</span><span><i class="k-board"></i>04–05 The Boardroom</span><span><i class="k-lab"></i>06–09 The LAB</span><span><i class="k-hub"></i>10–12 The HUB</span></p>
    </div>
    <button type="button" class="incub-go" data-level="${b.level}">Continue Level ${lv} →</button>
  </section>`;
}
const greeting = (h) => (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');

/** The hand's angle on the dial for the founder's step. */
export const handAngle = (tier) => -120 + 60 * Math.max(0, STEP_ORDER.indexOf(tier || 'free'));

const DIAL = `<defs><linearGradient id="cbz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3DA92"/><stop offset=".35" stop-color="#B8913F"/><stop offset=".6" stop-color="#E9CB7C"/><stop offset="1" stop-color="#6E5A32"/></linearGradient><radialGradient id="cface" cx=".4" cy=".35" r=".75"><stop offset="0" style="stop-color:var(--dial-hi)"/><stop offset="1" style="stop-color:var(--dial)"/></radialGradient></defs><circle cx="180" cy="180" r="176" fill="url(#cbz)"/><circle cx="180" cy="180" r="166" style="fill:var(--dial)"/><circle cx="180" cy="180" r="163" fill="url(#cface)"/><g fill="none" style="stroke:var(--dial-line)" stroke-width=".5" opacity=".55"><circle cx="180" cy="180" r="6"/><circle cx="180" cy="180" r="12"/><circle cx="180" cy="180" r="18"/><circle cx="180" cy="180" r="24"/><circle cx="180" cy="180" r="30"/><circle cx="180" cy="180" r="36"/><circle cx="180" cy="180" r="42"/><circle cx="180" cy="180" r="48"/><circle cx="180" cy="180" r="54"/><circle cx="180" cy="180" r="60"/><circle cx="180" cy="180" r="66"/><circle cx="180" cy="180" r="72"/><circle cx="180" cy="180" r="78"/><circle cx="180" cy="180" r="84"/><circle cx="180" cy="180" r="90"/><circle cx="180" cy="180" r="96"/><circle cx="180" cy="180" r="102"/><circle cx="180" cy="180" r="108"/><circle cx="180" cy="180" r="114"/><circle cx="180" cy="180" r="120"/><circle cx="180" cy="180" r="126"/><circle cx="180" cy="180" r="132"/><circle cx="180" cy="180" r="138"/><circle cx="180" cy="180" r="144"/></g><g style="stroke:var(--dial-line)" stroke-width=".4" opacity=".35"><line x1="180" y1="162" x2="180" y2="34"/><line x1="182" y1="162" x2="195" y2="35"/><line x1="184" y1="162" x2="210" y2="37"/><line x1="186" y1="163" x2="225" y2="41"/><line x1="187" y1="164" x2="239" y2="47"/><line x1="189" y1="164" x2="253" y2="54"/><line x1="191" y1="165" x2="266" y2="62"/><line x1="192" y1="167" x2="278" y2="72"/><line x1="193" y1="168" x2="288" y2="82"/><line x1="195" y1="169" x2="298" y2="94"/><line x1="196" y1="171" x2="306" y2="107"/><line x1="196" y1="173" x2="313" y2="121"/><line x1="197" y1="174" x2="319" y2="135"/><line x1="198" y1="176" x2="323" y2="150"/><line x1="198" y1="178" x2="325" y2="165"/><line x1="198" y1="180" x2="326" y2="180"/><line x1="198" y1="182" x2="325" y2="195"/><line x1="198" y1="184" x2="323" y2="210"/><line x1="197" y1="186" x2="319" y2="225"/><line x1="196" y1="187" x2="313" y2="239"/><line x1="196" y1="189" x2="306" y2="253"/><line x1="195" y1="191" x2="298" y2="266"/><line x1="193" y1="192" x2="288" y2="278"/><line x1="192" y1="193" x2="278" y2="288"/><line x1="191" y1="195" x2="266" y2="298"/><line x1="189" y1="196" x2="253" y2="306"/><line x1="187" y1="196" x2="239" y2="313"/><line x1="186" y1="197" x2="225" y2="319"/><line x1="184" y1="198" x2="210" y2="323"/><line x1="182" y1="198" x2="195" y2="325"/><line x1="180" y1="198" x2="180" y2="326"/><line x1="178" y1="198" x2="165" y2="325"/><line x1="176" y1="198" x2="150" y2="323"/><line x1="174" y1="197" x2="135" y2="319"/><line x1="173" y1="196" x2="121" y2="313"/><line x1="171" y1="196" x2="107" y2="306"/><line x1="169" y1="195" x2="94" y2="298"/><line x1="168" y1="193" x2="82" y2="288"/><line x1="167" y1="192" x2="72" y2="278"/><line x1="165" y1="191" x2="62" y2="266"/><line x1="164" y1="189" x2="54" y2="253"/><line x1="164" y1="187" x2="47" y2="239"/><line x1="163" y1="186" x2="41" y2="225"/><line x1="162" y1="184" x2="37" y2="210"/><line x1="162" y1="182" x2="35" y2="195"/><line x1="162" y1="180" x2="34" y2="180"/><line x1="162" y1="178" x2="35" y2="165"/><line x1="162" y1="176" x2="37" y2="150"/><line x1="163" y1="174" x2="41" y2="135"/><line x1="164" y1="173" x2="47" y2="121"/><line x1="164" y1="171" x2="54" y2="107"/><line x1="165" y1="169" x2="62" y2="94"/><line x1="167" y1="168" x2="72" y2="82"/><line x1="168" y1="167" x2="82" y2="72"/><line x1="169" y1="165" x2="94" y2="62"/><line x1="171" y1="164" x2="107" y2="54"/><line x1="173" y1="164" x2="121" y2="47"/><line x1="174" y1="163" x2="135" y2="41"/><line x1="176" y1="162" x2="150" y2="37"/><line x1="178" y1="162" x2="165" y2="35"/></g><g style="stroke:var(--dial-ink)" stroke-width="1"><line x1="37" y1="243" x2="44" y2="241"/><line x1="32" y1="228" x2="38" y2="226"/><line x1="27" y1="212" x2="34" y2="211"/><line x1="25" y1="196" x2="32" y2="196"/><line x1="24" y1="180" x2="31" y2="180"/><line x1="25" y1="164" x2="32" y2="164"/><line x1="27" y1="148" x2="34" y2="149"/><line x1="32" y1="132" x2="38" y2="134"/><line x1="37" y1="117" x2="44" y2="119"/><line x1="54" y1="88" x2="59" y2="92"/><line x1="64" y1="76" x2="69" y2="80"/><line x1="76" y1="64" x2="80" y2="69"/><line x1="88" y1="54" x2="92" y2="59"/><line x1="102" y1="45" x2="106" y2="51"/><line x1="117" y1="37" x2="119" y2="44"/><line x1="132" y1="32" x2="134" y2="38"/><line x1="148" y1="27" x2="149" y2="34"/><line x1="164" y1="25" x2="164" y2="32"/><line x1="196" y1="25" x2="196" y2="32"/><line x1="212" y1="27" x2="211" y2="34"/><line x1="228" y1="32" x2="226" y2="38"/><line x1="243" y1="37" x2="241" y2="44"/><line x1="258" y1="45" x2="254" y2="51"/><line x1="272" y1="54" x2="268" y2="59"/><line x1="284" y1="64" x2="280" y2="69"/><line x1="296" y1="76" x2="291" y2="80"/><line x1="306" y1="88" x2="301" y2="92"/><line x1="323" y1="117" x2="316" y2="119"/><line x1="328" y1="132" x2="322" y2="134"/><line x1="333" y1="148" x2="326" y2="149"/><line x1="335" y1="164" x2="328" y2="164"/><line x1="336" y1="180" x2="329" y2="180"/><line x1="335" y1="196" x2="328" y2="196"/><line x1="333" y1="212" x2="326" y2="211"/><line x1="328" y1="228" x2="322" y2="226"/><line x1="323" y1="243" x2="316" y2="241"/></g><line x1="44" y1="258" x2="64" y2="247" stroke="url(#cbz)" stroke-width="4" stroke-linecap="round"/><text x="80" y="241" text-anchor="middle" font-size="9" font-weight="600" letter-spacing="1.6" style="fill:var(--dial-ink)">LAUNCHPAD</text><line x1="44" y1="101" x2="64" y2="113" stroke="url(#cbz)" stroke-width="4" stroke-linecap="round"/><text x="80" y="125" text-anchor="middle" font-size="9" font-weight="600" letter-spacing="1.6" style="fill:var(--dial-ink)">BOARDROOM</text><line x1="180" y1="23" x2="180" y2="46" stroke="url(#cbz)" stroke-width="4" stroke-linecap="round"/><text x="180" y="67" text-anchor="middle" font-size="9" font-weight="600" letter-spacing="1.6" style="fill:var(--dial-ink)">THE LAB</text><line x1="316" y1="101" x2="296" y2="113" stroke="url(#cbz)" stroke-width="4" stroke-linecap="round"/><text x="280" y="125" text-anchor="middle" font-size="9" font-weight="600" letter-spacing="1.6" style="fill:var(--dial-ink)">THE HUB</text><line x1="316" y1="258" x2="296" y2="247" stroke="url(#cbz)" stroke-width="4" stroke-linecap="round"/><text x="280" y="241" text-anchor="middle" font-size="9" font-weight="600" letter-spacing="1.6" style="fill:var(--dial-ink)">THE SUMMIT</text><text x="180" y="104" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="10" letter-spacing="2" style="fill:var(--dial-ink)" opacity=".7">EXPLORASELF</text><text x="180" y="270" text-anchor="middle" font-size="8.5" font-weight="600" letter-spacing="3" style="fill:var(--gold-ink)">THE CLIMB</text>`;

function dial(tier) {
  const a = handAngle(tier);
  return `<svg viewBox="0 0 360 360" role="img" aria-label="The climb: The Founder Launchpad, The Boardroom, The LAB, The HUB, The Summit. You are at ${esc(STEP_NAMES[tier] || STEP_NAMES.free)}." font-family="Inter, Arial, sans-serif">${DIAL}
    <text x="180" y="290" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-style="italic" font-size="14" style="fill:var(--dial-ink)">${esc((STEP_NAMES[tier] || STEP_NAMES.free).replace(/^The /, ''))}</text>
    <g transform="rotate(${a} 180 180)"><polygon points="180,48 184.5,180 180,206 175.5,180" fill="url(#cbz)"/><line x1="180" y1="60" x2="180" y2="170" stroke="#5E4512" stroke-width=".6" opacity=".6"/></g>
    <circle cx="180" cy="180" r="9" fill="url(#cbz)"/><circle cx="180" cy="180" r="3" style="fill:var(--dial)"/></svg>`;
}

const DECK = `<svg viewBox="0 0 300 220" aria-hidden="true"><rect x="6" y="18" width="288" height="190" rx="12" fill="#3B2312"/><rect x="6" y="18" width="288" height="190" rx="12" fill="none" stroke="#B4975F" stroke-opacity=".6"/><rect x="14" y="26" width="272" height="174" rx="8" fill="#22140A"/><circle cx="118" cy="108" r="80" fill="#16100A"/>
  <g class="cab-record"><circle cx="118" cy="108" r="74" fill="#0B0907"/><g fill="none" stroke="#2A2420" stroke-width=".8"><circle cx="118" cy="108" r="66"/><circle cx="118" cy="108" r="58"/><circle cx="118" cy="108" r="50"/><circle cx="118" cy="108" r="42"/><circle cx="118" cy="108" r="34"/></g><path d="M70 70 A66 66 0 0 1 150 52" fill="none" stroke="#F3EBD2" stroke-opacity=".12" stroke-width="10"/><circle cx="118" cy="108" r="24" fill="#B4975F"/><text x="118" y="105" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="5.2" fill="#2A1C08" letter-spacing=".08em">EXPLORASELF</text><text x="118" y="115" text-anchor="middle" font-family="Inter, Arial" font-size="3.6" fill="#2A1C08" letter-spacing=".1em">CABINET SESSIONS</text><circle cx="118" cy="108" r="2.2" fill="#1C1309"/></g>
  <circle cx="244" cy="40" r="11" fill="#B88E36"/><circle cx="244" cy="40" r="5" fill="#5E4512"/><g class="cab-arm"><path d="M244 40 L250 150 L232 176" fill="none" stroke="#D9BC74" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="222" y="172" width="18" height="10" rx="2" fill="#D9BC74" transform="rotate(-30 231 177)"/></g><circle cx="268" cy="186" r="6" fill="#B88E36"/><circle cx="248" cy="186" r="6" fill="#6E5213"/></svg>`;

const BOOKS = [
  { css: 'I', t: 'Building', sub: 'The offer · first clients', cloth: '#5A1E1B', cap: 'Volume I · 79 pages' },
  { css: 'II', t: 'Growing', sub: 'Clients repeat', cloth: '#1F3B2B', cap: 'Volume II · 77 pages' },
  { css: 'III', t: 'Scaling', sub: 'A team · a new job', cloth: '#18263F', cap: 'Volume III · 80 pages' },
  { img: '/library/cover-built-to-lead.jpg', t: 'Built to Lead', cap: '99 tools' },
  { img: '/library/cover-worth-building.jpg', t: 'Worth Building', cap: 'The Founder’s Playbook · 32 frameworks' },
  { img: '/library/cover-a-new-way-of-winning.jpg', t: 'A New Way of Winning', cap: 'The Link to Lead Manual · 12 principles' },
];
function book(b) {
  const inner = b.img
    ? `<img src="${b.img}" alt="" loading="lazy">${b.soon ? '<span class="cab-ribbon">Coming soon</span>' : ''}`
    : `<span class="cab-frame"><span class="cab-series cab-foil">The Founder’s<br>Blueprint</span><span class="cab-num cab-foil">${b.css}</span><span><span class="cab-ttl cab-foil">${b.t}</span><span class="cab-sub cab-foil">${b.sub}</span></span><span class="cab-orn"><i></i></span><span class="cab-auth cab-foil">Alexandru Cojocari</span></span>`;
  return `<button type="button" class="cab-book${b.img ? ' real' : ''}" data-go="library" style="${b.cloth ? `--cloth:${b.cloth}` : ''}" aria-label="${esc(b.t)}${b.soon ? ', coming soon' : ''}. Open the library">${inner}</button>`;
}

/** The Cabinet's markup. `c`: { first, name, stageName, aimName, startHere,
 *  tier, bands (4, or nulls), plans: { count, total, next: { title, domain } },
 *  prog: { level, title, done }, askUnread, hasPassword, band (FULL accounts:
 *  { level, title, done, dots }, else null) }. */
export function cabinetHTML(c) {
  const th = theme(), dark = th === 'dark';
  const auto = get('cab-music') !== 'off';
  const ms = M.current();
  const bands = Array.isArray(c.bands) ? c.bands : [];
  const anyBand = bands.some(Boolean);
  const plate = [['Stage today', c.stageName], ['Aiming for', c.aimName], ['Start here', c.startHere], ['Your step', STEP_NAMES[c.tier] || STEP_NAMES.free]].filter(([, v]) => v);
  const p = c.plans, pr = c.prog;
  return `<section class="cab" aria-label="Your Base Camp">
  <div class="cab-crown"></div>
  <div class="cab-wall">
    <div class="cab-panel cab-greet">
      <div class="cab-row"><p class="cab-eb">Your Base Camp</p>
        <button type="button" class="cab-theme" data-cab="theme" aria-label="${dark ? 'Evening light is on. Switch to morning' : 'Morning light is on. Switch to evening'}">${dark
          ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>Evening'
          : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>Morning'}</button></div>
      <h1 class="cab-h1">${greeting(new Date().getHours())}${c.first ? `, <i>${esc(c.first)}.</i>` : '.'}</h1>
      <p class="cab-lede">Your cabinet. Every answer you write is kept here, in your own words.</p>
      <div class="cab-plate">${c.name ? `<div class="cab-pname">${esc(c.name)}</div>` : ''}<dl>${plate.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>
      <button type="button" class="cab-link" data-cab="stand">Change where I stand →</button>
    </div>
    <div class="cab-dialwrap"><figure class="cab-dial">${dial(c.tier)}</figure><p class="cab-cap">Five steps, one road. The hand moves when you climb.</p></div>
    <div class="cab-panel cab-player" id="cab-player">
      <p class="cab-eb">The Cabinet Sessions</p>
      <div class="cab-deck">${DECK}</div>
      <div class="cab-ctrl"><button type="button" class="cab-play" data-cab="play" aria-label="Play music"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>
        <div class="cab-now"><b id="cab-track">${esc(M.TRACKS[ms.track].n)}</b><span id="cab-status">${auto ? 'Starts with your first click' : 'Paused'}</span></div></div>
      <label class="cab-vol" for="cab-vol">Volume <input type="range" id="cab-vol" min="0" max="100" value="${ms.vol}"></label>
      <label class="cab-auto" for="cab-auto"><input type="checkbox" id="cab-auto"${auto ? ' checked' : ''}> Play when I open Your Base Camp</label>
    </div>
  </div>
  ${bandHTML(c.band)}
  <div class="cab-edge"></div>
  <div class="cab-desk">
    <div class="cab-deskhead"><h2>On your desk</h2><span>One step per domain each week</span></div>
    <div class="cab-objs">
      <article class="cab-obj"><p class="cab-eb">The programme</p>
        ${pr ? `<div class="cab-ring"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="32" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="40" cy="40" r="32" fill="none" stroke="var(--gold)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(201.1 * Math.min(1, (pr.done || 0) / 28)).toFixed(1)} 201.1" transform="rotate(-90 40 40)"/></svg><div><b>${pr.done || 0} of 28</b><small>answers in Level ${String(pr.level).padStart(2, '0')}</small></div></div>
        <p>Level ${String(pr.level).padStart(2, '0')}: ${esc(pr.title)}.</p>` : '<p>Your twelve levels start with Level 01.</p>'}
        <button type="button" class="cab-btn solid" data-go="work">Continue →</button></article>
      <article class="cab-obj"><p class="cab-eb">Leader’s North Star</p>
        ${anyBand ? `<div class="cab-doms">${DOMAINS.map(([n, col], i) => bands[i] ? `<div><span class="cab-dot" style="background:${col}"></span>${n}<span class="cab-band ${BAND_CLASS[bands[i]] || 'mid'}">${esc(bands[i])}</span></div>` : '').join('')}</div>`
          : '<p>Eight plain questions and your rough numbers. Feedback in all four domains.</p>'}
        <a class="cab-btn" href="/northstar/">${anyBand ? 'Open my reading →' : 'Take my North Star →'}</a></article>
      <article class="cab-obj"><p class="cab-eb">The ledger · Account Plans</p>
        ${p && p.total ? `<div class="cab-ring"><svg viewBox="0 0 80 80" aria-hidden="true"><rect x="14" y="10" width="52" height="62" rx="4" fill="none" stroke="var(--gold)" stroke-width="2"/><path d="M24 26h32M24 36h32M24 46h20" stroke="var(--line)" stroke-width="2"/><path d="M24 56l5 5 9-10" fill="none" stroke="var(--gold)" stroke-width="2.4" stroke-linecap="round"/></svg><div><b>${p.count} of ${p.total}</b><small>steps ticked</small></div></div>
        ${p.next ? `<div class="cab-next"><span class="cab-k">Next · ${esc(p.next.domain)}</span>${esc(p.next.title)}</div>` : ''}` : '<p>Your step-by-step plans open from your North Star reading.</p>'}
        <button type="button" class="cab-btn" data-cab="plans">Open the ledger →</button></article>
      <article class="cab-obj"><p class="cab-eb">Ask Alexandru</p>
        <div class="cab-portrait"><img src="/cabinet/alexandru.jpg" alt="Alexandru Cojocari" width="640" height="512" loading="lazy"></div>
        <img class="cab-sig" src="/mail/signature.png" alt="Alexandru" width="150" height="60">
        <p>${c.askUnread ? '<b>You have a new answer.</b> ' : ''}Stuck on a step? Ask here. Alexandru and the team reply in your cabinet.</p>
        <button type="button" class="cab-btn" data-go="ask">${c.askUnread ? 'Read the answer →' : 'Ask Alexandru →'}</button></article>
    </div>
  </div>
  <div class="cab-lib"><div class="cab-libhead"><p class="cab-eb">The Library</p><h2>Your shelf</h2><p>Digital copies are free with your account. Print editions are on their way.</p></div>
    <div class="cab-shelf"><span class="cab-lamp" aria-hidden="true"></span><div class="cab-books">${BOOKS.map(book).join('')}</div><div class="cab-ledge" aria-hidden="true"></div></div>
    <div class="cab-caps">${BOOKS.map((b) => `<div><b>${esc(b.t)}</b><span>${esc(b.cap)}</span>${b.soon ? '<em>Coming soon</em>' : '<button type="button" data-go="library">Read free</button>'}</div>`).join('')}</div>
  </div>
</section>`;
}

/* ── The music ─────────────────────────────────────────────────────────────
 * The engine, the mini player, the light and Focus mode live in music.js,
 * shared by Your Base Camp, the Library and Ask Alexandru. The record
 * player here drives the same engine. */
function paint() {
  const pl = document.getElementById('cab-player'); if (!pl) return;
  const p = M.isOn();
  pl.classList.toggle('playing', p);
  const b = pl.querySelector('[data-cab="play"]');
  if (b) { b.innerHTML = p ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'; b.setAttribute('aria-label', p ? 'Pause music' : 'Play music'); }
  const s = document.getElementById('cab-status');
  if (s) s.textContent = M.failed ? 'Music is not available in this browser' : p ? 'Playing in your cabinet' : (get('cab-music') !== 'off' && !M.pausedByFounder() ? 'Starts with your first click' : 'Paused');
  const n = document.getElementById('cab-track');
  if (n) n.textContent = M.TRACKS[M.current().track].n;
  const v = document.getElementById('cab-vol');
  if (v && document.activeElement !== v) v.value = String(M.current().vol);
}
let wired = false;
/** The Evening/Morning button's look, from the site's light. */
function paintTheme() {
  const b = document.querySelector('[data-cab="theme"]'); if (!b) return;
  const dark = theme() === 'dark';
  b.innerHTML = dark ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>Evening' : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>Morning';
  b.setAttribute('aria-label', dark ? 'Evening light is on. Switch to morning' : 'Morning light is on. Switch to evening');
}

/** Call after the Cabinet is drawn. */
export function cabinetShown() {
  M.enter();
  paint();
  if (wired) return;
  wired = true;
  M.onChange(paint);
  window.addEventListener('es-theme', paintTheme);
  document.addEventListener('input', (e) => { if (e.target.id === 'cab-vol') { M.set({ vol: +e.target.value }); } });
  document.addEventListener('change', (e) => { if (e.target.id === 'cab-auto') { put('cab-music', e.target.checked ? 'on' : 'off'); paint(); } });
}
/** The founder moved to the Library or Ask Alexandru: the music goes on. */
export const dashboardShown = () => M.enter();
/** Call when the founder leaves the dashboard for the programme. */
export function cabinetHidden() { M.leave(); }
/** A click on a Cabinet control. Returns true when handled. */
export function cabinetClick(b) {
  const a = b.dataset.cab;
  if (a === 'play') { M.toggle(); return true; }
  if (a === 'theme') {
    const next = theme() === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined' && window.ESTheme) window.ESTheme.set(next); else put('es-theme', next);
    paintTheme();
    return true;
  }
  return false;
}
