// Sales page C is the Compass sales page. /c is its short address for ads and
// banners: a 302 to /compass/welcome that keeps the query string (the utm_*
// tags), so the sign-up there still knows where the founder came from.
export function toC(request) {
  const url = new URL(request.url);
  return new Response(null, { status: 302, headers: { location: `/compass/welcome${url.search}`, 'cache-control': 'no-store' } });
}
