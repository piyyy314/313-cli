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

export function copy(str: string): Buffer {
  const config = commands[process.platform] || commands.linux;
  return execFileSync(config.cmd, config.args, { input: str });
}
