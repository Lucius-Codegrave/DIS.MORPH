/**
 * Creates a resize handler for a given HTMLCanvasElement that automatically
 * resizes the canvas to match its parent element's dimensions.
 *
 * The handler uses a combination of `ResizeObserver` and `requestAnimationFrame`
 * to efficiently update the canvas size whenever its parent element is resized,
 * or when the window is resized.
 */
export function createResizeHandler(canvas: HTMLCanvasElement) {
  let lastWidth = 0;
  let lastHeight = 0;
  let resizeRafId: number | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const resizeLoop = () => {
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w !== lastWidth || h !== lastHeight) {
      canvas.width = w;
      canvas.height = h;
      lastWidth = w;
      lastHeight = h;
    }
    resizeRafId = requestAnimationFrame(resizeLoop);
  };

  const start = () => {
    if (resizeRafId === null) {
      resizeLoop();
    }
  };

  const handleResize = () => {
    start();
  };

  if (canvas.parentElement) {
    resizeObserver = new ResizeObserver(() => {
      start();
    });
    resizeObserver.observe(canvas.parentElement);
  }

  window.addEventListener('resize', handleResize);

  start();

  return {
    stop: () => {
      if (resizeRafId !== null) {
        cancelAnimationFrame(resizeRafId);
        resizeRafId = null;
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      window.removeEventListener('resize', handleResize);
    },
  };
}
