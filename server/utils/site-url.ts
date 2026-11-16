import type { H3Event } from 'h3';

/**
 * Resolve the canonical public origin used by robots.txt, sitemap.xml, RSS and
 * llms.txt.
 *
 * A deployment must configure NUXT_PUBLIC_SITE_URL (or VITE_SITE_URL). During
 * prerendering an unconfigured build would otherwise bake `http://localhost`
 * into crawler-facing files, so we refuse to emit those artifacts and let the
 * runtime server generate them with the real request origin instead.
 */
export function resolvePublicSiteUrl(event: H3Event): string {
  const config = useRuntimeConfig(event);
  const configured = String(config.public.siteUrl || '').replace(/\/$/, '');
  if (configured) return configured;

  const origin = getRequestURL(event).origin.replace(/\/$/, '');
  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(origin);

  if (import.meta.prerender && isLocal) {
    throw createError({
      statusCode: 503,
      statusMessage: 'NUXT_PUBLIC_SITE_URL must be set before prerendering crawler files',
    });
  }

  return origin;
}
