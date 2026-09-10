import { execFileSync } from 'child_process';
import { copy } from '../../../../src/cli/copy';

jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
}));

describe('copy', () => {
  const originalPlatform = process.platform;

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
    jest.clearAllMocks();
  });

  it('uses pbcopy on darwin without spawning a shell', () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    });
    copy('test-string');
    expect(execFileSync).toHaveBeenCalledWith('pbcopy', [], {
      input: 'test-string',
    });
  });

  it('uses xclip with selection flags on linux without spawning a shell', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    });
    copy('test-string');
    expect(execFileSync).toHaveBeenCalledWith(
      'xclip',
      ['-selection', 'clipboard'],
      { input: 'test-string' },
    );
  });

  it('uses clip on win32 without spawning a shell', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    });
    copy('test-string');
    expect(execFileSync).toHaveBeenCalledWith('clip', [], {
      input: 'test-string',
    });
  });

  it('throws an error for unsupported platforms', () => {
    Object.defineProperty(process, 'platform', {
      value: 'freebsd',
      configurable: true,
    });
    expect(() => copy('test-string')).toThrow(
      'Clipboard copy is not supported on platform: freebsd',
    );
  });
});
