import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import svelteConfig from './svelte.config';
import path from 'path';

export default defineConfig({
  plugins: [svelte(svelteConfig)],
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
});
