/// <reference types="vite/client" />

declare module 'regl' {
  interface Regl {
    (options: any): any;
    texture(options?: any): any;
    clear(options: any): void;
    frame(callback: () => void): { cancel(): void };
    destroy(): void;
    context(name: string): any;
    prop(name: string): any;
  }

  function createREGL(options?: any): Regl;
  export = createREGL;
}

declare module '*.vert?raw' {
  const content: string;
  export default content;
}

declare module '*.frag?raw' {
  const content: string;
  export default content;
}

declare module '*.glsl?raw' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

export interface VideoTextureData {
  texture: Texture2D;
  video: HTMLVideoElement;
}

export interface ImageTextureLoader {
  (url: string, reglInstance: createREGL.Regl): Promise<Texture2D>;
}

export interface VideoTextureLoader {
  (
    url: string,
    videoPlaybackRate: number,
    reglInstance: createREGL.Regl
  ): Promise<VideoTextureData>;
}

declare module 'flubber' {
  export function interpolate(
    fromPath: string,
    toPath: string,
    options?: {
      maxSegmentLength?: number;
      string?: boolean;
    }
  ): (t: number) => string;
}
