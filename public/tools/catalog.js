// The Growth Toolkit (Alexandru, 2 Nov 2026): one entry per tool, in two
// lists. Personal leadership = Lead yourself and Lead your people; Business =
// Lead your business and Lead the market (his four domains, two by two). The
// Tools page (/tools/), the toolkit page (/toolkit/) and each tool's cover read
// this list, so a new tool (the calculator, templates for clients, landing
// pages) is one more entry here and a page of its own.
//
// Covers: Claude's picks (A), approved by Alexandru on 2 Nov 2026
// (https://claude.ai/artifact/8s9cGHAj3ngwK83LbDpQYe). Keys are the page
// addresses; the same keys and names are in functions/_tools.js (a test holds
// them equal). `soon` is an honest "being built" tile with no link (none
// today: Reel structure and Branding structure were built on 2 Nov 2026).

export const TOOLKIT_NAME = 'Growth Toolkit';

export const CATEGORIES = [
  { key: 'personal', name: 'Personal leadership', sub: 'Lead yourself and your people', color: '#E0A282' },
  { key: 'business', name: 'Business', sub: 'Lead your business and the market', color: '#91B8D5' },
];
/** Kept for the domain colours on the covers. */
export const DOMAINS = [
  { key: 'yourself', name: 'Lead yourself', color: '#E0A282' },
  { key: 'people', name: 'Lead your people', color: '#9BC0A1' },
  { key: 'business', name: 'Lead your business', color: '#91B8D5' },
  { key: 'market', name: 'Lead the market', color: '#D9B45E' },
];

export const CATALOG = [
  {
    key: 'off-switch', name: 'The off-switch check', domain: 'yourself', category: 'personal', href: '/off-switch/',
    kicker: 'Lead yourself · The off-switch check',
    head: 'Your laptop is closed. <em>Is your head?</em>', headText: 'Your laptop is closed. Is your head?',
    sub: 'See who really gets your evenings, and win one back this week.',
    strip: ['Free · 90 seconds', 'One evening that is yours'],
    art: `<svg viewBox="0 0 260 120" aria-hidden="true"><path d="M70 86 h120 l14 12 H56 Z" fill="#2B3F55"/><rect x="78" y="74" width="104" height="12" rx="3" fill="#1A2F45" stroke="#3A5470"/><path d="M130 70 C 120 52, 150 46, 138 30 S 150 8, 170 12" fill="none" stroke="#E0A282" stroke-width="2" stroke-dasharray="3 5"/><circle cx="176" cy="14" r="7" fill="#E0A282"/><circle cx="40" cy="22" r="10" fill="none" stroke="#D6BF8F" stroke-width="1.5"/><path d="M40 16v6l4 3" stroke="#D6BF8F" stroke-width="1.5" fill="none"/><text x="40" y="50" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="10" fill="#D6BF8F">9:40 pm</text></svg>`,
  },
  {
    key: '12-days', name: '12 Days to Start Winning', domain: 'yourself', category: 'personal', href: '/12-days/',
    kicker: 'A New Way of Winning · 12 Days to Start Winning',
    head: 'Lead your day <em>before it leads you.</em>', headText: 'Lead your day before it leads you.',
    sub: '12 mornings. One principle and one ten-minute move in your inbox before the day starts.',
    strip: ['Free · 12 mornings', 'One principle, one move'],
    art: `<svg viewBox="0 0 260 120" aria-hidden="true"><path d="M20 100 A 110 110 0 0 1 240 100" fill="none" stroke="#2B3F55" stroke-width="2"/><g fill="#D9B45E"><circle cx="22" cy="96" r="4"/><circle cx="34" cy="74" r="4"/><circle cx="51" cy="55" r="4"/><circle cx="72" cy="40" r="4"/><circle cx="96" cy="29" r="4"/><circle cx="121" cy="23" r="4" opacity=".55"/><circle cx="146" cy="23" r="4" opacity=".45"/><circle cx="171" cy="29" r="4" opacity=".38"/><circle cx="195" cy="40" r="4" opacity=".3"/><circle cx="216" cy="55" r="4" opacity=".24"/><circle cx="231" cy="74" r="4" opacity=".2"/><circle cx="240" cy="96" r="4" opacity=".16"/></g><circle cx="130" cy="100" r="18" fill="#D9B45E" opacity=".25"/><path d="M106 100h48" stroke="#D9B45E" stroke-width="2"/><text x="130" y="118" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="10" fill="#D6BF8F">day 5 of 12</text></svg>`,
    accent: '#D9B45E',
  },
  {
    key: 'bottleneck', name: 'The bottleneck test', domain: 'people', category: 'personal', href: '/bottleneck/',
    kicker: 'Lead your people · The bottleneck test',
    head: 'What stops <em>when you stop?</em>', headText: 'What stops when you stop?',
    sub: 'Your team isn’t stuck. They’re waiting for you. Count the decisions on your desk.',
    strip: ['Free · 2 minutes', 'One decision to hand over'],
    art: `<svg viewBox="0 0 260 120" aria-hidden="true"><g fill="#9BC0A1" opacity=".9"><rect x="10" y="20" width="22" height="16" rx="3"/><rect x="38" y="14" width="22" height="16" rx="3"/><rect x="66" y="22" width="22" height="16" rx="3"/><rect x="18" y="44" width="22" height="16" rx="3"/><rect x="46" y="40" width="22" height="16" rx="3"/><rect x="74" y="48" width="22" height="16" rx="3"/><rect x="12" y="70" width="22" height="16" rx="3"/><rect x="40" y="70" width="22" height="16" rx="3"/><rect x="68" y="76" width="22" height="16" rx="3"/><rect x="96" y="30" width="22" height="16" rx="3"/><rect x="100" y="58" width="22" height="16" rx="3"/></g><path d="M128 12 L170 52 L170 68 L128 108" fill="none" stroke="#D6BF8F" stroke-width="2"/><circle cx="186" cy="60" r="14" fill="none" stroke="#D6BF8F" stroke-width="2"/><text x="186" y="64" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="700" fill="#D6BF8F">YOU</text><rect x="216" y="52" width="22" height="16" rx="3" fill="#9BC0A1" opacity=".35"/><text x="236" y="96" text-anchor="end" font-family="Newsreader,Georgia,serif" font-style="italic" font-size="13" fill="#D6BF8F">one at a time</text></svg>`,
  },
  {
    key: 'runway', name: 'Cash runway', domain: 'business', category: 'business', href: '/runway/',
    kicker: 'Lead your business · Cash runway',
    head: 'Your bank balance is <em>lying to you.</em>', headText: 'Your bank balance is lying to you.',
    sub: 'Tax, a supplier, payroll: some of it already has a name on it. How many weeks are really yours?',
    strip: ['Free · 60 seconds', 'Your weeks, in your numbers'],
    art: `<svg viewBox="0 0 260 120" aria-hidden="true"><rect x="6" y="40" width="248" height="44" rx="8" fill="#1A2F45" stroke="#2B3F55"/><rect x="6" y="40" width="74" height="44" rx="8" fill="#5A4632"/><text x="43" y="67" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="700" fill="#F3EBDD">TAX</text><rect x="82" y="40" width="64" height="44" fill="#4A3B2C"/><text x="114" y="67" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="700" fill="#F3EBDD">SUPPLIER</text><rect x="148" y="40" width="58" height="44" fill="#3E3226"/><text x="177" y="67" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="700" fill="#F3EBDD">PAYROLL</text><rect x="208" y="40" width="46" height="44" rx="8" fill="#91B8D5"/><text x="231" y="67" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="700" fill="#0E1C2B">YOURS</text><text x="6" y="26" font-family="Newsreader,Georgia,serif" font-style="italic" font-size="15" fill="#D6BF8F">Today’s balance</text><path d="M231 92v14" stroke="#91B8D5" stroke-width="2"/><text x="231" y="118" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" fill="#91B8D5">? weeks</text></svg>`,
  },
  {
    key: 'teleprompter', name: 'Teleprompter', domain: 'market', category: 'business', href: '/teleprompter/',
    kicker: 'Lead the market · Teleprompter',
    head: 'Look at the lens, <em>not at your notes.</em>', headText: 'Look at the lens, not at your notes.',
    sub: 'Paste your script, press Start. It scrolls at your pace, mirrors for a glass prompter and keeps time.',
    strip: ['Free · for filming', 'Your script, at your pace'],
    art: `<svg viewBox="0 0 260 120" aria-hidden="true"><rect x="40" y="10" width="180" height="96" rx="10" fill="#1A2F45" stroke="#2B3F55"/><g fill="#D6BF8F"><rect x="62" y="30" width="136" height="6" rx="3" opacity=".35"/><rect x="62" y="46" width="118" height="6" rx="3" opacity=".6"/><rect x="62" y="62" width="136" height="7" rx="3.5"/><rect x="62" y="78" width="96" height="6" rx="3" opacity=".6"/></g><path d="M50 66h6M204 66h6" stroke="#D9B45E" stroke-width="2"/><circle cx="228" cy="22" r="5" fill="#E07A6A"/><text x="130" y="118" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="10" fill="#D6BF8F">02:47 left</text></svg>`,
  },
  // The two writing tools (Alexandru's GO, 2 Nov 2026): public/tools/writer.js.
  {
    key: 'reel-structure', name: 'Reel structure', domain: 'market', category: 'business', href: '/reel-structure/',
    kicker: 'Lead the market · Reel structure',
    head: 'Three seconds to <em>earn the next thirty.</em>', headText: 'Three seconds to earn the next thirty.',
    sub: 'Grab, hook, hold, value, one call to action. A Reel of about 40 seconds, from your own words.',
    strip: ['Free · 5 minutes', 'A script ready to film'],
    art: `<svg viewBox="0 0 260 120" aria-hidden="true"><rect x="16" y="6" width="60" height="108" rx="10" fill="#1A2F45" stroke="#3A5470"/><rect x="22" y="15" width="48" height="88" rx="4" fill="#0E1C2B"/><path d="M40 40 L56 49 L40 58 Z" fill="#D9B45E" opacity=".9"/><rect x="28" y="76" width="36" height="5" rx="2.5" fill="#F3EBDD" opacity=".75"/><rect x="33" y="85" width="26" height="6" rx="3" fill="#D9B45E"/><text x="92" y="24" font-family="Newsreader,Georgia,serif" font-style="italic" font-size="13" fill="#D6BF8F">Grab · Hook · Hold · Value · Act</text><rect x="92" y="52" width="158" height="16" rx="8" fill="#1A2F45" stroke="#2B3F55"/><rect x="92" y="52" width="12" height="16" rx="6" fill="#D9B45E"/><rect x="104" y="52" width="20" height="16" fill="#B4975F"/><rect x="124" y="52" width="79" height="16" fill="#3A5470"/><path d="M150 52v16M177 52v16" stroke="#0E1C2B" stroke-width="2"/><rect x="203" y="52" width="32" height="16" fill="#D6BF8F"/><rect x="235" y="52" width="15" height="16" rx="7" fill="#D9B45E"/><text x="98" y="44" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="700" fill="#D9B45E">3 s</text><text x="163" y="44" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="700" fill="#A9C0D9">HOLD</text><text x="250" y="44" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="700" fill="#D9B45E">1 CTA</text><text x="92" y="84" font-family="Inter,Arial,sans-serif" font-size="10" fill="#D6BF8F">0:00</text><text x="250" y="84" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="10" fill="#D6BF8F">0:40</text></svg>`,
  },
  {
    key: 'branding-structure', name: 'Branding structure', domain: 'market', category: 'business', href: '/branding-structure/',
    kicker: 'Lead the market · Branding structure',
    head: 'If they can’t say it, <em>they can’t share it.</em>', headText: 'If they can’t say it, they can’t share it.',
    sub: 'Your brand on one page, in your customers’ words. Then ask three of them: “Is this you?”',
    strip: ['Free · 6 minutes', 'Your brand on one page'],
    art: `<svg viewBox="0 0 260 120" aria-hidden="true"><rect x="16" y="6" width="124" height="108" rx="8" fill="#1A2F45" stroke="#3A5470"/><rect x="28" y="18" width="98" height="8" rx="4" fill="#D9B45E"/><rect x="28" y="32" width="70" height="5" rx="2.5" fill="#D6BF8F" opacity=".5"/><rect x="28" y="46" width="38" height="22" rx="5" fill="none" stroke="#D6BF8F" stroke-width="1.5"/><text x="47" y="60" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="700" fill="#D6BF8F">FROM</text><path d="M70 57h14m-4-4 4 4-4 4" fill="none" stroke="#D9B45E" stroke-width="1.8"/><rect x="88" y="46" width="38" height="22" rx="5" fill="#D9B45E" fill-opacity=".22" stroke="#D9B45E" stroke-width="1.5"/><text x="107" y="60" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="8" font-weight="700" fill="#D9B45E">TO</text><g fill="none" stroke="#D9B45E" stroke-width="1.4"><rect x="28" y="80" width="28" height="12" rx="6"/><rect x="60" y="80" width="32" height="12" rx="6"/><rect x="96" y="80" width="26" height="12" rx="6"/></g><rect x="28" y="100" width="56" height="4" rx="2" fill="#D6BF8F" opacity=".35"/><path d="M160 22h82a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8h-56l-12 12v-12h-14a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8Z" fill="#0E1C2B" stroke="#D6BF8F" stroke-width="1.5"/><text x="201" y="50" text-anchor="middle" font-family="Newsreader,Georgia,serif" font-style="italic" font-size="15" fill="#F3EBDD">Is this you?</text><g stroke="#D9B45E" stroke-width="1.5" fill="#1A2F45"><circle cx="180" cy="96" r="8"/><circle cx="204" cy="96" r="8"/><circle cx="228" cy="96" r="8"/></g><text x="204" y="117" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="10" fill="#D6BF8F">three customers</text></svg>`,
  },
];

export const byKey = (k) => CATALOG.find((c) => c.key === k) || null;
export const colorOf = (c) => c.accent || (DOMAINS.find((d) => d.key === c.domain) || {}).color || '#D6BF8F';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/** A cover: navy card, domain colour, the picture of the problem, the promise
 *  in the bottom strip. `head` holds a safe <em> from this file only. */
export function coverHTML(c, { tag = 'div', href = '' } = {}) {
  const open = tag === 'a' ? `<a class="tk-cover" href="${esc(href || c.href)}"` : '<div class="tk-cover"';
  return `${open} style="--c:${colorOf(c)}">
    <p class="tk-k">${esc(c.kicker)}</p>
    <h3 class="tk-h">${c.head}</h3>
    <p class="tk-sub">${esc(c.sub)}</p>
    <div class="tk-art">${c.art}</div>
    <div class="tk-strip"><span>${esc(c.strip[0])}</span><b>${esc(c.strip[1])}</b></div>
  </${tag === 'a' ? 'a' : 'div'}>`;
}
