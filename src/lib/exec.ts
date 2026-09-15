import { execFile } from 'child_process';

// Executes a command safely using execFile
export function executeCommand(cmd: string, root: string): Promise<string> {
  const parts = cmd.trim().split(/\s+/);
  const file = parts[0];
  const args = parts.slice(1);

  return new Promise((resolve, reject) => {
    execFile(file, args, { cwd: root }, (err, stdout, stderr) => {
      const error = stderr ? stderr.trim() : '';
      if (err || error) {
        return reject(new Error((error || err?.message) + ' / ' + cmd));
      }
      resolve(stdout.split('\n').join(''));
    });
  });
}
