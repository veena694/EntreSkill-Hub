import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        roadmap: resolve(__dirname, 'roadmap.html'),
        learn: resolve(__dirname, 'learn.html'),
        mentors: resolve(__dirname, 'mentors.html'),
        profile: resolve(__dirname, 'profile.html'),
        management: resolve(__dirname, 'management.html'),
        join: resolve(__dirname, 'join.html')
      }
    }
  }
});
