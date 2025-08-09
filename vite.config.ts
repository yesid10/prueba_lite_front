import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/resend': {
        target: 'https://api.resend.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/resend/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Agregar el header de autorización aquí
            proxyReq.setHeader('Authorization', 'Bearer re_QqUnjNbj_DzAwacpANZVK29udNLWWZiKj');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
        }
      }
    }
  }
})