<script setup lang="ts">
const props = defineProps<{
  shelf: 'trail' | 'stars' | 'excerpts';
}>();

const emit = defineEmits<{ choose: [shelf: 'trail' | 'stars' | 'excerpts'] }>();

const STEPS = [
  {
    shelf: 'trail',
    emoji: '🕯️',
    title: '先翻开一篇文章',
    text: '读到哪一段，书桌就替你点一盏灯。',
    note: '读几行就会自动记下',
    action: '去挑一篇',
    to: '/archive',
  },
  {
    shelf: 'stars',
    emoji: '🫙',
    title: '把喜欢的收进瓶子',
    text: '文章标题旁有一颗小星星，点一下就不会走丢。',
    note: '收进星愿瓶',
    action: '去星图看看',
    to: '/explore',
  },
  {
    shelf: 'excerpts',
    emoji: '📎',
    title: '夹住一句心动的话',
    text: '在正文里选中它，点「夹进摘抄本」，句子就留下来了。',
    note: '选中正文就能夹',
    action: '翻一篇文章',
    to: '/archive',
  },
] as const;

const active = computed(() => STEPS.find((step) => step.shelf === props.shelf) || STEPS[0]!);
</script>

<template>
  <div class="first-steps">
    <span class="first-steps__moon" aria-hidden="true">☾</span>

    <div class="first-steps__copy">
      <p class="first-steps__kicker">从第一颗开始</p>
      <h2>{{ active.title }}</h2>
      <p class="first-steps__text">{{ active.text }}</p>
      <NuxtLink :to="active.to" class="first-steps__action">
        {{ active.action }} <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <ol class="first-steps__track" aria-label="点亮书桌的三步">
      <li v-for="(step, index) in STEPS" :key="step.shelf">
        <button
          type="button"
          class="first-steps__dot"
          :class="{ 'is-active': step.shelf === shelf }"
          :aria-pressed="step.shelf === shelf"
          :aria-label="step.title"
          @click="emit('choose', step.shelf)"
        >
          <span class="first-steps__dot-emoji" aria-hidden="true">{{ step.emoji }}</span>
          <span class="first-steps__dot-label">{{ step.note }}</span>
          <i v-if="index < STEPS.length - 1" class="first-steps__dash" aria-hidden="true"></i>
        </button>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.first-steps { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(15rem, .9fr); gap: 1.2rem; align-items: center; padding: 1.15rem 1.2rem 1.25rem; overflow: hidden; border: 1px dashed var(--bs-border-accent); border-radius: 1.2rem; background: radial-gradient(circle at 90% 10%, rgba(255, 228, 138, .2), transparent 34%), var(--bs-surface-soft); }
.first-steps::after { position: absolute; right: -3.2rem; bottom: -4rem; width: 9rem; height: 9rem; border: 1px dashed rgba(185, 167, 255, .28); border-radius: 50%; content: ""; pointer-events: none; }
:root.bs-dark .first-steps { background: radial-gradient(circle at 90% 10%, rgba(255, 233, 160, .07), transparent 34%), var(--bs-surface-soft); }

.first-steps__moon { position: absolute; top: -.7rem; right: 1.4rem; color: var(--bs-yellow); font-size: 2.6rem; opacity: .42; transform: rotate(14deg); pointer-events: none; }
.first-steps__copy { position: relative; z-index: 1; display: grid; justify-items: start; gap: .2rem; }
.first-steps__kicker { margin: 0; color: var(--bs-accent-ink); font-size: .66rem; letter-spacing: .12em; }
.first-steps__copy h2 { margin: .1rem 0 0; color: var(--bs-ink); font-size: 1.12rem; line-height: 1.45; }
.first-steps__text { max-width: 26rem; margin: .15rem 0 0; color: var(--bs-ink-soft); font-size: .84rem; line-height: 1.75; }
.first-steps__action { display: inline-flex; gap: .3rem; align-items: center; margin-top: .7rem; padding: .35rem .8rem; border: 1.5px solid var(--bs-ink-line); border-radius: 999px; background: var(--bs-yellow); color: var(--bs-ink-on-accent); font-size: .78rem; font-weight: 700; text-decoration: none; box-shadow: 2px 2px 0 var(--bs-ink-line); transition: transform var(--bs-dur-quick) var(--bs-ease-pop), box-shadow var(--bs-dur-quick) ease; }
.first-steps__action:hover { transform: translate(-1px, -2px) rotate(-.6deg); box-shadow: 4px 4px 0 var(--bs-ink-line); }
.first-steps__action:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 2px; }
.first-steps__action span { transition: transform var(--bs-dur-quick) ease; }
.first-steps__action:hover span { transform: translateX(3px); }

.first-steps__track { position: relative; z-index: 1; display: grid; gap: .3rem; margin: 0; padding: 0; list-style: none; }
.first-steps__dot { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: .55rem; align-items: center; width: 100%; padding: .45rem .55rem; border: 1px dashed transparent; border-radius: .8rem; background: transparent; color: var(--bs-ink-soft); font: inherit; text-align: left; cursor: pointer; transition: background var(--bs-dur-quick) ease, border-color var(--bs-dur-quick) ease, transform var(--bs-dur-quick) var(--bs-ease-pop); }
.first-steps__dot:hover { border-color: var(--bs-border); background: var(--bs-surface); transform: translateX(2px); }
.first-steps__dot.is-active { border-color: var(--bs-border-accent); background: var(--bs-tint-yellow); color: var(--bs-ink); }
.first-steps__dot:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 2px; }
.first-steps__dot-emoji { display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border: 1px solid var(--bs-hairline); border-radius: 50%; background: var(--bs-paper-strong); font-size: .82rem; }
.first-steps__dot.is-active .first-steps__dot-emoji { border-color: var(--bs-border-accent); box-shadow: 1.5px 1.5px 0 var(--bs-ink-line); }
.first-steps__dot-label { overflow: hidden; font-size: .74rem; text-overflow: ellipsis; white-space: nowrap; }
.first-steps__dash { position: absolute; left: 1.35rem; bottom: -.42rem; width: 1px; height: .42rem; background: var(--bs-border-accent); }

@media (max-width: 700px) {
  .first-steps { grid-template-columns: 1fr; gap: .8rem; padding: .95rem 1rem 1.05rem; }
  .first-steps__moon { font-size: 2rem; }
  .first-steps__track { gap: .2rem; }
  .first-steps__dot { padding: .38rem .45rem; }
}

@media (prefers-reduced-motion: reduce) {
  .first-steps__action, .first-steps__action span, .first-steps__dot { transition: none; }
  .first-steps__action:hover, .first-steps__dot:hover { transform: none; }
}
html.bs-reduced-motion .first-steps__action,
html.bs-reduced-motion .first-steps__action span,
html.bs-reduced-motion .first-steps__dot { transition: none; }
html.bs-reduced-motion .first-steps__action:hover,
html.bs-reduced-motion .first-steps__dot:hover { transform: none; }
</style>
