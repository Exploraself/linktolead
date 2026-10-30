// The level's video and the talk around it.
//
// Every level (module) opens with one video: Alexandru teaching that level's
// four principles, one per domain. Under it, founders on the same level can
// leave a comment and read each other's. Comments need an account; only the
// first name is shown. Alexandru and the team can hide one from /mentor.
//
// Videos are plain MP4 files on Cloudflare R2 (free storage up to 10 GB, no
// charge per view). To add one, put its address in LEVEL_VIDEOS in
// content.js. A level without a file yet says so plainly.

import * as account from './account.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const cache = new Map();   // "build.1" → { ok, items } once loaded

/** The block shown at the top of an open level. */
export function videoBlock({ key, title, sub, src, poster }) {
  const film = src
    ? `<video class="lv-film" controls preload="metadata" playsinline${poster ? ` poster="${esc(poster)}"` : ''} src="${esc(src)}" title="${esc(title)}"></video>`
    : `<div class="lv-film lv-soon" role="img" aria-label="The video for this level is being recorded">
        <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/></svg>
        <span>The video for this level is being recorded. The questions below work without it.</span></div>`;
  return `<section class="lv-video" aria-labelledby="lvv-${esc(key)}">
    <p class="eyebrow">This level’s teaching · about 12 minutes</p>
    <h3 id="lvv-${esc(key)}" class="lv-vt">${esc(title)}</h3>
    ${sub ? `<p class="lv-vs">${esc(sub)}</p>` : ''}
    ${film}
    <details class="lv-talk" data-vkey="${esc(key)}">
      <summary>Comments on this video <span class="lv-n"></span></summary>
      <div class="lv-list" aria-live="polite"><p class="lv-empty">Loading…</p></div>
      ${account.joined()
        ? `<form class="lv-form" data-vkey="${esc(key)}">
            <label for="lvc-${esc(key)}" class="vh">Your comment</label>
            <textarea id="lvc-${esc(key)}" name="body" rows="2" maxlength="1500" placeholder="What landed for you? What will you do with it?" required></textarea>
            <div class="lv-row"><button class="ghost" type="submit">Post comment</button><span class="lv-msg" role="status"></span></div>
            <p class="lv-fine">Other founders on this level see your first name and your comment. Alexandru and the team read every one.</p>
          </form>`
        : '<p class="lv-fine">Sign in to read and leave comments.</p>'}
    </details>
  </section>`;
}

const when = (iso) => { try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); } catch { return ''; } };

function paint(box, data) {
  const list = box.querySelector('.lv-list'), n = box.querySelector('.lv-n');
  const items = (data && data.items) || [];
  if (n) n.textContent = items.length ? `(${items.length})` : '';
  if (!list) return;
  if (!data || !data.ok) { list.innerHTML = `<p class="lv-empty">${account.joined() ? 'Comments could not load right now.' : ''}</p>`; return; }
  list.innerHTML = items.length
    ? `<ol class="lv-items">${items.map((c) => `<li><p class="lv-who"><b>${esc(c.first || 'A founder')}</b> · ${esc(when(c.at))}${c.mine ? ` · <button type="button" class="lv-del" data-vdel="${esc(c.id)}">Delete</button>` : ''}</p><p class="lv-body">${esc(c.body)}</p></li>`).join('')}</ol>`
    : '<p class="lv-empty">No comments yet. Be the first to say what you will do with it.</p>';
}

async function load(key, fresh = false) {
  if (!fresh && cache.has(key)) return cache.get(key);
  const t = account.token();
  if (!t) return { ok: false };
  const [stage, level] = key.split('.');
  let data = { ok: false };
  try {
    const r = await fetch(`/api/comments?stage=${encodeURIComponent(stage)}&level=${encodeURIComponent(level)}&t=${encodeURIComponent(t)}`);
    data = r.ok ? await r.json() : { ok: false };
  } catch { /* offline */ }
  if (data.ok) cache.set(key, data);
  return data;
}

async function fill(box) {
  box.dataset.filled = '1';
  paint(box, await load(box.dataset.vkey));
}

/** Fill every new talk box as the page draws it, whichever render drew it. */
const fillAll = () => document.querySelectorAll('.lv-talk:not([data-filled])').forEach((b) => { if (account.joined()) fill(b); else paint(b, null); b.dataset.filled = '1'; });
new MutationObserver(fillAll).observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener('submit', async (e) => {
  const f = e.target.closest('.lv-form');
  if (!f) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const key = f.dataset.vkey, [stage, level] = key.split('.');
  const ta = f.querySelector('textarea'), msg = f.querySelector('.lv-msg'), btn = f.querySelector('button');
  const body = ta.value.trim();
  if (!body) return;
  btn.disabled = true; msg.textContent = 'Posting…';
  try {
    const r = await fetch('/api/comments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: account.token(), stage, level: Number(level), body }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'That did not go through.');
    ta.value = ''; msg.textContent = 'Posted.';
    const box = f.closest('.lv-talk');
    paint(box, await load(key, true));
  } catch (ex) { msg.textContent = ex.message; }
  btn.disabled = false;
}, true);

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-vdel]');
  if (!b) return;
  const box = b.closest('.lv-talk'), key = box.dataset.vkey;
  b.disabled = true;
  try {
    await fetch('/api/comments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: account.token(), remove: b.dataset.vdel }) });
  } catch { /* offline */ }
  paint(box, await load(key, true));
});
