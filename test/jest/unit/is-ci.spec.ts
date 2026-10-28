import { isCI } from '../../../src/lib/is-ci';

describe('isCI', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear all CI-related env vars for a clean state
    for (const key of Object.keys(process.env)) {
      if (
        key === 'CI' ||
        key === 'CIRCLECI' ||
        key === 'GITHUB_ACTIONS' ||
        key === 'TRAVIS'
      ) {
        delete process.env[key];
      }
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns false when no CI environment variables are present', () => {
    expect(isCI()).toBe(false);
  });

  it('returns true when GITHUB_ACTIONS is present', () => {
    process.env.GITHUB_ACTIONS = 'true';
    expect(isCI()).toBe(true);
  });

  it('returns true when CI is present', () => {
    process.env.CI = 'true';
    expect(isCI()).toBe(true);
  });
});
