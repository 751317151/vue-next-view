import { buildArticleSeo, type SeoArticleInput } from '../../src/seo/metadata';
import { siteConfig } from '../../src/config/site';

export const useArticleSeo = (article: SeoArticleInput) => {
  const requestUrl = useRequestURL();
  const seo = buildArticleSeo({
    ...article,
    url: article.url || new URL(requestUrl.pathname, requestUrl.origin).toString(),
  }, siteConfig.name);

  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.title,
    ogDescription: seo.description,
    ogUrl: seo.canonical,
    ogType: 'article',
    twitterCard: 'summary_large_image',
  });

  useHead({
    link: [{ rel: 'canonical', href: seo.canonical }],
    script: [{ type: 'application/ld+json', children: JSON.stringify(seo.jsonLd) }],
  });

  return seo;
};
