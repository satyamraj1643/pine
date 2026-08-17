import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
          'vendor-tiptap': [
            '@tiptap/core',
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-code-block-lowlight',
            '@tiptap/extension-color',
            '@tiptap/extension-highlight',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-task-item',
            '@tiptap/extension-task-list',
            '@tiptap/extension-text-align',
            '@tiptap/extension-text-style',
            '@tiptap/extension-underline',
          ],
          'vendor-emoji': ['emoji-datasource', 'react-emoji-render'],
          'vendor-icons': ['lucide-react', 'react-icons'],
        },
      },
    },
  },
  server: {
    proxy: {
      // Proxy API calls to the Go backend during local dev
      '/entries': { target: 'https://api.pine.brink.co.in', changeOrigin: true },
      '/chapters': { target: 'https://api.pine.brink.co.in', changeOrigin: true },
      '/collections': { target: 'https://api.pine.brink.co.in', changeOrigin: true },
      '/moods': { target: 'https://api.pine.brink.co.in', changeOrigin: true },
      '/ai': { target: 'https://api.pine.brink.co.in', changeOrigin: true },
      '/auth': { target: 'https://api.pine.brink.co.in', changeOrigin: true },
      '/exports': { target: 'https://api.pine.brink.co.in', changeOrigin: true },
      '/signup': { target: 'https://api.pine.brink.co.in', changeOrigin: true },
      '/login': { target: 'https://api.pine.brink.co.in', changeOrigin: true },
      '/verify-otp': { target: 'https://api.pine.brink.co.in', changeOrigin: true },
    },
  },
})
