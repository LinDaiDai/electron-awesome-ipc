// preload构建
import { join } from 'path';
import { watch, rollup, RollupOptions, OutputOptions } from 'rollup';
import minimist from 'minimist';
import chalk from 'chalk';
import { getCommonConfigFactory } from './build-common';

const argv = minimist(process.argv.slice(2));
const opts = configFactory(argv.mode);
const TAG = '[build-preload.ts]';

if (argv.mode === 'development') {
  const watcher = watch(opts);
  watcher.on('change', (filename) => {
    const log = chalk.yellow(`change -- ${filename}`);
    console.log(TAG, log);
  });
} else {
  rollup(opts)
    .then((build) => {
      console.log(TAG, chalk.yellow('"preload/index.js" built.'));
      build.write(opts.output as OutputOptions);
    })
    .catch((error) => {
      console.log(`\n${TAG} ${chalk.red('构建报错')}\n`, error, '\n');
    });
}

function configFactory(mode = 'release') {
  const commonOptions = getCommonConfigFactory(mode);
  const options: RollupOptions = {
    input: {
      index: join(__dirname, '../src/preload/index.ts'),
      // service: join(__dirname, '../src/preload/service.ts'),
    },
    output: {
      dir: join(__dirname, '../dist/preload'),
      format: 'cjs',
      sourcemap: mode === 'development',
    },
    ...commonOptions,
  };
  return options;
}
