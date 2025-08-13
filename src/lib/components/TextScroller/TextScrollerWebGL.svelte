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
  export let fontSize: number = 10;
  export let lineHeight: number = 10;
  export let scrollSpeed: number = 1;

  $: linesArray = generateLinesArray(linesCount);
  $: isStarActive = $star.active;
  $: transitionValue = $star.transition;

  const fontFamily = 'BIZ UDMincho';
  const textOpacity = 0.3;
  $: textColor = isStarActive ? 'rgba(0, 0, 0, 0.6)' : 'rgba(103, 114, 117, 0)';
  const linesCount = 80;

  let webglCanvas: HTMLCanvasElement;
  let bufferCanvas: HTMLCanvasElement;
  let gl: WebGLRenderingContext;
  let bufferCtx: CanvasRenderingContext2D;
  let reglInstance: regl.Regl | null = null;
  let webglTexture: regl.DrawCommand | null = null;
  let bufferTexture: regl.Texture | null = null;
  let animationId: number;
  let debounceTimeout: number | null = null;
  let isInitialized = false;
  let isAnimating = false;
  let lineOffsets: number[] = [];
  let lineSpeeds: number[] = [];
  let resizeHandler: (() => void) | null = null;
  let resizeObserver: ResizeObserver | null = null;

  function setupReglTexture() {
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
  }

  function cleanup() {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    resizeHandler = null;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = 0;
    }
    if (reglInstance) {
      reglInstance.destroy();
      reglInstance = null;
    }
    if (bufferTexture) {
      bufferTexture = null;
    }
    webglTexture = null;
    isInitialized = false;
    isAnimating = false;
  }

  function createResizeHandler() {
    let timeoutId1: number | null = null;
    let timeoutId2: number | null = null;

    function doResize() {
      if (webglCanvas && bufferCanvas && gl && linesCount) {
        resizeWebGL({
          webglCanvas,
          bufferCanvas,
          gl,
          linesCount,
          lineOffsets,
        });
      }
    }

    return () => {
      if (timeoutId1) clearTimeout(timeoutId1);
      if (timeoutId2) clearTimeout(timeoutId2);

      timeoutId1 = setTimeout(doResize, 0);
      timeoutId2 = setTimeout(doResize, 16);
    };
  }

  async function initializeWebGL() {
    if (isInitialized || !webglCanvas || !bufferCanvas) return;

    lineOffsets = linesArray.map(() => Math.random() * 1000);
    lineSpeeds = linesArray.map(() => Math.random() + 0.2);

    resizeHandler = createResizeHandler();

    gl = webglCanvas.getContext('webgl', {
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    })!;

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    reglInstance = regl(gl);
    const parentEl = webglCanvas?.parentElement;
    if (parentEl) {
      resizeObserver = new ResizeObserver(() => {
        resizeHandler?.();
      });
      resizeObserver.observe(parentEl);
    }

    resizeHandler();

    setupReglTexture();
    isInitialized = true;

    if (!isAnimating) {
      startAnimationLoop();
    }
  }

  function startAnimationLoop() {
    if (isAnimating || !reglInstance || !webglTexture) return;

    isAnimating = true;

    function renderLoop() {
      if (!isAnimating || !reglInstance || !webglTexture) return;

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
  }

  afterUpdate(() => {
    if (!bufferCtx && bufferCanvas) {
      bufferCtx = bufferCanvas.getContext('2d')!;
    }

    if (bufferCanvas && bufferCtx) {
      exposeBufferCanvas(bufferCanvas);

      if (!isInitialized) {
        initializeWebGL();
      }

      if (isInitialized && !isAnimating) {
        startAnimationLoop();
      }
    }
  });

  onDestroy(() => {
    isAnimating = false;
    cleanup();
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
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
