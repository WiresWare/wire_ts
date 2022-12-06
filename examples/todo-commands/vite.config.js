import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import eslint from 'vite-plugin-eslint';
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [eslint(), removeConsole()],
  server: {
    host: '127.0.0.1',
    port: 8089,
    // cors: true,
    // host: 'local.dev',
    // https: true,
  },
  build: {
    minify: false,
  },
  test: {},
});
