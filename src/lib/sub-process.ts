import * as childProcess from 'child_process';

export function execute(
  command: string,
  args: string[],
  options?: { cwd?: string; shell?: boolean },
): Promise<string> {
  // Default to shell: false to prevent OS command injection vulnerabilities.
  // Explicit shell execution can be enabled via options.
  const spawnOptions: childProcess.SpawnOptions = { shell: false };
  if (options) {
    if (options.cwd) {
      spawnOptions.cwd = options.cwd;
    }
    if (options.shell !== undefined) {
      spawnOptions.shell = options.shell;
    }
  }

  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const proc = childProcess.spawn(command, args, spawnOptions);
    if (proc.stdout) {
      proc.stdout.on('data', (data) => {
        stdout += data;
      });
    }
    if (proc.stderr) {
      proc.stderr.on('data', (data) => {
        stderr += data;
      });
    }

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(stdout || stderr);
      }
      resolve(stdout || stderr);
    });
  });
}
