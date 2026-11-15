<template>
  <div class="ambient-constellation" aria-hidden="true">
    <span class="ambient-constellation__halo"></span>
    <span class="ambient-constellation__orbit ambient-constellation__orbit--one"></span>
    <span class="ambient-constellation__orbit ambient-constellation__orbit--two"></span>
    <span class="ambient-constellation__star ambient-constellation__star--one">✦</span>
    <span class="ambient-constellation__star ambient-constellation__star--two">✧</span>
    <span class="ambient-constellation__star ambient-constellation__star--three">·</span>
    <span class="ambient-constellation__mascot">☾</span>
  </div>
</template>

<style scoped>
.ambient-constellation {
  position: fixed;
  top: 6.5rem;
  right: clamp(1rem, 4vw, 4rem);
  z-index: 0;
  width: 8rem;
  height: 8rem;
  pointer-events: none;
  opacity: 0.78;
  transform: rotate(-12deg);
}

.ambient-constellation__halo,
.ambient-constellation__orbit,
.ambient-constellation__star,
.ambient-constellation__mascot {
  position: absolute;
}

.ambient-constellation__halo {
  inset: 1.65rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 228, 138, 0.58), rgba(255, 143, 179, 0.06) 68%, transparent 72%);
  filter: blur(1px);
  animation: constellation-breathe 4.8s ease-in-out infinite;
}

.ambient-constellation__orbit {
  inset: 0.8rem;
  border: 1px solid rgba(185, 167, 255, 0.5);
  border-radius: 50%;
  transform: rotate(34deg) scaleY(0.45);
}

.ambient-constellation__orbit--two {
  inset: 1.35rem 0.3rem;
  border-color: rgba(255, 143, 179, 0.42);
  transform: rotate(-28deg) scaleY(0.4);
}

.ambient-constellation__star {
  color: #ffb977;
  font-family: Georgia, serif;
  font-size: 1.2rem;
  text-shadow: 0 0 14px rgba(255, 185, 119, 0.8);
  animation: constellation-twinkle 3s ease-in-out infinite;
}

.ambient-constellation__star--one { top: 0.15rem; left: 2.15rem; }
.ambient-constellation__star--two { right: 0.4rem; bottom: 1.75rem; color: #b9a7ff; animation-delay: -1.1s; }
.ambient-constellation__star--three { bottom: 0.45rem; left: 1.35rem; color: #9ee6d0; font-size: 2rem; animation-delay: -2.2s; }

.ambient-constellation__mascot {
  top: 2.2rem;
  left: 2.85rem;
  color: #6e5a86;
  font-size: 2.6rem;
  line-height: 1;
  text-shadow: 0 5px 0 rgba(255, 255, 255, 0.72), 0 8px 22px rgba(95, 66, 118, 0.2);
  animation: constellation-float 5.5s ease-in-out infinite;
}

@keyframes constellation-breathe {
  0%, 100% { transform: scale(0.92); opacity: 0.58; }
  50% { transform: scale(1.08); opacity: 0.86; }
}

@keyframes constellation-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.78) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.18) rotate(18deg); }
}

@keyframes constellation-float {
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50% { transform: translateY(-0.45rem) rotate(6deg); }
}

@media (max-width: 900px) {
  .ambient-constellation {
    top: 5rem;
    right: 0.25rem;
    opacity: 0.48;
    transform: scale(0.75) rotate(-12deg);
    transform-origin: top right;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-constellation__halo,
  .ambient-constellation__star,
  .ambient-constellation__mascot {
    animation: none;
  }
}
</style>
