import { validateTestOptions } from '../../../../../../src/cli/commands/test/validate-test-options';

describe('validateTestOptions', () => {
  it('should pass with empty options', () => {
    expect(() => validateTestOptions({} as any)).not.toThrow();
  });

  it('should pass with valid severityThresholds', () => {
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    for (const severityThreshold of validSeverities) {
      expect(() =>
        validateTestOptions({ severityThreshold } as any),
      ).not.toThrow();
    }
  });

  it('should throw Error for invalid severityThreshold', () => {
    expect(() =>
      validateTestOptions({ severityThreshold: 'invalid-severity' } as any),
    ).toThrow('INVALID_SEVERITY_THRESHOLD');
  });

  it('should pass with valid failOn options', () => {
    const validFailOn = ['all', 'upgradable', 'patchable'];
    for (const failOn of validFailOn) {
      expect(() => validateTestOptions({ failOn } as any)).not.toThrow();
    }
  });

  it('should throw error for invalid failOn option', () => {
    expect(() =>
      validateTestOptions({ failOn: 'invalid-fail-on' } as any),
    ).toThrow();
  });
});
