<template>
  <!-- A small CSS-drawn creature for the 404 page. The technique — stacked
       divs, border-radius blobs and keyframed eyebrows — is carried over from
       the legacy zombie.vue easter egg, rebuilt at page scale instead of the
       full-screen loading splash so it can live inside the layout. -->
  <div class="lost-sprite" aria-hidden="true">
    <div class="lost-sprite__body">
      <div class="lost-sprite__ear lost-sprite__ear--left"></div>
      <div class="lost-sprite__ear lost-sprite__ear--right"></div>
      <div class="lost-sprite__head">
        <div class="lost-sprite__eye lost-sprite__eye--left">
          <i class="lost-sprite__brow"></i>
        </div>
        <div class="lost-sprite__eye lost-sprite__eye--right">
          <i class="lost-sprite__brow"></i>
        </div>
        <div class="lost-sprite__blush lost-sprite__blush--left"></div>
        <div class="lost-sprite__blush lost-sprite__blush--right"></div>
        <div class="lost-sprite__mouth"></div>
      </div>
    </div>
    <span class="lost-sprite__question">?</span>
    <span class="lost-sprite__spark lost-sprite__spark--one">✦</span>
    <span class="lost-sprite__spark lost-sprite__spark--two">✧</span>
  </div>
</template>

<style scoped>
.lost-sprite { position: relative; width: 9rem; height: 9rem; margin: 0 auto 1.4rem; }

.lost-sprite__body { position: absolute; inset: 1.4rem .8rem 0; border: 2px solid var(--bs-ink-line, #392d4f); border-radius: 44% 44% 46% 46% / 52% 52% 48% 48%; background: linear-gradient(160deg, var(--bs-mint, #9ee6d0), var(--bs-lilac, #b9a7ff)); box-shadow: 4px 4px 0 var(--bs-ink-line, #392d4f); animation: sprite-bob 3.4s ease-in-out infinite; }

.lost-sprite__ear { position: absolute; top: -1.15rem; width: 2.1rem; height: 2.3rem; border: 2px solid var(--bs-ink-line, #392d4f); background: linear-gradient(160deg, var(--bs-pink, #ff8fb3), var(--bs-peach, #ffbd8a)); }
.lost-sprite__ear--left { left: .55rem; border-radius: 60% 40% 22% 22%; transform: rotate(-14deg); }
.lost-sprite__ear--right { right: .55rem; border-radius: 40% 60% 22% 22%; transform: rotate(14deg); }

.lost-sprite__head { position: absolute; inset: 1.1rem 1rem .9rem; }

.lost-sprite__eye { position: absolute; top: 1rem; width: .62rem; height: .78rem; border-radius: 50%; background: var(--bs-ink-line, #392d4f); animation: sprite-blink 4.6s infinite; }
.lost-sprite__eye--left { left: 1.5rem; }
.lost-sprite__eye--right { right: 1.5rem; }

.lost-sprite__brow { position: absolute; top: -.72rem; left: -.14rem; width: .9rem; height: .2rem; border-radius: 999px; background: var(--bs-ink-line, #392d4f); transform-origin: center; }
.lost-sprite__eye--left .lost-sprite__brow { animation: sprite-brow-left 4.6s ease-in-out infinite; }
.lost-sprite__eye--right .lost-sprite__brow { animation: sprite-brow-right 4.6s ease-in-out infinite; }

.lost-sprite__blush { position: absolute; top: 1.85rem; width: .8rem; height: .42rem; border-radius: 50%; background: rgba(255, 143, 179, .6); filter: blur(1.5px); }
.lost-sprite__blush--left { left: .95rem; }
.lost-sprite__blush--right { right: .95rem; }

.lost-sprite__mouth { position: absolute; bottom: 1rem; left: 50%; width: 1.1rem; height: .55rem; border-bottom: 2.5px solid var(--bs-ink-line, #392d4f); border-radius: 0 0 50% 50%; transform: translateX(-50%); }

.lost-sprite__question { position: absolute; top: -.2rem; right: 0; color: var(--bs-pink, #ff8fb3); font-size: 2rem; font-weight: 800; transform: rotate(12deg); animation: sprite-question 3s ease-in-out infinite; }
.lost-sprite__spark { position: absolute; color: var(--bs-peach, #ffbd8a); font-size: .9rem; animation: sprite-twinkle 3.6s ease-in-out infinite; }
.lost-sprite__spark--one { top: .6rem; left: -.4rem; }
.lost-sprite__spark--two { bottom: .4rem; right: -.2rem; color: var(--bs-lilac, #b9a7ff); animation-delay: -1.4s; }

@keyframes sprite-bob { 0%, 100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-.4rem) rotate(1.5deg); } }
@keyframes sprite-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.12); } }
@keyframes sprite-brow-left { 0%, 100% { transform: rotate(0deg); } 45% { transform: rotate(-16deg); } }
@keyframes sprite-brow-right { 0%, 100% { transform: rotate(0deg); } 45% { transform: rotate(16deg); } }
@keyframes sprite-question { 0%, 100% { transform: rotate(12deg) scale(1); opacity: .85; } 50% { transform: rotate(20deg) scale(1.12); opacity: 1; } }
@keyframes sprite-twinkle { 0%, 100% { opacity: .3; transform: scale(.8) rotate(0); } 50% { opacity: 1; transform: scale(1.2) rotate(18deg); } }

@media (prefers-reduced-motion: reduce) {
  .lost-sprite__body, .lost-sprite__eye, .lost-sprite__brow,
  .lost-sprite__question, .lost-sprite__spark { animation: none; }
}
</style>
