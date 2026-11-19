import { buildArticleSeo, type SeoArticleInput } from '../../src/seo/metadata';
import { siteConfig } from '../../src/config/site';

/** 没有文章封面时用的兜底分享图，与 usePageSeo 保持一致。 */
const DEFAULT_SOCIAL_IMAGE = '/bg1.jpg';

export const useArticleSeo = (article: SeoArticleInput) => {
  const requestUrl = useRequestURL();
  const runtimeConfig = useRuntimeConfig();
  const origin = String(runtimeConfig.public.siteUrl || '').replace(/\/$/, '') || requestUrl.origin;

  const seo = buildArticleSeo({
    ...article,
    url: article.url || new URL(requestUrl.pathname, requestUrl.origin).toString(),
  }, siteConfig.name);

  const image = (() => {
    try {
      return new URL(article.image || DEFAULT_SOCIAL_IMAGE, origin).toString();
    } catch {
      return article.image || DEFAULT_SOCIAL_IMAGE;
    }
  })();

  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.title,
    ogDescription: seo.description,
    ogUrl: seo.canonical,
    ogType: 'article',
    ogImage: image,
    twitterCard: 'summary_large_image',
    twitterTitle: seo.title,
    twitterDescription: seo.description,
    twitterImage: image,
  });

  useHead({
    link: [{ rel: 'canonical', href: seo.canonical }],
    script: [{ type: 'application/ld+json' as 'application/json', innerHTML: JSON.stringify(seo.jsonLd) }],
  });

  return seo;
};
