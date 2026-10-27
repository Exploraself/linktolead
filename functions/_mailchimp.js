// Mailchimp, from the server, with nothing secret in the repo.
//
// These five ids come from the public embed form on Alexandru's own list —
// the same values any visitor's browser would send. They are not credentials,
// so no API key lives here and nothing needs to be set in the dashboard.
//
// His form marks LNAME, COMPANY and PHONE required, so a join that is missing
// any of them is rejected by Mailchimp and the subscriber never appears. The
// join route collects all five for that reason.

const BASE = 'https://exploraselfmba.us8.list-manage.com/subscribe/post-json';
const U = 'ab5e056ba759e867cde44f4da';
const LIST = '41448b6750';
const FORM = '005a1ae1f0';
const TAG = '3359661';

/** Subscribe one founder. Resolves to a short reason on failure, never throws:
 *  a list that will not take someone must not cost them their place. */
export async function subscribe({ first, last, email, company, phone }) {
  const body = new URLSearchParams({
    u: U, id: LIST, f_id: FORM,
    EMAIL: email,
    FNAME: first || '',
    LNAME: last || '',
    COMPANY: company || '',
    PHONE: phone || '',
    tags: TAG,
    // The form's honeypot. Mailchimp expects it present and empty.
    [`b_${U}_${LIST}`]: '',
  });

  try {
    const r = await fetch(`${BASE}?${body}`, {
      method: 'GET',
      headers: { 'user-agent': 'exploraself-blueprint' },
    });
    const text = await r.text();
    // post-json answers as JSONP: callback({"result":"success","msg":"..."}).
    const m = /\{[\s\S]*\}/.exec(text);
    if (!m) return { ok: false, why: 'unreadable reply' };
    const out = JSON.parse(m[0]);
    if (out.result === 'success') return { ok: true };
    // "already subscribed" is a success as far as we are concerned.
    if (/already subscribed/i.test(out.msg || '')) return { ok: true, already: true };
    return { ok: false, why: String(out.msg || 'refused').slice(0, 200) };
  } catch (e) {
    return { ok: false, why: String((e && e.message) || e).slice(0, 200) };
  }
}
