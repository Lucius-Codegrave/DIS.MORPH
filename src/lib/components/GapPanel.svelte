<script lang="ts">
  // Nombre d'étoiles
  const starCount: number = 40;
  // Tableau des angles de rotation
  let rotations: number[] = Array(starCount).fill(0);
  let animationFrameId: number;

  import { star } from 'src/lib/stores/luckyStar.store';
  import { onMount } from 'svelte';

  let starsCanvas: HTMLCanvasElement;

  $: animateClass = $star.active ? 'animate-in' : 'animate-out';

  // Draw a pentagram at the specified position
  function drawPentagram(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    rotation: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const idx = (i * 2) % 5;
      const angle = -Math.PI / 2 + idx * ((2 * Math.PI) / 5);
      const px = r * Math.cos(angle);
      const py = r * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(103, 114, 117, 1)';
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.restore();
  }

  // Draw a line of stars across the canvas
  function drawStarsLine() {
    if (!starsCanvas) return;
    const ctx = starsCanvas.getContext('2d');
    if (!ctx) return;
    const r = 6;
    const width = (starsCanvas.width = 2 * r);
    const parentHeight = starsCanvas.parentElement?.clientHeight || 200;
    const height = (starsCanvas.height = parentHeight);
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < starCount; i++) {
      const x = width / 2;
      const y =
        starCount === 1
          ? height / 2
          : r + i * ((height - 2 * r) / (starCount - 1));
      drawPentagram(ctx, x, y, r, rotations[i]);
    }
  }

  function animateStars() {
    for (let i = 0; i < starCount; i++) {
      const rotationSpeedMs = 30;
      const rotationSpeed = rotationSpeedMs / 1000;
      rotations[i] += rotationSpeed;
    }
    drawStarsLine();
    animationFrameId = requestAnimationFrame(animateStars);
  }

  onMount(() => {
    drawStarsLine();
    animateStars();
    window.addEventListener('resize', drawStarsLine);
    return () => {
      window.removeEventListener('resize', drawStarsLine);
      cancelAnimationFrame(animationFrameId);
    };
  });
</script>

<button
  class="gap-text-container {animateClass}"
  aria-pressed={$star.active}
  on:click={() => star.setActive(!$star.active)}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      star.setActive(!$star.active);
      e.preventDefault();
    }
  }}
>
  <canvas bind:this={starsCanvas} class="stars-canvas"></canvas>
</button>

<style lang="scss">
  @use '../styles/base/fonts' as *;
  @use '../styles/abstracts/variables' as *;
  @keyframes slideInCenter {
    from {
      transform: translateY(100%) scale(0.8);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
  @keyframes slideOutCenter {
    from {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    to {
      transform: translateY(100%) scale(0.8);
      opacity: 0;
    }
  }

  .gap-text-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    flex: 1 1 auto;
    color: $text-color-secondary;
    overflow: hidden;
    font-size: 0.8rem;
    letter-spacing: 0.15em;
    font-family: 'GT America', sans-serif;
    writing-mode: sideways-lr;
    opacity: 0;
    transform: translateY(100%) scale(0.8);
    transition:
      opacity 0.3s,
      transform 0.3s;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    outline: none;
    box-shadow: none;
  }
  .gap-text-container.animate-in {
    animation: slideInCenter 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  .gap-text-container.animate-out {
    animation: slideOutCenter 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .stars-canvas {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    pointer-events: none;
    margin: 0 auto;
    width: unset !important;
    height: unset !important;
    max-width: none !important;
    max-height: none !important;
  }
</style>
