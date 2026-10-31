// What a founder tells us when they sign up: company, interest and industry
// (the full form), and where they came from.
//
// Two forms make the same student record:
//   FULL   (/road1/, landing "road1"; /north3/, the North Star sales page,
//          landing "road2"): first name, surname, email, company (or "No
//          company yet"), interest, industry, a password (required), consent.
//   SIMPLE (/road3/, the 12 Scrolls page, landing "road3", and the North Star's
//          "Who is this compass for?" box, landing "compass"): first name,
//          surname, email, consent. No password, ever: these founders sign
//          in by email link.
// signup_type says which; landing says which sales page ('road1', 'road2',
// 'road3' or 'compass'), and utm_* the tags the founder arrived with.
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
export const LANDINGS = ['road1', 'road2', 'road21', 'road3', 'road4', 'scan', 'compass', 'summit'];
/** The landing keys before the roads, each to the road its page became. A
 *  page loaded before the rename still sends one; stored ones are moved
 *  over once (functions/_shared.js). */
export const OLD_LANDINGS = { b: 'road1', c: 'road2', a: 'road3' };
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
