import { SEVERITIES, SEVERITY } from '../snyk-test/common';

// Pre-computed lookup map for O(1) severity value access without repeated Array.prototype.find iterations or closure allocations
const SEVERITY_VALUE_MAP: Record<string, number> = SEVERITIES.reduce(
  (acc, s) => {
    acc[s.verboseName] = s.value;
    return acc;
  },
  { none: 0 },
);

export function getSeverityValue(severity: SEVERITY | 'none'): number {
  return SEVERITY_VALUE_MAP[severity] ?? 0;
}
