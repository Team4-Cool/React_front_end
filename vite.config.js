import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // or use your specific local IP (e.g., '192.168.1.2')
    port: 5173,
  }
  
})
