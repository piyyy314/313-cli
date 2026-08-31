import { execFileSync } from 'child_process';

// Security enhancement: Use execFileSync with discrete argument arrays rather than execSync with shell strings
// to prevent shell subshell spawning and command injection risks.
const programs: Record<string, { cmd: string; args: string[] }> = {
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
