// The number of an exploraself.com form's Mailchimp tag (Alexandru, 2 Nov
// 2026: "the Two-Week Test form … you do it"). A form there sends the tag as
// a number; this finds the tag by its name, or makes it, and says the number,
// so nobody has to build the form in Mailchimp by hand.
// GET ?form=<label>. Only for a form on the tag list (functions/_tag-list.js
// SITE_TAGS) whose number is still missing: a name is never invented (rule
// 17), and once the number is written into the list this answers 404.

import { json, bad } from '../_shared.js';
import { SITE_TAGS } from '../_tag-list.js';
import { tagNumber } from '../_mailchimp.js';

export async function onRequestGet({ request, env }) {
  const label = new URL(request.url).searchParams.get('form') || '';
  const T = SITE_TAGS.find((t) => t.label === label && t.name && !t.id);
  if (!T) return bad('No form on the list is waiting for its tag number.', 404);
  const r = await tagNumber(env, T.name);
  if (!r.ok) return bad(r.why, 503);
  return json({ ok: true, form: T.label, name: T.name, id: String(r.id), made: r.made });
}
