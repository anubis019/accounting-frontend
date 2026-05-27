import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://accounting-backend-production-2ded.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, '/api')
      }
    }
  }
})

