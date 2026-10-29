// The mentor's page: the dashboard, the account manager and each founder's
// work. Loaded by /mentor only, never by a founder's page. Every figure comes
// from the roster the API returns; an empty count shows 0.

import { STEP_KEYS, STEP_NAMES, summary, filter, needsYou } from './dash.js';

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
    ${t('all', S.total, 'Founders in total')}${t('new', S.newWeek, 'New this week')}${t('compass', S.compass, 'Compass done')}
    ${STEP_KEYS.map((k) => t(k, S.steps[k], 'In ' + STEP_NAMES[k])).join('')}
    ${t('notes', S.notes, 'Notes waiting for a reply')}${t('quiet', S.quiet, 'Quiet for 14+ days')}
  </div>`;
}

function needsHTML() {
  const N = needsYou(data.students, data.waiting);
  if (!N.length) return '<div class="panel"><h2>Needs you</h2><p class="tiny" style="margin-top:8px">Nothing waiting. No unread notes, and nobody quiet for 14 days or more.</p></div>';
  return `<div class="panel"><h2>Needs you</h2><ul class="needs">${N.slice(0, 30).map((x) => `<li>
      <div><b>${esc(x.name || x.email)}</b><span class="em">${x.kind === 'note' ? `Note: “${esc(String(x.text).slice(0, 160))}” · ${when(x.at)}` : `Quiet for ${x.days} days`}</span></div>
      <span class="acts">${x.kind === 'note' ? `<button class="ghost" data-open="${esc(x.id)}">Read and reply</button>` : ''}<button class="ghost" data-msg="${esc(x.id)}">Send a message</button></span></li>`).join('')}</ul></div>`;
}

function tableHTML() {
  const rows = filter(data.students, { tile, q });
  const total = data.totalSteps || 28;
  return `<div class="bar"><input id="q" type="search" placeholder="Search name, email or business" value="${esc(q)}" style="max-width:340px">
      <span class="count">${rows.length} of ${data.students.length}</span><span style="flex:1"></span>
      <button class="ghost" id="csv">Export CSV</button><button class="ghost" id="refresh">Refresh</button></div>
    ${flash ? `<p class="flash" role="status">${esc(flash)}</p>` : ''}
    ${rows.length ? `<div class="tscroll"><table><thead><tr><th>Founder</th><th>Joined</th><th>Last seen</th><th>Stage</th><th>Step</th><th>Compass</th><th>Plans</th><th>Password</th><th>Consent</th><th>Unsub.</th><th>Paused</th><th>Actions</th></tr></thead>
    <tbody>${rows.map((s) => `<tr>
      <td><span class="nm" data-open="${esc(s.id)}">${esc(s.name || '—')}</span><span class="em">${esc(s.email)}</span>${s.open_notes ? `<span class="em warn"><span class="dot"></span>${s.open_notes} unread note${s.open_notes > 1 ? 's' : ''}</span>` : ''}</td>
      <td class="tiny">${when(s.joined_at)}</td><td class="tiny">${when(s.last_seen_at || s.joined_at)}</td>
      <td>${esc(s.stage || '—')}</td>
      <td><select data-step="${esc(s.id)}" aria-label="Step for ${esc(s.name || s.email)}">${STEP_KEYS.map((k) => `<option value="${k}"${(s.tier || 'free') === k ? ' selected' : ''}>${STEP_NAMES[k]}</option>`).join('')}</select></td>
      <td>${s.compass_at ? 'done' : '—'}</td><td class="tiny">${s.plan_ticks || 0} of ${total}</td>
      <td>${yes(s.has_password)}</td><td>${yes(s.consent)}</td><td>${s.unsubscribed ? '<b class="warn">yes</b>' : '—'}</td><td>${s.paused ? '<b class="warn">paused</b>' : '—'}</td>
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

function draw() {
  const S = summary(data.students, data.waiting);
  $('#main').innerHTML = `${tilesHTML(S)}${needsHTML()}<h2 style="margin-top:28px">Account manager</h2>${tableHTML()}<div id="dlg"></div>`;
  const qi = $('#q');
  qi.oninput = () => { q = qi.value; const pos = qi.selectionStart; draw(); const n = $('#q'); n.focus(); n.setSelectionRange(pos, pos); };
}

const person = (id) => data.students.find((s) => s.id === id) || { id };

function messageBox(id) {
  const s = person(id);
  const note = s.unsubscribed ? '<p class="tiny warn">Unsubscribed: this goes to their Ground Plan only, never by email.</p>'
    : !data.mailReady ? '<p class="tiny warn">Email is not switched on yet: this goes to their Ground Plan only.</p>' : '';
  $('#dlg').innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-h"><form class="dlgbox" id="msgform">
    <h2 id="dlg-h">A note to ${esc(s.name || s.email)}</h2>
    <label>Subject<input id="m-subj" maxlength="160" required></label>
    <label>Message<textarea id="m-body" rows="6" maxlength="4000" required></textarea></label>
    <fieldset><legend>Where it goes</legend>
      <label class="rad"><input type="radio" name="ch" value="both" checked> Email and their Ground Plan</label>
      <label class="rad"><input type="radio" name="ch" value="email"> Email only</label>
      <label class="rad"><input type="radio" name="ch" value="plan"> Their Ground Plan only</label></fieldset>
    ${note}
    <p class="err" id="m-err" role="status"></p>
    <div class="acts"><button type="submit">Send</button><button type="button" class="ghost" data-close>Cancel</button></div>
  </form></div>`;
  $('#m-subj').focus();
  $('#msgform').onsubmit = async (e) => {
    e.preventDefault();
    const r = await act({ action: 'message', student: id, subject: $('#m-subj').value, body: $('#m-body').value, channel: document.querySelector('input[name=ch]:checked').value });
    if (!r.ok) { $('#m-err').textContent = r.data.error || 'It did not send.'; return; }
    flash = r.data.channel === 'plan' ? `Sent to ${s.name || s.email}'s Ground Plan${r.data.unsubscribed ? ' (unsubscribed, so no email)' : ''}.`
      : r.data.channel === 'email' ? `Emailed to ${s.email}.` : `Emailed to ${s.email} and in their Ground Plan.`;
    load();
  };
}

function deleteBox(id) {
  const s = person(id);
  $('#dlg').innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-h"><form class="dlgbox" id="delform">
    <h2 id="dlg-h">Delete ${esc(s.name || s.email)}?</h2>
    <p>This removes every row for this founder: their account, answers, worksheets, Compass, notes, plan ticks, messages and history. It cannot be undone.</p>
    <label>Type their email to confirm<input id="d-email" autocomplete="off" placeholder="${esc(s.email)}"></label>
    <p class="err" id="d-err" role="status"></p>
    <div class="acts"><button type="submit" class="danger-solid">Delete for good</button><button type="button" class="ghost" data-close>Cancel</button></div>
  </form></div>`;
  $('#d-email').focus();
  $('#delform').onsubmit = async (e) => {
    e.preventDefault();
    const r = await act({ action: 'delete', student: id, confirm: $('#d-email').value });
    if (!r.ok) { $('#d-err').textContent = r.data.error || 'It was not deleted.'; return; }
    flash = `${s.email} was deleted.`; load();
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
  const d = r.data, s = d.student, A = d.answers || [], C = d.compass, N = d.notes || [], P = d.profile || {}, T = d.ticks || [], M = d.messages || [];
  const DOMS = [['self', 'Lead yourself'], ['people', 'Lead your people'], ['work', 'Lead your business'], ['market', 'Lead the market']];
  const byLevel = {};
  for (const a of A) { if (!a.body) continue; (byLevel[a.level] = byLevel[a.level] || []).push(a); }
  const levels = Object.keys(byLevel).map(Number).sort((x, y) => x - y);
  $('#main').innerHTML = `<div class="bar"><button class="ghost" id="back">← All founders</button><button class="ghost" data-msg="${esc(id)}">Send a message</button></div>
    <div class="panel"><h2>${esc(s.name || s.email)}</h2>
      <p class="tiny">${esc(s.email)} · joined ${when(s.joined_at)}</p>
      <div class="kv">
        <div class="k"><b>Stage</b><span>${esc(s.stage || '—')}</span></div>
        <div class="k"><b>Step</b><span>${esc(STEP_NAMES[s.tier || 'free'] || s.tier)}</span></div>
        <div class="k"><b>Answers written</b><span>${A.filter((a) => a.body).length}</span></div>
        <div class="k"><b>Industry</b><span>${esc(P.industry || '—')}</span></div>
        <div class="k"><b>Came from</b><span>${esc(P.source || 'programme')}</span></div>
        <div class="k"><b>Consent</b><span>${P.consent ? 'yes' + (P.consent_at ? ' · ' + when(P.consent_at) : '') : 'no'}</span></div>
        <div class="k"><b>Unsubscribed</b><span>${P.unsubscribed ? 'yes' : 'no'}</span></div>
        <div class="k"><b>Password</b><span>${d.auth && d.auth.has_password ? 'yes' : 'no'}${d.auth && d.auth.paused ? ' · paused' : ''}</span></div>
      </div></div>
    ${C ? `<div class="panel"><h2>Compass</h2><p class="tiny">Saved ${when(C.updated_at)}${C.stage ? ' · stage ' + esc(C.stage) : ''}</p>
      <pre class="pre">${esc(JSON.stringify(JSON.parse(C.results_json || '{}'), null, 2))}</pre>
      ${C.flags_json && C.flags_json !== 'null' ? `<p class="tiny" style="margin-top:10px"><b>Choices:</b> ${esc(C.flags_json)}</p>` : ''}</div>`
      : '<div class="panel"><h2>Compass</h2><p class="tiny" style="margin-top:8px">Not done yet.</p></div>'}
    <div class="panel"><h2>Account plans · ${T.length} of ${data ? data.totalSteps || 28 : 28} steps done</h2>
      ${T.length ? DOMS.map(([k, label]) => { const rows = T.filter((t) => t.domain === k); return rows.length ? `<div class="dom ${k}" style="padding-top:10px"><h3>${label}</h3>${rows.map((t) => `<div class="ans"><em>${esc(t.title || t.step_id)}</em><p>Done ${when(t.done_at)}</p></div>`).join('')}</div>` : ''; }).join('')
        : '<p class="tiny" style="margin-top:8px">No steps ticked yet.</p>'}</div>
    ${M.length ? `<div class="panel"><h2>Messages sent</h2>${M.map((m) => `<div class="note"><p class="meta">${esc(m.channel)} · ${when(m.sent_at)} · ${m.read_at ? 'read' : 'not read yet'}</p><p><b>${esc(m.subject)}</b></p><p>${esc(m.body)}</p></div>`).join('')}</div>` : ''}
    ${N.length ? `<div class="panel"><h2>Notes</h2>${N.map((n) => `<div class="note">
      <p class="meta">${n.level ? 'Level ' + n.level : ''}${n.domain ? ' · ' + esc(n.domain) : ''} · ${when(n.created_at)} · ${esc(n.status)}</p>
      <p>${esc(n.body)}</p>
      ${n.reply ? `<p class="tiny" style="margin-top:9px"><b>You replied:</b> ${esc(n.reply)}</p>` : `<textarea data-note="${esc(n.id)}" placeholder="Reply…"></textarea><p style="margin-top:8px"><button class="ghost reply" data-note="${esc(n.id)}">Send reply</button></p>`}
    </div>`).join('')}</div>` : ''}
    <div class="panel"><h2>Their work</h2>
      ${levels.length ? levels.map((l) => `<div class="dom"><h3>Level ${l}</h3>${DOMS.map(([k, label]) => { const rows = byLevel[l].filter((a) => a.domain === k); return rows.length ? `<div class="dom ${k}" style="border-top:0;padding-top:10px"><h3>${label}</h3>${rows.sort((a, b) => a.step - b.step).map((a) => `<div class="ans"><em>Step ${a.step + 1}</em><p>${esc(a.body)}</p></div>`).join('')}</div>` : ''; }).join('')}</div>`).join('')
        : '<p class="tiny" style="margin-top:8px">Nothing written yet.</p>'}</div>
    <div id="dlg"></div>`;
  $('#back').onclick = load;
  document.querySelectorAll('.reply').forEach((b) => b.onclick = async () => {
    const t = document.querySelector(`textarea[data-note="${b.dataset.note}"]`);
    if (!t || !t.value.trim()) return;
    await act({ action: 'reply', note: b.dataset.note, reply: t.value });
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
  if (d.del) return deleteBox(d.del);
  if ('close' in d) { $('#dlg').innerHTML = ''; return; }
  if (b.id === 'csv') return csv();
  if (b.id === 'refresh') { flash = ''; return load(); }
  if (d.link || d.reset) {
    const id = d.link || d.reset, r = await act({ action: d.link ? 'signin-link' : 'reset-link', student: id });
    flash = r.ok ? `${d.link ? 'Sign-in' : 'Password reset'} link sent to ${person(id).email}.` : (r.data.error || 'It did not send.');
    return draw();
  }
  if (d.pause) {
    const r = await act({ action: 'pause', student: d.pause, paused: d.v === '1' });
    flash = r.ok ? `${person(d.pause).email} is ${d.v === '1' ? 'paused' : 'unpaused'}.` : (r.data.error || 'That did not work.');
    return load();
  }
});
document.addEventListener('change', async (e) => {
  const s = e.target.closest('select[data-step]');
  if (!s) return;
  const r = await act({ action: 'tier', student: s.dataset.step, tier: s.value });
  flash = r.ok ? `${person(s.dataset.step).email} is now in ${STEP_NAMES[s.value]}.` : (r.data.error || 'That did not save.');
  load();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#dlg')) $('#dlg').innerHTML = ''; });

load();
