import { execFile } from 'child_process';

// Security Hardening: Use execFile with explicit argument arrays instead of shell exec
// to prevent OS command injection vulnerabilities.
export function executeCommand(cmd: string, root?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parts = cmd.trim().split(/\s+/);
    const file = parts[0];
    const args = parts.slice(1);

    execFile(file, args, { cwd: root }, (err, stdout, stderr) => {
      const error = stderr ? stderr.trim() : '';
      if (err || error) {
        return reject(new Error((error || err?.message || '') + ' / ' + cmd));
      }
      resolve(stdout.split('\n').join(''));
    });
  });
}
