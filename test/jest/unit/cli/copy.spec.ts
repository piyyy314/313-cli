import * as childProcess from 'child_process';
import { copy } from '../../../../src/cli/copy';

describe('cli copy function', () => {
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

  it('uses pbcopy on darwin without shell parsing', () => {
    setPlatform('darwin');
    copy('test-string');

    expect(execFileSyncSpy).toHaveBeenCalledWith('pbcopy', [], {
      input: 'test-string',
    });
  });

  it('uses xclip on linux with explicit arguments', () => {
    setPlatform('linux');
    copy('test-string');

    expect(execFileSyncSpy).toHaveBeenCalledWith(
      'xclip',
      ['-selection', 'clipboard'],
      {
        input: 'test-string',
      },
    );
  });

  it('uses clip on win32 without shell parsing', () => {
    setPlatform('win32');
    copy('test-string');

    expect(execFileSyncSpy).toHaveBeenCalledWith('clip', [], {
      input: 'test-string',
    });
  });

  it('throws an error for unsupported platforms', () => {
    setPlatform('sunos');

    expect(() => copy('test-string')).toThrow(
      'Clipboard copy is not supported on platform: sunos',
    );
  });
});
