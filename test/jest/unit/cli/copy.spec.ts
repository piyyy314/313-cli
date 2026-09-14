import * as childProcess from 'child_process';
import { copy } from '../../../../src/cli/copy';

describe('copy()', () => {
  let execFileSyncSpy: jest.SpyInstance;
  const originalPlatform = process.platform;

  beforeEach(() => {
    execFileSyncSpy = jest
      .spyOn(childProcess, 'execFileSync')
      .mockImplementation(() => Buffer.from(''));
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
    execFileSyncSpy.mockRestore();
  });

  it('uses pbcopy on darwin', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    copy('test-string');
    expect(execFileSyncSpy).toHaveBeenCalledWith('pbcopy', [], {
      input: 'test-string',
    });
  });

  it('uses xclip with clipboard selection on linux', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    copy('test-string');
    expect(execFileSyncSpy).toHaveBeenCalledWith(
      'xclip',
      ['-selection', 'clipboard'],
      { input: 'test-string' },
    );
  });

  it('uses clip on win32', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    copy('test-string');
    expect(execFileSyncSpy).toHaveBeenCalledWith('clip', [], {
      input: 'test-string',
    });
  });

  it('does not invoke execFileSync on unsupported platform', () => {
    Object.defineProperty(process, 'platform', { value: 'sunos' });
    copy('test-string');
    expect(execFileSyncSpy).not.toHaveBeenCalled();
  });
});
