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
// The name a founder sees (Alexandru, 4 Nov 2026: "on the surface, it has to
// be an interesting name"): the files keep their names in the bucket, and
// NAMES below gives each piece the name the player shows and its place on
// the shelf. Only the name shows (Alexandru: no credit line); where each
// piece came from is kept in NAMES, for us. A file not in NAMES shows its file name, tidied:
// no folder, extension, leading number, long code or "mixkit-".
// No bucket bound or nothing uploaded yet: empty lists, never an error page.

export const CATS = ['classic', 'modern'];
const AUDIO = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|webm)$/i;
const TYPES = { mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav', flac: 'audio/flac', webm: 'audio/webm' };

/** Each piece's name on the surface, in the order it plays (round and round).
 *  file: its file name in the bucket (any capitals). source: where it came
 *  from (the composer and the player, as the file says), never shown.
 *  type: only when the file is not what its extension says. Classic is the thinking shelf (Study mode),
 *  Modern the doing shelf (Focus mode), a launch from Countdown to Orbit. */
export const NAMES = [
  { file: '1089_1-glen-hoban-by-nc-sa-7b71ae21-6264-40e2-859c-abfc0c3aec2a.mp3', title: 'First Light', source: 'Chopin, Étude No. 13 · played by Glen Hoban' },
  { file: '778_bui-nguyen-trieu-tuong-02-adagio-cantabile-de-la-sonate-path__tique-op13-beethoven-f107e37a-ffd9-4a12-a696-56c577692ec9.mp3', title: 'Clear Head', source: 'Beethoven, Pathétique, Adagio · played by Bui Nguyen Trieu Tuong' },
  { file: 'Prelude [from cello suite BWV 1007, guitar arr.]-0-Accou - J.S. Bach - Cello Suite No.1 Prelude [BWV 1007]-2045-6889.mp3', title: 'Steady Hands', source: 'Bach, Cello Suite No. 1, Prelude, on guitar · played by Valery Avsaragov' },
  { file: '1953_ballade-no-1-in-g-minor-e6a7d761-d26f-49ad-9e0f-e90e02eb5335.mp3', title: 'The Long View', source: 'Chopin, Ballade No. 1 · played by Frank Levy', type: 'audio/mp4' },
  { file: 'mixkit-tech-house-vibes-130.mp3', title: 'Countdown', source: 'Mixkit' },
  { file: 'mixkit-driving-ambition-32.mp3', title: 'Lift-off', source: 'Mixkit' },
  { file: 'mixkit-sports-highlights-51.mp3', title: 'Full Speed', source: 'Mixkit' },
  { file: 'mixkit-latin-lovers-39.mp3', title: 'Orbit', source: 'Mixkit' },
];
const fileOf = (key) => String(key || '').split('/').pop();
/** The NAMES entry for a key, and its place, or null. */
export function named(key) {
  const f = fileOf(key).toLowerCase();
  const i = NAMES.findIndex((n) => n.file.toLowerCase() === f);
  return i < 0 ? null : { ...NAMES[i], order: i };
}

/** The category of a key ('Classic/x.mp3' → 'classic'), or '' if it is not music. */
export function catOf(key) {
  const k = String(key || '');
  const i = k.indexOf('/');
  if (i < 1 || !AUDIO.test(k)) return '';
  const c = k.slice(0, i).toLowerCase();
  return CATS.includes(c) ? c : '';
}
/** The title shown in the player: its name in NAMES, else the file name,
 *  tidied ("mixkit-calm-waters-12.mp3" reads "Calm waters"). */
export function titleOf(key) {
  const n = named(key);
  if (n) return n.title;
  let name = fileOf(key).replace(AUDIO, '')
    .replace(/[-_ ]?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '')
    .replace(/^\d+_/, '').replace(/^mixkit-/i, '').replace(/-by-nc(-sa|-nd)?\b/gi, '');
  name = name.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!name.includes(' ')) name = name.replace(/-\d+$/, '').replace(/-+/g, ' ').trim();
  return name ? name[0].toUpperCase() + name.slice(1) : 'Untitled';
}
/** Every piece in the bucket, sorted by title, in its category. */
export async function catalogue(B) {
  const out = { classic: [], modern: [] };
  if (!B || typeof B.list !== 'function') return out;
  let cursor;
  for (let page = 0; page < 20; page++) {
    const r = await B.list({ limit: 1000, cursor }).catch(() => null);
    if (!r) break;
    for (const o of r.objects || []) {
      const c = catOf(o.key); if (!c) continue;
      const n = named(o.key);
      out[c].push({ key: o.key, title: titleOf(o.key), _o: n ? n.order : NAMES.length });
    }
    if (!r.truncated) break;
    cursor = r.cursor;
  }
  // The named pieces in their order first, then any others by title.
  for (const c of CATS) out[c] = out[c].sort((a, b) => a._o - b._o || a.title.localeCompare(b.title)).map(({ _o, ...p }) => p);
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
  const n = named(key);
  const h = new Headers({ 'content-type': (n && n.type) || TYPES[ext] || 'application/octet-stream', 'accept-ranges': 'bytes', 'cache-control': 'public, max-age=86400', 'x-robots-tag': 'noindex' });
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
