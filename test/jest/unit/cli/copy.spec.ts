import * as childProcess from 'child_process';
import { copy } from '../../../../src/cli/copy';

describe('copy', () => {
  let execFileSyncSpy: jest.SpyInstance;
  const originalPlatform = process.platform;

  beforeEach(() => {
    execFileSyncSpy = jest
      .spyOn(childProcess, 'execFileSync')
      .mockImplementation(() => 'ok' as any);
  });

  afterEach(() => {
    execFileSyncSpy.mockRestore();
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  it('uses pbcopy on darwin without shell subshell', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledTimes(1);
    expect(execFileSyncSpy).toHaveBeenCalledWith('pbcopy', [], {
      input: 'test text',
    });
  });

  it('uses xclip with -selection clipboard on linux without shell subshell', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledTimes(1);
    expect(execFileSyncSpy).toHaveBeenCalledWith(
      'xclip',
      ['-selection', 'clipboard'],
      { input: 'test text' },
    );
  });

  it('uses clip on win32 without shell subshell', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledTimes(1);
    expect(execFileSyncSpy).toHaveBeenCalledWith('clip', [], {
      input: 'test text',
    });
  });

  it('does nothing on unsupported platforms', () => {
    Object.defineProperty(process, 'platform', { value: 'sunos' });
    const result = copy('test text');
    expect(execFileSyncSpy).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
