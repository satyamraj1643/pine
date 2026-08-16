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
