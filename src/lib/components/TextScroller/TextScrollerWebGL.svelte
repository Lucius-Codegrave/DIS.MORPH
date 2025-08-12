<script lang="ts">
  import { afterUpdate, onDestroy } from 'svelte';
  import regl from 'regl';
  import {
    vertexShader,
    fragmentShader,
    renderWebGL,
    resizeWebGL,
  } from 'src/lib/components/TextScroller';
  import { star } from 'src/lib/stores/luckyStar.store';
  import { generateLinesArray } from 'src/lib/components/TextScroller';

  export let exposeBufferCanvas: (canvas: HTMLCanvasElement) => void = () => {};
  export let fontSize: number = 20;
  export let lineHeight: number = 20;
  export let scrollSpeed: number = 3;

  $: linesArray = generateLinesArray(linesCount);
  $: isStarActive = $star.active;
  $: transitionValue = $star.transition;

  const fontFamily = 'BIZ UDMincho';
  const textOpacity = 0.3;
  const textColor = 'black';
  const linesCount = 50;

  let webglCanvas: HTMLCanvasElement;
  let bufferCanvas: HTMLCanvasElement;
  let gl: WebGLRenderingContext;
  let bufferCtx: CanvasRenderingContext2D;
  let reglInstance: regl.Regl | null = null;
  let webglTexture: regl.DrawCommand | null = null;
  let bufferTexture: regl.Texture | null = null;
  let animationId: number;
  let animationStarted = false;
  let isInitializing = false;
  let lastTransitionValue = -1;
  let debounceTimeout: number | null = null;

  /**
   * Reactive block that manages initialization and cleanup based on changes in `transitionValue`.
   * - When `transitionValue` transitions from <= 0 to > 0 and not initializing, triggers a debounced initialization via `forceInitialization()`.
   * - If a debounce timeout is already set, it is cleared before setting a new one.
   * - When `transitionValue` transitions from > 0 to <= 0, any pending debounce timeout is cleared to prevent unwanted initialization.
   * - Updates `lastTransitionValue` to track previous state for transition detection.
   */
  $: {
    if (transitionValue > 0 && lastTransitionValue <= 0 && !isInitializing) {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = setTimeout(() => {
        forceInitialization();
        debounceTimeout = null;
      }, 100);
    }

    if (transitionValue <= 0 && lastTransitionValue > 0) {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
        debounceTimeout = null;
      }
    }
    lastTransitionValue = transitionValue;
  }

  // TODO simplify this mess
  /**
   * Forces the initialization of the buffer and WebGL canvases based on the parent element's size.
   * - Checks if initialization is already in progress to prevent re-entry.
   * - If the parent element's dimensions are available, resizes the canvases and restarts the animation.
   * - If dimensions are not available, retries after a short delay.
   * - Cancels any ongoing animation before resizing.
   * - Ensures initialization state is properly managed.
   */
  function forceInitialization() {
    if (isInitializing) return;
    if (bufferCtx && bufferCanvas && bufferCanvas.parentElement) {
      isInitializing = true;
      const rect = bufferCanvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (animationStarted && animationId) {
          cancelAnimationFrame(animationId);
          animationStarted = false;
        }
        bufferCanvas.width = rect.width;
        bufferCanvas.height = rect.height;
        if (webglCanvas) {
          webglCanvas.width = rect.width;
          webglCanvas.height = rect.height;
        }
        startAnimationIfReady();
        isInitializing = false;
      } else {
        setTimeout(() => {
          const rect2 = bufferCanvas.parentElement?.getBoundingClientRect();
          if (rect2 && rect2.width > 0 && rect2.height > 0) {
            if (animationStarted && animationId) {
              cancelAnimationFrame(animationId);
              animationStarted = false;
            }
            bufferCanvas.width = rect2.width;
            bufferCanvas.height = rect2.height;
            if (webglCanvas) {
              webglCanvas.width = rect2.width;
              webglCanvas.height = rect2.height;
            }
            startAnimationIfReady();
          }
          isInitializing = false;
        }, 400);
      }
    } else {
      isInitializing = false;
    }
  }

  function setupReglTexture() {
    setTimeout(() => {
      if (reglInstance == null) {
        throw new Error('reglInstance is not initialized');
      }
      webglTexture = reglInstance({
        frag: fragmentShader,
        vert: vertexShader,
        attributes: {
          position: [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
          ],
        },
        elements: [
          [0, 1, 2],
          [2, 3, 0],
        ],
        uniforms: {
          tex: (reglInstance as any).prop('tex'),
          is_active: (reglInstance as any).prop('is_active'),
          transition: (reglInstance as any).prop('transition'),
        },
      });
    }, 0);
  }

  function cleanup(resizeHandler: () => void) {
    window.removeEventListener('resize', resizeHandler);
    if (animationId) cancelAnimationFrame(animationId);
    if (reglInstance) reglInstance.destroy();
  }

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

        let resizeHandler = () =>
          resizeWebGL({
            webglCanvas,
            bufferCanvas,
            gl,
            linesCount: linesCount,
            lineOffsets,
          });

        requestAnimationFrame(() => {
          gl = webglCanvas.getContext('webgl', {
            premultipliedAlpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: 'default',
          })!;
          reglInstance = regl(gl);
          setupReglTexture();
        });

        window.addEventListener('resize', resizeHandler);
        resizeHandler();

        setTimeout(() => {
          isInitializing = false;
        }, 100);

        function renderLoop() {
          if (!reglInstance || !webglTexture) {
            animationId = requestAnimationFrame(renderLoop);
            return;
          }
          bufferTexture = renderWebGL({
            webgl: {
              reglInstance,
              webglTexture,
              webglCanvas,
              bufferTexture,
              transitionValue,
            },
            ctx: {
              bufferCanvas,
              bufferCtx,
            },
            config: {
              fontSize,
              lineHeight,
              scrollSpeed,
              fontFamily,
              textOpacity,
              textColor,
              linesCount,
              linesArray,
              lineOffsets,
              lineSpeeds,
            },
            isActive: isStarActive,
          });
          animationId = requestAnimationFrame(renderLoop);
        }
        renderLoop();
        return () => cleanup(resizeHandler);
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
    if (reglInstance) {
      reglInstance.destroy();
    }
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    animationStarted = false;
    isInitializing = false;
  });
</script>

<canvas bind:this={webglCanvas} class="background-canvas"></canvas>
<canvas bind:this={bufferCanvas} style="display:none;"></canvas>

<style lang="scss">
  @use '../../styles/abstracts/variables' as *;
  @use '../../styles/abstracts/mixins' as *;

  .background-canvas {
    @include webgl-canvas;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
</style>
