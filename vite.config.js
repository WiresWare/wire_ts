import { resolve } from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import dts from 'vite-plugin-dts';
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
  },
  plugins: [
    eslint(),
    dts({
      include: ['src/**/*.ts'],
      insertTypesEntry: true,
      rollupTypes: true,
    }),
    removeConsole()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
    target: 'esnext',
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'wire',
      formats: ['es'],
      // fileName: (format) => `wire.${format}.js`,
      fileName: 'wire',
    },
    rollupOptions: {
      external: [/^node:.*/,],
    },
    write: true,
  },
});
