<template>
  <aside class="star-jar" aria-label="星愿瓶">
    <!-- 飞行中的小星星传送到 body 上，否则会被 .star-jar 的层叠上下文困住，
         越过页面顶部的导航栏时会钻到它下面。 -->
    <Teleport to="body">
      <div ref="flightLayer" class="star-jar__flight" aria-hidden="true"></div>
    </Teleport>

    <button
      ref="jarButton"
      class="star-jar__jar"
      type="button"
      :class="{ 'is-full': stars.length > 0, 'is-bump': bumping }"
      :aria-expanded="open"
      aria-controls="star-jar-panel"
      :aria-label="stars.length ? `星愿瓶里有 ${stars.length} 颗星星，点击查看` : '星愿瓶还是空的'"
      @click="open = !open"
    >
      <span class="star-jar__glass" aria-hidden="true">
        <span class="star-jar__shine"></span>
        <span class="star-jar__stars">
          <i v-for="n in Math.min(stars.length, 6)" :key="n" :style="{ '--i': n }">✦</i>
        </span>
      </span>
      <b v-if="stars.length" class="star-jar__count">{{ stars.length }}</b>
    </button>

    <Transition name="jar-panel">
      <section v-if="open" id="star-jar-panel" class="star-jar__panel">
        <header class="star-jar__head">
          <div>
            <strong>星愿瓶</strong>
            <small>{{ stars.length ? `收好了 ${stars.length} 颗星星` : '把喜欢的故事收进来' }}</small>
          </div>
          <button class="star-jar__close" type="button" aria-label="收起星愿瓶" @click="open = false">×</button>
        </header>

        <p v-if="!stars.length" class="star-jar__empty">
          读到喜欢的文章时，点一下标题旁的星星，它就会落进这里，等你想再看的时候再打开。✦
        </p>

        <ul v-else class="star-jar__list">
          <li v-for="star in stars" :key="star.slug" class="star-jar__item">
            <NuxtLink :to="`/article/${star.slug}`" class="star-jar__link" @click="open = false">
              <span class="star-jar__emoji" aria-hidden="true">{{ star.emoji }}</span>
              <span class="star-jar__meta">
                <strong>{{ star.title }}</strong>
                <small v-if="star.category">{{ star.category }}</small>
              </span>
            </NuxtLink>
            <button class="star-jar__remove" type="button" :aria-label="`从星愿瓶移除《${star.title}》`" @click="remove(star.slug)">×</button>
          </li>
        </ul>

        <button v-if="stars.length" class="star-jar__clear" type="button" @click="clear">
          倒空瓶子
        </button>
      </section>
    </Transition>
  </aside>
</template>

<script setup lang="ts">
import { useStarJar } from '../composables/useStarJar';

const { stars, hydrate, remove, clear } = useStarJar();
const open = ref(false);
const bumping = ref(false);
const jarButton = ref<HTMLElement | null>(null);
const flightLayer = ref<HTMLElement | null>(null);
let bumpTimer = 0;

/** 从点击坐标生成一颗小星星，用 Web Animations API 把它送进瓶子。 */
const launchFlyingStar = (x: number, y: number, emoji: string) => {
  const layer = flightLayer.value;
  const jar = jarButton.value;
  if (!layer || !jar) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const target = jar.getBoundingClientRect();
  const star = document.createElement('span');
  star.className = 'star-jar__flyer';
  star.textContent = emoji || '✦';
  star.style.left = `${x}px`;
  star.style.top = `${y}px`;
  layer.appendChild(star);

  const dx = target.left + target.width / 2 - x;
  const dy = target.top + target.height / 2 - y;
  const anim = star.animate(
    [
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 40}px)) scale(1.3)`, opacity: 1, offset: 0.55 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.2)`, opacity: 0 },
    ],
    { duration: 720, easing: 'cubic-bezier(.2,.9,.3,1.2)' },
  );
  anim.onfinish = () => star.remove();
};

const onFly = (event: Event) => {
  const detail = (event as CustomEvent<{ x: number; y: number; emoji: string }>).detail;
  if (!detail) return;
  launchFlyingStar(detail.x, detail.y, detail.emoji);
  // 瓶子被"投喂"时轻轻一跳。
  bumping.value = true;
  window.clearTimeout(bumpTimer);
  bumpTimer = window.setTimeout(() => { bumping.value = false; }, 420);
};

onMounted(() => {
  hydrate();
  window.addEventListener('star-jar:fly', onFly);
});

onBeforeUnmount(() => {
  window.removeEventListener('star-jar:fly', onFly);
  window.clearTimeout(bumpTimer);
});
</script>

<style scoped>
.star-jar { position: fixed; left: var(--bs-dock-edge); bottom: var(--bs-dock-edge); z-index: var(--bs-dock-z); }

.star-jar__flight { position: fixed; inset: 0; z-index: 120; pointer-events: none; }
.star-jar__flight :deep(.star-jar__flyer) { position: fixed; font-size: 1.3rem; line-height: 1; filter: drop-shadow(0 4px 10px rgba(255, 143, 179, 0.6)); }

.star-jar__jar { position: relative; display: grid; place-items: center; width: 3.4rem; height: 3.9rem; padding: 0; border: 0; background: transparent; cursor: pointer; transition: transform var(--bs-dur-base) var(--bs-ease-pop); }
.star-jar__jar:hover { transform: translateY(-3px) rotate(-3deg); }
.star-jar__jar:focus-visible { outline: 3px solid rgba(185, 167, 255, 0.72); outline-offset: 4px; border-radius: 1rem; }
.star-jar__jar.is-bump { animation: jar-bump var(--bs-dur-mid) var(--bs-ease-pop); }

/* 玻璃瓶：底部圆、瓶颈细，用 clip-path 切出瓶子轮廓。 */
.star-jar__glass { position: relative; display: block; width: 2.5rem; height: 3.1rem; border: 2px solid var(--bs-ink-line, #392d4f); border-radius: 34% 34% 42% 42% / 28% 28% 54% 54%; background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(185, 167, 255, 0.28)); box-shadow: var(--bs-sticker-shadow, 3px 3px 0 var(--bs-ink-line, #392d4f)); overflow: hidden; }
.star-jar__glass::before { position: absolute; top: -1px; left: 50%; width: 1.05rem; height: 0.5rem; border: 2px solid var(--bs-ink-line, #392d4f); border-radius: 999px; background: var(--bs-paper, #fffaf5); content: ''; transform: translateX(-50%); }
.star-jar__shine { position: absolute; top: 0.55rem; left: 0.4rem; width: 0.45rem; height: 1.5rem; border-radius: 999px; background: rgba(255, 255, 255, 0.72); transform: rotate(12deg); }
.star-jar__stars { position: absolute; inset: auto 0 0.25rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.05rem; padding: 0 0.2rem; }

/* 瓶里的小星星按奇偶错开高度，避免整齐排列显得呆板。
   注意：CSS 的 calc() 没有取模运算，`calc(var(--i) % 2)` 会让整条声明失效，
   所以这里用 nth-child 给每颗星一个 --dy 偏移量。 */
.star-jar__stars i { --dy: 0px; color: var(--bs-yellow); font-size: 0.5rem; font-style: normal; line-height: 1; transform: translateY(var(--dy)); animation: jar-twinkle 2.4s ease-in-out infinite; animation-delay: calc(var(--i) * -0.3s); }
.star-jar__stars i:nth-child(odd) { --dy: -3px; }
.star-jar__stars i:nth-child(3n) { --dy: -1.5px; }

.star-jar__count { position: absolute; top: -0.1rem; right: -0.15rem; min-width: 1.1rem; height: 1.1rem; padding: 0 0.25rem; border-radius: 999px; background: linear-gradient(135deg, var(--bs-pink), var(--bs-peach)); color: #392d4f; font-size: 0.68rem; font-weight: 700; line-height: 1.1rem; text-align: center; box-shadow: 0 3px 8px rgba(255, 143, 179, 0.5); }

.star-jar__panel { position: absolute; left: 0; bottom: calc(100% + 0.7rem); width: min(20rem, calc(100vw - 2rem)); max-height: 24rem; overflow: auto; padding: 1rem 1.05rem 1.1rem; border: 1px solid var(--bs-border); border-radius: 1.3rem; background: var(--bs-paper-strong); box-shadow: var(--bs-shadow); backdrop-filter: blur(20px) saturate(1.1); }

.star-jar__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.8rem; }
.star-jar__head strong { display: block; color: var(--bs-ink); font-size: 1rem; }
.star-jar__head small { color: var(--bs-ink-muted); font-size: 0.76rem; }
.star-jar__close { flex: 0 0 auto; width: 1.8rem; height: 1.8rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--bs-ink-soft); font-size: 1.1rem; line-height: 1; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.star-jar__close:hover { background: var(--bs-tint-pink); color: var(--bs-ink); transform: rotate(90deg); }

.star-jar__empty { margin: 0; padding: 0.6rem 0.2rem 0.3rem; color: var(--bs-ink-soft); font-size: 0.84rem; line-height: 1.8; }

.star-jar__list { display: grid; gap: 0.4rem; margin: 0; padding: 0; list-style: none; }
.star-jar__item { display: flex; align-items: center; gap: 0.35rem; border-radius: 0.9rem; background: var(--bs-surface); transition: background var(--bs-dur-quick) ease; }
.star-jar__item:hover { background: var(--bs-tint-yellow); }
.star-jar__link { display: flex; flex: 1; align-items: center; gap: 0.6rem; min-width: 0; padding: 0.5rem 0.4rem 0.5rem 0.6rem; color: inherit; text-decoration: none; }
.star-jar__emoji { flex: 0 0 auto; font-size: 1.15rem; }
.star-jar__meta { display: grid; min-width: 0; }
.star-jar__meta strong { overflow: hidden; color: var(--bs-ink); font-size: 0.84rem; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.star-jar__meta small { color: var(--bs-ink-muted); font-size: 0.72rem; }
.star-jar__remove { flex: 0 0 auto; width: 1.6rem; height: 1.6rem; margin-right: 0.35rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--bs-ink-faint); font-size: 0.95rem; line-height: 1; cursor: pointer; opacity: 0; transition: var(--bs-dur-quick) ease; }
.star-jar__item:hover .star-jar__remove, .star-jar__remove:focus-visible { opacity: 1; }
.star-jar__remove:hover { background: var(--bs-tint-pink); color: var(--bs-accent-strong); transform: rotate(90deg); }

.star-jar__clear { width: 100%; margin-top: 0.8rem; padding: 0.5rem; border: 1px dashed var(--bs-border); border-radius: 0.9rem; background: transparent; color: var(--bs-ink-muted); font-family: inherit; font-size: 0.78rem; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.star-jar__clear:hover { border-color: var(--bs-accent-strong); color: var(--bs-accent-strong); }

.jar-panel-enter-active { transition: opacity var(--bs-dur-base) ease, transform var(--bs-dur-base) var(--bs-ease-pop); }
.jar-panel-leave-active { transition: opacity var(--bs-dur-quick) ease, transform var(--bs-dur-quick) ease; }
.jar-panel-enter-from, .jar-panel-leave-to { opacity: 0; transform: translateY(0.6rem) scale(0.96); }

@keyframes jar-bump { 0%, 100% { transform: translateY(0) rotate(0); } 40% { transform: translateY(-0.5rem) rotate(-6deg) scale(1.08); } }
@keyframes jar-twinkle { 0%, 100% { opacity: 0.55; transform: translateY(var(--dy)) scale(0.9); } 50% { opacity: 1; transform: translateY(var(--dy)) scale(1.15); } }

@media (prefers-reduced-motion: reduce) {
  .star-jar__jar.is-bump { animation: none; }
  .star-jar__stars i { animation: none; opacity: 0.9; }
  .jar-panel-enter-active, .jar-panel-leave-active { transition: none; }
}
</style>
