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
  flags = flags || [];
  if (!packages) {
    packages = [];
  }

  if (!Array.isArray(packages)) {
    packages = [packages];
  }

  // only if we have packages, then always save, otherwise the command might
  // be something like `npm shrinkwrap'
  if (packages.length && !flags.length) {
    flags.push('--save');
  }

  const methodArgs = method.split(' ').filter(Boolean);
  const args = [...methodArgs, ...flags, ...(packages as string[])];

  return new Promise((resolve, reject) => {
    if (!cwd) {
      cwd = process.cwd();
    }
    debug('%s$ npm %s', cwd, args.join(' '));

    if (!live) {
      debug('[skipping - dry run]');
      return resolve();
    }

    execFile(
      'npm',
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
          const e = new Error('npm update issues: ' + stderr.trim());
          (e as any).code = 'FAIL_UPDATE';
          return reject(e);
        }

        debug('npm %s complete', args.join(' '));

        resolve();
      },
    );
  });
}

export function getVersion() {
  return new Promise((resolve, reject) => {
    execFile(
      'npm',
      ['--version'],
      {
        cwd: process.cwd(),
        shell: process.platform === 'win32',
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
