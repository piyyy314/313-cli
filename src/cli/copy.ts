import { execFileSync } from 'child_process';

interface CopyCommand {
  command: string;
  args: string[];
}

const commands: Record<string, CopyCommand> = {
  darwin: { command: 'pbcopy', args: [] },
  linux: { command: 'xclip', args: ['-selection', 'clipboard'] },
  win32: { command: 'clip', args: [] },
};

export function copy(str: string) {
  const target = commands[process.platform];
  if (!target) {
    throw new Error(
      `Clipboard copy is not supported on platform: ${process.platform}`,
    );
  }
  return execFileSync(target.command, target.args, { input: str });
}
