// Every email the site sends goes through here: the results, the welcome and
// the sign-in link.
//
// The Resend key is held in the account's Secrets Store and bound by
// wrangler.toml (a binding is read with .get()); a plain project secret of the
// same name also works. Mail goes from the same verified address as
// exploraself.com's results emails unless MAIL_FROM is set.
//
// No email leaves without a footer that says why it came, how to unsubscribe
// and the postal address. The address is MAIL_POSTAL_ADDRESS, set in the
// Cloudflare dashboard. There is deliberately no default: without it, nothing
// is sent and GET /api/send-plan says so.

export const FROM = 'Alexandru at ExploraSelf <support@exploraself.com>';

/** Ready only when both the key and the postal address exist. */
export function mailState(env) {
  if (!env || !env.RESEND_API_KEY) return { ready: false, reason: 'The email key (RESEND_API_KEY) is not set.' };
  if (!postal(env)) return { ready: false, reason: 'The postal address (MAIL_POSTAL_ADDRESS) is not set, so no email may be sent.' };
  return { ready: true };
}

const postal = (env) => (typeof env.MAIL_POSTAL_ADDRESS === 'string' ? env.MAIL_POSTAL_ADDRESS.trim() : '');

/** The key, whether it arrives as a Secrets Store binding or a plain secret. */
async function key(env) {
  const k = env.RESEND_API_KEY;
  if (typeof k === 'string') return k;
  try { return k && typeof k.get === 'function' ? await k.get() : ''; } catch { return ''; }
}

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Three per address and ten per connection, per hour, across every kind of
 *  email. Returns true when this one may go. */
/** What a founder reads when the mail limit stops a request. Password
 *  sign-in has its own counter (login.js) and is never stopped by this one. */
export const LIMIT_MSG = "We've sent 3 emails to this address in the last hour. To keep your account safe, wait an hour, or sign in with your password.";
export async function allowed(D, email, ip) {
  const hourAgo = Date.now() - 3600_000;
  const seen = await D.prepare('SELECT SUM(email = ?) AS e, SUM(ip = ?) AS i FROM mail_log WHERE at > ?').bind(email, ip, hourAgo).first();
  return !((seen?.e || 0) >= 3 || (seen?.i || 0) >= 10);
}
export async function logged(D, email, ip) {
  await D.prepare('INSERT INTO mail_log (email, ip, at) VALUES (?,?,?)').bind(email, ip, Date.now()).run();
  await D.prepare('DELETE FROM mail_log WHERE at < ?').bind(Date.now() - 86400_000).run();
}

/** The footer, in both forms. `why` is one plain sentence. */
export function footer(env, { why, unsubUrl }) {
  const addr = postal(env);
  const html = `<div style="margin-top:26px;padding-top:14px;border-top:1px solid #E2D7BF;font:12px/1.6 Arial,sans-serif;color:#5E5446">
    <p style="margin:0 0 6px">${esc(why)}</p>
    ${unsubUrl ? `<p style="margin:0 0 6px"><a href="${esc(unsubUrl)}" style="color:#7A5C16">Unsubscribe</a> from anything you did not ask for.</p>` : ''}
    <p style="margin:0">ExploraSelf · ${esc(addr)}</p></div>`;
  const text = ['', '—', why, unsubUrl ? `Unsubscribe: ${unsubUrl}` : '', `ExploraSelf · ${addr}`].filter((x) => x !== '').join('\n');
  return { html, text };
}

/** Send one email. Resolves to { ok, why }. Never throws.
 *  `html` is a full document whose </body> receives the footer. A letter's
 *  `replyTo` (the mentor's address) and `fromName` ("Alexandru at ExploraSelf")
 *  go with it. */
export async function send(env, { to, subject, html, text, why, unsubUrl, replyTo, fromName, attachments }) {
  const st = mailState(env);
  if (!st.ready) return { ok: false, why: st.reason };
  const apiKey = await key(env);
  if (!apiKey) return { ok: false, why: 'The email key could not be read.' };
  const f = footer(env, { why, unsubUrl });
  const body = {
    from: env.MAIL_FROM || (fromName ? `${String(fromName).replace(/[<>"\r\n]/g, '')} <support@exploraself.com>` : FROM), to: [to], subject,
    html: html.includes('</body>') ? html.replace(/<\/div><\/body>/, `${f.html}</div></body>`) : html + f.html,
    text: text + '\n' + f.text,
  };
  if (replyTo && /^[^@\s<>"]+@[^@\s<>"]+$/.test(replyTo)) body.reply_to = replyTo;
  // Files Resend fetches from our own site and attaches (a public https path).
  if (Array.isArray(attachments) && attachments.length) body.attachments = attachments.map((a) => ({ filename: a.filename, path: a.path }));
  if (unsubUrl) body.headers = { 'List-Unsubscribe': `<${unsubUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null);
  return r && r.ok ? { ok: true } : { ok: false, why: 'The email service did not accept it.' };
}

/** Where links in an email point: the site that was asked. */
export const origin = (request) => {
  try { return new URL(request.url).origin; } catch { return 'https://linktolead.exploraself.com'; }
};
