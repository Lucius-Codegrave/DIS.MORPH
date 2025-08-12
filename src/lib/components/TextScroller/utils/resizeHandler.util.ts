export type Canvas2DResizeHandlerConfig = {
  bufferCanvas: HTMLCanvasElement;
  linesCount: number;
  lineOffsets: number[];
};

export type WebGLResizeHandlerConfig = Canvas2DResizeHandlerConfig & {
  webglCanvas: HTMLCanvasElement;
  gl?: WebGLRenderingContext;
};

/**
 * Resizes a 2D canvas element to match the dimensions of its parent element and updates
 * the `lineOffsets` array with new random horizontal positions within the canvas width.
 */
export function resizeCanvas2D(config: Canvas2DResizeHandlerConfig) {
  const { bufferCanvas, lineOffsets } = config;
  const rect = bufferCanvas.parentElement?.getBoundingClientRect();
  if (!rect) return;
  bufferCanvas.width = rect.width;
  bufferCanvas.height = rect.height;
  for (let i = 0; i < lineOffsets.length; i++) {
    lineOffsets[i] = Math.random() * rect.width;
  }
}

/**
 * Resizes a WebGL canvas to match the dimensions of its parent element and updates the WebGL viewport accordingly.
 * Also triggers resizing of a 2D canvas if applicable.
 */
export function resizeWebGL(config: WebGLResizeHandlerConfig) {
  const { webglCanvas, gl } = config;
  const rect = webglCanvas.parentElement?.getBoundingClientRect();
  if (!rect) return;
  webglCanvas.width = rect.width;
  webglCanvas.height = rect.height;
  if (gl) gl.viewport(0, 0, rect.width, rect.height);
  resizeCanvas2D(config);
}
