import * as childProcess from 'child_process';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { execute } from '../../../../src/lib/sub-process';

interface MockProcess extends childProcess.ChildProcess {
  stdout: Readable;
  stderr: Readable;
}

function createMockProcess(): MockProcess {
  const mockProc = new EventEmitter() as MockProcess;
  mockProc.stdout = new Readable({
    read() {
      return;
    },
  });
  mockProc.stderr = new Readable({
    read() {
      return;
    },
  });
  (mockProc as any).stdin = null;
  return mockProc;
}

describe('sub-process', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('resolves with stdout on successful execution', async () => {
      const mockProc = createMockProcess();
      jest.spyOn(childProcess, 'spawn').mockReturnValue(mockProc);

      const promise = execute('dummy-command', ['arg1']);

      mockProc.stdout.emit('data', Buffer.from('hello output'));
      mockProc.emit('close', 0);

      const result = await promise;
      expect(result).toBe('hello output');
      expect(childProcess.spawn).toHaveBeenCalledWith(
        'dummy-command',
        ['arg1'],
        expect.objectContaining({ shell: false }),
      );
    });

    it('rejects with stderr/stdout on non-zero exit code', async () => {
      const mockProc = createMockProcess();
      jest.spyOn(childProcess, 'spawn').mockReturnValue(mockProc);

      const promise = execute('dummy-command', ['arg1']);

      mockProc.stderr.emit('data', Buffer.from('error occurred'));
      mockProc.emit('close', 1);

      await expect(promise).rejects.toBe('error occurred');
    });

    it('rejects with the error object when process spawning fails', async () => {
      const mockProc = createMockProcess();
      jest.spyOn(childProcess, 'spawn').mockReturnValue(mockProc);

      const promise = execute('invalid-command', []);

      const spawnError = new Error('spawn ENOENT');
      mockProc.emit('error', spawnError);

      await expect(promise).rejects.toThrow('spawn ENOENT');
    });
  });
});
