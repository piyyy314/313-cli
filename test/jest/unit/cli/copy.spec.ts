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
    jest.restoreAllMocks();
  });

  it('executes pbcopy on darwin', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledWith('pbcopy', [], {
      input: 'test text',
    });
  });

  it('executes xclip with arguments on linux', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledWith(
      'xclip',
      ['-selection', 'clipboard'],
      { input: 'test text' },
    );
  });

  it('executes clip on win32', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    copy('test text');
    expect(execFileSyncSpy).toHaveBeenCalledWith('clip', [], {
      input: 'test text',
    });
  });

  it('does nothing on unsupported platform', () => {
    Object.defineProperty(process, 'platform', { value: 'sunos' });
    copy('test text');
    expect(execFileSyncSpy).not.toHaveBeenCalled();
  });
});
