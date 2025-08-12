export { default as TextScrollerWebGL } from './TextScrollerWebGL.svelte';
export { default as TextScrollerCanvas2D } from './TextScrollerCanvas2D.svelte';
export { default as vertexShader } from './shaders/textscroll.vert?raw';
export { default as fragmentShader } from './shaders/textscroll.frag?raw';

export * from './utils/drawText.util';
export * from './data/lines.data';
export * from './utils/resizeHandler.util';
export * from './utils/webGLRender.util';
export * from './utils/lineGenerator.util';
