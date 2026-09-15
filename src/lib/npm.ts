import debugModule = require('debug');
const debug = debugModule('snyk');
import { execFile } from 'child_process';

export default function npm(
  method: string,
  packages: string[] | null,
  live: boolean,
  cwd: string | null,
  flags: string[] | null,
): Promise<void> {
  const flagsArray = flags ? [...flags] : [];
  let pkgArray: string[] = [];
  if (packages) {
    pkgArray = Array.isArray(packages) ? packages : [packages];
  }

  // only if we have packages, then always save, otherwise the command might
  // be something like `npm shrinkwrap'
  if (pkgArray.length && !flagsArray.length) {
    flagsArray.push('--save');
  }

  const args = [method, ...flagsArray, ...pkgArray];

  return new Promise((resolve, reject) => {
    if (!cwd) {
      cwd = process.cwd();
    }
    const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    debug('%s$ %s %s', cwd, npmBin, args.join(' '));

    if (!live) {
      debug('[skipping - dry run]');
      return resolve();
    }

    execFile(
      npmBin,
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
          const e = new Error('npm update issues: ' + stderr.trim());
          (e as any).code = 'FAIL_UPDATE';
          return reject(e);
        }

        debug('npm %s complete', method);

        resolve();
      },
    );
  });
}

export function getVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    execFile(
      npmBin,
      ['--version'],
      {
        cwd: process.cwd(),
      },
      (error, stdout) => {
        if (error) {
          return reject(error);
        }
        return resolve(stdout);
      },
    );
  });
}
