import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { getSiteUrl, siteConfig } from '@/config/site';

interface SeoOptions {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function useSeo(options: SeoOptions = {}) {
  const route = useRoute();
  const siteName = siteConfig.name;
  const defaultDesc = siteConfig.description;

  const setCanonical = (url: string) => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  };

  const setJsonLd = (title: string, description: string, url: string) => {
    const id = 'blackstar-site-jsonld';
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      headline: title,
      description,
      url,
      inLanguage: 'zh-CN',
      author: {
        '@type': 'Person',
        name: 'BlackStar',
      },
    });
  };

  const updateMeta = (opts: SeoOptions) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const routeTitle = typeof route.meta.title === 'string' ? route.meta.title : '';
    const title = opts.title || routeTitle ? `${opts.title || routeTitle} | ${siteName}` : siteName;
    const description = opts.description || defaultDesc;
    const url = opts.url || new URL(route.fullPath, getSiteUrl() || window.location.origin).toString();
    const image = opts.image || '';

    // 更新标题
    document.title = title;
    setCanonical(url);
    setJsonLd(title, description, url);

    // 更新或创建 meta 标签
    const setMeta = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const removeMeta = (name: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      document.querySelector(`meta[${attr}="${name}"]`)?.remove();
    };

    // 基础 Meta
    setMeta('description', description);
    if (opts.keywords) setMeta('keywords', opts.keywords);

    // Open Graph
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url, true);
    setMeta('og:type', 'website', true);
    setMeta('og:site_name', siteName, true);
    if (image) setMeta('og:image', image, true);
    else removeMeta('og:image', true);
    removeMeta('article:published_time', true);
    removeMeta('article:modified_time', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);
    else removeMeta('twitter:image');
  };

  // 监听路由变化
  watch(() => route.path, () => {
    updateMeta(options);
  }, { immediate: true });

  return { updateMeta };
}
