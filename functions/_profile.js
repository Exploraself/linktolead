// What a founder tells us when they sign up: company, interest and industry
// (the full form), and where they came from.
//
// Two forms make the same student record:
//   FULL   (/road1/, /road2/ and /road4/, landings "road1", "road2" and
//          "road4"; /north2/ and /north3/, the North Star sales pages,
//          landings "north2" and "north3"): first name, surname, email, company (or "No
//          company yet"), interest, industry, a password (required), consent.
//   SIMPLE (/road3/, the 12 Scrolls page, landing "road3", and the North Star's
//          "Who is this compass for?" box, landing "compass"): first name,
//          surname, email, consent. No password, ever: these founders sign
//          in by email link.
// signup_type says which; landing says which sales page ('road1' … 'road4',
// 'north2', 'north3', 'summit' or 'compass'), and utm_* the tags the founder arrived with.
//
// Stored on student_profile: company '' means "No company yet"; NULL means it
// was never asked.

import { clean } from './_shared.js';

/** One of these, as the North Star names its goals (engine.js GOALS). */
export const INTERESTS = ['More free time', 'Higher income', 'Steady clients', 'A team I trust', 'Clarity on direction', 'A new market'];
/** The same list as the North Star box (compass/app.js INDUSTRIES). */
export const INDUSTRIES = ['Coaching & consulting', 'Creative & design', 'E-commerce & retail', 'Food & hospitality', 'Health & wellness',
  'Beauty & personal care', 'Education & training', 'Professional services', 'Trades & construction', 'Technology & software',
  'Real estate', 'Manufacturing', 'Nonprofit & social impact', 'Other'];
export const SIGNUP_TYPES = ['full', 'simple'];
export const LANDINGS = ['road1', 'road2', 'road3', 'road4', 'north2', 'north3', 'compass', 'summit'];
/** Older landing keys, each to the page it is now. A page loaded before a
 *  rename may still send one; stored ones are moved over (functions/_shared.js).
 *  a, b, c: the first three sales pages. road21: /north2/ until 31 Oct 2026.
 *  ('road2' is not here: since 31 Oct it is the Blueprint page at /road2/.) */
export const OLD_LANDINGS = { b: 'road1', c: 'north3', a: 'road3', road21: 'north2' };
/** A landing key as stored: one of LANDINGS, or null. */
export const landingOf = (k) => (LANDINGS.includes(k) ? k : Object.hasOwn(OLD_LANDINGS, k) ? OLD_LANDINGS[k] : null);
export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/** The utm_* tags sent with a sign-up, cleaned; anything else is dropped. */
export function utmFrom(o) {
  const src = o && typeof o === 'object' ? o : {};
  return Object.fromEntries(UTM_KEYS.map((k) => [k, clean(src[k], 100) || null]));
}

/** The details from a form, checked. `problem` is the first thing missing, in
 *  plain words, or ''. */
export function details(body = {}) {
  const noCompany = body.noCompany === true;
  const company = noCompany ? '' : clean(body.company, 120);
  const interest = INTERESTS.includes(body.interest) ? body.interest : '';
  const industry = INDUSTRIES.includes(body.industry) ? body.industry : '';
  const problem = !noCompany && !company ? 'Your company’s name, or tick “No company yet”.'
    : !interest ? 'Choose what you want most from the business.'
    : !industry ? 'Choose your industry.' : '';
  return { company: noCompany || company ? company : null, interest, industry, problem };
}

/** What an account still lacks to be a full account (31 Oct 2026, Alexandru:
 *  one universal rule, whatever sales page a founder came from). Any of
 *  'company' (never asked: NULL; '' means "No company yet" and counts),
 *  'interest', 'industry', 'password'. Empty: the account is complete. */
export function missingOf({ company, interest, industry, hasPassword, google_at: google } = {}) {
  const out = [];
  if (company === null || company === undefined) out.push('company');
  if (!INTERESTS.includes(interest)) out.push('interest');
  if (!INDUSTRIES.includes(industry)) out.push('industry');
  // Google is a way in of its own (31 Oct 2026): no password asked of them.
  if (!hasPassword && !google) out.push('password');
  return out;
}
