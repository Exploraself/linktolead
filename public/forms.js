// The lists the sign-up forms and the password gate offer. The same as
// functions/_profile.js (a test holds them equal); the industries are the
// Compass box's own list.
export const INTERESTS = ['More free time', 'Higher income', 'Steady clients', 'A team I trust', 'Clarity on direction', 'A new market'];
export const INDUSTRIES = ['Coaching & consulting', 'Creative & design', 'E-commerce & retail', 'Food & hospitality', 'Health & wellness',
  'Beauty & personal care', 'Education & training', 'Professional services', 'Trades & construction', 'Technology & software',
  'Real estate', 'Manufacturing', 'Nonprofit & social impact', 'Other'];
export const CONSENT = 'I agree that ExploraSelf may email me my results and occasional guidance. I can unsubscribe any time.';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The business questions, as form fields. `p` is the prefix for ids; `need`
 *  limits them to the ones still missing (the password gate). */
export function detailFields(p, lab = '', need = ['company', 'interest', 'industry']) {
  const opt = (list, ph) => `<option value="">${ph}</option>${list.map((x) => `<option>${esc(x)}</option>`).join('')}`;
  return [
    need.includes('company') ? `<label style="${lab}">Company<input class="inp" id="${p}-company" type="text" autocomplete="organization" maxlength="120"></label>
      <label style="display: flex; gap: 10px; align-items: center; font-size: 13px; min-height: 32px"><input type="checkbox" id="${p}-nocompany" style="width: 18px; height: 18px; accent-color: #C9A24A; flex: none">No company yet</label>` : '',
    need.includes('interest') ? `<label style="${lab}">What do you want most from the business?<select class="inp" id="${p}-interest">${opt(INTERESTS, 'Choose one…')}</select></label>` : '',
    need.includes('industry') ? `<label style="${lab}">Industry<select class="inp" id="${p}-industry">${opt(INDUSTRIES, 'Choose your industry…')}</select></label>` : '',
  ].filter(Boolean).join('\n      ');
}

/** Read them back. `need` limits which are checked (the gate asks only what
 *  is missing). Returns { company, noCompany, interest, industry, problem }. */
export function readDetails(p, need = ['company', 'interest', 'industry'], doc = document) {
  const v = (k) => { const el = doc.getElementById(`${p}-${k}`); return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; };
  const out = { company: v('company'), noCompany: !!v('nocompany'), interest: v('interest'), industry: v('industry') };
  out.problem = need.includes('company') && !out.company && !out.noCompany ? 'Your company’s name, or tick “No company yet”.'
    : need.includes('interest') && !INTERESTS.includes(out.interest) ? 'Choose what you want most from the business.'
    : need.includes('industry') && !INDUSTRIES.includes(out.industry) ? 'Choose your industry.' : '';
  return out;
}
