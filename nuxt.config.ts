const vercelBuild = Boolean(process.env.VERCEL);
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const publicApiBase = process.env.NUXT_PUBLIC_API_BASE || (vercelBuild ? 'https://api.bossly.ng/api/v1' : 'http://localhost:4100/api/v1');
const publicAppUrl = process.env.NUXT_PUBLIC_APP_URL || vercelUrl || (vercelBuild ? 'https://bossly.ng' : 'http://localhost:3100');

if (vercelBuild) {
  if (!/^https:\/\//.test(publicApiBase)) console.warn('[Bossly Notice] NUXT_PUBLIC_API_BASE is recommended to be an HTTPS API URL on Vercel.');
  if (!/^https:\/\//.test(publicAppUrl)) console.warn('[Bossly Notice] NUXT_PUBLIC_APP_URL is recommended to be the HTTPS web origin on Vercel.');
}

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
      title: 'Bossly Control Room',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#08110D' },
        { name: 'robots', content: 'noindex,nofollow' },
        { name: 'description', content: 'Internal Bossly platform operations console.' },
      ],
      link: [{ rel: 'manifest', href: '/manifest.webmanifest' }, { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }, { rel: 'apple-touch-icon', href: '/pwa-192.png' }],
    },
  },
  routeRules: { '/**': { ssr: false } },
  tailwindcss: { cssPath: '~/assets/css/main.css', configPath: '~/tailwind.config.ts', viewer: false },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Bossly Control Room', short_name: 'Bossly Admin', theme_color: '#08110D', background_color: '#08110D',
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
