// The old sales-page addresses on Cloudflare Pages (the Worker does the same
// in worker.js): each one a 302 to its road, everything else untouched.
import { redirect } from './_landing.js';
export const onRequest = ({ request, next }) => redirect(request) || next();
