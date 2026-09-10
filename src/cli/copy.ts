import { execFileSync } from 'child_process';

interface CommandConfig {
  cmd: string;
  args: string[];
}

// Map platforms to binary commands and discrete argument arrays to avoid shell subshell spawning
const commands: Record<string, CommandConfig> = {
  darwin: { cmd: 'pbcopy', args: [] },
  linux: { cmd: 'xclip', args: ['-selection', 'clipboard'] },
  win32: { cmd: 'clip', args: [] },
};

export function copy(str: string) {
  const config = commands[process.platform];
  if (!config) {
    throw new Error(
      `Clipboard copy is not supported on platform: ${process.platform}`,
    );
  }
  // Use execFileSync to execute binaries directly without shell interpolation
  return execFileSync(config.cmd, config.args, { input: str });
}
