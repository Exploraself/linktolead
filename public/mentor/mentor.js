// The mentor's page: the dashboard, the account manager and each founder's
// work. Loaded by /mentor only, never by a founder's page. Every figure comes
// from the roster the API returns; an empty count shows 0.

import { STEP_KEYS, STEP_NAMES, summary, filter, needsYou, byLanding } from './dash.js';

const $ = (s) => document.querySelector(s);
const KEY = 'ftb-mentor-key';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let key = ''; try { key = localStorage.getItem(KEY) || ''; } catch { /* private mode */ }
let data = null, tile = 'all', q = '', flash = '';

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
const yes = (v) => (v ? 'yes' : '—');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "30 Oct 2026". */
const day = (s) => { const d = new Date(s); return isNaN(d) ? '—' : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

function gate(msg) {
  $('#main').innerHTML = `<div class="gate"><h2>Sign in</h2>
    <p>Enter the mentor key. It is set in Cloudflare as <b>MENTOR_KEY</b>.</p>
    <p style="margin-top:16px"><input id="k" type="password" placeholder="Mentor key" autocomplete="off"></p>
    <p style="margin-top:12px"><button id="go">Open the roster</button></p>
    ${msg ? `<p class="err">${esc(msg)}</p>` : ''}</div>`;
  $('#go').onclick = () => { key = $('#k').value.trim(); try { localStorage.setItem(KEY, key); } catch { /* private mode */ } load(); };
  $('#k').onkeydown = (e) => { if (e.key === 'Enter') $('#go').click(); };
}

async function load() {
  if (!key) return gate('');
  const r = await api('');
  if (r.status === 401) return gate('That key was not accepted.');
  if (r.status === 503) return gate('The database is not attached to this site yet.');
  if (!r.ok) return gate('Could not reach the roster.');
  data = r.data; draw();
}

function tilesHTML(S) {
  const t = (k, n, label) => `<button type="button" class="tile${tile === k ? ' on' : ''}" data-tile="${k}" aria-pressed="${tile === k}"><b>${n}</b><span>${label}</span></button>`;
  return `<div class="tiles">
    ${t('all', S.total, 'Founders in total')}${t('new', S.newWeek, 'New this week')}${t('compass', S.compass, 'North Star done')}
    ${STEP_KEYS.map((k) => t(k, S.steps[k], 'In ' + STEP_NAMES[k])).join('')}
    ${t('notes', S.notes, 'Questions waiting for an answer')}${t('quiet', S.quiet, 'Quiet for 14+ days')}${t('library', S.library, 'Downloaded from the library')}${t('full', S.full, 'Signed up · full form')}${t('simple', S.simple, 'Signed up · simple form')}
  </div>`;
}

/** A small table: sign-ups per landing page. */
function landingHTML() {
  const L = byLanding(data.students);
  return `<div class="panel"><h2>Sign-ups per landing</h2>
    <div class="tscroll"><table class="mclog"><thead><tr><th>Landing</th><th>Sign-ups</th><th>Last 7 days</th><th>Full form</th></tr></thead><tbody>
      ${L.map((r) => `<tr><td>${esc(r.name)}</td><td>${r.total}</td><td>${r.week}</td><td>${r.full}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="tiny" style="margin-top:8px">Counted from the sign-ups that recorded their landing; earlier accounts have none.</p></div>`;
}

function needsHTML() {
  const N = needsYou(data.students, data.waiting);
  if (!N.length) return '<div class="panel"><h2>Needs you</h2><p class="tiny" style="margin-top:8px">Nothing waiting. No unanswered questions, and nobody quiet for 14 days or more.</p></div>';
  return `<div class="panel"><h2>Needs you</h2><ul class="needs">${N.slice(0, 30).map((x) => `<li>
      <div><b>${esc(x.name || x.email)}</b><span class="em">${x.kind === 'note' ? `Question: “${esc(String(x.text).slice(0, 160))}” · ${when(x.at)}` : `Quiet for ${x.days} days`}</span></div>
      <span class="acts">${x.kind === 'note' ? `<button class="ghost" data-open="${esc(x.id)}">Read and answer</button>` : ''}<button class="ghost" data-msg="${esc(x.id)}">Send a message</button></span></li>`).join('')}</ul></div>`;
}

const MC_MODE = { test: 'Test', form: 'Form', api: 'Live API' };
const MC_STATUS = { ok: 'in Mailchimp', test: 'test only', failed: 'failed' };

/** Mailchimp: the mode, what is missing, a test join, the backfill and the
 *  last 20 calls. Nothing here is a secret; the API key never leaves Cloudflare. */
function mailchimpHTML() {
  const M = data.mailchimp;
  if (!M) return '';
  const last = (M.log || [])[0];
  const lastFail = last && last.status === 'failed' ? `<p class="flash warn" role="status"><b>Last call failed:</b> ${esc(last.detail)}</p>` : '';
  return `<div class="panel mc"><h2>Mailchimp · ${esc(MC_MODE[M.mode] || M.mode)}</h2>
    <p class="tiny" style="margin-top:6px">${esc(M.reason)}</p>${lastFail}
    <div class="bar" style="margin-top:12px"><input id="mc-email" type="email" placeholder="Email for a test join" autocomplete="off" style="max-width:280px">
      <button class="ghost" id="mc-test">Send a test join</button><span style="flex:1"></span>
      <button class="ghost" id="mc-backfill"${M.waiting ? '' : ' disabled'}>Send everyone with consent (${M.waiting} waiting)</button></div>
    ${M.waitingTags ? `<p class="tiny" style="margin-top:6px">${M.waitingTags} of them ${M.waitingTags === 1 ? 'is' : 'are'} already in Mailchimp and only need${M.waitingTags === 1 ? 's' : ''} their step tags.</p>` : ''}
    ${(M.log || []).length ? `<div class="tscroll"><table class="mclog"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Mode</th><th>Status</th><th>Detail</th></tr></thead><tbody>
      ${M.log.map((r) => `<tr><td class="tiny">${when(r.at)}</td><td class="tiny">${esc(r.email || (r.student_id === 'mentor' ? 'mentor' : '—'))}</td><td class="tiny">${esc(r.action)}</td><td class="tiny">${esc(r.mode)}</td>
        <td>${r.status === 'failed' ? '<b class="warn">failed</b>' : esc(r.status)}</td><td class="tiny">${esc(r.detail || '')}</td></tr>`).join('')}</tbody></table></div>`
      : '<p class="tiny" style="margin-top:10px">No Mailchimp calls yet.</p>'}
  </div>`;
}

function tableHTML() {
  const rows = filter(data.students, { tile, q });
  const total = data.totalSteps || 28;
  return `<div class="bar"><input id="q" type="search" placeholder="Search name, email or business" value="${esc(q)}" style="max-width:340px">
      <span class="count">${rows.length} of ${data.students.length}</span><span style="flex:1"></span>
      <button class="ghost" id="csv">Export CSV</button><button class="ghost" id="refresh">Refresh</button></div>
    ${flash ? `<p class="flash" role="status">${esc(flash)}</p>` : ''}
    ${rows.length ? `<div class="tscroll"><table><thead><tr><th>Founder</th><th>Joined</th><th>Last seen</th><th>Stage</th><th>Step</th><th>North Star</th><th>Plans</th><th>Form</th><th>Landing</th><th>Company</th><th>Interest</th><th>Industry</th><th>Password</th><th>Consent</th><th>Unsub.</th><th>Paused</th><th>Mailchimp</th><th>Actions</th></tr></thead>
    <tbody>${rows.map((s) => `<tr>
      <td><span class="nm" data-open="${esc(s.id)}">${esc(s.name || '—')}</span><span class="em">${esc(s.email)}</span>${s.open_notes ? `<span class="em warn"><span class="dot"></span>${s.open_notes} unanswered question${s.open_notes > 1 ? 's' : ''}</span>` : ''}</td>
      <td class="tiny">${when(s.joined_at)}</td><td class="tiny">${when(s.last_seen_at || s.joined_at)}</td>
      <td>${esc(s.stage || '—')}</td>
      <td><select data-step="${esc(s.id)}" aria-label="Step for ${esc(s.name || s.email)}">${STEP_KEYS.map((k) => `<option value="${k}"${(s.tier || 'free') === k ? ' selected' : ''}>${STEP_NAMES[k]}</option>`).join('')}</select></td>
      <td>${s.compass_at ? 'done' : '—'}</td><td class="tiny">${s.plan_ticks || 0} of ${total}</td>
      <td class="tiny">${esc(s.signup_type || '—')}</td><td class="tiny">${esc(({ road1: 'Road 1', road2: 'Road 2', road21: 'Road 2.1', road3: 'Road 3', compass: 'Compass box' })[s.landing] || '—')}${s.utm_source ? `<span class="em">${esc(s.utm_source)}${s.utm_content ? ' · ' + esc(s.utm_content) : ''}</span>` : ''}</td><td class="tiny">${s.company === '' ? 'No company yet' : esc(s.company || '—')}</td><td class="tiny">${esc(s.interest || '—')}</td><td class="tiny">${esc(s.industry || '—')}</td>
      <td>${yes(s.has_password)}</td><td>${yes(s.consent)}</td><td>${s.unsubscribed ? '<b class="warn">yes</b>' : '—'}</td><td>${s.paused ? '<b class="warn">paused</b>' : '—'}</td>
      <td class="tiny">${s.mailchimp_status ? (s.mailchimp_status === 'failed' ? '<b class="warn">failed</b>' : esc(MC_STATUS[s.mailchimp_status] || s.mailchimp_status)) + ' · ' + when(s.mailchimp_at) : (s.consent && !s.unsubscribed ? 'not sent yet' : '—')}</td>
      <td class="acts">
        <button class="ghost" data-open="${esc(s.id)}">Open work</button>
        <button class="ghost" data-msg="${esc(s.id)}">Send a message</button>
        <button class="ghost" data-link="${esc(s.id)}">Send sign-in link</button>
        <button class="ghost" data-reset="${esc(s.id)}">Send a password reset link</button>
        <button class="ghost" data-pause="${esc(s.id)}" data-v="${s.paused ? 0 : 1}">${s.paused ? 'Unpause' : 'Pause'}</button>
        <button class="ghost danger" data-del="${esc(s.id)}">Delete</button>
      </td></tr>`).join('')}</tbody></table></div>`
    : '<div class="empty">Nobody here yet. The roster fills as founders sign up.</div>'}`;
}

/** Mentors: who the letters come from. Everyone's mentor (the default), and
 *  others a founder can be given on their own page. */
function mentorsHTML() {
  const L = data.mentors || [];
  const row = (m) => `<li><img src="${esc(m.photo)}" alt="" width="40" height="40" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:1px solid var(--gold)">
    <div><b>${esc(m.name)}</b>${m.isDefault ? ' <span class="pill premium">Everyone’s mentor</span>' : ''}<span class="em">${esc(m.title)} · replies to ${esc(m.email)}</span></div>
    <img src="${esc(m.signature)}" alt="" height="28" style="height:28px;width:auto;margin-left:auto;background:#fff;padding:2px 6px">
    <button class="ghost" data-medit="${esc(m.id)}">Edit</button></li>`;
  return `<details class="panel mentors"><summary><h2 style="display:inline">Mentors · ${L.length}</h2> <span class="tiny">Letters come from the founder’s mentor: name, photo and signature.</span></summary>
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

function draw() {
  const S = summary(data.students, data.waiting);
  $('#main').innerHTML = `${tilesHTML(S)}${landingHTML()}${needsHTML()}${mailchimpHTML()}${mentorsHTML()}<h2 style="margin-top:28px">Account manager</h2>${tableHTML()}<div id="dlg"></div>`;
  const qi = $('#q');
  qi.oninput = () => { q = qi.value; const pos = qi.selectionStart; draw(); const n = $('#q'); n.focus(); n.setSelectionRange(pos, pos); };
}

/** What Mailchimp did with the step tags after a step change. */
const tagNote = (d) => (d && d.mailchimp === 'ok' ? ' Step tags sent to Mailchimp.' : d && d.mailchimp === 'failed' ? ` Mailchimp: ${d.mailchimpDetail}` : d && d.mailchimp === 'test' ? ' Mailchimp: step tags logged only (test mode).' : '');

/** What Mailchimp did on a pause or delete, when there is anything to say. */
const mcNote = (d) => (d && d.mailchimp === 'ok' ? ' Unsubscribed in Mailchimp.' : d && d.mailchimp === 'failed' ? ` Mailchimp: ${d.mailchimpDetail}` : d && d.mailchimp === 'test' ? ' Mailchimp: logged only (test mode).' : '');

const person = (id) => data.students.find((s) => s.id === id) || { id };

function messageBox(id) {
  const s = person(id);
  const note = s.unsubscribed ? '<p class="tiny warn">Unsubscribed: this goes to their Base Camp only, never by email.</p>'
    : !data.mailReady ? '<p class="tiny warn">Email is not switched on yet: this goes to their Base Camp only.</p>' : '';
  $('#dlg').innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-h"><form class="dlgbox" id="msgform">
    <h2 id="dlg-h">A note to ${esc(s.name || s.email)}</h2>
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
    flash = `${s.email} was deleted.` + mcNote(r.data); load();
  };
}

async function csv() {
  const r = await fetch('/api/mentor?csv=1', { headers: { 'x-mentor-key': key } });
  if (!r.ok) { flash = 'The export did not work.'; return draw(); }
  const url = URL.createObjectURL(await r.blob()), a = document.createElement('a');
  a.href = url; a.download = `founders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* One founder's work (the existing view). */
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
  $('#main').innerHTML = `<div class="bar"><button class="ghost" id="back">← All founders</button><button class="ghost" data-msg="${esc(id)}">Send a message</button></div>
    ${said ? `<p class="flash" role="status">${esc(said)}</p>` : ''}
    <div class="panel"><h2>${esc(s.name || s.email)}</h2>
      <p class="tiny">${esc(s.email)} · joined ${when(s.joined_at)}</p>
      <div class="kv">
        <div class="k"><b>Stage</b><span>${esc(s.stage || '—')}</span></div>
        <div class="k"><b>Step</b><span>${esc(STEP_NAMES[s.tier || 'free'] || s.tier)}</span></div>
        <div class="k"><b>Answers written</b><span>${A.filter((a) => a.body).length}</span></div>
        <div class="k"><b>Signed up with</b><span>${esc(P.signup_type ? P.signup_type + ' form' : '—')}</span></div>
        <div class="k"><b>Landing</b><span>${esc(({ road1: 'Road 1 (/road1/)', road2: 'Road 2 (/road2/)', road21: 'Road 2.1 (/road2.1/)', road3: 'Road 3 (/road3/)', compass: 'The North Star box' })[P.landing] || '—')}${P.utm_source ? ' · ' + esc([P.utm_source, P.utm_medium, P.utm_campaign, P.utm_content, P.utm_term].filter(Boolean).join(' / ')) : ''}</span></div>
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
    <div id="dlg"></div>`;
  $('#back').onclick = load;
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
  const b = e.target.closest('button, .nm');
  if (!b) return;
  const d = b.dataset;
  if (d.tile) { tile = d.tile; flash = ''; return draw(); }
  if (d.open) return one(d.open);
  if (d.msg) return messageBox(d.msg);
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
    const id = d.link || d.reset, r = await act({ action: d.link ? 'signin-link' : 'reset-link', student: id });
    flash = r.ok ? `${d.link ? 'Sign-in' : 'Password reset'} link sent to ${person(id).email}.` : (r.data.error || 'It did not send.');
    return draw();
  }
  if (d.pause) {
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
  const r = await act({ action: 'tier', student: s.dataset.step, tier: s.value });
  flash = r.ok ? `${person(s.dataset.step).email} is now in ${STEP_NAMES[s.value]}.` + tagNote(r.data) : (r.data.error || 'That did not save.');
  load();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#dlg')) $('#dlg').innerHTML = ''; });

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
