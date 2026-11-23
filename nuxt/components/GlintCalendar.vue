<script setup lang="ts">
import type { PublicGlint } from '../types/public';

const props = defineProps<{ glints: PublicGlint[] }>();

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const ACCENTS = ['var(--bs-peach)', 'var(--bs-mint)', 'var(--bs-lilac)', 'var(--bs-pink)'];
const TILTS = ['-.35deg', '.28deg', '-.18deg', '.4deg'];

interface CalendarCell {
  day: number;
  glint?: PublicGlint;
}

interface CalendarMonth {
  key: string;
  year: number;
  month: number;
  cells: Array<CalendarCell | null>;
  glints: PublicGlint[];
  accent: string;
  tilt: string;
}

/**
 * 把微光按年月摊成一页页手账月历。日期用 UTC 构造，避免不同时区
 * 在月初或月末把某一格算到隔壁月份。
 */
const months = computed<CalendarMonth[]>(() => {
  const groups = new Map<string, PublicGlint[]>();
  for (const glint of props.glints) {
    const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(glint.date);
    if (!match) continue;
    const key = `${match[1]}-${match[2]}`;
    const list = groups.get(key);
    if (list) list.push(glint);
    else groups.set(key, [glint]);
  }

  return [...groups.entries()]
    .sort((left, right) => right[0].localeCompare(left[0]))
    .map(([key, list], index) => {
      const [yearText, monthText] = key.split('-');
      const year = Number(yearText);
      const month = Number(monthText);
      const byDay = new Map(list.map((glint) => [Number(glint.date.slice(8, 10)), glint]));
      const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
      const total = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const cells: Array<CalendarCell | null> = Array.from({ length: offset }, () => null);
      for (let day = 1; day <= total; day += 1) {
        cells.push({ day, glint: byDay.get(day) });
      }
      while (cells.length % 7 !== 0) cells.push(null);

      return {
        key,
        year,
        month,
        cells,
        glints: list,
        accent: ACCENTS[index % ACCENTS.length]!,
        tilt: TILTS[index % TILTS.length]!,
      };
    });
});

/** 悬停日期贴纸或右侧纸条时，两边同时发亮，像在纸上把同一天圈起来。 */
const activeSlug = ref('');

const lightUp = (slug: string) => {
  activeSlug.value = slug;
};

const coolDown = (slug: string) => {
  if (activeSlug.value === slug) activeSlug.value = '';
};

const glintLink = (glint: PublicGlint) =>
  glint.path || `/glints/${encodeURIComponent(glint.slug)}`;
</script>

<template>
  <div class="glint-calendar">
    <article
      v-for="month in months"
      :key="month.key"
      class="calendar-month"
      :style="{ '--month-accent': month.accent, '--month-tilt': month.tilt }"
    >
      <span class="calendar-month__tape" aria-hidden="true"></span>

      <header class="calendar-month__head">
        <p class="calendar-month__year">{{ month.year }}</p>
        <p class="calendar-month__title">
          <strong>{{ month.month }}</strong><span>月</span>
        </p>
        <p class="calendar-month__count">{{ month.glints.length }} 束光</p>
      </header>

      <div class="calendar-month__body">
        <div class="calendar-month__grid" :aria-label="`${month.year} 年 ${month.month} 月的微光日期`">
          <span v-for="weekday in WEEKDAYS" :key="weekday" class="calendar-month__weekday" aria-hidden="true">
            {{ weekday }}
          </span>

          <template v-for="(cell, index) in month.cells" :key="`${month.key}-${index}`">
            <span v-if="!cell" class="calendar-month__blank" aria-hidden="true"></span>
            <NuxtLink
              v-else-if="cell.glint"
              :to="glintLink(cell.glint)"
              class="calendar-day is-lit"
              :class="{ 'is-active': activeSlug === cell.glint.slug }"
              :aria-label="`${month.month} 月 ${cell.day} 日 · ${cell.glint.title}`"
              @pointerenter="lightUp(cell.glint.slug)"
              @pointerleave="coolDown(cell.glint.slug)"
              @focus="lightUp(cell.glint.slug)"
              @blur="coolDown(cell.glint.slug)"
            >
              <span class="calendar-day__number">{{ cell.day }}</span>
              <span class="calendar-day__stamp" aria-hidden="true">{{ cell.glint.emoji }}</span>
            </NuxtLink>
            <span v-else class="calendar-day">
              <span class="calendar-day__number">{{ cell.day }}</span>
            </span>
          </template>
        </div>

        <ul class="calendar-month__slips" :aria-label="`${month.year} 年 ${month.month} 月的微光`">
          <li v-for="glint in month.glints" :key="glint.id">
            <NuxtLink
              :to="glintLink(glint)"
              class="calendar-slip"
              :class="{ 'is-active': activeSlug === glint.slug }"
              @pointerenter="lightUp(glint.slug)"
              @pointerleave="coolDown(glint.slug)"
              @focus="lightUp(glint.slug)"
              @blur="coolDown(glint.slug)"
            >
              <span class="calendar-slip__stamp" aria-hidden="true">{{ glint.emoji }}</span>
              <span class="calendar-slip__copy">
                <strong>{{ glint.title }}</strong>
                <small>{{ glint.summary || glint.text }}</small>
              </span>
              <span class="calendar-slip__arrow" aria-hidden="true">↗</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </article>
  </div>
</template>

<style scoped>
.glint-calendar { display: grid; gap: 1rem; }

/* 一页月历：边缘微翘、顶部贴一条胶带，像从手账里抽出来的一页。 */
.calendar-month {
  position: relative;
  padding: 1.1rem 1.15rem 1.15rem;
  border: 1px solid var(--bs-border);
  border-radius: 1.1rem 1.35rem 1.2rem 1.05rem;
  background:
    linear-gradient(90deg, transparent 2.45rem, rgba(255, 189, 138, .13) 2.45rem, rgba(255, 189, 138, .13) 2.52rem, transparent 2.52rem),
    var(--bs-paper-strong);
  box-shadow: var(--bs-shadow-soft);
  transform: rotate(var(--month-tilt));
  transition: transform var(--bs-dur-base) var(--bs-ease-pop), box-shadow var(--bs-dur-base) ease;
}
.calendar-month:hover { transform: rotate(0); box-shadow: var(--bs-shadow); }
:root.bs-dark .calendar-month {
  background:
    linear-gradient(90deg, transparent 2.45rem, rgba(255, 201, 155, .08) 2.45rem, rgba(255, 201, 155, .08) 2.52rem, transparent 2.52rem),
    var(--bs-paper-strong);
}

.calendar-month__tape {
  position: absolute;
  top: -.5rem;
  left: 1.6rem;
  width: 4.3rem;
  height: 1rem;
  background: color-mix(in srgb, var(--month-accent) 62%, transparent);
  box-shadow: 0 2px 5px rgba(95, 66, 118, .1);
  transform: rotate(-2deg);
  clip-path: polygon(3% 12%, 97% 0, 100% 87%, 2% 100%);
}

.calendar-month__head {
  display: flex;
  align-items: baseline;
  gap: .55rem;
  padding-bottom: .55rem;
  border-bottom: 1px dashed var(--bs-border-accent);
}
.calendar-month__year { margin: 0; color: var(--bs-ink-muted); font-size: .7rem; letter-spacing: .16em; }
.calendar-month__title { display: flex; align-items: baseline; gap: .15rem; margin: 0; color: var(--bs-ink); }
.calendar-month__title strong { font-size: 1.75rem; font-weight: 700; line-height: 1; }
.calendar-month__title span { color: var(--bs-ink-soft); font-size: .78rem; }
.calendar-month__count {
  margin: 0 0 0 auto;
  padding: .1rem .5rem;
  border: 1px dashed var(--bs-border-accent);
  border-radius: 999px;
  color: var(--bs-accent-ink);
  font-size: .65rem;
}

.calendar-month__body {
  display: grid;
  grid-template-columns: minmax(0, 14.5rem) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  margin-top: .8rem;
}

.calendar-month__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: .16rem;
}
.calendar-month__weekday {
  padding-bottom: .18rem;
  color: var(--bs-ink-subtle);
  font-size: .62rem;
  text-align: center;
}

.calendar-month__blank { aspect-ratio: 1; }

.calendar-day {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border-radius: 45% 55% 48% 52%;
  color: var(--bs-ink-muted);
  font-size: .7rem;
  text-decoration: none;
}
.calendar-day__number { position: relative; z-index: 1; }
.calendar-day.is-lit {
  border: 1px dashed var(--bs-border-accent);
  background: var(--bs-tint-yellow);
  box-shadow: 1.5px 1.5px 0 var(--bs-ink-line);
  color: var(--bs-ink);
  transition: transform var(--bs-dur-quick) var(--bs-ease-pop), box-shadow var(--bs-dur-quick) ease, background var(--bs-dur-quick) ease;
}
.calendar-day.is-lit:nth-child(3n + 1) { transform: rotate(-3deg); }
.calendar-day.is-lit:nth-child(3n + 2) { transform: rotate(2deg); }
.calendar-day.is-lit:hover,
.calendar-day.is-lit:focus-visible,
.calendar-day.is-lit.is-active {
  z-index: 2;
  background: var(--bs-tint-pink);
  box-shadow: 2.5px 3px 0 var(--bs-ink-line);
  transform: translateY(-2px) rotate(0) scale(1.08);
  outline: none;
}
.calendar-day.is-lit:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 1px; }
.calendar-day__stamp {
  position: absolute;
  right: -.2rem;
  bottom: -.15rem;
  display: grid;
  place-items: center;
  width: 1.15rem;
  height: 1.15rem;
  border: 1px solid var(--bs-hairline);
  border-radius: 50%;
  background: var(--bs-paper-strong);
  font-size: .66rem;
  line-height: 1;
}

.calendar-month__slips { display: grid; gap: .35rem; margin: 0; padding: 0; list-style: none; }
.calendar-slip {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: .55rem;
  align-items: center;
  padding: .42rem .55rem;
  border: 1px dashed transparent;
  border-radius: .75rem;
  color: var(--bs-ink-body);
  text-decoration: none;
  transition: transform var(--bs-dur-quick) var(--bs-ease-pop), background var(--bs-dur-quick) ease, border-color var(--bs-dur-quick) ease;
}
.calendar-slip:hover,
.calendar-slip:focus-visible,
.calendar-slip.is-active {
  border-color: var(--bs-border-accent);
  background: var(--bs-surface-strong);
  transform: translateX(3px) rotate(-.3deg);
  outline: none;
}
.calendar-slip:focus-visible { outline: 3px solid rgba(185, 167, 255, .72); outline-offset: 1px; }
.calendar-slip__stamp {
  display: grid;
  place-items: center;
  width: 1.55rem;
  height: 1.55rem;
  border: 1px dashed var(--bs-border-accent);
  border-radius: 50%;
  background: var(--bs-paper-strong);
  font-size: .78rem;
}
.calendar-slip__copy { display: grid; gap: .02rem; min-width: 0; }
.calendar-slip__copy strong { overflow: hidden; color: var(--bs-ink); font-size: .82rem; font-weight: 600; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
.calendar-slip__copy small { overflow: hidden; color: var(--bs-ink-soft); font-size: .7rem; line-height: 1.55; text-overflow: ellipsis; white-space: nowrap; }
.calendar-slip__arrow { color: var(--bs-ink-faint); font-size: .7rem; transition: transform var(--bs-dur-quick) ease, color var(--bs-dur-quick) ease; }
.calendar-slip:hover .calendar-slip__arrow,
.calendar-slip.is-active .calendar-slip__arrow { color: var(--bs-accent-ink); transform: translate(2px, -2px); }

@media (max-width: 720px) {
  .calendar-month { padding: .9rem .8rem 1rem; }
  .calendar-month__body { grid-template-columns: minmax(0, 1fr); }
  .calendar-month__grid { max-width: 19rem; }
  .calendar-slip__copy small { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
}

@media (prefers-reduced-motion: reduce) {
  .calendar-month, .calendar-day.is-lit, .calendar-slip, .calendar-slip__arrow { transition: none; }
  .calendar-month:hover { transform: none; }
  .calendar-day.is-lit:nth-child(3n + 1), .calendar-day.is-lit:nth-child(3n + 2) { transform: none; }
}
html.bs-reduced-motion .calendar-month,
html.bs-reduced-motion .calendar-day.is-lit,
html.bs-reduced-motion .calendar-slip,
html.bs-reduced-motion .calendar-slip__arrow { transition: none; }
html.bs-reduced-motion .calendar-month:hover { transform: none; }
html.bs-reduced-motion .calendar-day.is-lit:nth-child(3n + 1),
html.bs-reduced-motion .calendar-day.is-lit:nth-child(3n + 2) { transform: none; }
</style>
