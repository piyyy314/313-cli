import { ciEnvs, isCI } from '../../../../src/lib/is-ci';

describe('isCI', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear all CI env vars before each test
    for (const envVar of ciEnvs) {
      delete process.env[envVar];
    }
  });

  afterEach(() => {
    // Restore original env vars
    for (const envVar of ciEnvs) {
      if (originalEnv[envVar] !== undefined) {
        process.env[envVar] = originalEnv[envVar];
      } else {
        delete process.env[envVar];
      }
    }
  });

  it('should return false when no CI environment variables are present', () => {
    expect(isCI()).toBe(false);
  });

  it('should return true when a CI environment variable is present', () => {
    process.env.CI = 'true';
    expect(isCI()).toBe(true);
  });

  it('should return true when GITHUB_ACTIONS is set', () => {
    process.env.GITHUB_ACTIONS = 'true';
    expect(isCI()).toBe(true);
  });

  it('should return true when SNYK_CI is set to empty string', () => {
    process.env.SNYK_CI = '';
    expect(isCI()).toBe(true);
  });
});
