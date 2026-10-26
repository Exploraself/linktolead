// Mailchimp, from the server side.
//
// The audience's own embed endpoint is used, exactly as the form on the site
// would use it — no API key, so there is nothing secret in the repository.
// A failed subscribe never fails the join: the founder is already in our own
// database, and the newsletter is a second, softer thing.

const BASE = 'https://exploraselfmba.us8.list-manage.com/subscribe/post-json';
const U = 'ab5e056ba759e867cde44f4da';
const LIST = '41448b6750';
const FORM = '005a1ae1f0';
const TAG = '3359661';            // the Blueprint joiners tag

/** Returns { ok, status } and never throws. */
export async function subscribe({ email, first, last, phone, company }) {
  const body = new URLSearchParams({
    u: U, id: LIST, f_id: FORM, c: 'x',
    EMAIL: email,
    FNAME: first || '',
    LNAME: last || '',
    PHONE: phone || '',
    COMPANY: company || '',
    tags: TAG,
    [`b_${U}_${LIST}`]: '',        // the honeypot, deliberately empty
  });
  try {
    const r = await fetch(`${BASE}?${body.toString()}`, {
      method: 'GET',
      headers: { 'user-agent': 'ExploraSelf-Blueprint/1.0' },
    });
    const text = await r.text();
    // The endpoint answers JSONP: x({"result":"success","msg":"…"})
    const m = /\{[\s\S]*\}/.exec(text);
    const data = m ? JSON.parse(m[0]) : null;
    const already = data && /already subscribed/i.test(data.msg || '');
    return { ok: !!data && (data.result === 'success' || already), status: (data && data.result) || 'unknown' };
  } catch {
    return { ok: false, status: 'unreachable' };
  }
}
