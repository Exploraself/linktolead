// The two booking pages (Alexandru, 2 Nov 2026): the page and the server keep
// the same rules and questions; every answer and time is checked; the pages
// replace the Google Form everywhere it was.
import fs from 'node:fs';
import { tally } from './_d1.mjs';
import * as P from '../public/book/slots.js';
import * as S from '../functions/_booking.js';
import { BOOKING as LETTERS_BOOKING } from '../functions/_letters.js';
import { BOOKING as CONTENT_BOOKING } from '../public/content.js';

const { ok, done } = tally('book');
const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');

ok(JSON.stringify(P.RULES) === JSON.stringify(S.RULES), 'the same rules on the page and the server');
ok(JSON.stringify(P.CHOICES) === JSON.stringify(S.CHOICES) && JSON.stringify(P.FORMS) === JSON.stringify(S.FORMS), 'the same questions and answers');
ok(P.KINDS.discovery.minutes === 30 && P.KINDS.boardroom.minutes === 60 && S.KINDS.discovery.minutes === 30 && S.KINDS.boardroom.minutes === 60, '30 minutes free, 60 for the 1:1');
ok(S.RULES.days.join() === '2,3,4' && S.RULES.from === 15 && S.RULES.to === 20 && S.RULES.pick === 3, 'Tuesday to Thursday, 15:00–20:00 Rome, three times');

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
ok(js.includes("fetch('/api/book'") && js.includes('d && d.ok') && js.includes("'Sent. Thank you.'") === false && js.includes('Sent. Thank you.'), 'says sent only when the server says ok');
ok(/door\(/.test(js) && js.includes("'/boardroom/'") === false && js.includes('href="/boardroom/"'), 'the 1:1 page: a calm door to /boardroom/ for anyone who may not book it');
ok(LETTERS_BOOKING === CONTENT_BOOKING && LETTERS_BOOKING === 'https://linktolead.exploraself.com/book/boardroom/', 'BOOKING is the Boardroom booking page, in letters and on the site');
const forms = ['public', 'functions'].flatMap((d) => fs.readdirSync(new URL(`../${d}/`, import.meta.url), { recursive: true }).filter((f) => /\.(js|html)$/.test(f)).map((f) => `${d}/${f}`))
  .filter((f) => read(f).includes('forms.gle/opnxfhFTJJg69Qy77'));
ok(forms.length === 0, `no Google Form left (${forms.join(', ') || 'none'})`);
done();
