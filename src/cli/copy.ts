import { execFileSync } from 'child_process';

interface CommandConfig {
  cmd: string;
  args: string[];
}

const commands: Record<string, CommandConfig> = {
  darwin: { cmd: 'pbcopy', args: [] },
  linux: { cmd: 'xclip', args: ['-selection', 'clipboard'] },
  win32: { cmd: 'clip', args: [] },
};

export function copy(str: string) {
  const config = commands[process.platform];
  if (!config) {
    throw new Error(`Clipboard copy is not supported on platform: ${process.platform}`);
  }
  return execFileSync(config.cmd, config.args, { input: str });
}
