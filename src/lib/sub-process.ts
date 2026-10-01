import * as childProcess from 'child_process';

/**
 * Executes a system command as a subprocess.
 *
 * SECURITY WARNING:
 * Setting `shell: true` can make the application vulnerable to OS Command Injection
 * if user-controlled inputs (or unsanitized external variables) are used in arguments.
 * To enforce defense in depth and the principle of least privilege, `shell` defaults to `false`.
 * Only explicitly enable `shell: true` if strictly required, and ensure all arguments are safe.
 */
export function execute(
  command: string,
  args: string[],
  options?: { cwd?: string; shell?: boolean },
): Promise<string> {
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
