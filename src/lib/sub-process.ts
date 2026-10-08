import * as childProcess from 'child_process';

export function execute(
  command: string,
  args: string[],
  options?: { cwd?: string; shell?: boolean },
): Promise<string> {
  // Security concern: Defaulting shell to true can lead to OS command injection vulnerabilities.
  // Default to shell: false to execute binaries directly without shell evaluation unless explicitly specified.
  const spawnOptions: childProcess.SpawnOptions = {
    shell: options?.shell ?? false,
  };
  if (options && options.cwd) {
    spawnOptions.cwd = options.cwd;
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
