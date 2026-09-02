import { color } from '../../../lib/theme';
import { TestOptions, Options } from '../../../lib/types';
import { FAIL_ON, FailOn, SEVERITIES } from '../../../lib/snyk-test/common';
import { FailOnError } from '../../../lib/errors/fail-on-error.ts';

// Pre-computed Sets for O(1) validation lookups without runtime array allocations
const VALID_SEVERITY_THRESHOLDS = new Set<string>(
  SEVERITIES.map((s) => s.verboseName as string),
);
const VALID_FAIL_ON_VALUES = new Set<string>(Object.keys(FAIL_ON));

export function validateTestOptions(options: TestOptions & Options) {
  if (
    options.severityThreshold &&
    !validateSeverityThreshold(options.severityThreshold)
  ) {
    throw new Error('INVALID_SEVERITY_THRESHOLD');
  }

  if (options.failOn && !validateFailOn(options.failOn)) {
    const error = new FailOnError();
    throw color.status.error(error.message);
  }
}

function validateSeverityThreshold(severityThreshold) {
  return VALID_SEVERITY_THRESHOLDS.has(severityThreshold);
}

function validateFailOn(arg: FailOn) {
  return VALID_FAIL_ON_VALUES.has(arg);
}
