<script setup lang="ts">
import { siteConfig } from '../../src/config/site';
usePageSeo({
  path: '/message',
  title: `留言板 | ${siteConfig.name}`,
  description: '在这里留下一句话，让路过的人看见一点温柔的光。',
});

const { messages, ready, load, add, remove, seed } = useMessageBoard();

const draftName = ref('');
const draftText = ref('');
const justPostedId = ref('');
const poppingId = ref('');
const maxLength = 500;

const remaining = computed(() => maxLength - draftText.value.length);
const canSubmit = computed(() => draftText.value.trim().length > 0);

const timeLabel = (value: string) => {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '刚刚';
  const diff = Date.now() - time;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < day * 7) return `${Math.floor(diff / day)} 天前`;
  const date = new Date(time);
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
};

const submit = () => {
  if (!canSubmit.value) return;
  const created = add(draftName.value, draftText.value);
  if (!created) return;
  justPostedId.value = created.id;
  draftText.value = '';
  window.setTimeout(() => { justPostedId.value = ''; }, 2200);
};

const pop = (id: string) => {
  poppingId.value = id;
  window.setTimeout(() => { poppingId.value = ''; }, 380);
};

const removeMessage = (id: string) => {
  pop(id);
  window.setTimeout(() => remove(id), 260);
};

onMounted(() => {
  load();
  seed();
});
</script>

<template>
  <MigrationPage
    eyebrow="MESSAGE"
    title="留一句话，挂在星星下。"
    description="这里是一面温柔的留言墙。写下想说的话，它会替你记住此刻的心情。"
  >
    <div class="board">
      <form class="note-form" @submit.prevent="submit">
        <span class="note-form__tape note-form__tape--left" aria-hidden="true"></span>
        <span class="note-form__tape note-form__tape--right" aria-hidden="true"></span>
        <label class="note-form__label" for="message-name">你的称呼</label>
        <input
          id="message-name"
          v-model="draftName"
          class="note-form__name"
          type="text"
          maxlength="20"
          placeholder="匿名旅人"
          autocomplete="nickname"
        />
        <label class="note-form__label" for="message-text">想说的悄悄话</label>
        <textarea
          id="message-text"
          v-model="draftText"
          class="note-form__text"
          :maxlength="maxLength"
          rows="4"
          placeholder="今天遇到了一件小事，想讲给路过的人听……"
        ></textarea>
        <div class="note-form__foot">
          <span class="note-form__count" :class="{ 'is-tight': remaining < 60 }">还能写 {{ remaining }} 字</span>
          <button type="submit" class="note-form__send" :disabled="!canSubmit">
            <span aria-hidden="true">✉</span> 贴上留言墙
          </button>
        </div>
      </form>

      <div class="board__head">
        <h2>留言墙 <small>{{ messages.length }} 张便利贴</small></h2>
        <p v-if="!ready" class="board__loading">正在把便利贴从抽屉里拿出来…</p>
      </div>

      <TransitionGroup v-if="ready" name="note" tag="ul" class="board__list">
        <li
          v-for="(message, index) in messages"
          :key="message.id"
          class="note"
          :class="{
            'is-fresh': message.id === justPostedId,
            'is-popping': message.id === poppingId,
          }"
          :style="{ '--note-tilt': `${((index % 5) - 2) * 0.7}deg`, '--note-delay': `${Math.min(index, 12) * 45}ms` }"
        >
          <span class="note__pin" aria-hidden="true">{{ message.emoji }}</span>
          <div class="note__body">
            <p class="note__text">{{ message.text }}</p>
            <footer class="note__meta">
              <strong>{{ message.name }}</strong>
              <time :datetime="message.createdAt">{{ timeLabel(message.createdAt) }}</time>
            </footer>
          </div>
          <button
            type="button"
            class="note__remove"
            :aria-label="`删除 ${message.name} 的留言`"
            @click="removeMessage(message.id)"
          >×</button>
        </li>
      </TransitionGroup>

      <p v-if="ready && !messages.length" class="board__empty">
        墙上还空着，写下第一张便利贴吧 ✧
      </p>

      <p class="board__hint">
        <span aria-hidden="true">🫧</span>
        留言只保存在你自己的浏览器里，是一份只属于你的心情记录。
      </p>
    </div>
  </MigrationPage>
</template>

<style scoped>
.board { display: grid; gap: 1.6rem; }

/* --- Sticky-note composer --- */
.note-form { position: relative; display: grid; gap: .4rem; padding: 1.5rem 1.35rem 1.15rem; border-radius: 1.2rem; background: linear-gradient(160deg, rgba(255, 250, 235, .95), rgba(255, 244, 246, .92)); box-shadow: 0 16px 40px rgba(95, 66, 118, .13); transform: rotate(-.35deg); }
.note-form__tape { position: absolute; top: -.55rem; width: 4.2rem; height: 1.25rem; background: rgba(255, 228, 138, .72); box-shadow: 0 2px 6px rgba(95, 66, 118, .12); }
.note-form__tape--left { left: 1.4rem; transform: rotate(-6deg); }
.note-form__tape--right { right: 1.4rem; transform: rotate(5deg); }
.note-form__label { color: #b1768c; font-size: .74rem; letter-spacing: .1em; }
.note-form__name, .note-form__text { width: 100%; padding: .6rem .75rem; border: 1px solid rgba(185, 167, 255, .36); border-radius: .8rem; background: rgba(255, 255, 255, .78); color: #392d4f; font-family: inherit; font-size: .92rem; outline: none; transition: border-color 180ms ease, box-shadow 180ms ease; }
.note-form__text { resize: vertical; line-height: 1.7; }
.note-form__name:focus, .note-form__text:focus { border-color: #ff8fb3; box-shadow: 0 0 0 4px rgba(255, 143, 179, .13); }
.note-form__foot { display: flex; align-items: center; justify-content: space-between; gap: .8rem; margin-top: .35rem; }
.note-form__count { color: #9485a3; font-size: .78rem; transition: color 200ms ease; }
.note-form__count.is-tight { color: #e1799c; }
.note-form__send { display: inline-flex; align-items: center; gap: .35rem; padding: .6rem 1.1rem; border: 0; border-radius: 999px; background: linear-gradient(135deg, #ffe48a, #ffb6c8); color: #392d4f; font-family: inherit; font-weight: 600; cursor: pointer; box-shadow: 0 10px 24px rgba(255, 143, 179, .26); transition: transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease; }
.note-form__send:hover:not(:disabled) { transform: translateY(-3px) rotate(-1deg); box-shadow: 0 16px 32px rgba(255, 143, 179, .32); }
.note-form__send:disabled { opacity: .5; cursor: not-allowed; }

/* --- Wall --- */
.board__head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-top: .4rem; }
.board__head h2 { margin: 0; color: #392d4f; font-size: 1.15rem; }
.board__head h2 small { margin-left: .4rem; color: #9485a3; font-size: .8rem; font-weight: 400; }
.board__loading { margin: 0; color: #9485a3; font-size: .84rem; }

.board__list { display: grid; gap: .85rem; margin: 0; padding: 0; list-style: none; }

.note { position: relative; display: grid; grid-template-columns: auto 1fr; gap: .8rem; align-items: start; padding: 1.05rem 1.9rem 1rem 1.15rem; border: 1px solid rgba(255, 255, 255, .82); border-radius: 1.1rem; background: rgba(255, 255, 255, .68); box-shadow: 0 10px 26px rgba(95, 66, 118, .08); transform: rotate(var(--note-tilt)); transition: transform 240ms cubic-bezier(.2, .9, .3, 1.3), box-shadow 240ms ease, background 240ms ease; }
.note:hover { transform: rotate(0deg) translateY(-3px); background: rgba(255, 255, 255, .86); box-shadow: 0 18px 40px rgba(95, 66, 118, .14); }
.note::after { position: absolute; inset: auto .9rem .55rem; height: 2px; border-radius: 999px; background: linear-gradient(90deg, rgba(255, 143, 179, .5), rgba(185, 167, 255, .3)); content: ""; opacity: 0; transition: opacity 240ms ease; }
.note:hover::after { opacity: 1; }

.note__pin { display: grid; place-items: center; width: 2.15rem; height: 2.15rem; border-radius: 50%; background: rgba(255, 228, 138, .3); font-size: 1.05rem; line-height: 1; }
.note__body { min-width: 0; }
.note__text { margin: 0; color: #4b3d60; font-size: .94rem; line-height: 1.8; overflow-wrap: anywhere; }
.note__meta { display: flex; flex-wrap: wrap; align-items: baseline; gap: .55rem; margin-top: .5rem; }
.note__meta strong { color: #392d4f; font-size: .84rem; }
.note__meta time { color: #a99db8; font-size: .76rem; }
.note__remove { position: absolute; top: .5rem; right: .5rem; display: grid; place-items: center; width: 1.5rem; height: 1.5rem; padding: 0; border: 0; border-radius: 50%; background: transparent; color: #c3b6d2; font-size: 1rem; cursor: pointer; opacity: 0; transition: 180ms ease; }
.note:hover .note__remove, .note__remove:focus-visible { opacity: 1; }
.note__remove:hover { background: rgba(255, 143, 179, .2); color: #e1799c; transform: rotate(90deg); }

/* Fresh note pops in with a little bounce. */
.note.is-fresh { animation: note-drop 620ms cubic-bezier(.2, .9, .3, 1.25); background: rgba(255, 228, 138, .22); }
@keyframes note-drop {
  0% { transform: translateY(-14px) scale(.92) rotate(-3deg); opacity: 0; }
  60% { transform: translateY(2px) scale(1.02) rotate(.6deg); opacity: 1; }
  100% { transform: translateY(0) scale(1) rotate(var(--note-tilt)); }
}
.note.is-popping { animation: note-pop 340ms ease forwards; }
@keyframes note-pop {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(.86) rotate(4deg); opacity: 0; }
}

/* List enter/leave/move for TransitionGroup. */
.note-enter-active { transition: opacity 380ms ease, transform 380ms cubic-bezier(.2, .9, .3, 1.25); }
.note-leave-active { position: absolute; transition: opacity 260ms ease, transform 260ms ease; }
.note-move { transition: transform 320ms cubic-bezier(.2, .9, .3, 1.15); }
.note-enter-from { opacity: 0; transform: translateY(-12px) scale(.94); }
.note-leave-to { opacity: 0; transform: scale(.9) rotate(5deg); }

.board__empty { margin: 0; padding: 2rem 1rem; border: 1.5px dashed rgba(185, 167, 255, .5); border-radius: 1.1rem; color: #9485a3; text-align: center; }

.board__hint { display: flex; align-items: center; gap: .45rem; margin: 0; color: #a99db8; font-size: .8rem; }

@media (max-width: 560px) {
  .note-form { transform: none; }
  .note-form__foot { flex-direction: column; align-items: stretch; }
  .note-form__send { justify-content: center; }
  .note { padding-right: 1.4rem; }
  .note__remove { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .note, .note::after, .note__remove, .note-form__send { transition: none; }
  .note:hover { transform: none; }
  .note.is-fresh, .note.is-popping { animation: none; }
  .note-enter-active, .note-leave-active, .note-move { transition: none; }
}
</style>
