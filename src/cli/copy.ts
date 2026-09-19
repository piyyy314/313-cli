import { execFileSync } from 'child_process';

interface CommandSpec {
  file: string;
  args: string[];
}

// Map platforms to binary file and discrete arguments.
// Using execFileSync with explicit argument arrays prevents shell subshell spawning and OS command injection risks.
const commands: Record<string, CommandSpec> = {
  darwin: { file: 'pbcopy', args: [] },
  linux: { file: 'xclip', args: ['-selection', 'clipboard'] },
  win32: { file: 'clip', args: [] },
};

export function copy(str: string) {
  const cmd = commands[process.platform];
  if (!cmd) {
    return;
  }
  return execFileSync(cmd.file, cmd.args, { input: str });
}
