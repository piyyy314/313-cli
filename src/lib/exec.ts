import { execFile } from 'child_process';

export function executeCommand(
  cmd: string | string[],
  root: string,
): Promise<string> {
  const args = typeof cmd === 'string' ? cmd.trim().split(/\s+/) : [...cmd];
  const file = args.shift() || '';

  return new Promise((resolve, reject) => {
    execFile(file, args, { cwd: root }, (err, stdout, stderr) => {
      const error = stderr.trim();
      if (error) {
        return reject(
          new Error(
            error +
              ' / ' +
              (typeof cmd === 'string' ? cmd : [file, ...args].join(' ')),
          ),
        );
      }
      resolve(stdout.split('\n').join(''));
    });
  });
}
