import { join } from 'path';
import { RollupOptions } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import pluginUrl from '@rollup/plugin-url';
import { uglify } from 'rollup-plugin-uglify';

import { builtins } from './utils';

export function getCommonConfigFactory(mode = 'release') {
  const options: RollupOptions = {
    watch: {
      chokidar: {},
    },
    plugins: [
      nodeResolve(),
      commonjs({}),
      json(),
      typescript({ abortOnError: false }),
      pluginUrl({
        limit: 0,
      }),
    ],
    external: [...builtins(), 'electron'],
  };
  if (mode !== 'development') {
    options.plugins?.push(uglify());
  }
  return options;
}
