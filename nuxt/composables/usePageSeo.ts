import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { siteConfig } from '../../src/config/site';

interface PageSeoInput {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  /** Route path used for the canonical URL, e.g. `/tags`. */
  path: MaybeRefOrGetter<string>;
  type?: 'website' | 'article';
  image?: MaybeRefOrGetter<string | undefined>;
}

/**
 * One call for a public page's canonical + social metadata.
 * Without og:title/og:description every share lands as a bare link, so every
 * indexable page must register them instead of setting the plain title only.
 */
export const usePageSeo = (input: PageSeoInput) => {
  const runtimeConfig = useRuntimeConfig();
  const requestUrl = useRequestURL();
  const configured = String(runtimeConfig.public.siteUrl || '').replace(/\/$/, '');
  const origin = configured || requestUrl.origin;
  const canonical = computed(() => {
    try {
      return new URL(toValue(input.path), origin).toString();
    } catch {
      return toValue(input.path);
    }
  });

  const title = computed(() => toValue(input.title));
  const description = computed(() => toValue(input.description));
  const image = computed(() => {
    const value = toValue(input.image);
    if (!value) return undefined;
    try {
      return new URL(value, origin).toString();
    } catch {
      return value;
    }
  });

  useSeoMeta({
    title: () => title.value,
    description: () => description.value,
    ogTitle: () => title.value,
    ogDescription: () => description.value,
    ogSiteName: siteConfig.name,
    ogType: input.type || 'website',
    ogUrl: () => canonical.value,
    ogImage: () => image.value,
    ogLocale: siteConfig.locale.replace('-', '_'),
    twitterCard: 'summary_large_image',
    twitterTitle: () => title.value,
    twitterDescription: () => description.value,
  });

  useHead(() => ({ link: [{ rel: 'canonical', href: canonical.value }] }));

  return { canonical, title, description };
};
