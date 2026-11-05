// The ten Good People Win letters on one page, as they land in the inbox, for
// the people who work at ExploraSelf (exploraself.com/internal → Emails →
// "Good People Win · the ten letters"). Drawn from the code that sends them
// (functions/_gpw.js), so it never drifts from the real letters.
//
//   node scripts/gpw-page.mjs <out.html>
//
// Alexandru sends feedback on each letter as it arrives (5 Nov 2026): change
// the words in functions/_gpw-letters.js, run this and scripts/email-map.mjs,
// and put both pages in the exploraself repo (AGENTS.md rules 14 and 21).

import { writeFileSync } from 'node:fs';
import { gpwLetter, LAST, GAP_HOURS } from '../functions/_gpw.js';
import { GPW_NAME } from '../functions/_gpw-letters.js';
import { SITE } from '../functions/_course.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function gpwPage({ date = new Date().toISOString().slice(0, 10) } = {}) {
  const letters = Array.from({ length: LAST }, (_, i) => gpwLetter(SITE, i + 1, { first: 'Alexandru', tz: 'Europe/Rome', at: new Date(`${date}T08:07:00Z`) }));
  const nav = letters.map((L, i) => `<a href="#l${i + 1}">${i + 1}. ${esc(L.subject)}</a>`).join('');
  const body = letters.map((L, i) => `<h2 id="l${i + 1}">${i + 1}. ${esc(L.subject)}</h2><p class="when">${i === 0 ? 'At once' : `Day ${i * 2}, ${GAP_HOURS} hours after letter ${i}`}</p><iframe title="${esc(L.subject)}" loading="lazy" srcdoc="${esc(L.html)}"></iframe>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${GPW_NAME} letters</title>
<style>body{margin:0;background:#f3efe7;font:16px Georgia,serif;color:#222}main{max-width:720px;margin:auto;padding:16px}h1{font-size:26px}nav a{display:block;color:#7a5c1e;margin:4px 0}h2{margin:40px 0 4px;font-size:19px}.when{margin:0 0 8px;color:#6a6052;font:13px Arial,sans-serif}iframe{width:100%;border:1px solid #ddd;background:#fff;height:1700px;border-radius:8px}</style></head>
<body><main><h1>${GPW_NAME}: the ten letters</h1><p>Letter 1 at once, then one every ${GAP_HOURS} hours, never at night in their time zone. Shown as Alexandru would get them. Drawn from the code on ${esc(date)}.</p><nav>${nav}</nav>${body}</main></body></html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = process.argv[2];
  if (!out) { console.error('Usage: node scripts/gpw-page.mjs <out.html>'); process.exit(1); }
  writeFileSync(out, gpwPage());
  console.log(`${LAST} letters → ${out}`);
}
