import type { DrawCommand, Regl, Texture } from 'regl';
import { drawTextToCanvas } from './drawText.util';
import type { DrawConfig, DrawContext } from './drawText.util';

export type renderWebGLArgs = {
  webgl: webGLParams;
  ctx: DrawContext;
  config: DrawConfig;
  isActive: boolean;
};

export type webGLParams = {
  reglInstance: Regl;
  webglTexture: DrawCommand;
  webglCanvas: HTMLCanvasElement;
  bufferTexture: Texture | null;
  transitionValue: number;
};

export function renderWebGL(args: renderWebGLArgs): Texture | null {
  const {
    webgl: {
      reglInstance,
      webglTexture,
      webglCanvas,
      bufferTexture,
      transitionValue,
    },
    ctx,
    config,
    isActive,
  } = args;
  const { bufferCanvas, bufferCtx } = ctx;

  drawTextToCanvas(ctx, config, isActive);

  let texture = bufferTexture;
  if (bufferCanvas.width > 0 && bufferCanvas.height > 0) {
    if (
      !texture ||
      texture.width !== bufferCanvas.width ||
      texture.height !== bufferCanvas.height
    ) {
      if (texture) {
        (texture as any).destroy?.();
      }
      texture = reglInstance.texture({
        data: bufferCanvas,
        width: bufferCanvas.width,
        height: bufferCanvas.height,
        flipY: true,
        min: 'linear',
        mag: 'linear',
        wrap: 'clamp',
      });
    } else {
      try {
        (texture as any).subimage({
          data: bufferCanvas,
          x: 0,
          y: 0,
          width: bufferCanvas.width,
          height: bufferCanvas.height,
        });
      } catch (error) {
        console.warn(
          'Failed to update texture with subimage, recreating:',
          error
        );
        if (texture) {
          (texture as any).destroy?.();
        }
        texture = reglInstance.texture({
          data: bufferCanvas,
          width: bufferCanvas.width,
          height: bufferCanvas.height,
          flipY: true,
          min: 'linear',
          mag: 'linear',
          wrap: 'clamp',
        });
      }
    }
  }

  reglInstance.clear({ color: [0, 0, 0, 0], depth: 1 });
  if (texture && bufferCanvas.width > 0 && bufferCanvas.height > 0) {
    webglTexture({
      tex: texture,
      is_active: isActive,
      transition: transitionValue,
    });
  }
  return texture ?? null;
}
