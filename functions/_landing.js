// The sales pages live at /road1/ … /road4/, /north2/ and /north3/; The Leader’s
// North Star at /northstar/ (it was /compass until 30 Oct). Their old
// addresses (and the short ones on ads and banners) are 302s that keep the
// query string (the utm_* tags), so the sign-up on the road they land on still
// knows where the founder came from.

/** Old address (no trailing slash; '' is /) → its road. */
export const REDIRECTS = {
  '': '/road1/',
  '/b': '/road1/',
  '/compass/welcome': '/north3/',
  '/compass/welcome-a': '/north3/',
  '/c': '/north3/',
  '/a': '/road3/',
  // Your Base Camp moved to its own name (30 Oct); old links and emails still land.
  '/start': '/ground-plan/',
  // Short addresses (30 Oct): easy to say, type and put on ads.
  '/summit': '/northstar/summit/',
  '/north-star': '/northstar/',
  '/blueprint': '/road1/',
  // /road2 is no longer here: it moved to /north3/ on 31 Oct, and the same day
  // /road2/ became the Blueprint page again (the new one).
  // Road 2.1 became /north2/ (31 Oct): it sells the North Star.
  '/road2.1': '/north2/',
};

/** The redirect for this request, or null when its address is not an old one. */
export function redirect(request) {
  const url = new URL(request.url);
  let to = REDIRECTS[url.pathname.replace(/\/+$/, '')];
  // The Leader’s North Star moved from /compass to /northstar (30 Oct): every
  // old address under /compass lands on the same place under /northstar.
  if (!to && /^\/compass(\/|$)/.test(url.pathname)) to = url.pathname.replace(/^\/compass(\/|$)/, '/northstar/').replace(/\/\/+/g, '/');
  return to ? new Response(null, { status: 302, headers: { location: `${to}${url.search}`, 'cache-control': 'no-store' } }) : null;
}
