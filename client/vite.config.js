import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', 
  plugins: [react()],
  preview: {
    port: 4173,  // Ensure it matches the exposed port
    strictPort: true, // Prevents port fallback
    host: "0.0.0.0", // Allows external access
    allowedHosts: ["game-frontend-868591301492.europe-west2.run.app"], // Add your Cloud Run URL
  },
})

