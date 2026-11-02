// The team invitation (Alexandru, 2 Nov 2026): adding an address in /mentor
// sends "You're on the ExploraSelf team" with a button to start. With an
// account, the button signs them in; without one, it asks them to make the
// free account with that address first. Everything they send goes out signed
// by Alexandru, and replies come back to him.

import { onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { teamInvite, TEAM_WHY, TEAM_MISSION, TEAM_VISION, GOOD_WORDS } from '../functions/_letters.js';
import { fakeD1, fakeResend, tally } from './_d1.mjs';
import { readFileSync } from 'node:fs';

const { ok, done } = tally('team-invite');
const sent = fakeResend();
const DB = fakeD1();
const env = { DB, MENTOR_KEY: 'k'.repeat(24), RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome' };
const B = 'https://linktolead.exploraself.com';
const req = (path, { method = 'GET', body, key } = {}) => new Request(B + path, { method,
  headers: { 'content-type': 'application/json', ...(key ? { 'x-mentor-key': key } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
const add = async (email) => (await mentorPost({ request: req('/api/mentor', { method: 'POST', key: env.MENTOR_KEY, body: { action: 'team-add', email } }), env })).json();

// The letter itself.
const L1 = teamInvite(B, { to: 'a@example.com', signinUrl: `${B}/ground-plan/?signin=abc` });
ok(L1.subject === 'Welcome to the ExploraSelf team' && L1.html.includes(`${B}/ground-plan/?signin=abc`) && /Open my account/.test(L1.html), 'with an account: one button that signs them in');
// Honoured to join (Alexandru, 2 Nov 2026): the honour, why we exist, the mission and the vision word for word, where they come in.
ok(/It is an honour to welcome you/.test(L1.text) && L1.text.includes(TEAM_MISSION.slice(1)) && L1.text.includes(TEAM_VISION.slice(1)) && L1.text.includes(TEAM_WHY.slice(1)) && /where you come in/.test(L1.text) && /Good People Company/.test(L1.text), 'the honour, why we exist, the mission and the vision, and where they come in');
ok(/<img [^>]*border-radius:50%/.test(L1.html) && /Alexandru Cojocari · ExploraSelf/.test(L1.text), 'signed by Alexandru with the photo and the handwritten signature');
ok(!/Free assessments/.test(L1.text) && !/P\.S\./.test(L1.text) && !GOOD_WORDS.some((g) => L1.text.includes(g)), 'no offer, no assessments, no founder encouragement line: a letter to the team');
ok(/Hi Sheba,/.test(teamInvite(B, { first: 'SHEBA', signinUrl: 'x' }).text), 'greets them by first name when their account has one');
ok(/^Hi,/.test(L1.text) && /thank you/i.test(L1.text) && /The team and I are here for you/.test(L1.text) && /signed by me/.test(L1.text) && /replies come back to me/.test(L1.text), 'greets, thanks, says the team is here, and that replies come back to Alexandru');
ok(!/P\.S\./.test(L1.text) && !/Unshakeable/.test(L1.text), 'no offer: it is for the team');
const L2 = teamInvite(B, { to: 'b@example.com' });
ok(/Make my free account/.test(L2.html) && L2.text.includes('b@example.com') && L2.html.includes(`${B}/north3/#join`), 'without an account: make the free account with this address first');

// Without an account.
let j = await add('new.member@example.com');
ok(j.ok && j.invited === true && sent.length === 1 && sent[0].body.to[0] === 'new.member@example.com' && /Make my free account/.test(sent[0].body.html), 'added with no account: the invitation asks them to make one');

// With an account: a sign-in link that works.
await signup({ request: new Request(B + '/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ first: 'Sheba', last: 'T', email: 'sheba.t@example.com', consent: false, source: 'home', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1' }) }), env });
const before = sent.length;
j = await add('Sheba.T@example.com');
const inv = sent.slice(before).find((m) => m.body.to[0] === 'sheba.t@example.com');
ok(j.ok && j.invited && inv && /\/ground-plan\/\?signin=[A-Za-z0-9_-]+/.test(inv.body.html) && /Open my account/.test(inv.body.html), 'added with an account: the invitation signs them in at one tap');

// Email off: still added, and /mentor says plainly that the invitation did not go.
const env2 = { ...env, RESEND_API_KEY: '' };
const j2 = await (await mentorPost({ request: req('/api/mentor', { method: 'POST', key: env.MENTOR_KEY, body: { action: 'team-add', email: 'third@example.com' } }), env: env2 })).json();
ok(j2.ok && j2.invited === false && j2.inviteWhy && j2.team.some((m) => m.email === 'third@example.com'), 'email off: on the team anyway, and the reason is shown');

const js = readFileSync('public/mentor/mentor.js', 'utf8');
ok(js.includes('An invitation is on its way to them') && js.includes('the invitation did not send'), '/mentor says whether the invitation went');
ok(js.indexOf('id="team"') < js.indexOf('${mailchimpHTML()}') && js.indexOf('${mailchimpHTML()}') < js.indexOf('${mentorsHTML()}'), 'Settings opens with the team first');

done();
