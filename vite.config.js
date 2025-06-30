import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      // Proxy GitHub raw content for PVPoke repository  
      '/api/pvpoke-github': {
        target: 'https://raw.githubusercontent.com/pvpoke/pvpoke/master',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pvpoke-github/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🌐 Proxying PVPoke repository request:', req.url);
          });
        }
      },
      // Proxy GitHub raw content for PokeMiners repository
      '/api/pokeminers': {
        target: 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pokeminers/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🌐 Proxying PokeMiners repository request:', req.url);
          });
        }
      }
    }
  }
}) 