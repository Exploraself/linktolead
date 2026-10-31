// The Mentor cockpit (approved by Alexandru, 31 Oct 2026): the dashboard, the
// account manager and each founder's work. Loaded by /mentor only, never by a
// founder's page. Every figure comes from the roster the API returns; an empty
// count shows 0. The arithmetic (groups, next action, funnel, filters) lives
// in ./dash.js, where the tests hold it.
//
// Tabs: Today · Founders · Questions · Mailchimp · Mentors & comments. A row
// in Founders opens a drawer with every action; "Open their work" is the
// one-founder view, one(id).

import { STEP_KEYS, STEP_NAMES, STEP_SHORT, GROUPS, LANDING_SHORT, summary, filter, byLanding, groupOf, nextAction, funnel, today, levelSet, levelCount, launchpadDone, crossedOf } from './dash.js';

const $ = (s) => document.querySelector(s);
const KEY = 'ftb-mentor-key';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let key = ''; try { key = localStorage.getItem(KEY) || ''; } catch { /* private mode */ }
const TABS = [['today', 'Today'], ['founders', 'Founders'], ['questions', 'Questions'], ['mailchimp', 'Mailchimp'], ['settings', 'Mentors & comments']];
const NO_FILTER = { group: 'all', step: 'all', act: 'all', need: 'all', more: 'all' };
let data = null, q = '', flash = '', openId = null;
let tab = TABS.some(([k]) => '#' + k === location.hash) ? location.hash.slice(1) : 'today';
let F = { ...NO_FILTER };

const api = async (path, opts) => {
  const r = await fetch('/api/mentor' + (path || ''), Object.assign({ headers: { 'x-mentor-key': key, 'content-type': 'application/json' } }, opts || {}));
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

function gate(msg) {
  $('#q').hidden = true; $('#tb').hidden = true; $('#tabs').hidden = true; closeDrawer();
  $('#main').innerHTML = `<div class="gate"><h2>Sign in</h2>
    <p>Enter the mentor key. It is set in Cloudflare as <b>MENTOR_KEY</b>.</p>
    <p style="margin-top:16px;display:flex;gap:6px;max-width:420px"><input id="k" type="password" placeholder="Mentor key" autocomplete="off" style="flex:1;min-width:0"><button type="button" class="ghost" id="k-eye" aria-label="Show the key" aria-pressed="false" style="width:46px;flex:none;padding:0;display:inline-flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></p>
    <p style="margin-top:12px"><button id="go">Open the cockpit</button></p>
    ${msg ? `<p class="err">${esc(msg)}</p>` : ''}</div>`;
  $('#go').onclick = () => { key = $('#k').value.trim(); try { localStorage.setItem(KEY, key); } catch { /* private mode */ } load(); };
  $('#k').onkeydown = (e) => { if (e.key === 'Enter') $('#go').click(); };
  $('#k-eye').onclick = () => { const f = $('#k'), show = f.type === 'password'; f.type = show ? 'text' : 'password'; $('#k-eye').setAttribute('aria-pressed', String(show)); $('#k-eye').setAttribute('aria-label', show ? 'Hide the key' : 'Show the key'); };
}

async function load() {
  if (!key) return gate('');
  const r = await api('');
  if (r.status === 401) return gate('That key was not accepted.');
  if (r.status === 503) return gate('The database is not attached to this site yet.');
  if (!r.ok) return gate('Could not reach the roster.');
  data = r.data; draw();
}

function tabsHTML() {
  const n = (data.waiting || []).length;
  return TABS.map(([k, label]) => `<button type="button" role="tab" aria-selected="${tab === k}" data-tab="${k}">${esc(label)}${k === 'questions' && n ? `<b>${n}<span class="vh"> waiting</span></b>` : ''}</button>`).join('');
}

// ── Today ────────────────────────────────────────────────────────────────────

function groupsHTML(S) {
  const card = (k) => `<button type="button" class="g" style="--c:var(--${k})" data-gcard="${k}"><span class="n">${S.groups[k]}</span><span class="t">${GROUPS[k].name}</span><span class="d">${GROUPS[k].what}</span><span class="act">${GROUPS[k].act} →</span></button>`;
  return `<div class="groups">${['ns', 'bp', 'both'].map(card).join('')}
    <button type="button" class="g" style="--c:var(--gold)" data-newcard><span class="n">${S.newWeek}</span><span class="t">New this week</span><span class="d">${plural(S.total, 'founder', 'founders')} in total · ${S.quiet} quiet for 14+ days${S.groups.none ? ` · ${S.groups.none} not started yet` : ''}</span></button></div>`;
}

const SEV = { question: 'var(--warn)', quiet: 'var(--warn)', ready: 'var(--both)', new: 'var(--gold)' };
function needsHTML() {
  const N = today(data.students, data.waiting);
  const g = (s) => { const k = groupOf(s); return k ? GROUPS[k].name : 'Nothing started yet'; };
  const why = (x) => x.kind === 'question' ? `${x.count > 1 ? `Asked ${x.count} questions` : 'Asked a question'} · waiting for your answer since ${when(x.waitingSince)}<br>“${esc(String(x.text || '').slice(0, 140))}${String(x.text || '').length > 140 ? '…' : ''}”`
    : x.kind === 'quiet' ? `Quiet for ${x.days} days · ${g(x.s)}`
    : x.kind === 'ready' ? 'Finished the free Launchpad · ready for the Boardroom'
    : `New, ${x.days === 0 ? 'today' : x.days === 1 ? 'yesterday' : x.days + ' days ago'} · ${g(x.s)}`;
  const btn = (x) => x.does === 'open' ? `<button class="btn gold" data-open="${esc(x.id)}">${x.button}</button>`
    : `<button class="btn" data-msg="${esc(x.id)}" data-hint="${esc(x.kind === 'ready' ? 'Offer the Boardroom' : x.kind === 'new' ? 'A welcome' : 'A check-in')}">${x.button}</button>`;
  const body = N.length ? `<ul class="needs">${N.slice(0, 30).map((x) => `<li><span class="sev" style="--c:${SEV[x.kind]}"></span>
      <div><button type="button" class="linkish" data-drawer="${esc(x.id)}">${esc(x.s.name || x.s.email || '—')}</button><span class="why">${why(x)}</span></div>${btn(x)}</li>`).join('')}</ul>
      ${N.length > 30 ? `<p class="tiny">And ${N.length - 30} more. The Founders tab has everyone.</p>` : ''}`
    : '<p class="hint">Nothing needs you today. No questions waiting, nobody quiet for 14 days or more, nobody new in the last 3 days.</p>';
  return `<div class="panel"><div><h2>Needs you today</h2><p class="sub">Most urgent first. One button each.</p></div>${body}</div>`;
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

function todayHTML(S) {
  return `<div><h2>Where your founders are</h2><p class="sub">Tap a group to see who is in it. Each group has the one thing that moves them on.</p></div>
    ${groupsHTML(S)}
    <div class="row2">${needsHTML()}${funnelHTML()}</div>
    ${landingHTML()}`;
}

// ── Founders ─────────────────────────────────────────────────────────────────

function filtersHTML() {
  const row = (label, k, opts) => `<div class="fl" role="group" aria-label="${label}"><span>${label}</span>${opts.map(([v, t]) => `<button type="button" class="chip" data-f="${k}" data-v="${v}" aria-pressed="${F[k] === v}">${esc(t)}</button>`).join('')}</div>`;
  return `<div class="panel filters">
    ${row('Group', 'group', [['all', 'All'], ['ns', 'North Star only'], ['bp', 'Blueprint only'], ['both', 'Both']])}
    ${row('Step', 'step', [['all', 'All'], ...STEP_KEYS.map((k) => [k, STEP_SHORT[k]])])}
    ${row('Activity', 'act', [['all', 'All'], ['new', 'New this week'], ['active', 'Active'], ['quiet', 'Quiet 14+ days']])}
    ${row('Needs', 'need', [['all', 'Anything'], ['q', 'A question waiting'], ['ready', 'Ready for the Boardroom'], ['nopw', 'No password']])}
    ${row('More', 'more', [['all', 'Everyone'], ['full', 'Full form'], ['simple', 'Simple form'], ['library', 'Took a library book']])}
  </div>`;
}

function foundersHTML() {
  const rows = filter(data.students, { ...F, q });
  const any = Object.keys(NO_FILTER).some((k) => F[k] !== 'all') || q;
  const row = (s) => { const n = nextAction(s);
    return `<tr data-drawer="${esc(s.id)}" tabindex="0"${openId === s.id ? ' class="on"' : ''} aria-label="${esc(s.name || s.email)}: open the details">
      <td class="c-who"><span class="who">${avatar(s)}<span style="min-width:0"><b>${esc(s.name || '—')}</b><span class="em">${esc(s.email)}</span></span></span></td>
      <td class="c-group">${groupPill(s)}</td><td class="c-step">${esc(STEP_SHORT[s.tier || 'free'] || s.tier)}</td>
      <td class="c-lv">${levelsBar(s)}</td>
      <td class="c-stage">${esc(stageName(s.stage))}</td><td class="c-seen num">${esc(when(s.last_seen_at || s.joined_at))}</td>
      <td class="c-next">${n.tone ? `<span class="pill ${n.tone}">${esc(n.label)}</span>` : `<span class="sub">${esc(n.label)}</span>`}</td></tr>`; };
  return `${filtersHTML()}
    <div class="panel"><div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><h2>Founders</h2><span class="sub" id="count">${rows.length} of ${data.students.length}</span>
      ${any ? '<button type="button" class="btn" data-fclear style="margin-left:auto">Clear the filters</button>' : ''}</div>
      ${!data.students.length ? '<div class="empty">Nobody here yet. The roster fills as founders sign up.</div>'
        : `<div class="tw"><table class="ftable"><thead><tr><th>Founder</th><th>Group</th><th>Step</th><th>Blueprint</th><th>Stage</th><th>Last seen</th><th>Next</th></tr></thead>
        <tbody>${rows.map(row).join('') || `<tr><td colspan="7" class="sub">Nobody matches these filters.${any ? ' Clear the filters to see everyone.' : ''}</td></tr>`}</tbody></table></div>`}
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
const MC_STATUS = { ok: 'in Mailchimp', test: 'test only', failed: 'failed' };
const mcState = (s) => (s.mailchimp_status ? (s.mailchimp_status === 'failed' ? '<b class="warn">failed</b>' : esc(MC_STATUS[s.mailchimp_status] || s.mailchimp_status)) + ' · ' + when(s.mailchimp_at)
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
  if (!M) return '';
  const last = (M.log || [])[0];
  const lastFail = last && last.status === 'failed' ? `<p class="flash warn" role="status"><b>Last call failed:</b> ${esc(last.detail)}</p>` : '';
  return `<div class="panel mc"><h2>Mailchimp · ${esc(MC_MODE[M.mode] || M.mode)}</h2>
    <p class="tiny">${esc(M.reason)}</p>${lastFail}
    <div class="bar"><input id="mc-email" type="email" placeholder="Email for a test join" autocomplete="off" style="max-width:280px">
      <button class="ghost" id="mc-test">Send a test join</button><span style="flex:1"></span>
      <button class="ghost" id="mc-backfill"${M.waiting ? '' : ' disabled'}>Send everyone with consent (${M.waiting} waiting)</button></div>
    ${M.waitingTags ? `<p class="tiny">${M.waitingTags} of them ${M.waitingTags === 1 ? 'is' : 'are'} already in Mailchimp and only need${M.waitingTags === 1 ? 's' : ''} their step tags.</p>` : ''}
    ${(M.log || []).length ? `<div class="tscroll"><table class="mclog"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Mode</th><th>Status</th><th>Detail</th></tr></thead><tbody>
      ${M.log.map((r) => `<tr><td class="tiny">${when(r.at)}</td><td class="tiny">${esc(r.email || (r.student_id === 'mentor' ? 'mentor' : '—'))}</td><td class="tiny">${esc(r.action)}</td><td class="tiny">${esc(r.mode)}</td>
        <td>${r.status === 'failed' ? '<b class="warn">failed</b>' : esc(r.status)}</td><td class="tiny">${esc(r.detail || '')}</td></tr>`).join('')}</tbody></table></div>`
      : '<p class="tiny">No Mailchimp calls yet.</p>'}
  </div>`;
}

// ── Mentors & comments ───────────────────────────────────────────────────────

/** Mentors: who the letters come from. Everyone's mentor (the default), and
 *  others a founder can be given on their own page. */
function mentorsHTML() {
  const L = data.mentors || [];
  const row = (m) => `<li><img src="${esc(m.photo)}" alt="" width="40" height="40" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:1px solid var(--gold)">
    <div style="min-width:0;flex:1 1 200px"><b>${esc(m.name)}</b>${m.isDefault ? ' <span class="pill both">Everyone’s mentor</span>' : ''}<span class="em">${esc(m.title)} · replies to ${esc(m.email)}</span></div>
    <img src="${esc(m.signature)}" alt="" height="28" style="height:28px;width:auto;max-width:40%;background:#fff;padding:2px 6px;border-radius:4px">
    <button class="ghost" data-medit="${esc(m.id)}">Edit</button></li>`;
  return `<details class="panel mentors" open><summary><h2 style="display:inline">Mentors · ${L.length}</h2> <span class="tiny">Letters come from the founder’s mentor: name, photo and signature.</span></summary>
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
async function loadComments() {
  const box = $('#vcom');
  if (!box) return;
  let d = {};
  try { const r = await fetch('/api/comments?all=1', { headers: { 'x-mentor-key': key } }); d = await r.json().catch(() => ({})); } catch { /* offline */ }
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

function drawerHTML(s) {
  const n = nextAction(s), g = groupOf(s), cr = crossedOf(s), lv = levelCount(s), lp = launchpadDone(s), id = esc(s.id);
  const main = n.does === 'open' ? `<button class="btn gold" data-open="${id}">${esc(n.button)}</button>`
    : n.does === 'unpause' ? `<button class="btn gold" data-pause="${id}" data-v="0">${esc(n.button)}</button>`
    : `<button class="btn gold" data-msg="${id}" data-hint="${esc(n.label)}">${esc(n.button)}</button>`;
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
      <dt>Blueprint</dt><dd>${lv} of 12 levels${lp ? ' · Launchpad done' : ''}</dd>
      <dt>North Star</dt><dd>${s.compass_at ? 'done · ' + esc(day(s.compass_at)) : 'not yet'}</dd>
      <dt>Plans</dt><dd>${s.plan_ticks || 0} of ${data.totalSteps || 28} steps</dd>
      <dt>Joined</dt><dd>${esc(day(s.joined_at))}${land ? ' · ' + esc(land) : ''}${s.utm_source ? `<span class="em">${esc(s.utm_source)}${s.utm_content ? ' · ' + esc(s.utm_content) : ''}</span>` : ''}</dd>
      <dt>Last seen</dt><dd>${esc(when(s.last_seen_at || s.joined_at))}</dd>
      <dt>Signed up with</dt><dd>${esc(s.signup_type ? s.signup_type + ' form' : '—')}</dd>
      <dt>Interest</dt><dd>${esc(s.interest || '—')}</dd>
      <dt>Industry</dt><dd>${esc(s.industry || '—')}</dd>
      <dt>Password</dt><dd>${s.has_password ? 'yes' : s.signup_type === 'simple' ? 'none (signs in by email link)' : 'no'}</dd>
      <dt>Consent</dt><dd>${s.consent ? 'yes' : 'no'}${s.unsubscribed ? ' · <b class="warn">unsubscribed</b>' : ''}</dd>
      <dt>Mailchimp</dt><dd>${mcState(s)}</dd>
      <dt>Library</dt><dd>${books ? plural(books, 'book', 'books') + ' taken' : '—'}</dd>
    </dl>
    <div><p class="lbl">Their path</p><ul class="tl" style="margin-top:8px">
      <li>Signed up${land ? ' on ' + esc(land) : ''} <span>· ${esc(day(s.joined_at))}</span></li>
      ${cr.includes('northstar') ? `<li>Crossed to the North Star, confirmed name and email <span>· tag ${CROSS_TAG.northstar}</span></li>` : ''}
      ${s.compass_at ? `<li>Finished the North Star <span>· ${esc(day(s.compass_at))}</span></li>` : ''}
      ${cr.includes('blueprint') ? `<li>Crossed to the Blueprint, confirmed name and email <span>· tag ${CROSS_TAG.blueprint}</span></li>` : ''}
      ${lv ? `<li>Blueprint: ${lv} of 12 levels${lp ? ' · Launchpad done' : ''}</li>` : ''}
      ${(s.tier || 'free') !== 'free' ? `<li>Step: ${esc(STEP_NAMES[s.tier] || s.tier)}</li>` : ''}
      ${s.paused ? '<li>Paused</li>' : ''}</ul></div>
    <div><p class="lbl">All actions</p><div class="acts" style="margin-top:8px">
      <button class="btn" data-open="${id}">Open their work</button>
      <button class="btn" data-msg="${id}">Send a message</button>
      <button class="btn" data-link="${id}">Send sign-in link</button>
      <button class="btn" data-reset="${id}">Send a password reset link</button>
      <button class="btn" data-pause="${id}" data-v="${s.paused ? 0 : 1}">${s.paused ? 'Unpause' : 'Pause'}</button>
      <button class="btn danger" data-del="${id}">Delete</button></div>
      <label class="tiny" style="display:flex;align-items:center;gap:8px;margin-top:12px">Step
        <select data-step="${id}" aria-label="Step for ${esc(s.name || s.email)}">${STEP_KEYS.map((k) => `<option value="${k}"${(s.tier || 'free') === k ? ' selected' : ''}>${STEP_NAMES[k]}</option>`).join('')}</select></label>
      <p class="tiny" style="margin-top:6px">A new step sends its step tags to Mailchimp.</p></div>`;
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
  const pane = tab === 'founders' ? foundersHTML() : tab === 'questions' ? questionsHTML()
    : tab === 'mailchimp' ? crossedHTML(S) + mailchimpHTML()
    : tab === 'settings' ? `${mentorsHTML()}<section class="panel" id="vcom"><p class="tiny">Loading the video comments…</p></section>`
    : todayHTML(S);
  $('#main').innerHTML = `<div class="stack" role="tabpanel">${said}${pane}</div>`;
  if (tab === 'settings') loadComments();
  if (openId) openDrawer(openId); else closeDrawer();
}

function goTab(k) {
  tab = k; flash = '';
  try { history.replaceState(null, '', '#' + k); } catch { /* file: or sandboxed */ }
  closeDrawer(); draw(); window.scrollTo(0, 0);
}

/** What Mailchimp did with the step tags after a step change. */
const tagNote = (d) => (d && d.mailchimp === 'ok' ? ' Step tags sent to Mailchimp.' : d && d.mailchimp === 'failed' ? ` Mailchimp: ${d.mailchimpDetail}` : d && d.mailchimp === 'test' ? ' Mailchimp: step tags logged only (test mode).' : '');

/** What Mailchimp did on a pause or delete, when there is anything to say. */
const mcNote = (d) => (d && d.mailchimp === 'ok' ? ' Unsubscribed in Mailchimp.' : d && d.mailchimp === 'failed' ? ` Mailchimp: ${d.mailchimpDetail}` : d && d.mailchimp === 'test' ? ' Mailchimp: logged only (test mode).' : '');

const person = (id) => (data && data.students.find((s) => s.id === id)) || { id };

function messageBox(id, hint) {
  const s = person(id);
  const note = s.unsubscribed ? '<p class="tiny warn">Unsubscribed: this goes to their Base Camp only, never by email.</p>'
    : !data.mailReady ? '<p class="tiny warn">Email is not switched on yet: this goes to their Base Camp only.</p>' : '';
  $('#dlg').innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-h"><form class="dlgbox" id="msgform">
    <h2 id="dlg-h">A note to ${esc(s.name || s.email)}</h2>
    ${hint ? `<p class="tiny">For: ${esc(hint)}</p>` : ''}
    <label>Subject<input id="m-subj" maxlength="160" required></label>
    <label>Message<textarea id="m-body" rows="6" maxlength="4000" required></textarea></label>
    <fieldset><legend>Where it goes</legend>
      <label class="rad"><input type="radio" name="ch" value="both" checked> Email and their Base Camp</label>
      <label class="rad"><input type="radio" name="ch" value="email"> Email only</label>
      <label class="rad"><input type="radio" name="ch" value="plan"> Their Base Camp only</label></fieldset>
    ${note}
    <p class="err" id="m-err" role="status"></p>
    <div class="acts"><button type="submit">Send</button><button type="button" class="ghost" data-close>Cancel</button></div>
  </form></div>`;
  $('#m-subj').focus();
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
  const r = await fetch('/api/mentor?csv=1', { headers: { 'x-mentor-key': key } });
  if (!r.ok) { flash = 'The export did not work.'; return draw(); }
  const url = URL.createObjectURL(await r.blob()), a = document.createElement('a');
  a.href = url; a.download = `founders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* One founder's work: "Open their work" and "Read and answer". */
async function one(id) {
  const r = await api('?student=' + encodeURIComponent(id));
  if (!r.ok) return load();
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
        <div class="k"><b>Landing</b><span>${esc(({ road1: 'Road 1 (/road1/)', road2: 'North 3 (/north3/, was Road 2)', road21: 'North 2 (/north2/, was Road 2.1)', road3: 'Road 3 (/road3/)', road4: 'Road 4 (/road4/)', compass: 'The North Star box' })[P.landing] || '—')}${P.utm_source ? ' · ' + esc([P.utm_source, P.utm_medium, P.utm_campaign, P.utm_content, P.utm_term].filter(Boolean).join(' / ')) : ''}</span></div>
        <div class="k"><b>Company</b><span>${P.company === '' ? 'No company yet' : esc(P.company || '—')}</span></div>
        <div class="k"><b>Interest</b><span>${esc(P.interest || '—')}</span></div>
        <div class="k"><b>Industry</b><span>${esc(P.industry || '—')}</span></div>
        <div class="k"><b>Came from</b><span>${esc(P.source || 'programme')}</span></div>
        <div class="k"><b>Consent</b><span>${P.consent ? 'yes' + (P.consent_at ? ' · ' + when(P.consent_at) : '') : 'no'}</span></div>
        <div class="k"><b>Letters from mentor</b><span>${P.consent && !P.unsubscribed ? 'on' : 'off'}</span></div>
        <div class="k"><b>Mentor</b><span><select data-mentorof="${esc(id)}" aria-label="This founder’s mentor"><option value="">Everyone’s mentor</option>${(d.mentors || []).map((m) => `<option value="${esc(m.id)}"${P.mentor_id === m.id ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select></span></div>
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
    ${C ? compassPanel(C)
      : '<div class="panel"><h2>North Star</h2><p class="tiny" style="margin-top:8px">Not done yet.</p></div>'}
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
    await fetch('/api/comments', { method: 'POST', headers: { 'x-mentor-key': key, 'content-type': 'application/json' }, body: JSON.stringify({ hide: vh.dataset.vhide, hidden: vh.dataset.hidden !== '1' }) }).catch(() => {});
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
  if ('fclear' in d) { F = { ...NO_FILTER }; q = ''; $('#q').value = ''; flash = ''; return draw(); }
  if (d.drawer) return openDrawer(d.drawer, true);
  if ('xdrawer' in d) return closeDrawer();
  if (d.open) { closeDrawer(); return one(d.open); }
  if (d.msg) return messageBox(d.msg, d.hint);
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
function compassPanel(C) {
  let r = {}, f = {};
  try { r = JSON.parse(C.results_json || '{}') || {}; } catch { r = {}; }
  try { f = JSON.parse(C.flags_json || '{}') || {}; } catch { f = {}; }
  const ans = r.answered || [], sc = r.scores || [], bd = r.bands || [];
  const total = ans.reduce((a, b) => a + (b || 0), 0);
  const stage = C.stage ? C.stage[0].toUpperCase() + C.stage.slice(1) : '—';
  const pains = Array.isArray(f.pains) ? f.pains.map((k) => PAIN[k] || k) : [];
  return `<div class="panel"><h2>North Star</h2><p class="tiny">Saved ${when(C.updated_at)} · stage ${esc(stage)} · ${total} of 8 questions answered</p>
    ${total ? `<div class="kgrid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:12px">${DOMS.map(([n, col], i) => `<div class="k" style="border-top:3px solid ${col}"><b>${n}</b><span>${ans[i] ? `${sc[i] ?? 0} of 6 · ${esc(bd[i] || '')}` : 'Not answered yet'}</span></div>`).join('')}</div>`
      : '<p class="tiny" style="margin-top:8px">Opened, but no questions answered yet.</p>'}
    ${pains.length || f.want ? `<p class="tiny" style="margin-top:12px">${pains.length ? `<b>Finds hard:</b> ${esc(pains.join(' · '))}` : ''}${pains.length && f.want ? ' &nbsp; ' : ''}${f.want ? `<b>Goal:</b> ${esc(GOAL[f.want] || f.want)}` : ''}</p>` : ''}</div>`;
}
