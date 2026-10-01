import npm, { getVersion } from '../../../src/lib/npm';
import * as childProcess from 'child_process';

describe('src/lib/npm', () => {
  let execFileSpy: jest.SpyInstance;

  beforeEach(() => {
    execFileSpy = jest
      .spyOn(childProcess, 'execFile')
      .mockImplementation((file, args, options, callback: any) => {
        if (typeof options === 'function') {
          callback = options;
        }
        if (callback) {
          callback(null, 'ok', '');
        }
        return {} as any;
      });
  });

  afterEach(() => {
    execFileSpy.mockRestore();
  });

  it('calls execFile with npm and discrete arguments', async () => {
    await npm('install', ['express'], true, '/tmp/project', ['--save-dev']);

    expect(execFileSpy).toHaveBeenCalledWith(
      'npm',
      ['install', '--save-dev', 'express'],
      { cwd: '/tmp/project' },
      expect.any(Function),
    );
  });

  it('default flags to --save when packages are present and flags are empty', async () => {
    await npm('install', ['lodash'], true, null, null);

    expect(execFileSpy).toHaveBeenCalledWith(
      'npm',
      ['install', '--save', 'lodash'],
      { cwd: process.cwd() },
      expect.any(Function),
    );
  });

  it('getVersion calls execFile with --version', async () => {
    await getVersion();

    expect(execFileSpy).toHaveBeenCalledWith(
      'npm',
      ['--version'],
      { cwd: process.cwd() },
      expect.any(Function),
    );
  });
});
