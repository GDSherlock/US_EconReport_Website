import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { satteriCharts } from './src/lib/satteri-charts.mjs';

export default defineConfig({
  site: process.env.PAGES_SITE || undefined,
  base: process.env.PAGES_BASE_PATH || '/',
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  markdown: { shikiConfig: { theme: 'github-light' }, processor: satteri({mdastPlugins:[satteriCharts()]}) },
});
