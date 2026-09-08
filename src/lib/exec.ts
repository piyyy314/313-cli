import { execFile } from 'child_process';

// Use execFile with discrete argument arrays to mitigate OS command injection risks.
export function executeCommand(cmd: string, root?: string): Promise<string> {
  const parts = cmd.trim().split(/\s+/);
  const file = parts[0];
  const args = parts.slice(1);

  return new Promise((resolve, reject) => {
    execFile(file, args, { cwd: root }, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
      const error = stderr.trim();
      if (error) {
        return reject(new Error(error + ' / ' + cmd));
      }
      resolve(stdout.split('\n').join(''));
    });
  });
}
