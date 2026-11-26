// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://herjy6372.github.io',
  base: '/blog',
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: {
    // CSS를 별도 파일로 내보내 CSP(style-src 'self')와 캐시에 유리하게
    inlineStylesheets: 'never',
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});
