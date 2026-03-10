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
