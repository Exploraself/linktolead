/* "What opens with your free account": everything on the other side of the
 * free account, each line with what it gives a founder's life and business.
 * Shared by /compass/welcome and /compass/welcome-a; sales.js loads it as the
 * visitor scrolls near it, with the library from /content.js (LIBRARY) and the
 * number of plan steps from the live plans data, so no title, page count or
 * step count is typed twice. Nothing here is a claim the copy did not make. */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const STAGE = { build: 'Building', grow: 'Growing', scale: 'Scaling' };
const SPINE = { build: '#15213B', grow: '#1F4A3A', scale: '#5E2335' }; // navy, forest, wine

/** The eight lines, in two groups. `L` is LIBRARY; `steps` the live number of
 *  plan steps, or null when it could not be read (then the line says no number). */
export function items(L, steps) {
  const [mb, mg, ms] = L.manuals, [btl, wb, nww] = L.books;
  const head = (s) => String(s).split(/\.\s/)[0];
  return {
    tools: [
      { what: 'The full Leadership Compass, saved', desc: '8 questions across the four domains, your compass reading and the What-if lab. Change an answer any time.',
        life: 'Stop carrying the whole business in your head.', biz: 'See which domain needs you first: Lead yourself, Lead your people, Lead your business or Lead the market.' },
      { what: 'Your Ground Plan', desc: 'Your stage, your weakest domain, your goal and your first three moves, on one page.',
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
      { what: nww.n, soon: !!nww.soon, desc: `${nww.kicker}. ${nww.sub.split(/\.\s/).slice(1).join('. ')} In your library the day it opens.`,
        life: 'A win that counts at home as well as at work.', biz: 'Decide what winning is for, then build toward it.' },
    ],
  };
}

/** The shelf: the three manuals drawn as books, then the real covers. */
function shelf(L) {
  const books = L.manuals.map((m) => `<div class="kit-book" style="--spine:${SPINE[m.k] || '#15213B'}" role="img" aria-label="${esc(m.n)}, ${m.pages} pages">
      <span class="kit-book-k">${esc(m.n.split(' · ')[0])}</span><span class="kit-book-n">${esc(STAGE[m.k] || m.n)}</span><span class="kit-book-p">${m.pages} pages</span></div>`).join('');
  const covers = L.books.map((b) => `<figure class="kit-cover">
      <img src="${esc(b.cover)}" alt="${esc(b.n)}: ${esc(b.kicker)}" width="480" height="480" loading="lazy" decoding="async">
      ${b.soon ? '<span class="kit-soon">COMING SOON</span>' : ''}</figure>`).join('');
  const kickers = L.books.map((b) => (b.soon ? `${b.kicker}, coming soon` : b.kicker));
  return `<div class="kit-lib"><div class="kit-shelf" tabindex="0" role="group" aria-label="Your library">${books}${covers}</div>
    <p class="kit-shelf-line">${L.manuals.length} manuals, one for each stage · ${kickers.map(esc).join(' · ')}</p></div>`;
}

function group(title, list, start) {
  return `<div class="kit-group"><h3 class="kit-gh">${esc(title)}</h3>
    <div class="kit-heads" aria-hidden="true"><span>WHAT YOU GET</span><span>IN YOUR LIFE</span><span>IN YOUR BUSINESS</span></div>
    <ol class="kit-list" start="${start}">${list.map((x, i) => `<li class="kit-item">
      <div class="kit-what"><span class="kit-n">${start + i}</span><div><b>${esc(x.what)}${x.soon ? ' <span class="kit-tag">coming soon</span>' : ''}</b><p>${esc(x.desc)}</p></div></div>
      <div class="kit-cell"><span class="kit-lab">IN YOUR LIFE</span><p>${esc(x.life)}</p></div>
      <div class="kit-cell"><span class="kit-lab">IN YOUR BUSINESS</span><p>${esc(x.biz)}</p></div></li>`).join('')}</ol></div>`;
}

/** Everything under the section's heading. */
export function markup(L, steps) {
  const I = items(L, steps);
  const out = L.books.filter((b) => !b.soon).length, soon = L.books.filter((b) => b.soon).length;
  return `${shelf(L)}
    ${group('Your tools · they work for you from day one', I.tools, 1)}
    ${group('Your library · download and keep', I.library, I.tools.length + 1)}
    <div class="kit-mentor">
      <span class="kit-ac" aria-hidden="true">AC</span>
      <div><h3 class="kit-mh">You don’t have to figure it out alone. Your mentor, and the whole team behind you.</h3>
      <p>Notes from Alexandru and the team arrive on your Ground Plan, and you can reply.</p></div>
    </div>
    <div class="kit-close">
      <div><p class="serif kit-q">One question before you scroll on: what would one more free evening a week give your family?</p>
        <ul class="kit-ticks"><li>${I.tools.length} tools that work from day one</li><li>${L.manuals.length} manuals and ${out} books to download${soon ? ', a third on the way' : ''}</li><li>Alexandru and the team beside you</li></ul></div>
      <div class="kit-cta"><span class="kick">Free and yours to keep</span>
        <button type="button" data-gate class="gold-btn">Create my free account →</button>
        <span class="kit-small">First name, surname and email. Add a password if you like. No card.</span></div>
    </div>`;
}

/** Fill the placeholder once. */
export function fill(el, L, steps) {
  if (!el || !el.hasAttribute('data-lazy')) return;
  el.removeAttribute('data-lazy'); el.removeAttribute('aria-label'); el.style.minHeight = '';
  el.innerHTML = markup(L, steps);
}
