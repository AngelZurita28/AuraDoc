import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'API_'],
    server: {
      proxy: {
        '/api/auth': {
          target: env.API_DOTNET_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/api/documents': {
          target: env.API_BACKEND_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
