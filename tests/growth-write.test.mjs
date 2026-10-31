// Writing in the Massive Growth Plan (31 Oct 2026): full accounts fill in its
// blanks online, right in the plan at the end of the North Star. Every blank
// has a fixed id (mgp-7.2), the server keeps its own list, a non-full account
// is refused, deleting an account deletes the words, filling a step never
// ticks it, Blueprint founders reach the plan through the Library and the
// crossing, and /mentor shows what they wrote under each step.

import vm from 'node:vm';
import fs from 'node:fs';
import { GROWTH_BLANK_IDS, BLANKS, BLANK_MAX, GROWTH_IDS } from '../functions/_growth.js';
import { STUDENT_TABLES } from '../functions/_shared.js';
import * as growthApi from '../functions/api/growth-plan.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as complete } from '../functions/api/complete.js';
import { onRequestPost as accountDelete } from '../functions/api/account-delete.js';
import { onRequestPost as planTick } from '../functions/api/plans/tick.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { onRequestGet as mGet } from '../functions/api/mentor.js';
import { growthWritten } from '../public/mentor/dash.js';
import { LIBRARY } from '../public/content.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('growth-write');
const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const box = { window: {} };
vm.createContext(box);
vm.runInContext(read('public/northstar/growth-plan.js'), box);
vm.runInContext(read('public/northstar/growth.js'), box);
const GP = box.window.GrowthPlan, GV = box.window.GrowthView;
const steps = [...GP.domains.flatMap((d) => d.steps), GP.plus];

// ── Blank ids ───────────────────────────────────────────────────────────────
const fromFile = steps.flatMap((s) => Array.from({ length: ((s.lines || []).join('\n').match(/_{3,}/g) || []).length }, (_, i) => `${s.id}.${i + 1}`));
ok(JSON.stringify(GROWTH_BLANK_IDS) === JSON.stringify(fromFile), `the server’s ${GROWTH_BLANK_IDS.length} blank ids are exactly the file’s, in order`);
ok(steps.every((s) => BLANKS[s.id] === ((s.lines || []).join('\n').match(/_{3,}/g) || []).length) && Object.keys(BLANKS).join() === GROWTH_IDS.join(), 'each step’s count of blanks matches its lines');
ok(JSON.stringify(GV.blankIds(GP)) === JSON.stringify(fromFile) && new Set(fromFile).size === fromFile.length, 'the page draws the same ids, each once');
ok(fromFile[0] === 'mgp-1.1' && fromFile.includes('mgp-7.5') && !fromFile.includes('mgp-7.6') && !fromFile.some((id) => id.startsWith('mgp-21.')), 'counted across a step’s lines (mgp-7.1 … mgp-7.5); step 21 has none');
// mgp-3: two blanks on its first line, two on its second → 3.1 3.2 | 3.3 3.4.
const h3 = GV.html(GP, { done: {}, write: true }).split('id="gp-step-mgp-3"')[1].split('</ul>')[0];
const li = h3.split('<li>').slice(1).map((x) => [...x.matchAll(/data-blank="([^"]+)"/g)].map((m) => m[1]).join(','));
ok(li.join(' | ') === 'mgp-3.1,mgp-3.2 | mgp-3.3,mgp-3.4', 'numbered in order, across lines');

// ── What the page draws ─────────────────────────────────────────────────────
const W = GV.html(GP, { done: {}, write: true }), R = GV.html(GP, { done: {} });
const J_SIZE = () => { const J = read('public/northstar/app.js'); return J.includes('function gpSize(el)') && J.includes("el.style.height = el.scrollHeight + 'px'") && J.includes("if (e.key === 'Enter' && !e.shiftKey && t && t.dataset && t.dataset.blank) { e.preventDefault(); t.blur(); }"); };
const fields = [...W.matchAll(/<textarea class="gp-in" rows="1" data-blank="([^"]+)"/g)].map((m) => m[1]);
ok(JSON.stringify(fields) === JSON.stringify(fromFile) && !W.includes('___'), 'a full account: every run of ___ is a field, in place');
ok((W.match(/placeholder="(day|date)"/g) || []).length === (R.match(/<small class="gp-hint">/g) || []).length && !W.includes('gp-hint'), '“(day)” and “(date)” become the field’s placeholder');
ok(/maxlength="500"/.test(W) && /aria-label="The standard I hold others to, but do not keep myself: …"/.test(W) && /aria-label="[^"]*\(1 of 2\)"/.test(W), 'each field: at most 500, named by its own line');
ok(!/ value="/.test(W) && !/<textarea[^>]*>[^<]/.test(W), 'the drawing holds no answers: app.js puts them in, so typing never redraws the section');
ok(J_SIZE(), 'a field widens with what is written and wraps at the end of its line, so nothing typed is hidden; Enter finishes it');
ok(!R.includes('<textarea') && !R.includes('<input') && R.includes('class="gp-blank"') && R.includes('data-act="gp-complete"') && R.includes('>Complete your account to write here</button>'), 'not full, or signed out: lines, not fields, and one link to complete the account');
ok(!W.includes('gp-complete') && (W.match(/data-saved="/g) || []).length === 20, 'a full account: no link, and a quiet “Saved” place under each step');
const PRIV = 'Only you, and Alexandru and the team, can read what you write here.';
ok(W.includes(PRIV) && R.includes(PRIV) && W.indexOf(PRIV) > W.indexOf('class="gp-head"') && W.indexOf(PRIV) < W.indexOf('class="gp-dom"'), 'under the plan header: “Only you, and Alexandru and the team, can read what you write here.”');
ok(!/\b(he|him|his)\b/i.test((W + R).replace(/<[^>]+>/g, ' ')), 'never he or him');

// ── The page’s code ─────────────────────────────────────────────────────────
const J = read('public/northstar/app.js');
ok(J.includes('const gpWrite = () => signedIn() && Array.isArray(GP_MISSING) && GP_MISSING.length === 0;') && J.includes('GP_MISSING = me.me.missing'), 'full means me.missing is empty (/api/state, the rule from #95)');
ok(J.includes("GP_TIMER[id] = setTimeout(() => gpSave(id), 900)") && J.includes("addEventListener('focusout'") && J.includes('gpSay(id, \'Saved\')'), 'saved a moment after typing stops, and when the field loses focus; then a quiet “Saved”');
ok(J.includes("localStorage.setItem(GPK, JSON.stringify(L))") && J.includes('for (const id of Object.keys(L.pending)) GP_WORDS[id]'), 'the device copy first (rule 8); what the account has not got yet is sent again');
ok(J.includes("import('/reset-box.js').then((m) => m.openComplete(") && /async function gpComplete\(\) \{\s*if \(!signedIn\(\)\) \{ menuSignin\(\); return; \}/.test(J), 'the link: signed in, the existing complete box; signed out, the North Star sign-in');
ok(!/gpType[\s\S]{0,400}render\(\)/.test(J.slice(J.indexOf('function gpType'), J.indexOf('async function gpSave'))) && J.includes("put('s-growth', pGrowth());\n    gpFill();"), 'typing never redraws: values go in after each drawing');
ok(!/growthTick|GP_DONE\[/.test(J.slice(J.indexOf('function gpType'), J.indexOf('const gpFlush'))), 'writing never ticks a step');
ok(/\.gp-in\{[^}]*font:500 16px/.test(read('public/northstar/crown.css')), 'fields are 16px, so a phone never zooms in and jumps');

// ── The API ─────────────────────────────────────────────────────────────────
const env = { DB: fakeD1(), RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mentor-key-123', MAILCHIMP_MODE: 'test' };
fakeResend();
const raw = env.DB.raw;
const write = (token, blank, text) => growthApi.onRequestPost({ request: post('/api/growth-plan', { token, blank, text }), env });
const words = async (token) => (await (await growthApi.onRequestGet({ request: get(`/api/growth-plan?t=${token}`), env })).json());
// A simple account (from a sales page): not full.
const sam = (await (await signup({ request: post('/api/signup', { first: 'Sam', last: 'Simple', email: 'sam@example.com', consent: true, type: 'simple' }), env })).json()).token;
const st = await (await stateGet({ request: get(`/api/state?t=${sam}`), env })).json();
ok(Array.isArray(st.me.missing) && st.me.missing.length > 0, '/api/state: a simple account is not full (me.missing)');
let r = await write(sam, 'mgp-1.1', 'Being on time');
ok(r.status === 403 && (await r.json()).error === 'Complete your account to write in your Growth Plan.', 'a non-full account is refused, with a plain message');
ok(raw.prepare('SELECT COUNT(*) AS n FROM growth_word').get().n === 0, '… and nothing is saved');
r = await complete({ request: post('/api/complete', { token: sam, noCompany: true, interest: 'Higher income', industry: 'Other', password: 'a-long-password' }), env });
ok(r.status === 200, 'completing the account (the existing box’s call)');
r = await write(sam, 'mgp-1.1', '  Being on time\u0000  ');
let j = await r.json();
ok(r.status === 200 && j.text === 'Being on time' && j.at, 'now full: saved, cleaned like the other answers');
await write(sam, 'mgp-1.2', 'x'.repeat(BLANK_MAX + 100));
let g = await words(sam);
ok(g.words['mgp-1.1'] === 'Being on time' && g.words['mgp-1.2'].length === BLANK_MAX, `GET returns the words; at most ${BLANK_MAX} characters`);
await write(sam, 'mgp-1.2', 'Changed my mind');
g = await words(sam);
ok(g.words['mgp-1.2'] === 'Changed my mind' && raw.prepare("SELECT COUNT(*) AS n FROM growth_word WHERE blank_id = 'mgp-1.2'").get().n === 1, 'written again: one row, the new text');
await write(sam, 'mgp-1.2', '   ');
g = await words(sam);
ok(!('mgp-1.2' in g.words) && raw.prepare("SELECT COUNT(*) AS n FROM growth_word WHERE blank_id = 'mgp-1.2'").get().n === 0, 'an empty text deletes the row');
for (const bad of ['mgp-1.4', 'mgp-1.0', 'mgp-21.1', 'mgp-22.1', 'mgp-1', 'x', '']) ok((await write(sam, bad, 'Hi')).status === 400, `unknown blank refused: “${bad}”`);
ok((await write('x'.repeat(48), 'mgp-1.1', 'Hi')).status === 401 && (await growthApi.onRequestGet({ request: get('/api/growth-plan'), env })).status === 401, 'signed out: 401');
// Every blank of step 2 filled: still not ticked.
await write(sam, 'mgp-2.1', 'A loss I never named'); await write(sam, 'mgp-2.2', 'Freedom for my family');
g = await words(sam);
ok(g.count === 0 && !g.done['mgp-2'], 'filling every blank of a step does not tick it');
r = await (await growthApi.onRequestPost({ request: post('/api/growth-plan', { token: sam, step: 'mgp-2', done: true }), env })).json();
ok(r.count === 1 && r.done['mgp-2'] && (await words(sam)).words['mgp-2.1'], 'the tick stays manual, and the words stay');
const tk = await (await planTick({ request: post('/api/plans/tick', { token: sam, step: 'work-1', done: true }), env })).json();
ok(tk.count === 1, 'the Account Plans’ count is still their own');
// A full account from the start (the full form, with a password).
const fay = (await (await signup({ request: post('/api/signup', { first: 'Fay', last: 'Full', email: 'fay@example.com', consent: true, type: 'full', company: 'Fay & Co', interest: 'Higher income', industry: 'Other', password: 'a-long-password', confirm: 'a-long-password' }), env })).json()).token;
ok((await write(fay, 'mgp-7.5', 'I tell Ana by Friday')).status === 200, 'a full sign-up writes at once');

// ── /mentor ─────────────────────────────────────────────────────────────────
const K = { 'x-mentor-key': 'mentor-key-123' };
const M = await (await mGet({ request: new Request('https://x/api/mentor', { headers: K }), env })).json();
const S = M.students.find((s) => s.email === 'sam@example.com');
ok(S.growth_words === 3 && S.growth_ticks === 1, 'roster: words counted (3), “Growth plan x/21” unchanged (1)');
const one = await (await mGet({ request: new Request(`https://x/api/mentor?growth=${sam}`, { headers: K }), env })).json();
ok(one.ok && one.ticks.length === 1 && one.words.length === 3 && one.words.every((w) => w.updated_at), 'drawer: GET ?growth=id → ticks, and every word with the date of its change');
ok((await mGet({ request: new Request(`https://x/api/mentor?growth=${sam}`), env })).status === 401, 'only with the mentor key');
const G = growthWritten(GP, Object.fromEntries(one.ticks.map((t) => [t.step_id, t.done_at])), one.words);
ok(G.length === 1 && G[0].name === GP.domains[0].name && G[0].steps.map((x) => x.n).join() === '1,2', 'drawer: steps grouped by domain, only those written in or ticked');
const s1 = G[0].steps[0], s2 = G[0].steps[1];
ok(s1.lines[0].some((p) => p.w && p.t === 'Being on time') && s1.lines[1].some((p) => !p.w && /_{3,}/.test(p.t)) && !s1.at && s1.changed, 'under each step: their words inside its own lines, empty blanks still lines, the date of the last change');
ok(s2.at && s2.lines.flat().filter((p) => p.w).map((p) => p.t).join() === 'A loss I never named,Freedom for my family', 'a ticked step: its tick date and its words');
const MJ = read('public/mentor/mentor.js');
ok(MJ.includes("api('?growth=' + encodeURIComponent(id))") && MJ.includes('loadGrowthWords(id)') && MJ.includes("'ticked ' + esc(day(x.at))") && MJ.includes("' · last change ' + esc(day(x.changed))"), 'the drawer fetches it when it opens and shows the dates');
ok(MJ.includes('const gpCount = (s) => `${Number(s.growth_ticks) || 0}/${gpTotal()}`;') && MJ.includes('<th>Growth plan</th>'), 'the roster keeps “Growth plan x/21” as it is');

// ── Deleting an account deletes the words ───────────────────────────────────
ok(STUDENT_TABLES.includes('growth_word'), 'growth_word is one of the founder’s tables');
const before = raw.prepare('SELECT COUNT(*) AS n FROM growth_word WHERE student_id = ?').get(sam).n;
r = await accountDelete({ request: post('/api/account-delete', { token: sam, confirm: 'sam@example.com' }), env });
ok(r.status === 200 && before === 3 && raw.prepare('SELECT COUNT(*) AS n FROM growth_word WHERE student_id = ?').get(sam).n === 0 && raw.prepare('SELECT COUNT(*) AS n FROM plan_tick WHERE student_id = ?').get(sam).n === 0, 'deleting the account deletes everything they wrote and ticked');
ok(raw.prepare('SELECT COUNT(*) AS n FROM growth_word WHERE student_id = ?').get(fay).n === 1, 'and nobody else’s');

// ── From the Blueprint: the Library link, through the crossing ──────────────
const mgp = LIBRARY.growth.find((b) => b.k === 'mgp'), others = [...LIBRARY.growth, ...LIBRARY.books].filter((b) => b.k !== 'mgp');
ok(mgp.online === '/northstar/#growth-plan' && others.every((b) => !b.online), 'the Massive Growth Plan card, and only it, links to the plan in the North Star');
const AJ = read('public/app.js');
ok(AJ.includes('${b.online ? `<a class="lib-online" href="${esc(b.online)}">Fill it in online →</a>` : \'\'}'), 'the Library card: “Fill it in online →”');
ok(J.includes("if (location.hash === '#growth-plan') UI.toPlan = true;") && J.includes("if (UI.toPlan) setTimeout(() => toPlan(), 300);") && J.includes("else if (location.hash === '#growth-plan') toPlan(true);"), 'the North Star lands on the plan, not the top');
ok(J.includes("m.openConfirm({ to: 'northstar'") && J.includes("if (UI.toPlan || location.hash === '#growth-plan') toPlan();"), 'a Blueprint founder crosses with the one question (#92), then lands on the plan');
ok(/function toPlan\(smooth\) \{\s*const g = document\.getElementById\('s-growth'\)/.test(J) && J.includes("root.style.scrollBehavior = 'auto';"), 'the plan is the section #s-growth; arriving, it jumps straight there');
ok(!/\/library\/[^"'\s)]*\.pdf/.test(J), 'still no direct PDF link in the North Star');
done();
