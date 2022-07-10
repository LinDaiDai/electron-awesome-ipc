// 主进程构建
import { join } from 'path';
import { spawn, ChildProcess } from 'child_process';
import { watch, rollup, RollupOptions, OutputOptions } from 'rollup';
import minimist from 'minimist';
// import chalk from 'chalk';
import ora from 'ora';
import electron from 'electron';
import { main } from '../package.json';

import { getCommonConfigFactory } from './build-common';

const argv = minimist(process.argv.slice(2));
const opts = configFactory(argv.mode);
const TAG = '[build-main.ts]';
const spinner = ora(`${TAG} Electron build...`);

if (argv.mode === 'development') {
  const watcher = watch(opts);
  let child: ChildProcess;
  watcher.on('change', (filename) => {
    // const log = chalk.green(`change -- ${filename}`);
    console.log('change--', TAG);
  });
  watcher.on('event', (ev) => {
    if (ev.code === 'END') {
      if (child) child.kill();
      child = spawn(
        electron as any,
        [
          join(__dirname, `../${main}`),
          '--inspect=9229',
          '--remote-debugging-port=9222',
          '--env=test',
          `--mode=${argv.mode}`,
          // '--proxy=8888',
          // '--activityServer=https://ecreator1.test.seewo.com',
          // '--highQuality=1',
        ],
        {
          stdio: 'inherit',
        },
      );
    } else if (ev.code === 'ERROR') {
      console.log(ev.error);
    }
  });
  // });
} else {
  spinner.start();
  rollup(opts)
    .then((build) => {
      spinner.stop();
      // console.log(TAG, chalk.green('Electron build successed.'));
      console.log(TAG, 'Electron build successed.');
      build.write(opts.output as OutputOptions);
    })
    .catch((error) => {
      spinner.stop();
      // console.log(`\n${TAG} ${chalk.red('构建报错')}\n`, error, '\n');
      console.log(`\n${TAG} ${'构建报错'}\n`, error, '\n');
    });
}

function configFactory(mode = 'release') {
  const commonOptions = getCommonConfigFactory(mode);
  const options: RollupOptions = {
    input: join(__dirname, '../src/main/index.ts'),
    output: {
      file: join(__dirname, '../dist/main/index.js'),
      format: 'cjs',
      name: 'ElectronMainBundle',
      sourcemap: mode === 'development',
    },
    ...commonOptions,
  };
  return options;
}
