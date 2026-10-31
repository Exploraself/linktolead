// Crossing between the doors (31 Oct 2026): a founder who came in through the
// North Star confirms name and email on first opening the Blueprint (and the
// other way round). Kept once as an event, tagged in Mailchimp, and shown to
// the pages through /api/state.

import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as cross } from '../functions/api/cross.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { CROSS_TAGS, originOf } from '../functions/_mailchimp.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';
import fs from 'node:fs';

const { ok, done } = tally('cross');
const DB = fakeD1();
const env = { DB, MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us1' };
fakeResend();
ok(CROSS_TAGS.blueprint === 'linktolead-crossed-blueprint' && CROSS_TAGS.northstar === 'linktolead-crossed-northstar', 'the two tags Alexandru chose');
ok(originOf({ landing: 'compass' }) === 'northstar' && originOf({ landing: 'road2' }) === 'northstar' && originOf({ landing: 'road1' }) === 'blueprint' && originOf({ landing: 'summit' }) === 'blueprint', 'the door: North Star box and sales pages, or the Blueprint pages');
const r = await signup({ request: post('/api/signup', { first: 'Nia', last: 'Lee', email: 'nia@example.com', consent: true, type: 'full', company: 'Acme', interest: 'Higher income', industry: 'Other', password: 'a-long-password', confirm: 'a-long-password', landing: 'compass', source: 'compass' }), env });
const nia = (await r.json()).token;
let s = await (await stateGet({ request: get(`/api/state?t=${nia}`), env })).json();
ok(s.me.origin === 'northstar' && s.me.crossed.length === 0, 'state: came in through the North Star, not crossed yet');
let c = await cross({ request: post('/api/cross', { token: nia, to: 'blueprint', first: 'Nia', last: 'Lee-Park' }), env });
ok(c.status === 200, 'confirmed');
s = await (await stateGet({ request: get(`/api/state?t=${nia}`), env })).json();
ok(s.me.crossed.includes('blueprint') && s.me.name === 'Nia Lee-Park', 'state: crossed into the Blueprint; the name they confirmed is kept');
const log = DB.raw.prepare("SELECT detail FROM mailchimp_log WHERE action = 'tag' ORDER BY id DESC").get();
ok(log && /linktolead-crossed-blueprint/.test(log.detail || ''), 'Mailchimp: linktolead-crossed-blueprint (test mode)');
c = await (await cross({ request: post('/api/cross', { token: nia, to: 'blueprint' }), env })).json();
ok(c.already === true && DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE kind = 'crossed'").get().n === 1, 'once per door');
ok((await cross({ request: post('/api/cross', { token: nia, to: 'elsewhere' }), env })).status === 400, 'only the two doors');
const bc = fs.readFileSync('public/app.js', 'utf8'), ns = fs.readFileSync('public/northstar/app.js', 'utf8');
ok(bc.includes("r.me.origin === 'northstar'") && bc.includes("openConfirm({ to: 'blueprint'") && ns.includes("r.me.origin !== 'blueprint'") && ns.includes("openConfirm({ to: 'northstar'"), 'the Base Camp and the North Star ask once');
done();
