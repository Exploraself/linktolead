// Everyone gets an answer (Alexandru, 3 Nov 2026): every payment and every
// refund request reaches Alexandru by email and in /mentor; the person gets a
// copy of their refund request with a link to their conversation, signed by
// their mentor at ExploraSelf (never Alexandru by name); an answer from /mentor
// in that conversation sends a short notification. Nothing ever says money
// was refunded (rule 6). No network: Resend and Stripe are faked.

import { readFileSync } from 'node:fs';
import { onRequestPost as refund } from '../functions/api/refund.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { onRequestGet as threadGet } from '../functions/api/thread.js';
import { applyPaid } from '../functions/_stripe.js';
import { refundReceipt, messageNotice, paymentNotice, refundNotice } from '../functions/_letters.js';
import { fakeD1, post, tally } from './_d1.mjs';

const { ok, done } = tally('answered');
const B = 'https://linktolead.exploraself.com';
const sent = [];
globalThis.fetch = async (url, opts = {}) => {
  if (String(url).includes('api.resend.com')) { sent.push(JSON.parse(opts.body)); return { ok: true, json: async () => ({ id: 'e' }) }; }
  return { ok: false, status: 503, headers: new Headers(), json: async () => ({}), text: async () => 'offline' };
};
const DB = fakeD1();
const KEY = 'k'.repeat(24);
const env = { DB, MENTOR_KEY: KEY, RESEND_API_KEY: 'r', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome', STRIPE_SECRET_KEY: 'rk_test_51abc' };
const to = (addr) => sent.filter((m) => [].concat(m.to).includes(addr));

// The letters.
const R = refundReceipt(B, { first: 'Rita', what: 'The LAB', url: `${B}/ground-plan/#ask` });
ok(/^Hi Rita,/.test(R.text) && /received your request for a refund of The LAB/.test(R.text) && /sorry/.test(R.text) && /glad we can help/.test(R.text) && R.html.includes('/ground-plan/#ask') && /Your mentor at ExploraSelf/.test(R.text), 'the refund copy: received, sorry, glad to help, their conversation, from their mentor at ExploraSelf');
ok(!/Alexandru/.test(R.text) && !/refunded/i.test(R.text), 'it never names Alexandru, and never says money was refunded');
const N = messageNotice(B, { first: 'Rita', url: `${B}/ground-plan/#ask` });
ok(N.subject === 'There is a message for you from your mentor at ExploraSelf' && N.html.includes('/ground-plan/#ask') && !/Alexandru/.test(N.text), 'the notification: a message from your mentor at ExploraSelf, one button, no name');
ok(/\[Test\] New payment: The LAB, \$97/.test(paymentNotice(B, { name: 'Rita', email: 'r@x.com', what: 'The LAB', amount: '$97', test: true }).subject), 'the payment notice names what, how much, and test mode');
ok(/Refund request: The LAB/.test(refundNotice(B, { name: 'Rita', email: 'r@x.com', what: 'The LAB' }).subject), 'the refund notice to Alexandru');

// A founder with an account asks for a refund.
const s = await (await signup({ request: post('/api/signup', { first: 'Rita', last: 'Example', email: 'rita@example.com', consent: false }), env: { DB } })).json();
const r = await refund({ request: post('/api/refund', { step: 'unshakeable', name: 'Rita Example', email: 'rita@example.com', token: s.token }), env });
ok(r.status === 200, 'the Unshakeable Assessment can be asked back');
ok(to('alex@exploraself.com').some((m) => /Refund request: The Unshakeable Assessment/.test(m.subject)), 'Alexandru gets an email');
const mine = to('rita@example.com').find((m) => /refund/i.test(m.subject));
ok(mine && mine.html.includes('/ground-plan/#ask'), 'the founder gets their copy, with the link to their conversation');
const note = DB.raw.prepare("SELECT id, domain, status, body FROM note WHERE student_id = ?").get(s.token);
ok(note && note.domain === 'refund' && note.status === 'new' && /The Unshakeable Assessment/.test(note.body), 'the request waits in their conversation (and in /mentor → Inbox)');
const th = await (await threadGet({ request: new Request(`${B}/api/thread?t=${s.token}`), env })).json();
ok(th.items && th.items.some((x) => x.from === 'founder' && /Refund request/.test(x.body)), 'they see it in their conversation in Base Camp');

// The answer from /mentor: a notification email, the words in Base Camp.
sent.length = 0;
const a = await mentorPost({ request: new Request(`${B}/api/mentor`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-mentor-key': KEY }, body: JSON.stringify({ action: 'reply', note: note.id, reply: 'Of course. Tell me what did not work for you, and I will refund it.' }) }), env });
const aj = await a.json();
const notif = to('rita@example.com')[0];
ok(aj.ok && aj.emailed && notif && notif.subject === 'There is a message for you from your mentor at ExploraSelf' && !notif.html.includes('Tell me what did not work'), 'the answer sends only the notification; the words stay in their conversation');
const th2 = await (await threadGet({ request: new Request(`${B}/api/thread?t=${s.token}`), env })).json();
ok(th2.items.some((x) => x.from === 'mentor' && /Tell me what did not work/.test(x.body)), 'the answer is in their conversation');

// A payment: Alexandru hears once.
sent.length = 0;
const paid = { id: 'cs_test_77', object: 'checkout.session', payment_status: 'paid', amount_total: 9700, currency: 'usd', livemode: false, client_reference_id: s.token, metadata: { student: s.token, step: 'lab' } };
await applyPaid(env, DB, B, paid);
await applyPaid(env, DB, B, paid);
const notices = to('alex@exploraself.com').filter((m) => /New payment/.test(m.subject));
ok(notices.length === 1 && /\[Test\] New payment: The LAB, \$97/.test(notices[0].subject), 'every payment reaches Alexandru, once');
ok(to('rita@example.com').some((m) => /It’s unlocked/.test(m.subject)), 'and the founder still gets their own letter');

// /mentor: first on Today, and the Refunds tab answers in the conversation.
const ui = readFileSync(new URL('../public/mentor/mentor.js', import.meta.url), 'utf8');
ok(/function todayHTML\(S\) \{\n  return `\$\{firstHTML\(\)\}/.test(ui) && ui.includes("'Paid in the last 7 days'") && ui.includes("'Refund requests open'") && ui.includes("'Questions waiting'"), 'Today opens with payments, refunds and questions');
ok(ui.includes('Answer in their conversation'), 'Refunds: answer in their conversation');
const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
ok(app.includes("['unshakeable', { price: '$9.99' }]"), 'Base Camp: the Unshakeable Assessment in Ask for a refund');
done();
