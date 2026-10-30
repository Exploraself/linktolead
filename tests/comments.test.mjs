// Comments under the level videos: founders only, first names only, own
// deletes, a mentor-only list with hide and show, and a notice to Alexandru.

import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestGet as list, onRequestPost as act } from '../functions/api/comments.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('comments');
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'm'.repeat(32) };
let sent = fakeResend();
const jsonOf = async (r) => [r.status, await r.json()];
const mk = async (first, email) => (await (await signup({ request: post('/api/signup', { first, last: 'Rossi', email, consent: true }), env })).json()).token;
const ana = await mk('Ana', 'ana@example.com'), bo = await mk('Bo', 'bo@example.com');
sent = fakeResend();

let [st, j] = await jsonOf(await list({ request: get('/api/comments?stage=build&level=1'), env }));
ok(st === 401, 'reading needs an account');
[st, j] = await jsonOf(await act({ request: post('/api/comments', { token: ana, stage: 'build', level: 1, body: 'The drives part landed.' }), env }));
ok(st === 200 && j.ok, 'a founder comments');
ok(sent.length === 1 && sent[0].body.to[0] === 'alex@exploraself.com' && /level 01/.test(sent[0].body.text) && sent[0].body.text.includes('The drives part landed.'), 'Alexandru gets a notice with the comment');
[st, j] = await jsonOf(await act({ request: post('/api/comments', { token: ana, stage: 'build', level: 13, body: 'x' }), env }));
ok(st === 400, 'only levels 1 to 12');
[st, j] = await jsonOf(await act({ request: post('/api/comments', { token: ana, stage: 'build', level: 1, body: '   ' }), env }));
ok(st === 400, 'an empty comment is refused');

[st, j] = await jsonOf(await list({ request: get('/api/comments?stage=build&level=1&t=' + bo), env }));
ok(st === 200 && j.items.length === 1 && j.items[0].first === 'Ana' && !j.items[0].mine && !('email' in j.items[0]) && !JSON.stringify(j).includes('Rossi'), 'another founder sees the first name only, never the email');
const id = j.items[0].id;
[st, j] = await jsonOf(await list({ request: get('/api/comments?stage=build&level=2&t=' + bo), env }));
ok(j.items.length === 0, 'each video has its own comments');

await act({ request: post('/api/comments', { token: bo, remove: id }), env });
[st, j] = await jsonOf(await list({ request: get('/api/comments?stage=build&level=1&t=' + ana), env }));
ok(j.items.length === 1 && j.items[0].mine, 'nobody deletes someone else’s comment; the author sees it as theirs');

[st, j] = await jsonOf(await list({ request: get('/api/comments?all=1'), env }));
ok(st === 403, 'the full list needs the mentor key');
const mreq = (path, body) => new Request('https://linktolead.exploraself.com' + path, body ? { method: 'POST', headers: { 'content-type': 'application/json', 'x-mentor-key': env.MENTOR_KEY }, body: JSON.stringify(body) } : { headers: { 'x-mentor-key': env.MENTOR_KEY } });
[st, j] = await jsonOf(await list({ request: mreq('/api/comments?all=1'), env }));
ok(st === 200 && j.items.length === 1 && j.items[0].email === 'ana@example.com', 'the mentor sees every comment with the email');
await act({ request: mreq('/api/comments', { hide: id, hidden: true }), env });
[st, j] = await jsonOf(await list({ request: get('/api/comments?stage=build&level=1&t=' + bo), env }));
ok(j.items.length === 0, 'a hidden comment is gone for founders');
await act({ request: mreq('/api/comments', { hide: id, hidden: false }), env });
[st, j] = await jsonOf(await list({ request: get('/api/comments?stage=build&level=1&t=' + bo), env }));
ok(j.items.length === 1, 'and back when shown again');

await act({ request: post('/api/comments', { token: ana, remove: id }), env });
[st, j] = await jsonOf(await list({ request: get('/api/comments?stage=build&level=1&t=' + ana), env }));
ok(j.items.length === 0, 'the author deletes their own');

for (let i = 0; i < 10; i++) await act({ request: post('/api/comments', { token: bo, stage: 'grow', level: 3, body: 'n' + i }), env });
[st, j] = await jsonOf(await act({ request: post('/api/comments', { token: bo, stage: 'grow', level: 3, body: 'eleven' }), env }));
ok(st === 429, 'at most ten an hour');

done();
