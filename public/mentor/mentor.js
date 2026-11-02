// The Mentor cockpit (approved by Alexandru, 31 Oct 2026): the dashboard, the
// account manager and each founder's work. Loaded by /mentor only, never by a
// founder's page. Every figure comes from the roster the API returns; an empty
// count shows 0. The arithmetic (groups, next action, funnel, filters) lives
// in ./dash.js, where the tests hold it.
//
// Tabs (Alexandru, 2 Nov 2026): Today · Founders · Inbox · Grow · Settings,
// each with a small icon; on a phone they sit at the bottom. Today opens with
// "Your 3 for today". Every letter button opens a letter already written
// (dash.js draftLetter). A row in Founders opens a drawer with every action;
// "Open their work" is the one-founder view, one(id).

import { STEP_KEYS, STEP_NAMES, STEP_SHORT, GROUPS, LANDING_SHORT, summary, filter, pulse, payOf, liveIdsOf, WINDOWS, byLanding, groupOf, nextAction, funnel, today, levelSet, levelCount, launchpadDone, crossedOf,
  told, toldTally, theirWords, SIDES, PAIN_NAMES, WANT_NAMES, VALUE_NAMES, TEAM_NAMES, growthDone, growthGroups, growthWritten, stuckOnSunday, DRAFT_KINDS, KIND_OF, draftLetter, newestWord, topThree, seriesInfo } from './dash.js';
import { LEVELS4, wordOf, briefOf, GOT } from '/levels-v4.js';

const $ = (s) => document.querySelector(s);
const KEY = 'ftb-mentor-key';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let key = ''; try { key = localStorage.getItem(KEY) || ''; } catch { /* private mode */ }
/** A team member signed in to their own ExploraSelf account opens /mentor
 *  without the key (functions/_team.js); the key still works for Alexandru. */
const acct = () => { try { return localStorage.getItem('ftb-token') || ''; } catch { return ''; } };
const H = (extra) => Object.assign({ 'x-mentor-key': key, 'x-account-token': acct() }, extra || {});
const TABS = [['today', 'Today'], ['founders', 'Founders'], ['inbox', 'Inbox'], ['grow', 'Grow'], ['settings', 'Settings']];
/** Old addresses still land in the right place (#questions, #mailchimp before 2 Nov 2026). */
const OLD_TABS = { questions: 'inbox', mailchimp: 'settings' };
/** One small line icon per tab, in the text colour (rule 13); the label carries the meaning. */
const TAB_ICONS = {
  today: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  founders: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5M16 4.5a3.5 3.5 0 010 7M18 15c2 .7 3 2.3 3.5 5"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 2h6l1-2h5"/>',
  grow: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
};
const icon = (k) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${TAB_ICONS[k] || ''}</svg>`;
const tabOf = (h) => { const k = String(h || '').replace(/^#/, ''); const t = OLD_TABS[k] || k; return TABS.some(([x]) => x === t) ? t : 'today'; };
const NO_FILTER = { group: 'all', step: 'all', act: 'all', need: 'all', more: 'all', pay: 'all', joined: 'all' };
let data = null, q = '', flash = '', openId = null;
/** Who paid for real (live Stripe payments), for the Paid filter and Grow. */
let LIVE = new Set();
/** Grow's time window: today, 7 days, 30 days or all. */
let GW = '7';
/** A team account (Alexandru, 2 Nov 2026): reads everything, answers, writes
 *  letters, sends sign-in links, pauses or resumes letters and changes a
 *  step. The pause, delete, team, mentor and Mailchimp buttons are Alexandru's
 *  (the mentor key); the server refuses them anyway (KEY_ONLY in
 *  functions/api/mentor.js). */
const isTeam = () => !!(data && data.you && data.you.team);
/** What this person may do here (functions/_team.js TEAM_RIGHTS): everything
 *  with the mentor key, else the rights ticked for this team member. The server
 *  checks every action; this only hides what they cannot use. */
const can = (right) => !isTeam() || !!(data && data.you && Array.isArray(data.you.can) && data.you.can.includes(right));
let tab = tabOf(location.hash);
let F = { ...NO_FILTER };

const api = async (path, opts) => {
  const r = await fetch('/api/mentor' + (path || ''), Object.assign({ headers: H({ 'content-type': 'application/json' }) }, opts || {}));
  return { ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) };
};
const act = (body) => api('', { method: 'POST', body: JSON.stringify(body) });
const when = (s) => {
  if (!s) return '—';
  const h = (Date.now() - new Date(s)) / 36e5;
  if (h < 1) return 'just now'; if (h < 24) return Math.round(h) + 'h ago';
  const d = Math.round(h / 24); return d + (d === 1 ? ' day ago' : ' days ago');
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "30 Oct 2026". */
const day = (s) => { const d = new Date(s); return isNaN(d) ? '—' : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const STAGES = { build: 'Building', grow: 'Growing', scale: 'Scaling', building: 'Building', growing: 'Growing', scaling: 'Scaling' };
const stageName = (v) => STAGES[v] || (v ? String(v)[0].toUpperCase() + String(v).slice(1) : '—');
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const CROSS_TAG = { blueprint: 'linktolead-crossed-blueprint', northstar: 'linktolead-crossed-northstar' };

/** The founder's photo when they set one, else their initials. */
const PHOTO = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;
function avatar(s, big) {
  const ini = String(s.name || s.email || '?').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return `<span class="av${big ? ' big' : ''}" aria-hidden="true">${s.avatar && PHOTO.test(s.avatar) ? `<img src="${esc(s.avatar)}" alt="">` : esc(ini)}</span>`;
}
const groupPill = (s) => { const g = groupOf(s); return g ? `<span class="pill ${g}">${GROUPS[g].name}</span>` : '<span class="pill">Not started</span>'; };
const levelsBar = (s) => { const L = levelSet(s), n = levelCount(s), has = (i) => (s.level_list ? L.has(i + 1) : i < n);
  return `<span class="prog" role="img" aria-label="${n} of 12 levels">${Array.from({ length: 12 }, (_, i) => `<i class="${has(i) ? 'on' : ''}${i < 3 ? ' free' : ''}"></i>`).join('')}</span>`; };
const landingName = (s) => LANDING_SHORT[s.landing] || '';
/** The Massive Growth Plan: "x/21", and the ticked steps by domain with
 *  their dates. Every word from window.GrowthPlan (/northstar/growth-plan.js). */
const gpTotal = () => (data && data.totalGrowth) || 21;
const gpCount = (s) => `${Number(s.growth_ticks) || 0}/${gpTotal()}`;
function gpList(s) {
  const G = growthGroups(window.GrowthPlan, growthDone(s));
  if (!G.length) return '';
  return `<div class="gpl">${G.map((g) => `<div><h4${g.col ? ` style="--c:${esc(g.col)}"` : ''}>${esc(g.name)}</h4><ul>${g.steps.map((x) => `<li><b style="font-weight:500">${x.n}. ${esc(x.title)}</b><span>${esc(day(x.at))}</span></li>`).join('')}</ul></div>`).join('')}</div>`;
}
/** What they wrote, under each step: their words in bold inside the plan's
 *  own lines, the tick's date, and the date of the last change. */
function gpWords(G) {
  if (!G.length) return '<p class="tiny">Nothing written or ticked yet.</p>';
  return `<div class="gpl">${G.map((g) => `<div><h4${g.col ? ` style="--c:${esc(g.col)}"` : ''}>${esc(g.name)}</h4>${g.steps.map((x) => `<div class="gpw">
    <p class="gpw-t"><b>${x.n}. ${esc(x.title)}</b><span>${x.at ? 'ticked ' + esc(day(x.at)) : 'not ticked'}${x.changed ? ' · last change ' + esc(day(x.changed)) : ''}</span></p>
    ${x.lines.some((l) => l.some((p) => p.w)) ? `<ul>${x.lines.map((l) => `<li>${l.map((p) => (p.w ? `<b>${esc(p.t)}</b>` : esc(p.t))).join('')}</li>`).join('')}</ul>` : ''}</div>`).join('')}</div>`).join('')}</div>`;
}
/** The drawer's Growth Plan, fetched when it opens (GET ?growth=id). */
async function loadGrowthWords(id) {
  const box = document.getElementById('gpw-' + id);
  if (!box) return;
  const r = await api('?growth=' + encodeURIComponent(id));
  if (!r.ok || openId !== id || !document.getElementById('gpw-' + id)) return;
  const done = Object.fromEntries((r.data.ticks || []).map((t) => [t.step_id, t.done_at]));
  box.innerHTML = gpWords(growthWritten(window.GrowthPlan, done, r.data.words || []));
}

function gate(msg) {
  $('#q').hidden = true; $('#tb').hidden = true; $('#tabs').hidden = true; closeDrawer();
  $('#main').innerHTML = `<div class="gate"><h2>Sign in</h2>
    <p><b>On the team?</b> <a href="/ground-plan/#signin">Sign in to your ExploraSelf account</a> with your email and password, then open <b>Mentor</b> in your profile menu. Alexandru adds team addresses in <i>Mentors &amp; team</i>.</p>
    <p style="margin-top:12px">Or enter the mentor key. It is set in Cloudflare as <b>MENTOR_KEY</b>.</p>
    <p style="margin-top:16px;display:flex;gap:6px;max-width:420px"><input id="k" type="password" placeholder="Mentor key" autocomplete="off" style="flex:1;min-width:0"><button type="button" class="ghost" id="k-eye" aria-label="Show the key" aria-pressed="false" style="width:46px;flex:none;padding:0;display:inline-flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></p>
    <p style="margin-top:12px"><button id="go">Open the cockpit</button></p>
    ${msg ? `<p class="err">${esc(msg)}</p>` : ''}</div>`;
  $('#go').onclick = () => { key = $('#k').value.trim(); try { localStorage.setItem(KEY, key); } catch { /* private mode */ } load(); };
  $('#k').onkeydown = (e) => { if (e.key === 'Enter') $('#go').click(); };
  $('#k-eye').onclick = () => { const f = $('#k'), show = f.type === 'password'; f.type = show ? 'text' : 'password'; $('#k-eye').setAttribute('aria-pressed', String(show)); $('#k-eye').setAttribute('aria-label', show ? 'Hide the key' : 'Show the key'); };
}

async function load() {
  if (!key && !acct()) return gate('');
  const r = await api('');
  if (r.status === 401) return gate(key ? 'That key was not accepted.' : 'This account is not on the team yet. Ask Alexandru to add your address, or enter the mentor key.');
  if (r.status === 503) return gate('The database is not attached to this site yet.');
  if (!r.ok) return gate('Could not reach the roster.');
  data = r.data; LIVE = liveIdsOf(data.paid); draw();
}

function tabsHTML() {
  const n = (data.waiting || []).length;
  return TABS.map(([k, label]) => `<button type="button" role="tab" aria-selected="${tab === k}" data-tab="${k}">${icon(k)}<span>${esc(label)}</span>${k === 'inbox' && n ? `<b>${n}<span class="vh"> waiting</span></b>` : ''}</button>`).join('');
}

// ── Today ────────────────────────────────────────────────────────────────────

function groupsHTML(S) {
  const card = (k) => `<button type="button" class="g" style="--c:var(--${k})" data-gcard="${k}"><span class="n">${S.groups[k]}</span><span class="t">${GROUPS[k].name}</span><span class="d">${GROUPS[k].what}</span><span class="act">${GROUPS[k].act} →</span></button>`;
  return `<div class="groups">${['ns', 'bp', 'both'].map(card).join('')}
    <button type="button" class="g" style="--c:var(--gold)" data-newcard><span class="n">${S.newWeek}</span><span class="t">New this week</span><span class="d">${plural(S.total, 'founder', 'founders')} in total · ${S.quiet} quiet for 14+ days${S.groups.none ? ` · ${S.groups.none} not started yet` : ''}</span></button></div>`;
}

const SEV = { question: 'var(--warn)', quiet: 'var(--warn)', ready: 'var(--both)', new: 'var(--gold)' };
function needsHTML(skip = 0) {
  const N = today(data.students, data.waiting).slice(skip);
  const g = (s) => { const k = groupOf(s); return k ? GROUPS[k].name : 'Nothing started yet'; };
  const why = (x) => x.kind === 'question' ? `${x.count > 1 ? `Asked ${x.count} questions` : 'Asked a question'} · waiting for your answer since ${when(x.waitingSince)}<br>“${esc(String(x.text || '').slice(0, 140))}${String(x.text || '').length > 140 ? '…' : ''}”`
    : x.kind === 'quiet' ? `Quiet for ${x.days} days · ${g(x.s)}`
    : x.kind === 'ready' ? 'Finished the free Launchpad · ready for the Boardroom'
    : `New, ${x.days === 0 ? 'today' : x.days === 1 ? 'yesterday' : x.days + ' days ago'} · ${g(x.s)}`;
  const btn = (x) => x.does === 'open' ? `<button class="btn gold" data-open="${esc(x.id)}">${x.button}</button>`
    : `<button class="btn" data-msg="${esc(x.id)}" data-kind="${KIND_OF[x.kind] || 'note'}">${x.button}</button>`;
  const body = N.length ? `<ul class="needs">${N.slice(0, 30).map((x) => `<li><span class="sev" style="--c:${SEV[x.kind]}"></span>
      <div><button type="button" class="linkish" data-drawer="${esc(x.id)}">${esc(x.s.name || x.s.email || '—')}</button><span class="why">${why(x)}</span></div>${btn(x)}</li>`).join('')}</ul>
      ${N.length > 30 ? `<p class="tiny">And ${N.length - 30} more. The Founders tab has everyone.</p>` : ''}`
    : '<p class="hint">Nothing needs you today. No questions waiting, nobody quiet for 14 days or more, nobody new in the last 3 days.</p>';
  return skip ? body : `<div class="panel"><div><h2>Needs you today</h2><p class="sub">Most urgent first. One button each.</p></div>${body}</div>`;
}

function funnelHTML() {
  const Fn = funnel(data.students), top = Fn.rows[0].n;
  const note = !top ? 'No founders yet. The funnel fills as founders sign up.'
    : Fn.worst > 0 ? `Biggest drop: ${Fn.from} → ${Fn.to} (${plural(Fn.drop, 'founder', 'founders')}). Fix this step first.` : 'No drop between the steps yet.';
  return `<div class="panel"><div><h2>From sign-up to paid</h2><p class="sub">The biggest drop is the next thing to fix.</p></div>
    <div class="funnel">${Fn.rows.map((r, i) => `<div class="fr${i === Fn.worst ? ' leak' : ''}"><span>${esc(r.label)}</span><span class="fbar"><i style="width:${top ? Math.round(r.n / top * 100) : 0}%"></i></span><span class="num">${r.n}</span></div>`).join('')}</div>
    <p class="leaknote">${esc(note)}</p>
    <p class="tiny">Launchpad done: wrote in levels 01, 02 and 03. Boardroom: The Boardroom or a higher step. Each line is counted on its own.</p></div>`;
}

function landingHTML() {
  const L = byLanding(data.students).sort((a, b) => b.total - a.total || (a.k ? 0 : 1) - (b.k ? 0 : 1));
  return `<div class="panel"><div><h2>Where they came from</h2><p class="sub">Sign-ups per landing page, and who crossed between the North Star and the Blueprint.</p></div>
    <div class="tw"><table><thead><tr><th>Landing</th><th>Sign-ups</th><th>Last 7 days</th><th>North Star only</th><th>Blueprint only</th><th>Both</th><th>Not started</th></tr></thead><tbody>
      ${L.map((r) => `<tr><td>${esc(r.name)}</td><td class="num">${r.total}</td><td class="num">${r.week}</td><td class="num">${r.ns}</td><td class="num">${r.bp}</td><td class="num">${r.both}</td><td class="num">${r.none}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="tiny">Counted from the sign-ups that recorded their landing; earlier accounts have none.</p></div>`;
}

/** What founders told the North Star, counted across everyone who answered. */
function toldHTML() {
  const T = toldTally(data.students);
  const list = (title, rows) => `<div><h3>${title}</h3>${rows.length ? `<div class="funnel">${rows.slice(0, 8).map((r) => `<div class="fr"><span>${esc(r.name)}</span><span class="fbar"><i style="width:${Math.round(r.n / T.people * 100)}%"></i></span><span class="num">${r.n}</span></div>`).join('')}</div>` : '<p class="tiny">Nobody yet.</p>'}</div>`;
  return `<div class="panel"><div><h2>What founders tell the North Star</h2><p class="sub">${T.people ? `From ${plural(T.people, 'founder', 'founders')} who answered. Real answers only. Write your next ad, video or letter from the top line of “What hurts most”.` : 'Nobody has answered these yet. The lists fill as founders take the North Star.'}</p></div>
    ${T.people ? `<div class="tgrid">${list('What hurts most', T.pains)}${list('What they want most', T.wants)}${list('What they care about', T.values)}${list('The side that needs them first', T.first)}${list('Who works with them', T.team)}</div>` : ''}</div>`;
}

/** Their own sentences from the Blueprint, newest first: the words to reuse. */
function wordsHTML() {
  const W = theirWords(data.words, LEVELS4, 12);
  return `<div class="panel"><div><h2>Their words</h2><p class="sub">The newest sentences founders wrote in the Blueprint. Their language, for your pages, ads and letters (section 4 of 01 START HERE).</p></div>
    ${W.length ? `<ul class="words">${W.map((w) => `<li><q>${esc(w.text)}</q><span class="em"><button type="button" class="linkish" data-drawer="${esc(w.id)}">${esc(w.name || w.email || '—')}</button> · Level ${String(w.lv).padStart(2, '0')}${w.word ? ' ' + esc(w.word) : ''} · ${esc(w.side)} · ${esc(when(w.at))}</span></li>`).join('')}</ul>`
      : '<p class="hint">No finished sentences yet. They appear here when founders complete a sentence in the Blueprint.</p>'}</div>`;
}

/** Stuck on Sunday: two or more of last week's actions "Not yet". A check-in
 *  this week, before the habit of not doing sets in. */
function stuckHTML() {
  const L = stuckOnSunday(data.words, 12);
  return `<div class="panel"><div><h2>Stuck on Sunday</h2><p class="sub">Two or more of last week’s four actions “Not yet”, from their own Sunday answers. A short, kind check-in this week.</p></div>
    ${L.length ? `<ul class="needs">${L.map((x) => `<li><span class="sev" style="--c:var(--warn)"></span>
      <div><button type="button" class="linkish" data-drawer="${esc(x.id)}">${esc(x.name || x.email || '—')}</button><span class="why">Level ${String(x.lv).padStart(2, '0')}: ${x.not} not yet${x.part ? `, ${x.part} partly` : ''}${x.done ? `, ${x.done} done` : ''} · ${esc(x.notDomains.map((d) => SIDES[d]).join(' · '))}</span></div>
      <button class="btn" data-msg="${esc(x.id)}" data-kind="checkin">Send a check-in</button></li>`).join('')}</ul>`
      : '<p class="hint">Nobody is stuck. When a founder answers “Not yet” to two or more of last week’s actions, they appear here.</p>'}</div>`;
}

/** Who is looking: the team member's first name, or the default mentor's for the key. */
function whoFirst() {
  const y = (data && data.you) || {};
  const n = y.name || ((data.mentors || []).find((m) => m.isDefault) || {}).name || '';
  return String(n).trim().split(/\s+/)[0] || '';
}
const partOfDay = (h = new Date().getHours()) => (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');

/** Your 3 for today (Alexandru, 2 Nov 2026): at most three jobs, most urgent
 *  first, one button each. The rest folds under "And N more". */
function threeHTML() {
  const { three, more } = topThree(data.students, data.waiting);
  const who = whoFirst();
  const job = (x) => {
    const nm = esc(x.s.name || x.s.email || '—');
    const [what, why] = x.kind === 'question' ? [`${nm} asked ${x.count > 1 ? `${x.count} questions` : 'a question'}`, `Asked ${when(x.waitingSince)}: “${esc(String(x.text || '').slice(0, 120))}${String(x.text || '').length > 120 ? '…' : ''}”`]
      : x.kind === 'quiet' ? [`${nm} has been quiet for ${x.days} days`, esc(toldBrief(x.s))]
      : x.kind === 'ready' ? [`${nm} finished Levels 01, 02 and 03`, 'Ready for the Boardroom']
      : [`${nm} is new`, `Joined ${x.days === 0 ? 'today' : x.days === 1 ? 'yesterday' : x.days + ' days ago'}${toldBrief(x.s) ? ' · ' + esc(toldBrief(x.s)) : ''}`];
    const btn = x.does === 'open' ? `<button class="btn gold" data-open="${esc(x.id)}">Answer</button>`
      : `<button class="btn gold" data-msg="${esc(x.id)}" data-kind="${KIND_OF[x.kind] || 'note'}">${x.kind === 'quiet' ? 'Check in' : x.kind === 'ready' ? 'Offer the Boardroom' : 'Welcome'}</button>`;
    return `<li><span class="sev" style="--c:${SEV[x.kind]}"></span><div><button type="button" class="linkish" data-drawer="${esc(x.id)}">${what}</button><span class="why">${why}</span></div>${btn}</li>`;
  };
  return `<div class="panel three"><div><h2>${partOfDay()}${who ? ', ' + esc(who) : ''}</h2>
      <p class="sub">${three.length ? `${three.length === 1 ? 'One thing' : three.length === 2 ? 'Two things' : 'Three things'} for today. Each letter is already written: read it, change a word, send.` : 'All done. Nothing needs you today.'}</p></div>
    ${three.length ? `<ul class="needs">${three.map(job).join('')}</ul>` : ''}
    ${more.length ? `<details class="more"><summary>And ${more.length} more</summary>${needsHTML(3)}</details>` : ''}</div>`;
}
/** One line about a founder: where they stopped and what hurts. */
function toldBrief(s) {
  const L = [...levelSet(s)], t = told(s), bits = [];
  if (L.length) bits.push(`Stopped at Level ${String(Math.max(...L)).padStart(2, '0')}`);
  if (t.pains.length) bits.push(`said “${PAIN_NAMES[t.pains[0]]}”`);
  return bits.join(' · ');
}

function todayHTML(S) {
  return `${threeHTML()}
    ${stuckHTML()}
    <div><h2>Where your founders are</h2><p class="sub">Tap a group to see who is in it. Each group has the one thing that moves them on.</p></div>
    ${groupsHTML(S)}`;
}

/** Grow: the numbers, where founders came from, and their own words. */
/* ── Grow, at the top (Alexandru, 2 Nov 2026): who joined, who paid and the
   share that paid, who did not pay yet, who just paid, and the money in, for
   today, 7 days, 30 days or all. Paid = a real Stripe payment; test payments
   never count. Each number opens Founders with that filter. */
const PAY_WORDS = { paid: ['Paid', 'pill both'], given: ['Given free', 'pill bp'], free: ['Not paid', 'pill'] };
function pulseHTML() {
  const P = pulse(data.students, data.paid, GW), win = { today: 'today', 7: 'in the last 7 days', 30: 'in the last 30 days', all: 'so far' }[GW];
  const byId = Object.fromEntries((data.students || []).map((s) => [s.id, s]));
  const money = (c) => `$${(Number(c) / 100).toLocaleString('en-US')}`;
  const tile = (n, t, d, pf, c) => `<button type="button" class="g" style="--c:var(--${c})" data-pf="${pf}"><span class="n">${n}</span><span class="t">${t}</span><span class="d">${d}</span><span class="act">See who →</span></button>`;
  const who = (s) => `<button type="button" class="linkish" data-drawer="${esc(s.id)}">${esc(s.name || s.email || '—')}</button>`;
  const joined = P.joined.slice(0, 10).map((s) => { const k = payOf(s, LIVE); return `<li><div>${who(s)}<span class="why">${esc(s.email || '')} · joined ${esc(when(s.joined_at))} · ${esc(STEP_SHORT[s.tier || 'free'] || s.tier)}</span></div><span class="${PAY_WORDS[k][1]}">${PAY_WORDS[k][0]}</span></li>`; }).join('');
  const pays = P.pays.slice(0, 10).map((p) => { const s = byId[p.student_id] || { id: p.student_id }; return `<li><div>${who(s)}<span class="why">${esc(STEP_NAMES[p.step] || p.step)}${'amount' in p ? ' · ' + esc(money(p.amount)) : ''} · ${esc(when(p.at))}</span></div>${p.mode === 'live' ? '<span class="pill both">Real</span>' : '<span class="pill">Test</span>'}</li>`; }).join('');
  return `<div class="panel"><div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><h2>Joined and paid</h2>
      <div class="fl" role="group" aria-label="When" style="margin-left:auto">${WINDOWS.map(([v, t]) => `<button type="button" class="chip" data-gw="${v}" aria-pressed="${GW === v}">${t}</button>`).join('')}</div></div>
    <div class="groups" style="margin-top:12px">
      ${tile(P.total, 'Joined', `New accounts ${win}`, 'all', 'gold')}
      ${tile(P.paid, 'Paid', P.total ? `${P.pct}% of them paid with a card` : 'Nobody joined in this window', 'paid', 'both')}
      ${tile(P.notPaid, 'Not paid yet', `${P.free} on the free levels${P.given ? ` · ${P.given} on a step you gave free` : ''}`, 'notpaid', 'warn')}
      ${P.seesMoney || can('payments') ? `<div class="g" style="--c:var(--bp)"><span class="n">${esc(money(P.money))}</span><span class="t">Money in</span><span class="d">${plural(P.livePays.length, 'real payment', 'real payments')} ${win}${P.test ? ` · ${plural(P.test, 'test payment', 'test payments')} not counted` : ''}</span></div>` : ''}
    </div>
    <div class="row2" style="margin-top:14px">
      <div><h3>Just joined</h3>${joined ? `<ul class="needs">${joined}</ul>` : `<p class="tiny">Nobody joined ${win}.</p>`}</div>
      <div><h3>Just paid</h3>${pays ? `<ul class="needs">${pays}</ul>` : `<p class="tiny">No payments ${win}.</p>`}</div>
    </div>
    <p class="tiny" style="margin-top:8px">Paid = a real payment through Stripe. Test payments show as Test and are never counted. “Given free” = on a paid step you opened for them in /mentor.</p></div>`;
}

function growHTML(S) {
  return `${pulseHTML()}<div class="row2">${funnelHTML()}${toldHTML()}</div>
    ${wordsHTML()}
    ${landingHTML()}
    ${crossedHTML(S)}`;
}

/** One short line under a founder's name: what they want, what hurts. */
const toldLine = (s) => { const t = told(s); const bits = [];
  if (t.wants.length) bits.push('Wants: ' + t.wants.map((k) => WANT_NAMES[k]).join(' · '));
  if (t.pains.length) bits.push('Hurts: ' + t.pains.map((k) => PAIN_NAMES[k]).join(' · '));
  return bits.length ? `<span class="told">${esc(bits.join('  ·  '))}</span>` : ''; };

// ── Founders ─────────────────────────────────────────────────────────────────

function filtersHTML() {
  const row = (label, k, opts) => `<div class="fl" role="group" aria-label="${label}"><span>${label}</span>${opts.map(([v, t]) => `<button type="button" class="chip" data-f="${k}" data-v="${v}" aria-pressed="${F[k] === v}">${esc(t)}</button>`).join('')}</div>`;
  return `<div class="panel filters">
    ${row('Group', 'group', [['all', 'All'], ['ns', 'North Star only'], ['bp', 'Blueprint only'], ['both', 'Both']])}
    ${row('Step', 'step', [['all', 'All'], ...STEP_KEYS.map((k) => [k, STEP_SHORT[k]])])}
    ${row('Activity', 'act', [['all', 'All'], ['new', 'New this week'], ['active', 'Active'], ['quiet', 'Quiet 14+ days']])}
    ${row('Needs', 'need', [['all', 'Anything'], ['q', 'A question waiting'], ['ready', 'Ready for the Boardroom'], ['nopw', 'No password']])}
    ${row('More', 'more', [['all', 'Everyone'], ['full', 'Full form'], ['simple', 'Simple form'], ['library', 'Took a library book']])}
    ${row('Paid', 'pay', [['all', 'All'], ['paid', 'Paid'], ['notpaid', 'Not paid yet'], ['given', 'Given free'], ['free', 'Free levels only']])}
    ${row('Joined', 'joined', WINDOWS.map(([v, t]) => [v, v === 'all' ? 'Any time' : t]))}
  </div>`;
}

/* ── Invite a founder (Alexandru, 2 Nov 2026): by email, at the step he
   chooses, free. The step opens at once; the letter signs them in and asks
   a new account for a password. Never moves anyone down. */
const INVITE_STEPS = [['free', 'Free · Levels 01–03'], ['session', 'The Boardroom · Levels 01–05 + 1 session'], ['lab', 'The LAB · Levels 01–09 + 2 sessions'],
  ['hub', 'The HUB · all 12 levels + 3 sessions'], ['premium', 'The Summit · everything + Alexandru every week']];
function inviteHTML() {
  if (!can('invite')) return '';
  return `<details class="panel"${INV_OPEN ? ' open' : ''} id="invbox"><summary style="cursor:pointer;min-height:36px;display:flex;align-items:center;gap:10px"><h2 style="display:inline;margin:0">Invite a founder</h2><span class="tiny">By email, at any step, free</span></summary>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px;align-items:end">
      <label class="tiny">First name<input id="inv-first" autocomplete="off" placeholder="Maria"></label>
      <label class="tiny">Email<input id="inv-email" type="email" autocomplete="off" placeholder="Their email, exactly"></label>
      <label class="tiny">Open for them<select id="inv-step">${INVITE_STEPS.map(([k, t]) => `<option value="${k}">${esc(t)}</option>`).join('')}</select></label>
      <button type="button" class="btn gold" id="inv-go">Send the invitation</button></div>
    <p class="tiny" style="margin-top:8px">The step opens now, with nothing to pay. They get a letter from you with a button that signs them in; a new account chooses a password first (the button works 7 days). Someone who already has an account moves up, never down.</p></details>`;
}
let INV_OPEN = false;

function foundersHTML() {
  const rows = filter(data.students, { ...F, q, live: LIVE });
  const any = Object.keys(NO_FILTER).some((k) => F[k] !== 'all') || q;
  const row = (s) => { const n = nextAction(s);
    return `<tr data-drawer="${esc(s.id)}" tabindex="0"${openId === s.id ? ' class="on"' : ''} aria-label="${esc(s.name || s.email)}: open the details">
      <td class="c-who"><span class="who">${avatar(s)}<span style="min-width:0"><b>${esc(s.name || '—')}</b><span class="em">${esc(s.email)}</span>${toldLine(s)}</span></span></td>
      <td class="c-group">${groupPill(s)}</td><td class="c-step">${esc(STEP_SHORT[s.tier || 'free'] || s.tier)}</td>
      <td class="c-lv">${levelsBar(s)}</td>
      <td class="c-stage">${esc(stageName(s.stage))}</td><td class="c-gp num">${esc(gpCount(s))}</td><td class="c-seen num">${esc(when(s.last_seen_at || s.joined_at))}</td>
      <td class="c-next">${n.tone ? `<span class="pill ${n.tone}">${esc(n.label)}</span>` : `<span class="sub">${esc(n.label)}</span>`}</td></tr>`; };
  return `${inviteHTML()}${filtersHTML()}
    <div class="panel"><div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><h2>Founders</h2><span class="sub" id="count">${rows.length} of ${data.students.length}</span>
      ${any ? '<button type="button" class="btn" data-fclear style="margin-left:auto">Clear the filters</button>' : ''}</div>
      ${!data.students.length ? '<div class="empty">Nobody here yet. The roster fills as founders sign up.</div>'
        : `<div class="tw"><table class="ftable"><thead><tr><th>Founder</th><th>Group</th><th>Step</th><th>Blueprint</th><th>Stage</th><th>Growth plan</th><th>Last seen</th><th>Next</th></tr></thead>
        <tbody>${rows.map(row).join('') || `<tr><td colspan="8" class="sub">Nobody matches these filters.${any ? ' Clear the filters to see everyone.' : ''}</td></tr>`}</tbody></table></div>`}
    </div>`;
}

// ── Questions ────────────────────────────────────────────────────────────────

function questionsHTML() {
  const W = [...(data.waiting || [])].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  return `<div class="panel"><div><h2>Questions waiting</h2><p class="sub">The “Ask Alexandru” questions, oldest first. Your answer shows at their Base Camp and goes by email as a letter.</p></div>
    ${W.length ? `<ul class="qlist">${W.map((n) => `<li><div><button type="button" class="linkish" data-drawer="${esc(n.student_id)}">${esc(n.name || n.email)}</button><span class="em">${esc(n.email)} · asked ${esc(when(n.created_at))}</span>
        <p style="margin-top:6px;white-space:pre-wrap;overflow-wrap:anywhere">“${esc(String(n.body || '').slice(0, 400))}${String(n.body || '').length > 400 ? '…' : ''}”</p></div>
      <span class="acts"><button class="btn gold" data-open="${esc(n.student_id)}">Read and answer</button><button class="btn" data-msg="${esc(n.student_id)}">Send a message</button></span></li>`).join('')}</ul>`
      : '<p class="hint">No questions waiting. Every question has its answer.</p>'}</div>`;
}

// ── Mailchimp ────────────────────────────────────────────────────────────────

const MC_MODE = { test: 'Test', form: 'Form', api: 'Live API' };
const MC_STATUS = { ok: 'in Mailchimp', test: 'test only', failed: 'failed', forgotten: 'deleted in Mailchimp' };
/** Addresses Mailchimp deleted for good: plain words, never a failure. */
const gone = (email) => !!(data && data.mailchimp && (data.mailchimp.forgotten || []).includes(email));
const mcState = (s) => (gone(s.email) ? 'deleted in Mailchimp for good (only they can re-subscribe) · ' + when(s.mailchimp_at)
  : s.mailchimp_status ? (s.mailchimp_status === 'failed' ? '<b class="warn">failed</b>' : esc(MC_STATUS[s.mailchimp_status] || s.mailchimp_status)) + ' · ' + when(s.mailchimp_at)
  : (s.consent && !s.unsubscribed ? 'not sent yet' : '—'));

/** The founders who crossed between the doors, each way, with the tag Mailchimp keeps. */
function crossedHTML(S) {
  return `<div class="panel"><div><h2>Founders who crossed</h2><p class="sub">Confirmed their name and email when they opened the other door. Each crossing is tagged in Mailchimp.</p></div>
    <div class="cross"><div><b>${S.crossed.blueprint}</b><span>North Star → Blueprint</span><span class="tiny">Tag ${CROSS_TAG.blueprint}</span></div>
      <div><b>${S.crossed.northstar}</b><span>Blueprint → North Star</span><span class="tiny">Tag ${CROSS_TAG.northstar}</span></div></div></div>`;
}

/** Mailchimp: the mode, what is missing, a test join, the backfill and the
 *  last 20 calls. Nothing here is a secret; the API key never leaves Cloudflare. */
function mailchimpHTML() {
  const M = data.mailchimp;
  if (!M || !can('mailchimp')) return '';
  const last = (M.log || [])[0];
  const lastFail = last && last.status === 'failed' && !gone(last.email) ? `<p class="flash warn" role="status"><b>Last call failed:</b> ${esc(last.detail)}</p>` : '';
  const G = M.forgotten || [];
  const goneNote = G.length ? `<p class="tiny">${G.length === 1 ? `${esc(G[0])} was` : `${G.length} addresses were`} deleted for good in Mailchimp. ${esc(M.forgottenWhy || '')}</p>` : '';
  return `<div class="panel mc"><h2>Mailchimp · ${esc(MC_MODE[M.mode] || M.mode)}</h2>
    <p class="tiny">${esc(M.reason)}</p>${lastFail}${goneNote}
    <div class="bar"><input id="mc-email" type="email" placeholder="Email for a test join" autocomplete="off" style="max-width:280px">
      <button class="ghost" id="mc-test">Send a test join</button><span style="flex:1"></span>
      <button class="ghost" id="mc-backfill"${M.waiting ? '' : ' disabled'}>Send everyone with consent (${M.waiting} waiting)</button></div>
    ${M.waitingTags ? `<p class="tiny">${M.waitingTags} of them ${M.waitingTags === 1 ? 'is' : 'are'} already in Mailchimp and only need${M.waitingTags === 1 ? 's' : ''} their step tags.</p>` : ''}
    ${(M.log || []).length ? `<div class="tscroll"><table class="mclog"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Mode</th><th>Status</th><th>Detail</th></tr></thead><tbody>
      ${M.log.map((r) => `<tr><td class="tiny">${when(r.at)}</td><td class="tiny">${esc(r.email || (r.student_id === 'mentor' ? 'mentor' : '—'))}</td><td class="tiny">${esc(r.action)}</td><td class="tiny">${esc(r.mode)}</td>
        <td>${gone(r.email) && r.status !== 'ok' ? 'deleted in Mailchimp' : r.status === 'failed' ? '<b class="warn">failed</b>' : esc(r.status)}</td><td class="tiny">${esc(gone(r.email) && r.status !== 'ok' ? M.forgottenWhy : r.detail || '')}</td></tr>`).join('')}</tbody></table></div>`
      : '<p class="tiny">No Mailchimp calls yet.</p>'}
  </div>`;
}

/* ── Mailchimp tags (Alexandru, 2 Nov 2026) ───────────────────────────────
   Every tag of the audience, read from Mailchimp and sorted against the list
   in the code (functions/_tag-list.js): Old = safe to delete, Ask = not made
   by the code, Keep = the code adds it. Mailchimp can only delete a tag, not
   rename it. Names only, never numbers. The mentor key only. */
const tagRow = (t, extra) => `<li><div style="flex:1;min-width:0"><b>${esc(t.name)}</b><span class="em">${esc(plural(t.count, 'person', 'people'))}${extra ? ' · ' + extra : ''}</span></div></li>`;
function tagsBox(r) {
  if (!r) return `<h2>Mailchimp tags</h2>
    <p class="tiny">Every tag in your audience, read from Mailchimp and checked against the code. You see which tags to keep, which are safe to delete, and which to ask about. Mailchimp cannot rename a tag, only delete it.</p>
    <p><button class="ghost" id="mct-read">Read the tags from Mailchimp</button></p>`;
  if (!r.read) return `<h2>Mailchimp tags</h2><p class="flash warn" role="status">${esc(r.why || 'Could not read the tags.')}</p><p><button class="ghost" id="mct-read">Try again</button></p>`;
  const wait = r.waiting ? `<p class="flash warn" role="status"><b>Wait before deleting.</b> ${esc(plural(r.waiting, 'founder still needs', 'founders still need'))} the new tags. Press “Send everyone with consent” above until it shows 0 waiting, then delete the Old ones.</p>` : '';
  return `<h2>Mailchimp tags · ${r.keep.length + r.old.length + r.ask.length}</h2>
    <p class="tiny">Read from Mailchimp just now. ${r.keep.length} to keep · ${r.old.length} safe to delete · ${r.ask.length} to ask about.</p>${wait}
    <div><p class="lbl">Safe to delete · ${r.old.length}</p>
      ${r.old.length ? `<p class="tiny">No code adds these any more. Deleting a tag only removes the label: the people stay in your audience.</p><ul class="list" style="margin-top:8px">${r.old.map((t) => tagRow(t, esc(t.why))).join('')}</ul>
      <p style="margin-top:8px"><button class="ghost" id="mct-copy">Copy these names</button></p>` : '<p class="tiny">Nothing to delete. Every tag is in use.</p>'}</div>
    ${r.ask.length ? `<div><p class="lbl">Ask before deleting · ${r.ask.length}</p><p class="tiny">Not made by the code: made by hand in Mailchimp, by a Mailchimp form setting, or by an import. Delete one only if you know what it was for.</p>
      <ul class="list" style="margin-top:8px">${r.ask.map((t) => tagRow(t)).join('')}</ul></div>` : ''}
    <details><summary class="lbl" style="cursor:pointer">Keep · ${r.keep.length}</summary><p class="tiny" style="margin-top:6px">The code adds these. Never delete them.</p>
      <ul class="list" style="margin-top:8px">${r.keep.map((t) => tagRow(t, `${esc(t.what)} <a href="${esc(t.from)}" target="_blank" rel="noopener">${esc(t.fromName || t.from)}</a>. ${esc(t.when)}`)).join('')}</ul></details>
    ${r.notYet.length ? `<details><summary class="tiny" style="cursor:pointer">Not in Mailchimp yet · ${r.notYet.length}</summary><p class="tiny" style="margin-top:6px">Each one is made the first time it is added: ${esc(r.notYet.join(' · '))}.</p></details>` : ''}
    <p><button class="ghost" id="mct-read">Read again</button></p>`;
}
/* ── Payments (Alexandru, 2 Nov 2026) ─────────────────────────────────────
   Stripe: test or live, whether the webhook is connected (the site connects
   it itself at the first payment), and the latest payments. The key only. */
const STEP_WORDS = { session: 'The Boardroom', lab: 'The LAB', hub: 'The HUB', premium: 'The Summit' };
async function loadStripe() {
  const box = $('#stripebox');
  if (!box) return;
  const r = await api('?stripe=1');
  if (!$('#stripebox')) return;
  if (!r.ok) { box.innerHTML = '<h2>Payments</h2><p class="tiny">Could not load the payments.</p>'; return; }
  const d = r.data, P = d.payments || [];
  const state = !d.mode ? `<span class="warn">Not connected: ${esc(d.problem || 'STRIPE_SECRET_KEY is not set in Cloudflare.')}</span>`
    : `${d.mode === 'test' ? 'Test mode (no real money)' : 'Live'} · webhook ${d.connected ? `connected ${esc(when(d.at))}` : 'connects itself at the first payment'}`;
  const money = (c) => `$${(Number(c) / 100).toLocaleString('en-US')}`;
  box.innerHTML = `<h2>Payments · Stripe</h2><p class="tiny">${state}</p>
    ${P.length ? `<ul class="list" style="margin-top:8px">${P.map((p) => `<li><div style="flex:1;min-width:0"><b>${esc(p.name || p.email || 'A founder')}</b>
      <span class="em">${esc(STEP_WORDS[p.step] || p.step)} · ${esc(money(p.amount))}${p.mode === 'test' ? ' · test' : ''} · ${esc(when(p.at))}${p.email ? ' · ' + esc(p.email) : ''}</span></div></li>`).join('')}</ul>`
      : '<p class="tiny">No payments yet. Each one opens the founder’s step at once and sends the “It’s unlocked” letter.</p>'}`;
}
let tagsRead = null;
async function loadTags(read) {
  const box = $('#mctags');
  if (!box) return;
  if (!read) { box.innerHTML = tagsBox(tagsRead); }
  else {
    box.innerHTML = '<h2>Mailchimp tags</h2><p class="tiny">Reading the tags from Mailchimp…</p>';
    const r = await api('?tags=1');
    tagsRead = r.ok ? r.data : { read: false, why: r.data.error || 'Could not read the tags.' };
    if (!$('#mctags')) return;
    box.innerHTML = tagsBox(tagsRead);
  }
  const b = $('#mct-read'); if (b) b.onclick = () => loadTags(true);
  const c = $('#mct-copy');
  if (c) c.onclick = async () => { try { await navigator.clipboard.writeText(tagsRead.old.map((t) => t.name).join('\n')); c.textContent = 'Copied'; } catch { c.textContent = 'Could not copy'; } };
}

/** Every right a team member can be given, in the tick-box order and words
 *  (functions/_team.js TEAM_RIGHTS; a test holds them equal). */
export const RIGHT_WORDS = [
  ['reply', 'Answer founders’ questions'],
  ['message', 'Write letters and notes to founders'],
  ['signin-link', 'Send sign-in links'],
  ['reset-link', 'Send password reset links'],
  ['series-hold', 'Pause or resume a founder’s letters'],
  ['tier', 'Change a founder’s step (unlock)'],
  ['pause', 'Pause or unpause a founder’s account'],
  ['delete', 'Delete a founder'],
  ['mentors', 'Mentor profiles, and a founder’s mentor'],
  ['mailchimp', 'Mailchimp tools and the tag list'],
  ['payments', 'See the payments (Stripe)'],
  ['team', 'Change the team and what each member can do'],
  ['invite', 'Invite a founder at any step, free'],
];
/** For a team account: what they can and cannot do here, in plain words. */
function teamCanHTML() {
  const mine = (data.you && data.you.can) || [];
  const yes = ['Read every founder, their answers and their path', 'Export the founders as CSV', ...RIGHT_WORDS.filter(([k]) => mine.includes(k)).map(([, w]) => w)];
  const no = RIGHT_WORDS.filter(([k]) => !mine.includes(k)).map(([, w]) => w);
  return `<section class="panel"><h2>What you can do here</h2>
    <div class="tgrid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">
      <div><p class="lbl">You can</p><ul class="list" style="margin-top:6px">${yes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      ${no.length ? `<div><p class="lbl">Only Alexandru, for now</p><ul class="list" style="margin-top:6px">${no.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="tiny" style="margin-top:6px">Alexandru can tick any of these for you in Settings → Team.</p></div>` : ''}</div></section>`;
}

// ── Mentors & comments ───────────────────────────────────────────────────────

/** Mentors: who the letters come from. Everyone's mentor (the default), and
 *  others a founder can be given on their own page. */
function mentorsHTML() {
  if (!can('mentors')) return '';
  const L = data.mentors || [];
  const row = (m) => `<li><img src="${esc(m.photo)}" alt="" width="40" height="40" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:1px solid var(--gold)">
    <div style="min-width:0;flex:1 1 200px"><b>${esc(m.name)}</b>${m.isDefault ? ' <span class="pill both">Everyone’s mentor</span>' : ''}<span class="em">${esc(m.title)} · replies to ${esc(m.email)}</span></div>
    <img src="${esc(m.signature)}" alt="" height="28" style="height:28px;width:auto;max-width:40%;background:#fff;padding:2px 6px;border-radius:4px">
    <button class="ghost" data-medit="${esc(m.id)}">Edit</button></li>`;
  return `<details class="panel mentors"><summary><h2 style="display:inline">Mentors · ${L.length}</h2> <span class="tiny">Only for letters signed by someone other than you (name, photo, signature). The team does not need this.</span></summary>
    <ul class="mlist">${L.map(row).join('')}</ul>
    <form id="mform" class="mform">
      <input type="hidden" id="m-id">
      <label>Name<input id="m-name" required placeholder="Maria Rossi"></label>
      <label>Title<input id="m-title" placeholder="ExploraSelf"></label>
      <label>Photo<input id="m-photo" placeholder="/mail/maria.jpg or https://…"></label>
      <label>Signature<input id="m-sig" placeholder="/mail/maria-signature.png or https://…"></label>
      <label>Replies go to<input id="m-email" type="email" placeholder="support@exploraself.com"></label>
      <label class="mchk"><input type="checkbox" id="m-def" style="width:auto"> Everyone’s mentor</label>
      <button type="submit">Save mentor</button>
      <p class="tiny">A photo or signature is a file on this site (put it in public/mail/) or an https address. Founders without their own mentor get everyone’s mentor.</p>
    </form></details>`;
}

/** Comments founders left under the level videos, newest first; hide or show. */
/* ── The team (Alexandru, 2 Nov 2026) ─────────────────────────────────────
   Addresses with every Blueprint level open, the Growth Toolkit without a
   code, and /mentor with their own account. Added by exact address, once,
   with the mentor key or by a member with the 'team' right; each member's
   own rights are ticked here (functions/_team.js TEAM_RIGHTS). */
/** What a team member did in /mentor, in words (functions/_team.js DID_WORDS; a test holds them equal). */
export const TEAM_DID = { message: ['letter', 'letters'], reply: ['answer', 'answers'], tier: ['step change', 'step changes'],
  'series-hold': ['pause or resume', 'pauses or resumes'], 'signin-link': ['sign-in link', 'sign-in links'], 'reset-link': ['reset link', 'reset links'],
  pause: ['account pause', 'account pauses'], delete: ['founder deleted', 'founders deleted'], 'mentor-save': ['mentor profile saved', 'mentor profiles saved'],
  'mentor-assign': ['mentor chosen', 'mentors chosen'], 'mc-test': ['Mailchimp test', 'Mailchimp tests'], 'mc-backfill': ['Mailchimp send', 'Mailchimp sends'],
  'team-add': ['member added', 'members added'], 'team-remove': ['member removed', 'members removed'], 'team-can': ['rights change', 'rights changes'],
  invite: ['founder invited', 'founders invited'] };
const didLine = (did) => Object.entries(did || {}).filter(([a, n]) => TEAM_DID[a] && n).map(([a, n]) => `${n} ${n === 1 ? TEAM_DID[a][0] : TEAM_DID[a][1]}`).join(' · ');
async function loadTeam(msg = '') {
  const box = $('#team');
  if (!box) return;
  const r = await api('?team=1');
  if (!r.ok) { box.innerHTML = '<p class="tiny">Could not load the team.</p>'; return; }
  const T = r.data.team || [], edit = !!r.data.canEdit, me = String(r.data.me || '').toLowerCase();
  const all = (m) => RIGHT_WORDS.every(([k]) => (m.can || []).includes(k));
  const canLine = (m) => (all(m) ? 'Everything, like Alexandru' : RIGHT_WORDS.filter(([k]) => (m.can || []).includes(k)).map(([, w]) => w).join(' · ') || 'Read only');
  // Per member, what they may do (Alexandru, 2 Nov 2026): tick boxes, saved on
  // each tick. Alexandru's own addresses always have every right; nobody edits their own.
  const rightsBox = (m) => m.owner ? '<span class="em">Alexandru’s own address: every right, always.</span>'
    : !edit || m.email.toLowerCase() === me ? `<span class="em">Can: ${esc(canLine(m))}</span>`
    : `<div data-rights="${esc(m.email)}" style="flex-basis:100%;margin:10px 0 2px;padding:10px 12px;border:1px solid #E7DCC6;border-radius:10px;background:#FFFCF5">
      <label style="display:flex;align-items:center;gap:8px;font-weight:600;margin-bottom:6px"><input type="checkbox" data-all style="width:auto"${all(m) ? ' checked' : ''}> Everything (like Alexandru)</label>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:4px 16px">${RIGHT_WORDS.map(([k, w]) => `<label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" data-right="${k}" style="width:auto"${(m.can || []).includes(k) ? ' checked' : ''}> ${esc(w)}</label>`).join('')}</div>
      <p class="tiny" data-saved style="margin:6px 0 0" role="status" aria-live="polite"></p></div>`;
  box.innerHTML = `<h2>Team · ${T.length}</h2>
    <p class="tiny">Add their exact email: they get an invitation with a button to start. They see every Blueprint level, the Growth Toolkit without a code, and this page. Everything they send goes out signed by ${isTeam() ? 'Alexandru' : 'you'}, and replies come back to ${isTeam() ? 'Alexandru' : 'you'}.</p>
    <ul class="list" style="margin-top:10px">${T.map((m) => `<li style="flex-wrap:wrap"><div style="flex:1;min-width:0"><b>${esc(m.name || m.email)}</b>
      <span class="em">${m.name ? esc(m.email) + ' · ' : ''}${m.account ? `account ready · last active ${esc(when(m.lastSeen))}` : `<span class="warn">${m.removable ? 'invited, no account yet' : 'no account yet'}</span>`} · ${esc(m.from)}${m.at ? ' ' + esc(when(m.at)) : ''}</span>
      ${didLine(m.did) ? `<span class="em">In /mentor: ${esc(didLine(m.did))}</span>` : ''}${m.owner || !edit || m.email.toLowerCase() === me ? rightsBox(m) : ''}</div>${edit && m.removable && m.email.toLowerCase() !== me ? `<button class="ghost" data-team-rm="${esc(m.email)}">Remove</button>` : ''}${!m.owner && edit && m.email.toLowerCase() !== me ? rightsBox(m) : ''}</li>`).join('')}</ul>
    ${edit ? `<p style="margin-top:12px;display:flex;gap:6px;max-width:460px;flex-wrap:wrap"><input id="team-new" type="email" placeholder="Their email, exactly" autocomplete="off" style="flex:1 1 220px;min-width:0"><button id="team-add">Add to the team</button></p>`
      : '<p class="tiny" style="margin-top:10px">Only Alexandru, or a team member with that right, can change the team.</p>'}
    ${msg ? `<p class="flash" role="status">${esc(msg)}</p>` : ''}`;
  const add = $('#team-add');
  if (add) {
    add.onclick = async () => {
      const email = ($('#team-new').value || '').trim();
      if (!email) return;
      const x = await act({ action: 'team-add', email });
      loadTeam(!x.ok ? (x.data.error || 'Could not add that address.') : x.data.invited ? `${email} is on the team. An invitation is on its way to them, with the button to start.` : `${email} is on the team, but the invitation did not send (${x.data.inviteWhy || 'email is off'}). They can sign in with their own account, then open /mentor.`);
    };
    $('#team-new').onkeydown = (e) => { if (e.key === 'Enter') add.click(); };
  }
  box.querySelectorAll('[data-rights]').forEach((wrap) => {
    const boxes = [...wrap.querySelectorAll('[data-right]')], allBox = wrap.querySelector('[data-all]'), note = wrap.querySelector('[data-saved]');
    const save = async () => {
      allBox.checked = boxes.every((x) => x.checked);
      note.textContent = 'Saving…';
      const x = await act({ action: 'team-can', email: wrap.dataset.rights, can: boxes.filter((c) => c.checked).map((c) => c.dataset.right) });
      note.textContent = x.ok ? 'Saved.' : (x.data.error || 'Could not save. Try again.');
    };
    allBox.onchange = () => { boxes.forEach((c) => { c.checked = allBox.checked; }); save(); };
    boxes.forEach((c) => { c.onchange = save; });
  });
  box.querySelectorAll('[data-team-rm]').forEach((b) => { b.onclick = async () => {
    if (!confirm(`Remove ${b.dataset.teamRm} from the team?`)) return;
    const x = await act({ action: 'team-remove', email: b.dataset.teamRm });
    loadTeam(x.ok ? 'Removed.' : (x.data.error || 'Could not remove that address.'));
  }; });
}

async function loadComments() {
  const box = $('#vcom');
  if (!box) return;
  let d = {};
  try { const r = await fetch('/api/comments?all=1', { headers: H() }); d = await r.json().catch(() => ({})); } catch { /* offline */ }
  const items = (d && d.items) || [];
  if (!$('#vcom')) return;
  $('#vcom').innerHTML = `<h2>Video comments</h2>
    ${items.length ? `<div class="tw"><table><thead><tr><th>When</th><th>Founder</th><th>Video</th><th>Comment</th><th></th></tr></thead><tbody>
      ${items.map((c) => `<tr${c.hidden ? ' style="opacity:.5"' : ''}><td class="tiny">${esc(when(c.at))}</td><td class="tiny">${esc(c.name || '—')}<span class="em">${esc(c.email || '')}</span></td>
        <td class="tiny">Level ${String(c.level).padStart(2, '0')} · ${esc(c.stage)}</td><td>${esc(c.body)}</td>
        <td><button class="ghost" data-vhide="${esc(c.id)}" data-hidden="${c.hidden ? 1 : 0}">${c.hidden ? 'Show again' : 'Hide'}</button></td></tr>`).join('')}
      </tbody></table></div>` : '<p class="tiny">No comments yet. They appear here, and in your inbox, as founders leave them under the level videos.</p>'}`;
}

// ── The drawer: one founder, every action ────────────────────────────────────

/** The free tools a founder opened, and where they are in the 12 days
 *  (functions/_tools.js TOOL_LIST, functions/api/mentor.js courseLine; a test
 *  holds the names equal). */
export const TOOL_NAMES = { 'runway': 'Cash runway', 'bottleneck': 'The bottleneck test', 'off-switch': 'The off-switch check', '12-days': '12 Days to Start Winning', 'teleprompter': 'Teleprompter' };
function toolsOf(s) {
  const used = String(s.tools || '').split(',').filter((k) => TOOL_NAMES[k]).map((k) => TOOL_NAMES[k]);
  const [d, st] = String(s.course || '').split('|'), n = Number(d);
  const c = s.course ? (n < 0 ? 'welcome pending' : n === 0 ? 'welcome sent' : `day ${n} of 13`) + (st ? ', stopped' : '') : '';
  return used.map((x) => (x === TOOL_NAMES['12-days'] && c ? `${x} (${c})` : x)).join(' · ');
}
function drawerHTML(s) {
  const n = nextAction(s), g = groupOf(s), cr = crossedOf(s), lv = levelCount(s), lp = launchpadDone(s), id = esc(s.id);
  const main = n.does === 'open' ? `<button class="btn gold" data-open="${id}">${esc(n.button)}</button>`
    : n.does === 'unpause' ? (!can('pause') ? '<span class="pill warn">Paused. Only Alexandru, or a team member with that right, can unpause.</span>' : `<button class="btn gold" data-pause="${id}" data-v="0">${esc(n.button)}</button>`)
    : `<button class="btn gold" data-msg="${id}" data-kind="${KIND_OF[n.key] || 'note'}">${esc(n.button)}</button>`;
  const land = landingName(s);
  const books = String(s.library || '').split(',').filter(Boolean).length;
  const said = flash;
  return `<button type="button" class="x" data-xdrawer aria-label="Close">×</button>
    <div class="head">${avatar(s, true)}<div><h3>${esc(s.name || s.email)}</h3><span class="sub">${esc(s.email)}${s.company ? ' · ' + esc(s.company) : s.company === '' ? ' · No company yet' : ''}</span></div></div>
    <div class="acts">${groupPill(s)} <span class="pill">${esc(STEP_SHORT[s.tier || 'free'] || s.tier)}</span>${s.open_notes ? ` <span class="pill warn">${s.open_notes > 1 ? s.open_notes + ' questions waiting' : 'Question waiting'}</span>` : ''}${s.paused ? ' <span class="pill warn">Paused</span>' : ''}${s.unsubscribed ? ' <span class="pill warn">Unsubscribed</span>' : ''}</div>
    ${said ? `<p class="flash" role="status">${esc(said)}</p>` : ''}
    <div class="panel" style="padding:12px 14px"><b>Next: ${esc(n.label)}</b><div class="acts">${main}</div></div>
    <dl class="dkv">
      <dt>Stage</dt><dd>${esc(stageName(s.stage))}</dd>
      ${(() => { const t = told(s); return t.any ? `${t.wants.length ? `<dt>Wants</dt><dd>${esc(t.wants.map((k) => WANT_NAMES[k]).join(' · '))}</dd>` : ''}${t.pains.length ? `<dt>Hurts</dt><dd>${esc(t.pains.map((k) => PAIN_NAMES[k]).join(' · '))}</dd>` : ''}${t.values.length ? `<dt>Cares about</dt><dd>${esc(t.values.map((k) => VALUE_NAMES[k]).join(' · '))}</dd>` : ''}${t.first >= 0 ? `<dt>Needs them first</dt><dd>${esc(SIDES[t.first])}${t.best >= 0 && t.best !== t.first ? ' · strongest: ' + esc(SIDES[t.best]) : ''}</dd>` : ''}${t.team ? `<dt>Works with</dt><dd>${esc(TEAM_NAMES[t.team])}</dd>` : ''}` : ''; })()}
      <dt>Blueprint</dt><dd>${lv} of 12 levels${lp ? ' · Launchpad done' : ''}</dd>
      <dt>North Star</dt><dd>${s.compass_at ? 'done · ' + esc(day(s.compass_at)) : 'not yet'}</dd>
      <dt>Plans</dt><dd>${s.plan_ticks || 0} of ${data.totalSteps || 28} steps</dd>
      <dt>Growth plan</dt><dd>${Number(s.growth_ticks) || 0} of ${gpTotal()} steps done</dd>
      <dt>Joined</dt><dd>${esc(day(s.joined_at))}${land ? ' · ' + esc(land) : ''}${s.utm_source ? `<span class="em">${esc(s.utm_source)}${s.utm_content ? ' · ' + esc(s.utm_content) : ''}</span>` : ''}</dd>
      <dt>Last seen</dt><dd>${esc(when(s.last_seen_at || s.joined_at))}</dd>
      <dt>Signed up with</dt><dd>${esc(s.signup_type ? s.signup_type + ' form' : '—')}</dd>
      <dt>Interest</dt><dd>${esc(s.interest || '—')}</dd>
      <dt>Industry</dt><dd>${esc(s.industry || '—')}</dd>
      <dt>Password</dt><dd>${s.has_password ? 'yes' : s.signup_type === 'simple' ? 'none (signs in by email link)' : 'no'}</dd>
      <dt>Consent</dt><dd>${s.consent ? 'yes' : 'no'}${s.unsubscribed ? ' · <b class="warn">unsubscribed</b>' : ''}</dd>
      <dt>Mailchimp</dt><dd>${mcState(s)}</dd>
      <dt>Library</dt><dd>${books ? plural(books, 'book', 'books') + ' taken' : '—'}</dd>
      <dt>Tools</dt><dd>${esc(toolsOf(s)) || '—'}</dd>
      ${(() => { const L = seriesInfo(s); return L ? `<dt>Pain letters</dt><dd>${esc(L.line)}${(L.active || L.held) && can('series-hold') ? ` <button class="ghost" data-hold="${id}" data-v="${L.held ? 0 : 1}">${L.held ? 'Resume letters' : 'Pause letters'}</button>` : ''}</dd>` : ''; })()}
    </dl>
    <div><p class="lbl">Their path</p><ul class="tl" style="margin-top:8px">
      <li>Signed up${land ? ' on ' + esc(land) : ''} <span>· ${esc(day(s.joined_at))}</span></li>
      ${cr.includes('northstar') ? `<li>Crossed to the North Star, confirmed name and email <span>· tag ${CROSS_TAG.northstar}</span></li>` : ''}
      ${s.compass_at ? `<li>Finished the North Star <span>· ${esc(day(s.compass_at))}</span></li>` : ''}
      ${cr.includes('blueprint') ? `<li>Crossed to the Blueprint, confirmed name and email <span>· tag ${CROSS_TAG.blueprint}</span></li>` : ''}
      ${lv ? `<li>Blueprint: ${lv} of 12 levels${lp ? ' · Launchpad done' : ''}</li>` : ''}
      ${(s.tier || 'free') !== 'free' ? `<li>Step: ${esc(STEP_NAMES[s.tier] || s.tier)}</li>` : ''}
      ${s.paused ? '<li>Paused</li>' : ''}</ul></div>
    ${Number(s.growth_ticks) || Number(s.growth_words) ? `<div><p class="lbl">Growth plan · ${esc(gpCount(s))}${Number(s.growth_words) ? ` · ${esc(plural(Number(s.growth_words), 'blank', 'blanks'))} written` : ''}</p><div id="gpw-${id}">${gpList(s)}</div></div>` : ''}
    <div><p class="lbl">All actions</p><div class="acts" style="margin-top:8px">
      <button class="btn" data-open="${id}">Open their work</button>
      ${can('message') ? `<button class="btn" data-msg="${id}">Send a message</button>` : ''}
      ${can('signin-link') ? `<button class="btn" data-link="${id}">Send sign-in link</button>` : ''}
      ${can('reset-link') ? `<button class="btn" data-reset="${id}">Send a password reset link</button>` : ''}
      ${can('pause') ? `<button class="btn" data-pause="${id}" data-v="${s.paused ? 0 : 1}">${s.paused ? 'Unpause' : 'Pause'}</button>` : ''}
      ${can('delete') ? `<button class="btn danger" data-del="${id}">Delete</button>` : ''}</div>
      ${can('tier') ? `<label class="tiny" style="display:flex;align-items:center;gap:8px;margin-top:12px">Step
        <select data-step="${id}" aria-label="Step for ${esc(s.name || s.email)}">${STEP_KEYS.map((k) => `<option value="${k}"${(s.tier || 'free') === k ? ' selected' : ''}>${STEP_NAMES[k]}</option>`).join('')}</select></label>
      <p class="tiny" style="margin-top:6px">A new step sends its step tags to Mailchimp.</p>` : `<p class="tiny" style="margin-top:12px">Step: ${esc(STEP_NAMES[s.tier || 'free'] || s.tier || 'free')}</p>`}</div>`;
}

let lastFocus = null;
function openDrawer(id, focus) {
  const s = data && data.students.find((x) => x.id === id);
  const d = $('#drawer');
  if (!s) return closeDrawer();
  if (focus && openId !== id) lastFocus = document.activeElement;
  openId = id;
  d.innerHTML = drawerHTML(s);
  d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); d.setAttribute('aria-label', s.name || s.email || 'Founder');
  document.querySelectorAll('.ftable tr.on').forEach((r) => r.classList.remove('on'));
  const row = document.querySelector(`.ftable tr[data-drawer="${CSS.escape(id)}"]`); if (row) row.classList.add('on');
  if (focus) d.querySelector('[data-xdrawer]').focus();
  if (Number(s.growth_ticks) || Number(s.growth_words)) loadGrowthWords(id);
}
function closeDrawer() {
  const d = $('#drawer');
  if (!d) return;
  const was = openId; openId = null;
  d.classList.remove('open'); d.setAttribute('aria-hidden', 'true');
  document.querySelectorAll('.ftable tr.on').forEach((r) => r.classList.remove('on'));
  if (was && lastFocus && document.body.contains(lastFocus)) lastFocus.focus();
  lastFocus = null;
}

function draw() {
  $('#q').hidden = false; $('#tb').hidden = false; $('#tabs').hidden = false;
  $('#tabs').innerHTML = tabsHTML();
  const S = summary(data.students, data.waiting);
  const said = flash ? `<p class="flash" role="status">${esc(flash)}</p>` : '';
  const pane = tab === 'founders' ? foundersHTML()
    : tab === 'inbox' ? `${questionsHTML()}<section class="panel" id="vcom"><p class="tiny">Loading the video comments…</p></section>`
    : tab === 'grow' ? growHTML(S)
    : tab === 'settings' ? `${isTeam() ? teamCanHTML() : ''}<section class="panel" id="team"><p class="tiny">Loading the team…</p></section>${mailchimpHTML()}${can('payments') ? '<section class="panel" id="stripebox"><p class="tiny">Loading the payments…</p></section>' : ''}${can('mailchimp') ? '<section class="panel" id="mctags"></section>' : ''}${mentorsHTML()}`
    : todayHTML(S);
  $('#main').innerHTML = `<div class="stack" role="tabpanel">${said}${pane}</div>`;
  if (tab === 'inbox') loadComments();
  if (tab === 'settings') { loadTeam(); loadStripe(); loadTags(false); }
  if (openId) openDrawer(openId); else closeDrawer();
}

function goTab(k) {
  const was = tab;
  tab = tabOf(k); flash = '';
  // A history step per tab, so Back and Forward walk the cockpit (rule 13).
  try { if (was !== tab || location.hash !== '#' + tab) history.pushState(null, '', '#' + tab); } catch { /* file: or sandboxed */ }
  closeDrawer(); draw(); window.scrollTo(0, 0);
}
window.addEventListener('popstate', () => { if (!data) return; tab = tabOf(location.hash); flash = ''; closeDrawer(); draw(); });

/** What Mailchimp did with the step tags after a step change. */
const tagNote = (d) => (d && d.mailchimp === 'ok' ? ' Step tags sent to Mailchimp.' : d && d.mailchimp === 'failed' ? ` Mailchimp: ${d.mailchimpDetail}` : d && d.mailchimp === 'test' ? ' Mailchimp: step tags logged only (test mode).' : '');

/** What Mailchimp did on a pause or delete, when there is anything to say. */
const mcNote = (d) => (d && d.mailchimp === 'ok' ? ' Unsubscribed in Mailchimp.' : d && d.mailchimp === 'failed' ? ` Mailchimp: ${d.mailchimpDetail}` : d && d.mailchimp === 'test' ? ' Mailchimp: logged only (test mode).' : '');

const person = (id) => (data && data.students.find((s) => s.id === id)) || { id };

function messageBox(id, hint, kind) {
  const s = person(id);
  const k = DRAFT_KINDS[kind] ? kind : 'note';
  const word = newestWord(theirWords(data.words, LEVELS4, 2000), id);
  const D = draftLetter(s, k, { word, origin: location.origin });
  hint = hint || (k === 'note' ? '' : DRAFT_KINDS[k]);
  const note = s.unsubscribed ? '<p class="tiny warn">Unsubscribed: this goes to their Base Camp only, never by email.</p>'
    : !data.mailReady ? '<p class="tiny warn">Email is not switched on yet: this goes to their Base Camp only.</p>' : '';
  $('#dlg').innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-h"><form class="dlgbox" id="msgform">
    <h2 id="dlg-h">${k === 'note' ? 'A note' : 'A letter'} to ${esc(s.name || s.email)}</h2>
    ${hint ? `<p class="tiny">For: ${esc(hint)}</p>` : ''}
    <label>Subject<input id="m-subj" maxlength="160" required value="${esc(D.subject)}"></label>
    <label>Message<textarea id="m-body" rows="${k === 'note' ? 6 : 12}" maxlength="4000" required>${esc(D.body)}</textarea></label>
    ${D.used.word || D.used.pain ? `<p class="tiny">From their own answers: ${[D.used.word ? `their newest sentence in the Blueprint` : '', D.used.pain ? `what hurts most in the North Star (“${esc(D.used.pain)}”)` : ''].filter(Boolean).join(' and ')}. Read it, change a word, send.</p>` : ''}
    <fieldset><legend>Where it goes</legend>
      <label class="rad"><input type="radio" name="ch" value="both" checked> Email and their Base Camp</label>
      <label class="rad"><input type="radio" name="ch" value="email"> Email only</label>
      <label class="rad"><input type="radio" name="ch" value="plan"> Their Base Camp only</label></fieldset>
    ${note}
    <p class="err" id="m-err" role="status"></p>
    <div class="acts"><button type="submit">Send</button><button type="button" class="ghost" data-close>Cancel</button></div>
  </form></div>`;
  if (k === 'note') {
    $('#m-subj').focus();
  } else {
    const t = $('#m-body'); t.focus(); try { t.setSelectionRange(0, 0); t.scrollTop = 0; } catch { /* old browser */ }
  }
  // A plain note: the first click in the message lands between the greeting and the close.
  if (k === 'note' && D.body) { const t = $('#m-body'), at = D.body.indexOf('\n\n') + 2; t.addEventListener('focus', () => { try { t.setSelectionRange(at, at); } catch { /* old browser */ } }, { once: true }); }
  $('#msgform').onsubmit = async (e) => {
    e.preventDefault();
    const r = await act({ action: 'message', student: id, subject: $('#m-subj').value, body: $('#m-body').value, channel: document.querySelector('input[name=ch]:checked').value });
    if (!r.ok) { $('#m-err').textContent = r.data.error || 'It did not send.'; return; }
    flash = r.data.channel === 'plan' ? `Sent to ${s.name || s.email}'s Base Camp${r.data.unsubscribed ? ' (unsubscribed, so no email)' : ''}.`
      : r.data.channel === 'email' ? `Emailed to ${s.email}.` : `Emailed to ${s.email} and at their Base Camp.`;
    $('#dlg').innerHTML = '';
    load();
  };
}

function deleteBox(id) {
  const s = person(id);
  $('#dlg').innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-h"><form class="dlgbox" id="delform">
    <h2 id="dlg-h">Delete ${esc(s.name || s.email)}?</h2>
    <p>This removes every row for this founder: their account, answers, worksheets, North Star, notes, plan ticks, messages and history. It cannot be undone.</p>
    <label>Type their email to confirm<input id="d-email" autocomplete="off" placeholder="${esc(s.email)}"></label>
    <p class="err" id="d-err" role="status"></p>
    <div class="acts"><button type="submit" class="danger-solid">Delete for good</button><button type="button" class="ghost" data-close>Cancel</button></div>
  </form></div>`;
  $('#d-email').focus();
  $('#delform').onsubmit = async (e) => {
    e.preventDefault();
    const r = await act({ action: 'delete', student: id, confirm: $('#d-email').value });
    if (!r.ok) { $('#d-err').textContent = r.data.error || 'It was not deleted.'; return; }
    flash = `${s.email} was deleted.` + mcNote(r.data);
    $('#dlg').innerHTML = ''; if (openId === id) closeDrawer();
    load();
  };
}

async function csv() {
  const r = await fetch('/api/mentor?csv=1', { headers: H() });
  if (!r.ok) { flash = 'The export did not work.'; return draw(); }
  const url = URL.createObjectURL(await r.blob()), a = document.createElement('a');
  a.href = url; a.download = `founders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* One founder's work: "Open their work" and "Read and answer". */
/** The North Star's own engine (a plain script), so the numbers read exactly
 *  as the founder saw them. Loaded once, only for a founder's page. */
let engineP = null;
function engine() {
  if (window.CompassEngine) return Promise.resolve(window.CompassEngine);
  if (!engineP) engineP = new Promise((ok) => { const sc = document.createElement('script'); sc.src = '/northstar/engine.js'; sc.onload = () => ok(window.CompassEngine || null); sc.onerror = () => ok(null); document.head.appendChild(sc); });
  return engineP;
}
const strip = (x) => String(x ?? '').replace(/<[^>]*>/g, '');
/** The session brief: read before the 1:1. The next session's agenda, and
 *  the founder's record over the levels it reads, in their own words. */
function briefPanel(work, C) {
  const W = {};
  for (const r of work || []) W[r.key] = r.value;
  const B = briefOf(W), S = B.session, t = B.tally;
  if (!B.reached) return '<div class="panel"><h2>Session brief</h2><p class="tiny" style="margin-top:8px">Nothing written in the Blueprint yet. The brief builds itself from their answers.</p></div>';
  let weak = '';
  try { const r = JSON.parse((C && C.results_json) || '{}') || {}, sc = r.scores || [], an = r.answered || []; let lo = -1; for (let i = 0; i < 4; i++) if (an[i] > 0 && Number.isFinite(sc[i]) && (lo < 0 || sc[i] < sc[lo])) lo = i; if (lo >= 0) weak = SIDES[lo]; } catch { weak = ''; }
  const said = (g) => (g == null ? '<span class="tiny">not asked yet</span>' : `<b>${esc(GOT[g])}</b>`);
  return `<div class="panel brief"><h2>Session brief · Session ${S.n}: ${esc(S.name)}</h2>
    <p class="sub">${esc(S.at)}. Read before the call: built only from their own answers.</p>
    <dl class="dkv">
      <dt>Furthest level</dt><dd>Level ${String(B.reached).padStart(2, '0')} of 12</dd>
      ${weak ? `<dt>North Star: start here</dt><dd>${esc(weak)}</dd>` : ''}
      <dt>Sunday record</dt><dd>${t.n ? `${t.done} done · ${t.part} partly · ${t.not} not yet, of ${t.n} checked${t.est ? ` · estimates ${esc(t.est)}` : ''}` : 'No Sunday answers yet'}</dd>
    </dl>
    ${B.ask.length ? `<p class="lbl" style="margin-top:12px">Ask about</p><ul class="climb">${B.ask.map((a) => `<li><b>Level ${String(a.lv).padStart(2, '0')} · ${esc(a.name)}</b> · ${esc(GOT[a.got].toLowerCase())}<br>${strip(a.line)}<br><span class="tiny">${strip(a.notyet)}</span></li>`).join('')}</ul>` : ''}
    ${B.show.length ? `<p class="lbl" style="margin-top:12px">Their offer and pipeline</p><dl class="dkv">${B.show.map((x) => `<dt>${esc(x.label)}</dt><dd>${strip(x.html)}</dd>`).join('')}</dl>` : ''}
    <p class="lbl" style="margin-top:12px">What they promised, and what Sunday said</p>
    <ul class="climb">${B.actions.map((a) => `<li>Level ${String(a.lv).padStart(2, '0')} · ${esc(a.name)}: ${strip(a.line)} · ${said(a.got)}${a.sure != null ? ` <span class="tiny">(${a.sure}% sure)</span>` : ''}</li>`).join('')}</ul>
    <p class="lbl" style="margin-top:12px">The agenda</p><ol class="climb">${S.agenda.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    <p class="tiny" style="margin-top:8px"><b>Done when</b> ${esc(S.done)}</p>
    <p style="margin-top:10px"><button class="ghost" type="button" id="printbrief">Print the brief</button></p></div>`;
}
/** Their Blueprint (Version 4), level by level: what they tapped, slid and wrote. */
function v4Panel(work) {
  const W = {};
  for (const r of work || []) W[r.key] = r.value;
  const lvls = [...new Set(Object.keys(W).map((k) => (/^w\.v4\.(\d{1,2})\./.exec(k) || [])[1]).filter(Boolean).map(Number))].sort((a, b) => a - b);
  if (!lvls.length) return '<div class="panel"><h2>Their Blueprint</h2><p class="tiny" style="margin-top:8px">Nothing answered in the Blueprint yet.</p></div>';
  return `<div class="panel"><h2>Their Blueprint</h2><p class="sub">What they tapped, slid and wrote, level by level, in their own words.</p>
    ${lvls.map((lv) => { const L = LEVELS4[lv - 1]; if (!L) return '';
      const doms = L.d.map((D, di) => {
        const g = (k) => W[`w.v4.${lv}.${di}.${k}`];
        const t = g('t'), sv = g('s'), fields = D.f.filter((x) => typeof x !== 'string'), anyF = fields.some((x) => String(g(x[0]) || '').trim());
        if (t == null && sv == null && !anyF) return '';
        const tap = t != null && D.t.o[Number(t)] != null ? strip(D.t.o[Number(t)]) : '';
        let slide = '';
        if (sv != null && Number.isFinite(Number(sv))) { const w = wordOf(D.s, Number(sv)); slide = `${sv}${D.s.sfx || ''}${w && String(w) !== String(sv) ? ' · ' + w : ''}`; }
        const sent = anyF ? D.f.map((x) => (typeof x === 'string' ? x : (String(g(x[0]) || '').trim() || '____'))).join('') : '';
        // The action: its added day, how sure they were, and what Sunday said.
        const on = String(g('on') || '').trim(), sure = g('sure'), got = g('got');
        const act = [on ? `Day: ${on}` : '', sure != null && sure !== '' ? `${sure}% sure` : '', got != null && got !== '' ? `Sunday: ${['done', 'partly', 'not yet'][Number(got)] || '—'}` : ''].filter(Boolean).join(' · ');
        return `<div class="v4d"><b>${esc(SIDES[di])}</b><span>${tap ? `Tapped: “${esc(tap)}”` : ''}${slide ? `${tap ? '<br>' : ''}Slid: ${esc(slide)} <span class="tiny">(${esc(strip(D.s.q))})</span>` : ''}${sent ? `${tap || slide ? '<br>' : ''}<q>${esc(strip(sent))}</q>` : ''}${act ? `<br><span class="tiny">${esc(act)}</span>` : ''}</span></div>`;
      }).join('');
      return doms ? `<div class="v4l"><h3>Level ${String(lv).padStart(2, '0')} · ${esc(L.word)} · ${esc(L.title)}</h3>${doms}</div>` : '';
    }).join('')}</div>`;
}

async function one(id) {
  const r = await api('?student=' + encodeURIComponent(id));
  if (!r.ok) return load();
  NSE = r.data && r.data.compass ? await engine() : null;
  const d = r.data, s = d.student, A = d.answers || [], C = d.compass, P = d.profile || {}, T = d.ticks || [], M = d.messages || [], K = d.climb || [];
  const SC = d.stages || [], LB = d.library || [], TH = d.thread || [];
  const LEADN = { self: 'Lead yourself', people: 'Lead your people', work: 'Lead your business', market: 'Lead the market' };
  const answered = new Set(TH.filter((x) => x.from === 'mentor').map((x) => x.note));
  const DOMS = [['self', 'Lead yourself'], ['people', 'Lead your people'], ['work', 'Lead your business'], ['market', 'Lead the market']];
  const byLevel = {};
  for (const a of A) { if (!a.body) continue; (byLevel[a.level] = byLevel[a.level] || []).push(a); }
  const levels = Object.keys(byLevel).map(Number).sort((x, y) => x - y);
  const said = flash; flash = '';
  $('#main').innerHTML = `<div class="stack"><div class="bar"><button class="ghost" id="back">← Back to the cockpit</button><button class="ghost" data-msg="${esc(id)}">Send a message</button></div>
    ${said ? `<p class="flash" role="status">${esc(said)}</p>` : ''}
    <div class="panel"><h2>${esc(s.name || s.email)}</h2>
      <p class="tiny">${esc(s.email)} · joined ${when(s.joined_at)}</p>
      <div class="kv">
        <div class="k"><b>Stage</b><span>${esc(s.stage || '—')}</span></div>
        <div class="k"><b>Step</b><span>${esc(STEP_NAMES[s.tier || 'free'] || s.tier)}</span></div>
        <div class="k"><b>Answers written</b><span>${A.filter((a) => a.body).length}</span></div>
        <div class="k"><b>Signed up with</b><span>${esc(P.signup_type ? P.signup_type + ' form' : '—')}</span></div>
        <div class="k"><b>Landing</b><span>${esc(({ road1: 'Road 1 (/road1/)', road2: 'Road 2 (/road2/)', road3: 'Road 3 (/road3/)', road4: 'Road 4 (/road4/)', north2: 'North 2 (/north2/)', north3: 'North 3 (/north3/)', compass: 'The North Star box', summit: 'The Summit' })[P.landing] || '—')}${P.utm_source ? ' · ' + esc([P.utm_source, P.utm_medium, P.utm_campaign, P.utm_content, P.utm_term].filter(Boolean).join(' / ')) : ''}</span></div>
        <div class="k"><b>Company</b><span>${P.company === '' ? 'No company yet' : esc(P.company || '—')}</span></div>
        <div class="k"><b>Interest</b><span>${esc(P.interest || '—')}</span></div>
        <div class="k"><b>Industry</b><span>${esc(P.industry || '—')}</span></div>
        <div class="k"><b>Came from</b><span>${esc(P.source || 'programme')}</span></div>
        <div class="k"><b>Consent</b><span>${P.consent ? 'yes' + (P.consent_at ? ' · ' + when(P.consent_at) : '') : 'no'}</span></div>
        <div class="k"><b>Letters from mentor</b><span>${P.consent && !P.unsubscribed ? 'on' : 'off'}</span></div>
        <div class="k"><b>Mentor</b><span>${!can('mentors') ? esc(((d.mentors || []).find((m) => m.id === P.mentor_id) || {}).name || 'Everyone’s mentor') : `<select data-mentorof="${esc(id)}" aria-label="This founder’s mentor"><option value="">Everyone’s mentor</option>${(d.mentors || []).map((m) => `<option value="${esc(m.id)}"${P.mentor_id === m.id ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select>`}</span></div>
        <div class="k"><b>Time zone</b><span>${esc(P.tz || '—')}</span></div>
        <div class="k"><b>Password</b><span>${d.auth && d.auth.has_password ? 'yes' : P.signup_type === 'simple' ? 'none (signs in by email link)' : 'no'}${d.auth && d.auth.paused ? ' · paused' : ''}</span></div>
      </div></div>
    <div class="panel"><h2>Climb</h2>
      <ul class="climb" style="margin:8px 0 0;padding-left:18px">${K.map((c) => `<li>${esc(c.name)} · ${esc(day(c.at))}</li>`).join('')}</ul></div>
    <div class="panel"><h2>Where they stand</h2>
      ${SC.length ? `<ul class="climb" style="margin:8px 0 0;padding-left:18px">${SC.map((c) => `<li>${c.from ? esc(c.from) + ' → ' : ''}${esc(c.to)} · ${esc(day(c.at))}</li>`).join('')}</ul>`
        : '<p class="tiny" style="margin-top:8px">No stage changes. They walk the stage from their North Star or sign-up.</p>'}</div>
    <div class="panel"><h2>Library</h2>
      ${LB.length ? `<ul class="climb" style="margin:8px 0 0;padding-left:18px">${LB.map((x) => `<li>${esc(x.name)} · ${esc(day(x.at))}</li>`).join('')}</ul>`
        : '<p class="tiny" style="margin-top:8px">Nothing downloaded yet.</p>'}</div>
    ${briefPanel(d.work, C)}
    ${C ? compassPanel(C)
      : '<div class="panel"><h2>North Star</h2><p class="tiny" style="margin-top:8px">Not done yet.</p></div>'}
    ${v4Panel(d.work)}
    <div class="panel"><h2>Account plans · ${T.length} of ${data ? data.totalSteps || 28 : 28} steps done</h2>
      ${T.length ? DOMS.map(([k, label]) => { const rows = T.filter((t) => t.domain === k); return rows.length ? `<div class="dom ${k}" style="padding-top:10px"><h3>${label}</h3>${rows.map((t) => `<div class="ans"><em>${esc(t.title || t.step_id)}</em><p>Done ${when(t.done_at)}</p></div>`).join('')}</div>` : ''; }).join('')
        : '<p class="tiny" style="margin-top:8px">No steps ticked yet.</p>'}</div>
    ${M.length ? `<div class="panel"><h2>Messages sent</h2>${M.map((m) => `<div class="note"><p class="meta">${esc(m.channel)} · ${when(m.sent_at)} · ${m.read_at ? 'read' : 'not read yet'}</p><p><b>${esc(m.subject)}</b></p><p>${esc(m.body)}</p></div>`).join('')}</div>` : ''}
    <div class="panel"><h2>Ask Alexandru · their thread</h2>
      ${TH.length ? TH.map((x) => x.from === 'founder' ? `<div class="note">
        <p class="meta">They asked · ${esc(day(x.at))}${x.level ? ' · Level ' + String(x.level).padStart(2, '0') : ''}${x.domain ? ' · ' + esc(LEADN[x.domain] || x.domain) : ''}</p>
        <p>${esc(x.body)}</p>
        ${answered.has(x.id) ? '' : `<textarea data-note="${esc(x.id)}" placeholder="Your answer… It shows at their Base Camp and goes by email as a letter."></textarea><p style="margin-top:8px"><button class="ghost reply" data-note="${esc(x.id)}">Send answer</button></p>`}
      </div>` : `<div class="note" style="border-left:3px solid #B4975F"><p class="meta">You answered · ${esc(day(x.at))} · ${x.read ? 'read' : 'not read yet'}</p><p>${esc(x.body)}</p></div>`).join('')
        : '<p class="tiny" style="margin-top:8px">No questions yet.</p>'}</div>
    <div class="panel"><h2>Their work</h2>
      ${levels.length ? levels.map((l) => `<div class="dom"><h3>Level ${l}</h3>${DOMS.map(([k, label]) => { const rows = byLevel[l].filter((a) => a.domain === k); return rows.length ? `<div class="dom ${k}" style="border-top:0;padding-top:10px"><h3>${label}</h3>${rows.sort((a, b) => a.step - b.step).map((a) => `<div class="ans"><em>Step ${a.step + 1}</em><p>${esc(a.body)}</p></div>`).join('')}</div>` : ''; }).join('')}</div>`).join('')
        : '<p class="tiny" style="margin-top:8px">Nothing written yet.</p>'}</div>
    </div>`;
  $('#back').onclick = load;
  const pb = $('#printbrief'); if (pb) pb.onclick = () => window.print();
  window.scrollTo(0, 0);
  document.querySelectorAll('.reply').forEach((b) => b.onclick = async () => {
    const t = document.querySelector(`textarea[data-note="${b.dataset.note}"]`);
    if (!t || !t.value.trim()) return;
    b.disabled = true;
    const r = await act({ action: 'reply', note: b.dataset.note, reply: t.value });
    flash = !r.ok ? (r.data.error || 'The answer did not save.') : r.data.emailed ? 'Answered: at their Base Camp and emailed as a letter.'
      : `Answered: at their Base Camp${r.data.unsubscribed ? ' only (they unsubscribed, so no email)' : ' only (email is not switched on)'}.`;
    one(id);
  });
}

document.addEventListener('click', async (e) => {
  const vh = e.target.closest('[data-vhide]');
  if (vh) {
    vh.disabled = true;
    await fetch('/api/comments', { method: 'POST', headers: { ...H(), 'content-type': 'application/json' }, body: JSON.stringify({ hide: vh.dataset.vhide, hidden: vh.dataset.hidden !== '1' }) }).catch(() => {});
    loadComments();
    return;
  }
  const b = e.target.closest('button, .nm, tr[data-drawer]');
  if (!b) return;
  const d = b.dataset;
  if (d.tab) return goTab(d.tab);
  if (d.gcard) { F = { ...NO_FILTER, group: d.gcard }; q = ''; $('#q').value = ''; return goTab('founders'); }
  if ('newcard' in d) { F = { ...NO_FILTER, act: 'new' }; q = ''; $('#q').value = ''; return goTab('founders'); }
  if (d.f) { F[d.f] = d.v; flash = ''; return draw(); }
  if (d.gw) { GW = d.gw; return draw(); }
  if (b.id === 'inv-go') {
    const email = ($('#inv-email').value || '').trim(), first = ($('#inv-first').value || '').trim(), step = $('#inv-step').value;
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) { flash = 'Type their email first.'; INV_OPEN = true; return draw(); }
    const name = STEP_NAMES[step] || 'the free levels';
    if (step !== 'free' && !confirm(`Open ${name} for ${email}, free, and send the invitation?`)) return;
    b.disabled = true; b.textContent = 'Sending…';
    const x = await act({ action: 'invite', email, first, step });
    INV_OPEN = !x.ok;
    flash = !x.ok ? (x.data.error || 'Could not send the invitation.')
      : `${x.data.fresh ? 'New account made' : 'Account found'} for ${email}: ${step === 'free' ? 'the free levels are' : name + ' is'} open.${x.data.sent ? ' The invitation is on its way.' : ` The letter did not send (${x.data.why || 'email is off'}); send them a sign-in link from their row.`}`;
    return load();
  }
  if (d.pf) { F = { ...NO_FILTER, pay: d.pf, joined: GW }; q = ''; $('#q').value = ''; return goTab('founders'); }
  if ('fclear' in d) { F = { ...NO_FILTER }; q = ''; $('#q').value = ''; flash = ''; return draw(); }
  if (d.drawer) return openDrawer(d.drawer, true);
  if ('xdrawer' in d) return closeDrawer();
  if (d.open) { closeDrawer(); return one(d.open); }
  if (d.msg) return messageBox(d.msg, d.hint, d.kind);
  if (d.medit) {
    const m = (data.mentors || []).find((x) => x.id === d.medit); if (!m) return;
    $('#m-id').value = m.id; $('#m-name').value = m.name; $('#m-title').value = m.title; $('#m-photo').value = m.photo; $('#m-sig').value = m.signature; $('#m-email').value = m.email; $('#m-def').checked = !!m.isDefault;
    $('#m-name').focus(); return;
  }
  if (d.del) return deleteBox(d.del);
  if ('close' in d) { $('#dlg').innerHTML = ''; return; }
  if (b.id === 'csv') return csv();
  if (b.id === 'refresh') { flash = ''; return load(); }
  if (b.id === 'mc-test') {
    const email = $('#mc-email').value.trim();
    if (!email) { $('#mc-email').focus(); return; }
    b.disabled = true;
    const r = await act({ action: 'mc-test', email });
    flash = !r.ok ? (r.data.error || 'The test join did not run.')
      : r.data.status === 'ok' ? `Test join for ${email} accepted by Mailchimp. Look for it in the audience, with the tag.`
      : r.data.status === 'test' ? `Test mode: the join for ${email} was built and logged, not sent.`
      : `Mailchimp did not take the test join: ${r.data.detail}`;
    return load();
  }
  if (b.id === 'mc-backfill') {
    b.disabled = true; b.textContent = 'Sending…';
    const r = await act({ action: 'mc-backfill' });
    flash = !r.ok ? (r.data.error || 'That did not run.')
      : `Sent ${r.data.done}: ${r.data.ok || 0} in Mailchimp, ${r.data.test || 0} logged in test mode, ${r.data.failed || 0} failed.`
        + (r.data.tagged ? ` Step tags for ${r.data.tagged}: ${r.data.tags.ok || 0} sent, ${r.data.tags.test || 0} logged in test mode, ${r.data.tags.failed || 0} failed.` : '')
        + (r.data.left ? ` ${r.data.left} still waiting: press again.` : '');
    return load();
  }
  if (d.link || d.reset) {
    const id = d.link || d.reset;
    b.disabled = true;
    const r = await act({ action: d.link ? 'signin-link' : 'reset-link', student: id });
    flash = r.ok ? `${d.link ? 'Sign-in' : 'Password reset'} link sent to ${person(id).email}.` : (r.data.error || 'It did not send.');
    return draw();
  }
  if (d.hold) {
    b.disabled = true;
    const r = await act({ action: 'series-hold', student: d.hold, hold: d.v === '1' });
    flash = r.ok ? `Letters ${d.v === '1' ? 'paused' : 'resumed'} for ${person(d.hold).email}.` : (r.data.error || 'That did not work.');
    return load();
  }
  if (d.pause) {
    b.disabled = true;
    const r = await act({ action: 'pause', student: d.pause, paused: d.v === '1' });
    flash = r.ok ? `${person(d.pause).email} is ${d.v === '1' ? 'paused' : 'unpaused'}.` + mcNote(r.data) : (r.data.error || 'That did not work.');
    return load();
  }
});
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'mform') return;
  e.preventDefault();
  const v = (id) => ($('#' + id).value || '').trim();
  const r = await act({ action: 'mentor-save', id: v('m-id'), name: v('m-name'), title: v('m-title'), photo: v('m-photo'), signature: v('m-sig'), email: v('m-email'), isDefault: $('#m-def').checked });
  flash = r.ok ? `Mentor saved: ${r.data.mentor.name}.` : (r.data.error || 'That did not save.');
  return load();
});
document.addEventListener('change', async (e) => {
  const mo = e.target.closest('select[data-mentorof]');
  if (mo) {
    const r = await act({ action: 'mentor-assign', student: mo.dataset.mentorof, mentor: mo.value });
    flash = r.ok ? `Letters to ${person(mo.dataset.mentorof).email || 'this founder'} now come from ${mo.value ? mo.options[mo.selectedIndex].text : 'everyone’s mentor'}.` : (r.data.error || 'That did not save.');
    return one(mo.dataset.mentorof);
  }
  const s = e.target.closest('select[data-step]');
  if (!s) return;
  s.disabled = true;
  const r = await act({ action: 'tier', student: s.dataset.step, tier: s.value });
  flash = r.ok ? `${person(s.dataset.step).email} is now in ${STEP_NAMES[s.value]}.` + tagNote(r.data) : (r.data.error || 'That did not save.');
  load();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if ($('#dlg').innerHTML.trim()) { $('#dlg').innerHTML = ''; return; }
    if (openId) closeDrawer();
    return;
  }
  // A row opens the drawer with Enter or Space, as a click does.
  const row = (e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('tr[data-drawer]') ? e.target : null;
  if (row) { e.preventDefault(); openDrawer(row.dataset.drawer, true); }
});
// The search is in the header: it shows the Founders tab, filtered as you type.
$('#q').addEventListener('input', (e) => {
  q = e.target.value; flash = '';
  // From another tab the search starts fresh, over everyone; on Founders it
  // searches inside the chips that are on.
  if (tab !== 'founders') { tab = 'founders'; F = { ...NO_FILTER }; closeDrawer(); try { history.replaceState(null, '', '#founders'); } catch { /* sandboxed */ } }
  if (data) draw();
});

load();

/** The North Star, readable: stage, the four domains (answers, score out of 6,
 *  band), what they said is hard, and their goal. Never raw data. */
const DOMS = [['Lead yourself', '#A8623A'], ['Lead your people', '#4C7355'], ['Lead your business', '#36607F'], ['Lead the market', '#9A7418']];
const PAIN = { clients: 'Not enough clients', cash: 'Cash is tight', time: 'No time for myself', alone: 'Doing everything myself', team: 'Team not stepping up', direction: 'Unclear direction', price: 'Prices feel too low', switch: 'I can’t switch off' };
const GOAL = { freedom: 'More free time', income: 'Higher income', steady: 'Steady clients', team: 'A team I trust', clarity: 'Clarity on direction', grow: 'A new market' };
const CUR = { USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$' };
const MONEY_K = new Set(['sales', 'deliv', 'run', 'save', 'out', 'acq', 'price', 'cpc', 'risk']);
/** One number as the founder gave it: "about $3,750", "60 hours", "6 months". */
function numWord(k, x, cur) {
  const v = x.v, ab = x.est ? 'about ' : '';
  if (typeof v !== 'number') return String(v);
  const r = Math.round(v).toLocaleString('en-US');
  if (MONEY_K.has(k)) return ab + (CUR[cur] || '$') + r;
  if (k === 'hrs' || k === 'want' || k === 'unpaid') return `${ab}${r} hours`;
  if (k === 'hpc') return `${ab}${r} hours per customer`;
  if (k === 'week') return `${ab}${r} hours a week`;
  if (k === 'months' || k === 'wait') return `${ab}${r} months`;
  return ab + r;
}
let NSE = null; // the North Star engine, loaded by one(id) for the numbers
function compassPanel(C) {
  const E = NSE;
  let r = {}, f = {}, S = {};
  try { r = JSON.parse(C.results_json || '{}') || {}; } catch { r = {}; }
  try { f = JSON.parse(C.flags_json || '{}') || {}; } catch { f = {}; }
  try { S = JSON.parse(C.answers_json || '{}') || {}; } catch { S = {}; }
  const ans = r.answered || [], sc = r.scores || [], bd = r.bands || [];
  const total = ans.reduce((a, b) => a + (b || 0), 0);
  const stage = C.stage ? C.stage[0].toUpperCase() + C.stage.slice(1) : '—';
  const pains = Array.isArray(f.pains) ? f.pains.map((k) => PAIN[k] || k) : [];
  const wants = [f.want, f.want2].filter((k, i, a) => k && a.indexOf(k) === i).map((k) => GOAL[k] || k);
  const values = Array.isArray(f.values) ? f.values.map((k) => VALUE_NAMES[k] || k) : [];
  const P = S.profile || {}, taken = (Array.isArray(S.history) ? S.history.length : 0) + 1;
  const said = [['What hurts most', pains], ['What they want most', wants], ['What they care about', values], ['Who works with them', TEAM_NAMES[f.team] ? [TEAM_NAMES[f.team]] : []],
    ['Their business', [P.business, P.type, P.industry].filter(Boolean)], ['Customers yet', S.mode === 'yes' ? ['Yes'] : S.mode === 'plan' ? ['Not yet'] : []]].filter((x) => x[1].length);
  let nums = '';
  if (E && typeof E.numbers === 'function' && S.mode) {
    let n = {}, F = [];
    try { n = E.numbers(S) || {}; F = E.fieldsFor(S.mode) || []; } catch { n = {}; F = []; }
    const rows = F.filter(([k]) => n[k]).map(([k, label]) => [label, numWord(k, n[k], P.currency)]);
    if (n.sales && n.deliv && n.run && [n.sales.v, n.deliv.v, n.run.v].every((v) => typeof v === 'number')) rows.push(['Left this month', numWord('sales', { v: n.sales.v - n.deliv.v - n.run.v, est: n.sales.est || n.deliv.est || n.run.est }, P.currency)]);
    nums = rows.length ? `<p class="lbl" style="margin-top:14px">Their numbers</p><dl class="dkv" style="margin-top:6px">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p class="tiny" style="margin-top:6px">As they gave them. “About” means they picked a range.</p>` : '';
  }
  return `<div class="panel"><h2>North Star</h2><p class="tiny">Saved ${when(C.updated_at)} · stage ${esc(stage)} · ${total} of 8 questions answered · taken ${taken === 1 ? 'once' : taken + ' times'}</p>
    ${total ? `<div class="kgrid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:12px">${DOMS.map(([n, col], i) => `<div class="k" style="border-top:3px solid ${col}"><b>${n}</b><span>${ans[i] ? `${sc[i] ?? 0} of 6 · ${esc(bd[i] || '')}` : 'Not answered yet'}</span></div>`).join('')}</div>`
      : '<p class="tiny" style="margin-top:8px">Opened, but no questions answered yet.</p>'}
    ${said.length ? `<dl class="dkv" style="margin-top:14px">${said.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v.join(' · '))}</dd>`).join('')}</dl>` : ''}
    ${nums}</div>`;
}
