import { computed, toValue, type MaybeRefOrGetter } from 'vue';

/**
 * Canonical URLs must use the configured public origin. During prerendering
 * useRequestURL() reports the local build address, which must never leak into
 * crawler-facing HTML.
 */
export const usePublicCanonical = (path: MaybeRefOrGetter<string>) => {
  const runtimeConfig = useRuntimeConfig();
  const requestUrl = useRequestURL();
  const configured = String(runtimeConfig.public.siteUrl || '').replace(/\/$/, '');
  const canonical = computed(() => new URL(toValue(path), configured || requestUrl.origin).toString());
  useHead(() => ({ link: [{ rel: 'canonical', href: canonical.value }] }));
  return canonical;
};
