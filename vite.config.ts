import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { join, resolve } from 'path';

const root = __dirname;
export default defineConfig((env) => {
  return {
    root: env.mode === 'development' ? join(__dirname, 'src/render') : join(__dirname, 'src/render/entry'),
    base: './',
    envDir: './',
    server: {
      watch: {},
      port: 3000,
    },
    plugins: [
      react(),
    ],
    build: {
      outDir: join(root, 'dist/render'),
      emptyOutDir: true,
      minify: true,
      assetsDir: '',
      sourcemap: false,
      rollupOptions: {
        input: {
          windowOne: resolve(root, 'src/render/entry/windowOne.html'),
          windowTwo: resolve(root, 'src/render/entry/windowTwo.html'),
        },
      },
    }
  }
})
