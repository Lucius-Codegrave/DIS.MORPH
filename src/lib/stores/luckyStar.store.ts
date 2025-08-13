import { writable } from 'svelte/store';

const TRANSITION_DURATION = 300;

function createStarStore() {
  const { subscribe, set } = writable({ active: false, transition: 1 });
  let animationFrame: number | null = null;
  let current = 1;
  let target = 1;
  let start = 1;
  let startTime = 0;
  let active = false;

  function animateTo(newTarget: number) {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    target = newTarget;
    start = current;
    startTime = performance.now();
    function step() {
      const now = performance.now();
      const elapsed = now - startTime;
      if (elapsed < TRANSITION_DURATION) {
        const t = elapsed / TRANSITION_DURATION;
        current = start + (target - start) * t;
        set({ active, transition: current });
        animationFrame = requestAnimationFrame(step);
      } else {
        current = target;
        set({ active, transition: current });
        animationFrame = null;
      }
    }
    step();
  }

  return {
    subscribe,
    setActive(newActive: boolean) {
      active = newActive;
      animateTo(active ? 1 : 0);
    },

    get value() {
      return { active, transition: current };
    },
  };
}

export const star = createStarStore();
