#!/usr/bin/env node
/* The Growth Toolkit as one JSON file, for its second front door (Alexandru,
 * 3 Nov 2026: "the Growth Toolkit and the tools … have to have the same name
 * and be the same thing … and when we add it …").
 *
 *   node scripts/toolkit-json.mjs        writes public/tools/catalog.json
 *
 * public/tools/catalog.js is the one list. exploraself.com/tools and the
 * Growth Toolkit groups in exploraself.com/internal read this JSON when they
 * load, so a tool added to catalog.js shows on both sites, with no Lovable
 * edit. tests/toolkit-sync.test.mjs fails when the JSON is behind catalog.js:
 * run this script in the same work (AGENTS.md rule 13). */
import { writeFileSync } from 'node:fs';
import { CATEGORIES, CATALOG, TOOLKIT_NAME, colorOf } from '../public/tools/catalog.js';

export const SITE = 'https://linktolead.exploraself.com';

export function toolkitJSON() {
  return {
    name: TOOLKIT_NAME,
    site: SITE,
    page: `${SITE}/tools/`,
    categories: CATEGORIES.map((g) => ({ key: g.key, name: g.name, sub: g.sub, color: g.color })),
    tools: CATALOG.map((c) => (c.soon
      ? { key: c.key, name: c.name, category: c.category, domain: c.domain, soon: true, sub: c.sub }
      : { key: c.key, name: c.name, category: c.category, domain: c.domain, soon: false, href: `${SITE}${c.href}`,
        kicker: c.kicker, head: c.head, headText: c.headText || '', sub: c.sub, strip: c.strip, art: c.art, color: colorOf(c) })),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = new URL('../public/tools/catalog.json', import.meta.url);
  writeFileSync(out, JSON.stringify(toolkitJSON(), null, 1) + '\n');
  console.log(`${CATALOG.length} tools → public/tools/catalog.json`);
}
