import { SEVERITIES, SEVERITY } from '../snyk-test/common';

// Cache severity numeric values in an O(1) lookup map to avoid
// repeated array linear scans (Array.find) during issue sorting and formatting.
const severityMap: Record<string, number> = SEVERITIES.reduce(
  (acc, s) => {
    acc[s.verboseName] = s.value;
    return acc;
  },
  {} as Record<string, number>,
);

export function getSeverityValue(severity: SEVERITY | 'none'): number {
  return severityMap[severity] ?? 0;
}
