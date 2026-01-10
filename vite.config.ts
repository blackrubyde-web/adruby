import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ✅ ADDED: Proxy Netlify functions during dev
  server: {
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8888',  // Netlify dev default port
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Aggressive vendor splitting to reduce initial bundle size
  build: {

  },
})
