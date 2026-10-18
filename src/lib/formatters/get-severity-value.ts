import { SEVERITIES, SEVERITY } from '../snyk-test/common';

// Bolt Optimization: Pre-compute severity rank map to allow O(1) constant-time lookup
// instead of performing O(N) `SEVERITIES.find()` array traversals on every call (e.g. during issue sorting).
const SEVERITY_VALUE_MAP: Record<string, number> = SEVERITIES.reduce(
  (acc, curr) => {
    acc[curr.verboseName] = curr.value;
    return acc;
  },
  {} as Record<string, number>,
);

export function getSeverityValue(severity: SEVERITY | 'none'): number {
  return SEVERITY_VALUE_MAP[severity];
}
