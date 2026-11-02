/* /tools/: the toolkit by the four domains, in their order (catalog.js). A
 * signed-in founder also sees which tools they opened, and their 12 Days. */
import { byDomain } from '/tools/catalog.js';
import { uses } from '/tools/access.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (s) => { const d = new Date(s); return isNaN(d) ? '' : `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const el = document.getElementById('hub');

/** What the founder did with each tool, in a few words. */
function mine(t, u) {
  if (!u) return '';
  if (t.id === 'twelve-days') {
    const w = u.twelve;
    return !w ? '' : w.done ? 'You walked all 12 days' : w.day ? `You’re in · Day ${w.day} of 12` : 'You’re in · Day 1 next';
  }
  const last = (u.uses || []).find((x) => x.tool === t.id);
  return last ? `Opened ${day(last.at)}` : '';
}

function tile(t, u) {
  if (t.soon) return `<div class="tile soon"><b>${esc(t.name)}</b><span>${esc(t.line)}</span></div>`;
  const m = mine(t, u);
  return `<a class="tile" href="${esc(t.href)}"><b>${esc(t.name)}</b><span>${esc(t.line)}</span><small>Free · ${esc(t.time)}${m ? ' · ' + esc(m) : ''}</small><span class="go-a">${t.id === 'twelve-days' ? (m ? 'See my 12 days' : 'Start my 12 days') : 'Open'} →</span></a>`;
}

function draw(u = null) {
  el.innerHTML = byDomain().map((d) => `<section class="dom" style="--c:${d.color}" aria-labelledby="d-${d.k}">
      <h2 class="dn" id="d-${d.k}">${esc(d.name)}</h2>
      <div class="tiles">${d.tools.map((t) => tile(t, u)).join('')}</div>
    </section>`).join('');
}

draw();
uses().then((u) => { if (u && u.ok) draw(u); });
