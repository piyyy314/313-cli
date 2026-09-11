import { execFile } from 'child_process';

export function executeCommand(
  cmd: string | string[],
  root: string,
): Promise<string> {
  const args = Array.isArray(cmd) ? [...cmd] : cmd.trim().split(/\s+/);
  const file = args.shift() || '';
  return new Promise((resolve, reject) => {
    execFile(
      file,
      args,
      { cwd: root, shell: process.platform === 'win32' },
      (err, stdout, stderr) => {
        const error = stderr.trim();
        if (error) {
          const cmdString = Array.isArray(cmd) ? cmd.join(' ') : cmd;
          return reject(new Error(error + ' / ' + cmdString));
        }
        resolve(stdout.split('\n').join(''));
      },
    );
  });
}
