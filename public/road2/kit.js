/* "What opens with your free account": everything on the other side of the
 * free account, each line with what it gives a founder's life and business.
 * On Road 2 (/road2/); sales.js loads it as the
 * visitor scrolls near it, with the library from /content.js (LIBRARY) and the
 * number of plan steps from the live plans data, so no title, page count or
 * step count is typed twice. Nothing here is a claim the copy did not make. */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const STAGE = { build: 'Building', grow: 'Growing', scale: 'Scaling' };
const SPINE = { build: '#121C2D', grow: '#1F4A3A', scale: '#5E2335' }; // navy, forest, wine

/** The eight lines, in two groups. `L` is LIBRARY; `steps` the live number of
 *  plan steps, or null when it could not be read (then the line says no number). */
export function items(L, steps) {
  const [mb, mg, ms] = L.manuals, [btl, wb, nww] = L.books;
  const head = (s) => String(s).split(/\.\s/)[0];
  return {
    tools: [
      { what: 'The full Leader’s North Star, saved', desc: '8 questions across the four domains, your North Star reading and the What-if lab. Change an answer any time.',
        life: 'Stop carrying the whole business in your head.', biz: 'See which domain needs you first: Lead yourself, Lead your people, Lead your business or Lead the market.' },
      { what: 'Your Base Camp', desc: 'Your stage, your weakest domain, your goal and your first three moves, on one page.',
        life: 'Start Monday knowing what comes first.', biz: 'Put your hours where they move the business.' },
      { what: 'Your Account Plans', desc: `${Number.isInteger(steps) && steps > 0 ? `${steps} short steps` : 'Short steps'} in your own order, weakest domain first. Tick them off as you go.`,
        life: 'Feel progress every week, instead of only pressure.', biz: 'Small moves that add up to a business that runs.' },
      { what: 'The Founder Launchpad', desc: 'Three levels in all four domains. Each step names what to open, count and write. Free, and free to stay.',
        life: 'Rewrite your principles. Unlock your mind.', biz: 'Lead your business instead of being its busiest employee.' },
    ],
    library: [
      { what: `${mb.n.split(' · ')[0]} for your stage`, desc: `A manual for ${STAGE[mb.k]} (${mb.pages} pages), ${STAGE[mg.k]} (${mg.pages}) or ${STAGE[ms.k]} (${ms.pages}). All three open with your account.`,
        life: 'Advice for where you are, not for someone else’s business.', biz: 'A clear road from your stage to the next one.' },
      { what: btl.n, desc: `${btl.kicker}. ${btl.sub.split(/\.\s/).slice(1).join('. ')}`,
        life: 'A tool ready for the hard moment: the talk, the decision, the no.', biz: 'Lead people with confidence, even if nobody taught you how.' },
      { what: wb.n, desc: `${wb.kicker}. ${head(wb.sub)}.`,
        life: 'Think bigger, with a structure behind it.', biz: 'Build toward a business that lasts and can run without you.' },
      { what: nww.n, soon: !!nww.soon, desc: `${nww.kicker}. ${nww.sub.split(/\.\s/).slice(1).join('. ')} ${nww.soon ? 'In your library the day it opens.' : 'Free to download with your account.'}`,
        life: 'A win that counts at home as well as at work.', biz: 'Decide what winning is for, then build toward it.' },
    ],
  };
}

/** The shelf: the three manuals drawn as books, then the real covers. */
function shelf(L) {
  const books = L.manuals.map((m) => `<div class="kit-book" style="--spine:${SPINE[m.k] || '#121C2D'}" role="img" aria-label="${esc(m.n)}, ${m.pages} pages">
      <span class="kit-book-k">${esc(m.n.split(' · ')[0])}</span><span class="kit-book-n">${esc(STAGE[m.k] || m.n)}</span><span class="kit-book-p">${m.pages} pages</span></div>`).join('');
  const covers = L.books.map((b) => `<figure class="kit-cover">
      <img src="${esc(b.cover)}" alt="${esc(b.n)}: ${esc(b.kicker)}" width="480" height="480" loading="lazy" decoding="async">
      ${b.soon ? '<span class="kit-soon">COMING SOON</span>' : ''}</figure>`).join('');
  const kickers = L.books.map((b) => (b.soon ? `${b.kicker}, coming soon` : b.kicker));
  return `<div class="kit-lib"><div class="kit-shelf" tabindex="0" role="group" aria-label="Your library">${books}${covers}</div>
    <p class="kit-shelf-line">${L.manuals.length} manuals, one for each stage · ${kickers.map(esc).join(' · ')}</p></div>`;
}

/* A picture for each line: small live drawings for the tools, the real
 * covers and the three manuals for the library. Decorative (aria-hidden). */
const G = '#6F93B8', GH = '#A9C0D9', DOM = ['#B8683A', '#548C62', '#4680B0', '#B8954F'];
const VIS = {
  star: () => `<svg viewBox="0 0 160 110"><g transform="translate(80 55)">${DOM.map((c, i) => `<path d="M0 0 L${[0, 38, 0, -38][i]} ${[-38, 0, 38, 0][i]} A38 38 0 0 1 ${[38, 0, -38, 0][i]} ${[0, 38, 0, -38][i]}Z" fill="${c}" fill-opacity="${[.9, .45, .6, .35][i]}"/>`).join('')}
    <circle r="44" fill="none" stroke="${G}" stroke-opacity=".5"/><circle r="38" fill="none" stroke="${G}"/>
    <g class="kv-needle"><path d="M0 -40 L5 0 L0 5 L-5 0Z" fill="${GH}"/><path d="M0 40 L5 0 L0 -5 L-5 0Z" fill="#273449"/></g><circle r="4" fill="#121C2D" stroke="${GH}" stroke-width="2"/></g></svg>`,
  plan: () => `<svg viewBox="0 0 160 110"><rect x="38" y="8" width="84" height="96" rx="4" fill="#EEF2F7"/><rect x="46" y="17" width="34" height="5" rx="2" fill="#121C2D"/>
    ${[['STAGE', 44], ['WEAKEST', 30], ['GOAL', 52]].map(([t, w], i) => `<text x="46" y="${36 + i * 12}" font-size="5.5" font-weight="700" letter-spacing=".6" fill="#3E6A94">${t}</text><rect class="kv-bar" style="--d:${i * .25}s" x="82" y="${32 + i * 12}" width="${w - 12}" height="5" rx="2" fill="${DOM[i]}"/>`).join('')}
    ${[0, 1, 2].map((i) => `<circle cx="51" cy="${76 + i * 10}" r="3.5" fill="#121C2D"/><text x="51" y="${78 + i * 10}" font-size="5" font-weight="800" fill="${GH}" text-anchor="middle">${i + 1}</text><rect x="58" y="${74 + i * 10}" width="${50 - i * 8}" height="4" rx="2" fill="#B8C6D6"/>`).join('')}</svg>`,
  ticks: () => `<svg viewBox="0 0 160 110">${[0, 1, 2, 3].map((i) => `<g transform="translate(34 ${14 + i * 22})"><rect width="92" height="16" rx="3" fill="#EEF2F7" fill-opacity="${1 - i * .12}"/>
    <rect x="4" y="3" width="10" height="10" rx="2" fill="none" stroke="#121C2D" stroke-width="1.3"/><path class="kv-tick" style="--d:${i * .6}s" d="M6 8.5l2.4 2.4L13 5.5" fill="none" stroke="${G}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/>
    <rect x="20" y="6" width="${58 - i * 9}" height="4" rx="2" fill="#B8C6D6"/><circle cx="84" cy="8" r="3" fill="${DOM[i]}"/></g>`).join('')}</svg>`,
  stairs: () => `<svg viewBox="0 0 160 110"><path d="M20 98 H56 V74 H92 V50 H128 V26 H146" fill="none" stroke="${G}" stroke-width="2.5" stroke-linejoin="round"/>
    ${[0, 1, 2].map((l) => DOM.map((c, d) => `<circle class="kv-dot" style="--d:${(l * 4 + d) * .12}s" cx="${26 + l * 36 + d * 8}" cy="${90 - l * 24}" r="3.2" fill="${c}"/>`).join('') + `<text x="${38 + l * 36}" y="${108 - l * 24}" font-size="6.5" font-weight="800" fill="${GH}" text-anchor="middle">0${l + 1}</text>`).join('')}
    <path d="M146 26 V8 M146 9 L158 12 L146 15Z" stroke="#EEF2F7" stroke-width="1.5" fill="${G}"/></svg>`,
  manuals: (L) => `<div class="kv-books">${L.manuals.map((m) => `<span style="--spine:${SPINE[m.k] || '#121C2D'}"><small>${esc(m.n.split(' · ')[0])}</small><b>${esc(STAGE[m.k] || m.n)}</b></span>`).join('')}</div>`,
};
const visFor = (key, L, i) => (key === 'cover' ? `<img class="kv-cover" src="${esc(L.books[i].cover)}" alt="" width="480" height="480" loading="lazy" decoding="async">` : VIS[key](L));
const KEYS = { tools: ['star', 'plan', 'ticks', 'stairs'], library: ['manuals', 'cover', 'cover', 'cover'] };

function group(title, list, start, kind, L) {
  return `<div class="kit-group"><h3 class="kit-gh">${esc(title)}</h3>
    <span class="kit-heads">WHAT YOU GET</span>
    <ol class="kit-list kit-cards" start="${start}">${list.map((x, i) => `<li class="kit-item">
      <div class="kit-vis${KEYS[kind][i] === 'cover' ? ' kit-vis-cover' : ''}" aria-hidden="true">${visFor(KEYS[kind][i], L, i - 1)}<span class="kit-n">${start + i}</span>${x.soon ? '<span class="kit-soonband">COMING SOON</span>' : ''}</div>
      <div class="kit-what"><b>${esc(x.what)}${x.soon ? ' <span class="kit-tag">coming soon</span>' : ''}</b><p>${esc(x.desc)}</p></div>
      <div class="kit-cell kit-life"><span class="kit-lab">IN YOUR LIFE</span><p>${esc(x.life)}</p></div>
      <div class="kit-cell kit-biz"><span class="kit-lab">IN YOUR BUSINESS</span><p>${esc(x.biz)}</p></div></li>`).join('')}</ol></div>`;
}

/** Everything under the section's heading. */
export function markup(L, steps) {
  const I = items(L, steps);
  const out = L.books.filter((b) => !b.soon).length, soon = L.books.filter((b) => b.soon).length;
  return `${shelf(L)}
    ${group('Your tools · they work for you from day one', I.tools, 1, 'tools', L)}
    ${group('Your library · download and keep', I.library, I.tools.length + 1, 'library', L)}
    <div class="kit-mentor">
      <span class="kit-ac" aria-hidden="true">AC</span>
      <div><h3 class="kit-mh">You don’t have to figure it out alone. Your mentor, and the whole team behind you.</h3>
      <p>Notes from Alexandru and the team arrive at your Base Camp, and you can reply.</p></div>
    </div>
    <div class="kit-close">
      <div><p class="serif kit-q">One question before you scroll on: what would one more free evening a week give your family?</p>
        <ul class="kit-ticks"><li>${I.tools.length} tools that work from day one</li><li>${L.manuals.length} manuals and ${out} books to download${soon ? ', a third on the way' : ''}</li><li>Alexandru and the team beside you</li></ul></div>
      <div class="kit-cta"><span class="kick">Free and yours to keep</span>
        <button type="button" data-gate class="gold-btn">Create my free account →</button>
        <span class="kit-small">Your name, your email, a password and three short questions about your business. No card.</span></div>
    </div>`;
}

/** Fill the placeholder once. */
export function fill(el, L, steps) {
  if (!el || !el.hasAttribute('data-lazy')) return;
  el.removeAttribute('data-lazy'); el.removeAttribute('aria-label'); el.style.minHeight = '';
  el.innerHTML = markup(L, steps);
}
