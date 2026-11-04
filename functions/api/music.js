// The study room's music (Alexandru, 4 Nov 2026: "cancel the existing music
// and add 2 categories, classic and modern").
//
// The files live in an R2 bucket (music-background), bound to this app as
// MUSIC, in two folders: Classic/ and Modern/ (any capitals). Nothing to
// change in code to add a piece: upload it to a folder and it appears.
//
//   GET /api/music            → { ok, classic: [{ key, title }], modern: [...] }
//   GET /api/music?f=<key>    → the audio file, with Range support (seeking)
//
// The title is the file name without its folder and extension, with _ as a
// space: "Clair de lune – Debussy.mp3" reads "Clair de lune – Debussy".
// No bucket bound or nothing uploaded yet: empty lists, never an error page.

export const CATS = ['classic', 'modern'];
const AUDIO = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|webm)$/i;
const TYPES = { mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav', flac: 'audio/flac', webm: 'audio/webm' };

/** The category of a key ('Classic/x.mp3' → 'classic'), or '' if it is not music. */
export function catOf(key) {
  const k = String(key || '');
  const i = k.indexOf('/');
  if (i < 1 || !AUDIO.test(k)) return '';
  const c = k.slice(0, i).toLowerCase();
  return CATS.includes(c) ? c : '';
}
/** The title shown in the player. */
export function titleOf(key) {
  const name = String(key || '').split('/').pop().replace(AUDIO, '');
  return name.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled';
}
/** Every piece in the bucket, sorted by title, in its category. */
export async function catalogue(B) {
  const out = { classic: [], modern: [] };
  if (!B || typeof B.list !== 'function') return out;
  let cursor;
  for (let page = 0; page < 20; page++) {
    const r = await B.list({ limit: 1000, cursor }).catch(() => null);
    if (!r) break;
    for (const o of r.objects || []) { const c = catOf(o.key); if (c) out[c].push({ key: o.key, title: titleOf(o.key) }); }
    if (!r.truncated) break;
    cursor = r.cursor;
  }
  for (const c of CATS) out[c].sort((a, b) => a.title.localeCompare(b.title));
  return out;
}

const json = (body, status = 200, cache = 'public, max-age=300') => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache } });

/** The Content-Range for an R2 range, given the object's size. */
export function rangeOf(r, size) {
  if (!r) return null;
  let start, end;
  if (typeof r.suffix === 'number') { start = Math.max(0, size - r.suffix); end = size - 1; }
  else { start = r.offset || 0; end = typeof r.length === 'number' ? start + r.length - 1 : size - 1; }
  return { start, end: Math.min(end, size - 1) };
}

async function file(request, env, key) {
  if (!catOf(key) || !env.MUSIC) return new Response('Not found', { status: 404 });
  const ranged = request.headers.has('range');
  const obj = await env.MUSIC.get(key, ranged ? { range: request.headers } : undefined).catch(() => null);
  if (!obj) return new Response('Not found', { status: 404 });
  const ext = key.split('.').pop().toLowerCase();
  const h = new Headers({ 'content-type': TYPES[ext] || 'application/octet-stream', 'accept-ranges': 'bytes', 'cache-control': 'public, max-age=86400', 'x-robots-tag': 'noindex' });
  if (obj.httpEtag) h.set('etag', obj.httpEtag);
  const r = ranged ? rangeOf(obj.range, obj.size) : null;
  if (r) {
    h.set('content-range', `bytes ${r.start}-${r.end}/${obj.size}`);
    h.set('content-length', String(r.end - r.start + 1));
    return new Response(request.method === 'HEAD' ? null : obj.body, { status: 206, headers: h });
  }
  h.set('content-length', String(obj.size));
  return new Response(request.method === 'HEAD' ? null : obj.body, { status: 200, headers: h });
}

export async function onRequestGet({ request, env }) {
  const f = new URL(request.url).searchParams.get('f');
  if (f) return file(request, env, f);
  return json({ ok: true, ...(await catalogue(env.MUSIC)) });
}
export const onRequestHead = onRequestGet;
