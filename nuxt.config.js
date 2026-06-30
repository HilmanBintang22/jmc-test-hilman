// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-11-01",

  devtools: {
    enabled: true,
  },

  runtimeConfig: {
    public: {
      appName: process.env.APP_NAME,
      appClient: process.env.APP_CLIENT,
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY,

      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    },

    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "3m",
  },

  nitro: {
    output: {
      dir: ".output",
    },
    // TRICK FINAL: Memaksa Vercel Serverless mengikutsertakan paket mysql2 di environment produksinya
    vercel: {
      config: {
        includeFiles: ["node_modules/mysql2/**"]
      }
    }
  },

  css: [
    "@tabler/core/dist/css/tabler.min.css",
    "~/assets/css/backend.css",
  ],

  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.png",
        },
      ],
      script: [],
    },
  },

  modules: [],

  plugins: [
    "~/plugins/jquery.client.js",
    "~/plugins/tabler.client.js",
    "~/plugins/apexcharts.client.js",
  ],

  vite: {
    optimizeDeps: {
      include: ["apexcharts"],
    },
    ssr: {
      noExternal: ["mysql2"],
    },
  },
});