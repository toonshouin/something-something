import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ runtime: 'nodejs22.x' }),
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'base-uri': ['none'],
        'connect-src': ['self'],
        'font-src': ['self'],
        'form-action': ['none'],
        'frame-ancestors': ['none'],
        'img-src': ['self', 'data:'],
        'object-src': ['none'],
        'script-src': ['self'],
        'style-src': ['self']
      }
    }
  }
};

export default config;
