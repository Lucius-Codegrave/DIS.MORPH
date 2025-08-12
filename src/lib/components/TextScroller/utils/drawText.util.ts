import { scssVars } from 'src/lib/utils/scss-vars.util';

export type RenderMode = 'default' | 'active' | 'unique';

export type DrawConfig = {
  fontSize: number;
  lineHeight: number;
  scrollSpeed: number;
  fontFamily: string;
  textOpacity: number;
  textColor: string;
  linesCount: number;
  lineOffsets: number[];
  lineSpeeds: number[];
  linesArray: { text: string; key: string }[][];
};

export type DrawContext = {
  bufferCtx: CanvasRenderingContext2D;
  bufferCanvas: HTMLCanvasElement;
};

/**
 * Determines the render mode for a given line based on its content and active state.
 */
export function getLineRenderMode(
  line: { text: string; key: string }[],
  isActive: boolean
): RenderMode {
  if (isActive) {
    return line.some((e) => e.key === 'unique' || e.key === 'en')
      ? 'unique'
      : 'active';
  }
  return 'default';
}

type PhraseRenderer = {
  getStyle: (config: DrawConfig) => { fillStyle: string; globalAlpha: number };
};

const defaultPhraseRenderer: PhraseRenderer = {
  getStyle: (config) => ({
    fillStyle: config.textColor,
    globalAlpha: config.textOpacity - 0.1,
  }),
};
const activePhraseRenderer: PhraseRenderer = {
  getStyle: (config) => ({
    fillStyle: config.textColor,
    globalAlpha: config.textOpacity,
  }),
};
const uniquePhraseRenderer: PhraseRenderer = {
  getStyle: (config) => ({
    fillStyle: scssVars.textColorSecondary,
    globalAlpha: config.textOpacity + 0.5,
  }),
};

/**
 * Returns a phrase renderer function based on the specified render mode.
 */
function getPhraseRenderer(renderMode: RenderMode): PhraseRenderer {
  if (renderMode === 'unique') return uniquePhraseRenderer;
  if (renderMode === 'active') return activePhraseRenderer;
  return defaultPhraseRenderer;
}

/**
 * Draws a phrase onto a canvas context using the specified configuration and render mode.
 */
function drawPhrase(
  bufferCtx: CanvasRenderingContext2D,
  config: DrawConfig,
  text: string,
  x: number,
  y: number,
  renderMode: RenderMode
) {
  const renderer = getPhraseRenderer(renderMode);
  const style = renderer.getStyle(config);
  bufferCtx.fillStyle = style.fillStyle;
  bufferCtx.globalAlpha = style.globalAlpha;
  bufferCtx.fillText(text, x, y);
}

/**
 * Calculates the scroll speed based on the rendering mode and configuration.
 */
function getScrollSpeed(renderMode: RenderMode, config: DrawConfig): number {
  return renderMode === 'unique' ? config.scrollSpeed * 4 : config.scrollSpeed;
}

/**
 * Draws a horizontally scrolling line of text phrases on a canvas context, with alternating scroll directions per line.
 *
 * Each line consists of multiple text entries separated by a phrase separator. The line scrolls at a speed determined by its
 * configuration and render mode, and repeats seamlessly to create a continuous scrolling effect. The function handles both
 * left-to-right and right-to-left scrolling based on the line index.
 */
function drawLine(
  bufferCtx: CanvasRenderingContext2D,
  width: number,
  lineOffsets: number[],
  lineSpeeds: number[],
  config: DrawConfig,
  lineEntries: { text: string; key: string }[],
  y: number,
  i: number,
  isActive: boolean
) {
  const direction = i % 2 === 0 ? 1 : -1;
  const phraseSeparator = ' - ';
  const phraseWidths = lineEntries.map(
    (e) => bufferCtx.measureText(e.text).width
  );
  const separatorWidth = bufferCtx.measureText(phraseSeparator).width;
  const lineTextWidth = phraseWidths.reduce(
    (acc, w, idx) => acc + w + (idx > 0 ? separatorWidth : 0),
    0
  );
  const renderMode = getLineRenderMode(lineEntries, isActive);
  const effectiveScrollSpeed = getScrollSpeed(renderMode, config);
  lineOffsets[i] += effectiveScrollSpeed * lineSpeeds[i] * direction;
  const repeats = Math.ceil((width + lineTextWidth) / lineTextWidth) + 1;
  for (let repeat = 0; repeat < repeats; repeat++) {
    let x = lineOffsets[i] + repeat * lineTextWidth;
    if (direction > 0 && x > width + lineTextWidth) {
      lineOffsets[i] = -lineTextWidth;
      x = lineOffsets[i] + repeat * lineTextWidth;
    } else if (direction < 0 && x < -lineTextWidth * 2) {
      lineOffsets[i] = width;
      x = lineOffsets[i] + repeat * lineTextWidth;
    }
    if (x > -lineTextWidth && x < width + lineTextWidth) {
      let phraseX = x;
      for (let j = 0; j < lineEntries.length; j++) {
        const entry = lineEntries[j];
        drawPhrase(bufferCtx, config, entry.text, phraseX, y, renderMode);
        phraseX += phraseWidths[j];
        if (j < lineEntries.length - 1) {
          bufferCtx.fillStyle = config.textColor;
          bufferCtx.globalAlpha = config.textOpacity;
          bufferCtx.fillText(phraseSeparator, phraseX, y);
          phraseX += separatorWidth;
        }
      }
    }
  }
}

/**
 * Draws multiple lines of text onto a buffer canvas context, applying scrolling offsets and speeds.
 *
 * This function prepares the buffer canvas, sets up font and baseline, and iterates over the visible lines,
 * drawing each line using the provided configuration and context. It supports dynamic line offsets and speeds,
 * and can render in an "active" state.
 */
export function drawTextToCanvas(
  ctx: DrawContext,
  config: DrawConfig,
  isActive: boolean
) {
  const { bufferCtx, bufferCanvas } = ctx;
  const { width, height } = bufferCanvas;
  const { linesArray, lineOffsets, lineSpeeds } = config;
  if (bufferCanvas.height !== height) bufferCanvas.height = height;
  if (!bufferCtx) return;
  bufferCtx.save();
  bufferCtx.clearRect(0, 0, width, height);
  bufferCtx.restore();
  bufferCtx.save();
  bufferCtx.font = `${config.fontSize}px '${config.fontFamily}', monospace`;
  bufferCtx.textBaseline = 'middle';
  const linesOnScreen = Math.ceil(height / config.lineHeight) + 2;
  for (let i = 0; i < linesOnScreen; i++) {
    const lineIndex = i % linesArray.length;
    const lineEntries = linesArray[lineIndex];
    const y = i * config.lineHeight + config.lineHeight / 2;
    drawLine(
      bufferCtx,
      width,
      lineOffsets,
      lineSpeeds,
      config,
      lineEntries,
      y,
      i,
      isActive
    );
  }
  bufferCtx.restore();
}
