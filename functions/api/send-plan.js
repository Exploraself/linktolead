// "Email me my results" on the Compass.
//
// Off until the mail is ready: the Resend key AND the postal address for the
// footer (see functions/_mail.js). GET says { ready, reason } and the Compass
// shows plainly when it cannot send.
//
// The results go to the account. A signed-in founder sends with their token
// and the email goes to the account address, without asking. Otherwise the
// address typed must belong to an account (the Compass creates the free
// account first), and it goes to that address. Results are something the
// founder asked for in the moment, so they arrive even after an unsubscribe.
// Everything visitor-written is escaped and capped, and each address and
// connection is rate-limited.

import { json, bad, db, clean, looksLikeEmail, accountTables, studentBy } from '../_shared.js';
import { mailState, allowed, logged, send, esc as e, origin } from '../_mail.js';
import { profile, unsubLink } from '../_account.js';

export const onRequestGet = ({ env }) => json(mailState(env));

const list = (v, n, max) => (Array.isArray(v) ? v.slice(0, n).map((x) => clean(x, max)).filter(Boolean) : []);

/** Rebuild a small, known shape from whatever arrived. Unknown keys are dropped. */
function shape(p) {
  p = p && typeof p === 'object' ? p : {};
  const domains = (Array.isArray(p.domains) ? p.domains : []).slice(0, 4).map((d) => ({
    know: clean(d?.know, 40), lead: clean(d?.lead, 40), label: clean(d?.label, 40),
    strengthen: list(d?.strengthen, 2, 200), steps: list(d?.steps, 9, 240), level: clean(d?.level, 80),
  }));
  const numbers = (Array.isArray(p.numbers) ? p.numbers : []).slice(0, 6).map((r) => [clean(r?.[0], 60), clean(r?.[1], 30)]);
  const next = (Array.isArray(p.next) ? p.next : []).slice(0, 3).map((a) => ({ title: clean(a?.title, 120), text: clean(a?.text, 300) }));
  const strategy = (Array.isArray(p.strategy) ? p.strategy : []).slice(0, 4).map((s) => ({
    lead: clean(s?.lead, 40), goal: clean(s?.goal, 600), week: clean(s?.week, 600), check: clean(s?.check, 600),
  }));
  return { name: clean(p.name, 60), business: clean(p.business, 80), stage: clean(p.stage, 40), focus: clean(p.focus, 120), domains, numbers, next, strategy };
}

function render(p) {
  const gold = '#7A5C16', ink = '#14100B', muted = '#5E5446', line = '#E2D7BF';
  const h = (t) => `<p style="margin:28px 0 8px;font:700 11px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${gold}">${e(t)}</p>`;
  const domains = p.domains.map((d) => `
    <div style="border-top:3px solid ${gold};padding:14px 0 6px;margin-top:14px">
      <p style="margin:0;font:600 20px Georgia,serif;color:${ink}">${e(d.know)} <span style="font:13px Arial,sans-serif;color:${muted}">· ${e(d.lead)} · ${e(d.label)}</span></p>
      ${d.strengthen.length ? `<p style="margin:10px 0 4px;font:700 11px Arial;color:${gold}">TO STRENGTHEN</p>${d.strengthen.map((q) => `<p style="margin:2px 0;font:14px Arial;color:${ink}">${e(q)}</p>`).join('')}` : ''}
      <p style="margin:10px 0 4px;font:700 11px Arial;color:${gold}">DO THIS</p>
      <ol style="margin:0;padding-left:20px;font:14px/1.55 Arial;color:${ink}">${d.steps.map((s) => `<li>${e(s)}</li>`).join('')}</ol>
      ${d.level ? `<p style="margin:10px 0 0;font:13px Arial;color:${muted}">In Link to Lead: <b style="color:${ink}">${e(d.level)}</b></p>` : ''}
    </div>`).join('');
  const nums = p.numbers.map(([k, v]) => `<tr><td style="padding:7px 0;border-bottom:1px solid ${line};font:14px Arial;color:${muted}">${e(k)}</td><td style="padding:7px 0;border-bottom:1px solid ${line};font:600 15px Arial;color:${ink};text-align:right">${e(v)}</td></tr>`).join('');
  const next = p.next.map((a, i) => `<p style="margin:12px 0 2px;font:600 16px Georgia,serif;color:${ink}">${i + 1}. ${e(a.title)}</p><p style="margin:0;font:14px/1.55 Arial;color:${muted}">${e(a.text)}</p>`).join('');
  const strat = p.strategy.filter((s) => s.goal || s.week || s.check).map((s) => `<p style="margin:12px 0 2px;font:600 15px Arial;color:${ink}">${e(s.lead)}</p>${[['In 90 days, I want', s.goal], ['This week, I will', s.week], ['I’ll know it worked when', s.check]].filter((r) => r[1]).map(([l, v]) => `<p style="margin:2px 0;font:14px/1.55 Arial;color:${ink}"><span style="color:${muted}">${l}:</span> ${e(v)}</p>`).join('')}`).join('');
  return `<!doctype html><html><body style="margin:0;background:#F7F2E7"><div style="max-width:600px;margin:0 auto;padding:28px 22px;background:#FFFFFF">
    <p style="margin:0;font:700 11px Arial;letter-spacing:3px;color:${gold}">EXPLORASELF · LEADERSHIP COMPASS</p>
    <h1 style="margin:12px 0 4px;font:600 28px/1.2 Georgia,serif;color:${ink}">${p.name ? e(p.name) + ', here' : 'Here'} is your plan.</h1>
    <p style="margin:0;font:15px/1.6 Arial;color:${muted}">${e(p.stage)}${p.business ? ' · ' + e(p.business) : ''}. ${e(p.focus)}</p>
    ${h('Where you are · what to strengthen')}${domains}
    ${nums ? h('Your numbers') + `<table style="width:100%;border-collapse:collapse">${nums}</table><p style="font:12px Arial;color:${muted}">“—” means not enough information yet. “≈” means an estimate from a range.</p>` : ''}
    ${next ? h('Three practical next steps') + next : ''}
    ${strat ? h('Your strategy') + strat : ''}
    <div style="margin-top:30px;padding:22px;background:#14100B;color:#F7F2E7">
      <p style="margin:0;font:600 20px/1.3 Georgia,serif;color:#E3C47E">Now walk it.</p>
      <p style="margin:8px 0 14px;font:14px/1.6 Arial;color:#D3C4A5">Link to Lead walks the same four domains, level by level, for your stage. It starts with The Founder Launchpad: levels 01 to 03, free.</p>
      <a href="https://linktolead.exploraself.com/start" style="display:inline-block;background:#C9A24A;color:#14100B;font:700 15px Arial;padding:12px 20px;text-decoration:none">Enter the Founder Launchpad →</a>
    </div>
    <p style="margin:22px 0 0;font:12px/1.6 Arial;color:${muted}">Planning aid only: not financial, tax or legal advice.</p>
  </div></body></html>`;
}

function text(p) {
  const out = [`EXPLORASELF · LEADERSHIP COMPASS`, `${p.name ? p.name + ', here' : 'Here'} is your plan. ${p.stage}. ${p.focus}`, '', 'WHERE YOU ARE · WHAT TO STRENGTHEN'];
  for (const d of p.domains) out.push('', `${d.know} (${d.lead}): ${d.label}`, ...d.strengthen.map((q) => '  To strengthen: ' + q), ...d.steps.map((s, i) => `  ${i + 1}. ${s}`), d.level ? '  In Link to Lead: ' + d.level : '');
  if (p.numbers.length) out.push('', 'YOUR NUMBERS', ...p.numbers.map(([k, v]) => `${k}: ${v}`));
  if (p.next.length) out.push('', 'THREE PRACTICAL NEXT STEPS', ...p.next.map((a, i) => `${i + 1}. ${a.title} — ${a.text}`));
  out.push('', 'NOW WALK IT: The Founder Launchpad, levels 01 to 03 of Link to Lead, free — https://linktolead.exploraself.com/start');
  return out.join('\n');
}

export async function onRequestPost({ request, env }) {
  const st = mailState(env);
  if (!st.ready) return bad('Email is not switched on yet. Use Print or Save as PDF for now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  // The rate limit needs the database; unthrottled is not acceptable, so refuse.
  const D = db(env);
  if (!D) return bad('Email is not available right now.', 503);
  await accountTables(D);

  let me = body.token ? await studentBy(D, body.token) : null;
  if (!me) {
    const typed = clean(body.email, 200).toLowerCase();
    if (!looksLikeEmail(typed)) return bad('That address does not look complete.');
    me = await D.prepare('SELECT id,email,name FROM student WHERE email = ?').bind(typed).first();
    if (!me) return bad('Create your free account first, then we can send your results.', 404);
  }
  const email = me.email;

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!(await allowed(D, email, ip))) return bad('That is a few already. Try again in an hour.', 429);

  const plan = shape(body.plan);
  const p = await profile(D, me.id);
  const base = origin(request);
  const r = await send(env, { to: email, subject: 'Your Leadership Compass plan', html: render(plan), text: text(plan),
    why: 'You asked for your results at linktolead.exploraself.com/compass. They were sent once, to this address.', unsubUrl: unsubLink(base, p) });
  if (!r.ok) return bad('It did not send. Try again in a minute.', 502);

  await logged(D, email, ip);
  return json({ ok: true, to: email });
}
