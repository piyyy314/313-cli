import { execFile } from 'child_process';

/**
 * Safely executes a command using child_process.execFile with discrete argument arrays
 * to prevent OS command injection.
 */
export function executeCommand(cmd: string, root: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Parse the command into binary and arguments
    const parts = cmd.trim().split(/\s+/);
    const file = parts[0];
    const args = parts.slice(1);

    execFile(file, args, { cwd: root }, (err, stdout, stderr) => {
      const error = stderr ? stderr.trim() : '';
      if (error) {
        return reject(new Error(error + ' / ' + cmd));
      }
      if (err) {
        return reject(err);
      }
      resolve(stdout ? stdout.split('\n').join('') : '');
    });
  });
}
