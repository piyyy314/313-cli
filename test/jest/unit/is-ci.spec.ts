import { ciEnvs, isCI } from '../../../src/lib/is-ci';

describe('isCI', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear all CI-related env vars for a clean state
    for (const key of ciEnvs) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
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

  it.each(['production', 'development', undefined])(
    'reflects CI being added and removed with NODE_ENV=%s',
    (nodeEnv) => {
      if (nodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = nodeEnv;
      }

      expect(isCI()).toBe(false);
      process.env.CI = 'true';
      expect(isCI()).toBe(true);
      delete process.env.CI;
      expect(isCI()).toBe(false);
    },
  );

  it.each(['BUILD_ID', 'GITLAB_CI'])('recognizes %s', (key) => {
    process.env[key] = '';
    expect(isCI()).toBe(true);
  });
});
