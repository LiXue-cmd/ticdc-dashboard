// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@unocss/nuxt',
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    'nuxt-codemirror',
    '@sidebase/nuxt-auth',
    '@nuxtjs/tailwindcss'
  ],

  auth: {
    baseURL: process.env.AUTH_ORIGIN,
    provider: {
      type: 'authjs'
    }
  },

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    public: {
      authUrl: process.env.NUXT_AUTH_URL || 'http://localhost:3000/api/auth'
    }
  },

  // css: [
  //   '@unocss/reset/tailwind.css',
  // ],
  css: ['~/assets/css/main.css'],

  colorMode: {
    classSuffix: '',
  },

  features: {
    // For UnoCSS
    inlineStyles: false,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  routeRules: {
    '/components': { redirect: '/components/accordion' },
    '/settings': { redirect: '/settings/profile' },
  },

  imports: {
    dirs: [
      './lib',
    ],
  },

  compatibilityDate: '2024-12-14',
})
