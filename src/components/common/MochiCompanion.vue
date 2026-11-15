<template>
  <aside v-if="visible" class="mochi-companion" aria-label="小星星陪伴">
    <button class="mochi-companion__orb" type="button" :aria-expanded="!collapsed" @click="collapsed = !collapsed">
      <span aria-hidden="true">◡</span><b aria-hidden="true">✦</b>
    </button>
    <div v-if="!collapsed" class="mochi-companion__card">
      <button class="mochi-companion__close" type="button" aria-label="关闭陪伴提示" @click="dismiss">×</button>
      <small>今日的小小提醒</small>
      <p aria-live="polite">{{ message }}</p>
      <button class="mochi-companion__refresh" type="button" @click="nextMessage">换一句 ✨</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storage } from '../../utils/storage';

const messages = ['慢一点也没关系，今天的灵感会在路上等你。', '把一个小想法写下来，它可能会长成一颗星星。', '欢迎回来，愿这里给你一点柔软的勇气。', '喝口水，再继续写代码吧。你已经做得很好了。'];
const visible = ref(false);
const collapsed = ref(false);
const messageIndex = ref(0);
const message = computed(() => messages[messageIndex.value]);
const nextMessage = () => { messageIndex.value = (messageIndex.value + 1) % messages.length; };
const dismiss = () => { visible.value = false; storage.set('mochi-companion-dismissed', '1'); };

onMounted(() => {
  if (storage.get('mochi-companion-dismissed') === '1') return;
  const hour = new Date().getHours();
  messageIndex.value = hour < 6 ? 2 : hour < 12 ? 1 : hour >= 22 ? 0 : 3;
  visible.value = true;
});
</script>

<style scoped>
.mochi-companion { position: fixed; right: clamp(1rem, 3vw, 3rem); bottom: clamp(1rem, 4vw, 3rem); z-index: 40; display: flex; align-items: flex-end; gap: .65rem; pointer-events: none; }
.mochi-companion__orb, .mochi-companion__card, .mochi-companion__close, .mochi-companion__refresh { pointer-events: auto; }
.mochi-companion__orb { position: relative; width: 3.8rem; height: 3.8rem; border: 1px solid rgba(255,255,255,.75); border-radius: 46% 54% 52% 48%; background: linear-gradient(145deg,#ffe48a,#ffb6c8 56%,#b9a7ff); box-shadow: 0 14px 35px rgba(95,66,118,.2), inset -8px -8px 18px rgba(255,143,179,.18); color: #624d72; cursor: pointer; transform: rotate(-8deg); animation: mochi-float 4.6s ease-in-out infinite; }
.mochi-companion__orb span { display: block; margin-top: .3rem; font-size: 1.8rem; font-weight: 700; }
.mochi-companion__orb b { position: absolute; top: -.55rem; right: -.35rem; color: #fff; font-size: 1rem; }
.mochi-companion__card { position: relative; width: min(17rem,calc(100vw - 6rem)); padding: 1rem 1.1rem .85rem; border: 1px solid rgba(255,255,255,.72); border-radius: 1.25rem 1.25rem 1.25rem .35rem; background: rgba(255,250,245,.84); box-shadow: 0 18px 45px rgba(95,66,118,.16); backdrop-filter: blur(16px) saturate(1.1); animation: mochi-pop 360ms cubic-bezier(.2,.8,.2,1); }
.mochi-companion__close { position: absolute; top: .35rem; right: .5rem; border: 0; background: transparent; color: #9485a3; font-size: 1.15rem; cursor: pointer; }
.mochi-companion__card small { color: #b1768c; letter-spacing: .08em; }
.mochi-companion__card p { margin: .35rem 0 0; color: #4b3d60; font-size: .9rem; line-height: 1.65; }
.mochi-companion__refresh { margin-top: .55rem; padding: 0; border: 0; background: transparent; color: #8b73c5; cursor: pointer; }
@keyframes mochi-float { 0%,100% { transform: translateY(0) rotate(-8deg); } 50% { transform: translateY(-.4rem) rotate(5deg); } }
@keyframes mochi-pop { from { opacity: 0; transform: translateY(.5rem) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (max-width:640px) { .mochi-companion { right: .75rem; bottom: .75rem; } .mochi-companion__card { width: min(15rem,calc(100vw - 5.5rem)); } }
@media (prefers-reduced-motion:reduce) { .mochi-companion__orb,.mochi-companion__card { animation: none; } }
</style>
