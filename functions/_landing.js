// The three sales pages live at /road1/, /road2/ and /road3/. Their old
// addresses (and the short ones on ads and banners) are 302s that keep the
// query string (the utm_* tags), so the sign-up on the road they land on still
// knows where the founder came from.

/** Old address (no trailing slash; '' is /) → its road. */
export const REDIRECTS = {
  '': '/road1/',
  '/b': '/road1/',
  '/compass/welcome': '/road2/',
  '/compass/welcome-a': '/road2/',
  '/c': '/road2/',
  '/a': '/road3/',
  // Your Ground Plan moved to its own name (30 Oct); old links and emails still land.
  '/start': '/ground-plan/',
  // Short addresses (30 Oct): easy to say, type and put on ads.
  '/summit': '/compass/summit/',
  '/north-star': '/north1/',
  '/northstar': '/north1/',
  '/blueprint': '/road1/',
};

/** The redirect for this request, or null when its address is not an old one. */
export function redirect(request) {
  const url = new URL(request.url);
  const to = REDIRECTS[url.pathname.replace(/\/+$/, '')];
  return to ? new Response(null, { status: 302, headers: { location: `${to}${url.search}`, 'cache-control': 'no-store' } }) : null;
}
