// /b on Cloudflare Pages (the Worker does the same in worker.js).
import { toB } from './_landing.js';
export const onRequest = ({ request }) => toB(request);
