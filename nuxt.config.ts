// auth.phareim.no: one sign-in page for the *.phareim.no apps. Nuxt 3 on a
// Cloudflare Worker (auth-web); /api/* relays to Reader over a service binding.
export default defineNuxtConfig({
  compatibilityDate: '2024-09-23',
  devtools: { enabled: false },

  // Both themes ship in one stylesheet, each scoped to its class on <html>
  // (html.theme-neon / html.theme-paper), so the toggle needs no reload.
  css: [
    '@fontsource/space-mono/latin-400.css',
    '~/assets/css/base.css',
    '~/assets/css/tufte.css',
    '~/pixel/pixel.css',
    '~/assets/css/neon.css',
  ],

  app: {
    head: {
      title: 'Sign in · phareim.no',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Sign in to the phareim.no apps.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'robots', content: 'noindex' },
        { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  nitro: {
    preset: 'cloudflare-module',
  },

  typescript: {
    strict: true,
    typeCheck: false,
    // lib/*.ts import each other with `.ts` extensions so node --test runs them directly.
    tsConfig: { compilerOptions: { allowImportingTsExtensions: true, noEmit: true } },
  },

  components: {
    dirs: [
      // Tufte primitives as <MonoLabel>, <CardFrame>…, the neon parts as <DuskScene>.
      { path: '~/components/tufte', pathPrefix: false },
      { path: '~/components/neon', pathPrefix: false },
      { path: '~/components', pathPrefix: false },
    ],
  },

  devServer: { port: 3050 },
})
