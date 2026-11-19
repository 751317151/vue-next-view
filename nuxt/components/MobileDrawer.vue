<template>
  <ClientOnly>
    <!-- No <Transition> wrapper: Vue keeps a leaving node mounted until
         transitionend, and this project's global reduced-motion rules force
         transition-duration to 0.01ms, which can leave the node stuck covering
         the page after the visitor taps a link. A plain v-if plus a mount
         animation is deterministic. -->
    <div v-if="modelValue" class="drawer-scrim" @click.self="close">
        <nav class="drawer" aria-label="移动端导航">
          <span class="drawer__spark drawer__spark--one" aria-hidden="true">✦</span>
          <span class="drawer__spark drawer__spark--two" aria-hidden="true">✧</span>

          <header class="drawer__head">
            <span class="drawer__brand">🌙 生活倒影</span>
            <button type="button" class="drawer__close" aria-label="关闭菜单" @click="close">×</button>
          </header>

          <ul class="drawer__list">
            <li
              v-for="(item, index) in items"
              :key="item.to"
              :style="{ '--i': index }"
            >
              <NuxtLink :to="item.to" class="drawer__link" @click="close">
                <span class="drawer__emoji" aria-hidden="true">{{ item.emoji }}</span>
                <span class="drawer__text">
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.hint }}</small>
                </span>
                <span class="drawer__arrow" aria-hidden="true">→</span>
              </NuxtLink>
            </li>
          </ul>

          <footer class="drawer__foot">
            <button type="button" class="drawer__settings" @click="emit('settings'); close()">
              <span aria-hidden="true">⚙</span> 主题与设置
            </button>
            <p class="drawer__note">把技术、生活和灵感，写成会发光的小故事。</p>
          </footer>
        </nav>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [boolean]; settings: [] }>();

const items = [
  { to: '/archive', label: '归档', hint: '按时间翻阅所有故事', emoji: '📚' },
  { to: '/categories', label: '分类', hint: '每间小房间的主题', emoji: '🏠' },
  { to: '/tags', label: '标签', hint: '灵感串起的小线索', emoji: '🏷️' },
  { to: '/search', label: '搜索', hint: '在星海里找一颗星', emoji: '🔍' },
  { to: '/message', label: '留言板', hint: '贴上你的便利贴', emoji: '✉️' },
  { to: '/friend', label: '友人帐', hint: '一起发光的人', emoji: '🫧' },
  { to: '/about', label: '关于', hint: '认识写这些字的人', emoji: '🌿' },
];

const close = () => emit('update:modelValue', false);

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) close();
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

watch(() => props.modelValue, (value) => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = value ? 'hidden' : '';
});
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = '';
});
</script>

<style scoped>
.drawer-scrim { position: fixed; inset: 0; z-index: 95; display: flex; justify-content: flex-end; background: rgba(40, 30, 55, 0.4); backdrop-filter: blur(6px); }

.drawer { position: relative; box-sizing: border-box; display: flex; flex-direction: column; width: min(20rem, 86vw); height: 100%; overflow: auto; padding: 1.2rem 1.2rem 1.6rem; background: var(--bs-paper-strong); box-shadow: -20px 0 60px rgba(45, 32, 64, 0.3); backdrop-filter: blur(24px) saturate(1.1); color: var(--bs-ink); }
.drawer::before { position: absolute; inset: 0 auto 0 0; width: 3px; background: linear-gradient(180deg, var(--bs-pink), var(--bs-peach), var(--bs-lilac), var(--bs-mint)); content: ""; }

.drawer__spark { position: absolute; color: var(--bs-peach); pointer-events: none; }
.drawer__spark--one { top: 5.5rem; right: 1.6rem; font-size: 1rem; animation: drawer-twinkle 3.4s ease-in-out infinite; }
.drawer__spark--two { top: 8.5rem; right: 3.2rem; font-size: .75rem; color: var(--bs-lilac); animation: drawer-twinkle 4.1s ease-in-out infinite .7s; }

.drawer__head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.drawer__brand { font-weight: 700; color: var(--bs-ink); }
.drawer__close { width: 2rem; height: 2rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--bs-ink-soft); font-size: 1.3rem; line-height: 1; cursor: pointer; transition: 180ms ease; }
.drawer__close:hover { background: rgba(255, 143, 179, 0.18); color: var(--bs-ink); transform: rotate(90deg); }

.drawer__list { display: grid; gap: .35rem; margin: 1.4rem 0 0; padding: 0; list-style: none; }
.drawer__list li { animation: drawer-item-in 380ms cubic-bezier(.2, .9, .3, 1.2) forwards; animation-delay: calc(var(--i) * 45ms + 90ms); opacity: 0; }

.drawer__link { display: grid; grid-template-columns: auto 1fr auto; gap: .75rem; align-items: center; padding: .7rem .8rem; border-radius: 1rem; color: var(--bs-ink); text-decoration: none; transition: 200ms cubic-bezier(.2, .9, .3, 1.2); }
.drawer__link:hover, .drawer__link:focus-visible { background: var(--bs-surface-soft); transform: translateX(4px); }
.drawer__emoji { display: grid; place-items: center; width: 2.3rem; height: 2.3rem; border-radius: .85rem; background: linear-gradient(150deg, rgba(255, 228, 138, .5), rgba(255, 182, 200, .38)); font-size: 1.05rem; }
.drawer__text { display: grid; gap: .1rem; min-width: 0; }
.drawer__text strong { font-size: .95rem; font-weight: 600; }
.drawer__text small { color: var(--bs-ink-soft); font-size: .74rem; }
.drawer__arrow { color: var(--bs-lilac); opacity: 0; transform: translateX(-4px); transition: 200ms ease; }
.drawer__link:hover .drawer__arrow { opacity: 1; transform: translateX(0); }

.drawer__foot { margin-top: auto; padding-top: 1.4rem; }
.drawer__settings { display: inline-flex; align-items: center; gap: .4rem; width: 100%; justify-content: center; padding: .65rem 1rem; border: 1px dashed var(--bs-hairline); border-radius: 999px; background: transparent; color: var(--bs-ink); font-family: inherit; font-size: .86rem; cursor: pointer; transition: 200ms ease; }
.drawer__settings:hover { background: var(--bs-surface-soft); border-color: var(--bs-pink); }
.drawer__note { margin: .9rem 0 0; color: var(--bs-ink-soft); font-size: .74rem; line-height: 1.7; }

/* Mount-only entrance: the panel slides in and the scrim fades, with no exit
   animation to wait on. */
.drawer-scrim { animation: drawer-scrim-in 260ms ease; }
.drawer { animation: drawer-panel-in 320ms cubic-bezier(.2, .9, .3, 1.15); }

@keyframes drawer-scrim-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes drawer-panel-in { from { transform: translateX(100%); } to { transform: translateX(0); } }

@keyframes drawer-item-in { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); } }
@keyframes drawer-twinkle { 0%, 100% { opacity: .3; transform: scale(.8) rotate(0); } 50% { opacity: 1; transform: scale(1.2) rotate(18deg); } }

@media (prefers-reduced-motion: reduce) {
  .drawer, .drawer-scrim, .drawer__link, .drawer__close { transition: none; animation: none; }
  .drawer__spark { animation: none; }
  .drawer__list li { animation: none; opacity: 1; }
}
</style>
