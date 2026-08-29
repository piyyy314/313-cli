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
    jest.restoreAllMocks();
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  it('invokes pbcopy on darwin without spawning shell', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    copy('test input');
    expect(execFileSyncSpy).toHaveBeenCalledWith('pbcopy', [], {
      input: 'test input',
    });
  });

  it('invokes xclip with arguments on linux without spawning shell', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    copy('test input');
    expect(execFileSyncSpy).toHaveBeenCalledWith(
      'xclip',
      ['-selection', 'clipboard'],
      { input: 'test input' },
    );
  });

  it('invokes clip on win32 without spawning shell', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    copy('test input');
    expect(execFileSyncSpy).toHaveBeenCalledWith('clip', [], {
      input: 'test input',
    });
  });

  it('does nothing on unsupported platform', () => {
    Object.defineProperty(process, 'platform', { value: 'freebsd' });
    const result = copy('test input');
    expect(result).toBeUndefined();
    expect(execFileSyncSpy).not.toHaveBeenCalled();
  });
});
