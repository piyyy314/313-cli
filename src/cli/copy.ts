import { execFileSync } from 'child_process';

const program: Record<string, { cmd: string; args: string[] }> = {
  darwin: { cmd: 'pbcopy', args: [] },
  linux: { cmd: 'xclip', args: ['-selection', 'clipboard'] },
  win32: { cmd: 'clip', args: [] },
};

export function copy(str: string): Buffer | string | void {
  const config = program[process.platform];
  if (!config) {
    return;
  }
  return execFileSync(config.cmd, config.args, { input: str });
}
