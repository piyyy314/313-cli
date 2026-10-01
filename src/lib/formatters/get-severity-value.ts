import { SEVERITIES, SEVERITY } from '../snyk-test/common';

// Bolt Optimization: Pre-compute SEVERITY_VALUE_MAP lookup table at module load time
// to avoid O(K) array scans and arrow function allocations on every severity lookup.
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
