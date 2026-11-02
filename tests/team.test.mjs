// Team accounts (Alexandru, 2 Nov 2026): every Blueprint level open for the
// team, matched on the signed-in account's own email; every founder keeps the
// ladder. And the profile menu shows the email the account was made with.

import fs from 'node:fs';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { isTeam, TEAM } from '../functions/_team.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('team');

// ── The rule ─────────────────────────────────────────────────────────────────
ok(TEAM.includes('alex@exploraself.com'), 'Alexandru’s address is on the team');
ok(isTeam('Alex@ExploraSelf.com ', {}), 'matched without case or spaces');
ok(!isTeam('', {}) && !isTeam(null, {}) && !isTeam('someone@example.com', {}), 'no email, or anyone else: not the team');
ok(isTeam('test@example.com', { TEAM_EMAILS: 'a@b.co, Test@Example.com' }) && !isTeam('test@example.com', {}), 'more addresses from TEAM_EMAILS in the Pages settings');

// ── /api/state says so, from the account’s own email ────────────────────────
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome' };
fakeResend();
const J = async (r) => [r.status, await r.json()];
const state = async (t) => (await stateGet({ request: get(`/api/state?t=${t}`), env })).json();
const [, a] = await J(await signup({ request: post('/api/signup', { first: 'Alexandru', last: 'Cojocari', email: 'alex@exploraself.com', type: 'simple', landing: 'road3', consent: true }), env }));
const [, b] = await J(await signup({ request: post('/api/signup', { first: 'Sam', last: 'Ray', email: 'sam@example.com', type: 'simple', landing: 'road3', consent: true }), env }));
const sa = await state(a.token), sb = await state(b.token);
ok(sa.me.openAll === true && sa.me.email === 'alex@exploraself.com', 'state: the team account has every level open, and its email');
ok(sb.me.openAll === false && sb.me.email === 'sam@example.com', 'state: a founder keeps the ladder, and sees their own email');
ok((await stateGet({ request: get('/api/state?t=not-a-token-at-all-xxxxxxxx&openAll=1'), env })).status === 404, 'state: nothing a page sends opens anything');

// ── Base Camp: one helper decides every gate ────────────────────────────────
const app = fs.readFileSync('public/app.js', 'utf8');
ok(!/holds\(state\.tier/.test(app), 'Base Camp: no gate reads the tier directly');
ok(app.includes("const team = () => account.joined() && !!state.openAll;") && app.includes("const tierNow = () => (team() ? 'premium' : (state.tier || 'free'));"), 'Base Camp: team access needs a signed-in account the server marked');
ok(app.includes("if (n === 1 || team()) return 'open';"), 'Base Camp: the team can open any level, in any order');
ok(app.includes('state.openAll = !!r.me.openAll;'), 'Base Camp: read from /api/state on every pull');
ok(app.includes("tier: state.tier || 'free',"), 'Base Camp: the founder’s real step is still what is shown');

// ── The profile menu shows the email ────────────────────────────────────────
const pm = fs.readFileSync('public/profile-menu.js', 'utf8');
ok(pm.includes("email: r.me.email || ''") && pm.includes('<span class="pm-mail">${esc(me.email)}</span>'), 'menu: the email under the name, escaped');
ok(pm.includes('.pm-who .pm-mail{') && pm.includes('overflow-wrap:anywhere') && pm.includes(':root[data-theme="dark"] .pm-who .pm-mail{'), 'menu: a long address wraps; readable in light and dark');
ok(pm.includes("all 12 levels open (team)"), 'menu: the team sees why every level is open');

done();
