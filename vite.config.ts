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
  // Conservative vendor splitting to reduce initial bundle size
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id) return;
          // Force specific heavy internal modules into separate chunks
          if (id.includes('src') && id.includes('useStrategies')) return 'useStrategies';
          if (id.includes('src') && id.includes('creative')) return 'creative';

          if (id.includes('node_modules')) {
            if (id.includes('@supabase') || id.includes('supabase-js')) return 'vendor-supabase';
            // Isolate known heavy UI/layout libs (they often include CSS)
            if (id.includes('react-grid-layout') || id.includes('react-resizable') || id.includes('react-slick') || id.includes('slick-carousel')) return 'vendor-layout';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('@mui') || id.includes('@mui/material') || id.includes('@mui/icons-material')) return 'vendor-mui';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            return 'vendor';
          }
        },
      },
    },
  },
})
