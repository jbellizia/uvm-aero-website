import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000',
      // Photo files only; the /media page itself is a client-side route.
      '^/media/.+': 'http://127.0.0.1:5000',
    },
  },
});
