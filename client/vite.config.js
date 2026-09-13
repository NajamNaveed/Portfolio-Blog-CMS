import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          icons: ['react-icons/si', 'react-icons/fa6', 'lucide-react'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
