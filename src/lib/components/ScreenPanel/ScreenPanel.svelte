<script lang="ts">
  import { onMount } from 'svelte';
  import createREGL, { type Texture2D } from 'regl';
  import { star } from 'src/lib/stores/luckyStar.store';
  import { scssVars } from 'src/lib/utils/scss-vars.util';
  import {
    fragmentShader,
    loadImageTexture,
    loadVideoTexture,
    vertexShader,
    createResizeHandler,
    createRotationHandler,
  } from 'src/lib/components/ScreenPanel';
  import { lerpDisplacementStrength } from 'src/lib/utils/interpolation.util';
  import { TextScrollerWebGL } from 'src/lib/components/TextScroller';

  export let sizePercent = 1;
  export let baseRotationAngleY = -10;
  export let baseRotationAngleX = 0;
  export let maxRotationRangeY = 50;
  export let maxRotationRangeX = 30;
  export let rotationSmoothing = 0.05;
  export let baseDisplacementStrength = 1;
  export let showTextBackground = true;
  export let videoPlaybackRate = 5.0;
  export let isLeft = false;
  export let backgroundColor = 'white';

  $: isStarActive = $star.active;

  let canvas: HTMLCanvasElement;
  let regl: createREGL.Regl;
  let frame: { cancel(): void } | null = null;
  let resizeHandler: { stop(): void } | null = null;
  let displacementStrength = 1;

  const transitionDurationMs = scssVars.transitionNormal * 1000;

  const rotationHandler = createRotationHandler({
    baseRotationAngleX,
    baseRotationAngleY,
    maxRotationRangeX,
    maxRotationRangeY,
    rotationSmoothing,
  });

  onMount(() => {
    regl = createREGL({
      canvas: canvas,
      extensions: ['OES_standard_derivatives'],
    });

    resizeHandler = createResizeHandler(canvas);

    let videoTex: Texture2D,
      noiseTex: Texture2D,
      video: HTMLVideoElement,
      noiseVideo: HTMLVideoElement,
      displacementImageTex: Texture2D | null = null;

    Promise.all([
      loadVideoTexture(
        `${import.meta.env.BASE_URL}assets/video1.mp4`,
        videoPlaybackRate,
        regl
      ),
      loadVideoTexture(
        !isLeft
          ? `${import.meta.env.BASE_URL}assets/video1.mp4`
          : `${import.meta.env.BASE_URL}assets/fire1.mp4`,
        videoPlaybackRate,
        regl
      ),
      loadImageTexture(`${import.meta.env.BASE_URL}assets/red_star.png`, regl),
    ])
      .then(([videoData, noiseData, imageTex]) => {
        videoTex = videoData.texture;
        video = videoData.video;
        noiseTex = noiseData.texture;
        noiseVideo = noiseData.video;
        displacementImageTex = imageTex;
      })
      .catch((error) => {
        console.error('Error when loading element', error);
      });

    const drawDisplaced = regl({
      frag: fragmentShader,
      vert: vertexShader,
      uniforms: {
        u_video: (regl as any).prop('videoTexture'),
        u_noise: () => noiseTex,
        u_image: () => displacementImageTex,
        u_time: ({ time }: { time: number }) => Math.abs((time % 4) - 4),
        u_resolution: () => [canvas.width, canvas.height],
        u_video_size: (regl as any).prop('videoSize'),
        u_size_percent: () => sizePercent,
        u_rotation_angle_y: () => rotationHandler.currentRotationY,
        u_rotation_angle_x: () => rotationHandler.currentRotationX,
        u_displacement_strength: () =>
          baseDisplacementStrength * displacementStrength,
        u_star_active: () => (isStarActive ? 1 : 0),
        u_left: () => (isLeft ? 1 : 0),
        u_image_size: () =>
          displacementImageTex &&
          displacementImageTex.width &&
          displacementImageTex.height
            ? [displacementImageTex.width, displacementImageTex.height]
            : [1, 1],
        star_transition: () => $star.transition,
      },
      attributes: {
        position: () => {
          return [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [-1, 1],
            [1, -1],
            [1, 1],
          ];
        },
      },
      count: 6,
      viewport: {
        x: 0,
        y: 0,
        width: regl.context('viewportWidth') as any,
        height: regl.context('viewportHeight') as any,
      },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
      },
    });

    const render = () => {
      rotationHandler.updateCurrentRotations();

      const targetStrength = isStarActive ? 4 : 1;
      const frameDuration = 1000 / 60;
      displacementStrength = lerpDisplacementStrength(
        displacementStrength,
        targetStrength,
        frameDuration,
        transitionDurationMs
      );

      regl.clear({ color: [0, 0, 0, 0], depth: 1 });

      if (videoTex && noiseTex && video && noiseVideo) {
        try {
          videoTex({
            data: video,
            width: video.videoWidth,
            height: video.videoHeight,
          });
          noiseTex({
            data: noiseVideo,
            width: noiseVideo.videoWidth,
            height: noiseVideo.videoHeight,
          });
          drawDisplaced({
            videoTexture: videoTex,
            videoSize: [video.videoWidth, video.videoHeight],
          } as any);
        } catch (error) {
          console.error('Error updating video texture:', error);
        }
      }
    };

    window.addEventListener('mousemove', rotationHandler.handleMouseMove);
    window.addEventListener('touchmove', rotationHandler.handleTouchMove);

    frame = regl.frame(() => {
      render();
    });

    return () => {
      if (frame) frame.cancel();
      if (video) {
        video.pause();
        video.src = '';
        video.load();
        video.removeAttribute('src');
        video.remove();
      }
      if (noiseVideo) {
        noiseVideo.pause();
        noiseVideo.src = '';
        noiseVideo.load();
        noiseVideo.removeAttribute('src');
        noiseVideo.remove();
      }
      if (regl) regl.destroy();
      window.removeEventListener('mousemove', rotationHandler.handleMouseMove);
      window.removeEventListener('touchmove', rotationHandler.handleTouchMove);
      if (resizeHandler) resizeHandler.stop();
    };
  });
</script>

<div
  class="canvas-container {isLeft && !isStarActive
    ? 'shadow-inner-right'
    : ''} {!isLeft && isStarActive ? 'shadow-inner-left' : ''}"
  style="background: {backgroundColor};"
>
  {#if showTextBackground}
    <TextScrollerWebGL />
  {/if}
  <canvas bind:this={canvas} class="screen-canvas" />
</div>

<style lang="scss">
  @use '../../styles/abstracts/variables' as *;
  @use '../../styles/abstracts/mixins' as *;

  .canvas-container {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: $background-color-primary;
    transition: background $transition-normal;
    box-shadow:
      inset -16px 0 24px -8px rgba(0, 0, 0, 0.5),
      inset 16px 0 24px -8px rgba(0, 0, 0, 0.5);
  }

  .screen-canvas {
    @include webgl-canvas;
  }
</style>
