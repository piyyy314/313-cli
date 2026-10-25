import { executeCommand } from '../../../../src/lib/exec';
import * as childProcess from 'child_process';

describe('executeCommand', () => {
  it('should use execFile with argument array instead of shell execution', async () => {
    const execFileSpy = jest.spyOn(childProcess, 'execFile').mockImplementation(
      (file: any, args: any, options: any, callback: any) => {
        if (typeof options === 'function') {
          callback = options;
        }
        callback(null, 'output\nline2\n', '');
        return {} as any;
      },
    );

    const result = await executeCommand('git status', '/tmp');

    expect(execFileSpy).toHaveBeenCalledWith(
      'git',
      ['status'],
      { cwd: '/tmp' },
      expect.any(Function),
    );
    expect(result).toEqual('outputline2');

    execFileSpy.mockRestore();
  });

  it('should reject when stderr is not empty', async () => {
    const execFileSpy = jest.spyOn(childProcess, 'execFile').mockImplementation(
      (file: any, args: any, options: any, callback: any) => {
        callback(null, '', 'Some error');
        return {} as any;
      },
    );

    await expect(executeCommand('git status', '/tmp')).rejects.toThrow(
      'Some error / git status',
    );

    execFileSpy.mockRestore();
  });
});
