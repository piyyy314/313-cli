import { validateTestOptions } from '../../../../src/cli/commands/test/validate-test-options';

describe('validateTestOptions', () => {
  it('does not throw when options are empty', () => {
    expect(() => validateTestOptions({} as any)).not.toThrow();
  });

  describe('severityThreshold', () => {
    it('accepts valid severity thresholds', () => {
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

    it('throws error for invalid severity threshold', () => {
      expect(() =>
        validateTestOptions({ severityThreshold: 'invalid-threshold' } as any),
      ).toThrow('INVALID_SEVERITY_THRESHOLD');
    });
  });

  describe('failOn', () => {
    it('accepts valid failOn options', () => {
      expect(() => validateTestOptions({ failOn: 'all' } as any)).not.toThrow();
      expect(() =>
        validateTestOptions({ failOn: 'upgradable' } as any),
      ).not.toThrow();
      expect(() =>
        validateTestOptions({ failOn: 'patchable' } as any),
      ).not.toThrow();
    });

    it('throws error for invalid failOn option', () => {
      expect(() =>
        validateTestOptions({ failOn: 'invalid-fail-on' } as any),
      ).toThrow();
    });
  });
});
