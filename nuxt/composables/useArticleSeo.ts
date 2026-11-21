import { buildArticleSeo, type SeoArticleInput } from '../../src/seo/metadata';
import { siteConfig } from '../../src/config/site';

/** 没有文章封面时用的兜底分享图，与 usePageSeo 保持一致。 */
const DEFAULT_SOCIAL_IMAGE = '/bg1.jpg';

export const useArticleSeo = (article: SeoArticleInput) => {
  const requestUrl = useRequestURL();
  const runtimeConfig = useRuntimeConfig();
  const origin = String(runtimeConfig.public.siteUrl || '').replace(/\/$/, '') || requestUrl.origin;

  // Resolve the social image first: JSON-LD `image` and `og:image` must point at
  // the same absolute URL, otherwise rich results and share cards disagree.
  const image = (() => {
    try {
      return new URL(article.image || DEFAULT_SOCIAL_IMAGE, origin).toString();
    } catch {
      return article.image || DEFAULT_SOCIAL_IMAGE;
    }
  })();

  const seo = buildArticleSeo({
    ...article,
    image,
    url: article.url || new URL(requestUrl.pathname, requestUrl.origin).toString(),
  }, siteConfig.name);

  useSeoMeta({
    title: seo.title,
    description: seo.description,
    // 原标题不带站名后缀：社交卡片已经有 og:site_name，标题里再重复一次
    // 会把正文标题挤成两行。页面 <title> 仍由 seo.title 负责。
    ogTitle: article.title,
    ogDescription: seo.description,
    ogUrl: seo.canonical,
    ogType: 'article',
    ogImage: image,
    // 文章级 Open Graph：发布时间 / 修改时间让分享卡片和聚合器知道
    // 这是一篇有日期的长文，而不是普通落地页。
    articlePublishedTime: article.publishedAt,
    articleModifiedTime: article.updatedAt || article.publishedAt,
    articleSection: article.category,
    articleTag: article.tags?.length ? article.tags : undefined,
    articleAuthor: [article.author || siteConfig.author],
    ogImageAlt: article.title,
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
