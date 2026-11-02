// Every Mailchimp tag ExploraSelf adds, in one list (Alexandru, 2 Nov 2026):
// what it means, where it comes from and at which moment it is added.
//
// Two things read this list:
//   - scripts/tag-map.mjs draws the tag page for the people who work at
//     ExploraSelf (exploraself.com/internal, Internal → Mailchimp tags);
//   - /mentor → Settings → Mailchimp tags reads every tag of the audience from
//     Mailchimp and marks each one Keep, Old (safe to delete) or Ask.
//
// AGENTS.md rule 17: a tag added or changed anywhere (here, in
// functions/_mailchimp.js, or in an exploraself.com form) is added to this
// list in the same work, and the page is drawn again. Mailchimp cannot rename
// a tag, only delete it: a new name is a new tag, so a name is chosen once,
// with Alexandru, following the system ("linktolead-<group>-<value>").
//
// The linktolead names are read from the constants that send them, so this
// list cannot drift from the code. exploraself.com's forms add their tag by
// number (the form's `tags` value): Mailchimp shows the name, and the live list
// in /mentor shows it beside each number's meaning.

import { LANDING_TAGS, STEP_TAGS, STEP_NAMES, STAGE_TAGS, WEAKEST_TAGS, CROSS_TAGS, DEFAULT_FORM } from './_mailchimp.js';
import { SERIES_TAGS } from './_series-letters.js';
import { TOOLS_TAG } from './_tools.js';
import { LIBRARY_ITEMS, libraryTag } from './api/library.js';

const LTL = 'https://linktolead.exploraself.com';
const ES = 'https://exploraself.com';

/** The groups, in the order a founder meets them. `icon` names a drawing in
 *  scripts/tag-map.mjs (rule 13). */
export const TAG_GROUPS = [
  { key: 'everyone', icon: 'people', name: 'Every founder', sub: 'One tag for everyone with a free account on linktolead.exploraself.com' },
  { key: 'door', icon: 'door', name: 'Where they signed up', sub: 'The sales page, or the North Star box, where they made their account' },
  { key: 'step', icon: 'steps', name: 'Their step', sub: 'Where they are on the ladder. These add up: a founder on the LAB also carries the Launchpad and the Boardroom' },
  { key: 'stage', icon: 'chart', name: 'Their stage now', sub: 'Building, growing or scaling. Only one is on at a time' },
  { key: 'weakest', icon: 'star', name: 'The side that needs them first', sub: 'From The Leader’s North Star. Only one is on at a time' },
  { key: 'crossed', icon: 'path', name: 'They crossed to the other door', sub: 'From the North Star to the Blueprint, or the other way' },
  { key: 'library', icon: 'book', name: 'A book from the library', sub: 'One tag per book' },
  { key: 'toolkit', icon: 'toolkit', name: 'The Growth Toolkit', sub: 'The free tools' },
  { key: 'letters', icon: 'mail', name: 'The letters that follow each pain', sub: 'One tag per series' },
  { key: 'site', icon: 'form', name: 'exploraself.com forms', sub: 'Each form adds its own tag. Mailchimp shows its name; the live list in /mentor shows it too' },
];

const CONSENT = 'Only with their yes to letters, and only while Mailchimp runs on the live API.';

const LANDING_PAGES = {
  road1: ['The Founder’s Blueprint sales page, Road 1', '/road1/'], road2: ['The Founder’s Blueprint sales page, Road 2', '/road2/'],
  road3: ['The Founder’s Blueprint sales page, Road 3', '/road3/'], road4: ['The Founder’s Blueprint sales page, Road 4', '/road4/'],
  north1: ['The Leader’s North Star sales page, North 1', '/north1/'], north2: ['The Leader’s North Star sales page, North 2', '/north2/'],
  north3: ['The Leader’s North Star sales page, North 3', '/north3/'], compass: ['The North Star box (The Leader’s North Star, with no sales page before it)', '/northstar/'],
  summit: ['The Summit sales page', '/northstar/summit/'],
};
/** Doors whose account can also be made on the pay page (Alexandru, 2 Nov
 *  2026): not signed in, /pay/ makes the free account in place, with the
 *  landing of the page that sent them there (public/pay/pay.js FROM). */
const VIA_PAY = {
  road1: ' Also on the pay page (/pay/), when someone not signed in taps Unlock.',
  summit: ' Since 2 Nov 2026 “Claim my place” goes to the pay page for The Summit (/pay/?step=premium&from=summit), and the account is made there.',
};
const STAGE_WORDS = { build: 'Building', grow: 'Growing', scale: 'Scaling' };
const SIDE_WORDS = { 'lead-yourself': 'Lead yourself', 'lead-your-people': 'Lead your people', 'lead-your-business': 'Lead your business', 'lead-the-market': 'Lead the market' };

/** Every tag the linktolead code adds, by name. */
export const TAG_LIST = [
  { name: 'linktolead', group: 'everyone', what: 'A founder with a free account on linktolead.exploraself.com.',
    from: `${LTL}/ground-plan/`, fromName: 'Any account box on linktolead', when: `The account is made, or letters are turned back on. ${CONSENT}`, by: 'functions/api/signup.js, functions/api/google.js, functions/_account.js' },
  ...Object.entries(LANDING_TAGS).map(([k, name]) => ({ name, group: 'door', what: `Signed up on ${LANDING_PAGES[k][0]}.`,
    from: `${LTL}${LANDING_PAGES[k][1]}`, fromName: LANDING_PAGES[k][1], when: `The account is made on that page.${VIA_PAY[k] || ''} ${CONSENT}`, by: 'functions/_mailchimp.js tagsFor' })),
  ...Object.entries(STEP_TAGS).map(([k, name], i) => ({ name, group: 'step', what: `On ${STEP_NAMES[k]}${i ? ', or a step after it' : ' (every founder starts here)'}.`,
    from: i ? `${LTL}/pay/?step=${k}` : `${LTL}/ground-plan/`, fromName: i ? `/pay/?step=${k} (Stripe), or /mentor (Step, in a founder’s drawer)` : 'Any account box on linktolead',
    when: i ? `Stripe confirms their payment for ${STEP_NAMES[k]}${i < Object.keys(STEP_TAGS).length - 1 ? ' or a higher step' : ''}, or Alexandru or the team move them there in /mentor. A lower step takes no tag away. ${CONSENT}` : `The account is made. ${CONSENT}`,
    by: 'functions/_stripe.js (applyPaid), functions/api/mentor.js (tier), functions/_mailchimp.js tagsFor' })),
  ...Object.entries(STAGE_TAGS).map(([k, name]) => ({ name, group: 'stage', what: `Their business is ${STAGE_WORDS[k].toLowerCase()}, by their own answer.`,
    from: `${LTL}/northstar/`, fromName: 'The Leader’s North Star, or /start/', when: `They finish The Leader’s North Star, or change their stage. The old stage tag is taken off. ${CONSENT}`, by: 'functions/api/compass.js, functions/api/stage.js, functions/api/complete.js' })),
  ...Object.entries(WEAKEST_TAGS).map(([k, name]) => ({ name, group: 'weakest', what: `${SIDE_WORDS[k]} is the side with their lowest North Star score.`,
    from: `${LTL}/northstar/`, fromName: 'The Leader’s North Star', when: `They finish The Leader’s North Star (all four sides answered; a tie goes to the first side). The old one is taken off. ${CONSENT}`, by: 'functions/api/compass.js, functions/_mailchimp.js weakestTag' })),
  { name: CROSS_TAGS.blueprint, group: 'crossed', what: 'Came in through The Leader’s North Star, then opened The Founder’s Blueprint.',
    from: `${LTL}/ground-plan/`, fromName: '/ground-plan/ (The Founder’s Blueprint)', when: `They confirm their name and email as they open the Blueprint. ${CONSENT}`, by: 'functions/api/cross.js' },
  { name: CROSS_TAGS.northstar, group: 'crossed', what: 'Came in through The Founder’s Blueprint, then opened The Leader’s North Star.',
    from: `${LTL}/northstar/`, fromName: '/northstar/ (The Leader’s North Star)', when: `They confirm their name and email as they open the North Star. ${CONSENT}`, by: 'functions/api/cross.js' },
  ...Object.keys(LIBRARY_ITEMS).map((k) => ({ name: libraryTag(k), group: 'library', what: `Took “${LIBRARY_ITEMS[k].name}” from the library.`,
    from: `${LTL}/ground-plan/`, fromName: 'The library in Base Camp or The Leader’s North Star', when: `The first time they download that book. ${CONSENT}`, by: 'functions/api/library.js' })),
  { name: TOOLS_TAG, group: 'toolkit', what: 'Opened the Growth Toolkit with their account.',
    from: `${LTL}/tools/`, fromName: '/tools/ and every tool page', when: `The first time they open a tool, or tap “Yes, that’s me” on the toolkit. Mailchimp makes the tag the first time it is added: nobody needs to create it. ${CONSENT}`, by: 'functions/_tools.js' },
  { name: SERIES_TAGS.northstar, group: 'letters', what: 'Gets the letters that follow the first pain they picked in The Leader’s North Star.',
    from: `${LTL}/northstar/`, fromName: 'The Leader’s North Star', when: `Their series starts: they finish the North Star and pick a first pain. Only when the letters are switched on (SERIES_MODE “on”), never in test. ${CONSENT}`, by: 'functions/_series.js' },
  { name: SERIES_TAGS.never, group: 'letters', what: 'Made an account but wrote nothing in Level 01, and gets the three letters for that.',
    from: `${LTL}/ground-plan/`, fromName: 'Base Camp (The Founder’s Blueprint)', when: `Their series starts: account made, Level 01 empty. Only when the letters are switched on, never in test. ${CONSENT}`, by: 'functions/_series.js' },
  { name: SERIES_TAGS.level3, group: 'letters', what: 'Wrote in Levels 01, 02 and 03, and gets the two letters for that win.',
    from: `${LTL}/ground-plan/`, fromName: 'Base Camp (The Founder’s Blueprint)', when: `Their series starts: Level 03 written. Only when the letters are switched on, never in test. ${CONSENT}`, by: 'functions/_series.js' },
];

/** The tags exploraself.com's forms add, by the number in the form. Never
 *  delete one of these. `label` is the form, in plain words; `name` is the
 *  tag's name in Mailchimp, only where the code itself names it. */
export const SITE_TAGS = [
  { id: '3359640', label: 'The LAB form', what: 'The LAB: signed up before paying for the Personal Leadership LAB.', from: `${ES}/lab`, fromName: '/lab (Join the LAB)', when: 'They send the LAB form, just before the payment page.', by: 'exploraself: src/data/lab.ts' },
  { id: '3359642', label: 'The HUB form', what: 'The HUB: signed up before paying for the Business Growth HUB.', from: `${ES}/hub`, fromName: '/hub and the HUB button on the home page', when: 'They send the HUB form, just before the payment page.', by: 'exploraself: src/data/hub.ts, src/content/explora.html' },
  { id: '3359643', label: 'The 2027 calendar form', what: 'The 2027 calendar: signed up before paying for the digital Manifesto Calendar.', from: `${ES}/resources`, fromName: '/resources (the calendar)', when: 'They send the form on the calendar’s download button, just before the payment page.', by: 'exploraself: src/components/resources/sections.tsx' },
  { id: '3359647', label: 'The First 100 Clients form', what: 'First 100 Clients: the free assessment and its ebook.', from: `${ES}/first-100-clients`, fromName: '/first-100-clients, its ebook page and its article box', when: 'They sign up before the questions, or for the ebook. Asked again every time.', by: 'exploraself: src/data/first-clients.ts' },
  { id: '3359648', label: 'The Unbound form', what: 'Unbound (The Inner Boardroom): the free assessment and its ebook.', from: `${ES}/unbound`, fromName: '/unbound, its ebook page and its article box', when: 'They sign up when they start, or for the ebook. Asked again every time.', by: 'exploraself: src/data/unbound.ts' },
  { id: '3359649', label: 'The Rise form', what: 'Allow Yourself to Rise: the free assessment and its ebook.', from: `${ES}/rise`, fromName: '/rise, its ebook page and its article box', when: 'They sign up for the assessment or the ebook. Asked again every time.', by: 'exploraself: src/data/lead-magnets.ts (rise)' },
  { id: '3359651', label: 'The M.O.S.T. form', what: 'M.O.S.T.: the free ebook.', from: `${ES}/ebooks/most-the-one-mission`, fromName: '/ebooks/most-the-one-mission and its article box', when: 'They sign up for the ebook. Asked again every time.', by: 'exploraself: src/data/lead-magnets.ts (most)' },
  { id: '3359652', label: 'The EQ and workbooks form', what: 'The EQ Dividend and the free workbooks.', from: `${ES}/eq`, fromName: '/eq, the free workbooks and their article boxes', when: 'They sign up for the EQ assessment, its ebook, or a free workbook. Asked again every time.', by: 'exploraself: src/data/lead-magnets.ts (eq), src/data/workbooks.ts' },
  { id: '3359653', label: 'The Leadionaire sign-up form', what: 'Leadionaire: signed up to play the game.', from: `${ES}/play`, fromName: '/play (Leadionaire)', when: 'They sign up in the game.', by: 'exploraself: public/leadionaire-game.html (mailchimpTags)' },
  { id: '3359654', label: 'The Leadionaire free-code form', what: 'Leadionaire: asked for the free Unshakeable code after Level I.', from: `${ES}/play`, fromName: '/play (Leadionaire)', when: 'They send the free-code card after Level I.', by: 'exploraself: public/leadionaire-game.html (mailchimpCodeTags)' },
  { id: '3359658', label: 'The Leadionaire winner form', name: 'Leadionaire winner', what: 'Leadionaire: won the whole game and asked for the mentoring.', from: `${ES}/play`, fromName: '/play (Leadionaire)', when: 'They send the winner form at the end of the game.', by: 'exploraself: public/leadionaire-game.html (mailchimpWinnerTags)' },
  { id: DEFAULT_FORM.tag, label: 'The Link to Lead form', what: 'Link to Lead: joined through the public sign-up form of linktolead.exploraself.com.', from: `${LTL}/ground-plan/`, fromName: 'linktolead, only when Mailchimp runs without the API key (form mode)', when: 'An account is made while Mailchimp is in form mode, and the test join in /mentor.', by: 'functions/_mailchimp.js DEFAULT_FORM' },
  { id: '', name: 'Assessment 2 weektest', label: 'The Two-Week Test form', what: 'The Two-Week Test: the free assessment (can the business run without the founder?).', from: `${ES}/two-week-test`, fromName: '/two-week-test', when: 'They sign up for the Two-Week Test. Waits for its form link: until then the form adds no tag.', by: 'exploraself: src/data/lead-magnets.ts (twoweek)' },
];

/** Names no code adds any more (read from this repo's history, 27 Oct –
 *  2 Nov 2026). Safe to delete: the facts they held are now contact fields or
 *  the new tags. `prefix` matches every tag that starts with it. */
export const OLD_TAGS = [
  { prefix: 'Interest - ', why: 'Their interest is a contact field (Interest) since 30 Oct, not a tag.' },
  { prefix: 'Industry - ', why: 'Their industry is a contact field (Industry) since 30 Oct, not a tag.' },
  { prefix: 'Signup - ', why: 'Which form they used is no longer a tag (since 30 Oct).' },
  { prefix: 'Landing - ', why: 'The old sign-up page tags; now linktolead-road1 … linktolead-summit.' },
  { prefix: 'salespageincubator', why: 'The old sign-up page tags (the “incubator” names); now linktolead-road1 …' },
  { name: 'linktolead-summitpage', why: 'The old name of linktolead-summit.' },
  { prefix: 'Link to Lead - ', why: 'The old step tags; now linktolead-step-launchpad … linktolead-step-summit.' },
  ...['build', 'grow', 'scale'].map((name) => ({ name, why: `The old stage tag; now ${STAGE_TAGS[name]}.` })),
  ...Object.keys(WEAKEST_TAGS).map((name) => ({ name, why: `The old “side that needs them first” tag; now ${WEAKEST_TAGS[name]}.` })),
  ...['compass', 'sales-page', 'mentor-test'].map((name) => ({ name, why: 'The old “where they came from” tag (before 30 Oct); now the sign-up page tag.' })),
  { name: 'TOOLS', why: 'Replaced by “Growth Toolkit” on 2 Nov.' },
];

const low = (s) => String(s || '').trim().toLowerCase();

/** Why a name is old, or null. */
export function oldReason(name) {
  const n = low(name);
  for (const o of OLD_TAGS) {
    if (o.name && low(o.name) === n) return o.why;
    if (o.prefix && n.startsWith(low(o.prefix))) return o.why;
  }
  return null;
}

/**
 * Sorts the audience's tags as Mailchimp has them ([{ id, name, count }]):
 *   keep  a tag the code adds (by name, or an exploraself.com form by number),
 *         or a sign-up page tag a founder still carries (`kept`: the
 *         landing_tag values, kept when a page was renamed);
 *   old   a name no code adds any more: safe to delete;
 *   ask   anything else (made by hand in Mailchimp, or by an import): ask
 *         Alexandru before deleting.
 * `notYet`: names on the list that Mailchimp does not have yet (each is made
 * the first time it is added).
 */
export function sortTags(live, { kept = [] } = {}) {
  const byName = new Map(TAG_LIST.map((t) => [low(t.name), t]));
  const siteById = new Map(SITE_TAGS.filter((t) => t.id).map((t) => [String(t.id), t]));
  const siteByName = new Map(SITE_TAGS.filter((t) => t.name).map((t) => [low(t.name), t]));
  const keptSet = new Set(kept.filter(Boolean).map(low));
  const out = { keep: [], old: [], ask: [], notYet: [] };
  const seen = new Set();
  for (const tag of live || []) {
    const name = String(tag.name || ''), id = String(tag.id ?? ''), count = Number(tag.count) || 0;
    seen.add(low(name));
    const t = byName.get(low(name)) || siteById.get(id) || siteByName.get(low(name));
    if (t) { out.keep.push({ name, count, what: t.what, from: t.from, fromName: t.fromName, when: t.when, group: t.group || 'site' }); continue; }
    if (keptSet.has(low(name))) { out.keep.push({ name, count, what: 'A sign-up page tag kept for founders who joined before the page was renamed (31 Oct).', from: `${LTL}/northstar/`, fromName: 'The North Star sales pages', when: 'Sent again with their other tags, instead of the new page name.', group: 'door' }); continue; }
    const why = oldReason(name);
    if (why) { out.old.push({ name, count, why }); continue; }
    out.ask.push({ name, count });
  }
  out.notYet = TAG_LIST.filter((t) => !seen.has(low(t.name))).map((t) => t.name);
  const byCount = (a, b) => b.count - a.count || a.name.localeCompare(b.name);
  out.old.sort(byCount); out.ask.sort(byCount);
  return out;
}
