import { sveltePreprocess } from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: [
    sveltePreprocess({
      typescript: true,
      scss: {
        includePaths: ['src'],
      },
    }),
    vitePreprocess(),
  ],
  compilerOptions: {
    enableSourcemap: true,
  },
};
