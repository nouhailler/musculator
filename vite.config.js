import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Stamped into the bundle so the app can show which build is running — the
// only way to settle "is my phone on the new version?" without guessing.
// Netlify exposes the commit as COMMIT_REF; locally, ask git.
function buildId() {
  if (process.env.COMMIT_REF) return process.env.COMMIT_REF.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'dev'
  }
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(buildId()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    rollupOptions: {
      output: {
        // Give the zxing chunk a stable name so the service-worker rules below
        // can single it out; its hash still changes with its content.
        manualChunks(id) {
          if (id.includes('@zxing')) return 'zxing';
          return undefined;
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      // 'prompt', not 'autoUpdate': an installed PWA is reopened rather than
      // reloaded, so an automatic update lands whenever the OS feels like it.
      // The app registers the worker itself (see src/lib/pwa.js) to keep the
      // registration in reach, offer a real update button and — above all —
      // avoid reloading in the middle of a workout, whose state is ephemeral.
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: ['favicon.png', 'icons/*.png'],
      manifest: {
        name: 'Musculator',
        short_name: 'Musculator',
        description: 'Renforcement musculaire et prise de masse — programmes, séances guidées, coach vocal et suivi de progression.',
        theme_color: '#161826',
        background_color: '#161826',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'fr',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // The zxing decoder is only fetched by browsers without a native
        // BarcodeDetector, and only once someone opens the scanner. Precaching
        // it would make every Android and desktop user download ~460 KB they
        // will never execute, so it is cached on first use instead.
        globIgnores: ['**/zxing-*.js'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/assets\/zxing-.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'zxing-scanner',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
