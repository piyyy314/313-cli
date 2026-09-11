import * as childProcess from 'child_process';
import npm, { getVersion } from '../../../../src/lib/npm';
import { yarn } from '../../../../src/lib/yarn';
import { executeCommand } from '../../../../src/lib/exec';

jest.mock('child_process');

describe('npm, yarn, and executeCommand security refactoring', () => {
  const mockedExecFile = childProcess.execFile as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('npm', () => {
    it('uses execFile with discrete arguments array instead of shell execution', async () => {
      mockedExecFile.mockImplementation((file, args, options, callback) => {
        callback(null, 'ok', '');
      });

      await npm('install', ['express'], true, '/test/dir', ['--save-dev']);

      expect(mockedExecFile).toHaveBeenCalledTimes(1);
      expect(mockedExecFile).toHaveBeenCalledWith(
        'npm',
        ['install', '--save-dev', 'express'],
        { cwd: '/test/dir', shell: process.platform === 'win32' },
        expect.any(Function),
      );
    });

    it('getVersion uses execFile with discrete arguments', async () => {
      mockedExecFile.mockImplementation((file, args, options, callback) => {
        callback(null, '10.0.0', '');
      });

      const ver = await getVersion();

      expect(ver).toBe('10.0.0');
      expect(mockedExecFile).toHaveBeenCalledTimes(1);
      expect(mockedExecFile).toHaveBeenCalledWith(
        'npm',
        ['--version'],
        { cwd: process.cwd(), shell: process.platform === 'win32' },
        expect.any(Function),
      );
    });
  });

  describe('yarn', () => {
    it('uses execFile with discrete arguments array instead of shell execution', async () => {
      mockedExecFile.mockImplementation((file, args, options, callback) => {
        callback(null, 'ok', '');
      });

      await yarn('add', ['lodash'], true, '/test/dir', ['--dev']);

      expect(mockedExecFile).toHaveBeenCalledTimes(1);
      expect(mockedExecFile).toHaveBeenCalledWith(
        'yarn',
        ['add', '--dev', 'lodash'],
        { cwd: '/test/dir', shell: process.platform === 'win32' },
        expect.any(Function),
      );
    });
  });

  describe('executeCommand', () => {
    it('uses execFile with split command and arguments array', async () => {
      mockedExecFile.mockImplementation((file, args, options, callback) => {
        callback(null, 'main\n', '');
      });

      const res = await executeCommand('git branch', '/test/dir');

      expect(res).toBe('main');
      expect(mockedExecFile).toHaveBeenCalledTimes(1);
      expect(mockedExecFile).toHaveBeenCalledWith(
        'git',
        ['branch'],
        { cwd: '/test/dir', shell: process.platform === 'win32' },
        expect.any(Function),
      );
    });

    it('supports array argument for commands with spaces', async () => {
      mockedExecFile.mockImplementation((file, args, options, callback) => {
        callback(null, 'commit ok\n', '');
      });

      const res = await executeCommand(
        ['git', 'commit', '-m', 'fix security bug'],
        '/test/dir',
      );

      expect(res).toBe('commit ok');
      expect(mockedExecFile).toHaveBeenCalledTimes(1);
      expect(mockedExecFile).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'fix security bug'],
        { cwd: '/test/dir', shell: process.platform === 'win32' },
        expect.any(Function),
      );
    });
  });
});
