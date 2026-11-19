/**
 * 换页时临时关闭平滑滚动。
 *
 * Nuxt 的 scrollBehavior 返回的是一个位置对象（{ left: 0, top: 0 }），
 * vue-router 随后调用 window.scrollTo(position)，没有带 behavior，
 * 于是继承了 html 上的 scroll-behavior: smooth——每次换页都能看到
 * 旧页面缓慢滚回顶部，配合 page-mochi 转场会显得很拖沓。
 *
 * 这里在导航开始时给 <html> 挂上 .bs-scroll-instant，等滚动真正落定
 * 之后再摘掉，用户自己触发的锚点跳转和"回到顶部"仍然是平滑的。
 */
export default defineNuxtPlugin((nuxtApp) => {
  const root = document.documentElement;
  /** 每次导航自增，用于丢弃上一次导航遗留的释放回调。 */
  let generation = 0;
  let fallbackTimer = 0;

  const hold = () => {
    generation += 1;
    window.clearTimeout(fallbackTimer);
    root.classList.add('bs-scroll-instant');
  };

  const release = () => {
    const ticket = generation;
    window.clearTimeout(fallbackTimer);
    // 两帧之后再摘：一帧给 vue-router 的 rAF，一帧给实际的重排。
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 期间又开始了新的导航，就把清理交给那一轮。
        if (ticket === generation) root.classList.remove('bs-scroll-instant');
      });
    });
  };

  const holdWithFallback = () => {
    hold();
    // 导航被中断或出错时也要恢复，否则整站会永久失去平滑滚动。
    fallbackTimer = window.setTimeout(release, 1500);
  };

  nuxtApp.hook('page:start', holdWithFallback);
  // 滚动实际发生在 page:loading:end（Nuxt 的 scrollBehavior 在这里解析位置），
  // 所以释放点放在它之后，不能在更早的 page:finish 就恢复。
  nuxtApp.hook('page:loading:end', release);
});
