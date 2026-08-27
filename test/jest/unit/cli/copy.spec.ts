import * as childProcess from 'child_process';
import { copy } from '../../../../src/cli/copy';

describe('copy utility', () => {
  let execFileSyncSpy: jest.SpyInstance;
  const originalPlatform = process.platform;

  beforeEach(() => {
    execFileSyncSpy = jest
      .spyOn(childProcess, 'execFileSync')
      .mockImplementation(() => Buffer.from(''));
  });

  afterEach(() => {
    execFileSyncSpy.mockRestore();
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  function setPlatform(platform: string) {
    Object.defineProperty(process, 'platform', {
      value: platform,
    });
  }

  it('uses pbcopy on darwin without shell execution', () => {
    setPlatform('darwin');
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledWith('pbcopy', [], {
      input: 'test text',
    });
  });

  it('uses xclip on linux with correct selection flag', () => {
    setPlatform('linux');
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledWith(
      'xclip',
      ['-selection', 'clipboard'],
      { input: 'test text' },
    );
  });

  it('uses clip on win32 without shell execution', () => {
    setPlatform('win32');
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledWith('clip', [], {
      input: 'test text',
    });
  });

  it('returns undefined and does not execute on unsupported platform', () => {
    setPlatform('sunos');
    const result = copy('test text');
    expect(result).toBeUndefined();
    expect(execFileSyncSpy).not.toHaveBeenCalled();
  });
});
