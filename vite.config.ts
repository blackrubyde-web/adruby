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
  // Aggressive vendor splitting to reduce initial bundle size
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id) return;
          // Force specific heavy internal modules into separate chunks
          if (id.includes('src') && id.includes('useStrategies')) return 'useStrategies';
          if (id.includes('src') && id.includes('creative')) return 'creative';

          if (id.includes('node_modules')) {
            // React core - keep together to avoid initialization issues
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-is') || id.includes('scheduler') || id.includes('prop-types')) return 'vendor-react';

            // React Flow - heavy library for canvas builder
            if (id.includes('@xyflow') || id.includes('reactflow')) return 'vendor-reactflow';

            // Animation libraries
            if (id.includes('framer-motion') || id.includes('motion')) return 'vendor-motion';

            // Date/Time utilities
            if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) return 'vendor-date';

            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'vendor-forms';

            // Supabase
            if (id.includes('@supabase') || id.includes('supabase-js')) return 'vendor-supabase';

            // UI/layout libs
            if (id.includes('react-grid-layout') || id.includes('react-resizable') || id.includes('react-slick') || id.includes('slick-carousel')) return 'vendor-layout';
            if (id.includes('react-window') || id.includes('react-virtualized')) return 'vendor-virtual';

            // Charts
            if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';

            // Icons
            if (id.includes('lucide-react')) return 'vendor-icons';

            // Radix UI components
            if (id.includes('@radix-ui')) return 'vendor-radix';

            // Markdown/Editor
            if (id.includes('marked') || id.includes('highlight') || id.includes('prism')) return 'vendor-markdown';

            // Catch remaining smaller deps
            return 'vendor-misc';
          }
        },
      },
    },
  },
})
