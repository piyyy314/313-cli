import * as childProcess from 'child_process';
import npm, { getVersion } from '../../../../src/lib/npm';
import { yarn } from '../../../../src/lib/yarn';
import { executeCommand } from '../../../../src/lib/exec';

describe('package manager & execution helpers', () => {
  let execFileSpy: jest.SpyInstance;

  beforeEach(() => {
    execFileSpy = jest
      .spyOn(childProcess, 'execFile')
      .mockImplementation(
        (file: any, args: any, options: any, callback?: any) => {
          const cb = typeof options === 'function' ? options : callback;
          if (typeof cb === 'function') {
            cb(null, '1.0.0', '');
          }
          return {} as any;
        },
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('npm()', () => {
    it('executes npm command with execFile and discrete arguments', async () => {
      await npm('install', ['lodash'], true, '/test-dir', ['--save-dev']);

      expect(execFileSpy).toHaveBeenCalledTimes(1);
      const expectedBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      expect(execFileSpy).toHaveBeenCalledWith(
        expectedBin,
        ['install', '--save-dev', 'lodash'],
        { cwd: '/test-dir' },
        expect.any(Function),
      );
    });

    it('does not call execFile if live is false', async () => {
      await npm('install', ['lodash'], false, '/test-dir', []);
      expect(execFileSpy).not.toHaveBeenCalled();
    });
  });

  describe('getVersion()', () => {
    it('executes npm --version with execFile', async () => {
      const version = await getVersion();
      expect(version).toBe('1.0.0');
      expect(execFileSpy).toHaveBeenCalledTimes(1);
      const expectedBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      expect(execFileSpy).toHaveBeenCalledWith(
        expectedBin,
        ['--version'],
        { cwd: process.cwd() },
        expect.any(Function),
      );
    });
  });

  describe('yarn()', () => {
    it('executes yarn command with execFile and discrete arguments', async () => {
      await yarn('add', ['express'], true, '/test-dir', ['--dev']);

      expect(execFileSpy).toHaveBeenCalledTimes(1);
      const expectedBin = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
      expect(execFileSpy).toHaveBeenCalledWith(
        expectedBin,
        ['add', '--dev', 'express'],
        { cwd: '/test-dir' },
        expect.any(Function),
      );
    });
  });

  describe('executeCommand()', () => {
    it('executes command using execFile with split binary and arguments', async () => {
      const res = await executeCommand('git status --short', '/test-dir');

      expect(res).toBe('1.0.0');
      expect(execFileSpy).toHaveBeenCalledTimes(1);
      expect(execFileSpy).toHaveBeenCalledWith(
        'git',
        ['status', '--short'],
        { cwd: '/test-dir' },
        expect.any(Function),
      );
    });
  });
});
