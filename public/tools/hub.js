/* The Tools page (/tools/): every tool from catalog.js, grouped by the four
 * domains. Signed in, each cover says when the founder last used it and what
 * it showed (/api/tools); the 12 days say which day they are on. */
import { DOMAINS, CATALOG, coverHTML } from '/tools/catalog.js';
import * as A from '/account.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const host = document.getElementById('shelves');
const day = (iso) => { try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return ''; } };

function draw(used = {}, course = null) {
  host.innerHTML = DOMAINS.map((d) => {
    const items = CATALOG.filter((c) => c.domain === d.key);
    return `<section class="dom" style="--c:${d.color}" aria-labelledby="d-${d.key}">
      <h2 id="d-${d.key}"><i aria-hidden="true"></i>${esc(d.name)}</h2>
      <div class="shelf">${items.map((c) => {
        if (c.soon) return `<div class="soon"><b>${esc(c.name)}</b><span>${esc(c.sub)}</span></div>`;
        const u = used[c.key];
        const note = c.key === '12-days' && course
          ? (course.stopped ? 'Your letters are stopped. You can start them again.' : course.day >= 13 ? 'All 12 days done.' : course.day > 0 ? `You are on day ${course.day} of 12.` : 'Your welcome letter is on its way.')
          : u ? `Last time (${esc(day(u.at))}): <b>${esc(u.summary)}</b>` : '';
        return `<div class="slot">${coverHTML(c, { tag: 'a' })}${note ? `<p class="used">${note}</p>` : ''}</div>`;
      }).join('')}</div>
    </section>`;
  }).join('');
}

draw();
if (A.joined()) {
  fetch(`/api/tools?t=${encodeURIComponent(A.token())}`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && d.ok) draw(d.used || {}, d.course); }).catch(() => {});
}
import('/profile-menu.js').then((m) => m.mount(document.getElementById('pmhost'), { guest: true })).catch(() => {});
