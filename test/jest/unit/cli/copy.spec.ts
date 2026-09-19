import * as childProcess from 'child_process';
import { copy } from '../../../../src/cli/copy';

describe('copy', () => {
  const originalPlatform = process.platform;
  let execFileSyncSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    execFileSyncSpy = jest.spyOn(childProcess, 'execFileSync').mockImplementation(() => Buffer.from(''));
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  it('executes pbcopy without subshell on darwin', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledWith('pbcopy', [], { input: 'test text' });
  });

  it('executes xclip with -selection clipboard on linux', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledWith('xclip', ['-selection', 'clipboard'], {
      input: 'test text',
    });
  });

  it('executes clip on win32', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledWith('clip', [], { input: 'test text' });
  });

  it('returns undefined gracefully on unsupported platform', () => {
    Object.defineProperty(process, 'platform', { value: 'sunos' });
    const result = copy('test text');
    expect(execFileSyncSpy).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
