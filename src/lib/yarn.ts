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
  const flagsArray = flags ? [...flags] : [];
  let pkgArray: string[] = [];
  if (packages) {
    pkgArray = Array.isArray(packages) ? packages : [packages];
  }

  const args = [method, ...flagsArray, ...pkgArray];

  return new Promise<void>((resolve, reject) => {
    if (!cwd) {
      cwd = process.cwd();
    }
    const yarnBin = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
    debug('%s$ %s %s', cwd, yarnBin, args.join(' '));

    if (!live) {
      debug('[skipping - dry run]');
      return resolve();
    }

    execFile(
      yarnBin,
      args,
      {
        cwd,
      },
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }

        if (stderr && stderr.indexOf('ERR!') !== -1) {
          console.error(stderr.trim());
          const e = new CustomError('Yarn update issues: ' + stderr.trim());
          e.strCode = 'FAIL_UPDATE';
          e.code = 422;
          return reject(e);
        }

        debug('yarn %s complete', method);

        resolve();
      },
    );
  });
}
