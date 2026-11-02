// /mentor, 2 Nov 2026 (Alexandru's picks 1, 2 and 7): "Your 3 for today",
// letters already written from the founder's own answers, and five tabs
// with icons where Back and Forward work.

import { draftLetter, topThree, newestWord, KIND_OF, DRAFT_KINDS, BOARDROOM_PRICE, today, theirWords } from '../public/mentor/dash.js';
import { LADDER } from '../public/content.js';
import { LEVELS4 } from '../public/levels-v4.js';
import { tally } from './_d1.mjs';
import fs from 'node:fs';

const { ok, done } = tally('mentor-today');
const DAY = 86400000, now = Date.parse('2026-11-02T12:00:00Z');
const iso = (d) => new Date(now - d * DAY).toISOString();
const O = 'https://linktolead.exploraself.com';

// ── Letters already written ──────────────────────────────────────────────────
const ryan = { id: 'r', name: 'Ryan Brooks', level_list: '1,2,3', written: 9, compass_at: iso(20), ns_flags: JSON.stringify({ pains: ['cash', 'alone'] }) };
const fresh = { id: 'f', name: 'Jake', level_list: '', written: 0, compass_at: null, ns_flags: null };
const nsOnly = { id: 'n', name: 'Olivia Reed', level_list: '', written: 0, compass_at: iso(1), ns_flags: JSON.stringify({ pains: ['clients'] }) };
const noName = { id: 'x', name: '', level_list: '2', written: 1 };

for (const k of Object.keys(DRAFT_KINDS)) {
  const d = draftLetter(ryan, k, { word: 'I say yes to every client who asks.', origin: O });
  ok(d.kind === k && d.body.startsWith('Hi Ryan,') && d.body.includes('The team and I are here for you'), `${k}: greets by first name and says the team is here`);
  ok(!/Launchpad/.test(d.subject + d.body), `${k}: never the word Launchpad`);
}
const c = draftLetter(ryan, 'checkin', { word: 'I say yes to every client who asks.', origin: O });
ok(c.subject === 'How are you, Ryan?' && c.body.includes('Level 03') && c.body.includes('“I say yes to every client who asks.”') && c.used.word, 'check-in: their last level and their own sentence');
ok(c.body.includes(`${O}/ground-plan/`) && /One step for this week/.test(c.body), 'check-in: one thing to do, with the link');
const b = draftLetter(ryan, 'boardroom', { origin: O });
ok(b.body.includes(BOARDROOM_PRICE) && b.body.includes('Levels 04 and 05') && /Reply to this letter/.test(b.body), 'Boardroom: the price, what opens, and how to book (a reply)');
ok(LADDER.find((x) => x.key === 'session').price === BOARDROOM_PRICE, 'the Boardroom price is the one on the ladder');
const w = draftLetter(fresh, 'welcome', { origin: O });
ok(w.subject === 'Welcome, Jake' && w.body.includes(`${O}/northstar/`) && !w.used.pain && !w.used.word, 'welcome: nothing started, so the North Star; nothing invented');
const iv = draftLetter(nsOnly, 'blueprint', { origin: O });
ok(iv.body.includes('“Not enough clients”') && iv.used.pain === 'Not enough clients' && iv.body.includes(`${O}/ground-plan/`), 'invite: the pain they named, and Level 01');
const nn = draftLetter(noName, 'northstar', { origin: O });
ok(nn.body.startsWith('Hi,') && nn.subject === 'Which side needs you first?' && nn.body.includes('Level 02'), 'no name: a plain greeting, never a guess');
const note = draftLetter(ryan, 'note', { origin: O });
ok(note.subject === '' && note.body === 'Hi Ryan,\n\n\n\nThe team and I are here for you, every step of the way.', 'a plain note: the greeting and the close, the middle is the mentor’s');
ok(draftLetter(ryan, 'nope').kind === 'note', 'an unknown kind is a plain note');
const long = 'x'.repeat(400);
ok(draftLetter(ryan, 'checkin', { word: long }).body.includes('x'.repeat(220) + '…'), 'a long sentence is cut, never the whole page');

// Every "next action" and every "Needs you today" row opens a letter kind.
for (const k of ['quiet', 'ready', 'new', 'none', 'ns', 'bp', 'ok', 'paused', 'question']) ok(DRAFT_KINDS[KIND_OF[k]], `${k} opens a known letter`);

// ── Your 3 for today ─────────────────────────────────────────────────────────
const S = [
  { id: 'a', name: 'A', joined_at: iso(1), last_seen_at: iso(1) },
  { id: 'b', name: 'B', joined_at: iso(40), last_seen_at: iso(20) },
  { id: 'c', name: 'C', joined_at: iso(40), last_seen_at: iso(16) },
  { id: 'd', name: 'D', joined_at: iso(0), last_seen_at: iso(0) },
  { id: 'e', name: 'E', joined_at: iso(30), last_seen_at: iso(2) },
];
const Q = [{ student_id: 'e', name: 'E', body: 'Is it for me?', created_at: iso(2) }];
const T = topThree(S, Q, now), all = today(S, Q, now);
ok(T.three.length === 3 && T.three[0].kind === 'question' && T.three.map((x) => x.id).join() === all.slice(0, 3).map((x) => x.id).join(), 'three: the three most urgent, a question first');
ok(T.more.length === all.length - 3 && T.more.length === 2, 'the rest folds under "And N more"');
ok(topThree([], [], now).three.length === 0, 'nothing waiting: nothing to do (the page says "All done")');

// newestWord finds a founder's newest finished sentence.
ok(newestWord([{ id: 'q', text: 'a' }, { id: 'r', text: '  mine ' }], 'r') === 'mine' && newestWord([], 'r') === '' && Array.isArray(theirWords([], LEVELS4)), 'newestWord: theirs or nothing');

// ── The page ─────────────────────────────────────────────────────────────────
const js = fs.readFileSync('public/mentor/mentor.js', 'utf8'), html = fs.readFileSync('public/mentor/index.html', 'utf8');
ok(js.includes("OLD_TABS = { questions: 'inbox', mailchimp: 'settings' }"), 'old addresses (#questions, #mailchimp) still land');
ok(js.includes('history.pushState') && js.includes("addEventListener('popstate'"), 'a history step per tab: Back and Forward walk the cockpit');
ok(['today', 'founders', 'inbox', 'grow', 'settings'].every((k) => new RegExp(`\\b${k}: '<`).test(js)) && js.includes('aria-hidden="true"'), 'one icon per tab, hidden from screen readers');
ok(/@media \(max-width:600px\)\{\s*\.tabs\{position:fixed;left:0;right:0;bottom:0/.test(html) && html.includes('env(safe-area-inset-bottom)'), 'on a phone the tabs sit at the bottom');
ok(js.includes('function threeHTML()') && js.includes('All done. Nothing needs you today.') && js.includes('data-kind='), 'Today opens with Your 3 for today; letter buttons carry their kind');
ok(js.includes('draftLetter(s, k, { word, origin: location.origin })') && js.includes('value="${esc(D.subject)}"'), 'the letter dialog opens already written');
ok(!/data-hint="\$\{esc\(x\.kind === 'ready'/.test(js), 'no hand-picked hints left: the kind decides');

done();
