import { validateTestOptions } from '../../../../src/cli/commands/test/validate-test-options';

describe('validateTestOptions', () => {
  it('should accept valid severity thresholds', () => {
    expect(() =>
      validateTestOptions({ severityThreshold: 'low' } as any),
    ).not.toThrow();
    expect(() =>
      validateTestOptions({ severityThreshold: 'medium' } as any),
    ).not.toThrow();
    expect(() =>
      validateTestOptions({ severityThreshold: 'high' } as any),
    ).not.toThrow();
    expect(() =>
      validateTestOptions({ severityThreshold: 'critical' } as any),
    ).not.toThrow();
  });

  it('should throw error for invalid severity threshold', () => {
    expect(() =>
      validateTestOptions({ severityThreshold: 'invalid' } as any),
    ).toThrow('INVALID_SEVERITY_THRESHOLD');
  });

  it('should accept valid failOn values', () => {
    expect(() => validateTestOptions({ failOn: 'all' } as any)).not.toThrow();
    expect(() =>
      validateTestOptions({ failOn: 'upgradable' } as any),
    ).not.toThrow();
    expect(() =>
      validateTestOptions({ failOn: 'patchable' } as any),
    ).not.toThrow();
  });

  it('should throw error for invalid failOn value', () => {
    expect(() => validateTestOptions({ failOn: 'invalid' } as any)).toThrow();
  });
});
