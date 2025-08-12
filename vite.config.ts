import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import path from 'path';

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
    }),
  ],
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  base: '/DIS.MORPH/',
});
