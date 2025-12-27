import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: "./dist/",
    emptyOutDir: true
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,ttf,json}"],
        maximumFileSizeToCacheInBytes: 40 * 1024 * 1024, // 40MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdeliver\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ilovemedia-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // cache for 1 year
              }
            }
          },
          {
            urlPattern: /^.*\.onnx/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ilovemedia-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // cache for 1 year
              }
            }
          }
        ]
      },
      injectRegister: 'auto',
      devOptions: {
        enabled: process.env.MODE == 'development'
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./source', import.meta.url))
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
})
