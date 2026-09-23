import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // La API se llama por URL absoluta (client/src/api/client.js), no por
  // proxy same-origin — VITE_API_URL ya incluye el prefijo /api. No está
  // disponible como import.meta.env aquí (esto corre en Node, no en el
  // bundle de cliente), así que se carga con loadEnv para construir el
  // runtimeCaching contra el origin real.
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = new URL(env.VITE_API_URL || 'http://localhost:4000/api');

  // El urlPattern de runtimeCaching se serializa a texto dentro de
  // sw.js (workbox-build hace .toString() de lo que le pasemos) — una
  // función que capture `apiUrl` por closure compilaría pero fallaría
  // en tiempo de ejecución con "apiUrl is not defined", porque esa
  // variable solo existe aquí en Node, no en el service worker. Por
  // eso se construye una RegExp con el origin/pathname ya resueltos
  // como texto literal, que sí sobrevive la serialización.
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const apiCachePattern = new RegExp(
    `^${escapeRegExp(apiUrl.origin + apiUrl.pathname)}(?!.*\\/auth\\/).*$`
  );

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt', // nunca recarga sola: el usuario puede estar redactando un post
        devOptions: { enabled: true },
        manifest: {
          name: 'Veritas',
          short_name: 'Veritas',
          lang: 'es',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#161b22', // colors.surface.panel — mismo tono que Nav.jsx
          background_color: '#0d1117', // colors.surface.base — fondo de index.css/LoadingScreen
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // Backend cross-origin (Render). reliabilityAgg se
              // recalcula en servidor — esta caché es solo respaldo
              // offline, nunca la fuente de verdad. /auth/ queda fuera
              // a propósito (sesión/rol siempre en vivo). Método GET
              // por defecto (workbox no cachea otros métodos salvo que
              // se indique lo contrario).
              urlPattern: apiCachePattern,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 }
              }
            },
            {
              urlPattern: ({ request }) => request.destination === 'image' || request.destination === 'font',
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-assets',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173
    }
  };
});
