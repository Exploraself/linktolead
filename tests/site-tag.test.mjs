// The Two-Week Test form's tag (Alexandru, 2 Nov 2026: "you do it"): the
// server finds the tag "Assessment 2 weektest" by its name, or makes it, and
// says its number, so the form on exploraself.com can send it. Only for a
// form on the tag list still waiting for its number (rule 17).

import { onRequestGet } from '../functions/api/site-tag.js';
import { SITE_TAGS } from '../functions/_tag-list.js';
import { tally } from './_d1.mjs';

const { ok, done } = tally('site-tag');
const env = { MAILCHIMP_API_KEY: 'abc-us19' };
const calls = [];
let segments = [{ id: 111, name: 'linktolead-road1', member_count: 3 }];
globalThis.fetch = async (url, init = {}) => {
  calls.push([init.method || 'GET', String(url), init.body || '']);
  if ((init.method || 'GET') === 'GET') return new Response(JSON.stringify({ segments, total_items: segments.length }));
  const b = JSON.parse(init.body); const made = { id: 4242, name: b.name, member_count: 0 }; segments = [...segments, made];
  return new Response(JSON.stringify(made));
};
const ask = async (form, e = env) => { const r = await onRequestGet({ request: new Request('https://linktolead.exploraself.com/api/site-tag?form=' + encodeURIComponent(form)), env: e }); return { status: r.status, j: await r.json() }; };

const T = SITE_TAGS.find((t) => t.label === 'The Two-Week Test form');
ok(T && T.name === 'Assessment 2 weektest', 'the Two-Week Test form is on the list, with its tag name');
let r = await ask('The Two-Week Test form');
ok(r.status === 200 && r.j.id === '4242' && r.j.made === true && calls.some(([m, u, b]) => m === 'POST' && u.endsWith('/lists/41448b6750/segments') && JSON.parse(b).name === 'Assessment 2 weektest'), 'missing in Mailchimp: made as a tag, with the list’s exact name, and its number said');
r = await ask('The Two-Week Test form');
ok(r.status === 200 && r.j.id === '4242' && r.j.made === false && calls.filter(([m]) => m === 'POST').length === 1, 'asked again: found by name, never made twice');
ok((await ask('The LAB form')).status === 404, 'a form whose number is already written: nothing to do');
ok((await ask('linktolead-anything')).status === 404, 'a name that is not on the list is never made');
ok((await ask('The Two-Week Test form', {})).status === 503, 'without the API key: it says so, and makes nothing');
done();
