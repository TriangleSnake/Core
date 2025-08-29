import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Pages from "vite-plugin-pages"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Pages({
  onRoutesGenerated: routes => {
    console.log("Generated routes:", routes)
  },
}),],
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: [
      'dev.tris.tw',
      'core.tris.tw',   // ← 允許透過這個域名訪問
    ]
  }
}) 