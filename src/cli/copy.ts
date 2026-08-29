import { execFileSync } from 'child_process';

interface CopyCommand {
  cmd: string;
  args: string[];
}

const commands: Record<string, CopyCommand> = {
  darwin: { cmd: 'pbcopy', args: [] },
  linux: { cmd: 'xclip', args: ['-selection', 'clipboard'] },
  win32: { cmd: 'clip', args: [] },
};

/**
 * Copies the given string to the system clipboard.
 * Uses execFileSync with explicit binary and argument arrays to mitigate
 * shell subshell spawning and OS command injection risks.
 */
export function copy(str: string) {
  const command = commands[process.platform];
  if (!command) {
    return;
  }
  return execFileSync(command.cmd, command.args, { input: str });
}
