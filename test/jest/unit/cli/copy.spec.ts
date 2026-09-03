import * as childProcess from 'child_process';
import { copy } from '../../../../src/cli/copy';

describe('cli copy helper', () => {
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

  it('executes pbcopy without shell for darwin', () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
    });

    copy('test-clipboard-content');

    expect(execFileSyncSpy).toHaveBeenCalledWith('pbcopy', [], {
      input: 'test-clipboard-content',
    });
  });

  it('executes xclip with explicit arguments for linux', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
    });

    copy('test-clipboard-content');

    expect(execFileSyncSpy).toHaveBeenCalledWith(
      'xclip',
      ['-selection', 'clipboard'],
      {
        input: 'test-clipboard-content',
      },
    );
  });

  it('executes clip without shell for win32', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    });

    copy('test-clipboard-content');

    expect(execFileSyncSpy).toHaveBeenCalledWith('clip', [], {
      input: 'test-clipboard-content',
    });
  });

  it('throws error on unsupported platforms', () => {
    Object.defineProperty(process, 'platform', {
      value: 'sunos',
    });

    expect(() => copy('test-clipboard-content')).toThrow(
      'Clipboard copy is not supported on platform: sunos',
    );
  });
});
