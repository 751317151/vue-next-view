<template>
  <ClientOnly>
    <!-- Same reasoning as MobileDrawer: no exit transition to get stuck on. -->
    <div v-if="open" class="sheet-scrim" @click.self="close">
        <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <header class="sheet__head">
            <h2 id="settings-title">设置 <span aria-hidden="true">✦</span></h2>
            <button type="button" class="sheet__close" aria-label="关闭设置" @click="close">×</button>
          </header>

          <div class="sheet__group">
            <p class="sheet__label">主题</p>
            <div class="segmented" role="radiogroup" aria-label="主题">
              <button
                v-for="option in themeOptions"
                :key="option.value"
                type="button"
                role="radio"
                :aria-checked="themeMode === option.value"
                :class="{ 'is-active': themeMode === option.value }"
                @click="setTheme(option.value)"
              >
                <span aria-hidden="true">{{ option.emoji }}</span>{{ option.label }}
              </button>
            </div>
          </div>

          <div class="sheet__group">
            <p class="sheet__label">动效</p>
            <div class="segmented" role="radiogroup" aria-label="动效">
              <button
                type="button"
                role="radio"
                :aria-checked="motionPreference === 'full'"
                :class="{ 'is-active': motionPreference === 'full' }"
                @click="setMotion('full')"
              >
                <span aria-hidden="true">🌊</span>完整
              </button>
              <button
                type="button"
                role="radio"
                :aria-checked="motionPreference === 'reduced'"
                :class="{ 'is-active': motionPreference === 'reduced' }"
                @click="setMotion('reduced')"
              >
                <span aria-hidden="true">🍃</span>柔和
              </button>
            </div>
            <p class="sheet__hint">选择「柔和」会停下漂浮与飘落动画，适合安静阅读。</p>
          </div>

          <div class="sheet__group">
            <label class="toggle">
              <span>
                <strong>留言板弹幕</strong>
                <small>让留言像弹幕一样从屏幕上飘过。</small>
              </span>
              <input
                type="checkbox"
                :checked="danmakuEnabled"
                @change="setDanmaku(($event.target as HTMLInputElement).checked)"
              />
              <i class="toggle__track" aria-hidden="true"><b class="toggle__thumb" /></i>
            </label>
          </div>
        </section>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { ThemeMode } from '../composables/useAppearance';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const { themeMode, motionPreference, danmakuEnabled, setTheme, setMotion, setDanmaku } = useAppearance();

const themeOptions: Array<{ value: ThemeMode; label: string; emoji: string }> = [
  { value: 'light', label: '明亮', emoji: '☀️' },
  { value: 'dark', label: '夜间', emoji: '🌙' },
  { value: 'system', label: '跟随', emoji: '🖥️' },
];

const close = () => emit('close');

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) close();
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

// Lock background scrolling while the sheet is open.
watch(() => props.open, (value) => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = value ? 'hidden' : '';
});
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = '';
});
</script>

<style scoped>
.sheet-scrim { position: fixed; inset: 0; z-index: 90; display: flex; align-items: flex-end; justify-content: center; padding: 1rem; background: rgba(40, 30, 55, 0.42); backdrop-filter: blur(6px); }
@media (min-width: 641px) { .sheet-scrim { align-items: center; } }

.sheet { box-sizing: border-box; width: 100%; max-width: 26rem; max-height: 88vh; overflow: auto; padding: 1.3rem 1.35rem 1.5rem; border: 1px solid var(--bs-hairline); border-radius: 1.6rem; background: var(--bs-paper-strong); box-shadow: 0 26px 70px rgba(45, 32, 64, 0.32); backdrop-filter: blur(24px) saturate(1.1); color: var(--bs-ink); }
@media (min-width: 641px) { .sheet { border-radius: 1.8rem; } }

.sheet__head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.1rem; }
.sheet__head h2 { margin: 0; font-size: 1.1rem; color: var(--bs-ink); }
.sheet__close { width: 2rem; height: 2rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--bs-ink-soft); font-size: 1.25rem; line-height: 1; cursor: pointer; transition: 180ms ease; }
.sheet__close:hover { background: rgba(255, 143, 179, 0.18); color: var(--bs-ink); transform: rotate(90deg); }

.sheet__group { margin-top: 1.15rem; }
.sheet__label { margin: 0 0 .5rem; color: var(--bs-ink-soft); font-size: .76rem; letter-spacing: .12em; }
.sheet__hint { margin: .55rem 0 0; color: var(--bs-ink-soft); font-size: .76rem; line-height: 1.6; }

.segmented { display: flex; gap: .35rem; padding: .28rem; border-radius: 999px; background: var(--bs-surface-soft); }
.segmented button { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: .3rem; padding: .5rem .4rem; border: 0; border-radius: 999px; background: transparent; color: var(--bs-ink-soft); font-family: inherit; font-size: .84rem; cursor: pointer; transition: 200ms cubic-bezier(.2, .9, .3, 1.2); }
.segmented button:hover { color: var(--bs-ink); }
.segmented button.is-active { background: linear-gradient(135deg, var(--bs-yellow), var(--bs-pink)); color: #392d4f; font-weight: 600; box-shadow: 0 8px 20px rgba(255, 143, 179, 0.28); transform: translateY(-1px); }

.toggle { display: flex; align-items: center; justify-content: space-between; gap: 1rem; cursor: pointer; }
.toggle > span { display: grid; gap: .15rem; min-width: 0; }
.toggle strong { color: var(--bs-ink); font-size: .92rem; font-weight: 600; }
.toggle small { color: var(--bs-ink-soft); font-size: .76rem; line-height: 1.55; }
.toggle input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.toggle__track { position: relative; flex: 0 0 auto; width: 2.7rem; height: 1.5rem; border-radius: 999px; background: var(--bs-surface-soft); box-shadow: inset 0 0 0 1px var(--bs-hairline); transition: background 220ms ease; }
.toggle__thumb { position: absolute; top: .19rem; left: .19rem; width: 1.12rem; height: 1.12rem; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(57, 45, 79, 0.28); transition: transform 240ms cubic-bezier(.2, .9, .3, 1.3); }
.toggle input:checked + .toggle__track { background: linear-gradient(135deg, var(--bs-mint), var(--bs-lilac)); }
.toggle input:checked + .toggle__track .toggle__thumb { transform: translateX(1.2rem); }
.toggle input:focus-visible + .toggle__track { outline: 3px solid rgba(185, 167, 255, 0.72); outline-offset: 3px; }

/* Mount-only entrance animations; closing removes the node immediately. */
.sheet-scrim { animation: sheet-scrim-in 240ms ease; }
.sheet { animation: sheet-panel-in 300ms cubic-bezier(.2, .9, .3, 1.2); }

@keyframes sheet-scrim-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes sheet-panel-in { from { opacity: 0; transform: translateY(1.5rem) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

@media (prefers-reduced-motion: reduce) {
  .sheet, .sheet-scrim, .segmented button, .sheet__close { transition: none; animation: none; }
}
</style>
