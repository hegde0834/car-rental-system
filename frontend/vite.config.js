import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The proxy forwards /api/* to your PHP backend running under XAMPP/WAMP (Apache).
// Project folder must be at  htdocs/car-rental/  -> backend URL = http://localhost/car-rental/backend/api
// If you use `php -S localhost:8000 -t ..` or a different folder, change `target` / `rewrite` below.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/car-rental/backend/api'),
      },
    },
  },
});
