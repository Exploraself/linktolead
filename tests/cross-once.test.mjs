// The "Open your North Star with your account?" box (Alexandru, 5 Nov 2026:
// "this pops up very often"). Only "Yes" used to save the crossing, so closing
// the box brought it back on every visit. Closing it (×, Esc, a click outside)
// now counts as yes; "Not me" still signs out; other boxes are unchanged.

import fs from 'node:fs';
import { tally } from './_d1.mjs';

const { ok, done } = tally('cross-once');
const src = fs.readFileSync(new URL('../public/reset-box.js', import.meta.url), 'utf8');
const shell = src.slice(src.indexOf('function shell('), src.indexOf('export function close('));
ok(/if \(k === 'close'\) dismiss\(\)/.test(shell), 'the × goes through dismiss()');
ok(/e\.key === 'Escape'[^\n]*dismiss\(\)/.test(shell), 'Esc goes through dismiss()');
ok(/downOut\) dismiss\(\)/.test(shell), 'a click outside goes through dismiss()');
ok(/close\(\); onDismiss = null;/.test(shell), 'every new box starts without a dismiss answer, so other boxes are unchanged');
const confirm = src.slice(src.indexOf('export function openConfirm('), src.indexOf('export function openComplete('));
ok(/onDismiss = \(\) => \{ import\('\/account\.js'\)\.then\(\(A\) => A\.cross\(to\)\)/.test(confirm), 'closing the confirm box saves the crossing');
ok(/const b = e\.target\.closest\('\[data-cross\]'\); if \(!b\) return;\s*onDismiss = null;/.test(confirm), '"Yes" and "Not me" clear it first, so nothing is saved twice and "Not me" saves nothing');
done();
