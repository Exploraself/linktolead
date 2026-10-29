// What a founder tells us about their business when they sign up, or when
// they first open the Launchpad: company, interest and industry.
//
// Two forms make the same student record:
//   FULL   (after /compass/welcome): first name, surname, email, company (or
//          "No company yet"), interest, industry, consent.
//   SIMPLE (after "/" and in the Compass's "Who is this compass for?" box):
//          first name, surname, email, consent.
// signup_type says which. A simple founder gives the rest at the password
// gate (POST /api/complete) and becomes full. No password is asked at sign-up.
//
// Stored on student_profile: company '' means "No company yet"; NULL means it
// was never asked.

import { clean } from './_shared.js';

/** One of these, as the Compass names its goals (engine.js GOALS). */
export const INTERESTS = ['More free time', 'Higher income', 'Steady clients', 'A team I trust', 'Clarity on direction', 'A new market'];
/** The same list as the Compass box (compass/app.js INDUSTRIES). */
export const INDUSTRIES = ['Coaching & consulting', 'Creative & design', 'E-commerce & retail', 'Food & hospitality', 'Health & wellness',
  'Beauty & personal care', 'Education & training', 'Professional services', 'Trades & construction', 'Technology & software',
  'Real estate', 'Manufacturing', 'Nonprofit & social impact', 'Other'];
export const SIGNUP_TYPES = ['full', 'simple'];

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

/** What a profile still lacks to count as full. */
export function missing(p) {
  if (!p) return ['company', 'interest', 'industry'];
  return [p.company === null || p.company === undefined ? 'company' : null, INTERESTS.includes(p.interest) ? null : 'interest',
    INDUSTRIES.includes(p.industry) ? null : 'industry'].filter(Boolean);
}
