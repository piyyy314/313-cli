import { color } from '../../../lib/theme';
import { TestOptions, Options } from '../../../lib/types';
import { FAIL_ON, FailOn, SEVERITIES } from '../../../lib/snyk-test/common';
import { FailOnError } from '../../../lib/errors/fail-on-error.ts';

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

// Bolt Optimization: Pre-compute valid severity thresholds and fail-on keys in module-level Sets
// to allow O(1) lookups and eliminate temporary array allocations (SEVERITIES.map and Object.keys) on every validation call.
const VALID_SEVERITY_THRESHOLDS = new Set(SEVERITIES.map((s) => s.verboseName));
const VALID_FAIL_ON_VALUES = new Set(Object.keys(FAIL_ON));

function validateSeverityThreshold(severityThreshold) {
  return VALID_SEVERITY_THRESHOLDS.has(severityThreshold);
}

function validateFailOn(arg: FailOn) {
  return VALID_FAIL_ON_VALUES.has(arg);
}
