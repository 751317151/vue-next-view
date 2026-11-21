const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const REDUCED_MOTION_CLASS = 'bs-reduced-motion';

const sitePrefersReducedMotion = () => document.documentElement.classList.contains(REDUCED_MOTION_CLASS);

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && (
    sitePrefersReducedMotion() || window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

/** Observe the same root class used by the pre-paint theme script and settings. */
export function onReducedMotionChange(callback: (reduced: boolean) => void) {
  if (typeof window === 'undefined') return () => {};

  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  const readPreference = () => sitePrefersReducedMotion() || media.matches;
  let lastPreference = readPreference();
  const onChange = () => {
    const reduced = readPreference();
    if (reduced === lastPreference) return;
    lastPreference = reduced;
    callback(reduced);
  };
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  media.addEventListener('change', onChange);

  return () => {
    observer.disconnect();
    media.removeEventListener('change', onChange);
  };
}
