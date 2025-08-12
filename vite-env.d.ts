/// <reference types="vite/client" />

// Shader file imports for Vite
declare module '*.vert?raw' {
  const vertShader: string;
  export default vertShader;
}

declare module '*.frag?raw' {
  const fragShader: string;
  export default fragShader;
}

declare module '*.glsl?raw' {
  const glslShader: string;
  export default glslShader;
}

declare module '*.vs?raw' {
  const vertexShader: string;
  export default vertexShader;
}

declare module '*.fs?raw' {
  const fragmentShader: string;
  export default fragmentShader;
}
