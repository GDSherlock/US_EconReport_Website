import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PAGES_SITE || undefined,
  base: process.env.PAGES_BASE_PATH || '/',
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  markdown: { shikiConfig: { theme: 'github-light' } },
});
