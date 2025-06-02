import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'components': path.resolve(__dirname, 'src/components'),
      'styles': path.resolve(__dirname, 'public/assets/styles'),
      'context': path.resolve(__dirname, 'src/context'),
      'pages': path.resolve(__dirname, 'src/pages'),
      'services': path.resolve(__dirname, 'src/services'),
      'store': path.resolve(__dirname, 'src/store'),
      'utils': path.resolve(__dirname, 'src/utils'),
      'configs': path.resolve(__dirname, 'src/configs')
    },
  },
});