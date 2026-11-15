import { computed, toValue, type MaybeRefOrGetter } from 'vue';

export const usePublicCanonical = (path: MaybeRefOrGetter<string>) => {
  const requestUrl = useRequestURL();
  const canonical = computed(() => new URL(toValue(path), requestUrl.origin).toString());
  useHead(() => ({ link: [{ rel: 'canonical', href: canonical.value }] }));
  return canonical;
};
