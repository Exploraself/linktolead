/* The Growth Toolkit page (/tools/): every tool from catalog.js, in two lists,
 * Personal leadership and Business. Signed in, each cover says when the
 * founder last used it and what it showed (/api/tools); the 12 days say which
 * day they are on.
 *
 * Arriving from the code letter (?email=…&code=…), the code is checked and
 * kept as a pass, and the address is cleaned. Arriving from a tool that needs
 * the way in first (?open=teleprompter), the way in opens here, then the tool. */
import { CATEGORIES, CATALOG, coverHTML, byKey } from '/tools/catalog.js';
import * as G from '/tools/gate.js';
import { mountDoor } from '/tools/door.js';
import * as A from '/account.js';
import { ICONS } from '/tools/icons.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (id) => document.getElementById(id);
const host = $('shelves'), note = $('hubnote');
const day = (iso) => { try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return ''; } };

function draw(used = {}, course = null) {
  // Two lists, each with its name large enough to read at a glance and its
  // tools in one even row of three (Alexandru, 3 Nov 2026: "it's not clear
  // what's what … the category should be more visible"). What is being built
  // is one line under its list, never a half-empty row. exploraself.com/tools
  // draws the same, from public/tools/catalog.json.
  host.innerHTML = CATEGORIES.map((g) => {
    const items = CATALOG.filter((c) => c.category === g.key && !c.soon);
    const next = CATALOG.filter((c) => c.category === g.key && c.soon);
    return `<section class="dom" style="--c:${g.color}" aria-labelledby="g-${g.key}">
      <header class="dom-h"><i aria-hidden="true">${ICONS[g.key] || ''}</i><div><h2 id="g-${g.key}">${esc(g.name)}</h2><p>${esc(g.sub)}</p></div><span class="dom-n">${items.length} free tools</span></header>
      <div class="shelf">${items.map((c) => {
        const u = used[c.key];
        const line = c.key === '12-days' && course
          ? (course.stopped ? 'Your letters are stopped. You can start them again.' : course.day >= 13 ? 'All 12 days done.' : course.day > 0 ? `You are on day ${course.day} of 12.` : 'Your welcome letter is on its way.')
          : u ? `Last time (${esc(day(u.at))}): <b>${esc(u.summary)}</b>` : '';
        return `<div class="slot">${coverHTML(c, { tag: 'a' })}${line ? `<p class="used">${line}</p>` : ''}</div>`;
      }).join('')}</div>
      ${next.length ? `<p class="dom-next"><i aria-hidden="true">${ICONS.soon}</i><span><b>Being built next:</b> ${next.map((c) => esc(c.name)).join(' · ')}</span></p>` : ''}
    </section>`;
  }).join('');
}

function say(html) { note.innerHTML = html; note.hidden = !html; }

async function arrive() {
  const q = new URLSearchParams(location.search);
  const email = q.get('email'), code = q.get('code'), want = byKey(q.get('open') || '');
  if (email && code) {
    try { await G.redeem(email, code); say('<b>You’re in.</b> Your Growth Toolkit is open on this device. Pick a tool.'); }
    catch (ex) { say(esc(ex.message || 'That code did not work. Ask for a new one below.')); }
    history.replaceState(null, '', '/tools/');
  }
  // An account here for the first time: "Yes, that's me" once, then on.
  if (A.joined() && (await G.needsConfirm())) {
    const panel = $('panel'); panel.hidden = false;
    const st = await G.state();
    G.confirmMe($('gate'), { me: st.me || {}, tool: want && !want.soon ? want.key : '',
      ready: () => { if (want && want.href && !want.soon) location.replace(want.href); else { panel.hidden = true; say('<b>You’re in.</b> Pick a tool.'); } },
      cancel: () => { panel.hidden = true; } });
    return;
  }
  if (want && want.href && !want.soon) {
    if (G.mayOpen()) { location.replace(want.href); return; }
    const panel = $('panel'); panel.hidden = false;
    G.open($('gate'), { name: want.name, path: want.href, st: await G.state(), ready: () => location.replace(want.href), cancel: () => { panel.hidden = true; } });
  }
}

draw();
arrive();
if (A.joined()) {
  fetch(`/api/tools?t=${encodeURIComponent(A.token())}`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && d.ok) draw(d.used || {}, d.course); }).catch(() => {});
}
import('/profile-menu.js').then((m) => m.mount($('pmhost'), { guest: true })).catch(() => {});
mountDoor(); // the menu's Sign in / Create my free account (public/tools/door.js)
