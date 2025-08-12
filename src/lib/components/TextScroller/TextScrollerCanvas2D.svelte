<script lang="ts">
  import { afterUpdate, onDestroy } from 'svelte';
  import { star } from 'src/lib/stores/luckyStar.store';
  import {
    generateLinesArray,
    resizeCanvas2D,
    drawTextToCanvas,
  } from 'src/lib/components/TextScroller';

  export let exposeBufferCanvas: (canvas: HTMLCanvasElement) => void = () => {};
  export let fontSize: number = 20;
  export let lineHeight: number = 20;
  export let scrollSpeed: number = 3;

  $: linesArray = generateLinesArray(linesCount);
  $: isStarActive = $star.active;

  const fontFamily = 'BIZ UDMincho';
  const textOpacity = 0.3;
  const textColor = 'black';
  const linesCount = 50;

  let bufferCanvas: HTMLCanvasElement;
  let bufferCtx: CanvasRenderingContext2D;
  let animationId: number;
  let animationStarted = false;
  let isInitializing = false;

  function startAnimationIfReady() {
    if (
      bufferCtx &&
      bufferCanvas &&
      bufferCanvas.width > 0 &&
      bufferCanvas.height > 0
    ) {
      if (!animationStarted) {
        animationStarted = true;
        let lineOffsets = linesArray.map(() => Math.random() * 1000);
        const lineSpeeds = linesArray.map(() => Math.random() + 0.2);

        const resizeHandler = () =>
          resizeCanvas2D({
            bufferCanvas,
            linesCount,
            lineOffsets,
          });
        window.addEventListener('resize', resizeHandler);
        resizeHandler();

        setTimeout(() => {
          isInitializing = false;
        }, 100);

        function renderLoop() {
          drawTextToCanvas(
            {
              bufferCanvas,
              bufferCtx,
            },
            {
              lineSpeeds,
              lineOffsets,
              linesArray,
              fontFamily,
              textOpacity,
              textColor,
              linesCount,
              fontSize,
              lineHeight,
              scrollSpeed,
            },
            isStarActive
          );
          animationId = requestAnimationFrame(renderLoop);
        }
        renderLoop();

        return () => {
          window.removeEventListener('resize', resizeHandler);
          if (animationId) cancelAnimationFrame(animationId);
        };
      }
    }
  }

  afterUpdate(() => {
    if (bufferCanvas && !bufferCtx) {
      bufferCtx = bufferCanvas.getContext('2d')!;
    }
    if (bufferCanvas) {
      exposeBufferCanvas(bufferCanvas);
    }
    if (!isInitializing) {
      startAnimationIfReady();
    }
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    animationStarted = false;
    isInitializing = false;
  });
</script>

<canvas bind:this={bufferCanvas} style="display:none;"></canvas>
