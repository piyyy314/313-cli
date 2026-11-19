import { validateTestOptions } from '../../../src/cli/commands/test/validate-test-options';
import { Options, TestOptions } from '../../../src/lib/types';
import { SEVERITIES, FAIL_ON } from '../../../src/lib/snyk-test/common';

describe('validateTestOptions', () => {
  it('does not throw when options are empty', () => {
    const options = {} as TestOptions & Options;
    expect(() => validateTestOptions(options)).not.toThrow();
  });

  describe('severityThreshold', () => {
    it.each(SEVERITIES.map((s) => s.verboseName))(
      'accepts valid severity threshold: %s',
      (severity) => {
        const options = {
          severityThreshold: severity,
        } as unknown as TestOptions & Options;
        expect(() => validateTestOptions(options)).not.toThrow();
      },
    );

    it('throws INVALID_SEVERITY_THRESHOLD for invalid severity threshold', () => {
      const options = {
        severityThreshold: 'invalid-severity',
      } as unknown as TestOptions & Options;
      expect(() => validateTestOptions(options)).toThrow(
        'INVALID_SEVERITY_THRESHOLD',
      );
    });
  });

  describe('failOn', () => {
    it.each(Object.keys(FAIL_ON))(
      'accepts valid failOn value: %s',
      (failOn) => {
        const options = {
          failOn: failOn as any,
        } as unknown as TestOptions & Options;
        expect(() => validateTestOptions(options)).not.toThrow();
      },
    );

    it('throws FailOnError message for invalid failOn value', () => {
      const options = {
        failOn: 'invalid-fail-on',
      } as unknown as TestOptions & Options;
      expect(() => validateTestOptions(options)).toThrow(
        /Invalid fail on argument/,
      );
    });
  });
});
