import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy API calls to the Go backend during local dev
      '/entries': 'http://localhost:8080',
      '/chapters': 'http://localhost:8080',
      '/collections': 'http://localhost:8080',
      '/moods': 'http://localhost:8080',
      '/ai': 'http://localhost:8080',
      '/auth': 'http://localhost:8080',
      '/exports': 'http://localhost:8080',
      '/signup': 'http://localhost:8080',
      '/login': 'http://localhost:8080',
      '/verify-otp': 'http://localhost:8080',
    },
  },
})
