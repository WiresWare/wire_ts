import { resolve } from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [eslint()],
  server: {
    host: '127.0.0.1',
    port: 8089,
  },
  build: {
    minify: false,
  },
});
