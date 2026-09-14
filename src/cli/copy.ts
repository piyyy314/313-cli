import { execFileSync } from 'child_process';

interface CopyCommand {
  cmd: string;
  args: string[];
}

const programs: Record<string, CopyCommand> = {
  darwin: { cmd: 'pbcopy', args: [] },
  linux: { cmd: 'xclip', args: ['-selection', 'clipboard'] },
  win32: { cmd: 'clip', args: [] },
};

export function copy(str: string) {
  const program = programs[process.platform];
  if (!program) {
    return;
  }
  return execFileSync(program.cmd, program.args, { input: str });
}
