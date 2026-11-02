// The email journey map (scripts/email-map.mjs, AGENTS.md rule 14): every
// letter builder in functions/_letters.js is on the map, every course letter
// is there, each one renders, and the page reads them in journey order.

import { readFileSync } from 'node:fs';
import * as L from '../functions/_letters.js';
import { COURSE_LETTERS } from '../functions/_course-letters.js';
import { ENTRIES, STAGES, ICONS, collect, page } from '../scripts/email-map.mjs';
import { tally } from './_d1.mjs';

const { ok, done } = tally('email-map');

// Every builder that makes a letter is on the map.
const builders = Object.entries(L).filter(([k, v]) => typeof v === 'function' && /(Letter|Welcome|Notice)$/.test(k)).map(([k]) => k);
ok(builders.length >= 10, `found the letter builders (${builders.length})`);
const mapped = new Set(ENTRIES.map((e) => e.fn));
for (const b of builders) ok(mapped.has(b), `${b} is on the email map (add it to ENTRIES in scripts/email-map.mjs)`);
ok(mapped.has('courseLetter'), '12 Days to Start Winning is on the map');

// Every entry has a stage, an icon and plain words for when and who.
const stageKeys = new Set(STAGES.map((s) => s.key));
for (const e of ENTRIES) {
  ok(stageKeys.has(e.stage), `${e.id}: a known stage`);
  ok(ICONS[e.icon], `${e.id}: an icon that exists`);
  ok(e.when && e.who && e.from && e.sentBy, `${e.id}: when, who, page and sender are filled in`);
  ok(!/\b(he|him|his)\b/.test(`${e.when} ${e.who} ${e.also || ''}`), `${e.id}: "Alexandru and the team", never he/him`);
}
for (const s of STAGES) ok(ICONS[s.icon], `stage ${s.key}: an icon that exists`);

// Without the exploraself repo, the linktolead letters alone, in order.
const data = await collect({});
const singles = ENTRIES.filter((e) => !e.course).length;
ok(data.letters.length === singles + COURSE_LETTERS.length, `every letter rendered (${data.letters.length})`);
ok(!data.withExploraself, 'no exploraself letters without the repo');
for (const l of data.letters) ok(l.subject && /<html/.test(l.html) && l.text, `${l.id}: subject, html and text`);
const order = data.letters.map((l) => STAGES.findIndex((s) => s.key === l.stage));
ok(order.every((v, i) => i === 0 || v >= order[i - 1]), 'letters run in journey order');
ok(data.letters.filter((l) => l.group === 'course').map((l) => l.day).join() === COURSE_LETTERS.map((_, i) => i).join(), 'the 14 course letters, day by day');

const html = page(data);
ok((html.match(/data-open="/g) || []).length === data.letters.length, 'one button per letter');
ok(/The results letters of exploraself\.com were not drawn/.test(html), 'says plainly when the exploraself letters are missing');
ok(/name="robots" content="noindex/.test(html), 'kept out of search');
ok(!/constellation|horoscope|most founders|incubator/i.test(html), 'no banned words on the map');
ok(/AGENTS\.md rule 14/.test(html), 'the page says how it is kept up to date');

const agents = readFileSync(new URL('../AGENTS.md', import.meta.url), 'utf8');
ok(/## 14\. Every material follows a change; every email is on the map/.test(agents), 'AGENTS.md rule 14');
ok(!/x-a30ae6b34bdce23dff3a21c2/.test(agents + readFileSync(new URL('../scripts/email-map.mjs', import.meta.url), 'utf8')), 'the unlisted internal folder is never named in this public repo');

done();
