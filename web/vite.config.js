import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from "node:url"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // This replaces the need for postcss.config.js
  ],
  server: {
    port: 5173,
    strictPort: true, // This stops Vite from automatically switching to 5174
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
