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

/**
 * Renders text onto a WebGL canvas using the provided rendering context and configuration.
 *
 * This function draws text to an offscreen buffer canvas, updates or creates a WebGL texture
 * from the buffer, and then renders it using the specified WebGL pipeline. It also handles
 * transitions and activation states for special effects.
 */
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
  const { bufferCanvas } = ctx;
  if (!reglInstance || !webglTexture || !webglCanvas || !bufferCanvas)
    return null;

  drawTextToCanvas(ctx, config, isActive);

  let texture = bufferTexture;
  if (bufferCanvas.width > 0 && bufferCanvas.height > 0) {
    if (
      !texture ||
      texture.width !== bufferCanvas.width ||
      texture.height !== bufferCanvas.height
    ) {
      texture = reglInstance.texture({
        data: bufferCanvas,
        width: bufferCanvas.width,
        height: bufferCanvas.height,
        flipY: true,
      });
    } else {
      (texture as any).subimage({
        data: bufferCanvas,
        width: bufferCanvas.width,
        height: bufferCanvas.height,
      });
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
