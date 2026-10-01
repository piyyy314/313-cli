import { SEVERITIES, SEVERITY } from '../snyk-test/common';

// Pre-compute severity lookup map to convert O(N) array scans into O(1) property lookups.
const SEVERITY_VALUE_MAP: Record<string, number> = SEVERITIES.reduce(
  (acc, { verboseName, value }) => {
    acc[verboseName] = value;
    return acc;
  },
  {} as Record<string, number>,
);

export function getSeverityValue(severity: SEVERITY | 'none'): number {
  return SEVERITY_VALUE_MAP[severity];
}
