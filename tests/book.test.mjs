// The two booking pages (Alexandru, 2 Nov 2026): the page and the server keep
// the same rules and questions; every answer and time is checked; the pages
// replace the Google Form everywhere it was.
import fs from 'node:fs';
import { tally, fakeD1, fakeResend, post } from './_d1.mjs';
import { onRequestPost as book } from '../functions/api/book.js';
import * as P from '../public/book/slots.js';
import * as S from '../functions/_booking.js';
import { BOOKING as LETTERS_BOOKING } from '../functions/_letters.js';
import { BOOKING as CONTENT_BOOKING } from '../public/content.js';

const { ok, done } = tally('book');
const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');

ok(JSON.stringify(P.RULES) === JSON.stringify(S.RULES), 'the same rules on the page and the server');
ok(JSON.stringify(P.CHOICES) === JSON.stringify(S.CHOICES) && JSON.stringify(P.FORMS) === JSON.stringify(S.FORMS), 'the same questions and answers');
ok(P.KINDS.discovery.minutes === 30 && P.KINDS.boardroom.minutes === 60 && S.KINDS.discovery.minutes === 30 && S.KINDS.boardroom.minutes === 60, '30 minutes free, 60 for the 1:1');
ok(S.RULES.days.join() === '2,3,4' && S.RULES.from === 15 && S.RULES.to === 20 && S.RULES.min === 1 && S.RULES.pick === 3, 'Tuesday to Thursday, 15:00–20:00 Rome; one time is enough, up to three (Alexandru, 3 Nov 2026)');

// Slots: a fixed Monday noon in Rome, 2 November 2026.
const at = new Date('2026-11-02T11:00:00Z');
for (const kind of ['discovery', 'boardroom']) {
  const a = P.slotsFor(kind, at), b = S.slotsFor(kind, at);
  ok(a.length && JSON.stringify(a) === JSON.stringify(b), `${kind}: the page offers exactly what the server accepts`);
  ok(a.every((t) => S.isSlot(kind, t, at.getTime())), `${kind}: every offered time passes the server`);
  ok(a.every((t) => [2, 3, 4].includes(S.wall(new Date(t)).wd)), `${kind}: only Tuesday, Wednesday, Thursday in Rome`);
}
ok(P.slotsFor('discovery', at).length === 6 * 10 && P.slotsFor('boardroom', at).length === 6 * 5, 'two weeks: six days, ten half hours or five hours a day');
ok(!S.isSlot('boardroom', '2026-11-03T14:30:00.000Z', at.getTime()) && S.isSlot('discovery', '2026-11-03T14:30:00.000Z', at.getTime()), 'the 1:1 starts on the hour, the call on the half hour');
ok(!S.isSlot('discovery', '2026-11-02T15:00:00.000Z', at.getTime()), 'never today');
ok(!S.isSlot('discovery', '2026-11-03T19:00:00.000Z', at.getTime()) && S.isSlot('discovery', '2026-11-03T18:30:00.000Z', at.getTime()) && !S.isSlot('boardroom', '2026-11-03T18:30:00.000Z', at.getTime()) && S.isSlot('boardroom', '2026-11-03T18:00:00.000Z', at.getTime()), 'the last call ends by 20:00 Rome (19:30 for the call, 19:00 for the 1:1)');

// Answers.
const good = S.readAnswers('discovery', { stage: 'solo', struggles: ['clients', 'time'], goals: ['clients', 'runs'], note: '' });
ok(good.ok && !('note' in good.answers), 'discovery: a full set reads; an empty note is left out');
ok(!S.readAnswers('discovery', { stage: 'solo', struggles: ['clients'], goals: ['clients', 'runs'] }).ok, 'discovery: exactly two struggles');
ok(!S.readAnswers('discovery', { stage: 'solo', struggles: ['clients', 'clients'], goals: ['clients', 'runs'] }).ok, 'discovery: two different ones');
ok(!S.readAnswers('discovery', { stage: 'boss', struggles: ['clients', 'time'], goals: ['clients', 'runs'] }).ok, 'discovery: only the words the form offers');
const full = Object.fromEntries(S.FORMS.boardroom.map((f) => [f.k, f.type === 'one' ? S.CHOICES[f.of][0][0] : 'An honest answer']));
ok(S.FORMS.boardroom.length === 20 && S.readAnswers('boardroom', full).ok, 'boardroom: twenty deep questions, a full set reads');
ok(S.FORMS.boardroom.every((f) => f.part) && new Set(S.FORMS.boardroom.map((f) => f.part)).size === 6, 'boardroom: six parts, the four domains between where you are and the hour');
ok(!S.readAnswers('boardroom', { ...full, decision: '' }).ok, 'boardroom: the decision is required');
ok(!S.readAnswers('boardroom', { ...full, decision: 'x'.repeat(301) }).ok, 'boardroom: short answers stay short');
ok(S.BOOK_TAGS.discovery === 'linktolead-book-discovery' && S.BOOK_TAGS.boardroom === 'linktolead-book-boardroom', 'the two approved tag names');

// The pages and the Google Form.
for (const k of ['discovery', 'boardroom']) {
  const h = read(`public/book/${k}/index.html`);
  ok(h.includes(`data-book="${k}"`) && h.includes('<script type="module" src="/book/book.js"></script>') && h.includes('/book/book.css'), `/book/${k}/: one page, drawn by book.js`);
}
const js = read('public/book/book.js');
ok(js.includes("fetch('/api/book'") && js.includes('d && d.ok') && js.includes("'Sent. Thank you.'") === false && js.includes('Sent. Thank you'), 'says sent only when the server says ok');
ok(/door\(/.test(js) && js.includes("'/boardroom/'") === false && js.includes('href="/boardroom/"'), 'the 1:1 page: a calm door to /boardroom/ for anyone who may not book it');
ok(LETTERS_BOOKING === CONTENT_BOOKING && LETTERS_BOOKING === 'https://linktolead.exploraself.com/book/boardroom/', 'BOOKING is the Boardroom booking page, in letters and on the site');
const forms = ['public', 'functions'].flatMap((d) => fs.readdirSync(new URL(`../${d}/`, import.meta.url), { recursive: true }).filter((f) => /\.(js|html)$/.test(f)).map((f) => `${d}/${f}`))
  .filter((f) => read(f).includes('forms.gle/opnxfhFTJJg69Qy77'));
ok(forms.length === 0, `no Google Form left (${forms.join(', ') || 'none'})`);
// One time is enough, up to three; a phone on both (Alexandru, 3 Nov 2026).
for (const [v, want] of [['+39 333 123 4567', '+393331234567'], ['0039 (333) 123-4567', '+393331234567'], ['+1 555 555 0100', '+15555550100'], ['333 123 4567', ''], ['+0 1234567', ''], ['+39 12', ''], ['+39 333 123 4567 89012345', '']]) {
  ok(P.phoneOf(v) === want && S.phoneOf(v) === want, `phone "${v}" → "${want}" on the page and the server`);
}
ok(P.codeFor('Europe/Rome') === '+39' && P.codeFor('America/New_York') === '+1' && P.codeFor('Mars/Base') === '+', 'the phone field starts from the time zone’s country code');
{
  const sent = fakeResend();
  const env = { DB: fakeD1(), RESEND_API_KEY: 're_test', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome' };
  const slots = S.slotsFor('discovery');
  const ask = async (extra, ip) => { const r = await book({ request: post('/api/book', { kind: 'discovery', answers: { stage: 'solo', struggles: ['clients', 'time'], goals: ['clients', 'runs'] }, name: 'Sam Example', email: 'sam@example.com', tz: 'Europe/Rome', ...extra }, ip), env }); return { status: r.status, j: await r.json() }; };
  let r = await ask({ times: [slots[0]], phone: '+39 333 123 4567' }, '1.1.1.1');
  ok(r.status === 200 && r.j.ok && r.j.times.length === 1, 'one time is enough to send');
  r = await ask({ times: [slots[0], slots[1], slots[2]], phone: '+39 333 123 4567' }, '1.1.1.2');
  ok(r.status === 200 && r.j.ok && r.j.times.length === 3, 'three still go');
  r = await ask({ times: [], phone: '+39 333 123 4567' }, '1.1.1.3');
  ok(r.status === 400, 'no time: not sent');
  r = await ask({ times: slots.slice(0, 4), phone: '+39 333 123 4567' }, '1.1.1.4');
  ok(r.status === 400, 'four times: not sent');
  r = await ask({ times: [slots[0], slots[0]], phone: '+39 333 123 4567' }, '1.1.1.5');
  ok(r.status === 400, 'the same time twice: not sent');
  r = await ask({ times: [slots[0]], phone: '333 123' }, '1.1.1.6');
  ok(r.status === 400 && /country code/.test(r.j.error || ''), 'no phone with its country code: not sent, and it says why');
  const row = env.DB.raw.prepare('SELECT phone FROM booking ORDER BY created_at LIMIT 1').get();
  ok(row && row.phone === '+393331234567', 'the phone is kept with the request, in the international form');
  const notice = sent.find((m) => /request from Sam Example/.test(m.body.subject || ''));
  ok(notice && notice.body.html.includes('https://wa.me/393331234567') && notice.body.text.includes('+393331234567'), 'Alexandru’s notice carries the phone and a one-tap WhatsApp link');
  const copy = sent.find((m) => m.body.to === 'sam@example.com' || (Array.isArray(m.body.to) && m.body.to.includes('sam@example.com')));
  ok(copy && /Your time for our call/.test(copy.body.subject) && /Here is the time you suggested/.test(copy.body.text) && copy.body.text.includes('+393331234567'), 'one time: the copy says “your time”, and shows their phone');
}
// "Get my gift on WhatsApp" (3 Nov 2026, the free way, no GREEN-API): the
// business number is set once in /mentor → Settings; the page reads it
// (GET /api/book) and the booking reply carries it, digits only.
{
  const { onRequestPost: mentorPost } = await import('../functions/api/mentor.js');
  const { onRequestGet: bookGet } = await import('../functions/api/book.js');
  const sent = fakeResend();
  const env = { DB: fakeD1(), RESEND_API_KEY: 're_test', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome', MENTOR_KEY: 'k'.repeat(24) };
  let g = await (await bookGet({ request: new Request('https://linktolead.exploraself.com/api/book'), env })).json();
  ok(g.ok && !('waTo' in g), 'no business number yet: the page hears none, so it promises the gift by email only');
  const M = (body) => new Request('https://linktolead.exploraself.com/api/mentor', { method: 'POST', headers: { 'content-type': 'application/json', 'x-mentor-key': env.MENTOR_KEY }, body: JSON.stringify(body) });
  let m = await (await mentorPost({ request: M({ action: 'book-links', whatsapp: '333 12' }), env })).json();
  ok(!m.ok && /country code/.test(m.error || ''), 'a business number without its country code is refused');
  m = await (await mentorPost({ request: M({ action: 'book-links', whatsapp: '+39 351 000 0000' }), env })).json();
  ok(m.ok && m.links.whatsapp === '+393510000000', 'the business WhatsApp number is saved in the international form');
  g = await (await bookGet({ request: new Request('https://linktolead.exploraself.com/api/book'), env })).json();
  ok(g.ok && g.waTo === '393510000000', 'GET /api/book: the page reads the business number, digits only');
  const slots = S.slotsFor('discovery');
  const r = await (await book({ request: post('/api/book', { kind: 'discovery', answers: { stage: 'solo', struggles: ['clients', 'time'], goals: ['clients', 'runs'] }, name: 'Lee Example', email: 'lee@example.com', phone: '+39 333 000 1111', tz: 'Europe/Rome', times: [slots[3]] }, '3.3.3.3'), env })).json();
  ok(r.ok && r.waTo === '393510000000' && !('wa' in r), 'the booking reply carries the business number for the button, and nothing is sent from a server');
  const copy = sent.find((x) => [].concat(x.body.to).includes('lee@example.com'));
  ok(copy && copy.body.text.includes(`Your gift: The Leader’s North Star. ${S.GIFTS.discovery.line}`) && copy.body.html.includes('https://linktolead.exploraself.com/northstar/?utm_source=email&amp;utm_medium=gift&amp;utm_campaign=discovery'), 'the email copy carries the gift, its approved words and its link');
}
// The gift (Alexandru, 3 Nov 2026): his approved words, the same on the page and the server.
ok(JSON.stringify(P.GIFTS) === JSON.stringify(S.GIFTS) && P.giftHref('boardroom', 'whatsapp') === S.giftHref('boardroom', 'whatsapp'), 'the same gifts on the page and the server');
ok(S.GIFTS.discovery.name === 'The Leader’s North Star' && S.GIFTS.discovery.line === 'The reading my team and I use to see a business clearly, for solo founders, small businesses and large companies. Free for you, because you’re now part of ExploraSelf.' && S.GIFTS.discovery.by === 'Alexandru', 'discovery: The Leader’s North Star, in his approved words, in his own voice and signed (3 Nov 2026)');
ok(S.GIFTS.boardroom.name === 'The Massive Growth Plan' && S.GIFTS.boardroom.line.startsWith('20 + 1 steps to accelerate your growth and win with grace') && S.giftHref('boardroom', 'email', 'https://x') === 'https://x/northstar/?utm_source=email&utm_medium=gift&utm_campaign=boardroom#growth-plan', 'boardroom: the Massive Growth Plan, opened on the plan itself (download or fill in)');
ok(!/\$\d|price|only \d|left|hurry/i.test(S.GIFTS.discovery.line + S.GIFTS.boardroom.line), 'no price, no scarcity in the gift words');
const pageJs = read('public/book/book.js');
ok(pageJs.includes('Get my gift on WhatsApp') && pageJs.includes('https://wa.me/${esc(sent.waTo)}?text=${encodeURIComponent(waText(sent))}') && pageJs.includes('Please send me my gift: ${GIFTS[KIND].name}.') && pageJs.includes('if (sent.waTo) {'), 'the last screen: “Get my gift on WhatsApp” only with the number, “Please send me my gift” already written');
ok(pageJs.includes('Open my gift') && pageJs.includes("giftHref(KIND, 'linktolead')"), 'without the number, the gift opens on the page');
ok(pageJs.includes("if (st.kind === 'times') return S.times.length >= RULES.min") && pageJs.includes("kind: 'phone'") && pageJs.includes('Your phone number, for your gift') && pageJs.includes('${eyebrow()}${giftCard()}'), 'the page moves on with one time and asks the phone, for the gift, on both forms');
ok(!/for WhatsApp</.test(pageJs) && !pageJs.includes('sent.wa ?'), 'the phone is never asked “for WhatsApp”, and the page never says a server WhatsApp went');
ok(!fs.existsSync(new URL('../functions/_whatsapp.js', import.meta.url)) && !/green-?api|WA_TOKEN|WA_INSTANCE/i.test(read('README.md') + read('functions/api/book.js') + read('scripts/email-map.mjs')), 'GREEN-API is gone: no _whatsapp.js, no keys, no map entries');
ok(read('public/northstar/index.html').includes(`<span>${S.GIFTS.discovery.line.replace('Free for you', '<b>Free for you')}</b> <i class="hz-by">Alexandru</i></span>`), 'the North Star page carries the premium line near the hero, word for word, signed');
const app = read('public/app.js');
ok(/rstar-p">By the way: this is the reading my team and I use/.test(app) && app.includes('Here it’s yours, free. <span class="rstar-by">Alexandru</span>') && !/reading Alexandru and the team use/.test(app), 'Base Camp: the North Star card in the rail, in Alexandru’s own voice and signed');
done();
