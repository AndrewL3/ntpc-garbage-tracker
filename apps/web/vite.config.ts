import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore -- pnpm may hoist duplicate vite types causing Plugin mismatch
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Taipei Daily",
        short_name: "Taipei Daily",
        description:
          "Real-time transit, garbage trucks, and city services for Greater Taipei",
        start_url: "/",
        display: "standalone",
        theme_color: "#0d9488",
        background_color: "#fafafa",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          // Static data — cache first, long TTL
          {
            urlPattern: /\/api\/garbage\/taipei-stops/,
            handler: "CacheFirst",
            options: {
              cacheName: "api-taipei-stops",
              expiration: { maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /\/api\/transit\/stops/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-transit-stops",
              expiration: { maxAgeSeconds: 86400 },
            },
          },
          // Semi-static data — stale while revalidate
          {
            urlPattern: /\/api\/youbike\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-youbike",
              expiration: { maxAgeSeconds: 120 },
            },
          },
          {
            urlPattern: /\/api\/stops/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-stops",
              expiration: { maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /\/api\/weather\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-weather",
              expiration: { maxAgeSeconds: 1800 },
            },
          },
          {
            urlPattern: /\/api\/routes/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-routes",
              expiration: { maxAgeSeconds: 120 },
            },
          },
          // Real-time data — network first, fall back to cache
          {
            urlPattern: /\/api\/parking\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-parking",
              expiration: { maxAgeSeconds: 120 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\/api\/alerts\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-alerts",
              expiration: { maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            },
          },
          // Transit arrivals/route — network first (real-time ETAs)
          {
            urlPattern: /\/api\/transit\/(arrivals|route)/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-transit-realtime",
              expiration: { maxAgeSeconds: 60 },
              networkTimeoutSeconds: 5,
            },
          },
          // Map tiles — cache first, 7-day TTL
          {
            urlPattern: /^https:\/\/wmts\.nlsc\.gov\.tw\//,
            handler: "CacheFirst",
            options: {
              cacheName: "map-tiles-nlsc",
              expiration: { maxEntries: 500, maxAgeSeconds: 604800 },
            },
          },
          {
            urlPattern: /^https:\/\/[a-d]\.basemaps\.cartocdn\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "map-tiles-carto",
              expiration: { maxEntries: 500, maxAgeSeconds: 604800 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/leaflet/") || id.includes("/react-leaflet/"))
            return "vendor-map";
          if (id.includes("/@tanstack/react-query")) return "vendor-query";
          if (
            id.includes("/vaul/") ||
            id.includes("/@radix-ui/") ||
            id.includes("/class-variance-authority/")
          )
            return "vendor-ui";
          if (id.includes("/i18next/") || id.includes("/react-i18next/"))
            return "vendor-i18n";
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
