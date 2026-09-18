import { execFile } from 'child_process';

// Executing sub-processes with execFile avoids shell command injection risks.
export function executeCommand(
  cmd: string,
  root?: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const parts = cmd.trim().split(/\s+/);
    const file = parts[0];
    const args = parts.slice(1);

    execFile(file, args, { cwd: root }, (err, stdout, stderr) => {
      const error = stderr.trim();
      if (error) {
        return reject(new Error(error + ' / ' + cmd));
      }
      if (err) {
        return reject(err);
      }
      resolve(stdout.split('\n').join(''));
    });
  });
}
