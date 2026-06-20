// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import markdoc from '@astrojs/markdoc';
import vercel from '@astrojs/vercel';

// Keystatic integration: Vite config + route injection
// Routes use prerender: false → deployed as Vercel Serverless Functions
/** @returns {import('astro').AstroIntegration} */
function keystatic() {
  return {
    name: 'keystatic',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig, config }) => {
        const keystaticConfigPlugin = {
          name: 'keystatic',
          /** @param {string} id */
          resolveId(id) {
            if (id === 'virtual:keystatic-config') {
              return new URL('./keystatic.config.ts', import.meta.url).pathname;
            }
            return null;
          },
        };

        updateConfig({
          server: config.server.host ? {} : { host: '127.0.0.1' },
          vite: {
            plugins: [keystaticConfigPlugin],
            optimizeDeps: {
              entries: ['keystatic.config.*'],
            },
          },
        });
        injectRoute({
          entrypoint: './src/keystatic/page.astro',
          pattern: '/keystatic/[...params]',
          prerender: false,
        });
        injectRoute({
          entrypoint: './src/keystatic/api.ts',
          pattern: '/api/keystatic/[...params]',
          prerender: false,
        });
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://www.sharpendmarketing.com',
  adapter: vercel(),
  redirects: {
    '/home-pages/home-v1': { status: 301, destination: '/' },
    '/home-pages/home-v2': { status: 301, destination: '/' },
    '/old-home': { status: 301, destination: '/' },
    '/contact-pages/contact': { status: 301, destination: '/contact' },
    '/contact-pages/contact-v1': { status: 301, destination: '/contact' },
    '/blog-pages/blog': { status: 301, destination: '/blog' },
    '/blog-pages/blog-v2': { status: 301, destination: '/blog' },
    '/blog-pages/blog-v3': { status: 301, destination: '/blog' },
    '/blog-category/seo': { status: 301, destination: '/blog' },
    '/blog/how-to-connect-with-your-audience': {
      status: 301,
      destination: '/blog/the-benefits-of-data-analytics-in-personalized-marketing',
    },
    '/blog/the-end-of-the-facebook-pixel-era-what-it-means-for-marketers': {
      status: 301,
      destination: '/blog/the-end-of-the-facebook-pixel-era',
    },
    '/blog/the-future-of-social-media-marketing': {
      status: 301,
      destination: '/blog/the-future-of-social-media-marketing-in-2025-and-beyond',
    },
    '/case-study/smartypantz': { status: 301, destination: '/case-studies/smartypantz' },
    '/case-study/jackstorms': { status: 301, destination: '/case-studies/jack-storms' },
    '/case-study/smithwood': { status: 301, destination: '/case-studies/smithwood-builders' },
    '/case-study/luxemart': { status: 301, destination: '/case-studies' },
    '/services/application-design': { status: 301, destination: '/services/ai-workflow' },
    '/services/search-engine-optimization': { status: 301, destination: '/services/seo' },
    '/services/social-media-management': { status: 301, destination: '/services/social-media' },
    '/services/service-single': { status: 301, destination: '/services' },
    '/team/chris-ricard': { status: 301, destination: '/about-us#team' },
    '/team/larry-toube': { status: 301, destination: '/about-us#team' },
  },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    react(),
    mdx(),
    markdoc(),
    keystatic(),
  ],
});
