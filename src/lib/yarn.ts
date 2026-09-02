import * as Debug from 'debug';
import { execFile } from 'child_process';
import { CustomError } from './errors';

const debug = Debug('snyk');

export function yarn(
  method: string,
  packages: string[],
  live: boolean,
  cwd: string,
  flags: string[],
) {
  flags = flags || [];
  if (!packages) {
    packages = [];
  }

  if (!Array.isArray(packages)) {
    packages = [packages];
  }

  const methodArgs = method.split(' ').filter(Boolean);
  const args = [...methodArgs, ...flags, ...packages];

  return new Promise<void>((resolve, reject) => {
    if (!cwd) {
      cwd = process.cwd();
    }
    debug('%s$ yarn %s', cwd, args.join(' '));

    if (!live) {
      debug('[skipping - dry run]');
      return resolve();
    }

    execFile(
      'yarn',
      args,
      {
        cwd,
        shell: process.platform === 'win32',
      },
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }

        if (stderr.indexOf('ERR!') !== -1) {
          console.error(stderr.trim());
          const e = new CustomError('Yarn update issues: ' + stderr.trim());
          e.strCode = 'FAIL_UPDATE';
          e.code = 422;
          return reject(e);
        }

        debug('yarn %s complete', args.join(' '));

        resolve();
      },
    );
  });
}
