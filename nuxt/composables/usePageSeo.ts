import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { siteConfig } from '../../src/config/site';

interface PageSeoInput {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  /** Route path used for the canonical URL, e.g. `/tags`. */
  path: MaybeRefOrGetter<string>;
  type?: 'website' | 'article';
  image?: MaybeRefOrGetter<string | undefined>;
  /** 额外的结构化数据节点（如列表页的 CollectionPage）。不传则不输出。 */
  jsonLd?: MaybeRefOrGetter<Record<string, unknown> | Record<string, unknown>[] | undefined>;
}

/**
 * 没单独配封面时的兜底分享图。
 * 社交平台和生成式引擎都倾向抓一张配图，缺图时分享卡片会退化成纯文字链接，
 * 所以这里用站点主视觉兜底，而不是留空。
 */
const DEFAULT_SOCIAL_IMAGE = '/bg1.jpg';

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
    const value = toValue(input.image) || DEFAULT_SOCIAL_IMAGE;
    try {
      return new URL(value, origin).toString();
    } catch {
      return value;
    }
  });
  const jsonLd = computed(() => toValue(input.jsonLd));

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
    // og:image 不是所有抓取方都会回退，显式声明 twitter:image 更稳。
    twitterImage: () => image.value,
  });

  useHead(() => ({
    link: [{ rel: 'canonical', href: canonical.value }],
    script: jsonLd.value
      ? [{ type: 'application/ld+json' as const, key: 'page-ld', innerHTML: JSON.stringify(jsonLd.value) }]
      : [],
  }));

  return { canonical, title, description, image };
};
