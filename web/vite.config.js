import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

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
      "@": path.resolve(__dirname, "./src"),
    },
  },
})