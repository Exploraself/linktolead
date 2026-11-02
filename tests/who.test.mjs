// Who is signed in (Alexandru, 2 Nov 2026): exploraself.com's forms ask this
// page, in a hidden frame, for the first name and email of the account signed
// in on this device. It answers only exploraself.com, and never with the token.

import { readFileSync } from 'node:fs';
import { tally } from './_d1.mjs';

const { ok, done } = tally('who');
const page = readFileSync('public/who.html', 'utf8');
const js = page.slice(page.indexOf('<script>') + 8, page.indexOf('</script>'));

const run = (store, origin, data = { type: 'es-who' }) => {
  const sent = [];
  let handler = null;
  const window = { addEventListener: (t, f) => { if (t === 'message') handler = f; } };
  const localStorage = { getItem: (k) => (k in store ? store[k] : null) };
  new Function('window', 'localStorage', js)(window, localStorage);
  handler({ origin, data, source: { postMessage: (m, o) => sent.push([m, o]) } });
  return sent;
};
const signedIn = { 'ftb-token': 'tok-123', 'ftb-me': JSON.stringify({ name: 'Alexandru Cojocari', email: 'alex@example.com' }) };

let s = run(signedIn, 'https://exploraself.com');
ok(s.length === 1 && s[0][1] === 'https://exploraself.com' && s[0][0].me.name === 'Alexandru' && s[0][0].me.email === 'alex@example.com', 'exploraself.com asks: the first name and email, to that origin only');
ok(!JSON.stringify(s).includes('tok-123'), 'never the token');
ok(run(signedIn, 'https://evil.example').length === 0, 'any other site: no answer');
ok(run(signedIn, 'https://www.exploraself.com').length === 1, 'www.exploraself.com too');
ok(run({}, 'https://exploraself.com')[0][0].me === null, 'nobody signed in here: says so');
ok(run({ 'ftb-token': 't', 'ftb-v1': JSON.stringify({ me: { name: 'Sam Example', email: 'sam@example.com' } }) }, 'https://exploraself.com')[0][0].me.email === 'sam@example.com', 'reads the saved state when the profile cache is not there yet');
ok(run(signedIn, 'https://exploraself.com', { type: 'other' }).length === 0, 'answers only its own question');
ok(/noindex/.test(page), 'not for search engines');
done();
