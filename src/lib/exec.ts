import { execFile } from 'child_process';

export function executeCommand(
  cmd: string,
  argsOrRoot?: string[] | string,
  root?: string,
): Promise<string> {
  let args: string[] = [];
  let cwd: string | undefined = root;

  if (Array.isArray(argsOrRoot)) {
    args = argsOrRoot;
  } else if (typeof argsOrRoot === 'string') {
    cwd = argsOrRoot;
  }

  const parts = cmd.trim().split(/\s+/).filter(Boolean);
  const file = parts[0] || '';
  const commandArgs = [...parts.slice(1), ...args];

  return new Promise((resolve, reject) => {
    execFile(
      file,
      commandArgs,
      { cwd, shell: process.platform === 'win32' },
      (err, stdout, stderr) => {
        const error = stderr ? stderr.trim() : '';
        if (err || error) {
          return reject(
            new Error((error || (err && err.message)) + ' / ' + cmd),
          );
        }
        resolve(stdout.split('\n').join(''));
      },
    );
  });
}
