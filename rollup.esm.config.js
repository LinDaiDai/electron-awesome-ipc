const path = require('path');
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import esbuild from 'rollup-plugin-esbuild'

export default {
  input: path.resolve(__dirname, './core/ipc/index.ts'),
  output: [
    {
      dir: path.resolve(__dirname, 'dist/esm'),
      format: 'esm',
    }
  ],
  // 关键属性，只有将其设置为 `true` 才能保证只编译、不打包
  preserveModules: true,
  plugins: [
    esbuild({
      target: 'es2018'
    }),
    nodeResolve(),
    json(),
  ],
  // 在 `esm` 构件中，`external` 非常重要，项目的 `dependencies` 里的内容理应都在此列
  external: ['react', 'react-dom']
};