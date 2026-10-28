const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL) || Boolean(process.env.RAILWAY_ENVIRONMENT) || Boolean(process.env.RENDER);
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const publicApiBase = process.env.NUXT_PUBLIC_API_BASE || (isProd ? 'https://api.ojaly.org/api/v1' : 'http://localhost:4100/api/v1');
const publicAppUrl = process.env.NUXT_PUBLIC_APP_URL || vercelUrl || (isProd ? 'https://ojaly.org' : 'http://localhost:3100');

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['@fontsource-variable/space-grotesk/index.css', '@fontsource-variable/dm-sans/index.css', '~/assets/css/main.css'],
  runtimeConfig: { public: { apiBase: publicApiBase, appUrl: publicAppUrl } },
  app: {
    head: {
      htmlAttrs: { lang: 'en-NG' },
      title: 'Ojaly Control Room',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#08110D' },
        { name: 'robots', content: 'noindex,nofollow' },
        { name: 'description', content: 'Internal Ojaly platform operations console.' },
      ],
      link: [{ rel: 'manifest', href: '/manifest.webmanifest' }, { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }, { rel: 'apple-touch-icon', href: '/pwa-192.png' }],
    },
  },
  routeRules: { '/**': { ssr: false, headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } } },
  tailwindcss: { cssPath: '~/assets/css/main.css', configPath: '~/tailwind.config.ts', viewer: false },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Ojaly Control Room', short_name: 'Ojaly Admin', theme_color: '#08110D', background_color: '#08110D',
      display: 'standalone', start_url: '/', scope: '/', icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'] },
    devOptions: { enabled: false },
  },
  typescript: { strict: true, typeCheck: false },
});
