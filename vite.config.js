import { resolve } from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
  },
  plugins: [eslint()],
  build: {
    target: 'esnext',
    lib: {
      minify: true,
      emptyOutDir: true,
      copyPublicDir: true,
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'wires',
      formats: ['es', 'umd'],
      fileName: (format) => `wires.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      // external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          // vue: 'Vue',
        },
      },
    },
  },
})
