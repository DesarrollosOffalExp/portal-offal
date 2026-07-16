import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El backend del portal corre en :3005. En dev, /api y /health van hacia allá.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': 'http://localhost:3005',
      '/health': 'http://localhost:3005',
    },
  },
});
