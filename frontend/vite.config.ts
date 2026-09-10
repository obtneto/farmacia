import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  css: {
    devSourcemap: false,
  },
  build: {
    cssCodeSplit: false,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'
          }
          if (id.includes('node_modules/rsuite')) {
            return 'rsuite'
          }
          if (id.includes('node_modules/@tanstack')) {
            return 'query'
          }
          if (id.includes('node_modules/react-icons') || id.includes('node_modules/sweetalert2')) {
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    host:'0.0.0.0',
    port: 8080,
    sourcemapIgnoreList(sourcePath) {
      return sourcePath.includes('node_modules')
    },
  },
})
