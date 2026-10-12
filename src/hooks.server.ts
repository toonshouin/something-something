import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.url.searchParams.get('lang') === 'th' ? 'th' : 'en';
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%resume.lang%', lang)
  });
  response.headers.set('Content-Language', lang);
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Both the address and date snapshot vary by request. Never cache serialized private data.
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
};
