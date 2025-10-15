import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
