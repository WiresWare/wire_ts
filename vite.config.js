import { resolve } from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
  test: {
    globals: true,
  },
  plugins: [
    tsconfigPaths(),
    eslint(),
    dts({
      include: ['src/**/*.ts'],
      insertTypesEntry: true,
      rollupTypes: true,
    }),
    removeConsole(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
    target: 'esnext',
    minify: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'wire',
      formats: ['es'],
      // fileName: (format) => `wire.${format}.js`,
      fileName: 'wire',
    },
    rollupOptions: {
      external: [/^node:.*/],
    },
    write: true,
  },
});
