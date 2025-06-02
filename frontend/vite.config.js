import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      'assets': path.resolve(__dirname, 'src/assets'),
      'components': path.resolve(__dirname, 'src/components'),
      'styles': path.resolve(__dirname, 'src/assets/styles'),
      'context': path.resolve(__dirname, 'src/context'),
      'pages': path.resolve(__dirname, 'src/pages'),
      'services': path.resolve(__dirname, 'src/services'),
      'store': path.resolve(__dirname, 'src/store'),
      'utils': path.resolve(__dirname, 'src/utils'),
      'configs': path.resolve(__dirname, 'src/configs'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['antd/es/button', 'antd/es/table', 'antd/es/form', /* другие используемые компоненты */],
        }
      }
    },
    chunkSizeWarningLimit: 1500, // Увеличиваем лимит предупреждений
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  }
});
