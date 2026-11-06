// 12 Days to Start Winning has its own Mailchimp tag (Alexandru, 5 Nov 2026:
// linktolead-letters-12-days), added when a founder taps Start, only with
// their yes to letters. Real routes on Node's own SQLite; Mailchimp in test
// mode (logged, never called).

import { COURSE_TAG } from '../functions/_course.js';
import { onRequestPost as coursePost } from '../functions/api/course.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { TAG_LIST } from '../functions/_tag-list.js';
import { fakeD1, fakeResend, post, tally } from './_d1.mjs';

const { ok, done } = tally('course-tag');
fakeResend();
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome', MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us8', GPW_MODE: 'off' };
const who = (email, consent) => ({ first: 'Ana', last: 'Pop', email, consent, source: 'home', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1' });
const tokenOf = async (email, consent) => (await (await signup({ request: post('/api/signup', who(email, consent)), env })).json()).token;
const tagsOf = (id) => DB.raw.prepare('SELECT * FROM mailchimp_log WHERE student_id = ?').all(id).filter((r) => String(r.detail || '').includes(COURSE_TAG) || String(r.action || '') === 'tag' && String(r.detail || '').includes('12-days'));

ok(COURSE_TAG === 'linktolead-letters-12-days', 'the name Alexandru approved');
ok(TAG_LIST.some((t) => t.name === COURSE_TAG && t.group === 'letters'), 'on the tag list, with the other letters');

const yes = await tokenOf('ana@example.com', true);
const r = await coursePost({ request: post('/api/course', { token: yes, action: 'start', tz: 'Europe/Rome' }), env });
ok(r.status === 200, 'Start works');
const rows = tagsOf(yes);
ok(rows.length >= 1, `Start adds the 12 Days tag (logged in test mode): ${JSON.stringify(DB.raw.prepare('SELECT action, status, detail FROM mailchimp_log WHERE student_id = ?').all(yes).slice(-2))}`);

const no = await tokenOf('bo@example.com', false);
await coursePost({ request: post('/api/course', { token: no, action: 'start' }), env });
ok(tagsOf(no).length === 0, 'no yes to letters: no tag');

done();
