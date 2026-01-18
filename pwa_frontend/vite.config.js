import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}']
      },
      manifest: {
        name: 'Arogya AI - Advanced Biometric Screening',
        short_name: 'Arogya AI',
        description: 'Browser-based vital signs monitoring and health screening',
        theme_color: '#007bff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    fs: {
      allow: ['..']
    }
  },
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    exclude: ['@mediapipe/face_mesh']
  }
})