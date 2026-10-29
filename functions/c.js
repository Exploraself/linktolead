// /c on Cloudflare Pages (the Worker does the same in worker.js).
import { toC } from './_landing.js';
export const onRequest = ({ request }) => toC(request);
