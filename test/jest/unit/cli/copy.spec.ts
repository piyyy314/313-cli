import * as childProcess from 'child_process';
import { copy } from '../../../../src/cli/copy';

describe('copy()', () => {
  let execFileSyncSpy: jest.SpyInstance;
  let originalPlatform: PropertyDescriptor | undefined;

  beforeEach(() => {
    execFileSyncSpy = jest
      .spyOn(childProcess, 'execFileSync')
      .mockImplementation(() => Buffer.from(''));
    originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
  });

  afterEach(() => {
    execFileSyncSpy.mockRestore();
    if (originalPlatform) {
      Object.defineProperty(process, 'platform', originalPlatform);
    }
  });

  const setPlatform = (platform: string) => {
    Object.defineProperty(process, 'platform', {
      value: platform,
    });
  };

  it('calls pbcopy on darwin', () => {
    setPlatform('darwin');
    copy('test-string');
    expect(execFileSyncSpy).toHaveBeenCalledWith('pbcopy', [], {
      input: 'test-string',
    });
  });

  it('calls xclip with -selection clipboard on linux', () => {
    setPlatform('linux');
    copy('test-string');
    expect(execFileSyncSpy).toHaveBeenCalledWith(
      'xclip',
      ['-selection', 'clipboard'],
      { input: 'test-string' },
    );
  });

  it('calls clip on win32', () => {
    setPlatform('win32');
    copy('test-string');
    expect(execFileSyncSpy).toHaveBeenCalledWith('clip', [], {
      input: 'test-string',
    });
  });

  it('does nothing on unsupported platform', () => {
    setPlatform('sunos');
    copy('test-string');
    expect(execFileSyncSpy).not.toHaveBeenCalled();
  });
});
