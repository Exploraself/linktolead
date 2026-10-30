// The two short addresses that redirect. Both keep the query string (the utm_*
// tags), so the sign-up on the page they land on still knows where the founder
// came from.

const to = (request, path) => new Response(null, { status: 302, headers: { location: `${path}${new URL(request.url).search}`, 'cache-control': 'no-store' } });

/** /b: sales page B is the home page, so /b is a 302 to /. */
export const toB = (request) => to(request, '/');

/** /c: sales page C is the Compass sales page; /c is its short address for
 *  ads and banners, a 302 to /compass/welcome/. */
export const toC = (request) => to(request, '/compass/welcome/');
