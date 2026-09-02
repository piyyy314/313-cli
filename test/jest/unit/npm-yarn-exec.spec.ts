import * as childProcess from 'child_process';
import npm, { getVersion } from '../../../src/lib/npm';
import { yarn } from '../../../src/lib/yarn';
import { executeCommand } from '../../../src/lib/exec';

describe('npm, yarn, and executeCommand secure process execution', () => {
  let execFileSpy: jest.SpyInstance;

  beforeEach(() => {
    execFileSpy = jest
      .spyOn(childProcess, 'execFile')
      .mockImplementation(
        (file: string, args: any, options: any, callback: any) => {
          const cb = typeof options === 'function' ? options : callback;
          if (cb) {
            cb(null, 'v1.0.0', '');
          }
          return {} as childProcess.ChildProcess;
        },
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('npm', () => {
    it('executes npm via execFile with discrete argument array', async () => {
      await npm('install', ['express', 'lodash'], true, '/app', ['--save-dev']);

      expect(execFileSpy).toHaveBeenCalledWith(
        'npm',
        ['install', '--save-dev', 'express', 'lodash'],
        expect.objectContaining({ cwd: '/app' }),
        expect.any(Function),
      );
    });

    it('executes npm getVersion via execFile with discrete argument array', async () => {
      await getVersion();

      expect(execFileSpy).toHaveBeenCalledWith(
        'npm',
        ['--version'],
        expect.objectContaining({ cwd: process.cwd() }),
        expect.any(Function),
      );
    });
  });

  describe('yarn', () => {
    it('executes yarn via execFile with discrete argument array', async () => {
      await yarn('add', ['react'], true, '/app', ['--dev']);

      expect(execFileSpy).toHaveBeenCalledWith(
        'yarn',
        ['add', '--dev', 'react'],
        expect.objectContaining({ cwd: '/app' }),
        expect.any(Function),
      );
    });
  });

  describe('executeCommand', () => {
    it('executes arbitrary binary via execFile with discrete argument array', async () => {
      await executeCommand('echo', ['hello', 'world'], '/app');

      expect(execFileSpy).toHaveBeenCalledWith(
        'echo',
        ['hello', 'world'],
        expect.objectContaining({ cwd: '/app' }),
        expect.any(Function),
      );
    });

    it('handles legacy (cmd, root) call signature gracefully', async () => {
      await executeCommand('git status', '/app');

      expect(execFileSpy).toHaveBeenCalledWith(
        'git',
        ['status'],
        expect.objectContaining({ cwd: '/app' }),
        expect.any(Function),
      );
    });
  });
});
