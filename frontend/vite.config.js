import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false // Disable sourcemaps in production to avoid issues
  },
  // Add base URL for production
  base: './'
})
