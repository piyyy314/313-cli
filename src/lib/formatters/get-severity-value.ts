import { SEVERITIES, SEVERITY } from '../snyk-test/common';

// Bolt Optimization: Pre-compute severity value map for O(1) lookup during sorting/formatting
// instead of performing an O(N) linear `SEVERITIES.find()` array search on every function call.
const SEVERITY_VALUE_MAP: Record<string, number> = SEVERITIES.reduce(
  (map, s) => {
    map[s.verboseName] = s.value;
    return map;
  },
  {} as Record<string, number>,
);

export function getSeverityValue(severity: SEVERITY | 'none'): number {
  return SEVERITY_VALUE_MAP[severity] ?? 0;
}
