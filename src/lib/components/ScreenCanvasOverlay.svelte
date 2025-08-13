<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { interpolate } from 'flubber';
  import { gsap } from 'gsap';
  import { star } from 'src/lib/stores/luckyStar.store';
  import { TextScrollerCanvas2D } from './TextScroller';

  let textCanvas: HTMLCanvasElement | null = null;
  let overlayCanvas: HTMLCanvasElement;
  let animationFrame: number;
  let scrollSpeed = 3;
  let backgroundVisible = true;
  let backgroundInterval: ReturnType<typeof setInterval> | null = null;

  // Path du rond (SVG circle en path)
  const circlePath = 'M50,10 a40,40 0 1,0 0.00001,0';
  // Path de la barre horizontale
  const barPath = 'M20,50 L80,50';

  let svgEl: SVGSVGElement;
  let pathEl: SVGPathElement;
  let containerEl: HTMLButtonElement;
  let morphInterpolator: ((t: number) => string) | null = null;
  let morphState = 0; // 0 = rond, 1 = barre
  let isMorphing = false;

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
      // Animation GSAP du background
      if (containerEl) {
        gsap.to(containerEl, {
          backgroundColor: 'rgba(255, 0, 43, 0.7)',
          duration: 0.1,
          ease: 'none',
        });
      }
    }
  }

  function updateBackgroundBlink() {
    if (backgroundInterval) clearInterval(backgroundInterval);
    backgroundInterval = setInterval(() => {
      if (containerEl) {
        const currentBg = backgroundVisible
          ? 'rgba(255, 0, 43, 0.9)'
          : 'rgba(255, 0, 43, 0)';

        gsap.to(containerEl, {
          backgroundColor: currentBg,
          duration: 0.1,
          ease: 'none',
        });
      }
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

  function morphTo(target: 0 | 1) {
    isMorphing = true;
    const start = performance.now();
    const duration = 400;
    function animate(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      pathEl.setAttribute(
        'd',
        target === 1 ? morphInterpolator!(eased) : morphInterpolator!(1 - eased)
      );
      if (t < 1) requestAnimationFrame(animate);
      else {
        morphState = target;
        isMorphing = false;
      }
    }
    requestAnimationFrame(animate);

    // Animation GSAP de l'opacité séparée
    gsap.to(svgEl, {
      opacity: target === 1 ? 1 : 0,
      duration: 0.4,
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    });
  }

  // Morph automatique à chaque changement d'état
  afterUpdate(() => {
    if (!isMorphing && morphInterpolator && pathEl) {
      if (isStarActive && morphState === 0) {
        morphTo(1);
      } else if (!isStarActive && morphState === 1) {
        morphTo(0);
      }
    }
  });

  onMount(() => {
    drawOverlay();
    updateBackgroundBlink();
    // Initialiser l'interpolateur Flubber
    morphInterpolator = interpolate(barPath, circlePath, {
      maxSegmentLength: 2,
    });
    if (pathEl) pathEl.setAttribute('d', barPath);
    // Initialiser l'opacité selon l'état initial
    if (svgEl) svgEl.style.opacity = '0';
    return () => {
      cancelAnimationFrame(animationFrame);
      if (backgroundInterval) clearInterval(backgroundInterval);
    };
  });
</script>

<button
  bind:this={containerEl}
  type="button"
  class="screen-canvas-container"
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
    bind:this={svgEl}
    class="background-circle"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid meet"
    style="width:90%;height:90%;top:5%;left:5%;opacity:0;"
  >
    <path
      bind:this={pathEl}
      d={barPath}
      stroke="rgba(103, 114, 117, 0)"
      stroke-width="2"
      fill="none"
      style="filter: invert(1);"
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
  }
  .screen-canvas {
    display: block;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  .background-circle {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    display: block;
  }
</style>
