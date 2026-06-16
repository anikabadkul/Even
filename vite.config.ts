import { defineConfig, type Plugin } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Routes /api/* in `vite dev` to the same handlers deployed as Vercel functions in api/,
// so there's one copy of the proxy logic for both local dev and production.
function apiDevMiddleware(): Plugin {
  const routes: Array<[string, string]> = [
    ['/api/capabilities', '/server/handlers/capabilities.ts'],
    ['/api/generate-plan', '/server/handlers/generatePlan.ts'],
  ]
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      for (const [route, modPath] of routes) {
        server.middlewares.use(route, async (req, res, next) => {
          try {
            const mod = await server.ssrLoadModule(modPath)
            await mod.default(req, res)
          } catch (err) {
            next(err)
          }
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars via import.meta.env; the server-only keys (no prefix)
  // used by api/server providers need to be loaded into process.env ourselves for `vite dev`.
  // (In production these are injected directly into process.env by the hosting platform.)
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith('VITE_') && process.env[key] === undefined) process.env[key] = value
  }

  return {
    plugins: [
      apiDevMiddleware(),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Even — a week of meals within your budget',
          short_name: 'Even',
          description: 'A free 7-day meal plan built around your budget and your diet.',
          theme_color: '#3f7d5a',
          background_color: '#ebe5da',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        },
      }),
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
    },
  }
})
