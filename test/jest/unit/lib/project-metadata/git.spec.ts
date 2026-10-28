import { getInfo } from '../../../../../src/lib/project-metadata/target-builders/git';
import * as subProcess from '../../../../../src/lib/sub-process';

jest.mock('../../../../../src/lib/sub-process');

describe('git target remote URL', () => {
  it.each([
    [
      'https://user:secret@[2001:db8::1]/repo.git',
      'http://[2001:db8::1]/repo.git',
    ],
    [
      'https://user:secret@[2001:db8::1]:8443/repo.git',
      'http://[2001:db8::1]:8443/repo.git',
    ],
    ['ssh://git@[::1]:2222/repo.git', 'http://[::1]:2222/repo.git'],
    [
      'https://user:secret@example.com:8443/repo.git',
      'http://example.com:8443/repo.git',
    ],
    [
      'http://user:secret@127.0.0.1:8080/repo.git',
      'http://127.0.0.1:8080/repo.git',
    ],
    ['git@example.com:repo.git', 'http://example.com/repo.git'],
  ])(
    'preserves the host and port of %s without userinfo',
    async (origin, remoteUrl) => {
      jest
        .mocked(subProcess.execute)
        .mockResolvedValueOnce(origin)
        .mockResolvedValueOnce('main');

      await expect(getInfo({ isFromContainer: false })).resolves.toEqual({
        remoteUrl,
        branch: 'main',
      });
    },
  );
});
