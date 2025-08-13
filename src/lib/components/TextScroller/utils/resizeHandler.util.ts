export type Canvas2DResizeHandlerConfig = {
  bufferCanvas: HTMLCanvasElement;
  linesCount: number;
  lineOffsets: number[];
};

export type WebGLResizeHandlerConfig = Canvas2DResizeHandlerConfig & {
  webglCanvas: HTMLCanvasElement;
  gl?: WebGLRenderingContext;
};

export function resizeCanvas2D(config: Canvas2DResizeHandlerConfig) {
  const { bufferCanvas, lineOffsets } = config;
  const rect = bufferCanvas.parentElement?.getBoundingClientRect();
  if (!rect) return;

  const displayWidth = Math.floor(rect.width);
  const displayHeight = Math.floor(rect.height);

  bufferCanvas.width = displayWidth;
  bufferCanvas.height = displayHeight;

  // for (let i = 0; i < lineOffsets.length; i++) {
  //   lineOffsets[i] = Math.random() * displayWidth;
  // }
}

export function resizeWebGL(config: WebGLResizeHandlerConfig) {
  const { webglCanvas, gl } = config;
  const rect = webglCanvas.parentElement?.getBoundingClientRect();
  if (!rect) return;
  webglCanvas.width = rect.width;
  webglCanvas.height = rect.height;
  if (gl) gl.viewport(0, 0, rect.width, rect.height);
  resizeCanvas2D(config);
}
