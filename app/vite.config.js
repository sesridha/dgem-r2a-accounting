import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // import.meta.dirname is the ESM-native equivalent of __dirname (Node 21.2+)
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/@tanstack')) {
            return 'tanstack-vendor'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor'
          }
          if (id.includes('node_modules/zustand')) {
            return 'state-vendor'
          }
          if (id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
            return 'style-utils-vendor'
          }
          if (id.includes('node_modules/axios') || id.includes('node_modules/date-fns')) {
            return 'utils-vendor'
          }
        },
      },
    },
  },
})
