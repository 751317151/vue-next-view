<template>
  <aside v-if="visible" class="mochi-companion" aria-label="小星星陪伴">
    <!-- DOM 里按钮在前，键盘 Tab 先到开关；CSS 用 row-reverse 让气泡视觉上展开在左边。 -->
    <button
      ref="orbEl"
      class="mochi-companion__orb"
      :class="{ 'is-reacting': reacting }"
      type="button"
      :aria-expanded="!collapsed"
      :aria-label="collapsed ? '打开小星星的悄悄话' : '收起小星星的悄悄话'"
      @click="toggle"
    >
      <span class="mochi-companion__face" aria-hidden="true">{{ face.eyes }}</span>
      <span class="mochi-companion__mouth" aria-hidden="true">{{ face.mouth }}</span>
      <b class="mochi-companion__spark" aria-hidden="true">✦</b>
      <i class="mochi-companion__blush mochi-companion__blush--left" aria-hidden="true"></i>
      <i class="mochi-companion__blush mochi-companion__blush--right" aria-hidden="true"></i>
      <span v-if="unread" class="mochi-companion__pip" aria-hidden="true"></span>
    </button>

    <!-- 刻意不用 <Transition>：离场节点会保留到 transitionend，和全局减少动效规则打架，
         容易出现卡片卡在展开状态。普通 v-if 配一个入场动画更可控。 -->
    <div v-if="!collapsed" class="mochi-companion__card">
      <button class="mochi-companion__close" type="button" aria-label="关闭陪伴提示" @click="dismiss">×</button>
      <small>{{ face.label }}</small>
      <p aria-live="polite">{{ message }}</p>
      <div class="mochi-companion__actions">
        <button class="mochi-companion__refresh" type="button" @click="nextMessage">换一句 ✨</button>
        <button class="mochi-companion__quiet" type="button" @click="collapse">安静一会儿</button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
type Mood = 'night' | 'morning' | 'afternoon' | 'lateNight' | 'reading';

interface Face {
  eyes: string;
  mouth: string;
  label: string;
}

const FACES: Record<Mood, Face> = {
  lateNight: { eyes: '– –', mouth: 'ω', label: '夜深了 · 该休息啦' },
  night: { eyes: '˘ ˘', mouth: '‿', label: '晚上好 · 陪你一会儿' },
  morning: { eyes: '> <', mouth: '▽', label: '早安 · 今天也要加油' },
  afternoon: { eyes: '◕ ◕', mouth: '‿', label: '下午好 · 记得休息' },
  reading: { eyes: '◕ ◕', mouth: '·', label: '读到好句子了吗' },
};

const LINES: Record<Mood, string[]> = {
  lateNight: [
    '很晚了，把这篇文章看到这里就够啦。明天再看也不迟。',
    '凌晨的灵感很珍贵，但你的睡眠更珍贵。',
    '夜猫子模式启动——记得把屏幕亮度调低一点。',
  ],
  night: [
    '晚上好呀。泡杯热的东西，慢慢看。',
    '夜晚适合把白天的想法写成文字。',
    '欢迎回来，愿这里给你一点柔软的勇气。',
  ],
  morning: [
    '早安！今天想先从哪一篇开始读呢？',
    '新的一天，慢慢写，写清楚就好。',
    '早上好，先喝口水再开始吧。',
  ],
  afternoon: [
    '下午的光最适合读一点轻松的东西。',
    '把一个小想法写下来，它可能会长成一颗星星。',
    '来看看有没有新的故事吧 ✧',
  ],
  reading: [
    '读到这里，有想记下来的句子吗？',
    '好文章值得慢一点读。',
    '要不要把这一篇分享给某个朋友？',
  ],
};

const visible = ref(false);
const collapsed = ref(false);
const unread = ref(false);
const mood = ref<Mood>('afternoon');
const messageIndex = ref(0);
/** 收藏文章时团子临时插一句，和左下角的星愿瓶联动。 */
const bonusMessage = ref('');
/** 收到星星时团子弹一下，给跨组件的联动一个明确反馈。 */
const reacting = ref(false);

const orbEl = ref<HTMLButtonElement | null>(null);
const face = computed<Face>(() => FACES[mood.value]);
const lines = computed(() => LINES[mood.value]);
const message = computed(() => bonusMessage.value || lines.value[messageIndex.value % lines.value.length]);

const moodFromClock = (): Mood => {
  const hour = new Date().getHours();
  if (hour >= 1 && hour < 6) return 'lateNight';
  if (hour < 12) return 'morning';
  if (hour >= 22) return 'night';
  return 'afternoon';
};

const show = () => {
  visible.value = true;
  unread.value = !collapsed.value;
};

let greetingTimer = 0;
let bonusTimer = 0;
let reactTimer = 0;

const collapse = () => { collapsed.value = true; unread.value = true; };
const toggle = () => {
  collapsed.value = !collapsed.value;
  unread.value = false;
  // 展开阅读就算互动，别再自动折回去。
  if (!collapsed.value) window.clearTimeout(greetingTimer);
};

/** 同一心情下连点"换一句"不重复上一句，台词才像真的在聊天。 */
const advance = () => {
  const total = lines.value.length;
  messageIndex.value = (messageIndex.value + 1 + (Math.random() < 0.15 && total > 1 ? 1 : 0)) % total;
};
const nextMessage = () => {
  bonusMessage.value = '';
  advance();
  mood.value = mood.value === 'reading' ? moodFromClock() : mood.value;
};

const dismiss = () => {
  visible.value = false;
  // 只按会话隐藏：永久标记会让一次误点再也召不回团子。
  try {
    window.sessionStorage.setItem('mochi-companion-hidden', '1');
  } catch {
    // 存储不可用时下次访问自然重新出现。
  }
};

/** 星愿瓶收进一颗星时的联动。星星从卡片飞向瓶子，团子跟着冒一句话。 */
const onStarCollected = () => {
  bonusMessage.value = '又收好一颗星 ✦ 想再看的时候，点左下角的瓶子。';
  unread.value = true;
  reacting.value = true;
  window.clearTimeout(bonusTimer);
  window.clearTimeout(reactTimer);
  bonusTimer = window.setTimeout(() => { bonusMessage.value = ''; }, 5200);
  reactTimer = window.setTimeout(() => { reacting.value = false; }, 700);
};

/** 读深了就切到更安静的阅读心情。 */
let articleDepthReached = false;
const onScroll = () => {
  if (articleDepthReached) return;
  if (window.scrollY > window.innerHeight * 1.6) {
    articleDepthReached = true;
    mood.value = 'reading';
    messageIndex.value = 0;
    if (collapsed.value) unread.value = true;
  }
};

let idleTimer = 0;
/** 静置一会儿自己换句台词，像在等你继续聊。 */
const onIdle = () => {
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    if (!collapsed.value && !bonusMessage.value) advance();
  }, 60_000);
};

onMounted(() => {
  // 清理旧版本写下的永久隐藏标记。
  try { window.localStorage.removeItem('mochi-companion-dismissed'); } catch { /* 忽略存储异常 */ }
  try {
    if (window.sessionStorage.getItem('mochi-companion-hidden') === '1') return;
  } catch { /* 存储不可用时照常出现 */ }

  mood.value = moodFromClock();
  messageIndex.value = Math.floor(Math.random() * lines.value.length);
  show();
  // 打完招呼自动收成团子并留一个未读点，避免小屏上气泡挡住正文。
  greetingTimer = window.setTimeout(() => {
    if (!collapsed.value) collapse();
  }, 9000);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pointermove', onIdle, { passive: true });
  window.addEventListener('star-jar:fly', onStarCollected);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('pointermove', onIdle);
  window.removeEventListener('star-jar:fly', onStarCollected);
  window.clearTimeout(idleTimer);
  window.clearTimeout(greetingTimer);
  window.clearTimeout(bonusTimer);
  window.clearTimeout(reactTimer);
});
</script>

<style scoped>
/* 右下角停靠：叠在回到顶部上方，两者共用 --bs-dock-* 坐标，不会再互相盖住。 */
.mochi-companion {
  position: fixed;
  right: var(--bs-dock-edge);
  bottom: calc(var(--bs-dock-edge) + var(--bs-dock-size) + var(--bs-dock-gap));
  z-index: var(--bs-dock-z);
  display: flex;
  /* DOM 顺序是按钮在前，反转后气泡在左、团子在右。 */
  flex-direction: row-reverse;
  align-items: flex-end;
  gap: .65rem;
  pointer-events: none;
}
.mochi-companion__orb,
.mochi-companion__card,
.mochi-companion__close,
.mochi-companion__refresh,
.mochi-companion__quiet { pointer-events: auto; }

.mochi-companion__orb {
  position: relative;
  width: 3.4rem;
  height: 3.4rem;
  padding: 0;
  border: 1px solid var(--bs-hairline);
  /* 不规则圆角让它读起来像团子，而不是一个普通按钮。 */
  border-radius: 46% 54% 52% 48%;
  background: linear-gradient(145deg, var(--bs-yellow), var(--bs-pink) 56%, var(--bs-lilac));
  box-shadow: var(--bs-shadow), inset -8px -8px 18px var(--bs-tint-pink);
  color: #4b3d60;
  cursor: pointer;
  transform: rotate(-8deg);
  animation: mochi-float var(--bs-dur-drift) var(--bs-ease-breathe) infinite;
  transition: transform var(--bs-dur-base) var(--bs-ease-pop);
}
.mochi-companion__orb:hover { transform: rotate(4deg) scale(1.06); }
.mochi-companion__orb:focus-visible { outline: 3px solid var(--bs-lilac); outline-offset: 4px; }
.mochi-companion__orb.is-reacting { animation: mochi-react var(--bs-dur-mid) var(--bs-ease-pop); }

.mochi-companion__face { position: absolute; top: 1rem; left: 0; right: 0; font-size: .82rem; font-weight: 700; letter-spacing: .06em; line-height: 1; }
.mochi-companion__mouth { position: absolute; top: 1.65rem; left: 0; right: 0; font-size: .95rem; font-weight: 700; line-height: 1; }
.mochi-companion__spark { position: absolute; top: -.5rem; right: -.3rem; color: var(--bs-paper); font-size: 1rem; text-shadow: 0 1px 4px rgba(57, 45, 79, .35); }
.mochi-companion__blush { position: absolute; top: 1.5rem; width: .5rem; height: .28rem; border-radius: 50%; background: rgba(255, 143, 179, .55); filter: blur(1px); }
.mochi-companion__blush--left { left: .55rem; }
.mochi-companion__blush--right { right: .55rem; }

.mochi-companion__pip { position: absolute; top: .1rem; left: .1rem; width: .6rem; height: .6rem; border: 2px solid var(--bs-paper); border-radius: 50%; background: var(--bs-pink); animation: mochi-pip 1.9s var(--bs-ease-breathe) infinite; }

.mochi-companion__card {
  position: relative;
  z-index: var(--bs-dock-z-panel);
  width: min(17rem, calc(100vw - 6rem));
  padding: 1rem 1.1rem .85rem;
  border: 1px solid var(--bs-hairline);
  /* 右下角贴着团子，气泡的尖角留在右下。 */
  border-radius: 1.25rem 1.25rem 1.25rem .35rem;
  background: var(--bs-paper-strong);
  box-shadow: var(--bs-shadow);
  backdrop-filter: blur(var(--bs-blur)) saturate(1.1);
  animation: mochi-card-in var(--bs-dur-mid) var(--bs-ease-soft);
}
.mochi-companion__close { position: absolute; top: .2rem; right: .3rem; display: grid; place-items: center; width: 2.2rem; height: 2.2rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--bs-ink-soft); font-size: 1.15rem; line-height: 1; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.mochi-companion__close:hover { color: var(--bs-ink); background: var(--bs-tint-pink); transform: rotate(90deg); }
.mochi-companion__card small { color: var(--bs-accent-ink); letter-spacing: .08em; }
.mochi-companion__card p { margin: .35rem 0 0; color: var(--bs-ink); font-size: .9rem; line-height: 1.65; }
.mochi-companion__actions { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .55rem; }
/* 用 padding 撑到 44px 舒适点击区，别让细小的文字标签在触屏上难点。 */
.mochi-companion__refresh,
.mochi-companion__quiet { display: inline-flex; align-items: center; min-height: 2.75rem; padding: .3rem .7rem; border: 1px solid transparent; border-radius: 999px; background: transparent; font-family: inherit; font-size: .82rem; cursor: pointer; transition: var(--bs-dur-quick) ease; }
.mochi-companion__refresh { color: var(--bs-link); }
.mochi-companion__quiet { color: var(--bs-ink-soft); }
.mochi-companion__refresh:hover,
.mochi-companion__quiet:hover { background: var(--bs-surface-soft); border-color: var(--bs-hairline); }
.mochi-companion__refresh:focus-visible,
.mochi-companion__quiet:focus-visible,
.mochi-companion__close:focus-visible { outline: 3px solid var(--bs-lilac); outline-offset: 2px; }

@keyframes mochi-card-in { from { opacity: 0; transform: translateY(.5rem) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes mochi-float { 0%, 100% { transform: translateY(0) rotate(-8deg); } 50% { transform: translateY(-.4rem) rotate(5deg); } }
@keyframes mochi-pip { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.25); opacity: .75; } }
@keyframes mochi-react { 0%, 100% { transform: translateY(0) rotate(-8deg) scale(1); } 45% { transform: translateY(-.6rem) rotate(10deg) scale(1.12); } }

@media (max-width: 640px) {
  .mochi-companion__orb { width: 3rem; height: 3rem; }
  .mochi-companion__card { width: min(15rem, calc(100vw - 5.5rem)); }
}
@media (prefers-reduced-motion: reduce) {
  .mochi-companion__orb,
  .mochi-companion__pip,
  .mochi-companion__card { animation: none; }
}
/* 应用内的"减少动效"开关也要管到团子，和系统的 reduce 行为一致。 */
html.bs-reduced-motion .mochi-companion__orb,
html.bs-reduced-motion .mochi-companion__pip,
html.bs-reduced-motion .mochi-companion__card { animation: none; }
</style>
