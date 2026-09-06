import * as childProcess from 'child_process';
import { executeCommand } from '../../../../src/lib/exec';

describe('executeCommand', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls execFile with discrete binary and argument array', async () => {
    const execFileSpy = jest
      .spyOn(childProcess, 'execFile')
      .mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, 'output line 1\nline 2', '');
        }
        return {} as any;
      });

    const result = await executeCommand('git status --short', '/tmp/repo');

    expect(execFileSpy).toHaveBeenCalledTimes(1);
    expect(execFileSpy).toHaveBeenCalledWith(
      'git',
      ['status', '--short'],
      { cwd: '/tmp/repo' },
      expect.any(Function),
    );
    expect(result).toBe('output line 1line 2');
  });

  it('rejects with error message if stderr is present or execution fails', async () => {
    jest
      .spyOn(childProcess, 'execFile')
      .mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(new Error('Process error'), '', 'fatal: not a git repo');
        }
        return {} as any;
      });

    await expect(
      executeCommand('git status', '/tmp/repo'),
    ).rejects.toThrow('fatal: not a git repo / git status');
  });
});
