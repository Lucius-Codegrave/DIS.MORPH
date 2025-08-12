<script lang="ts">
  import { onMount } from 'svelte';
  import { star } from 'src/lib/stores/luckyStar.store';
  import { TextScrollerCanvas2D } from './TextScroller';

  let textCanvas: HTMLCanvasElement | null = null;
  let overlayCanvas: HTMLCanvasElement;
  let animationFrame: number;
  let scrollSpeed = 3;
  let backgroundVisible = true;
  let backgroundInterval: ReturnType<typeof setInterval> | null = null;

  $: isStarActive = $star.active;

  $: {
    if (isStarActive) {
      updateBackgroundBlink();
    } else {
      if (backgroundInterval) {
        clearInterval(backgroundInterval);
        backgroundInterval = null;
        backgroundVisible = true;
      }
    }
  }

  function updateBackgroundBlink() {
    if (backgroundInterval) clearInterval(backgroundInterval);
    backgroundInterval = setInterval(() => {
      backgroundVisible = !backgroundVisible;
    }, 200);
  }

  function handleExposeBufferCanvas(canvas: HTMLCanvasElement) {
    textCanvas = canvas;
  }

  function drawOverlay() {
    if (textCanvas && overlayCanvas) {
      const ctx = overlayCanvas.getContext('2d');
      if (ctx) {
        overlayCanvas.width = textCanvas.width;
        overlayCanvas.height = textCanvas.height;
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        ctx.drawImage(textCanvas, 0, 0);
      }
    }
    animationFrame = requestAnimationFrame(drawOverlay);
  }

  function handleMouseEnter() {
    scrollSpeed = 1;
  }
  function handleMouseLeave() {
    scrollSpeed = 3;
  }

  onMount(() => {
    drawOverlay();
    updateBackgroundBlink();
    return () => {
      cancelAnimationFrame(animationFrame);
      if (backgroundInterval) clearInterval(backgroundInterval);
    };
  });
</script>

<button
  type="button"
  class="screen-canvas-container"
  class:background-visible={backgroundVisible}
  aria-pressed={$star.active}
  on:click={() => star.setActive(!$star.active)}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      star.setActive(!$star.active);
      e.preventDefault();
    }
  }}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <svg
    class="background-circle"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid meet"
    style="width:90%;height:90%;top:5%;left:5%;opacity:{isStarActive ? 1 : 0};"
  >
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="none"
      stroke="rgba(255,0,43,0.7)"
      stroke-width="4"
    />
  </svg>
  <TextScrollerCanvas2D
    exposeBufferCanvas={handleExposeBufferCanvas}
    fontSize={10}
    lineHeight={10}
    {scrollSpeed}
  />
  <canvas bind:this={overlayCanvas} class="screen-canvas"></canvas>
</button>

<style lang="scss">
  .screen-canvas-container {
    background: rgba(255, 0, 43, 0);
    transition: background-color 0.1s ease;
    pointer-events: auto;
    z-index: 9999;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    border: none;
    padding: 0;
    margin: 0;
    outline: none;
    background-clip: padding-box;
    font: inherit;
    color: inherit;
    box-shadow: none;
    appearance: none;
    -webkit-appearance: none;
    display: block;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &.background-visible {
      // background: rgba(255, 0, 43, 1);
      background: rgb(179 179 179);
    }
  }
  .screen-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  .background-circle {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    display: block;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
